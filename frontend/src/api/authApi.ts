import api from "./axios";
import type { LoginPayload, RegisterPayload, TokenResponse, User } from "../types";

export const authApi = {
  register(payload: RegisterPayload) {
    return api.post<User>("/auth/register", payload).then((response) => response.data);
  },
  login(payload: LoginPayload) {
    return api.post<TokenResponse>("/auth/login", payload).then((response) => response.data);
  },
  me() {
    return api.get<User>("/auth/me").then((response) => response.data);
  },
  updateProfile(payload: { full_name?: string; avatar_url?: string | null }) {
    return api.patch<User>("/users/me", payload).then((response) => response.data);
  },
  changePassword(payload: { current_password: string; new_password: string }) {
    return api.patch<void>("/users/me/password", payload).then((response) => response.data);
  }
};
