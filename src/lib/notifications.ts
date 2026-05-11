export type NotificationType = 'message' | 'template' | 'campaign' | 'lead' | 'success' | 'error' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
  action?: { label: string; page: string };
}

type Listener = (notifications: AppNotification[]) => void;

class NotificationStore {
  private notifications: AppNotification[] = [];
  private listeners: Set<Listener> = new Set();
  private toastListeners: Set<(n: AppNotification) => void> = new Set();
private lastNotificationTime = 0;
  private lastNotificationKey = "";
  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.notifications);
    return () => this.listeners.delete(listener);
  }

  subscribeToast(listener: (n: AppNotification) => void) {
    this.toastListeners.add(listener);
    return () => this.toastListeners.delete(listener);
  }

  private emit() {
    this.listeners.forEach((l) => l([...this.notifications]));
  }

 // FIND THIS push METHOD and REPLACE IT
push(type: NotificationType, title: string, body: string, action?: { label: string; page: string }) {
    // ADD THESE 5 LINES AT THE START
    const now = Date.now();
    const key = `${type}_${title}_${body}`;
    
    if (key === this.lastNotificationKey && now - this.lastNotificationTime < 2000) {
        return {} as AppNotification;
    }
    
    this.lastNotificationTime = now;
    this.lastNotificationKey = key;
    
    // KEEP THE REST OF THE CODE AS IS
    const n: AppNotification = {
        id: `${Date.now()}-${Math.random()}`,
        type,
        title,
        body,
        timestamp: new Date(),
        read: false,
        action,
    };
    this.notifications = [n, ...this.notifications].slice(0, 50);
    this.emit();
    this.toastListeners.forEach((l) => l(n));
    return n;
}

  markAllRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.emit();
  }

  markRead(id: string) {
    this.notifications = this.notifications.map((n) => n.id === id ? { ...n, read: true } : n);
    this.emit();
  }

  clear() {
    this.notifications = [];
    this.emit();
  }

  getUnreadCount() {
    return this.notifications.filter((n) => !n.read).length;
  }

  getAll() {
  return [...this.notifications];
}
}

export const notificationStore = new NotificationStore();
