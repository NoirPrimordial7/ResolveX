import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTickets from "./pages/AdminTickets";
import CreateTicket from "./pages/CreateTicket";
import CustomerDashboard from "./pages/CustomerDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TicketDetails from "./pages/TicketDetails";

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 text-sm text-neutral-600 transition-colors dark:bg-neutral-950 dark:text-neutral-400">
        Loading ResolveX...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
}

function ShellRoute({ children, roles }: { children: React.ReactNode; roles?: Array<"customer" | "admin"> }) {
  return (
    <ProtectedRoute roles={roles}>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ShellRoute roles={["customer"]}>
                  <CustomerDashboard />
                </ShellRoute>
              }
            />
            <Route
              path="/tickets/new"
              element={
                <ShellRoute roles={["customer"]}>
                  <CreateTicket />
                </ShellRoute>
              }
            />
            <Route
              path="/tickets/:ticketId"
              element={
                <ShellRoute>
                  <TicketDetails />
                </ShellRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ShellRoute roles={["admin"]}>
                  <AdminDashboard />
                </ShellRoute>
              }
            />
            <Route
              path="/admin/tickets"
              element={
                <ShellRoute roles={["admin"]}>
                  <AdminTickets />
                </ShellRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
