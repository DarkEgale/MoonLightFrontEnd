import { useState, useEffect } from "react";
import {
  Plus,
  ShoppingCart,
  Search,
  Eye,
  DollarSign,
  Receipt,
  Users,
  TrendingUp,
} from "lucide-react";
import SalesForm from "./forms/salesForm";
import { getSales, getShopSales } from "../api/sale";
import { useSelector } from "react-redux";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 10;

export default function Sales() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const user = useSelector((state) => state.auth.user);
  const role = user?.data?.role;
  const isAdmin = role === "admin";

  const fetchSales = async () => {
    setLoading(true);
    try {
      const data = isAdmin ? await getSales() : await getShopSales();
      setSales(data?.data.data || []);
    } catch (error) {
      console.error("Fetch sales error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleSuccess = () => {
    fetchSales();
  };

  const filteredSales = sales.filter((s) => {
    const matchesSearch = s.customerName
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const getStatusColor = (status) => {
    const colors = {
      paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
      unpaid: "bg-amber-100 text-amber-700 border-amber-200",
      partial: "bg-blue-100 text-blue-700 border-blue-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <ShoppingCart size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">
                Sales
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-0.5">
                Track and manage your sales transactions
              </p>
            </div>
          </div>
        </div>
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2.5 px-5 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          <span>New Sale</span>
        </button>
      </div>

      {showForm && (
        <SalesForm setShowForm={setShowForm} onSuccess={handleSuccess} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Sales",
            value: sales.length,
            color: "from-blue-500 to-blue-600",
            icon: Receipt,
          },
          {
            label: "Total Revenue",
            value: `BDT. ${sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0).toFixed(2)}`,
            color: "from-emerald-500 to-emerald-600",
            icon: DollarSign,
          },
          {
            label: "Customers",
            value: new Set(sales.map((s) => s.customerName)).size,
            color: "from-purple-500 to-violet-500",
            icon: Users,
          },
          {
            label: "Avg. Sale Value",
            value:
              sales.length > 0
                ? `BDT. ${(sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0) / sales.length).toFixed(2)}`
                : "BDT. 0.00",
            color: "from-amber-500 to-orange-500",
            icon: TrendingUp,
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
              <div className="min-w-0">
                <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
                  {item.label}
                </p>
                <p className="text-sm font-bold text-gray-800 dark:text-dark-text truncate">
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
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-600 dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover transition-all shadow-sm"
          >
            <option value="">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
          </select>
          <p className="text-sm text-gray-400 dark:text-dark-text-secondary whitespace-nowrap">
            Showing{" "}
            <span className="font-semibold text-gray-700 dark:text-dark-text">
              {filteredSales.length}
            </span>{" "}
            sales
          </p>
        </div>
      </div>

      {loading && (
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-16 text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-50"></div>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShoppingCart size={28} className="text-white" />
            </div>
          </div>
          <p className="text-gray-500 dark:text-dark-text-secondary font-medium">
            Loading sales...
          </p>
        </div>
      )}

      {!loading && (
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-blue-500">
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                    Customer
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                    Phone
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                    Total
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                    Due
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                    Status
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                    Date
                  </th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-white/90">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center">
                      <ShoppingCart
                        size={28}
                        className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
                      />
                      <p className="text-gray-500 dark:text-dark-text-secondary font-medium">
                        No sales found
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedSales.map((sale) => (
                    <tr
                      key={sale._id}
                      className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center">
                            <ShoppingCart
                              size={16}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-800 dark:text-dark-text">
                            {sale.customerName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-dark-text">
                        {sale.customerPhone}
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-800 dark:text-dark-text">
                        BDT. {sale.totalPrice?.toFixed(2)}
                      </td>
                      <td className="p-4 text-sm font-medium text-amber-600 dark:text-amber-400">
                        {sale.dueAmount > 0
                          ? `BDT. ${sale.dueAmount?.toFixed(2)}`
                          : "—"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(sale.status)}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${sale.status === "paid" ? "bg-emerald-500" : sale.status === "partial" ? "bg-blue-500" : "bg-amber-500"}`}
                          />
                          {sale.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500 dark:text-dark-text-secondary">
                        {sale.createdAt
                          ? new Date(sale.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )
                          : "N/A"}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            className="p-2 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors opacity-0 group-hover:opacity-100"
                            title="View Details"
                          >
                            <Eye size={15} />
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
      )}
    </section>
  );
}
