import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { UserRole } from "@workspace/api-client-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    } else if (!isLoading && isAuthenticated && allowedRoles && user) {
      if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role
        if (user.role === "admin") setLocation("/admin");
        else if (user.role === "doctor") setLocation("/doctor/dashboard");
        else setLocation("/dashboard");
      }
    }
  }, [isAuthenticated, isLoading, user, allowedRoles, setLocation]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
