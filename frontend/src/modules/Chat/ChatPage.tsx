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

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL.replace("/api", "")
  : "http://localhost:5000";

type UiMessage = Message & { pending?: boolean };

export function ChatPage() {
  const { itemId, ownerId } = useParams();
  const navigate = useNavigate();

  const [myUserId, setMyUserId] = useState<string | null>(null);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // ✅ prevent double init in React StrictMode
  const startedRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ load current user id (for correct bubble alignment)
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

  const upsertMessage = (incoming: UiMessage) => {
    setMessages((prev) => {
      if (incoming._id && prev.some((m) => m._id === incoming._id)) return prev;

      if (incoming.clientMessageId) {
        const hasTemp = prev.some((m) => m.clientMessageId === incoming.clientMessageId);
        if (hasTemp) {
          return prev.map((m) =>
            m.clientMessageId === incoming.clientMessageId
              ? { ...incoming, pending: false }
              : m
          );
        }
      }

      return [...prev, incoming];
    });
  };

  useEffect(() => {
    const start = async () => {
      if (startedRef.current) return;
      startedRef.current = true;

      if (!itemId || !ownerId) {
        navigate("/items");
        return;
      }

      try {
        setLoading(true);

        const convRes = await getOrCreateConversation(itemId, ownerId);
        const convId = convRes.data._id;
        setConversationId(convId);

        const msgRes = await getMessages(convId);
        setMessages(msgRes.data);

        await markConversationRead(convId);

        const token = localStorage.getItem("token");
        const socket = io(SOCKET_URL, {
          auth: { token },
          transports: ["websocket"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("join_conversation", { conversationId: convId });
        });

        socket.on("message_new", async (payload: UiMessage) => {
          upsertMessage(payload);

          // ✅ if it’s from other user and I'm in this chat → mark read
          if (myUserId && payload.senderId !== myUserId) {
            try {
              await markConversationRead(convId);
            } catch {}
          }
        });

        socket.on("connect_error", (err) => {
          console.error("Socket connect error:", err.message);
        });
      } finally {
        setLoading(false);
      }
    };

    // ✅ only start after myUserId is known (prevents wrong alignment)
    if (myUserId) start();

    return () => {
      socketRef.current?.off("message_new");
      socketRef.current?.disconnect();
      socketRef.current = null;
      startedRef.current = false;
    };
  }, [itemId, ownerId, navigate, myUserId]);

  const handleSend = async () => {
    if (!conversationId || !myUserId) return;
    const clean = text.trim();
    if (!clean) return;

    setText("");

    const clientMessageId = `c_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const temp: UiMessage = {
      _id: `temp-${clientMessageId}`,
      conversationId,
      senderId: myUserId, // ✅ real id so it stays "mine"
      text: clean,
      createdAt: new Date().toISOString(),
      clientMessageId,
      pending: true,
    };

    setMessages((prev) => [...prev, temp]);

    try {
      const res = await sendMessage(conversationId, clean, clientMessageId);

      // ✅ replace temp with real (real senderId matches myUserId now)
      upsertMessage(res.data);

      socketRef.current?.emit("send_message", {
        conversationId,
        messageId: res.data._id,
      });
    } catch (e) {
      console.error(e);
      setMessages((prev) =>
        prev.map((m) =>
          m.clientMessageId === clientMessageId ? { ...m, pending: false } : m
        )
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6">
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

        <div className="rounded-xl border border-brand-100 bg-white shadow-lg overflow-hidden">
          <div className="h-[60vh] sm:h-[65vh] overflow-y-auto bg-brand-50 p-4">
            {loading ? (
              <div className="py-16 text-center text-gray-500">Loading chat...</div>
            ) : messages.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                No messages yet. Say hi 👋
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => {
                  const isMine = !!myUserId && m.senderId === myUserId;

                  return (
                    <div
                      key={m._id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
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

                        <div
                          className={`mt-1 flex items-center justify-end gap-2 text-[11px] ${
                            isMine ? "text-white/80" : "text-gray-500"
                          }`}
                        >
                          {m.pending && <span className="opacity-80">Sending…</span>}
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
                <div ref={bottomRef} />
              </div>
            )}
          </div>

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
                  if (e.key === "Enter") handleSend();
                }}
                className="flex-1"
              />
              <Button variant="primary" onClick={handleSend} disabled={!text.trim() || !myUserId}>
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
