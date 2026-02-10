import api from "./axios";

export type Message = {
  _id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  clientMessageId?: string; // ✅ add
};

export type Conversation = {
  _id: string;
  itemId: string;
  participants: string[];
};

export async function getOrCreateConversation(itemId: string, ownerId: string) {
  const res = await api.post("/chats/conversations", { itemId, ownerId });
  return res.data as { success: boolean; data: Conversation };
}

export async function getMessages(conversationId: string) {
  const res = await api.get(`/chats/conversations/${conversationId}/messages`);
  return res.data as { success: boolean; data: Message[] };
}

// ✅ UPDATED: accept clientMessageId
export async function sendMessage(conversationId: string, text: string, clientMessageId: string) {
  const res = await api.post(`/chats/conversations/${conversationId}/messages`, {
    text,
    clientMessageId,
  });
  return res.data as { success: boolean; data: Message };
}

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

export async function listMyConversations() {
  const res = await api.get("/chats/conversations");
  return res.data as { success: boolean; data: InboxConversation[] };
}

export async function markConversationRead(conversationId: string) {
  const res = await api.post(`/chats/conversations/${conversationId}/read`);
  return res.data as { success: boolean };
}
