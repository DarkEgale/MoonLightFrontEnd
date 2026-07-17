import { login } from "../api/auth";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { LogIn, Mail, Lock, LayoutDashboard } from "lucide-react";

export default function AuthPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user?.data) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const data = await login(email, password, dispatch);
      if (data.success === true) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Brand */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <LayoutDashboard size={20} className="text-white" />
        </div>
        <span className="text-2xl font-bold text-gray-800">Moonlight</span>
      </div>

      {/* Login Form */}
      <form
        onSubmit={handleLogin}
        className="flex flex-col gap-5 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full max-w-md"
      >
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div>
          {user?.message && (
            <p
              className={`text-sm font-medium text-center mb-4 p-3 rounded-lg ${
                user?.success === false
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }`}
            >
              {user?.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Mail size={14} className="text-gray-400" />
            <span>Email</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Lock size={14} className="text-gray-400" />
            <span>Password</span>
          </label>
          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-gray-50/50"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2.5 rounded-lg text-white font-medium inline-flex items-center justify-center gap-2 transition-all duration-200 ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-md shadow-blue-500/20 hover:shadow-lg"
          }`}
        >
          <LogIn size={18} />
          <span>{loading ? "Logging in..." : "Login"}</span>
        </button>
      </form>
    </div>
  );
}
