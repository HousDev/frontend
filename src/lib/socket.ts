// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(userId: number | string) {
  if (socket) return socket;
  socket = io(import.meta.env.VITE_API_URL || "https://resaleexpert.in", {
    path: "/socket.io",
    transports: ["websocket"],
    query: { userId: String(userId) }, // dev-friendly; prod me JWT auth lagao
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
