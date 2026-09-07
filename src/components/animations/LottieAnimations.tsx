import React from 'react';
import { Lottie } from 'lottie-react';

// 1. Email OTP / Security Code Animation JSON
const emailOtpLottieData = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 120,
  w: 200,
  h: 200,
  nm: "Email OTP",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Envelope",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: [0], e: [4] }, { t: 60, s: [4], e: [-4] }, { t: 120, s: [-4], e: [0] }] },
        p: { a: 1, k: [{ t: 0, s: [100, 100, 0], e: [100, 92, 0] }, { t: 60, s: [100, 92, 0], e: [100, 100, 0] }, { t: 120, s: [100, 100, 0], e: [100, 92, 0] }] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [95, 95, 100], e: [105, 105, 100] }, { t: 60, s: [105, 105, 100], e: [95, 95, 100] }, { t: 120, s: [95, 95, 100], e: [105, 105, 100] }] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [90, 60] },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 14 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.902, 0.463, 0.114, 1] }, // #E6761D
              o: { a: 0, k: 100 }
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[-40, -25], [0, 5], [40, -25]],
                  c: false
                }
              }
            },
            {
              ty: "st",
              c: { a: 0, k: [1, 1, 1, 1] },
              w: { a: 0, k: 4 },
              lc: 2,
              lj: 2
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        }
      ]
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Glow Pulse Ring",
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [30], e: [80] }, { t: 60, s: [80], e: [30] }, { t: 120, s: [30], e: [80] }] },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [80, 80, 100], e: [120, 120, 100] }, { t: 60, s: [120, 120, 100], e: [80, 80, 100] }, { t: 120, s: [80, 80, 100], e: [120, 120, 100] }] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              d: 1,
              s: { a: 0, k: [110, 110] },
              p: { a: 0, k: [0, 0] }
            },
            {
              ty: "st",
              c: { a: 0, k: [0.043, 0.22, 0.337, 1] }, // #0b3856
              w: { a: 0, k: 3 }
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        }
      ]
    }
  ]
};

// 2. Success Celebration Lottie JSON
const successLottieData = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 90,
  w: 200,
  h: 200,
  nm: "Success Verified",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Check Circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [0, 0, 100], e: [110, 110, 100] }, { t: 30, s: [110, 110, 100], e: [100, 100, 100] }] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              d: 1,
              s: { a: 0, k: [90, 90] },
              p: { a: 0, k: [0, 0] }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.063, 0.725, 0.506, 1] }, // Emerald #10b981
              o: { a: 0, k: 100 }
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[-20, 0], [-6, 14], [22, -14]],
                  c: false
                }
              }
            },
            {
              ty: "st",
              c: { a: 0, k: [1, 1, 1, 1] },
              w: { a: 0, k: 6 },
              lc: 2,
              lj: 2
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        }
      ]
    }
  ]
};

// 3. Security Shield & Lock Animation JSON
const securityShieldLottieData = {
  v: "5.7.4",
  fr: 60,
  ip: 0,
  op: 120,
  w: 200,
  h: 200,
  nm: "Security Shield",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Shield",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 1, k: [{ t: 0, s: [0], e: [3] }, { t: 60, s: [3], e: [-3] }, { t: 120, s: [-3], e: [0] }] },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 1, k: [{ t: 0, s: [98, 98, 100], e: [104, 104, 100] }, { t: 60, s: [104, 104, 100], e: [98, 98, 100] }, { t: 120, s: [98, 98, 100], e: [104, 104, 100] }] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [70, 75] },
              p: { a: 0, k: [0, 0] },
              r: { a: 0, k: 18 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.043, 0.22, 0.337, 1] }, // #0b3856
              o: { a: 0, k: 100 }
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "el",
              d: 1,
              s: { a: 0, k: [22, 22] },
              p: { a: 0, k: [0, -8] }
            },
            {
              ty: "st",
              c: { a: 0, k: [0.902, 0.463, 0.114, 1] }, // #E6761D
              w: { a: 0, k: 4 }
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        },
        {
          ty: "gr",
          it: [
            {
              ty: "rc",
              d: 1,
              s: { a: 0, k: [26, 20] },
              p: { a: 0, k: [0, 8] },
              r: { a: 0, k: 4 }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.902, 0.463, 0.114, 1] }, // #E6761D
              o: { a: 0, k: 100 }
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 },
              sk: { a: 0, k: 0 },
              sa: { a: 0, k: 0 }
            }
          ]
        }
      ]
    }
  ]
};

export const EmailOtpLottie: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 80 }) => (
  <div style={{ width: size, height: size }} className={`mx-auto flex items-center justify-center ${className}`}>
    <Lottie src={emailOtpLottieData} loop autoplay style={{ width: '100%', height: '100%' }} />
  </div>
);

export const SecurityShieldLottie: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 80 }) => (
  <div style={{ width: size, height: size }} className={`mx-auto flex items-center justify-center ${className}`}>
    <Lottie src={securityShieldLottieData} loop autoplay style={{ width: '100%', height: '100%' }} />
  </div>
);

export const SuccessCelebrationLottie: React.FC<{ className?: string; size?: number }> = ({ className = '', size = 80 }) => (
  <div style={{ width: size, height: size }} className={`mx-auto flex items-center justify-center ${className}`}>
    <Lottie src={successLottieData} loop={false} autoplay style={{ width: '100%', height: '100%' }} />
  </div>
);

