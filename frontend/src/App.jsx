import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";

// ✅ التحميل البطيء للصفحات
const Home = lazy(() => import("./pages/Home"));
const Games = lazy(() => import("./pages/Games"));
const Sports = lazy(() => import("./pages/Sports"));
const Betting = lazy(() => import("./pages/Betting"));
const BettingPage = lazy(() => import("./pages/BettingPage"));
const DepositWithdraw = lazy(() => import("./pages/DepositWithdraw"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const MyProfile = lazy(() => import("./pages/MyProfile"));
const AdminWalletDashboard = lazy(() => import("./pages/AdminWalletDashboard"));
const GameDetails = lazy(() => import("./pages/GameDetails"));
const LiveEvents = lazy(() => import("./pages/LiveEvents"));
const TransactionHistory = lazy(() => import("./pages/TransactionHistory"));
const NotFound = lazy(() => import("./pages/NotFound"));

// ✅ المكونات
const Navbar = lazy(() => import("./components/Navbar"));
const ProtectedRoute = lazy(() => import("./components/ProtectedRoute"));
const AdminRoute = lazy(() => import("./components/AdminRoute"));
const LoadingSpinner = lazy(() => import("./components/LoadingSpinner"));

// ✅ السياق
import { AuthProvider } from "./context/AuthContext";
import { BalanceProvider } from "./context/BalanceContext";
import { ThemeProvider } from "./context/ThemeContext";

// إنشاء عميل React Query مع إعدادات متقدمة
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error.response?.status === 404) return false;
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <BalanceProvider>
              <Router>
                <Layout>
                  <Suspense fallback={<LoadingSpinner fullScreen message="جاري تحميل التطبيق..." />}>
                    <Navbar />
                    <Routes>
                      {/* الصفحات العامة */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/games/:gameId" element={<GameDetails />} />
                      <Route path="/404" element={<NotFound />} />

                      {/* الصفحات المحمية */}
                      <Route element={<ProtectedRoute />}>
                        <Route index element={<Home />} />
                        <Route path="/games" element={<Games />} />
                        <Route path="/live" element={<LiveEvents />} />
                        <Route path="/sports" element={<Sports />} />
                        <Route path="/bet/:eventId" element={<Betting />} />
                        <Route path="/league/:leagueId" element={<BettingPage />} />
                        <Route path="/wallet" element={<DepositWithdraw />} />
                        <Route path="/transactions" element={<TransactionHistory />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/my-profile" element={<MyProfile />} />
                      </Route>

                      {/* الصفحات الإدارية */}
                      <Route
                        path="/admin/*"
                        element={
                          <AdminRoute>
                            <Routes>
                              <Route path="wallet" element={<AdminWalletDashboard />} />
                              <Route path="*" element={<Navigate to="/admin/wallet" replace />} />
                            </Routes>
                          </AdminRoute>
                        }
                      />

                      {/* إعادة التوجيه */}
                      <Route path="/home" element={<Navigate to="/" replace />} />
                      <Route path="*" element={<Navigate to="/404" replace />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </Router>
            </BalanceProvider>
          </AuthProvider>
        </ThemeProvider>

        <ToastContainer
          position="top-left"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={true}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          toastClassName="font-sans"
        />
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
        )}
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;