import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  Calendar,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  ChevronRight,
  DollarSign,
  BarChart3,
  Activity,
  UserCheck,
  CreditCard,
  Receipt,
  Award,
  ShoppingBag,
  Plus,
  Eye,
  Download,
} from "lucide-react";
import { getProducts, getShopProducts, getShopProduct } from "../api/product";
import { getSales, getShopSales, getShopSale } from "../api/sale";
import { getUsers } from "../api/user";
import { deleteShop } from "../api/shop";

export default function ShopDetails({ shop, onBack, onEdit, onDelete }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const role = user?.data?.role;
  const isAdmin = role === "admin";
  const shopId = useSelector((state) => state.shop.shopId);
  console.log(shopId);

  const fetchShopData = async () => {
    try {
      setLoading(true);
      const shopData = await getProducts(shopId);
      setProducts(shopData.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const employees = await getUsers(shopId);
      setEmployees(employees.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchShopSales = async () => {
    try {
      setLoading(true);
      const sales = await getSales(shopId);
      setSales(sales.data.data);
      console.log("sales Data", sales);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await getProducts(shopId);

      setProducts(data.data.data);
      console.log(products);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    if (shop) {
      fetchProducts();
      fetchShopSales();
      fetchEmployee();
    }
  }, [shop]);

  const handleViewProduct = async (productId) => {
    try {
      const data = await getShopProduct(productId);
      if (data.success) {
        setSelectedProduct(data.data);
      }
    } catch (error) {
      console.error("Fetch product error:", error);
    }
  };

  console.log(products);

  const handleViewSale = async (saleId) => {
    try {
      const data = await getShopSale(saleId);
      if (data.success) {
        setSelectedSale(data.data);
      }
    } catch (error) {
      console.error("Fetch sale error:", error);
    }
  };

  const analytics = useMemo(() => {
    const totalRevenue = sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
    const totalDue = sales
      .filter((s) => s.status === "partial")
      .reduce((sum, s) => sum + (s.dueAmount || 0), 0);
    const paidSales = sales.filter((s) => s.status === "paid");
    const paidRevenue = paidSales.reduce(
      (sum, s) => sum + (s.totalPrice || 0),
      0,
    );
    const unpaidSales = sales.filter((s) => s.status === "unpaid");
    const partialSales = sales.filter((s) => s.status === "partial");

    const salesWithDates = sales.filter((s) => s.createdAt);
    let avgSalePerDay = 0;
    if (salesWithDates.length > 0) {
      const uniqueDates = new Set(
        salesWithDates.map((s) => new Date(s.createdAt).toDateString()),
      );
      const daysWithSales = uniqueDates.size || 1;
      avgSalePerDay = totalRevenue / daysWithSales;
    }

    const totalStockValue = products?.reduce(
      (sum, p) => sum + (p.buyingPrice || 0) * (p.quantity || 0),
      0,
    );

    const potentialProfit = products.reduce(
      (sum, p) => sum + (p.sellingPrice - p.buyingPrice) * (p.quantity || 0),
      0,
    );

    const paidCount = paidSales.length;
    const unpaidCount = unpaidSales.length;
    const partialCount = partialSales.length;

    const uniqueCustomers = new Set(sales.map((s) => s.customerName)).size;

    const today = new Date().toDateString();
    const todaySales = sales.filter(
      (s) => s.createdAt && new Date(s.createdAt).toDateString() === today,
    );
    const todayRevenue = todaySales.reduce(
      (sum, s) => sum + (s.totalPrice || 0),
      0,
    );

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthSales = sales.filter((s) => {
      if (!s.createdAt) return false;
      const date = new Date(s.createdAt);
      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    });
    const monthRevenue = monthSales.reduce(
      (sum, s) => sum + (s.totalPrice || 0),
      0,
    );

    return {
      totalRevenue,
      totalDue,
      paidRevenue,
      paidCount,
      unpaidCount,
      partialCount,
      avgSalePerDay,
      totalStockValue,
      potentialProfit,
      uniqueCustomers,
      todaySales: todaySales.length,
      todayRevenue,
      monthSales: monthSales.length,
      monthRevenue,
      totalProducts: products.length,
      totalEmployees: employees.length,
      totalSales: sales.length,
      inStockProducts: products.filter((p) => p.quantity > 0).length,
      outOfStockProducts: products.filter((p) => p.quantity === 0).length,
    };
  }, [sales, products, employees]);

  const getCategoryColor = (category) => {
    const colors = {
      retail: "from-green-500 to-emerald-500",
      wholesale: "from-blue-500 to-indigo-500",
      grocery: "from-orange-500 to-amber-500",
      clothing: "from-pink-500 to-rose-500",
      electronics: "from-cyan-500 to-blue-500",
      restaurant: "from-red-500 to-rose-500",
      pharmacy: "from-teal-500 to-emerald-500",
    };
    return colors[category?.toLowerCase()] || "from-purple-500 to-violet-500";
  };

  const getCategoryBadgeColor = (category) => {
    const colors = {
      retail:
        "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
      wholesale:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
      grocery:
        "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
      clothing:
        "bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800",
      electronics:
        "bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800",
      restaurant:
        "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
      pharmacy:
        "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800",
    };
    return (
      colors[category?.toLowerCase()] ||
      "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800"
    );
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
      unpaid:
        "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
      partial:
        "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
    );
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "products", label: "Products", icon: Package },
    { key: "sales", label: "Sales", icon: ShoppingCart },
    { key: "employees", label: "Employees", icon: Users },
  ];

  return (
    <section>
      {/* Back button & header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border flex items-center justify-center text-gray-500 dark:text-dark-text-secondary hover:bg-gray-50 dark:hover:bg-dark-hover hover:text-gray-700 dark:hover:text-dark-text transition-all shadow-sm"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCategoryColor(shop.category)} flex items-center justify-center shadow-sm`}
              >
                <Store size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">
                  {shop.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-0.5">
                  Shop Details & Analytics
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(shop)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm"
          >
            <Edit size={15} />
            <span>Edit</span>
          </button>
          <button
            // onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-800 transition-all shadow-sm"
          >
            <Trash2 size={15} />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Shop Info Banner */}
      <div className="relative overflow-hidden bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm mb-6">
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${getCategoryColor(shop.category)}`}
        />
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-hover">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                <MapPin
                  size={18}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400 dark:text-dark-text-secondary uppercase tracking-wider">
                  Address
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-dark-text mt-0.5">
                  {shop.address || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-hover">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                <Phone
                  size={18}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400 dark:text-dark-text-secondary uppercase tracking-wider">
                  Phone
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-dark-text mt-0.5">
                  {shop.phone || shop.contact || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-hover">
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                <Mail
                  size={18}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400 dark:text-dark-text-secondary uppercase tracking-wider">
                  Email
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-dark-text mt-0.5">
                  {shop.email || "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-hover">
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
                <Calendar
                  size={18}
                  className="text-amber-600 dark:text-amber-400"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400 dark:text-dark-text-secondary uppercase tracking-wider">
                  Created
                </p>
                <p className="text-sm font-medium text-gray-700 dark:text-dark-text mt-0.5">
                  {shop.createdAt
                    ? new Date(shop.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <span
              className={`inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full border ${getCategoryBadgeColor(shop.category)}`}
            >
              <Store size={12} className="mr-1.5" />
              {shop.type || shop.category || "General"}
            </span>
            <span className="inline-flex items-center text-xs text-gray-400 dark:text-dark-text-secondary">
              <Clock size={12} className="mr-1" />
              Last updated:{" "}
              {shop.updatedAt
                ? new Date(shop.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Revenue",
            value: `BDT. ${analytics.totalRevenue.toFixed(2)}`,
            icon: DollarSign,
            color: "from-emerald-500 to-emerald-600",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
          },
          {
            label: "Total Sales",
            value: analytics.totalSales,
            icon: Receipt,
            color: "from-blue-500 to-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20",
          },
          {
            label: "Due Amount",
            value: `BDT. ${analytics.totalDue.toFixed(2)}`,
            icon: CreditCard,
            color: "from-amber-500 to-orange-500",
            bg: "bg-amber-50 dark:bg-amber-900/20",
          },
          {
            label: "Avg Sale/Day",
            value: `BDT. ${analytics.avgSalePerDay.toFixed(2)}`,
            icon: TrendingUp,
            color: "from-violet-500 to-violet-600",
            bg: "bg-violet-50 dark:bg-violet-900/20",
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`flex items-center gap-3 ${item.bg} rounded-xl p-4 border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5`}
            >
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}
              >
                <Icon size={22} className="text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                  {item.label}
                </p>
                <p className="text-base font-bold text-gray-800 dark:text-dark-text truncate">
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Today's Sales",
            value: analytics.todaySales,
            subValue: `BDT. ${analytics.todayRevenue.toFixed(2)}`,
            icon: ShoppingCart,
            color: "from-cyan-500 to-cyan-600",
          },
          {
            label: "This Month",
            value: analytics.monthSales,
            subValue: `BDT. ${analytics.monthRevenue.toFixed(2)}`,
            icon: Calendar,
            color: "from-indigo-500 to-indigo-600",
          },
          {
            label: "Unique Customers",
            value: analytics.uniqueCustomers,
            icon: Users,
            color: "from-pink-500 to-pink-600",
          },
          {
            label: "Total Products",
            value: analytics.totalProducts,
            subValue: `${analytics.inStockProducts} in stock`,
            icon: Package,
            color: "from-teal-500 to-teal-600",
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
                <p className="text-lg font-bold text-gray-800 dark:text-dark-text">
                  {item.value}
                </p>
                {item.subValue && (
                  <p className="text-xs text-gray-500 dark:text-dark-text-secondary truncate">
                    {item.subValue}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tertiary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Stock Value",
            value: `BDT. ${analytics.totalStockValue.toFixed(2)}`,
            icon: ShoppingBag,
            color: "from-green-500 to-green-600",
          },
          {
            label: "Potential Profit",
            value: `BDT. ${analytics.potentialProfit.toFixed(2)}`,
            icon: TrendingUp,
            color: "from-emerald-500 to-emerald-600",
          },
          {
            label: "Paid Revenue",
            value: `BDT. ${analytics.paidRevenue.toFixed(2)}`,
            subValue: `${analytics.paidCount} sales`,
            icon: Award,
            color: "from-blue-600 to-blue-700",
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
                <p className="text-base font-bold text-gray-800 dark:text-dark-text truncate">
                  {item.value}
                </p>
                {item.subValue && (
                  <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                    {item.subValue}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sales Status Breakdown */}
      <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border shadow-sm mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
              Sales Status Breakdown
            </h3>
            <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
              Payment status overview
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Paid Sales
              </p>
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                {analytics.paidCount}
              </p>
            </div>
            <Receipt size={28} className="text-emerald-500" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div>
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                Unpaid Sales
              </p>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {analytics.unpaidCount}
              </p>
            </div>
            <Receipt size={28} className="text-amber-500" />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Partial Payments
              </p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {analytics.partialCount}
              </p>
            </div>
            <Receipt size={28} className="text-blue-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white dark:bg-dark-card p-1.5 rounded-xl border border-gray-100 dark:border-dark-border shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md shadow-blue-500/20"
                  : "text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-hover"
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-16 text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-50"></div>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Store size={28} className="text-white" />
            </div>
          </div>
          <p className="text-gray-500 dark:text-dark-text-secondary font-medium">
            Loading shop data...
          </p>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                    <Activity size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
                      Quick Stats
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
                      Performance overview
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      label: "Total Employees",
                      value: analytics.totalEmployees,
                      icon: UserCheck,
                      color: "from-purple-500 to-violet-500",
                      bg: "bg-purple-100 dark:bg-purple-900/50",
                      iconColor: "text-purple-600 dark:text-purple-400",
                    },
                    {
                      label: "Active Products",
                      value: analytics.inStockProducts,
                      icon: Package,
                      color: "from-emerald-500 to-emerald-600",
                      bg: "bg-emerald-100 dark:bg-emerald-900/50",
                      iconColor: "text-emerald-600 dark:text-emerald-400",
                    },
                    {
                      label: "Pending Payments",
                      value: analytics.partialCount + analytics.unpaidCount,
                      icon: CreditCard,
                      color: "from-amber-500 to-orange-500",
                      bg: "bg-amber-100 dark:bg-amber-900/50",
                      iconColor: "text-amber-600 dark:text-amber-400",
                    },
                    {
                      label: "Avg Sale Value",
                      value:
                        analytics.totalSales > 0
                          ? `BDT. ${(analytics.totalRevenue / analytics.totalSales).toFixed(2)}`
                          : "BDT. 0.00",
                      icon: TrendingUp,
                      color: "from-cyan-500 to-blue-500",
                      bg: "bg-cyan-100 dark:bg-cyan-900/50",
                      iconColor: "text-cyan-600 dark:text-cyan-400",
                    },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-gray-50 dark:bg-dark-hover hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center`}
                          >
                            <Icon size={16} className={item.iconColor} />
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-dark-text">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-800 dark:text-dark-text">
                          {item.value}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white dark:bg-dark-card rounded-2xl p-6 border border-gray-100 dark:border-dark-border shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                      <ShoppingCart size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
                        Recent Sales
                      </h3>
                      <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
                        Latest transactions
                      </p>
                    </div>
                  </div>
                </div>
                {sales.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart
                      size={32}
                      className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
                    />
                    <p className="text-sm text-gray-400 dark:text-dark-text-secondary">
                      No sales yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sales.slice(0, 5).map((sale) => (
                      <div
                        key={sale._id}
                        className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-hover hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                            <ShoppingCart
                              size={14}
                              className="text-blue-600 dark:text-blue-400"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-700 dark:text-dark-text truncate">
                              {sale.customerName}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
                              {sale.customerPhone}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-sm font-bold text-gray-800 dark:text-dark-text">
                            BDT. {sale.totalPrice?.toFixed(2)}
                          </p>
                          <span
                            className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${getStatusColor(sale.status)}`}
                          >
                            {sale.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
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
                      <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-white/90">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center">
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
                      products.map((product) => (
                        <tr
                          key={product._id}
                          className="hover:bg-emerald-50/40 dark:hover:bg-emerald-900/20 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/50 dark:to-emerald-800/50 flex items-center justify-center">
                                <Package
                                  size={14}
                                  className="text-emerald-600 dark:text-emerald-400"
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-800 dark:text-dark-text">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600 dark:text-dark-text">
                            {product.sku || "N/A"}
                          </td>
                          <td className="p-4 text-sm text-gray-600 dark:text-dark-text font-medium">
                            BDT. {product.buyingPrice?.toFixed(2)}
                          </td>
                          <td className="p-4 text-sm text-gray-800 dark:text-dark-text font-semibold">
                            BDT. {product.sellingPrice?.toFixed(2)}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                product.quantity === 0
                                  ? "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                                  : product.quantity <= 10
                                    ? "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                                    : "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                              }`}
                            >
                              {product.quantity === 0
                                ? "Out of Stock"
                                : `${product.quantity} units`}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-gray-600 dark:text-dark-text capitalize">
                              {product.status || "in-stock"}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleViewProduct(product._id)}
                                className="p-2 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
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
            </div>
          )}

          {/* Sales Tab */}
          {activeTab === "sales" && (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
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
                    {sales.length === 0 ? (
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
                      sales.map((sale) => (
                        <tr
                          key={sale._id}
                          className="hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <td className="p-4">
                            <span className="text-sm font-semibold text-gray-800 dark:text-dark-text">
                              {sale.customerName}
                            </span>
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
                                onClick={() => handleViewSale(sale._id)}
                                className="p-2 rounded-lg text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
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
            </div>
          )}

          {/* Employees Tab */}
          {activeTab === "employees" && (
            <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-purple-600 to-violet-500">
                      <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                        Employee
                      </th>
                      <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                        Email
                      </th>
                      <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                        Role
                      </th>
                      <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-white/90">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                    {employees.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-12 text-center">
                          <Users
                            size={28}
                            className="mx-auto text-gray-300 dark:text-gray-600 mb-2"
                          />
                          <p className="text-gray-500 dark:text-dark-text-secondary font-medium">
                            No employees found
                          </p>
                        </td>
                      </tr>
                    ) : (
                      employees.map((emp) => (
                        <tr
                          key={emp._id}
                          className="hover:bg-purple-50/40 dark:hover:bg-purple-900/20 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-100 to-violet-200 dark:from-purple-900/50 dark:to-violet-800/50 flex items-center justify-center">
                                <UserCheck
                                  size={14}
                                  className="text-purple-600 dark:text-purple-400"
                                />
                              </div>
                              <span className="text-sm font-semibold text-gray-800 dark:text-dark-text">
                                {emp.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-gray-600 dark:text-dark-text">
                            {emp.email}
                          </td>
                          <td className="p-4">
                            <span className="text-sm font-medium text-gray-700 dark:text-dark-text capitalize">
                              {emp.role}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${
                                emp.status === "Active" || !emp.status
                                  ? "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                                  : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"
                              }`}
                            >
                              {emp.status || "Active"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Product Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Product Name</p>
                <p className="text-sm font-medium text-gray-800">
                  {selectedProduct.name}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Buying Price</p>
                  <p className="text-sm font-medium text-gray-800">
                    BDT. {selectedProduct.buyingPrice?.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Selling Price</p>
                  <p className="text-sm font-medium text-gray-800">
                    BDT. {selectedProduct.sellingPrice?.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">SKU</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedProduct.sku || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Quantity</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedProduct.quantity} units
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Company</p>
                <p className="text-sm font-medium text-gray-800">
                  {selectedProduct.company || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      {selectedSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedSale(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedSale(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Sale Details
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400">Customer Name</p>
                <p className="text-sm font-medium text-gray-800">
                  {selectedSale.customerName}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedSale.customerPhone}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total Price</p>
                  <p className="text-sm font-medium text-gray-800">
                    BDT. {selectedSale.totalPrice?.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Status</p>
                  <span
                    className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(selectedSale.status)}`}
                  >
                    {selectedSale.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Due Amount</p>
                  <p className="text-sm font-medium text-gray-800">
                    BDT. {selectedSale.dueAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
              {selectedSale.customerAddress && (
                <div>
                  <p className="text-xs text-gray-400">Address</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedSale.customerAddress}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
