"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
        return;
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        const redirectPath =
          user?.role === "freelancer"
            ? "/freelancer/dashboard"
            : "/client/dashboard";
        router.push(redirectPath);
        return;
      }
    }
  }, [isAuthenticated, user, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
