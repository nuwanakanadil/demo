import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/Button";
import {
  getMyNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  NotificationUi,
} from "../api/notification.api";

function timeAgo(dateStr: string) {
  const d = new Date(dateStr).getTime();
  const diff = Date.now() - d;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationUi[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedNoti, setSelectedNoti] = useState<NotificationUi | null>(null);

  const ref = useRef<HTMLDivElement | null>(null);

  const unreadLocal = useMemo(
    () => items.filter((n) => !n.isRead).length,
    [items]
  );

  const refresh = async () => {
    try {
      setLoading(true);
      const [list, count] = await Promise.all([getMyNotifications(), getUnreadCount()]);
      setItems(list);
      setUnread(count);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // Stage 2: simple polling (later Stage 3 = realtime sockets)
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const handleOpen = async () => {
    setOpen((v) => !v);
    if (!open) await refresh();
  };

  const openNoti = async (n: NotificationUi) => {
    try {
      if (!n.isRead) {
        await markNotificationRead(n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
        setUnread((c) => Math.max(0, c - 1));
      }
    } catch {}
    
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    } else {
      setSelectedNoti(n);
    }
  };

  const markAll = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative inline-flex items-center justify-center rounded-lg p-2 hover:bg-gray-100"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-700" />
        {(unread > 0 || unreadLocal > 0) && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-600 text-white text-[11px] font-bold flex items-center justify-center">
            {unread || unreadLocal}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[340px] rounded-2xl border border-neutral-200 bg-white shadow-xl overflow-hidden z-[80]">
          <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
            <div>
              <div className="text-sm font-extrabold text-gray-900">Notifications</div>
              <div className="text-xs text-gray-500">
                {loading ? "Refreshing..." : `${unread || unreadLocal} unread`}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={markAll}
              disabled={(unread || unreadLocal) === 0}
              className="h-8"
            >
              <Check className="h-4 w-4 mr-2" />
              Read all
            </Button>
          </div>

          <div className="max-h-[360px] overflow-auto">
            {items.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div className="text-sm font-semibold text-gray-900">No notifications</div>
                <div className="mt-1 text-sm text-gray-600">
                  You’ll see swap updates and messages here.
                </div>
              </div>
            ) : (
              <div className="divide-y divide-neutral-200">
                {items.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => openNoti(n)}
                    className={`w-full text-left px-4 py-3 hover:bg-brand-50 transition ${
                      n.isRead ? "bg-white" : "bg-brand-50/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          n.isRead ? "bg-gray-300" : "bg-brand-600"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {n.title}
                        </div>
                        {n.message && (
                          <div className="mt-0.5 text-sm text-gray-600 line-clamp-2">
                            {n.message}
                          </div>
                        )}
                        <div className="mt-1 text-xs text-gray-500">
                          {timeAgo(n.createdAt)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-neutral-200">
            <Button variant="outline" size="sm" className="w-full" onClick={refresh}>
              Refresh
            </Button>
          </div>
        </div>
      )}

      {/* ================= NOTIFICATION DETAILS MODAL ================= */}
      {selectedNoti && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setSelectedNoti(null)}></div>
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-neutral-100 flex justify-between items-center bg-brand-50/50">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                Notification Details
              </h2>
              <button onClick={() => setSelectedNoti(null)} className="text-neutral-400 hover:text-neutral-600 transition-colors p-1 hover:bg-neutral-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-extrabold text-gray-900 mb-3">{selectedNoti.title}</h3>
              {selectedNoti.message && (
                <p className="text-sm text-gray-700 leading-relaxed bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                  {selectedNoti.message}
                </p>
              )}
              <div className="mt-4 text-xs font-medium text-gray-400">
                Received on: {new Date(selectedNoti.createdAt).toLocaleString()}
              </div>
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setSelectedNoti(null)} className="rounded-xl w-full">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
