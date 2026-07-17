import { useState, useEffect } from "react";
import { X, Search, Plus, Trash2 } from "lucide-react";
import { createSale, createShopSale } from "../../api/sale";
import { getProducts, getShopProducts } from "../../api/product";
import { useSelector } from "react-redux";

export default function SalesForm({ setShowForm, onSuccess }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState("flat");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const user = useSelector((state) => state.auth.user);
  const role = user?.data?.role;
  const isAdmin = role === "admin";

  const fetchProducts = async () => {
    try {
      const data = isAdmin ? await getProducts() : await getShopProducts();
      setAvailableProducts(data?.data || []);
    } catch (error) {
      console.error("Fetch products error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = availableProducts.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const addItem = (product) => {
    const existing = items.find((item) => item._id === product._id);
    if (existing) {
      setItems(
        items.map((item) =>
          item._id === product._id
            ? {
                ...item,
                qty: item.qty + 1,
                total: (item.qty + 1) * item.sellingPrice,
              }
            : item,
        ),
      );
    } else {
      setItems([
        ...items,
        {
          _id: product._id,
          name: product.name,
          price: product.sellingPrice,
          qty: 1,
          total: product.sellingPrice,
        },
      ]);
    }
    setSearchTerm("");
  };

  const updateQty = (id, qty) => {
    if (qty < 1) {
      removeItem(id);
      return;
    }
    setItems(
      items.map((item) =>
        item._id === id ? { ...item, qty, total: qty * item.price } : item,
      ),
    );
  };

  const removeItem = (id) => {
    setItems(items.filter((item) => item._id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const discountAmount =
    discountType === "percent" ? (subtotal * discount) / 100 : discount;
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setApiError("");

    try {
      const form = e.target;
      const saleData = {
        productId: items[0]._id,
        customerName: form.customer.value,
        customerPhone: form.phone.value,
        customerAddress: form.address.value,
        totalPrice: grandTotal,
        status: "paid",
        dueAmount: 0,
      };

      // Use admin route or shop route based on role
      if (isAdmin) {
        await createSale(saleData);
      } else {
        await createShopSale(saleData);
      }

      if (onSuccess) onSuccess();
      setShowForm(false);
    } catch (error) {
      console.error("Sale form error:", error);
      setApiError(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => setShowForm(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-800">New Sale</h2>

        <form onSubmit={handleSubmit}>
          {apiError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {apiError}
            </div>
          )}

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="customer"
              >
                Customer Name
              </label>
              <input
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                id="customer"
                name="customer"
                type="text"
                placeholder="Customer Name"
                required
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
                type="tel"
                placeholder="Customer Phone"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="date"
              >
                Date
              </label>
              <input
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                id="date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="md:col-span-2 space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="address"
              >
                Address
              </label>
              <input
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                id="address"
                name="address"
                type="text"
                placeholder="Customer Address"
              />
            </div>
            <div className="space-y-1.5">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="discount"
              >
                Discount (optional)
              </label>
              <div className="flex">
                <input
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-l-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                  id="discount"
                  name="discount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                />
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value)}
                  className="px-3 py-2.5 border border-l-0 border-gray-200 rounded-r-lg text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200"
                >
                  <option value="flat">BDT</option>
                  <option value="percent">%</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Search */}
          <div className="mb-4 relative">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Add Products
            </label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                className="w-full px-3.5 py-2.5 pl-10 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && filteredProducts.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1.5 max-h-48 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                    onClick={() => addItem(product)}
                  >
                    <div>
                      <span className="font-medium text-gray-800">
                        {product.name}
                      </span>
                      <span className="text-gray-400 text-sm ml-2">
                        Stock: {product.quantity}
                      </span>
                    </div>
                    <span className="text-blue-600 font-medium">
                      BDT {product.sellingPrice}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {searchTerm && filteredProducts.length === 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1.5 p-4 text-gray-500 text-center">
                No products found
              </div>
            )}
          </div>

          {/* Items Table */}
          {items.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                  <tr>
                    <th className="p-3.5 text-left text-sm font-semibold text-gray-700">
                      Product
                    </th>
                    <th className="p-3.5 text-center text-sm font-semibold text-gray-700">
                      Qty
                    </th>
                    <th className="p-3.5 text-right text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="p-3.5 text-right text-sm font-semibold text-gray-700">
                      Total
                    </th>
                    <th className="p-3.5 text-center text-sm font-semibold text-gray-700"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item._id}
                      className="border-t border-gray-100 hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="p-3.5 font-medium text-gray-800">
                        {item.name}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQty(item._id, item.qty - 1)}
                            className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 transition-colors font-medium"
                          >
                            -
                          </button>
                          <span className="px-3 py-1.5 text-gray-800 min-w-[40px] text-center font-medium bg-white">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQty(item._id, item.qty + 1)}
                            className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 transition-colors font-medium"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5 text-right text-gray-700">
                        BDT {item.price}
                      </td>
                      <td className="p-3.5 text-right text-gray-700 font-medium">
                        BDT {item.total}
                      </td>
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeItem(item._id)}
                          className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 transition-colors flex items-center justify-center"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 bg-gray-50/50">
                    <td
                      colSpan={3}
                      className="p-3.5 text-right font-medium text-gray-700"
                    >
                      Subtotal:
                    </td>
                    <td className="p-3.5 text-right text-gray-700">
                      BDT {subtotal}
                    </td>
                    <td></td>
                  </tr>
                  {discountAmount > 0 && (
                    <tr className="bg-gray-50/50">
                      <td
                        colSpan={3}
                        className="p-3.5 text-right font-medium text-emerald-700"
                      >
                        Discount:
                      </td>
                      <td className="p-3.5 text-right text-emerald-600">
                        - BDT {discountAmount.toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <td
                      colSpan={3}
                      className="p-3.5 text-right font-bold text-gray-800"
                    >
                      Grand Total:
                    </td>
                    <td className="p-3.5 text-right font-bold text-blue-600 text-lg">
                      BDT {grandTotal.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {items.length === 0 && (
            <div className="mb-6 p-8 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/30">
              <Plus size={40} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">
                Search and add products to create a sale
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
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
              disabled={items.length === 0 || loading}
            >
              {loading ? "Processing..." : "Complete Sale"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
