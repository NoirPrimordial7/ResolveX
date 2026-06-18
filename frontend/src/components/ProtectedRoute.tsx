import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

function defaultRouteForRole(role: UserRole) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "support_agent") return "/agent/dashboard";
  return "/customer/dashboard";
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink text-neutral-300">
        Loading ResolveX...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={defaultRouteForRole(user.role)} replace />;
  }

  return <>{children}</>;
}
