import { useState } from "react";
import { useSelector } from "react-redux";
import {
  Settings,
  Mail,
  Phone,
  Lock,
  Palette,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { changePassword } from "../api/auth";

export default function Setting() {
  const user = useSelector((state) => state.auth.user);
  const { isDark, toggleDarkMode } = useTheme();

  // Password change form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "Password must be at least 6 characters",
      });
      return;
    }

    setLoading(true);
    try {
      const data = await changePassword(currentPassword, newPassword);
      if (data.success) {
        setMessage({
          type: "success",
          text: data.message || "Password changed successfully",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setShowPasswordForm(false);
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to change password",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "Failed to change password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-sm">
              <Settings size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">
                Settings
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-0.5">
                Customize your preferences and account settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-6 mb-6 hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {user?.data?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-emerald-400 border-2 border-white dark:border-dark-card rounded-full"></span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
                {user?.data?.name || "User"}
              </h3>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary capitalize">
                {user?.data?.role || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-dark-hover border border-gray-100 dark:border-dark-border group hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <Mail size={16} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Email
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-dark-text">
                {user?.data?.email || "N/A"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-dark-hover border border-gray-100 dark:border-dark-border group hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <Phone
                size={16}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-700 dark:text-dark-text">
                {user?.data?.phone || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-6 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-sm">
              <Palette size={18} className="text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-dark-text">
              Appearance
            </h3>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors group/setting">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-dark-text group-hover/setting:text-blue-600 dark:group-hover/setting:text-blue-400 transition-colors">
                  Dark Mode
                </p>
                <p className="text-xs text-gray-400 dark:text-dark-text-secondary truncate">
                  Switch between light and dark theme
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer ml-3">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isDark}
                  onChange={toggleDarkMode}
                />
                <div className="w-9 h-5 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security / Change Password */}
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-6 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
              <Lock size={18} className="text-white" />
            </div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-dark-text">
              Security
            </h3>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors group/setting">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-dark-text group-hover/setting:text-blue-600 dark:group-hover/setting:text-blue-400 transition-colors">
                  Change Password
                </p>
                <p className="text-xs text-gray-400 dark:text-dark-text-secondary truncate">
                  Update your account password
                </p>
              </div>
              <button
                onClick={() => setShowPasswordForm(!showPasswordForm)}
                className="text-xs font-medium text-blue-600 hover:text-blue-700 ml-3 whitespace-nowrap px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
              >
                {showPasswordForm ? "Cancel" : "Update"}
              </button>
            </div>

            {showPasswordForm && (
              <form
                onSubmit={handleChangePassword}
                className="p-4 space-y-3 border-t border-gray-100 dark:border-dark-border mt-2"
              >
                {message.text && (
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      message.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                        : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Enter current password"
                      className="w-full pr-10 pl-3 py-2 bg-white dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Enter new password"
                      className="w-full pr-10 pl-3 py-2 bg-white dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-dark-text-secondary mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm new password"
                      className="w-full pr-10 pl-3 py-2 bg-white dark:bg-dark-hover border border-gray-200 dark:border-dark-border rounded-lg text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 rounded-lg text-white font-medium text-sm bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Changing Password..." : "Change Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
