import React, { useEffect, useState } from 'react';

interface AnimatedCountBadgeProps {
  count: number;
  className?: string;
  showPing?: boolean;
}

export const AnimatedCountBadge: React.FC<AnimatedCountBadgeProps> = ({
  count,
  className = '',
  showPing = true,
}) => {
  const [displayCount, setDisplayCount] = useState<number>(0);
  const [flipState, setFlipState] = useState<number>(0); // 0: "122 NEW", 1: "🔥 LIVE"

  // Rolling counter on mount/change
  useEffect(() => {
    if (!count || count <= 0) {
      setDisplayCount(0);
      return;
    }

    let start = 0;
    const duration = 600; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.round(start + (count - start) * ease);
      setDisplayCount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [count]);

  // Subtle alternate text flip every 3.5 seconds
  useEffect(() => {
    if (!count || count <= 0) return;
    const interval = setInterval(() => {
      setFlipState((prev) => (prev === 0 ? 1 : 0));
    }, 3500);
    return () => clearInterval(interval);
  }, [count]);

  if (!count || count <= 0) return null;

  return (
    <>
      <style>{`
        @keyframes badgeSoftPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 2px 10px rgba(22, 163, 74, 0.6), 0 0 0 0 rgba(34, 197, 94, 0.5);
          }
          50% {
            transform: scale(1.04);
            box-shadow: 0 4px 14px rgba(22, 163, 74, 0.85), 0 0 0 3px rgba(34, 197, 94, 0.25);
          }
        }
        .badge-live-pulse {
          animation: badgeSoftPulse 2.8s ease-in-out infinite;
        }
      `}</style>

      <span
        className={`absolute -top-2.5 -right-3 z-20 flex items-center justify-center select-none pointer-events-none ${className}`}
      >
        {/* 🌟 Radiant Radar Pulse */}
        {showPing && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping pointer-events-none" />
        )}

        {/* 🌟 Glowing Pill Badge with Text Flip */}
        <span
          className="relative badge-live-pulse inline-flex items-center justify-center h-[19px] px-2 rounded-full text-white text-[9.5px] sm:text-[10px] font-black tracking-tight border-[1.5px] border-white leading-none whitespace-nowrap overflow-hidden transition-all duration-500"
          style={{
            background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 60%, #15803d 100%)',
          }}
        >
          {/* Shimmer Highlight */}
          <span className="absolute inset-x-0 top-0 h-[45%] bg-white/30 rounded-t-full pointer-events-none" />

          {/* Animated Flip Text Container */}
          <span className="relative z-10 flex items-center gap-1 transition-all duration-500">
            {flipState === 0 ? (
              <span className="flex items-center gap-0.5 animate-fadeIn">
                <span className="tabular-nums font-black drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
                  {displayCount}
                </span>
                <span className="font-extrabold uppercase text-[8px] sm:text-[8.5px] tracking-tight text-white/95">
                  NEW
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-0.5 animate-fadeIn text-[8.5px] sm:text-[9px] font-black uppercase text-amber-200 drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]">
                🔥 LIVE
              </span>
            )}
          </span>
        </span>
      </span>
    </>
  );
};

export default AnimatedCountBadge;
