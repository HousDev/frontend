import React, { useEffect, useState } from 'react';

interface AnimatedCountBadgeProps {
  count: number;
  className?: string;
  showPing?: boolean;
}

export const AnimatedCountBadge: React.FC<AnimatedCountBadgeProps> = ({
  count,
  className = '',
}) => {
  const [displayCount, setDisplayCount] = useState<number>(0);
  const prevCountRef = React.useRef<number>(0);

  // Rolling counter on mount/change
  useEffect(() => {
    if (!count || count <= 0) {
      setDisplayCount(0);
      prevCountRef.current = 0;
      return;
    }

    const start = prevCountRef.current;
    const duration = 500; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.round(start + (count - start) * ease);
      setDisplayCount(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        prevCountRef.current = count;
      }
    };

    requestAnimationFrame(animate);
  }, [count]);

  if (!count || count <= 0) return null;

  return (
    <>
      <style>{`
        @keyframes badgeAppearDisappear {
          0% {
            opacity: 0;
            transform: scale(0.88) translateY(3px);
          }
          15%, 80% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          95%, 100% {
            opacity: 0;
            transform: scale(0.88) translateY(-3px);
          }
        }
        .badge-appear-loop {
          animation: badgeAppearDisappear 4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
      `}</style>

      <span
        className={`absolute -top-2.5 -right-14 sm:-right-16 z-20 inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      >
        {/* Simple Flat Rectangular Badge (No Border Radius) */}
        <span
          className="badge-appear-loop inline-flex items-center gap-1 h-[19px] px-1.5 rounded-none bg-[#E6761D] text-white text-[9.5px] font-medium tracking-normal border border-white/50 shadow-sm leading-none whitespace-nowrap"
        >
          <span className="tabular-nums font-semibold">{displayCount}</span>
          <span className="font-medium">Newly Added</span>
        </span>
      </span>
    </>
  );
};

export default AnimatedCountBadge;
