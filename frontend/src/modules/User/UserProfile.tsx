import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  listMyConversations,
  InboxConversation,
  markConversationRead,
} from "../../api/chat.api";
import { updateMe, deleteMe } from "../../api/auth.api";
import {
  getMyNotifications,
  NotificationUi,
  markNotificationRead,
} from "../../api/notification.api";
import { MyItemsSection } from "./MyItemsSection";
import { AlertCircle, X } from "lucide-react";

type UserRole = "user" | "admin";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
};

export function UserProfilePage({ user }: Readonly<{ user: CurrentUser | null }>) {
  const navigate = useNavigate();

  const [localUser, setLocalUser] = useState<CurrentUser | null>(user);
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [adminAlerts, setAdminAlerts] = useState<NotificationUi[]>([]);
  const [conversationQuery, setConversationQuery] = useState("");

  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => setLocalUser(user), [user]);

  const displayInitials =
    localUser?.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U";

  const totalUnread = useMemo(
    () => conversations.reduce((acc, conversation) => acc + (conversation.unreadCount || 0), 0),
    [conversations]
  );

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const unreadDiff = (b.unreadCount || 0) - (a.unreadCount || 0);
      if (unreadDiff !== 0) return unreadDiff;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    const term = conversationQuery.trim().toLowerCase();
    if (!term) return sortedConversations;

    return sortedConversations.filter((conversation) => {
      const otherName = conversation.otherUser?.name?.toLowerCase() || "";
      const title = conversation.itemTitle?.toLowerCase() || "";
      const lastMessage = conversation.lastMessage?.toLowerCase() || "";
      return otherName.includes(term) || title.includes(term) || lastMessage.includes(term);
    });
  }, [sortedConversations, conversationQuery]);

  useEffect(() => {
    const load = async () => {
      try {
        setChatError(null);
        setLoadingChats(true);

        const res = await listMyConversations();
        const unique = new Map<string, InboxConversation>();
        (res.data || []).forEach((conversation) => unique.set(conversation.id, conversation));
        setConversations(Array.from(unique.values()));
      } catch (err: any) {
        setChatError(err?.response?.data?.message || "Failed to load conversations");
      } finally {
        setLoadingChats(false);
      }
    };

    const loadAlerts = async () => {
      try {
        const notifications = await getMyNotifications();
        setAdminAlerts(
          notifications.filter(
            (notification) =>
              (notification.type === "ITEM_REMOVED" || notification.type === "ITEM_BLOCKED") &&
              !notification.isRead
          )
        );
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };

    if (user) {
      load();
      loadAlerts();
    }
  }, [user]);

  const dismissAlert = async (id: string) => {
    try {
      await markNotificationRead(id);
      setAdminAlerts((prev) => prev.filter((notification) => notification.id !== id));
    } catch (err) {
      console.error("Failed to dismiss alert:", err);
    }
  };

  const handleOpenChat = async (conversation: InboxConversation) => {
    const ownerId = conversation.otherUser?.id;
    if (!ownerId) return;

    try {
      await markConversationRead(conversation.id);
    } catch {}

    setConversations((prev) =>
      prev.map((item) => (item.id === conversation.id ? { ...item, unreadCount: 0 } : item))
    );

    navigate(`/chat/${conversation.itemId}/${ownerId}`);
  };

  const openUpdateModal = () => {
    setSaveError(null);
    setSaveSuccess(null);
    setFullName(localUser?.name || "");
    setNewPassword("");
    setConfirmPassword("");
    setIsUpdateOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateOpen(false);
    setSaveError(null);
    setSaveSuccess(null);
  };

  const handleSaveUpdate = async () => {
    setSaveError(null);
    setSaveSuccess(null);

    const nameTrim = fullName.trim();
    const pwTrim = newPassword.trim();
    const cpwTrim = confirmPassword.trim();

    const payload: {
      name?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (nameTrim && nameTrim !== (localUser?.name || "")) {
      payload.name = nameTrim;
    }

    const wantsPwChange = pwTrim.length > 0 || cpwTrim.length > 0;
    if (wantsPwChange) {
      if (!pwTrim || !cpwTrim) {
        setSaveError("To change password, fill BOTH New Password and Confirm Password.");
        return;
      }

      if (pwTrim !== cpwTrim) {
        setSaveError("Passwords do not match.");
        return;
      }

      if (pwTrim.length < 6) {
        setSaveError("Password must be at least 6 characters.");
        return;
      }

      payload.newPassword = pwTrim;
      payload.confirmPassword = cpwTrim;
    }

    if (Object.keys(payload).length === 0) {
      setSaveError("Nothing to update. Change name or enter a new password.");
      return;
    }

    try {
      setSaving(true);
      const res = await updateMe(payload);

      setLocalUser((prev) =>
        prev
          ? {
              ...prev,
              name: res.user?.name ?? prev.name,
            }
          : prev
      );

      setSaveSuccess(res.message || "Profile updated.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setSaveError(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = () => {
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;
    setIsDeleteOpen(false);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    try {
      setDeleteError(null);
      setDeleting(true);
      await deleteMe();
      localStorage.removeItem("token");
      navigate("/register", { replace: true });
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  };

  if (!localUser) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_top,_rgba(66,145,114,0.12),_transparent_42%),linear-gradient(180deg,_#f7fbf8_0%,_#ffffff_42%,_#f5f8f6_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-white/75 bg-white/90 p-6 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.32)] backdrop-blur-xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">Profile</h2>
            <p className="mt-2 text-sm text-gray-600">Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[radial-gradient(circle_at_top,_rgba(66,145,114,0.12),_transparent_42%),linear-gradient(180deg,_#f7fbf8_0%,_#ffffff_42%,_#f5f8f6_100%)]">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {adminAlerts.length > 0 &&
          adminAlerts.map((alert) => (
            <div
              key={alert.id}
              className="relative flex items-start gap-3 rounded-[28px] border border-rose-200 bg-rose-50/90 p-4 shadow-[0_18px_44px_-30px_rgba(190,18,60,0.35)] backdrop-blur-sm"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-rose-900">{alert.title}</h3>
                <p className="mt-1 text-sm text-rose-700">{alert.message}</p>
              </div>
              <button
                type="button"
                onClick={() => dismissAlert(alert.id)}
                className="shrink-0 rounded-full bg-rose-100 p-1.5 text-rose-400 transition-colors hover:bg-rose-200 hover:text-rose-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

        <div className="space-y-6">
          <section className="overflow-hidden rounded-[32px] border border-white/75 bg-white/80 shadow-[0_28px_90px_-48px_rgba(15,23,42,0.42)] backdrop-blur-xl">
            <div className="border-b border-neutral-200/70 px-6 py-6 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4 sm:gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#285d47] via-[#429172] to-[#b9e8d2] text-lg font-extrabold text-white shadow-[0_20px_42px_-20px_rgba(40,93,71,0.65)] ring-1 ring-white/40">
                    {displayInitials}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${
                          localUser.role === "admin"
                            ? "border-brand-200 bg-brand-50 text-brand-700"
                            : "border-neutral-200 bg-neutral-50 text-neutral-700"
                        }`}
                      >
                        {localUser.role.toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${
                          localUser.isEmailVerified
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {localUser.isEmailVerified ? "Verified email" : "Email pending"}
                      </span>
                    </div>

                    <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                      {localUser.name}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 sm:text-base">
                      View your profile details, messages, and posted items.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="rounded-[28px] border border-neutral-200/70 bg-white/90 p-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.22)] backdrop-blur-sm lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.28)]">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    Name
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-neutral-900">{localUser.name}</dd>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.28)]">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    Email
                  </dt>
                  <dd className="mt-2 text-sm font-semibold text-neutral-900 break-all">{localUser.email}</dd>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.28)]">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    Verification
                  </dt>
                  <dd className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                    localUser.isEmailVerified
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {localUser.isEmailVerified ? "Verified" : "Not verified"}
                  </dd>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white p-4 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.28)]">
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                    User ID
                  </dt>
                  <dd className="mt-2 font-mono text-sm font-semibold text-neutral-700 break-all">
                    {localUser.id}
                  </dd>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-neutral-200/70 bg-white/90 p-4 shadow-[0_18px_50px_-34px_rgba(15,42,42,0.22)] backdrop-blur-sm">
              <div className="flex h-full flex-col justify-center gap-3">
                <Button variant="primary" size="md" className="w-full" onClick={openUpdateModal}>
                  Update User
                </Button>

                <Button
                  variant="ghost"
                  size="md"
                  className="w-full border border-red-200 text-red-700 hover:bg-red-50"
                  onClick={openDeleteModal}
                >
                  Delete User
                </Button>
              </div>
            </div>

            <div className="rounded-[28px] border border-neutral-200/70 bg-gradient-to-b from-white/95 to-neutral-50/85 p-6 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.22)] backdrop-blur-sm lg:col-span-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-extrabold text-neutral-900">Messages</h2>
                    {totalUnread > 0 && (
                      <span className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                        {totalUnread} unread
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-neutral-600">Continue conversations from here.</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-neutral-500">
                  Showing {filteredConversations.length} of {conversations.length} conversations
                </p>
                <input
                  type="text"
                  value={conversationQuery}
                  onChange={(event) => setConversationQuery(event.target.value)}
                  placeholder="Search by user, item, or message"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-800 shadow-sm outline-none transition focus:border-[#429172] focus:ring-2 focus:ring-[#429172]/20 sm:w-[320px]"
                />
              </div>

              {chatError && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-700 shadow-[0_10px_30px_-24px_rgba(190,18,60,0.35)]">
                  {chatError}
                </div>
              )}

              {loadingChats ? (
                <div className="py-16 text-center text-neutral-500">Loading conversations...</div>
              ) : (
                <div className="mt-5 rounded-2xl border border-neutral-200/80 bg-white/70 p-2">
                  <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1 [scrollbar-color:#429172_#e5e7eb] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-neutral-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#429172] [&::-webkit-scrollbar-thumb:hover]:bg-[#2f6e54]">
                  {filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => handleOpenChat(conversation)}
                      className="group w-full rounded-2xl border border-neutral-200/80 bg-white px-4 py-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:bg-brand-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#429172] focus-visible:ring-offset-2"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex gap-3">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
                            {conversation.itemImage ? (
                              <img
                                src={conversation.itemImage}
                                alt={conversation.itemTitle}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-sm font-semibold text-neutral-900">
                                {conversation.otherUser?.name || "User"} • {conversation.itemTitle}
                              </h3>
                              {conversation.unreadCount > 0 && (
                                <span className="inline-flex items-center rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>

                            <p className="mt-1 truncate text-sm text-neutral-600">
                              {conversation.lastMessage || "No messages yet"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-xs text-neutral-500">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                  ))}

                  {filteredConversations.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-10 text-center">
                      <div className="text-sm font-medium text-neutral-900">
                        {conversations.length === 0 ? "No conversations" : "No matching conversations"}
                      </div>
                      <div className="mt-1 text-sm text-neutral-600">
                        {conversations.length === 0
                          ? "Start chatting from an item page."
                          : "Try a different search term."}
                      </div>
                    </div>
                  )}
                  </div>
                </div>
              )}

              <div className="mt-4 text-xs text-neutral-500">
                Unread counts update when you open a chat (we mark it as read).
              </div>
            </div>
          </div>

          <MyItemsSection />
        </div>
      </div>

      {isUpdateOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <button
            type="button"
            aria-label="Close update profile dialog"
            className="absolute inset-0 bg-black/30"
            onClick={closeUpdateModal}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-brand-100 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Update Profile</h3>
                <p className="mt-1 text-sm text-gray-600">
                  Leave a field blank to keep it unchanged.<br />
                  To change password, fill BOTH fields.
                </p>
              </div>

              <button
                type="button"
                onClick={closeUpdateModal}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
                disabled={saving}
              >
                Close
              </button>
            </div>

            {saveError && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="mt-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                {saveSuccess}
              </div>
            )}

            <div className="mt-5 space-y-4">
              <Input
                id="fullName"
                type="text"
                label="Full Name"
                placeholder="Enter new full name (optional)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />

              <div className="pt-2">
                <div className="text-sm font-extrabold text-gray-900">Change Password</div>
                <div className="mt-1 text-xs text-gray-500">To change password, fill both fields.</div>
              </div>

              <Input
                id="newPassword"
                type="password"
                label="New Password"
                placeholder="Enter new password (optional)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              <Input
                id="confirmPassword"
                type="password"
                label="Confirm Password"
                placeholder="Confirm new password (optional)"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={closeUpdateModal} disabled={saving}>
                Cancel
              </Button>

              <Button variant="primary" onClick={handleSaveUpdate} isLoading={saving}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {isDeleteOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/30"
            onClick={closeDeleteModal}
          />

          <div className="relative w-full max-w-lg rounded-2xl border border-brand-100 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Delete account?</h3>
                <p className="mt-2 text-sm text-gray-600">
                  If you delete your account, <b>all your data will be removed</b>:
                  <br />• Items you posted
                  <br />• Chats and messages
                  <br />• Reviews & ratings
                  <br />• Swap requests/history (if any)
                  <br />
                  <span className="font-semibold text-red-700">This action cannot be undone.</span>
                </p>
              </div>

              <button
                type="button"
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Close
              </button>
            </div>

            {deleteError && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={closeDeleteModal} disabled={deleting}>
                Cancel
              </Button>

              <Button
                variant="ghost"
                className="border border-red-200 text-red-700 hover:bg-red-50"
                onClick={confirmDelete}
                isLoading={deleting}
              >
                Yes, delete everything
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}