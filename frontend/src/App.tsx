import React, { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useParams,
  Outlet,
  useLocation,
} from "react-router-dom";

import { Navbar } from "./components/ui/Navbar";
import { LoginPage } from "./modules/auth/LoginPage";
import { RegisterPage } from "./modules/auth/RegisterPage";
import { VerifyEmailPage } from "./modules/auth/VerifyEmailPage";

import { BrowsePage } from "./modules/apparel/BrowsePage";
import { AddItemPage } from "./modules/apparel/AddItemPage";
import { EditItemPage } from "./modules/apparel/EditItemPage";

import { RequestSwapPage } from "./modules/swap/RequestSwapPage";
import { IncomingRequestsPage } from "./modules/swap/IncomingRequestsPage";
import { MyRequestsPage } from "./modules/swap/MyRequestsPage";
import { HistoryPage } from "./modules/swap/HistoryPage";
import { AdminDashboard } from "./modules/admin/AdminDashboard";

import { Apparel } from "./types";

/** Simple token check (you already save token in localStorage) */
function hasToken() {
  return Boolean(localStorage.getItem("token"));
}

/** Guard: require login */
function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!hasToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Guard: require verified email */
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

/** Layout wrapper to keep Navbar on protected pages */
function AppLayout({
  userRole,
  onLogout,
}: {
  userRole: "user" | "admin";
  onLogout: () => void;
}) {
  const location = useLocation();
  const navigate = useNavigate();

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

/** Wrapper to read :id param for Edit page */
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

/** Swap request page expects an item - we pass item using state navigation */
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

export default function App() {
  const navigate = useNavigate();

  const [userRole, setUserRole] = useState<"user" | "admin" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  // swap flow uses selected item (until you implement swap page fetching by id)
  const [selectedItem, setSelectedItem] = useState<Apparel | null>(null);

  // ✅ updated signature to accept verification status
  const handleLogin = (
    role: "user" | "admin",
    userId: string,
    verified: boolean
  ) => {
    setUserRole(role);
    setCurrentUserId(userId);
    setIsEmailVerified(verified);

    // if backend blocks unverified login, this is mostly for safety
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
            // If your RegisterPage currently calls onRegister(role,id),
            // update it later to only show success + go to login.
            onRegister={(role, id) => handleLogin(role, id, false)}
            onNavigateLogin={() => navigate("/login")}
          />
        }
      />

      <Route path="/verify-email" element={<VerifyEmailPage />} />

      {/* Protected Layout */}
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

        {/* Admin */}
        <Route
          path="/admin"
          element={
            userRole === "admin" ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/items" replace />
            )
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/items" replace />} />
    </Routes>
  );
}
