import api from "./axios";

export type NotificationApi = {
  _id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

export type NotificationUi = {
  id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
};

export function mapNotificationApiToUi(n: NotificationApi): NotificationUi {
  return {
    id: n._id,
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
    isRead: n.isRead,
    createdAt: n.createdAt,
  };
}

export async function getMyNotifications(): Promise<NotificationUi[]> {
  const res = await api.get("/notifications");
  const list: NotificationApi[] = res.data?.data ?? [];
  return list.map(mapNotificationApiToUi);
}

export async function getUnreadCount(): Promise<number> {
  const res = await api.get("/notifications/unread-count");
  return res.data?.count ?? 0;
}

export async function markNotificationRead(id: string) {
  const res = await api.put(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsRead() {
  const res = await api.put(`/notifications/read-all`);
  return res.data;
}
