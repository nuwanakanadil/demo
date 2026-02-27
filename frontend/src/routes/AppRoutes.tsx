import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  Outlet,
  useLocation,
} from "react-router-dom";

import { Navbar } from "../components/ui/Navbar";

import { LoginPage } from "../modules/auth/LoginPage";
import { RegisterPage } from "../modules/auth/RegisterPage";
import { VerifyEmailPage } from "../modules/auth/VerifyEmailPage";

import { BrowsePage } from "../modules/apparel/BrowsePage";
import { AddItemPage } from "../modules/apparel/AddItemPage";
import { EditItemPage } from "../modules/apparel/EditItemPage";

import { RequestSwapPage } from "../modules/swap/RequestSwapPage";
import { IncomingRequestsPage } from "../modules/swap/IncomingRequestsPage";
import { MyRequestsPage } from "../modules/swap/MyRequestsPage";
import { HistoryPage } from "../modules/swap/HistoryPage";
import { AdminDashboard } from "../modules/admin/AdminDashboard";

import { ProductDetailsPage } from "../modules/apparel/ProductDetailsPage";

import { UserProfilePage } from "../modules/User/UserProfile";

import { getMe } from "../api/auth.api"; // ✅ add this
import { Apparel } from "../types";
import { ChatPage } from "../modules/Chat/ChatPage";
import { WishlistHubPage } from "../pages/WishlistHubPage";
import { SwapLogisticsPage } from "../pages/Delevery/SwapLogisticsPage";

import AdminLayout from "../modules/admin/AdminLayout";
import AdminUsers from "../modules/admin/AdminUsers";
import AdminItems from "../modules/admin/AdminItems";
import AdminSwaps from "../modules/admin/AdminSwaps";
import AdminReviews from "../modules/admin/AdminReviews";


/* --------------------------------------------------
   Helpers
-------------------------------------------------- */

function hasToken() {
  return Boolean(localStorage.getItem("token"));
}

/* --------------------------------------------------
   Route Guards
-------------------------------------------------- */

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!hasToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireVerified({
  isVerified,
  children,
}: {
  isVerified: boolean;
  children: React.ReactNode;
}) {
  if (!isVerified) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/* --------------------------------------------------
   Layout
-------------------------------------------------- */

function AppLayout({
  userRole,
  onLogout,
}: {
  userRole: "user" | "admin";
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <Navbar
        currentPage={location.pathname}
        onNavigate={(path) => navigate(path)}
        userRole={userRole}
        onLogout={onLogout}
      />
      <main className="pb-16">
        <Outlet />
      </main>
    </div>
  );
}

/* --------------------------------------------------
   Route Wrappers
-------------------------------------------------- */

function EditItemRoute({
  onCancel,
  onSaved,
}: {
  onCancel: () => void;
  onSaved: () => void;
}) {
  const { id } = useParams();
  if (!id) return <Navigate to="/items" replace />;
  return <EditItemPage itemId={id} onCancel={onCancel} onSaved={onSaved} />;
}

function RequestSwapRoute({
  selectedItem,
  onCancel,
  onSubmit,
}: {
  selectedItem: Apparel | null;
  onCancel: () => void;
  onSubmit: () => void;
}) {
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

  const [userRole, setUserRole] = useState<"user" | "admin" | null>(null);
  const [loading, setLoading] = useState(false);
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
        localStorage.removeItem("token");
        setUserRole(null);
        setCurrentUserId(null);
        setIsEmailVerified(false);
        setCurrentUser(null);
        setSelectedItem(null);
        navigate("/login", { replace: true });
      } finally {
        setLoading(false); // ✅ always stop loading
      }
    };

    loadMe();
  }, [navigate]);

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
    navigate("/login", { replace: true });
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

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <Routes>
      {/* Default */}
      <Route path="/" element={<Navigate to="/items" replace />} />
      {/* Public */}
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={handleLogin}
            onNavigateRegister={() => navigate("/register")}
          />
        }
      />
      <Route
        path="/register"
        element={
          <RegisterPage
            onRegister={(role, id) => handleLogin(role, id, false)}
            onNavigateLogin={() => navigate("/login")}
          />
        }
      />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      {/* Protected */}
      <Route
        element={
          <RequireAuth>
            <AppLayout userRole={userRole || "user"} onLogout={handleLogout} />
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
          element={
            userRole === null ? (
              <div>Loading...</div>
            ) : userRole === "admin" ? (
              <AdminLayout />
            ) : (
              <Navigate to="/items" replace />
            )
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="items" element={<AdminItems />} />
          <Route path="swaps" element={<AdminSwaps />} />
          <Route path="reviews" element={<AdminReviews />} />
        </Route>
      </Route>{" "}
      {/* ✅ THIS CLOSES THE PROTECTED ROUTE */}
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/items" replace />} />
    </Routes>
  );
}
