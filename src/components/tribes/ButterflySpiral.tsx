const BUTTERFLY_PATH =
  'M0,-1 C-2,-4 -5,-8 -8,-7 C-10,-6 -9,-2 -6,0 C-8,1 -9,4 -7,6 C-5,7 -2,3 0,1 C2,3 5,7 7,6 C9,4 8,1 6,0 C9,-2 10,-6 8,-7 C5,-8 2,-4 0,-1Z';

function generateArm(
  count: number,
  angleOffset: number,
  baseRadius: number,
  radiusStep: number,
  scaleRange: [number, number],
  opacityRange: [number, number],
  color: string,
  keyPrefix: string,
  flipMod: number,
  wobbleAmp: number,
  wobbleFreq: number,
) {
  return Array.from({ length: count }, (_, i) => {
    const angle = i * 0.28 + angleOffset;
    const r = baseRadius + i * radiusStep;
    const x = 400 + Math.cos(angle) * r;
    const y = 400 + Math.sin(angle) * r;
    const t = i / count;
    const s = scaleRange[0] + t * (scaleRange[1] - scaleRange[0]);
    const opacity = opacityRange[0] + t * (opacityRange[1] - opacityRange[0]);
    const rot = angle * (180 / Math.PI) + Math.sin(i * wobbleFreq) * wobbleAmp;
    const flip = i % flipMod === 0 ? -1 : 1;
    return (
      <g
        key={`${keyPrefix}${i}`}
        transform={`translate(${x},${y}) rotate(${rot}) scale(${s * flip},${s})`}
      >
        <path d={BUTTERFLY_PATH} fill={`rgba(${color},${opacity})`} fillRule="evenodd" />
      </g>
    );
  });
}

export default function ButterflySpiral() {
  return (
    <div
      style={{
        position: 'absolute',
        top: '-5%',
        left: 0,
        right: 0,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 0,
        height: '80vh',
      }}
    >
      {/* Warm orange glow behind hero */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 500,
          height: 300,
          borderRadius: '50%',
          background:
            'radial-gradient(ellipse, rgba(210,150,80,0.07) 0%, rgba(200,130,60,0.03) 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <svg
        viewBox="0 0 800 800"
        style={{
          width: 'min(100vw, 1000px)',
          height: 'min(100vw, 1000px)',
          opacity: 1,
        }}
      >
        <defs>
          <radialGradient id="spiralFade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(220,190,140,0.12)" />
            <stop offset="50%" stopColor="rgba(180,150,210,0.06)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <circle cx="400" cy="400" r="380" fill="url(#spiralFade)" />

        {/* Primary spiral — warm gold butterflies */}
        {generateArm(60, 0, 12, 5.5, [0.4, 1.3], [0.06, 0.18], '220,190,130', 'a', 3, 20, 0.4)}

        {/* Secondary spiral — lavender butterflies */}
        {generateArm(
          50,
          Math.PI,
          25,
          5.5,
          [0.35, 1.1],
          [0.05, 0.15],
          '170,150,220',
          'b',
          4,
          25,
          0.5,
        )}

        {/* Third arm — pink-lavender butterflies */}
        {generateArm(
          40,
          (Math.PI * 3) / 2,
          40,
          5,
          [0.35, 1.15],
          [0.04, 0.13],
          '200,180,210',
          'd',
          3,
          22,
          0.6,
        )}

        {/* Outer drifters */}
        {Array.from({ length: 15 }, (_, i) => {
          const angle = i * 0.8 + 0.5;
          const r = 330 + Math.sin(i * 1.7) * 50;
          const x = 400 + Math.cos(angle) * r;
          const y = 400 + Math.sin(angle) * r;
          const s = 1.0 + Math.sin(i * 0.9) * 0.3;
          const opacity = 0.04 + Math.sin(i * 0.6) * 0.03;
          const rot = i * 43;
          return (
            <g key={`c${i}`} transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
              <path
                d={BUTTERFLY_PATH}
                fill={`rgba(210,190,160,${opacity})`}
                fillRule="evenodd"
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
