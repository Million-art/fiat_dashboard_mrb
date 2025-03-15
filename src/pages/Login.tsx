import React from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { useAuth } from "../context/AuthContext";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading } = useAuth();

  const handleLoginSuccess = (userRole: "admin" | "ambassador" | "superadmin", userId: string) => {
    let path = "";

    switch (userRole) {
      case "admin":
        path = "/admin-dashboard";
        break;
      case "ambassador":
        path = "/ambassador-dashboard";
        break;
      case "superadmin":
        path = "/superadmin-dashboard";
        break;
      default:
        path = "/login"; 
    }

    navigate(`${path}?userId=${userId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default LoginPage;