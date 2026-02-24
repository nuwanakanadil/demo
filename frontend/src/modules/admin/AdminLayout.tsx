import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Admin Panel
          </h2>
        </div>

        <nav className="flex flex-col p-4 gap-2">
          <NavItem to="/admin" label="Dashboard" />
          <NavItem to="/admin/users" label="Users" />
          <NavItem to="/admin/items" label="Items" />
          <NavItem to="/admin/swaps" label="Swaps" />
          <NavItem to="/admin/reviews" label="Reviews" />

        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end={to === ""}   // only Dashboard uses end
      className={({ isActive }) =>
        `px-4 py-2 rounded-lg transition ${
          isActive
            ? "bg-black text-white"
            : "text-gray-700 hover:bg-gray-200"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
