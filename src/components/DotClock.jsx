import React from 'react';

const ACCENT = '#ff0000';
const FG     = '#ffffff';
const FG_DIM = '#3a3a3a';
const FG_OFF = '#222222';

// ─── DotClock ────────────────────────────────────────────────────────────────
// A circular dot-matrix progress indicator inspired by Nothing's design system.
// 48 dots in a ring; quarter-position dots are slightly larger.
// Filled dots represent elapsed progress; a glowing leader dot marks the
// current position.

export default function DotClock({
  percent  = 0,
  value    = '',
  label    = '',
  enabled  = true,
  stopped  = false,
  size     = 150,
}) {
  const TOTAL    = 48;
  const RADIUS   = size / 2 - 14;
  const CENTER   = size / 2;

  const safePct  = Math.max(0, Math.min(100, percent));
  const filled   = enabled ? Math.round((TOTAL * safePct) / 100) : 0;

  // Color logic
  const activeColor = stopped ? ACCENT : (enabled ? FG : FG_DIM);
  const valueColor  = stopped ? ACCENT : (enabled ? FG : FG_DIM);

  const dots = [];
  for (let i = 0; i < TOTAL; i++) {
    // Start at top (12 o'clock), go clockwise
    const angle = (i / TOTAL) * Math.PI * 2 - Math.PI / 2;
    const x     = CENTER + RADIUS * Math.cos(angle);
    const y     = CENTER + RADIUS * Math.sin(angle);

    const isQuarter = i % 12 === 0;
    const isFilled  = i < filled;
    const isLeader  = enabled && !stopped && filled > 0 && i === filled - 1;

    let r;
    if (isLeader)        r = 2.6;
    else if (isQuarter)  r = 2.2;
    else                 r = 1.5;

    let fill;
    if (isLeader)       fill = ACCENT;
    else if (isFilled)  fill = activeColor;
    else                fill = FG_OFF;

    dots.push(
      <circle
        key={i}
        cx={x}
        cy={y}
        r={r}
        fill={fill}
        style={isLeader ? { filter: 'drop-shadow(0 0 4px #ff0000)' } : undefined}
      />,
    );
  }

  // Tick marks at 12/3/6/9 (small lines just outside the dot ring)
  const ticks = [];
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
    const x1    = CENTER + (RADIUS + 6)  * Math.cos(angle);
    const y1    = CENTER + (RADIUS + 6)  * Math.sin(angle);
    const x2    = CENTER + (RADIUS + 11) * Math.cos(angle);
    const y2    = CENTER + (RADIUS + 11) * Math.sin(angle);
    ticks.push(
      <line
        key={`t${i}`}
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={FG_DIM}
        strokeWidth={1}
      />,
    );
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, lineHeight: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {ticks}
        {dots}
      </svg>

      {/* Center value */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          fontFamily: "'JetBrains Mono', 'Consolas', monospace",
        }}
      >
        <span
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: valueColor,
            letterSpacing: '-0.02em',
            fontVariantNumeric: 'tabular-nums',
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {label ? (
          <span
            style={{
              fontSize: 9,
              color: '#666',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              marginTop: 6,
            }}
          >
            {label}
          </span>
        ) : null}
      </div>
    </div>
  );
}
