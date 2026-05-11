import { useEffect } from "react";
// import { connectSocket, getSocket } from "@/lib/socket";
import { io } from 'socket.io-client';

function connectSocket(userId: string | number) {
  return io(import.meta.env.VITE_API_URL || "https://resaleexpert.in", {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    query: { userId: String(userId) },
    withCredentials: true,
  });
}
type Handler = (payload: any) => void;

export function useNotificationsSocket(userId: number | string, handlers: {
  onNew?: Handler;
  onUpdated?: Handler;
  onRead?: Handler;
  onReadAll?: Handler;
}) {
  useEffect(() => {
    if (!userId) return;
    const s = connectSocket(userId);

    const hNew = (p: any) => handlers.onNew?.(p);
    const hUpd = (p: any) => handlers.onUpdated?.(p);
    const hRead = (p: any) => handlers.onRead?.(p);
    const hReadAll = (p: any) => handlers.onReadAll?.(p);

    s.on("notification:new", hNew);
    s.on("notification:created", hUpd);
    s.on("notification:updated", hUpd);
    s.on("notification:read", hRead);
    s.on("notification:readAll", hReadAll);

    return () => {
      s.off("notification:new", hNew);
s.off("notification:created", hUpd);
s.off("notification:updated", hUpd);
s.off("notification:read", hRead);
s.off("notification:readAll", hReadAll);
    };
  }, [userId]);
}
