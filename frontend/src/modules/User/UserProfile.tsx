import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { listMyConversations, InboxConversation,markConversationRead } from "../../api/chat.api";
import { updateMe, deleteMe } from "../../api/auth.api";

type UserRole = "user" | "admin";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isEmailVerified: boolean;
};

export function UserProfilePage({ user }: { user: CurrentUser | null }) {
  const navigate = useNavigate();

  // ✅ local copy so we can update UI after saving
  const [localUser, setLocalUser] = useState<CurrentUser | null>(user);
  useEffect(() => setLocalUser(user), [user]);

  // ✅ inbox
  const [conversations, setConversations] = useState<InboxConversation[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const totalUnread = useMemo(
    () => conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0),
    [conversations]
  );

  useEffect(() => {
    const load = async () => {
      try {
        setChatError(null);
        setLoadingChats(true);

        const res = await listMyConversations();

        // ✅ Safety: prevent duplicates (same conversation can appear twice from backend bug)
        const unique = new Map<string, InboxConversation>();
        (res.data || []).forEach((c) => unique.set(c.id, c));
        setConversations(Array.from(unique.values()));
      } catch (err: any) {
        setChatError(err?.response?.data?.message || "Failed to load conversations");
      } finally {
        setLoadingChats(false);
      }
    };

    if (user) load();
  }, [user]);

  const handleOpenChat = async (c: InboxConversation) => {
  const ownerId = c.otherUser?.id;
  if (!ownerId) return;

  // ✅ mark read before navigating (so unread disappears instantly)
  try {
    await markConversationRead(c.id);
  } catch {}

  // ✅ update UI immediately
  setConversations((prev) =>
    prev.map((x) => (x.id === c.id ? { ...x, unreadCount: 0 } : x))
  );

  navigate(`/chat/${c.itemId}/${ownerId}`);
};

  /* --------------------------------------------------
     UPDATE MODAL (name + optional password)
  -------------------------------------------------- */
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

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

    const payload: { name?: string; newPassword?: string; confirmPassword?: string } = {};

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

  /* --------------------------------------------------
     DELETE MODAL (delete everything + redirect register)
  -------------------------------------------------- */
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  /* --------------------------------------------------
     LOADING USER
  -------------------------------------------------- */
  if (!localUser) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-xl border border-brand-100 bg-white shadow-lg p-6">
            <h2 className="text-xl font-extrabold text-gray-900">Profile</h2>
            <p className="mt-2 text-sm text-gray-600">Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT */}
          <div className="lg:col-span-1 space-y-4">
            <div className="rounded-xl border border-brand-100 bg-white shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-gray-900">Profile</h2>
                  <p className="mt-1 text-sm text-gray-600">Manage your account details</p>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    localUser.role === "admin"
                      ? "bg-brand-50 text-brand-700 border border-brand-100"
                      : "bg-neutral-50 text-neutral-700 border border-neutral-200"
                  }`}
                >
                  {localUser.role.toUpperCase()}
                </span>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <div className="text-xs font-medium text-gray-500">Name</div>
                  <div className="text-sm font-semibold text-gray-900">{localUser.name}</div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500">Email</div>
                  <div className="text-sm font-semibold text-gray-900">{localUser.email}</div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2">
                  <div className="text-sm text-gray-700">Email Verification</div>
                  <div
                    className={`text-sm font-semibold ${
                      localUser.isEmailVerified ? "text-brand-700" : "text-red-700"
                    }`}
                  >
                    {localUser.isEmailVerified ? "Verified" : "Not verified"}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-medium text-gray-500">User ID</div>
                  <div className="text-sm font-mono text-gray-700">{localUser.id}</div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="rounded-xl border border-brand-100 bg-white shadow-lg p-4">
              <div className="flex flex-col gap-3">
                <Button variant="primary" size="lg" className="w-full" onClick={openUpdateModal}>
                  Update User
                </Button>

                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full border border-red-200 text-red-700 hover:bg-red-50"
                  onClick={openDeleteModal}
                >
                  Delete User
                </Button>
              </div>
            </div>
          </div>

          {/* RIGHT: Inbox */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-brand-100 bg-white shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-gray-900">Messages</h2>
                    {totalUnread > 0 && (
                      <span className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 text-xs font-semibold">
                        {totalUnread} unread
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">Your real conversations</p>
                </div>

                <button
                  type="button"
                  className="text-sm font-medium text-brand-600 hover:text-brand-500"
                  onClick={() => alert("New message (later)")}
                >
                  New message
                </button>
              </div>

              {chatError && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {chatError}
                </div>
              )}

              {loadingChats ? (
                <div className="py-16 text-center text-gray-500">Loading conversations...</div>
              ) : (
                <div className="mt-6 divide-y divide-neutral-200 rounded-lg border border-neutral-200 overflow-hidden">
                  {conversations.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleOpenChat(c)}
                      className="w-full text-left px-4 py-4 hover:bg-brand-50 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex gap-3">
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200 shrink-0">
                            {c.itemImage ? (
                              <img
                                src={c.itemImage}
                                alt={c.itemTitle}
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {c.otherUser?.name || "User"} • {c.itemTitle}
                              </h3>

                              {c.unreadCount > 0 && (
                                <span className="inline-flex items-center rounded-full bg-brand-50 text-brand-700 border border-brand-100 px-2 py-0.5 text-xs font-medium">
                                  {c.unreadCount}
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-sm text-gray-600 truncate">
                              {c.lastMessage || "No messages yet"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-xs text-gray-500">
                          {new Date(c.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </button>
                  ))}

                  {conversations.length === 0 && (
                    <div className="px-4 py-10 text-center">
                      <div className="text-sm font-medium text-gray-900">No conversations</div>
                      <div className="mt-1 text-sm text-gray-600">
                        Start chatting from an item page.
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 text-xs text-gray-500">
                Unread counts update when you open a chat (we mark it as read).
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ UPDATE MODAL */}
      {isUpdateOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeUpdateModal} />

          <div className="relative w-full max-w-lg rounded-2xl border border-brand-100 bg-white shadow-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">Update Profile</h3>
                <p className="mt-1 text-sm text-gray-600">
                  • Leave a field blank to keep it unchanged.<br />
                  • To change password, fill BOTH fields.
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
                <div className="mt-1 text-xs text-gray-500">
                  To change password, fill both fields.
                </div>
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

            <div className="mt-6 flex gap-3 justify-end">
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

      {/* ✅ DELETE MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/30" onClick={closeDeleteModal} />

          <div className="relative w-full max-w-lg rounded-2xl border border-brand-100 bg-white shadow-2xl p-6">
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
                  <span className="text-red-700 font-semibold">This action cannot be undone.</span>
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

            <div className="mt-6 flex gap-3 justify-end">
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
