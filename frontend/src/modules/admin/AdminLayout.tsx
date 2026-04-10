import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Repeat,
  Star,
  LogOut,
  Settings,
  LucideIcon,
} from "lucide-react";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-neutral-50/50 text-neutral-900 font-sans">
      <aside className="w-72 bg-white border-r border-neutral-200 shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-10 relative">
        <div className="p-6 border-b border-neutral-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
            <Settings className="w-6 h-6 animate-[spin_10s_linear_infinite]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">Admin</h2>
            <p className="text-xs text-brand-600 font-medium tracking-wider uppercase">Workspace</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-hide">
          <NavItem to="/admin" label="Dashboard" icon={LayoutDashboard} />
          <NavItem to="/admin/users" label="Users Management" icon={Users} />
          <NavItem to="/admin/items" label="Apparels & Items" icon={ShoppingBag} />
          <NavItem to="/admin/swaps" label="Swap Requests" icon={Repeat} />
          <NavItem to="/admin/reviews" label="User Reviews" icon={Star} />
        </nav>

        <div className="p-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 rounded-xl hover:bg-rose-50 hover:text-rose-700 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden overflow-y-auto relative bg-[#f8fafc]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.3]"></div>
        <div className="relative z-10 w-full p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/admin"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group relative overflow-hidden ${
          isActive
            ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
            : "text-neutral-600 hover:bg-brand-50 hover:text-brand-700"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
          <Icon
            className={`w-5 h-5 transition-transform duration-300 ${
              isActive ? "scale-110" : "group-hover:scale-110"
            }`}
          />
          <span className="relative z-10">{label}</span>
        </>
      )}
    </NavLink>
  );
}