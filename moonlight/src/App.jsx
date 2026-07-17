import Dashboard from "./pages/dashboard";
import AuthPage from "./pages/auth";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getCurrentUser } from "./api/auth";
import { authCheckComplete } from "./features/auth/authslice";

function AppContent() {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const authChecked = useSelector((state) => state.auth.authChecked);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await getCurrentUser();
        if (data.success) {
          // auth/me returns { data: { user: { ... } } }
          const userData = data.data?.user
            ? { ...data, data: data.data.user }
            : data;
          dispatch(authCheckComplete(userData));
        } else {
          dispatch(authCheckComplete(null));
        }
      } catch {
        dispatch(authCheckComplete(null));
      }
    };
    checkAuth();
  }, [dispatch]);

  // Show nothing while checking auth on page refresh
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
          <p className="text-gray-500 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />}
      />
      <Route
        path="/dashboard"
        element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/login"
        element={
          isLoggedIn ? <Navigate to="/dashboard" replace /> : <AuthPage />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
