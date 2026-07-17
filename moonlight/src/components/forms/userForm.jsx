import { useState, useMemo } from "react";
import { X, User, Mail, Phone, Store, Shield } from "lucide-react";

export default function UserForm({ setShowForm, user, shops, onSuccess }) {
  const initialFormData = useMemo(() => {
    if (user) {
      return {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        shop: user.shop?._id || user.shop || "",
        role: user.role || "user",
        password: "",
      };
    }
    return {
      name: "",
      email: "",
      phone: "",
      shop: "",
      role: "user",
      password: "",
    };
  }, [user]);

  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Reset form when user prop changes
  if (user && formData.name !== (user.name || "")) {
    setFormData(initialFormData);
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { registerEmployee, updateUser } = await import("../../api/user");

      // Prepare data - send shop as object or id based on backend expectation
      const submitData = {
        ...formData,
        shop: formData.shop || null,
      };

      // Remove password if empty (for updates)
      if (user && !formData.password) {
        delete submitData.password;
      }

      if (user) {
        await updateUser(user._id || user.id, submitData);
      } else {
        await registerEmployee(submitData);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
      console.error("Form submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <User size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
                {user ? "Edit User" : "Register Employee"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                {user ? "Update user details" : "Create new employee account"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter full name"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter email address"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">
              Phone <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter phone number"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          </div>

          {/* Shop Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">
              Shop <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Store
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                name="shop"
                value={formData.shop}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              >
                <option value="">Select a shop</option>
                {shops.map((shop) => (
                  <option key={shop._id || shop.id} value={shop._id || shop.id}>
                    {shop.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-700 dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              >
                <option value="user">Employee</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
          </div>

          {/* Password (only for new users) */}
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Shield
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!user}
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : user ? "Update" : "Register"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
