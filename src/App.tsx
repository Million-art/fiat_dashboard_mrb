import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import AmbassadorDashboard from "./pages/AmbassadorDashboard";
import LoginPage from "./pages/Login";
import AmbassadorRegister from "./pages/RegisterAmbasador";
import ForgotPassword from "./pages/ForgotPassword";
import KYCForm from "./components/kyc/KycForm";
import AdminKYCReview from "./pages/AdminKYCReview";
import { useAuth } from "./context/AuthContext";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/ambassador-register" element={<AmbassadorRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* KYC Form Route */}
          <Route
            path="/complete-kyc"
            element={
              <ProtectedRoute requiredRole="ambassador">
                <KYCFormWrapper />
              </ProtectedRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ambassador-dashboard"
            element={
              <ProtectedRoute requiredRole="ambassador">
                <AmbassadorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/kyc-review"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminKYCReview />
              </ProtectedRoute>
            }
          />
          
        <Route
          path="/superadmin-dashboard"
          element={
            <ProtectedRoute requiredRole="superadmin">
              <SuperAdminDashboard />
            </ProtectedRoute>
          }
        />

          {/* Default redirects */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

// Wrapper component to pass ambassadorId to KYCForm
const KYCFormWrapper = () => {
  const { currentUser } = useAuth(); // Use the useAuth hook to get the authenticated user

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <KYCForm ambassadorId={currentUser.uid} />; // Pass the user's UID as ambassadorId
};

export default App;