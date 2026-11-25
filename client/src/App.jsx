import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { BootScreen, ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { DashboardPage } from "./pages/DashboardPage";
import { AudiencePage } from "./pages/AudiencePage";
import { VisitsPage } from "./pages/VisitsPage";
import { UsersPage } from "./pages/UsersPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { ContentPage } from "./pages/ContentPage";
import { PaymentsPage } from "./pages/PaymentsPage";
import { SessionsPage } from "./pages/SessionsPage";
import { SystemPage } from "./pages/SystemPage";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function PublicOnly({ children }) {
  const { ready, admin } = useAuth();
  if (!ready) return <BootScreen />;
  if (admin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="audience" element={<AudiencePage />} />
          <Route path="visits" element={<VisitsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:id" element={<UserDetailPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="sessions" element={<SessionsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="system" element={<SystemPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
