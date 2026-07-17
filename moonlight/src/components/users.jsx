import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Users as UsersIcon,
  Search,
  SlidersHorizontal,
  UserCheck,
  Store,
  Phone,
  Mail,
  Eye,
  Shield,
} from "lucide-react";
import { useSelector } from "react-redux";
import UserForm from "../components/forms/userForm";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 10;
import {
  getAllUsers,
  registerEmployee,
  updateUser,
  deleteUser,
} from "../api/user";
import { getShops } from "../api/shop";

export default function Users() {
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState([]);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShop, setSelectedShop] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const user = useSelector((state) => state.auth.user);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data?.data || []);
    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      const userId = user?.data?._id || user?.data?.user?._id || user?._id;
      if (userId) {
        const data = await getShops(userId);
        setShops(data?.data || data?.shops || []);
      }
    } catch (error) {
      console.error("Fetch shops error:", error);
    }
  };

  useEffect(() => {
    fetchShops();
    fetchUsers();
  }, []);

  const handleEdit = (userData) => {
    setEditingUser(userData);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleSuccess = () => {
    fetchUsers();
    setShowForm(false);
    setEditingUser(null);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await deleteUser(userId);
        fetchUsers();
      } catch (error) {
        console.error("Delete user error:", error);
        alert("Failed to delete user");
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone?.toString() || "").includes(searchTerm.toLowerCase());
    const shopId = typeof u.shop === "object" ? u.shop?._id : u.shop;
    const matchesShop = selectedShop === "all" || shopId === selectedShop;
    return matchesSearch && matchesShop;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-red-100 text-red-700 border-red-200",
      owner: "bg-purple-100 text-purple-700 border-purple-200",
      user: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return colors[role] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <UsersIcon size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">
                User Management
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-0.5">
                Manage employees and user accounts
              </p>
            </div>
          </div>
        </div>
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2.5 px-5 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5"
          onClick={handleCreateNew}
        >
          <Plus size={20} />
          <span>Register Employee</span>
        </button>
      </div>

      {showForm && (
        <UserForm
          setShowForm={setShowForm}
          user={editingUser}
          shops={shops}
          onSuccess={handleSuccess}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Users",
            value: users.length,
            color: "from-blue-500 to-blue-600",
            icon: UsersIcon,
          },
          {
            label: "Employees",
            value: users.filter((u) => u.role === "user").length,
            color: "from-emerald-500 to-emerald-600",
            icon: UserCheck,
          },
          {
            label: "Total Shops",
            value: shops.length,
            color: "from-purple-500 to-violet-500",
            icon: Store,
          },
          {
            label: "Admins",
            value: users.filter((u) => u.role === "admin" || u.role === "owner")
              .length,
            color: "from-amber-500 to-orange-500",
            icon: Shield,
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}
              >
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
                  {item.label}
                </p>
                <p className="text-lg font-bold text-gray-800 dark:text-dark-text">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedShop}
            onChange={(e) => setSelectedShop(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-600 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover transition-all shadow-sm"
          >
            <option value="all">All Shops</option>
            {shops.map((shop) => (
              <option key={shop._id || shop.id} value={shop._id || shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-400 dark:text-dark-text-secondary ml-2">
            Showing{" "}
            <span className="font-semibold text-gray-700 dark:text-dark-text">
              {filteredUsers.length}
            </span>{" "}
            users
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden hover:shadow-md transition-all duration-300">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-blue-500">
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                  User
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                  Email
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                  Phone
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                  Shop
                </th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                  Role
                </th>
                <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-white/90">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <p className="text-gray-500 dark:text-dark-text-secondary">
                      Loading users...
                    </p>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-dark-hover flex items-center justify-center mx-auto mb-4">
                      <UsersIcon
                        size={28}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </div>
                    <p className="text-gray-500 dark:text-dark-text-secondary font-medium">
                      No users found
                    </p>
                    <p className="text-gray-400 dark:text-dark-text-secondary text-sm mt-1">
                      Register your first employee to get started
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr
                    key={u._id || u.id}
                    className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors duration-150"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center">
                          <UserCheck
                            size={16}
                            className="text-blue-600 dark:text-blue-400"
                          />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 dark:text-dark-text group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {u.name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-dark-text">
                        <Mail
                          size={14}
                          className="text-gray-400 dark:text-dark-text-secondary"
                        />
                        {u.email}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-dark-text">
                        <Phone
                          size={14}
                          className="text-gray-400 dark:text-dark-text-secondary"
                        />
                        {u.phone || "N/A"}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-dark-text">
                        {typeof u.shop === "object"
                          ? u.shop?.name
                          : u.shop || "N/A"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${getRoleColor(u.role)}`}
                      >
                        {u.role || "user"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(u)}
                          className="p-2 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors opacity-0 group-hover:opacity-100"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id || u.id)}
                          className="p-2 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/50 hover:bg-red-100 dark:hover:bg-red-900 transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </section>
  );
}
