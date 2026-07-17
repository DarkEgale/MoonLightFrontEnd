import { useState, useEffect } from "react";
import { Plus, Pencil, Package, Search, Trash2 } from "lucide-react";
import ProductsForm from "../components/forms/productsForm";
import {
  deleteProduct,
  getShopProducts,
  deleteShopProduct,
} from "../api/product";
import { useSelector } from "react-redux";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 10;

export default function Products() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const user = useSelector((state) => state.auth.user);
  const role = user?.data?.role;
  const isAdmin = role === "admin";
  const shopId = useSelector((state) => state.shop.shopId);

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const productsData = await getShopProducts();
      setProducts(productsData.data.data || []);
      setTotalPages(
        Math.ceil((productsData.data.data || []).length / ITEMS_PER_PAGE),
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, companyFilter]);

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleSuccess = () => {
    getAllProducts();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;
    try {
      if (isAdmin) {
        await deleteProduct(id);
      } else {
        await deleteShopProduct(id);
      }
      getAllProducts();
    } catch (error) {
      console.error("Delete product error:", error);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCompany =
      !companyFilter ||
      p.company?.toLowerCase() === companyFilter.toLowerCase();
    return matchesSearch && matchesCompany;
  });

  const companies = [
    ...new Set(products.map((p) => p.company).filter(Boolean)),
  ];

  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const getStockColor = (stock) => {
    if (stock === 0) return "bg-red-100 text-red-700 border-red-200";
    if (stock <= 10) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  };

  const getStatusColor = (status) => {
    const colors = {
      "in-stock": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "out-of-stock": "bg-red-100 text-red-700 border-red-200",
      discontinued: "bg-gray-100 text-gray-700 border-gray-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
              <Package size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">
                Products
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-0.5">
                Manage your product inventory
              </p>
            </div>
          </div>
        </div>
        <button
          className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white font-medium py-2.5 px-5 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 hover:-translate-y-0.5"
          onClick={handleCreateNew}
        >
          <Plus size={20} />
          <span>Add Product</span>
        </button>
      </div>

      {showForm && (
        <ProductsForm
          setShowForm={setShowForm}
          product={editingProduct}
          onSuccess={handleSuccess}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Products",
            value: products.length,
            color: "from-emerald-500 to-emerald-600",
            icon: Package,
          },
          {
            label: "In Stock",
            value: products.filter((p) => p.quantity > 0).length,
            color: "from-blue-500 to-blue-600",
            icon: Package,
          },
          {
            label: "Low Stock",
            value: products.filter((p) => p.quantity > 0 && p.quantity <= 10)
              .length,
            color: "from-amber-500 to-amber-600",
            icon: Package,
          },
          {
            label: "Out of Stock",
            value: products.filter((p) => p.quantity === 0).length,
            color: "from-red-500 to-red-600",
            icon: Package,
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

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all duration-200 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-600 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover transition-all shadow-sm"
          >
            <option value="">All Companies</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-400 dark:text-dark-text-secondary whitespace-nowrap">
            Showing{" "}
            <span className="font-semibold text-gray-700 dark:text-dark-text">
              {filteredProducts.length}
            </span>{" "}
            products
          </p>
        </div>
      </div>

      {loading && (
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-16 text-center">
          <div className="animate-spin w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-dark-text-secondary font-medium">
            Loading products...
          </p>
        </div>
      )}

      {!loading && (
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-600 to-emerald-500">
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                    Product
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                    SKU
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                    BP
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                    SP
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                    Stock
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                    Status
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                    Company
                  </th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-white/90">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <Package
                        size={28}
                        className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
                      />
                      <p className="text-gray-500 dark:text-dark-text-secondary font-medium">
                        No products found
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr
                      key={product._id}
                      className="group hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 flex items-center justify-center">
                            <Package
                              size={16}
                              className="text-emerald-600 dark:text-emerald-400"
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-800 dark:text-dark-text">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-gray-100 dark:bg-dark-hover text-gray-700 dark:text-dark-text border-gray-200 dark:border-dark-border">
                          {product.sku || "N/A"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-dark-text font-medium">
                        BDT. {product.buyingPrice?.toFixed(2)}
                      </td>
                      <td className="p-4 text-sm text-gray-800 dark:text-dark-text font-semibold">
                        BDT. {product.sellingPrice?.toFixed(2)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${getStockColor(product.quantity)}`}
                        >
                          {product.quantity === 0
                            ? "Out of Stock"
                            : `${product.quantity} units`}
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(product.status)}`}
                        >
                          {product.status || "in-stock"}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-dark-text">
                        {product.company}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
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
            totalPages={
              Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1
            }
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </section>
  );
}
