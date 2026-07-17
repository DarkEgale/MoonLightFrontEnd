import { useState } from "react";
import { X } from "lucide-react";
import {
  createProduct,
  updateProduct,
  createShopProduct,
  updateShopProduct,
} from "../../api/product";
import { useSelector } from "react-redux";

export default function ProductsForm({ setShowForm, product, onSuccess }) {
  const user = useSelector((state) => state.auth.user);
  const role = user?.data?.role;
  const isAdmin = role === "admin";

  const [formData, setFormData] = useState({
    name: product?.name || "",
    buyingPrice: product?.buyingPrice || "",
    sellingPrice: product?.sellingPrice || "",
    sku: product?.sku || "",
    company: product?.company || "",
    quantity: product?.quantity || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const isEdit = !!product;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.buyingPrice)
      newErrors.buyingPrice = "Buying price is required";
    if (!formData.sellingPrice)
      newErrors.sellingPrice = "Selling price is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";
    if (!formData.company.trim()) newErrors.company = "Company is required";
    if (!formData.quantity) newErrors.quantity = "Quantity is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");
    try {
      const payload = {
        ...formData,
        buyingPrice: Number(formData.buyingPrice),
        sellingPrice: Number(formData.sellingPrice),
        quantity: Number(formData.quantity),
      };

      if (isEdit) {
        if (isAdmin) {
          await updateProduct(product._id, payload);
        } else {
          await updateShopProduct(product._id, payload);
        }
      } else {
        if (isAdmin) {
          await createProduct(payload);
        } else {
          await createShopProduct(payload);
        }
      }
      if (onSuccess) onSuccess();
      setShowForm(false);
    } catch (error) {
      console.error("Product form error:", error);
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
          {isEdit ? "Edit Product" : "Add Product"}
        </h2>

        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {apiError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="name"
              >
                Product Name
              </label>
              <input
                className={`w-full px-3.5 py-2.5 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 ${errors.name ? "border-red-400" : "border-gray-200"}`}
                id="name"
                name="name"
                type="text"
                placeholder="Product Name"
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
                htmlFor="sku"
              >
                SKU
              </label>
              <input
                className={`w-full px-3.5 py-2.5 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 ${errors.sku ? "border-red-400" : "border-gray-200"}`}
                id="sku"
                name="sku"
                type="text"
                placeholder="SKU001"
                value={formData.sku}
                onChange={handleChange}
              />
              {errors.sku && (
                <p className="text-xs text-red-500 mt-0.5">{errors.sku}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="buyingPrice"
              >
                Buying Price
              </label>
              <input
                className={`w-full px-3.5 py-2.5 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 ${errors.buyingPrice ? "border-red-400" : "border-gray-200"}`}
                id="buyingPrice"
                name="buyingPrice"
                type="number"
                placeholder="Buying Price"
                value={formData.buyingPrice}
                onChange={handleChange}
              />
              {errors.buyingPrice && (
                <p className="text-xs text-red-500 mt-0.5">
                  {errors.buyingPrice}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="sellingPrice"
              >
                Selling Price
              </label>
              <input
                className={`w-full px-3.5 py-2.5 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 ${errors.sellingPrice ? "border-red-400" : "border-gray-200"}`}
                id="sellingPrice"
                name="sellingPrice"
                type="number"
                placeholder="Selling Price"
                value={formData.sellingPrice}
                onChange={handleChange}
              />
              {errors.sellingPrice && (
                <p className="text-xs text-red-500 mt-0.5">
                  {errors.sellingPrice}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="company"
              >
                Company
              </label>
              <input
                className={`w-full px-3.5 py-2.5 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 ${errors.company ? "border-red-400" : "border-gray-200"}`}
                id="company"
                name="company"
                type="text"
                placeholder="Company"
                value={formData.company}
                onChange={handleChange}
              />
              {errors.company && (
                <p className="text-xs text-red-500 mt-0.5">{errors.company}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="quantity"
              >
                Quantity
              </label>
              <input
                className={`w-full px-3.5 py-2.5 border rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 ${errors.quantity ? "border-red-400" : "border-gray-200"}`}
                id="quantity"
                name="quantity"
                type="number"
                placeholder="Stock Quantity"
                value={formData.quantity}
                onChange={handleChange}
              />
              {errors.quantity && (
                <p className="text-xs text-red-500 mt-0.5">{errors.quantity}</p>
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
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : isEdit
                  ? "Update Product"
                  : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
