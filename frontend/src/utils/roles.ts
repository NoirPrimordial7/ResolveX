import type { UserRole } from "../types";

export const roleDisplayNames: Record<UserRole, string> = {
  admin: "Placement Head",
  customer: "Student",
  support_agent: "Faculty Coordinator"
};

export function roleLabel(role?: UserRole | string | null) {
  if (role === "admin" || role === "customer" || role === "support_agent") {
    return roleDisplayNames[role];
  }
  return role ? role.replace("_", " ") : "User";
}
