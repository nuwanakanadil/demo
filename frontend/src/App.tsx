import React, { useState } from "react";
import { Navbar } from "./components/ui/Navbar";
import { LoginPage } from "./modules/auth/LoginPage";
import { RegisterPage } from "./modules/auth/RegisterPage";
import { BrowsePage } from "./modules/apparel/BrowsePage";
import { RequestSwapPage } from "./modules/swap/RequestSwapPage";
import { IncomingRequestsPage } from "./modules/swap/IncomingRequestsPage";
import { MyRequestsPage } from "./modules/swap/MyRequestsPage";
import { HistoryPage } from "./modules/swap/HistoryPage";
import { AdminDashboard } from "./modules/admin/AdminDashboard";
import { AddItemPage } from "./modules/apparel/AddItemPage";
import { EditItemPage } from "./modules/apparel/EditItemPage";
import { Apparel } from "./types";

type Page =
  | "login"
  | "register"
  | "browse"
  | "request"
  | "incoming"
  | "outgoing"
  | "history"
  | "admin"
  | "additem"
  | "edititem";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login");
  const [userRole, setUserRole] = useState<"user" | "admin" | null>(null);

  // TEMP user id (for mock items). Your mock data has ownerId like "u2".
  // Later, replace this with the real logged-in user's id from backend.
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] = useState<Apparel | null>(null);
  const [editItemId, setEditItemId] = useState<string | null>(null);

  const handleLogin = (role: "user" | "admin", userId: string) => {
    setUserRole(role);
    setCurrentUserId(userId);
    setCurrentPage(role === "admin" ? "admin" : "browse");
  };

  const handleLogout = () => {
    setUserRole(null);
    setCurrentUserId(null);
    setSelectedItem(null);
    setEditItemId(null);
    setCurrentPage("login");
  };

  const handleRequestSwap = (item: Apparel) => {
    setSelectedItem(item);
    setCurrentPage("request");
  };

  const handleSubmitSwap = () => {
    setCurrentPage("outgoing");
    setSelectedItem(null);
  };

  const handleEditItem = (itemId: string) => {
    setEditItemId(itemId);
    setCurrentPage("edititem");
  };

  // Auth Pages
  if (currentPage === "login") {
    return (
      <LoginPage
        onLogin={handleLogin}
        onNavigateRegister={() => setCurrentPage("register")}
      />
    );
  }

  if (currentPage === "register") {
    return (
      <RegisterPage
        onRegister={handleLogin}
        onNavigateLogin={() => setCurrentPage("login")}
      />
    );
  }

  // Main App Layout
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <Navbar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page as Page)}
        userRole={userRole || "user"}
        onLogout={handleLogout}
      />

      <main className="pb-16">
        {currentPage === "browse" && (
          <BrowsePage
            onRequestSwap={handleRequestSwap}
            currentUserId={currentUserId}
            onEditItem={handleEditItem}
          />
        )}

        {currentPage === "request" && selectedItem && (
          <RequestSwapPage
            targetItem={selectedItem}
            onCancel={() => setCurrentPage("browse")}
            onSubmit={handleSubmitSwap}
          />
        )}

        {currentPage === "incoming" && <IncomingRequestsPage />}

        {currentPage === "outgoing" && <MyRequestsPage />}

        {currentPage === "history" && <HistoryPage />}

        {currentPage === "admin" && <AdminDashboard />}

        {currentPage === "additem" && (
          <AddItemPage
            onSubmit={(item) => {
              console.log("New item listed:", item);
              setCurrentPage("browse");
            }}
            onCancel={() => setCurrentPage("browse")}
          />
        )}

        {currentPage === "edititem" && editItemId && (
          <EditItemPage
            itemId={editItemId}
            onCancel={() => setCurrentPage("browse")}
            onSaved={() => setCurrentPage("browse")}
          />
        )}
      </main>
    </div>
  );
}
