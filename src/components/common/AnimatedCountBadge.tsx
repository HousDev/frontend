import React, { useEffect, useState } from 'react';

interface AnimatedCountBadgeProps {
  count?: number;
  totalCount?: number;
  className?: string;
  showPing?: boolean;
}

export const AnimatedCountBadge: React.FC<AnimatedCountBadgeProps> = ({
  count = 0,
  totalCount,
  className = '',
}) => {
  const [displayCount, setDisplayCount] = useState<number>(count);
  const prevCountRef = React.useRef<number>(count);
  const [activeSlide, setActiveSlide] = useState<'newly' | 'total'>('newly');

  const hasNewlyAdded = (count ?? 0) > 0;
  const hasTotal = totalCount != null && totalCount > 0;

  // Rolling counter on mount/change
  useEffect(() => {
    if (!count || count <= 0) {
      setDisplayCount(0);
      prevCountRef.current = 0;
      return;
    }

    const start = prevCountRef.current || 0;
    const duration = 400; // ms
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
        setDisplayCount(count);
      }
    };

    requestAnimationFrame(animate);
  }, [count]);

  // Alternate between 'newly' and 'total' every 3.5 seconds
  useEffect(() => {
    if (!hasNewlyAdded || !hasTotal) return;

    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 'newly' ? 'total' : 'newly'));
    }, 3500);

    return () => clearInterval(interval);
  }, [hasNewlyAdded, hasTotal]);

  if (!hasNewlyAdded && !hasTotal) return null;

  // Determine current content to show
  const showNewly = hasNewlyAdded && (activeSlide === 'newly' || !hasTotal);

  return (
    <>
      <style>{`
        @keyframes badgeAppearDisappear {
          0% {
            opacity: 0;
            transform: scale(0.9) translateY(2px);
          }
          15%, 82% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          96%, 100% {
            opacity: 0;
            transform: scale(0.9) translateY(-2px);
          }
        }
        .badge-appear-loop {
          animation: badgeAppearDisappear 3.5s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
      `}</style>

      <span
        className={`absolute -top-2.5 -right-16 sm:-right-20 z-20 inline-flex items-center justify-center select-none pointer-events-none ${className}`}
      >
        {/* Simple Flat Rectangular Badge (No Border Radius) */}
        <span
          key={showNewly ? 'newly' : 'total'}
          className="badge-appear-loop inline-flex items-center gap-1 h-[19px] px-1.5 rounded-none bg-[#E6761D] text-white text-[9.5px] font-medium tracking-normal border border-white/50 shadow-sm leading-none whitespace-nowrap"
        >
          {showNewly ? (
            <>
              <span className="tabular-nums font-semibold">{displayCount || count}</span>
              <span className="font-medium">Newly Added</span>
            </>
          ) : (
            <>
              <span className="tabular-nums font-semibold">{totalCount}</span>
              <span className="font-medium">Total Property</span>
            </>
          )}
        </span>
      </span>
    </>
  );
};

export default AnimatedCountBadge;
