import { Navigate } from "react-router";
import type { ReactNode } from "react";
import getUserRoles from "../utils/useHook";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { roles, isAuthenticated } = getUserRoles();

  if (!isAuthenticated) return <Navigate to="/" />;
  if (requiredRole && !roles.includes(requiredRole)) {
    
    return <Navigate to="/dashboard" />; 
  }

  return <>{children}</>;
};

export default ProtectedRoute;
