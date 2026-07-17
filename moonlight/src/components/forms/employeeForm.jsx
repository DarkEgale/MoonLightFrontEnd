import { useState } from "react";
import { X } from "lucide-react";
import { registerEmployee, updateUser } from "../../api/user";

export default function EmployeeForm({ setShowForm, employee, onSuccess }) {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    password: "",
    role: employee?.role || "employee",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const isEdit = !!employee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Employee name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!isEdit && !formData.password.trim())
      newErrors.password = "Password is required";
    if (!formData.role.trim()) newErrors.role = "Role is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");
    try {
      if (isEdit) {
        const payload = { name: formData.name, email: formData.email };
        await updateUser(employee._id, payload);
      } else {
        await registerEmployee(formData);
      }
      if (onSuccess) onSuccess();
      setShowForm(false);
    } catch (error) {
      console.error("Employee form error:", error);
      setApiError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 relative">
        <button
          onClick={() => setShowForm(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isEdit ? "Edit Employee" : "Register Employee"}
        </h2>

        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {apiError}
            </div>
          )}
          <div className="space-y-4">
            {/* Employee Name */}
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="name"
              >
                Employee Name
              </label>
              <input
                className={`w-full px-3.5 py-2.5 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 ${
                  errors.name ? "border-red-400" : "border-gray-200"
                }`}
                id="name"
                name="name"
                type="text"
                placeholder="Enter employee name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className={`w-full px-3.5 py-2.5 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 ${
                  errors.email ? "border-red-400" : "border-gray-200"
                }`}
                id="email"
                name="email"
                type="email"
                placeholder="employee@example.com"
                value={formData.email}
                onChange={handleChange}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-0.5">{errors.email}</p>
              )}
            </div>

            {/* Password (only for new employees) */}
            {!isEdit && (
              <div className="space-y-1.5">
                <label
                  className="text-sm font-medium text-gray-700"
                  htmlFor="password"
                >
                  Password
                </label>
                <input
                  className={`w-full px-3.5 py-2.5 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 ${
                    errors.password ? "border-red-400" : "border-gray-200"
                  }`}
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-0.5">
                    {errors.password}
                  </p>
                )}
              </div>
            )}

            {/* Role */}
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="role"
              >
                Role
              </label>
              <select
                className={`w-full px-3.5 py-2.5 border rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-200 bg-gray-50/50 ${
                  errors.role ? "border-red-400" : "border-gray-200"
                }`}
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="cashier">Cashier</option>
              </select>
              {errors.role && (
                <p className="text-xs text-red-500 mt-0.5">{errors.role}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEdit
                  ? "Update Employee"
                  : "Register Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
