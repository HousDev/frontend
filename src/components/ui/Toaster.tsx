import React from 'react';
import { useToast } from '@/hooks/useToast';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const iconMap = {
  default: Info,
  success: CheckCircle,
  destructive: AlertCircle,
  warning: AlertTriangle,
};

const variantClasses = {
  default: 'bg-white border-gray-200 text-gray-900',
  success: 'bg-green-50 border-green-200 text-green-900',
  destructive: 'bg-red-50 border-red-200 text-red-900',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.variant || 'default'];
        
        return (
          <div
            key={toast.id}
            className={cn(
              'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-top-2',
              variantClasses[toast.variant || 'default']
            )}
          >
            <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
            
            <div className="flex-1 space-y-1">
              {toast.title && (
                <div className="font-medium text-sm">
                  {toast.title}
                </div>
              )}
              {toast.description && (
                <div className="text-sm opacity-90">
                  {toast.description}
                </div>
              )}
              {toast.action && (
                <div className="mt-2">
                  {toast.action}
                </div>
              )}
            </div>
            
            <button
              onClick={() => dismiss(toast.id)}
              className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default Toaster;