import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Navbar } from "../components/ui/Navbar";
import { clearToken } from "../auth/auth";

export function AppLayout({
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
        onLogout={() => {
          clearToken();
          onLogout();
          navigate("/login");
        }}
      />
      <main className="pb-16">
        <Outlet />
      </main>
    </div>
  );
}
