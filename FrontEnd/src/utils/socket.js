import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  if (socket) socket.disconnect();
  socket = io(import.meta.env.VITE_API_URL, {
    auth: { token },
  });
  return socket;
};

export const disconnectSocket = () => {
  socket?.disconnect();
  socket = null;
};
