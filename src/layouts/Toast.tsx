import { useState, useEffect } from 'react';
import { MessageSquare, FileText, Megaphone, User, CheckCircle, X, Bell } from 'lucide-react';
import { notificationStore, type AppNotification, type NotificationType } from '../lib/notifications';
import type { Page } from './Sidebar';

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bg: string; border: string }> = {
    message: { icon: MessageSquare, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    template: { icon: FileText, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    campaign: { icon: Megaphone, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    lead: { icon: User, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
    success: { icon: CheckCircle, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    error: { icon: X, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    info: { icon: Bell, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
};

interface ToastItem extends AppNotification {
    removing: boolean;
}

interface Props {
    onNavigate?: (page: Page) => void;
}

export default function ToastContainer({ onNavigate }: Props) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    useEffect(() => {
        notificationStore.subscribeToast((n) => {
            const item: ToastItem = { ...n, removing: false };
            setToasts((prev) => [...prev, item].slice(-4));

            setTimeout(() => {
                setToasts((prev) => prev.map((t) => t.id === item.id ? { ...t, removing: true } : t));
                setTimeout(() => {
                    setToasts((prev) => prev.filter((t) => t.id !== item.id));
                }, 300);
            }, 4000);
        });
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-5 right-5 z-[100] space-y-2 pointer-events-none">
            {toasts.map((t) => {
                const cfg = TYPE_CONFIG[t.type];
                const Icon = cfg.icon;
                return (
                    <div
                        key={t.id}
                        className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg pointer-events-auto transition-all duration-300 max-w-xs ${cfg.bg} ${cfg.border} ${t.removing ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
                            }`}
                    >
                        <Icon size={16} className={`${cfg.color} shrink-0 mt-0.5`} />
                        <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${cfg.color}`}>{t.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{t.body}</p>
                            {t.action && onNavigate && (
                                <button
                                    onClick={() => {
                                        onNavigate(t.action!.page as Page);
                                        setToasts((prev) => prev.filter((x) => x.id !== t.id));
                                    }}
                                    className={`mt-1 text-[10px] font-semibold underline ${cfg.color}`}
                                >
                                    {t.action.label}
                                </button>
                            )}
                        </div>
                        <button
                            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                            className="text-gray-400 hover:text-gray-600 shrink-0"
                        >
                            <X size={12} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
