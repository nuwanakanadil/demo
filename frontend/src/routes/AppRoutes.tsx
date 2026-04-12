import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";
import { AppLayout } from "../layout/AppLayout";
import { LandingPage } from "../pages/LandingPage";

import { getMe } from "../api/auth.api"; // ✅ add this
import { Apparel } from "../types";

const loadLoginPage = () =>
  import("../modules/auth/LoginPage").then((m) => ({ default: m.LoginPage }));
const loadForgotPasswordPage = () =>
  import("../modules/auth/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage }));
const loadResetPasswordPage = () =>
  import("../modules/auth/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage }));
const loadRegisterPage = () =>
  import("../modules/auth/RegisterPage").then((m) => ({ default: m.RegisterPage }));
const loadVerifyEmailPage = () =>
  import("../modules/auth/VerifyEmailPage").then((m) => ({ default: m.VerifyEmailPage }));

const loadBrowsePage = () =>
  import("../modules/apparel/BrowsePage").then((m) => ({ default: m.BrowsePage }));
const loadAddItemPage = () =>
  import("../modules/apparel/AddItemPage").then((m) => ({ default: m.AddItemPage }));
const loadEditItemPage = () =>
  import("../modules/apparel/EditItemPage").then((m) => ({ default: m.EditItemPage }));
const loadProductDetailsPage = () =>
  import("../modules/apparel/ProductDetailsPage").then((m) => ({ default: m.ProductDetailsPage }));

const loadRequestSwapPage = () =>
  import("../modules/swap/RequestSwapPage").then((m) => ({ default: m.RequestSwapPage }));
const loadIncomingRequestsPage = () =>
  import("../modules/swap/IncomingRequestsPage").then((m) => ({ default: m.IncomingRequestsPage }));
const loadMyRequestsPage = () =>
  import("../modules/swap/MyRequestsPage").then((m) => ({ default: m.MyRequestsPage }));
const loadHistoryPage = () =>
  import("../modules/swap/HistoryPage").then((m) => ({ default: m.HistoryPage }));
const loadSwapLogisticsPage = () =>
  import("../pages/Delevery/SwapLogisticsPage").then((m) => ({ default: m.SwapLogisticsPage }));

const loadChatPage = () =>
  import("../modules/Chat/ChatPage").then((m) => ({ default: m.ChatPage }));
const loadUserProfilePage = () =>
  import("../modules/User/UserProfile").then((m) => ({ default: m.UserProfilePage }));
const loadWishlistHubPage = () =>
  import("../pages/WishlistHubPage").then((m) => ({ default: m.WishlistHubPage }));

const loadAdminLayout = () => import("../modules/admin/AdminLayout");
const loadAdminDashboard = () =>
  import("../modules/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard }));
const loadAdminUsers = () => import("../modules/admin/AdminUsers");
const loadAdminItems = () => import("../modules/admin/AdminItems");
const loadAdminSwaps = () => import("../modules/admin/AdminSwaps");
const loadAdminReviews = () => import("../modules/admin/AdminReviews");
const loadAdminAuditLogs = () => import("../modules/admin/AdminAuditLogs");

const LoginPage = lazy(loadLoginPage);
const ForgotPasswordPage = lazy(loadForgotPasswordPage);
const ResetPasswordPage = lazy(loadResetPasswordPage);
const RegisterPage = lazy(loadRegisterPage);
const VerifyEmailPage = lazy(loadVerifyEmailPage);

const BrowsePage = lazy(loadBrowsePage);
const AddItemPage = lazy(loadAddItemPage);
const EditItemPage = lazy(loadEditItemPage);
const ProductDetailsPage = lazy(loadProductDetailsPage);

const RequestSwapPage = lazy(loadRequestSwapPage);
const IncomingRequestsPage = lazy(loadIncomingRequestsPage);
const MyRequestsPage = lazy(loadMyRequestsPage);
const HistoryPage = lazy(loadHistoryPage);
const SwapLogisticsPage = lazy(loadSwapLogisticsPage);

const ChatPage = lazy(loadChatPage);
const UserProfilePage = lazy(loadUserProfilePage);
const WishlistHubPage = lazy(loadWishlistHubPage);

const AdminLayout = lazy(loadAdminLayout);
const AdminDashboard = lazy(loadAdminDashboard);
const AdminUsers = lazy(loadAdminUsers);
const AdminItems = lazy(loadAdminItems);
const AdminSwaps = lazy(loadAdminSwaps);
const AdminReviews = lazy(loadAdminReviews);
const AdminAuditLogs = lazy(loadAdminAuditLogs);

function RouteSkeleton({ path }: Readonly<{ path: string }>) {
  const isAdmin = path.startsWith("/admin");
  const isAuth = path === "/login" || path === "/register" || path === "/forgot-password";

  if (isAdmin) {
    return (
      <div className="p-6">
        <div className="h-10 w-56 rounded-xl bg-neutral-200/80 animate-pulse" />
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((k) => (
            <div key={k} className="h-28 rounded-2xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isAuth) {
    return (
      <div className="mx-auto mt-16 w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="h-6 w-40 rounded-md bg-neutral-200 animate-pulse" />
        <div className="mt-6 space-y-3">
          <div className="h-11 rounded-xl bg-neutral-100 animate-pulse" />
          <div className="h-11 rounded-xl bg-neutral-100 animate-pulse" />
          <div className="h-11 rounded-xl bg-neutral-200 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="h-8 w-64 rounded-md bg-neutral-200 animate-pulse" />
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <div key={k} className="h-40 rounded-2xl bg-neutral-100 animate-pulse" />
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

function hasToken() {
  return Boolean(localStorage.getItem("token"));
}

/* --------------------------------------------------
   Route Guards
-------------------------------------------------- */

function RequireAuth({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!hasToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireVerified({
  isVerified,
  children,
}: Readonly<{
  isVerified: boolean;
  children: React.ReactNode;
}>) {
  if (!isVerified) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/* --------------------------------------------------
   Route Wrappers
-------------------------------------------------- */

function EditItemRoute({
  onCancel,
  onSaved,
}: Readonly<{
  onCancel: () => void;
  onSaved: () => void;
}>) {
  const { id } = useParams();
  if (!id) return <Navigate to="/items" replace />;
  return <EditItemPage itemId={id} onCancel={onCancel} onSaved={onSaved} />;
}

function RequestSwapRoute({
  selectedItem,
  onCancel,
  onSubmit,
}: Readonly<{
  selectedItem: Apparel | null;
  onCancel: () => void;
  onSubmit: () => void;
}>) {
  if (!selectedItem) return <Navigate to="/items" replace />;
  return (
    <RequestSwapPage
      targetItem={selectedItem}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  );
}

/* --------------------------------------------------
   Types
-------------------------------------------------- */

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  isEmailVerified: boolean;
};

/* --------------------------------------------------
   Main Routes
-------------------------------------------------- */

export default function AppRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  const [userRole, setUserRole] = useState<"user" | "admin" | null>(null);
  const [loading, setLoading] = useState(hasToken());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [selectedItem, setSelectedItem] = useState<Apparel | null>(null);

  useEffect(() => {
    const loadMe = async () => {
      if (!hasToken()) {
        setLoading(false); // ✅ stop loading if no token
        return;
      }

      try {
        const res = await getMe();
        const u = res.user;

        const nextUser = {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          isEmailVerified: u.isEmailVerified,
        };

        setCurrentUser(nextUser);
        setUserRole(u.role);
        setCurrentUserId(u.id);
        setIsEmailVerified(u.isEmailVerified);
      } catch (err) {
        console.error("Failed to load current user", err);
        localStorage.removeItem("token");
        setUserRole(null);
        setCurrentUserId(null);
        setIsEmailVerified(false);
        setCurrentUser(null);
        setSelectedItem(null);
        if (location.pathname !== "/") {
          navigate("/", { replace: true });
        }
      } finally {
        setLoading(false); // ✅ always stop loading
      }
    };

    loadMe();
  }, [navigate, location.pathname]);

  // ✅ updated signature to accept verification status
  const handleLogin = (
    role: "user" | "admin",
    userId: string,
    verified: boolean,
  ) => {
    setUserRole(role);
    setCurrentUserId(userId);
    setIsEmailVerified(verified);

    // ✅ build minimal user object (name/email will be loaded by getMe on refresh)
    setCurrentUser((prev) => ({
      id: userId,
      name: prev?.name || "User",
      email: prev?.email || "",
      role,
      isEmailVerified: verified,
    }));

    if (!verified) {
      navigate("/login", { replace: true });
      return;
    }

    navigate(role === "admin" ? "/admin" : "/items", { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUserRole(null);
    setCurrentUserId(null);
    setIsEmailVerified(false);
    setCurrentUser(null);
    setSelectedItem(null);
    navigate("/", { replace: true });
  };

  const defaultAuthedPath = userRole === "admin" ? "/admin" : "/items";

  const prefetchAuthPages = () => {
    void loadLoginPage();
    void loadRegisterPage();
    void loadForgotPasswordPage();
  };

  const prefetchUserHome = () => {
    void loadBrowsePage();
    void loadWishlistHubPage();
    void loadProductDetailsPage();
  };

  const prefetchAdminHome = () => {
    void loadAdminLayout();
    void loadAdminDashboard();
    void loadAdminUsers();
    void loadAdminItems();
  };

  const prefetchPrimaryRoute = () => {
    if (!hasToken()) {
      prefetchAuthPages();
      return;
    }
    if (userRole === "admin") {
      prefetchAdminHome();
      return;
    }
    prefetchUserHome();
  };

  const prefetchPath = (path: string) => {
    const exactPrefetch: Record<string, () => void> = {
      "/": () => {
        // Critical route is eagerly loaded.
      },
      "/home": () => {
        // Critical route is eagerly loaded.
      },
      "/login": () => {
        void loadLoginPage();
      },
      "/register": () => {
        void loadRegisterPage();
      },
      "/forgot-password": () => {
        void loadForgotPasswordPage();
      },
      "/reset-password": () => {
        void loadResetPasswordPage();
      },
      "/verify-email": () => {
        void loadVerifyEmailPage();
      },
      "/items": () => {
        void loadBrowsePage();
      },
      "/items/new": () => {
        void loadAddItemPage();
      },
      "/wishlist": () => {
        void loadWishlistHubPage();
      },
      "/profile": () => {
        void loadUserProfilePage();
      },
      "/swaps/request": () => {
        void loadRequestSwapPage();
      },
      "/swaps/incoming": () => {
        void loadIncomingRequestsPage();
      },
      "/swaps/outgoing": () => {
        void loadMyRequestsPage();
      },
      "/swaps/history": () => {
        void loadHistoryPage();
      },
      "/admin": () => {
        void loadAdminLayout();
        void loadAdminDashboard();
      },
      "/admin/": () => {
        void loadAdminLayout();
        void loadAdminDashboard();
      },
    };

    const exactHandler = exactPrefetch[path];
    if (exactHandler) {
      exactHandler();
      return;
    }

    if (path.startsWith("/admin/")) {
      void loadAdminLayout();
      const adminPrefixPrefetch: Array<{ prefix: string; load: () => void }> = [
        { prefix: "/admin/users", load: () => void loadAdminUsers() },
        { prefix: "/admin/items", load: () => void loadAdminItems() },
        { prefix: "/admin/swaps", load: () => void loadAdminSwaps() },
        { prefix: "/admin/reviews", load: () => void loadAdminReviews() },
        { prefix: "/admin/audit-logs", load: () => void loadAdminAuditLogs() },
      ];
      const target = adminPrefixPrefetch.find((entry) => path.startsWith(entry.prefix));
      if (target) {
        target.load();
      }
      return;
    }

    const patternPrefetch: Array<{ test: (value: string) => boolean; load: () => void }> = [
      {
        test: (value) => value.startsWith("/items/") && value.endsWith("/edit"),
        load: () => void loadEditItemPage(),
      },
      {
        test: (value) => value.startsWith("/items/"),
        load: () => void loadProductDetailsPage(),
      },
      {
        test: (value) => value.startsWith("/chat/"),
        load: () => void loadChatPage(),
      },
      {
        test: (value) => value.startsWith("/swaps/") && value.endsWith("/logistics"),
        load: () => void loadSwapLogisticsPage(),
      },
    ];

    const dynamicTarget = patternPrefetch.find((entry) => entry.test(path));
    if (dynamicTarget) {
      dynamicTarget.load();
    }
  };

  const handleRequestSwap = (item: Apparel) => {
    setSelectedItem(item);
    navigate("/swaps/request");
  };

  const handleSubmitSwap = () => {
    setSelectedItem(null);
    navigate("/swaps/outgoing");
  };

  const handleEditItem = (itemId: string) => {
    navigate(`/items/${itemId}/edit`);
  };

  let adminRouteElement: React.ReactNode;
  if (userRole === null) {
    adminRouteElement = <div>Loading...</div>;
  } else if (userRole === "admin") {
    adminRouteElement = <AdminLayout />;
  } else {
    adminRouteElement = <Navigate to="/items" replace />;
  }

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <Suspense fallback={<RouteSkeleton path={location.pathname} />}>
      <Routes>
      {/* Public home */}
      <Route
        path="/"
        element={
          <LandingPage
            isAuthenticated={hasToken()}
            onPrimaryAction={() =>
              hasToken() ? navigate(defaultAuthedPath) : navigate("/register")
            }
            onLogin={() => navigate("/login")}
            onRegister={() => navigate("/register")}
            onPrimaryIntent={prefetchPrimaryRoute}
            onLoginIntent={prefetchAuthPages}
            onRegisterIntent={prefetchAuthPages}
          />
        }
      />

      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* Public */}
      <Route
        path="/login"
        element={
          hasToken() ? (
            <Navigate to={defaultAuthedPath} replace />
          ) : (
            <LoginPage
              onLogin={handleLogin}
              onNavigateRegister={() => navigate("/register")}
              onForgotPassword={() => navigate("/forgot-password")}
            />
          )
        }
      />
      <Route
        path="/forgot-password"
        element={
          <ForgotPasswordPage onBackToLogin={() => navigate("/login")} />
        }
      />
      <Route
        path="/register"
        element={
          hasToken() ? (
            <Navigate to={defaultAuthedPath} replace />
          ) : (
            <RegisterPage
              onRegister={(role, id) => handleLogin(role, id, false)}
              onNavigateLogin={() => navigate("/login")}
            />
          )
        }
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      {/* Protected */}
      <Route
        element={
          <RequireAuth>
            <AppLayout
              userRole={userRole || "user"}
              onLogout={handleLogout}
              onNavigateIntent={prefetchPath}
            />
          </RequireAuth>
        }
      >
        {/* Items */}

        <Route
          path="/items"
          element={
            <BrowsePage
              onRequestSwap={handleRequestSwap}
              currentUserId={currentUserId}
              onEditItem={handleEditItem}
            />
          }
        />

        {/* ✅ Product details page */}
        <Route path="/wishlist" element={<WishlistHubPage />} />

        {/* ✅ Product details */}

        <Route path="/items/:id" element={<ProductDetailsPage />} />

        {/* ✅ Chat */}
        <Route path="/chat/:itemId/:ownerId" element={<ChatPage />} />

        {/* ✅ Profile (NEW) */}
        <Route
          path="/profile"
          element={<UserProfilePage user={currentUser} />}
        />

        {/* Verified-only actions */}
        <Route
          path="/items/new"
          element={
            <RequireVerified isVerified={isEmailVerified}>
              <AddItemPage
                onSubmit={() => navigate("/items")}
                onCancel={() => navigate("/items")}
              />
            </RequireVerified>
          }
        />

        <Route
          path="/items/:id/edit"
          element={
            <RequireVerified isVerified={isEmailVerified}>
              <EditItemRoute
                onCancel={() => navigate("/items")}
                onSaved={() => navigate("/items")}
              />
            </RequireVerified>
          }
        />

        {/* Swaps */}
        <Route
          path="/swaps/request"
          element={
            <RequireVerified isVerified={isEmailVerified}>
              <RequestSwapRoute
                selectedItem={selectedItem}
                onCancel={() => navigate("/items")}
                onSubmit={handleSubmitSwap}
              />
            </RequireVerified>
          }
        />

        <Route path="/swaps/incoming" element={<IncomingRequestsPage />} />
        <Route path="/swaps/outgoing" element={<MyRequestsPage />} />
        <Route path="/swaps/history" element={<HistoryPage />} />
        <Route path="/swaps/:id/logistics" element={<SwapLogisticsPage />} />

        {/* Admin */}
        <Route
          path="/admin/*"
          element={adminRouteElement}
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="items" element={<AdminItems />} />
          <Route path="swaps" element={<AdminSwaps />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="audit-logs" element={<AdminAuditLogs />} />
        </Route>
      </Route>{" "}
      {/* ✅ THIS CLOSES THE PROTECTED ROUTE */}
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
