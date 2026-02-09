import React from "react";
import { Navigate } from "react-router-dom";

export function RequireVerified({
  isVerified,
  children,
}: {
  isVerified: boolean;
  children: React.ReactNode;
}) {
  if (!isVerified) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
