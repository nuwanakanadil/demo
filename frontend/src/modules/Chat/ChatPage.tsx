import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ArrowLeft, Send } from "lucide-react";
import {
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markConversationRead,
  Message,
} from "../../api/chat.api";
import { getMe } from "../../api/auth.api";

/* --------------------------------------------------
   SOCKET SERVER URL
   - Reads from VITE_API_BASE_URL if available
   - Removes "/api" because socket server runs on same backend base
   - Fallback to localhost for development
-------------------------------------------------- */
const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
  : "http://localhost:5000";

/* --------------------------------------------------
   UI MESSAGE TYPE
   - Extends backend Message type
   - Adds "pending" flag for optimistic UI while sending
-------------------------------------------------- */
type UiMessage = Message & { pending?: boolean };

export function ChatPage() {
  /* --------------------------------------------------
     ROUTE PARAMS
     - itemId: item that chat belongs to
     - ownerId: user id of item owner (other user in conversation)
  -------------------------------------------------- */
  const { itemId, ownerId } = useParams();
  const navigate = useNavigate();

  /* --------------------------------------------------
     CURRENT USER
     - myUserId is needed to:
       • align my messages to right
       • align other messages to left
       • mark unread correctly
  -------------------------------------------------- */
  const [myUserId, setMyUserId] = useState<string | null>(null);

  /* --------------------------------------------------
     CHAT STATE
     - conversationId: backend conversation id (created/fetched)
     - messages: list of all messages in the conversation
     - text: input text box value
     - loading: show loading state while fetching conversation/messages
  -------------------------------------------------- */
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  /* --------------------------------------------------
     REFS
     - socketRef: keeps the socket instance stable without re-render
     - bottomRef: used to auto-scroll to bottom when new messages arrive
  -------------------------------------------------- */
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  /* --------------------------------------------------
     STRICT MODE PROTECTION
     - React StrictMode runs effects twice in dev
     - startedRef prevents double socket initialization
  -------------------------------------------------- */
  const startedRef = useRef(false);

  /* --------------------------------------------------
     AUTO SCROLL TO BOTTOM
     - Whenever messages update, scroll to last element smoothly
  -------------------------------------------------- */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* --------------------------------------------------
     LOAD CURRENT USER (getMe)
     - Needed to know myUserId for bubble alignment
     - If token invalid/expired:
       • remove token
       • redirect to login
  -------------------------------------------------- */
  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await getMe();
        setMyUserId(res.user.id);
      } catch {
        // if token invalid, kick out
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }
    };
    loadMe();
  }, [navigate]);

  /* --------------------------------------------------
     UPSERT MESSAGE INTO UI
     - Prevent duplicates when receiving socket events
     - Replace temporary (pending) message with real saved message
       using clientMessageId matching
  -------------------------------------------------- */
  const upsertMessage = (incoming: UiMessage) => {
    setMessages((prev) => {
      // If real message _id already exists in UI, skip (prevents duplicates)
      if (incoming._id && prev.some((m) => m._id === incoming._id)) return prev;

      // If message has clientMessageId, try to match & replace temp message
      if (incoming.clientMessageId) {
        const hasTemp = prev.some(
          (m) => m.clientMessageId === incoming.clientMessageId
        );
        if (hasTemp) {
          return prev.map((m) =>
            m.clientMessageId === incoming.clientMessageId
              ? { ...incoming, pending: false }
              : m
          );
        }
      }

      // Otherwise, append new incoming message
      return [...prev, incoming];
    });
  };

  /* --------------------------------------------------
     START CHAT SESSION
     - Runs only after myUserId is known (prevents wrong alignment)
     - Steps:
       1) Validate itemId/ownerId
       2) Create or fetch conversation
       3) Load message history
       4) Mark conversation as read
       5) Connect socket
       6) Join conversation room
       7) Listen for new messages
       8) On message from other user -> mark as read
  -------------------------------------------------- */
  useEffect(() => {
    const start = async () => {
      // Prevent double init (StrictMode protection)
      if (startedRef.current) return;
      startedRef.current = true;

      // If URL params missing, go back to items page
      if (!itemId || !ownerId) {
        navigate("/items");
        return;
      }

      try {
        setLoading(true);

        // ✅ Create or get conversation for this item + owner
        const convRes = await getOrCreateConversation(itemId, ownerId);
        const convId = convRes.data._id;
        setConversationId(convId);

        // ✅ Load messages history from backend
        const msgRes = await getMessages(convId);
        setMessages(msgRes.data);

        // ✅ Mark read when opening the conversation
        await markConversationRead(convId);

        // ✅ Setup socket with JWT token (backend will validate in io.use middleware)
        const token = localStorage.getItem("token");
        const socket = io(SOCKET_URL, {
          auth: { token },
          transports: ["websocket"],
        });

        socketRef.current = socket;

        // Join room after connection so server can broadcast messages to this chat room
        socket.on("connect", () => {
          socket.emit("join_conversation", { conversationId: convId });
        });

        // When server emits "message_new", update UI
        socket.on("message_new", async (payload: UiMessage) => {
          upsertMessage(payload);

          // ✅ If message is from other user and I'm currently inside this chat -> mark read
          if (myUserId && payload.senderId !== myUserId) {
            try {
              await markConversationRead(convId);
            } catch {}
          }
        });

        // Debug socket errors
        socket.on("connect_error", (err) => {
          console.error("Socket connect error:", err.message);
        });
      } finally {
        setLoading(false);
      }
    };

    // ✅ only start after myUserId is known (prevents wrong alignment)
    if (myUserId) start();

    /* --------------------------------------------------
       CLEANUP
       - Remove socket listener and disconnect when leaving page
       - Reset refs to allow re-init if user returns
    -------------------------------------------------- */
    return () => {
      socketRef.current?.off("message_new");
      socketRef.current?.disconnect();
      socketRef.current = null;
      startedRef.current = false;
    };
  }, [itemId, ownerId, navigate, myUserId]);

  /* --------------------------------------------------
     SEND MESSAGE
     - Basic validation: must have conversationId + myUserId + non-empty message
     - Optimistic UI:
       • create a temp message immediately (pending=true)
       • send to backend
       • replace temp with real message (using clientMessageId)
     - Notify other user via socket emit "send_message"
  -------------------------------------------------- */
  const handleSend = async () => {
    if (!conversationId || !myUserId) return;

    const clean = text.trim();
    if (!clean) return;

    // Clear input immediately for smooth UX
    setText("");

    // Create a unique id to match temp message with server response
    const clientMessageId = `c_${Date.now()}_${Math.random()
      .toString(16)
      .slice(2)}`;

    // Temporary UI message (shows "Sending…" until server confirms)
    const temp: UiMessage = {
      _id: `temp-${clientMessageId}`,
      conversationId,
      senderId: myUserId, // ✅ real id so it stays "mine"
      text: clean,
      createdAt: new Date().toISOString(),
      clientMessageId,
      pending: true,
    };

    // Show temp message instantly
    setMessages((prev) => [...prev, temp]);

    try {
      // Send message to backend (saved in DB)
      const res = await sendMessage(conversationId, clean, clientMessageId);

      // ✅ Replace temp with real (pending=false)
      upsertMessage(res.data);

      // Tell server to broadcast to room participants
      socketRef.current?.emit("send_message", {
        conversationId,
        messageId: res.data._id,
      });
    } catch (e) {
      console.error(e);

      // If sending failed, remove "Sending…" state (still shows message content)
      setMessages((prev) =>
        prev.map((m) =>
          m.clientMessageId === clientMessageId
            ? { ...m, pending: false }
            : m
        )
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
        {/* --------------------------------------------------
            TOP HEADER BAR
            - Back button
            - Shows itemId + ownerId for debugging / context
          -------------------------------------------------- */}
        <div className="mb-4 rounded-xl border border-brand-100 bg-white shadow-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div>
              <div className="text-sm font-semibold text-gray-900">Chat</div>
              <div className="text-xs text-gray-600">
                Item: <span className="font-mono">{itemId}</span> • Owner:{" "}
                <span className="font-mono">{ownerId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------
            CHAT CARD
            - Top: messages list
            - Bottom: input area
          -------------------------------------------------- */}
        <div className="rounded-xl border border-brand-100 bg-white shadow-lg overflow-hidden">
          {/* MESSAGES PANEL */}
          <div className="h-[60vh] sm:h-[65vh] overflow-y-auto bg-brand-50 p-4">
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                Loading chat...
              </div>
            ) : messages.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                No messages yet. Say hi 👋
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => {
                  // Determines if message is mine (align right) or other user (align left)
                  const isMine = !!myUserId && m.senderId === myUserId;

                  return (
                    <div
                      key={m._id}
                      className={`flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Message bubble */}
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm border ${
                          isMine
                            ? "bg-brand-600 border-brand-600 text-white"
                            : "bg-white border-neutral-200 text-gray-900"
                        }`}
                      >
                        <div className={isMine ? "text-white" : "text-gray-900"}>
                          {m.text}
                        </div>

                        {/* Meta row: pending + timestamp */}
                        <div
                          className={`mt-1 flex items-center justify-end gap-2 text-[11px] ${
                            isMine ? "text-white/80" : "text-gray-500"
                          }`}
                        >
                          {m.pending && (
                            <span className="opacity-80">Sending…</span>
                          )}
                          <span>
                            {new Date(m.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Scroll anchor */}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* INPUT PANEL */}
          <div className="border-t border-neutral-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <Input
                id="message"
                type="text"
                label=""
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  // Allow Enter key to send messages quickly
                  if (e.key === "Enter") handleSend();
                }}
                className="flex-1"
              />

              <Button
                variant="primary"
                onClick={handleSend}
                disabled={!text.trim() || !myUserId}
              >
                <Send className="mr-2 h-4 w-4" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}