import { useEffect, useState } from "react";
import { Menu, X, LogOut, Plus, User } from "lucide-react";
import { getWishlistItems, WISHLIST_COUNT_EVENT } from "../../api/wishlist.api";
import { Button } from "./Button";
import { NotificationBell } from "../NotificationBell";

interface NavbarProps {
  currentPage: string; // pathname like "/items"
  onNavigate: (path: string) => void; // route paths
  userRole?: "user" | "admin";
  onLogout: () => void;
}

export function Navbar({
  currentPage,
  onNavigate,
  userRole,
  onLogout,
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const navItems = [
    { name: "Browse Items", value: "/items" },
    { name: "Wishlist", value: "/wishlist" },
    { name: "Incoming Requests", value: "/swaps/incoming" },
    { name: "My Requests", value: "/swaps/outgoing" },
    { name: "History", value: "/swaps/history" },
  ];

  if (userRole === "admin") {
    navItems.push({ name: "Admin Dashboard", value: "/admin" });
  }

  const isActive = (path: string) =>
    currentPage === path || currentPage.startsWith(path + "/");

  useEffect(() => {
    let isMounted = true;

    const loadWishlistCount = async () => {
      try {
        const items = await getWishlistItems();
        if (!isMounted) return;
        setWishlistCount(Array.isArray(items) ? items.length : 0);
      } catch {
        if (!isMounted) return;
        setWishlistCount(0);
      }
    };

    void loadWishlistCount();

    return () => {
      isMounted = false;
    };
  }, [currentPage]);

  useEffect(() => {
    const onWishlistCountChanged = (event: Event) => {
      const customEvent = event as CustomEvent<number>;
      if (typeof customEvent.detail === "number") {
        setWishlistCount(customEvent.detail);
      }
    };

    window.addEventListener(
      WISHLIST_COUNT_EVENT,
      onWishlistCountChanged as EventListener,
    );
    return () => {
      window.removeEventListener(
        WISHLIST_COUNT_EVENT,
        onWishlistCountChanged as EventListener,
      );
    };
  }, []);

  return (
    <nav className="border-b border-neutral-200 bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Left */}
          <div className="flex">
            <div
              className="flex flex-shrink-0 items-center cursor-pointer"
              onClick={() => onNavigate("/items")}
            >
              <img src="/logo.png" alt="ReWear" className="h-9 w-auto" />
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => onNavigate(item.value)}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                    isActive(item.value)
                      ? "border-brand-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  }`}
                >
                  {item.name}
                  {item.value === "/wishlist" && wishlistCount > 0 && (
                    <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right (Desktop) */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center gap-2">
            {/* 🔔 Notifications */}
            <NotificationBell />

            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate("/items/new")}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Item
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate("/profile")}
            >
              <User className="mr-1.5 h-4 w-4" />
              Profile
            </Button>

            <Button variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>

          {/* Mobile toggle */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden bg-white border-b border-neutral-200">
          <div className="space-y-1 pb-3 pt-2">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onNavigate(item.value);
                  setIsOpen(false);
                }}
                className={`block w-full text-left border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                  isActive(item.value)
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                {item.name}
                {item.value === "/wishlist" && wishlistCount > 0 && (
                  <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-brand-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
            ))}

            {/* ✅ Profile (Mobile) */}
            <button
              onClick={() => {
                onNavigate("/profile");
                setIsOpen(false);
              }}
              className={`block w-full text-left border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                isActive("/profile")
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              Profile
            </button>

            <div className="px-3 pt-2 pb-1">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => {
                  onNavigate("/items/new");
                  setIsOpen(false);
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="block w-full text-left border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
