import api from "./axios";
import type { ResolveXNotification } from "../types";

export const notificationApi = {
  list() {
    return api.get<ResolveXNotification[]>("/notifications").then((response) => response.data);
  },
  markRead(notificationId: number) {
    return api.patch<ResolveXNotification>(`/notifications/${notificationId}/read`).then((response) => response.data);
  },
  markAllRead() {
    return api.patch<{ updated: number }>("/notifications/read-all").then((response) => response.data);
  }
};
