// src/components/documents/StatusStepper.tsx
import React, { useMemo, useState } from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import { documentStatusAPI, StatusCode } from '@/lib/documentStatusAPI';
import { toast } from 'react-toastify';

export type StepKey =
  | 'created'
  | 'shared'
  | 'on_hold'
  | 'otp_verified'
  | 'esign_pending'      // normalized from "e-sign_pending"
  | 'completed'
  | 'cancelled';

const normalize = (s?: string): StepKey =>
  (s === 'e-sign_pending' ? 'esign_pending' : (s as StepKey)) || 'created';

// ⬇️ Order: Shared ke baad On Hold + Cancelled, phir OTP → E-Sign → Completed
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

const COLORS: Record<StepKey, { ring: string; fill: string; text: string; line: string }> = {
  created:       { ring: 'ring-gray-300',   fill: 'bg-gray-100',    text: 'text-gray-700',   line: 'bg-gray-200' },
  shared:        { ring: 'ring-purple-300', fill: 'bg-purple-100',  text: 'text-purple-700', line: 'bg-purple-200' },
  on_hold:       { ring: 'ring-yellow-300', fill: 'bg-yellow-100',  text: 'text-yellow-700', line: 'bg-yellow-200' },
  cancelled:     { ring: 'ring-red-300',    fill: 'bg-red-100',     text: 'text-red-700',    line: 'bg-red-200' },
  otp_verified:  { ring: 'ring-blue-300',   fill: 'bg-blue-100',    text: 'text-blue-700',   line: 'bg-blue-200' },
  esign_pending: { ring: 'ring-orange-300', fill: 'bg-orange-100',  text: 'text-orange-700', line: 'bg-orange-200' },
  completed:     { ring: 'ring-green-300',  fill: 'bg-green-100',   text: 'text-green-700',  line: 'bg-green-200' },
};

export default function StatusStepper({
  docId,
  currentStatus,
  onSynced,
  disabled,
  onRequestStep, // 👈 NEW
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

  // ✅ Skip allowed: aap directly aage ke kisi bhi step par ja sakte ho.
  const canClick = (step: StepKey) => {
    const idx = STEP_ORDER.indexOf(step);
    return idx > currentIndex && !disabled && !working;
  };

  const onToggle = async (target: StepKey) => {
  if (!canClick(target)) return;

  if (onRequestStep) {            // 👈 NEW
    const handled = onRequestStep(target);
    if (handled) return;          // parent ne modal khola, default flow skip
  }

    try {
      setWorking(target);
      const payload = {
        new_status: target as StatusCode,
        reason: `Advanced via row stepper to ${target}`,
        details: { source: 'ui-row-stepper' },
        changed_by: null,
      };
      await documentStatusAPI.setStatus(docId, payload);

      // Server snapshot = single source of truth
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
        // ✅ Visual rule: agar aap aage jump karte ho toh beech ke steps GREEN (done) dikhेंगे
        const done = i <= currentIndex;
        const enabled = canClick(step);
        const color = COLORS[step];

        return (
          <div key={step} className="flex items-center gap-2">
            <button
              type="button"
              disabled={!enabled}
              onClick={() => onToggle(step)}
              title={LABELS[step]}
              className={[
                'w-8 h-8 rounded-full flex items-center justify-center border transition-all',
                done ? 'border-green-500 bg-green-100' : `border-gray-300 ${color.fill}`,
                enabled ? 'hover:ring-2 ' + color.ring : 'opacity-60 cursor-not-allowed',
              ].join(' ')}
            >
              {done ? (
                <CheckCircle size={16} className="text-green-600" />
              ) : (
                <Clock size={16} className={color.text} />
              )}
            </button>
            <div className={['text-[11px] font-medium', done ? 'text-green-700' : color.text].join(' ')}>
              {LABELS[step]}
            </div>
            {i < STEP_ORDER.length - 1 && (
              <div className={['w-6 h-0.5 rounded-full', i < currentIndex ? 'bg-green-400' : color.line].join(' ')} />
            )}
          </div>
        );
      })}
    </div>
  );
}
