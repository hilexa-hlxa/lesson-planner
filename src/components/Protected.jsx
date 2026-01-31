import React from "react";
import { Navigate } from "react-router-dom";

export default function Protected({ authReady, user, children }) {
  if (!authReady) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  return user ? children : <Navigate to="/" replace />;
}
