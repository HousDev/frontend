// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(userId: number | string) {
  if (socket) return socket;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const socketUrl = import.meta.env.VITE_API_URL || (typeof window !== "undefined" && window.location.hostname === "localhost" ? "http://localhost:3000" : "https://resaleexpert.in");
  socket = io(socketUrl, {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    auth: { token: token || undefined },
    query: { userId: String(userId), token: token || undefined },
    withCredentials: true,
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
