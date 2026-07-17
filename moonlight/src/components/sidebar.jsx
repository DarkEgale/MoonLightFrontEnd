import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Users,
  Store,
  LogOut,
} from "lucide-react";

export default function Sidebar({ setactive, active, onLogout }) {
  const { user } = useSelector((state) => state.auth);
  const role = user?.data?.role;

  const isAdminOrOwner = role === "owner" || role === "admin";
  const isRegularUser = role === "user";

  const mainMenuItems = isRegularUser
    ? [
        { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { key: "products", icon: Package, label: "Products" },
        { key: "sales", icon: ShoppingCart, label: "Sales" },
        { key: "reports", icon: BarChart3, label: "Reports" },
        { key: "setting", icon: Settings, label: "Settings" },
      ]
    : [
        { key: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
        { key: "shops", icon: Store, label: "Shops" },
        { key: "reports", icon: BarChart3, label: "Reports" },
        { key: "setting", icon: Settings, label: "Settings" },
      ];

  return (
    <aside className="w-64 h-screen fixed bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl z-50">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
          <LayoutDashboard size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight">Moonlight</span>
      </div>

      {/* Navigation */}
      <nav className="px-3 py-4">
        <p className="px-3 text-xs font-semibold uppercase tracking-widest text-white/40 mb-3">
          Main Menu
        </p>
        <ul className="space-y-1">
          {mainMenuItems.map((item) => (
            <li key={item.key}>
              <button
                onClick={() => setactive(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active === item.key
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {isAdminOrOwner && (
          <>
            <p className="px-3 text-xs font-semibold uppercase tracking-widest text-white/40 mt-6 mb-3">
              Administration
            </p>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setactive("users")}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active === "users"
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Users size={18} />
                  <span>Users</span>
                </button>
              </li>
            </ul>
          </>
        )}
      </nav>

      {/* User info at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold">
            {user?.data?.name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user?.data?.name || "User"}
            </p>
            <p className="text-xs text-white/50 truncate capitalize">
              {user?.data?.role || "N/A"}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-white/10 transition-all duration-200"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
