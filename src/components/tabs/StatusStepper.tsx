

// src/components/documents/StatusStepper.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { documentStatusAPI, StatusCode } from '@/lib/documentStatusAPI';
import { toast } from 'react-toastify';

export type StepKey =
  | 'created'
  | 'shared'
  | 'on_hold'
  | 'otp_verified'
  | 'esign_pending' // normalized from "e-sign_pending"
  | 'completed'
  | 'cancelled';

const normalize = (s?: string): StepKey =>
  (s === 'e-sign_pending' ? 'esign_pending' : (s as StepKey)) || 'created';

const STEP_ORDER: StepKey[] = [
  'created',
  'shared',
  'on_hold',
  'otp_verified',
  'esign_pending',
  'completed',
  'cancelled',
];

const LABELS: Record<StepKey, string> = {
  created: 'Created',
  shared: 'Shared',
  on_hold: 'On Hold',
  cancelled: 'Cancelled',
  otp_verified: 'OTP Verified',
  esign_pending: 'E-Sign Pending',
  completed: 'Completed',
};

const COLORS: Record<
  StepKey,
  { ring: string; fill: string; text: string; line: string }
> = {
  created: { ring: 'ring-gray-300', fill: 'bg-gray-100', text: 'text-gray-700', line: 'bg-gray-200' },
  shared: { ring: 'ring-purple-300', fill: 'bg-purple-100', text: 'text-purple-700', line: 'bg-purple-200' },
  on_hold: { ring: 'ring-yellow-300', fill: 'bg-yellow-100', text: 'text-yellow-700', line: 'bg-yellow-200' },
  cancelled: { ring: 'ring-red-300', fill: 'bg-red-100', text: 'text-red-700', line: 'bg-red-200' },
  otp_verified: { ring: 'ring-blue-300', fill: 'bg-blue-100', text: 'text-blue-700', line: 'bg-blue-200' },
  esign_pending: { ring: 'ring-orange-300', fill: 'bg-orange-100', text: 'text-orange-700', line: 'bg-orange-200' },
  completed: { ring: 'ring-green-300', fill: 'bg-green-100', text: 'text-green-700', line: 'bg-green-200' },
};

export default function StatusStepper({
  docId,
  currentStatus,
  onSynced,
  disabled,
  onRequestStep, // parent can intercept (e.g., open OTP modal)
}: {
  docId: number;
  currentStatus: string;
  onSynced?: (args: { id: number; status: StepKey; progress?: number; updated_at?: string }) => void;
  disabled?: boolean;
  onRequestStep?: (target: StepKey) => boolean | void; // return true = parent handled
}) {
  const normalized = normalize(currentStatus);
  const [working, setWorking] = useState<StepKey | null>(null);

  const currentIndex = useMemo(
    () => Math.max(0, STEP_ORDER.indexOf(normalized)),
    [normalized]
  );

  /** NEW: Most steps are clickable. Only rule:
   *  If already COMPLETED, you cannot go to CANCELLED. */
  const canClick = (step: StepKey) => {
    if (disabled || !!working) return false;
    if (normalized === 'completed' && step === 'cancelled') return false;
    return true; // allow clicking any step (forward/back/etc.)
  };

  // status event listener (if you broadcast elsewhere)
  useEffect(() => {
    const onStatus = (e: any) => {
      // optionally react to window events if you emit elsewhere
    };
    window.addEventListener('doc:status', onStatus as any);
    return () => window.removeEventListener('doc:status', onStatus as any);
  }, []);

  const onToggle = async (target: StepKey) => {
    // Guard: completed → cancelled is not allowed
    if (normalized === 'completed' && target === 'cancelled') {
      toast.info('This document is already completed and cannot be cancelled.');
      return;
    }

    // Parent interception (e.g., show OTP modal when moving to otp_verified)
    if (onRequestStep) {
      const handled = onRequestStep(target);
      if (handled) return;
    }

    try {
      setWorking(target);
      const payload = {
        new_status: target as StatusCode,
        reason: `Changed via status stepper to ${target}`,
        details: { source: 'ui-status-stepper' },
        changed_by: null,
      };
      await documentStatusAPI.setStatus(docId, payload);

      const snap = await documentStatusAPI.getSnapshot(docId);
      onSynced?.({
        id: docId,
        status: normalize(snap?.current_status || target),
        progress: typeof snap?.progress_pct === 'number' ? snap.progress_pct : undefined,
        updated_at: snap?.updated_at,
      });

      toast.success(`Status → ${LABELS[target]}`);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to update status');
    } finally {
      setWorking(null);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {STEP_ORDER.map((step, i) => {
        const done = i <= currentIndex;
        const enabled = canClick(step);
        const color = COLORS[step];

        return (
          <div key={step} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => enabled && onToggle(step)}
              title={LABELS[step]}
              className={[
                'w-8 h-8 rounded-full flex items-center justify-center border transition-all',
                done ? 'border-green-500 bg-green-100' : `border-gray-300 ${color.fill}`,
                enabled ? 'hover:ring-2 ' + color.ring : 'opacity-60 cursor-not-allowed',
              ].join(' ')}
              disabled={!enabled}
            >
              {done ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <Clock size={16} className={color.text} />
              )}
            </button>
            <div
              className={[
                'text-[11px] font-medium',
                done ? 'text-green-700' : color.text,
              ].join(' ')}
            >
              {LABELS[step]}
            </div>
            {i < STEP_ORDER.length - 1 && (
              <div
                className={[
                  'w-6 h-0.5 rounded-full',
                  i < currentIndex ? 'bg-green-400' : color.line,
                ].join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
