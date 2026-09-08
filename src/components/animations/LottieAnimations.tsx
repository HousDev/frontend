import React from 'react';

/**
 * Super lightweight, zero-dependency animated SVGs matching the Hously theme.
 */

// 1. Email OTP / Security Code Animation
export const EmailOtpLottie: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 80,
}) => (
  <div
    style={{ width: size, height: size }}
    className={`mx-auto flex items-center justify-center relative ${className}`}
  >
    <style>{`
      @keyframes floatPulse {
        0%, 100% { transform: translateY(0px) scale(1); }
        50% { transform: translateY(-4px) scale(1.03); }
      }
      @keyframes ringGlow {
        0%, 100% { transform: scale(0.9); opacity: 0.25; }
        50% { transform: scale(1.15); opacity: 0.65; }
      }
      .anim-float { animation: floatPulse 3s ease-in-out infinite; }
      .anim-glow { transform-origin: center; animation: ringGlow 2.5s ease-in-out infinite; }
    `}</style>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Outer Pulse Glow */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="#E6761D" strokeWidth="1.5" className="anim-glow" />
      <circle cx="50" cy="50" r="36" fill="#FFF7ED" />
      
      {/* Floating Envelope */}
      <g className="anim-float">
        <rect x="25" y="32" width="50" height="36" rx="6" fill="#E6761D" />
        <path d="M26 34 L50 52 L74 34" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="50" cy="50" r="10" fill="#0B3856" />
        {/* Keyhole/Lock Icon */}
        <path d="M48 48 A2 2 0 1 1 52 48 L52.5 53 L47.5 53 Z" fill="#FFFFFF" />
      </g>
    </svg>
  </div>
);

// 2. Security Shield & Lock Animation
export const SecurityShieldLottie: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 80,
}) => (
  <div
    style={{ width: size, height: size }}
    className={`mx-auto flex items-center justify-center relative ${className}`}
  >
    <style>{`
      @keyframes shieldFloat {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-3px); }
      }
      @keyframes pulseRing {
        0%, 100% { transform: scale(0.95); opacity: 0.3; }
        50% { transform: scale(1.1); opacity: 0.7; }
      }
      .anim-shield { animation: shieldFloat 3s ease-in-out infinite; }
      .anim-shield-ring { transform-origin: center; animation: pulseRing 2.2s ease-in-out infinite; }
    `}</style>
    <svg viewBox="0 0 100 100" className="w-full h-full">
      {/* Background Soft Glow */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="#0B3856" strokeWidth="2" className="anim-shield-ring" />
      <circle cx="50" cy="50" r="36" fill="#F0F9FF" />

      {/* Shield */}
      <g className="anim-shield">
        <path
          d="M50 20 L72 30 C72 54 50 68 50 68 C50 68 28 54 28 30 Z"
          fill="#0B3856"
        />
        {/* Shield highlight / Lock */}
        <path
          d="M50 25 L67 33 C67 52 50 63 50 63"
          fill="none"
          stroke="#1E4E79"
          strokeWidth="2"
        />
        {/* Orange Accent Check / Lock */}
        <path
          d="M42 43 L48 49 L58 37"
          fill="none"
          stroke="#E6761D"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  </div>
);

// 3. Success Celebration Animation
export const SuccessCelebrationLottie: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 80,
}) => (
  <div
    style={{ width: size, height: size }}
    className={`mx-auto flex items-center justify-center relative ${className}`}
  >
    <style>{`
      @keyframes popIn {
        0% { transform: scale(0.5); opacity: 0; }
        70% { transform: scale(1.12); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes strokeCheck {
        0% { stroke-dashoffset: 40; }
        100% { stroke-dashoffset: 0; }
      }
      .anim-pop { animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      .anim-check {
        stroke-dasharray: 40;
        stroke-dashoffset: 0;
        animation: strokeCheck 0.5s ease-out 0.2s forwards;
      }
    `}</style>
    <svg viewBox="0 0 100 100" className="w-full h-full anim-pop">
      {/* Green Circle */}
      <circle cx="50" cy="50" r="40" fill="#10B981" />
      <circle cx="50" cy="50" r="35" fill="none" stroke="#34D399" strokeWidth="2" opacity="0.6" />
      
      {/* White Checkmark */}
      <path
        d="M32 50 L44 62 L68 38"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="anim-check"
      />
    </svg>
  </div>
);
