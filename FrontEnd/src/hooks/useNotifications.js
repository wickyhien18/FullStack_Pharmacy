import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store.js";
import { connectSocket, disconnectSocket } from "@/lib/socket.js";
import api from "@/lib/axios.js";
import toast from "react-hot-toast";

export const useNotifications = () => {
  const { accessToken, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [liveItems, setLiveItems] = useState([]);

  const { data: history = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api.get("/notifications").then((r) => r.data.data),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;
    const socket = connectSocket(accessToken);

    socket.on("order:status_changed", (data) => {
      toast.success(data.message);
      setLiveItems((prev) => [
        { ...data, isRead: false, createdAt: new Date() },
        ...prev,
      ]);
    });

    return () => {
      socket.off("order:status_changed");
      disconnectSocket();
    };
  }, [isAuthenticated, accessToken]);

  const markAllReadMutation = useMutation({
    mutationFn: () => api.patch("/notifications/mark-all-read"),
    onSuccess: () => {
      setLiveItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const items = [...liveItems, ...history];
  const unreadCount = items.filter((n) => !n.isRead).length;

  return { items, unreadCount, markAllRead: markAllReadMutation.mutate };
};
