import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Spinner } from "@heroui/react";
import { Brand } from "./Brand";
import { useAuth } from "../context/AuthContext";

export function BootScreen() {
  return (
    <div className="app-bg grid min-h-screen place-items-center px-6">
      <div className="flex flex-col items-center gap-5">
        <Brand />
        <Spinner size="sm" color="secondary" label="Opening the console…" />
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { ready, admin } = useAuth();
  const location = useLocation();

  if (!ready) return <BootScreen />;
  if (!admin) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}
