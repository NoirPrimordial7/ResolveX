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
  }
};
