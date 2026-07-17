import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import Products from "../components/products";
import Sales from "../components/sales";
import Setting from "../components/setting";
import Shops from "../components/shops";
import Employees from "../components/employees";
import Users from "../components/users";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../features/auth/authslice";
import { logout as logoutApi } from "../api/auth";
import { getShops } from "../api/shop";
import { getProducts, getShopProducts } from "../api/product";
import { getSales, getShopSales } from "../api/sale";
import { getAllUsers, getShopEmployees } from "../api/user";
import {
  DollarSign,
  Package,
  TrendingUp,
  Activity,
  ChevronRight,
  ShoppingCart,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Store,
  Users as UsersIcon,
  CreditCard,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [active, setActive] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const user = useSelector((state) => state.auth.user);
  const role = user?.data?.role;
  const isAdminOrOwner = role === "owner" || role === "admin";

  const handleLogout = async () => {
    try {
      await logoutApi();
      dispatch(logoutAction());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Real data states
  const [shops, setShops] = useState([]);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (isAdminOrOwner) {
          // Admin: fetch all shops, then products & sales per shop, all users
          const shopsRes = await getShops(user?.data?._id || user?._id);
          const allShops = shopsRes?.data || shopsRes?.shops || [];
          setShops(allShops);

          // Fetch all users
          try {
            const usersRes = await getAllUsers();
            setUsers(usersRes?.data || []);
          } catch (err) {
            console.error("Failed to fetch users:", err);
          }

          // Fetch products and sales for each shop
          let allProducts = [];
          let allSales = [];
          for (const shop of allShops) {
            try {
              const prodRes = await getProducts(shop._id || shop.id);
              allProducts = allProducts.concat(prodRes?.data?.data || []);
            } catch {
              // No products for this shop
            }
            try {
              const saleRes = await getSales(shop._id || shop.id);
              allSales = allSales.concat(saleRes?.data?.data || []);
            } catch {
              // No sales for this shop
            }
          }
          setProducts(allProducts);
          setSales(allSales);
        } else {
          // Regular user: fetch their own shop's data
          try {
            const prodRes = await getShopProducts();
            setProducts(prodRes?.data?.data || []);
          } catch (e) {
            console.error("Failed to fetch shop products:", e);
          }
          try {
            const saleRes = await getShopSales();
            setSales(saleRes?.data?.data || []);
          } catch (e) {
            console.error("Failed to fetch shop sales:", e);
          }
          try {
            const empRes = await getShopEmployees();
            setEmployees(empRes?.data || []);
          } catch (e) {
            console.error("Failed to fetch shop employees:", e);
          }
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn, isAdminOrOwner, user]);

  // Compute real stats
  const totalSalesAmount = sales.reduce(
    (sum, s) => sum + (s.totalPrice || 0),
    0,
  );
  const totalRevenue = sales
    .filter((s) => s.status === "paid")
    .reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  const totalProducts = (products || []).length;
  const totalShops = isAdminOrOwner ? shops.length : 1;
  const totalEmployees = isAdminOrOwner
    ? users.filter((u) => u.role === "user").length
    : employees.length;
  // Today's sales
  const todayStr = new Date().toDateString();
  const todaySales = sales.filter((s) => {
    const saleDate = new Date(s.createdAt || s.date).toDateString();
    return saleDate === todayStr;
  });
  const todayRevenue = todaySales
    .filter((s) => s.status === "paid")
    .reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  const todaySalesCount = todaySales.length;

  // Pending orders (unpaid or partial)
  const pendingOrders = sales.filter(
    (s) => s.status === "unpaid" || s.status === "partial",
  ).length;

  // Growth (placeholder calculation - compare this month vs last month)
  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const thisMonthSales = sales.filter((s) => {
    const d = new Date(s.createdAt || s.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  const lastMonthSales = sales.filter((s) => {
    const d = new Date(s.createdAt || s.date);
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastYear = thisMonth === 0 ? thisYear - 1 : thisYear;
    return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
  });
  const thisMonthTotal = thisMonthSales.reduce(
    (sum, s) => sum + (s.totalPrice || 0),
    0,
  );
  const lastMonthTotal = lastMonthSales.reduce(
    (sum, s) => sum + (s.totalPrice || 0),
    0,
  );
  const growthPercent =
    lastMonthTotal > 0
      ? (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(1)
      : thisMonthTotal > 0
        ? 100
        : 0;
  const growthTrendUp = growthPercent >= 0;

  // ---- Chart data computations for Reports ----
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  // Monthly revenue data (last 6 months)
  const monthlyRevenueData = (() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = d.getMonth();
      const year = d.getFullYear();
      const monthSales = sales.filter((s) => {
        const sd = new Date(s.createdAt || s.date);
        return sd.getMonth() === month && sd.getFullYear() === year;
      });
      const total = monthSales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
      const paid = monthSales
        .filter((s) => s.status === "paid")
        .reduce((sum, s) => sum + (s.totalPrice || 0), 0);
      data.push({
        name: `${monthNames[month]} ${year}`,
        revenue: total,
        collected: paid,
      });
    }
    return data;
  })();

  // Top selling products (by total sales amount)
  const topProductsData = (() => {
    const productMap = {};
    sales.forEach((s) => {
      const pid = s.productId?._id || s.productId;
      const pname =
        s.productId?.name ||
        products.find((p) => (p._id || p.id) === pid)?.name ||
        `Product ${pid?.slice(-4) || "N/A"}`;
      if (!productMap[pid]) {
        productMap[pid] = { name: pname, total: 0, count: 0 };
      }
      productMap[pid].total += s.totalPrice || 0;
      productMap[pid].count += 1;
    });
    return Object.values(productMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  })();

  // Top selling shops (by total sales amount)
  const topShopsData = (() => {
    const shopMap = {};
    sales.forEach((s) => {
      const sid = s.shopId?._id || s.shopId;
      const sname =
        s.shopId?.name ||
        shops.find((sh) => (sh._id || sh.id) === sid)?.name ||
        `Shop ${sid?.slice(-4) || "N/A"}`;
      if (!shopMap[sid]) {
        shopMap[sid] = { name: sname, total: 0, count: 0 };
      }
      shopMap[sid].total += s.totalPrice || 0;
      shopMap[sid].count += 1;
    });
    return Object.values(shopMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  })();

  // Sales status distribution for pie chart
  const salesStatusData = (() => {
    const paid = sales.filter((s) => s.status === "paid").length;
    const unpaid = sales.filter((s) => s.status === "unpaid").length;
    const partial = sales.filter((s) => s.status === "partial").length;
    return [
      { name: "Paid", value: paid, color: "#10B981" },
      { name: "Unpaid", value: unpaid, color: "#F59E0B" },
      { name: "Partial", value: partial, color: "#EF4444" },
    ].filter((d) => d.value > 0);
  })();

  // Revenue growth (cumulative) line chart data
  const revenueGrowthData = (() => {
    const sorted = [...sales]
      .filter((s) => s.createdAt || s.date)
      .sort(
        (a, b) =>
          new Date(a.createdAt || a.date) - new Date(b.createdAt || b.date),
      );
    const data = [];
    let cumulative = 0;
    const monthlyMap = {};
    sorted.forEach((s) => {
      const d = new Date(s.createdAt || s.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + (s.totalPrice || 0);
    });
    Object.entries(monthlyMap).forEach(([name, value]) => {
      cumulative += value;
      data.push({ name, amount: cumulative });
    });
    return data.slice(-6); // last 6 entries
  })();

  // Build recent activities from real data
  const buildRecentActivities = () => {
    const activities = [];

    // Add recent sales
    const recentSales = [...sales]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date),
      )
      .slice(0, 3);
    recentSales.forEach((s) => {
      const timeAgo = getTimeAgo(s.createdAt || s.date);
      activities.push({
        icon: ShoppingCart,
        bg: "bg-blue-100",
        iconColor: "text-blue-600",
        title: "New sale recorded",
        subtitle: `Customer: ${s.customerName || "N/A"}`,
        time: timeAgo,
        amount: `+BDT. ${(s.totalPrice || 0).toLocaleString()}`,
        amountColor: "text-emerald-600",
      });
    });

    // Add recent products
    const recentProducts = [...products]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date),
      )
      .slice(0, 2);
    recentProducts.forEach((p) => {
      const timeAgo = getTimeAgo(p.createdAt || p.date);
      activities.push({
        icon: Package,
        bg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        title: "Product added",
        subtitle: p.name || "Unknown",
        time: timeAgo,
        amount: p.status === "in-stock" ? "In Stock" : p.status || "N/A",
        amountColor: "text-blue-600",
      });
    });

    // Add shops if admin
    if (isAdminOrOwner && shops.length > 0) {
      const recentShops = [...shops]
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date),
        )
        .slice(0, 1);
      recentShops.forEach((sh) => {
        const timeAgo = getTimeAgo(sh.createdAt || sh.date);
        activities.push({
          icon: Store,
          bg: "bg-purple-100",
          iconColor: "text-purple-600",
          title: "Shop created",
          subtitle: sh.name || "Unknown",
          time: timeAgo,
          amount: "Active",
          amountColor: "text-emerald-600",
        });
      });
    }

    // Sort all activities by time (most recent first) and limit to 5
    return activities
      .sort((a, b) => {
        const timeOrder = { minutes: 1, hour: 2, hours: 3, day: 4 };
        const aVal = timeOrder[a.time.split(" ")[1]] || 5;
        const bVal = timeOrder[b.time.split(" ")[1]] || 5;
        return aVal - bVal;
      })
      .slice(0, 5);
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return "recently";
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  const statCards = [
    {
      title: "Total Sale",
      value: `BDT. ${totalSalesAmount.toLocaleString()}`,
      icon: DollarSign,
      gradient: "from-blue-600 to-blue-500",
      accent: "from-blue-400 to-blue-500",
      trend: `${growthTrendUp ? "+" : ""}${growthPercent}%`,
      trendUp: growthTrendUp,
      period: "This Month",
    },
    {
      title: "Total Products",
      value: `${totalProducts || 0}`,
      icon: Package,
      gradient: "from-emerald-600 to-emerald-500",
      accent: "from-emerald-400 to-emerald-500",
      trend: `${(totalProducts || 0) > 0 ? "+" : ""}${totalProducts || 0}`,
      trendUp: (totalProducts || 0) > 0,
      period: "All Time",
    },
    {
      title: "Total Revenue",
      value: `BDT. ${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      gradient: "from-violet-600 to-violet-500",
      accent: "from-violet-400 to-violet-500",
      trend: `${totalRevenue > 0 ? "+" : ""}${totalRevenue > 0 ? ((totalRevenue / totalSalesAmount) * 100).toFixed(1) : 0}%`,
      trendUp: totalRevenue > 0,
      period: "Collection Rate",
    },
    {
      title: "Growth",
      value: `${growthPercent}%`,
      icon: Activity,
      gradient: "from-amber-500 to-orange-500",
      accent: "from-amber-400 to-orange-500",
      trend: `${growthTrendUp ? "+" : ""}${growthPercent}%`,
      trendUp: growthTrendUp,
      period: "vs Last Month",
    },
  ];

  const recentActivities = buildRecentActivities();

  // Fallback activities if no real data
  const displayActivities =
    recentActivities.length > 0
      ? recentActivities
      : [
          {
            icon: ShoppingCart,
            bg: "bg-blue-100",
            iconColor: "text-blue-600",
            title: "No sales yet",
            subtitle: "Start recording your first sale",
            time: "—",
            amount: "Get Started",
            amountColor: "text-blue-600",
          },
          {
            icon: Package,
            bg: "bg-emerald-100",
            iconColor: "text-emerald-600",
            title: "No products yet",
            subtitle: "Add your first product",
            time: "—",
            amount: "Add Now",
            amountColor: "text-emerald-600",
          },
        ];

  const quickActions = [
    ...(role == "user"
      ? [
          {
            icon: Package,
            gradient: "from-blue-500 to-blue-600",
            bg: "from-blue-50 to-blue-50/50",
            hoverBg: "from-blue-100 to-blue-100/50",
            border: "border-blue-100",
            title: "Add New Product",
            desc: "Create a new product listing",
            action: "products",
          },
        ]
      : []),
    ...(role == "user"
      ? [
          {
            icon: ShoppingCart,
            gradient: "from-emerald-500 to-emerald-600",
            bg: "from-emerald-50 to-emerald-50/50",
            hoverBg: "from-emerald-100 to-emerald-100/50",
            border: "border-emerald-100",
            title: "Record a Sale",
            desc: "Log a new sales transaction",
            action: "sales",
          },
        ]
      : []),
    {
      icon: BarChart3,
      gradient: "from-violet-500 to-violet-600",
      bg: "from-violet-50 to-violet-50/50",
      hoverBg: "from-violet-100 to-violet-100/50",
      border: "border-violet-100",
      title: "View Reports",
      desc: "Check analytics and insights",
      action: "reports",
    },
    ...(role === "admin"
      ? [
          {
            icon: Store,
            gradient: "from-amber-500 to-orange-500",
            bg: "from-amber-50 to-amber-50/50",
            hoverBg: "from-amber-100 to-amber-100/50",
            border: "border-amber-100",
            title: "Manage Shops",
            desc: "View and edit shop locations",
            action: "shops",
          },
        ]
      : []),
  ];

  const pageTitles = {
    products: "Products",
    sales: "Sales",
    setting: "Settings",
    shops: "Shops",
    employees: "Employees",
    due: "Due Payments",
    reports: "Reports",
    users: "User Management",
  };

  const render = () => {
    switch (active) {
      case "products":
        return <Products />;
      case "sales":
        return <Sales />;
      case "setting":
        return <Setting />;
      case "shops":
        return <Shops />;
      case "employees":
        return <Employees />;
      case "due":
        return (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                    <CreditCard size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">
                      Due Payments
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-0.5">
                      Track and manage pending payments
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-16 text-center hover:shadow-md transition-all duration-300">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-50"></div>
                <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center shadow-inner">
                  <CreditCard size={36} className="text-amber-500" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-dark-text mb-3">
                Due Payments
              </h3>
              <p className="text-gray-500 dark:text-dark-text-secondary mb-8 max-w-md mx-auto">
                This feature is coming soon. You'll be able to track and manage
                all pending payments from your customers.
              </p>
              <div className="flex items-center justify-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-hover rounded-xl text-sm text-gray-500 dark:text-dark-text-secondary">
                  <Clock size={14} />
                  <span>Expected Q3 2026</span>
                </div>
              </div>
            </div>
          </section>
        );
      case "reports": {
        const reportMetrics = [
          {
            label: "Total Revenue",
            value: `BDT. ${totalRevenue.toLocaleString()}`,
            color: "from-violet-500 to-violet-600",
          },
          {
            label: "Total Sales",
            value: sales.length.toString(),
            color: "from-blue-500 to-blue-600",
          },
          {
            label: "Avg Order Value",
            value:
              sales.length > 0
                ? `BDT. ${Math.round(totalSalesAmount / sales.length).toLocaleString()}`
                : "BDT. 0",
            color: "from-emerald-500 to-emerald-600",
          },
          {
            label: "Due Amount",
            value: `BDT. ${sales
              .filter((s) => s.status === "partial")
              .reduce((sum, s) => sum + (s.dueAmount || 0), 0)
              .toLocaleString()}`,
            color: "from-amber-500 to-orange-500",
          },
        ];
        return (
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-sm">
                    <BarChart3 size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">
                      Reports & Analytics
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-0.5">
                      View analytics and business insights
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Report Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {reportMetrics.map((item, i) => {
                const Icon = [DollarSign, ShoppingCart, TrendingUp, CreditCard][
                  i
                ];
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
                      <p className="text-sm font-bold text-gray-800 dark:text-dark-text">
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Monthly Revenue Bar Chart + Sales Status Pie Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-2">
                  Monthly Revenue
                </h3>
                <p className="text-xs text-gray-400 dark:text-dark-text-secondary mb-4">
                  Revenue vs Collected (Last 6 months)
                </p>
                {monthlyRevenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                      />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                        }}
                        formatter={(value) => [
                          `BDT. ${value.toLocaleString()}`,
                          undefined,
                        ]}
                      />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        name="Total Revenue"
                        fill="#8B5CF6"
                        radius={[6, 6, 0, 0]}
                      />
                      <Bar
                        dataKey="collected"
                        name="Collected"
                        fill="#10B981"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-gray-400 dark:text-dark-text-secondary">
                    No revenue data available
                  </div>
                )}
              </div>
              <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-2">
                  Sales Status
                </h3>
                <p className="text-xs text-gray-400 dark:text-dark-text-secondary mb-4">
                  Distribution of sale statuses
                </p>
                {salesStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={salesStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {salesStatusData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [value, "Sales"]} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[280px] text-gray-400 dark:text-dark-text-secondary">
                    No sales data available
                  </div>
                )}
              </div>
            </div>

            {/* Top Selling Products + Top Selling Shops */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-2">
                  Top Selling Products
                </h3>
                <p className="text-xs text-gray-400 dark:text-dark-text-secondary mb-4">
                  By total sales amount
                </p>
                {topProductsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={topProductsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                        }}
                        formatter={(value) => [
                          `BDT. ${value.toLocaleString()}`,
                          "Total",
                        ]}
                      />
                      <Bar
                        dataKey="total"
                        name="Total Sales"
                        fill="#3B82F6"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[260px] text-gray-400 dark:text-dark-text-secondary">
                    No product sales data
                  </div>
                )}
              </div>
              <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-2">
                  Top Selling Shops
                </h3>
                <p className="text-xs text-gray-400 dark:text-dark-text-secondary mb-4">
                  By total sales amount
                </p>
                {topShopsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={topShopsData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        stroke="#9ca3af"
                        width={120}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                        }}
                        formatter={(value) => [
                          `BDT. ${value.toLocaleString()}`,
                          "Total",
                        ]}
                      />
                      <Bar
                        dataKey="total"
                        name="Total Sales"
                        fill="#8B5CF6"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[260px] text-gray-400 dark:text-dark-text-secondary">
                    No shop sales data
                  </div>
                )}
              </div>
            </div>

            {/* Revenue Growth Line Chart */}
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text mb-2">
                Revenue Growth
              </h3>
              <p className="text-xs text-gray-400 dark:text-dark-text-secondary mb-4">
                Cumulative revenue over time
              </p>
              {revenueGrowthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={revenueGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11 }}
                      stroke="#9ca3af"
                    />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                      }}
                      formatter={(value) => [
                        `BDT. ${value.toLocaleString()}`,
                        "Cumulative",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      name="Cumulative Revenue"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ fill: "#8B5CF6", r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[280px] text-gray-400 dark:text-dark-text-secondary">
                  No growth data available
                </div>
              )}
            </div>
          </section>
        );
      }
      case "users":
        return <Users />;

      default:
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text">
                    Dashboard
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-full border border-blue-200 dark:border-blue-800">
                    Overview
                  </span>
                </div>
                <p className="text-gray-500 dark:text-dark-text-secondary text-sm">
                  Welcome back,{" "}
                  <span className="font-semibold text-gray-700 dark:text-dark-text">
                    {user?.data?.name || "User"}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-dark-text-secondary bg-white dark:bg-dark-card px-4 py-2 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm">
                  <Clock size={14} />
                  <span>
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="font-medium text-gray-600 dark:text-dark-text-secondary">
                    Home
                  </span>
                  <ChevronRight size={14} />
                  <span className="text-blue-600 font-medium">Dashboard</span>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <svg
                      className="w-5 h-5 text-white animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-dark-text-secondary font-medium">
                    Loading dashboard data...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={index}
                        className="group relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
                      >
                        <div
                          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`}
                        />
                        <div
                          className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-gradient-to-br ${card.gradient} opacity-5`}
                        />
                        <div
                          className={`absolute bottom-0 left-0 w-24 h-24 -ml-6 -mb-6 rounded-full bg-gradient-to-br ${card.gradient} opacity-5`}
                        />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg shadow-${card.gradient.split(" ")[0].replace("from-", "")}/20 transform group-hover:scale-110 transition-transform duration-500`}
                            >
                              <Icon size={22} className="text-white" />
                            </div>
                            <span className="text-xs font-medium text-gray-400 dark:text-dark-text-secondary bg-gray-100 dark:bg-dark-hover px-3 py-1 rounded-full">
                              {card.period}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
                            {card.title}
                          </p>
                          <div className="flex items-end justify-between mt-1">
                            <p className="text-2xl font-bold text-gray-800 dark:text-dark-text">
                              {card.value}
                            </p>
                            <div
                              className={`flex items-center gap-0.5 text-xs font-semibold ${card.trendUp ? "text-emerald-600" : "text-red-500"}`}
                            >
                              {card.trendUp ? (
                                <ArrowUpRight size={14} />
                              ) : (
                                <ArrowDownRight size={14} />
                              )}
                              {card.trend}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <Clock size={18} className="text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
                            Recent Activity
                          </h3>
                          <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
                            Latest updates from your business
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {displayActivities.map((activity, i) => {
                        const Icon = activity.icon;
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors duration-200 group/item"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg ${activity.bg} dark:opacity-80 flex items-center justify-center`}
                              >
                                <Icon
                                  size={18}
                                  className={activity.iconColor}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-dark-text group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                                  {activity.title}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
                                  {activity.subtitle}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`text-sm font-semibold ${activity.amountColor}`}
                              >
                                {activity.amount}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
                                {activity.time}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-dark-border hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm">
                        <Sparkles size={18} className="text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
                          Quick Actions
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
                          Frequently used tasks
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {quickActions.map((action, i) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={i}
                            className={`w-full flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r ${action.bg} dark:opacity-90 hover:${action.hoverBg} transition-all duration-300 border ${action.border} dark:border-opacity-30 group/btn`}
                            onClick={() => {
                              setActive(action.action);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center shadow-sm group-hover/btn:scale-110 transition-transform duration-300`}
                              >
                                <Icon size={18} className="text-white" />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-medium text-gray-700 dark:text-dark-text group-hover/btn:text-gray-900 transition-colors">
                                  {action.title}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
                                  {action.desc}
                                </p>
                              </div>
                            </div>
                            <ChevronRight
                              size={16}
                              className="text-gray-300 dark:text-gray-600 group-hover/btn:text-gray-500 group-hover/btn:translate-x-0.5 transition-all"
                            />
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-dark-border">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-hover text-center">
                          <p className="text-lg font-bold text-gray-800 dark:text-dark-text">
                            {todaySalesCount}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
                            Today's Sales
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-dark-hover text-center">
                          <p className="text-lg font-bold text-gray-800 dark:text-dark-text">
                            {totalShops}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
                            Active Shops
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Today's Revenue",
                      value: `BDT. ${todayRevenue.toLocaleString()}`,
                      icon: DollarSign,
                      color: "from-blue-500 to-blue-600",
                    },
                    {
                      label: "Pending Orders",
                      value: pendingOrders.toString(),
                      icon: ShoppingCart,
                      color: "from-amber-500 to-orange-500",
                    },
                    {
                      label: "Total Employees",
                      value: totalEmployees.toString(),
                      icon: UsersIcon,
                      color: "from-purple-500 to-violet-500",
                    },
                    {
                      label: "Total Shops",
                      value: totalShops.toString(),
                      icon: Store,
                      color: "from-emerald-500 to-teal-500",
                    },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-4 bg-white dark:bg-dark-card rounded-xl p-4 border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                      >
                        <div
                          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-sm`}
                        >
                          <Icon size={18} className="text-white" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 dark:text-dark-text-secondary">
                            {item.label}
                          </p>
                          <p className="text-sm font-bold text-gray-800 dark:text-dark-text">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors duration-300">
      <Sidebar setactive={setActive} active={active} onLogout={handleLogout} />
      <div className="ml-64 min-h-screen">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center justify-between px-8 py-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text">
              {active ? pageTitles[active] || "Dashboard" : "Dashboard"}
            </h2>
            <div className="flex items-center gap-4">
              {/* <button className="relative w-9 h-9 rounded-full bg-gray-100 dark:bg-dark-hover hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors">
                <svg
                  className="w-5 h-5 text-gray-500 dark:text-dark-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center shadow-sm"></span>
              </button> */}
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user?.data?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          </div>
        </header>
        <div className="p-8">{render()}</div>
      </div>
    </main>
  );
}
