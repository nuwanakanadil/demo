import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/ui/Navbar";
import { clearToken } from "../auth/auth";

export function AppLayout({
  userRole,
  onLogout,
  onNavigateIntent,
}: Readonly<{
  userRole: "user" | "admin";
  onLogout: () => void;
  onNavigateIntent?: (path: string) => void;
}>) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-transparent font-sans text-neutral-900">
      {!isAdminRoute && (
        <Navbar
          currentPage={location.pathname}
          onNavigate={(path) => navigate(path)}
          onNavigateIntent={onNavigateIntent}
          userRole={userRole}
          onLogout={() => {
            clearToken();
            onLogout();
            navigate("/login");
          }}
        />
      )}
      <div>
        <Outlet />
      </div>
    </div>
  );
}
