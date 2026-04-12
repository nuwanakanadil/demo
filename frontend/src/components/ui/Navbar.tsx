import { useEffect, useState } from "react";
import { Menu, X, LogOut, Plus, User } from "lucide-react";
import { getWishlistItems, WISHLIST_COUNT_EVENT } from "../../api/wishlist.api";
import { Button } from "./Button";
import { NotificationBell } from "../NotificationBell";

interface NavbarProps {
  currentPage: string; // pathname like "/items"
  onNavigate: (path: string) => void; // route paths
  onNavigateIntent?: (path: string) => void;
  userRole?: "user" | "admin";
  onLogout: () => void;
}

export function Navbar({
  currentPage,
  onNavigate,
  onNavigateIntent,
  userRole,
  onLogout,
}: Readonly<NavbarProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);

  const navItems = userRole === "admin" 
    ? [{ name: "Admin Dashboard", value: "/admin" }]
    : [
        { name: "Browse Items", value: "/items" },
        { name: "Wishlist", value: "/wishlist" },
        { name: "Incoming Requests", value: "/swaps/incoming" },
        { name: "My Requests", value: "/swaps/outgoing" },
        { name: "History", value: "/swaps/history" },
      ];

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

    globalThis.addEventListener(
      WISHLIST_COUNT_EVENT,
      onWishlistCountChanged as EventListener,
    );
    return () => {
      globalThis.removeEventListener(
        WISHLIST_COUNT_EVENT,
        onWishlistCountChanged as EventListener,
      );
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/70 bg-white/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/45 shadow-[0_14px_30px_-24px_rgba(17,24,39,0.55)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Left */}
          <div className="flex">
            <button
              type="button"
              className="flex flex-shrink-0 items-center cursor-pointer"
              onClick={() => onNavigate("/items")}
              onMouseEnter={() => onNavigateIntent?.("/items")}
              onFocus={() => onNavigateIntent?.("/items")}
            >
              <img
                src="/logo.png"
                alt="ReWear"
                width={144}
                height={36}
                decoding="async"
                className="h-9 w-auto"
              />
            </button>

            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => onNavigate(item.value)}
                  onMouseEnter={() => onNavigateIntent?.(item.value)}
                  onFocus={() => onNavigateIntent?.(item.value)}
                  className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-semibold transition-colors ${
                    isActive(item.value)
                      ? "border-[#429172] text-gray-900"
                      : "border-transparent text-gray-500 hover:border-[#8ec2ab] hover:text-gray-700"
                  }`}
                >
                  {item.name}
                  {item.value === "/wishlist" && wishlistCount > 0 && (
                    <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#429172] px-1.5 py-0.5 text-xs font-semibold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right (Desktop) */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center gap-2">
            {userRole !== "admin" && (
              <>
                {/* 🔔 Notifications */}
                <NotificationBell />

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate("/items/new")}
                  onMouseEnter={() => onNavigateIntent?.("/items/new")}
                  onFocus={() => onNavigateIntent?.("/items/new")}
                >
                  <Plus className="mr-1.5 h-4 w-4" />
                  Add Item
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate("/profile")}
                  onMouseEnter={() => onNavigateIntent?.("/profile")}
                  onFocus={() => onNavigateIntent?.("/profile")}
                >
                  <User className="mr-1.5 h-4 w-4" />
                  Profile
                </Button>
              </>
            )}

            {userRole !== "admin" && (
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-gray-500 hover:bg-white/70 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#429172]"
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
        <div className="sm:hidden bg-white/70 backdrop-blur-2xl border-b border-white/70">
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
                    ? "border-[#429172] bg-[#eaf6f0] text-[#2d6b52]"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-white/75 hover:text-gray-700"
                }`}
              >
                {item.name}
                {item.value === "/wishlist" && wishlistCount > 0 && (
                  <span className="ml-2 inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#429172] px-1.5 py-0.5 text-xs font-semibold text-white">
                    {wishlistCount}
                  </span>
                )}
              </button>
            ))}

            {userRole !== "admin" && (
              <>
                {/* ✅ Profile (Mobile) */}
                <button
                  onClick={() => {
                    onNavigate("/profile");
                    setIsOpen(false);
                  }}
                  className={`block w-full text-left border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                    isActive("/profile")
                      ? "border-[#429172] bg-[#eaf6f0] text-[#2d6b52]"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:bg-white/75 hover:text-gray-700"
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
              </>
            )}

            {userRole !== "admin" && (
              <button
                onClick={() => {
                  onLogout();
                  setIsOpen(false);
                }}
                className="block w-full text-left border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
