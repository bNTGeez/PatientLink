import { Navigate } from "react-router";
import type { ReactNode } from "react";
import getUserRoles from "../../utils/useHook";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

// children wraps the component that is protected
const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { roles, isAuthenticated } = getUserRoles();

  if (!isAuthenticated) return <Navigate to="/" />;
  // ex: requiredRole = "doctor" -> if user is not a doctor, redirect to dashboard
  if (requiredRole && !roles.includes(requiredRole)) { 
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
