import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm">
        
        {/* Header */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-emerald-600">
            Admin Panel
          </h2>
        </div>

        {/* Navigation */}
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
      end={to === "/admin"}
      className={({ isActive }) =>
        `px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
          isActive
            ? "bg-emerald-500 text-white shadow-md"
            : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
        }`
      }
    >
      {label}
    </NavLink>
  );
}
