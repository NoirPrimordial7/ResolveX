import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import AppShell from "./components/AppShell";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AgentDashboard from "./pages/AgentDashboard";
import AgentTicketDetails from "./pages/AgentTicketDetails";
import AgentTickets from "./pages/AgentTickets";
import AdminAgents from "./pages/AdminAgents";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReassignmentRequests from "./pages/AdminReassignmentRequests";
import AdminTickets from "./pages/AdminTickets";
import CreateTicket from "./pages/CreateTicket";
import CustomerDashboard from "./pages/CustomerDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TicketDetails from "./pages/TicketDetails";
import type { UserRole } from "./types";

function defaultRouteForRole(role: UserRole) {
  if (role === "admin") return "/admin/dashboard";
  if (role === "support_agent") return "/agent/dashboard";
  return "/customer/dashboard";
}

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

  return <Navigate to={defaultRouteForRole(user.role)} replace />;
}

function ShellRoute({ children, roles }: { children: React.ReactNode; roles?: UserRole[] }) {
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
              path="/customer/dashboard"
              element={
                <ShellRoute roles={["customer"]}>
                  <CustomerDashboard />
                </ShellRoute>
              }
            />
            <Route path="/dashboard" element={<Navigate to="/customer/dashboard" replace />} />
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
              path="/agent/dashboard"
              element={
                <ShellRoute roles={["support_agent"]}>
                  <AgentDashboard />
                </ShellRoute>
              }
            />
            <Route
              path="/agent/tickets"
              element={
                <ShellRoute roles={["support_agent"]}>
                  <AgentTickets />
                </ShellRoute>
              }
            />
            <Route
              path="/agent/tickets/:ticketId"
              element={
                <ShellRoute roles={["support_agent"]}>
                  <AgentTicketDetails />
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
            <Route
              path="/admin/agents"
              element={
                <ShellRoute roles={["admin"]}>
                  <AdminAgents />
                </ShellRoute>
              }
            />
            <Route
              path="/admin/reassignment-requests"
              element={
                <ShellRoute roles={["admin"]}>
                  <AdminReassignmentRequests />
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
