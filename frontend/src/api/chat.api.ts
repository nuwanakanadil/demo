import api from "./axios";

/* --------------------------------------------------
   MESSAGE TYPE
   - Represents a single chat message stored in DB
   - _id: MongoDB message ID
   - conversationId: which conversation it belongs to
   - senderId: user who sent the message
   - text: message content
   - createdAt: timestamp
   - clientMessageId: used for optimistic UI updates
-------------------------------------------------- */
export type Message = {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  clientMessageId?: string; // ✅ helps match temporary messages with real ones
};

/* --------------------------------------------------
   CONVERSATION TYPE
   - Represents a chat between two users
   - itemId: item being discussed
   - participants: array of user IDs involved
-------------------------------------------------- */
export type Conversation = {
  _id: string;
  itemId: string;
  participants: string[];
};

/* --------------------------------------------------
   CREATE OR GET CONVERSATION
   - If conversation exists → backend returns existing one
   - If not → backend creates new conversation
   - Used when clicking "Chat" button on item page
-------------------------------------------------- */
export async function getOrCreateConversation(
  itemId: string,
  ownerId: string
) {
  const res = await api.post("/chats/conversations", { itemId, ownerId });
  return res.data as { success: boolean; data: Conversation };
}

/* --------------------------------------------------
   GET MESSAGES
   - Fetches all messages for a given conversation
   - Used when opening ChatPage
-------------------------------------------------- */
export async function getMessages(conversationId: string) {
  const res = await api.get(
    `/chats/conversations/${conversationId}/messages`
  );
  return res.data as { success: boolean; data: Message[] };
}

/* --------------------------------------------------
   SEND MESSAGE
   - Sends a new message to backend
   - clientMessageId:
       • generated on frontend
       • allows replacing temporary "Sending..." message
       • prevents duplicate messages in UI
-------------------------------------------------- */
export async function sendMessage(
  conversationId: string,
  text: string,
  clientMessageId: string
) {
  const res = await api.post(
    `/chats/conversations/${conversationId}/messages`,
    {
      text,
      clientMessageId,
    }
  );
  return res.data as { success: boolean; data: Message };
}

/* --------------------------------------------------
   INBOX CONVERSATION TYPE
   - Used for inbox list (UserProfilePage)
   - Contains summarized conversation details:
       • item info
       • other user info
       • last message
       • unread count
-------------------------------------------------- */
export type InboxConversation = {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: string | null;
  otherUser: { id: string; name: string } | null;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
};

/* --------------------------------------------------
   LIST MY CONVERSATIONS
   - Returns inbox view:
       • all conversations for logged-in user
       • sorted by latest activity (backend usually handles sorting)
       • includes unread message counts
-------------------------------------------------- */
export async function listMyConversations() {
  const res = await api.get("/chats/conversations");
  return res.data as { success: boolean; data: InboxConversation[] };
}

/* --------------------------------------------------
   MARK CONVERSATION AS READ
   - Called when:
       • opening a chat
       • receiving a new message while inside chat
   - Backend should reset unreadCount for this user
-------------------------------------------------- */
export async function markConversationRead(
  conversationId: string
) {
  const res = await api.post(
    `/chats/conversations/${conversationId}/read`
  );
  return res.data as { success: boolean };
}