import { useEffect } from "react";
import { connectSocket, getSocket } from "@/lib/socket";

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
      const sock = getSocket();
      if (!sock) return;
      sock.off("notification:new", hNew);
      sock.off("notification:created", hUpd);
      sock.off("notification:updated", hUpd);
      sock.off("notification:read", hRead);
      sock.off("notification:readAll", hReadAll);
    };
  }, [userId]);
}
