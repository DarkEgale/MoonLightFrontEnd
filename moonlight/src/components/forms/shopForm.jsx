import { useState } from "react";
import { X } from "lucide-react";
import { createShop, updateShop } from "../../api/shop";
import { useSelector } from "react-redux";

export default function ShopForm({ setShowForm, shop, onSuccess }) {
  const user = useSelector((state) => state.auth.user);
  const [formData, setFormData] = useState({
    name: shop?.name || "",
    address: shop?.address || "",
    type: shop?.category || shop?.type || "",
    email: shop?.email || "",
    phone: shop?.phone || "",
    userId: shop?.userId || user?.data?._id || user?._id || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const isEdit = !!shop;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Shop name is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.type.trim()) newErrors.type = "Category is required";
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
        await updateShop(shop._id || shop.id, formData);
      } else {
        await createShop(formData);
      }
      if (onSuccess) onSuccess();
      setShowForm(false);
    } catch (error) {
      console.error("Shop form error:", error);
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
          {isEdit ? "Edit Shop" : "Add Shop"}
        </h2>

        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {apiError}
            </div>
          )}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="name"
              >
                Shop Name
              </label>
              <input
                className={`w-full px-3.5 py-2.5 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 ${
                  errors.name ? "border-red-400" : "border-gray-200"
                }`}
                id="name"
                name="name"
                type="text"
                placeholder="Enter shop name"
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="address"
              >
                Address
              </label>
              <textarea
                className={`w-full px-3.5 py-2.5 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 resize-none ${
                  errors.address ? "border-red-400" : "border-gray-200"
                }`}
                id="address"
                name="address"
                placeholder="Enter shop address"
                value={formData.address}
                onChange={handleChange}
                rows={3}
              />
              {errors.address && (
                <p className="text-xs text-red-500 mt-0.5">{errors.address}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="type"
              >
                Category
              </label>
              <input
                className={`w-full px-3.5 py-2.5 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50/50 ${
                  errors.type ? "border-red-400" : "border-gray-200"
                }`}
                id="type"
                name="type"
                type="text"
                placeholder="Enter shop category"
                value={formData.type}
                onChange={handleChange}
              />
              {errors.type && (
                <p className="text-xs text-red-500 mt-0.5">{errors.type}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                id="email"
                name="email"
                type="email"
                placeholder="Enter shop email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="phone"
              >
                Phone
              </label>
              <input
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                id="phone"
                name="phone"
                type="text"
                placeholder="Enter shop phone number"
                value={formData.phone}
                onChange={handleChange}
              />
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
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading ? "Saving..." : isEdit ? "Update Shop" : "Add Shop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
