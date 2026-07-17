import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  Search,
  SlidersHorizontal,
  Users,
  Store,
  Phone,
  Eye,
} from "lucide-react";
import EmployeeForm from "../components/forms/employeeForm";
import { getUsers, getShopEmployees, deleteUser } from "../api/user";
import { useSelector } from "react-redux";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 10;

export default function Employees() {
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const user = useSelector((state) => state.auth.user);
  const role = user?.data?.role;
  const isAdmin = role === "admin";

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = isAdmin ? await getUsers() : await getShopEmployees();
      setEmployees(data?.data || []);
    } catch (error) {
      console.error("Fetch employees error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleCreateNew = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleSuccess = () => {
    fetchEmployees();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;
    try {
      await deleteUser(id);
      fetchEmployees();
    } catch (error) {
      console.error("Delete employee error:", error);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-sm">
              <UserCheck size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">
                Employees
              </h2>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-0.5">
                Manage your employee records
              </p>
            </div>
          </div>
        </div>
        <button
          className="bg-gradient-to-r from-purple-600 to-violet-500 hover:from-purple-700 hover:to-violet-600 text-white font-medium py-2.5 px-5 rounded-xl inline-flex items-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-0.5"
          onClick={handleCreateNew}
        >
          <Plus size={20} />
          <span>Register Employee</span>
        </button>
      </div>

      {showForm && (
        <EmployeeForm
          setShowForm={setShowForm}
          employee={editingEmployee}
          onSuccess={handleSuccess}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Employees",
            value: employees.length,
            color: "from-purple-500 to-violet-500",
            icon: Users,
          },
          {
            label: "Active",
            value: employees.filter((e) => e.status === "Active" || !e.status)
              .length,
            color: "from-emerald-500 to-emerald-600",
            icon: UserCheck,
          },
          {
            label: "Roles",
            value: new Set(employees.map((e) => e.role)).size,
            color: "from-blue-500 to-blue-600",
            icon: Store,
          },
          {
            label: "Admins",
            value: employees.filter(
              (e) => e.role === "admin" || e.role === "owner",
            ).length,
            color: "from-amber-500 to-orange-500",
            icon: Users,
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

      <div className="flex items-center justify-between mb-5">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm text-gray-700 dark:text-dark-text placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition-all duration-200 shadow-sm"
          />
        </div>
        <p className="text-sm text-gray-400 dark:text-dark-text-secondary">
          Showing{" "}
          <span className="font-semibold text-gray-700 dark:text-dark-text">
            {filteredEmployees.length}
          </span>{" "}
          employees
        </p>
      </div>

      {loading && (
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border p-16 text-center">
          <div className="relative w-16 h-16 mx-auto mb-5">
            <div className="absolute inset-0 rounded-full bg-purple-100 animate-ping opacity-50"></div>
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <UserCheck size={28} className="text-white" />
            </div>
          </div>
          <p className="text-gray-500 dark:text-dark-text-secondary font-medium">
            Loading employees...
          </p>
        </div>
      )}

      {!loading && (
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-sm border border-gray-100 dark:border-dark-border overflow-hidden hover:shadow-md transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
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
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider text-white/90">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                {filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center">
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
                  paginatedEmployees.map((emp) => (
                    <tr
                      key={emp._id}
                      className="group hover:bg-purple-50/40 dark:hover:bg-purple-900/20 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-100 to-violet-200 dark:from-purple-900/50 dark:to-violet-800/50 flex items-center justify-center">
                            <UserCheck
                              size={16}
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
                          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${emp.status === "Active" || !emp.status ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-red-100 text-red-700 border-red-200"}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${emp.status === "Active" || !emp.status ? "bg-emerald-500" : "bg-red-500"}`}
                          />
                          {emp.status || "Active"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(emp)}
                            className="p-2 rounded-lg text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/50 hover:bg-purple-100 dark:hover:bg-purple-900 transition-colors opacity-0 group-hover:opacity-100"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(emp._id)}
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
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </section>
  );
}
