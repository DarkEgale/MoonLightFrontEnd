import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Store,
  MapPin,
  Phone,
  Mail,
  Clock,
  ChevronRight,
} from "lucide-react";
import ShopForm from "../components/forms/shopForm";
import ShopDetails from "../components/shopDetails";
import { getShops } from "../api/shop";
import { useSelector, useDispatch } from "react-redux";
import { setShopId } from "../features/auth/shopslice";

export default function Shops() {
  const [showForm, setShowForm] = useState(false);
  const [shops, setShops] = useState([]);
  const [editingShop, setEditingShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState(null);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const fetchShops = async () => {
    setLoading(true);
    try {
      const userId = user?.data?._id || user?.data?.user?._id || user?._id;
      if (userId) {
        const data = await getShops(userId);
        setShops(data?.data || data?.shops || []);
      }
    } catch (error) {
      console.error("Fetch shops error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleViewDetails = (shop) => {
    setSelectedShop(shop);
    dispatch(setShopId(shop._id));
  };
  const handleEdit = (shop) => {
    setEditingShop(shop);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingShop(null);
    setShowForm(true);
  };

  const handleSuccess = () => {
    fetchShops();
  };

  const handleBack = () => {
    setSelectedShop(null);
    fetchShops();
  };

  const handleDelete = () => {
    setSelectedShop(null);
    fetchShops();
  };

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
      retail: "bg-green-100 text-green-700 border-green-200",
      wholesale: "bg-blue-100 text-blue-700 border-blue-200",
      grocery: "bg-orange-100 text-orange-700 border-orange-200",
      clothing: "bg-pink-100 text-pink-700 border-pink-200",
      electronics: "bg-cyan-100 text-cyan-700 border-cyan-200",
      restaurant: "bg-red-100 text-red-700 border-red-200",
      pharmacy: "bg-teal-100 text-teal-700 border-teal-200",
    };
    return (
      colors[category?.toLowerCase()] ||
      "bg-purple-100 text-purple-700 border-purple-200"
    );
  };

  // Show ShopDetails when a shop is selected
  if (selectedShop) {
    return (
      <ShopDetails
        shop={selectedShop}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <section>
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">
                Shops
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-0.5">
                Manage your shop locations
              </p>
            </div>
          </div>
        </div>
        <button
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-2.5 px-5 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5"
          onClick={handleCreateNew}
        >
          <Plus size={20} />
          <span>Create New Shop</span>
        </button>
      </div>

      {showForm && (
        <ShopForm
          setShowForm={setShowForm}
          shop={editingShop}
          onSuccess={handleSuccess}
        />
      )}

      {/* Loading state */}
      {loading && (
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-16 text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-50"></div>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Store size={28} className="text-white" />
            </div>
          </div>
          <p className="text-gray-500 dark:text-dark-text-secondary font-medium">
            Loading shops...
          </p>
          <p className="text-gray-400 dark:text-dark-text-secondary text-sm mt-1">
            Please wait a moment
          </p>
        </div>
      )}

      {/* Empty state */}
      {!loading && shops.length === 0 && (
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-16 text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
            <Store size={36} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-dark-text mb-2">
            No Shops Yet
          </h3>
          <p className="text-gray-500 dark:text-dark-text-secondary mb-8 max-w-md mx-auto">
            Get started by creating your first shop. You can manage inventory,
            sales, and employees for each shop.
          </p>
          <button
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 hover:-translate-y-0.5"
            onClick={handleCreateNew}
          >
            <Plus size={20} />
            <span>Create Your First Shop</span>
          </button>
        </div>
      )}

      {/* Shops grid */}
      {!loading && shops.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
              Showing{" "}
              <span className="font-semibold text-gray-700 dark:text-dark-text">
                {shops.length}
              </span>{" "}
              shop{shops.length !== 1 ? "s" : ""}
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors shadow-sm">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-dark-text-secondary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 transition-colors shadow-sm">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {shops.map((shop) => (
              <div
                key={shop._id || shop.id}
                className="group relative bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border hover:border-gray-200 dark:hover:border-gray-600 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 overflow-hidden"
              >
                {/* Top gradient accent bar */}
                <div
                  className={`h-2 bg-gradient-to-r ${getCategoryColor(shop.category)}`}
                />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getCategoryColor(shop.category)} flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-500`}
                    >
                      <Store size={24} className="text-white" />
                    </div>
                    <button
                      onClick={() => handleEdit(shop)}
                      className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-all duration-300"
                    >
                      <Pencil size={13} />
                      <span>Edit</span>
                    </button>
                  </div>

                  {/* Shop Name & Status */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-dark-text group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        {shop.name}
                      </h3>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    </div>
                    <span
                      className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${getCategoryBadgeColor(shop.category)}`}
                    >
                      {shop.type || "General"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 mb-5">
                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-dark-hover group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20 transition-colors duration-300">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                        <MapPin
                          size={14}
                          className="text-blue-600 dark:text-blue-400"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400 dark:text-dark-text-secondary uppercase tracking-wider">
                          Address
                        </p>
                        <p className="text-sm text-gray-600 dark:text-dark-text truncate">
                          {shop.address || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-dark-hover group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20 transition-colors duration-300">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                        <Phone
                          size={14}
                          className="text-emerald-600 dark:text-emerald-400"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400 dark:text-dark-text-secondary uppercase tracking-wider">
                          Phone
                        </p>
                        <p className="text-sm text-gray-600 dark:text-dark-text truncate">
                          {shop.phone || shop.contact || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-dark-hover group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/20 transition-colors duration-300">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center flex-shrink-0">
                        <Mail
                          size={14}
                          className="text-purple-600 dark:text-purple-400"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-400 dark:text-dark-text-secondary uppercase tracking-wider">
                          Email
                        </p>
                        <p className="text-sm text-gray-600 dark:text-dark-text truncate">
                          {shop.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-dark-text-secondary">
                      <Clock size={12} />
                      <span>
                        Created{" "}
                        {shop.createdAt
                          ? new Date(shop.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <button
                      onClick={() => handleViewDetails(shop)}
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center gap-1 transition-colors"
                    >
                      View Details
                      <ChevronRight
                        size={14}
                        className="group-hover:translate-x-0.5 transition-transform"
                      />
                    </button>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-blue-50/30 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
