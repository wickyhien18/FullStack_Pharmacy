import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth.store.js";
import { connectSocket, disconnectSocket } from "@/lib/socket.js";
import toast from "react-hot-toast";

export const useNotifications = () => {
  const { accessToken, isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    const socket = connectSocket(accessToken);

    socket.on("order:status_changed", (data) => {
      toast.success(data.message);
      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("order:status_changed");
      disconnectSocket();
    };
  }, [isAuthenticated, accessToken]);

  return { notifications, unreadCount, markAllRead: () => setUnreadCount(0) };
};
