#!/usr/bin/env node
// Generates Nothing-style SVG mockups for the README.
// Run with: node scripts/generate-screenshots.js

const fs   = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'docs', 'screenshots');
fs.mkdirSync(OUT, { recursive: true });

// ─── Color tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:        '#000000',
  surface:   '#0d0d0d',
  border:    '#333333',
  borderSoft:'#222222',
  fg:        '#ffffff',
  fgDim:     '#888888',
  fgFaint:   '#555555',
  fgOff:     '#222222',
  fgQuarter: '#3a3a3a',
  accent:    '#ff0000',
};

const MONO = "JetBrains Mono, Consolas, monospace";
const SANS = "Inter, -apple-system, BlinkMacSystemFont, sans-serif";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function dotsBackground(w, h) {
  return `<rect width="${w}" height="${h}" fill="${C.bg}"/>
  <rect width="${w}" height="${h}" fill="url(#dots)"/>`;
}

function defs() {
  return `<defs>
    <pattern id="dots" x="0" y="0" width="14" height="14" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="#1f1f1f"/>
    </pattern>
  </defs>`;
}

function dotClock(cx, cy, percent, valueText, label, stopped = false, enabled = true) {
  const TOTAL  = 48;
  const RADIUS = 66;
  const filled = enabled ? Math.round((TOTAL * percent) / 100) : 0;
  const activeColor = stopped ? C.accent : (enabled ? C.fg : C.fgQuarter);
  const valueColor  = stopped ? C.accent : (enabled ? C.fg : C.fgQuarter);
  const labelText   = label;

  let svg = '';

  // Quarter ticks
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + (RADIUS + 6)  * Math.cos(a);
    const y1 = cy + (RADIUS + 6)  * Math.sin(a);
    const x2 = cx + (RADIUS + 11) * Math.cos(a);
    const y2 = cy + (RADIUS + 11) * Math.sin(a);
    svg += `<line x1="${x1.toFixed(2)}" y1="${y1.toFixed(2)}" x2="${x2.toFixed(2)}" y2="${y2.toFixed(2)}" stroke="${C.fgQuarter}"/>`;
  }

  // 48 dots
  for (let i = 0; i < TOTAL; i++) {
    const a = (i / TOTAL) * Math.PI * 2 - Math.PI / 2;
    const x = cx + RADIUS * Math.cos(a);
    const y = cy + RADIUS * Math.sin(a);
    const isQuarter = i % 12 === 0;
    const isFilled  = i < filled;
    const isLeader  = enabled && !stopped && filled > 0 && i === filled - 1;

    let r, fill, filter = '';
    if (isLeader)       { r = 2.6; fill = C.accent; filter = ' filter="url(#glow)"'; }
    else if (isQuarter) { r = 2.2; fill = isFilled ? activeColor : C.fgQuarter; }
    else                { r = 1.5; fill = isFilled ? activeColor : C.fgOff; }

    svg += `<circle cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${r}" fill="${fill}"${filter}/>`;
  }

  // Center value + label
  svg += `<text x="${cx}" y="${cy + 6}"
            font-family="${MONO}" font-size="22" font-weight="600"
            fill="${valueColor}" text-anchor="middle">${valueText}</text>`;
  svg += `<text x="${cx}" y="${cy + 24}"
            font-family="${MONO}" font-size="9" fill="#666"
            letter-spacing="3" text-anchor="middle">${labelText}</text>`;

  return svg;
}

function statusPill(x, y, text, color) {
  const w = text.length * 6 + 24;
  return `<rect x="${x}" y="${y}" width="${w}" height="18" fill="none" stroke="${color}"/>
    <text x="${x + w / 2}" y="${y + 12}" font-family="${MONO}" font-size="9"
          fill="${color}" letter-spacing="2" text-anchor="middle">● ${text}</text>`;
}

function reminderCard(x, y, { icon, label, desc, percent, value, valueLabel, status, statusColor, btnText, stopped, enabled, btnColor }) {
  return `<g transform="translate(${x} ${y})">
    <rect width="330" height="360" fill="${C.surface}" stroke="${stopped ? C.accent : C.border}"/>

    <rect x="22" y="22" width="36" height="36" fill="${C.bg}" stroke="${C.border}"/>
    <text x="40" y="46" font-family="${SANS}" font-size="16" fill="${C.fg}" text-anchor="middle">${icon}</text>
    <text x="72" y="38"
          font-family="${MONO}" font-size="12" fill="${C.fg}"
          font-weight="500" letter-spacing="2.4">${label}</text>
    <text x="72" y="56" font-family="${SANS}" font-size="11" fill="${C.fgDim}">${desc}</text>

    ${statusPill(305 - (status.length * 6 + 24), 24, status, statusColor)}

    ${dotClock(165, 200, percent, value, valueLabel, stopped, enabled)}

    <rect x="125" y="306" width="80" height="28" fill="none" stroke="${btnColor}"/>
    <text x="165" y="324"
          font-family="${MONO}" font-size="10" fill="${btnColor}"
          letter-spacing="2.5" text-anchor="middle">${btnText}</text>
  </g>`;
}

function tabs(active) {
  const tabsList = ['DASHBOARD', 'SETTINGS'];
  let svg = '';
  let xPos = 40;
  for (const t of tabsList) {
    const isActive = t === active;
    svg += `<text x="${xPos}" y="72"
              font-family="${MONO}" font-size="11"
              fill="${isActive ? C.fg : C.fgDim}"
              font-weight="${isActive ? 500 : 400}"
              letter-spacing="2.5">${t}</text>`;
    if (isActive) {
      svg += `<line x1="${xPos}" y1="86" x2="${xPos + t.length * 8.5 + 12}" y2="86" stroke="${C.fg}" stroke-width="1.5"/>`;
    }
    xPos += t.length * 8.5 + 60;
  }
  svg += `<line x1="0" y1="88" x2="1100" y2="88" stroke="${C.border}"/>`;
  return svg;
}

function titleBar() {
  return `<rect x="0" y="0" width="1100" height="40" fill="${C.bg}"/>
    <text x="550" y="24" font-family="${MONO}" font-size="11"
          fill="#666" letter-spacing="2" text-anchor="middle">PAUSELY</text>`;
}

function pageHeading(overline, title, badge) {
  return `<text x="40" y="135" font-family="${MONO}" font-size="11"
            fill="${C.fgDim}" letter-spacing="3">// ${overline}</text>
    <text x="40" y="172" font-family="${MONO}" font-size="26" font-weight="700"
          fill="${C.fg}" letter-spacing="-0.6">${title}</text>
    <text x="1060" y="172" font-family="${MONO}" font-size="10"
          fill="${C.fgDim}" letter-spacing="2.5" text-anchor="end">${badge}</text>`;
}

function footer() {
  return `<line x1="40" y1="668" x2="1060" y2="668" stroke="${C.border}"/>
    <text x="40" y="686" font-family="${MONO}" font-size="10"
          fill="${C.fgDim}" letter-spacing="2.5">PAUSELY · TIMER UTILITY</text>
    <text x="1060" y="686" font-family="${MONO}" font-size="10"
          fill="${C.fgDim}" letter-spacing="2" text-anchor="end">MADE WITH ♥ BY <tspan fill="${C.fg}">GOPU</tspan></text>`;
}

function glowFilter() {
  return `<defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function dashboardSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 700" width="1100" height="700">
  ${defs()}
  ${glowFilter()}
  ${dotsBackground(1100, 700)}
  ${titleBar()}
  ${tabs('DASHBOARD')}
  ${pageHeading('SYSTEM STATUS', 'PAUSELY', 'v1.1.0 · ONLINE')}

  <rect x="40" y="200" width="1020" height="48" fill="${C.surface}" stroke="${C.border}"/>
  <text x="60" y="231" font-family="${MONO}" font-size="11" fill="${C.fgDim}" letter-spacing="2.5">SCREEN TIME / SESSION</text>
  <text x="1040" y="231" font-family="${MONO}" font-size="13" fill="${C.fg}" letter-spacing="1" text-anchor="end">23m <tspan fill="${C.fgDim}"> / 60m</tspan></text>

  ${reminderCard(40, 280, {
    icon: '☕', label: 'BREAK', desc: 'Stand up & stretch',
    percent: 31, value: '31:24', valueLabel: 'REMAINING',
    status: 'ACTIVE', statusColor: C.fg, btnText: '↺ RESET',
    btnColor: C.fg, stopped: false, enabled: true,
  })}

  ${reminderCard(385, 280, {
    icon: '◇', label: 'WATER', desc: 'Stay hydrated',
    percent: 100, value: '00:00', valueLabel: 'STOPPED',
    status: 'STOPPED', statusColor: C.accent, btnText: '↺ RESTART',
    btnColor: C.accent, stopped: true, enabled: true,
  })}

  ${reminderCard(730, 280, {
    icon: '▣', label: 'SCREEN BREAK', desc: 'Pause from the screen',
    percent: 38, value: '37m', valueLabel: 'REMAINING',
    status: 'ACTIVE', statusColor: C.fg, btnText: '↺ RESET',
    btnColor: C.fg, stopped: false, enabled: true,
  })}

  ${footer()}
</svg>`;
}

// ─── Settings ────────────────────────────────────────────────────────────────
function settingsRow(y, { icon, title, subtitle, value, on }) {
  const switchX  = 980;
  const switchW  = 38;
  const switchH  = 18;
  const handleW  = 12;
  const handleX  = on ? switchX + switchW - handleW - 3 : switchX + 3;
  const trackFill = on ? C.accent : C.border;

  return `<g transform="translate(40 ${y})">
    <rect width="540" height="120" fill="${C.surface}" stroke="${C.border}"/>

    <rect x="22" y="22" width="36" height="36" fill="${C.bg}" stroke="${C.border}"/>
    <text x="40" y="46" font-family="${SANS}" font-size="16" fill="${C.fg}" text-anchor="middle">${icon}</text>

    <text x="72" y="38" font-family="${MONO}" font-size="12" fill="${C.fg}"
          font-weight="500" letter-spacing="2.4">${title}</text>
    <text x="72" y="56" font-family="${SANS}" font-size="11" fill="${C.fgDim}">${subtitle}</text>

    <!-- Switch -->
    <rect x="${switchX - 40}" y="22" width="${switchW + 0}" height="${switchH}" fill="${C.bg}" stroke="${trackFill}"/>
    <rect x="${(on ? switchX - 40 + switchW - handleW - 3 : switchX - 40 + 3)}" y="${22 + 3}" width="${handleW}" height="${handleW}" fill="${C.fg}"/>

    <!-- Form line -->
    <text x="22" y="98" font-family="${MONO}" font-size="11" fill="${C.fgDim}"
          letter-spacing="2">${title === 'SCREEN BREAK' ? 'ALERT AFTER' : 'EVERY'}</text>

    <rect x="170" y="83" width="180" height="28" fill="${C.bg}" stroke="${C.border}"/>
    <text x="184" y="103" font-family="${MONO}" font-size="13" fill="${C.fg}">${value}</text>
    <rect x="298" y="83" width="52" height="28" fill="${C.surface}" stroke="${C.border}"/>
    <text x="324" y="103" font-family="${MONO}" font-size="11" fill="${C.fgDim}"
          letter-spacing="2" text-anchor="middle">MIN</text>
  </g>`;
}

function settingsSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 700" width="1100" height="700">
  ${defs()}
  ${dotsBackground(1100, 700)}
  ${titleBar()}
  ${tabs('SETTINGS')}
  ${pageHeading('CONFIGURATION', 'SETTINGS', 'v1.1.0 · ONLINE')}

  ${settingsRow(210, { icon: '☕', title: 'BREAK',         subtitle: 'Stand up and stretch',          value: '45',  on: true })}
  ${settingsRow(346, { icon: '◇', title: 'WATER',         subtitle: 'Stay hydrated',                  value: '90',  on: true })}
  ${settingsRow(482, { icon: '▣', title: 'SCREEN BREAK',  subtitle: 'Take a short break after set time', value: '60', on: true })}

  <!-- Save button -->
  <rect x="40" y="618" width="180" height="36" fill="${C.accent}" stroke="${C.accent}"/>
  <text x="130" y="641" font-family="${MONO}" font-size="11" fill="${C.fg}"
        letter-spacing="2.5" text-anchor="middle">▢ SAVE SETTINGS</text>
  <text x="240" y="641" font-family="${MONO}" font-size="10" fill="${C.fgDim}"
        letter-spacing="2">→ RESETS ALL ACTIVE TIMERS</text>
</svg>`;
}

// ─── Notification popup ──────────────────────────────────────────────────────
function notificationSvg() {
  const W = 410;
  const H = 200;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${defs()}
  <rect width="${W}" height="${H}" fill="#0a0a0a"/>

  <!-- Two stacked notifications -->
  <g transform="translate(8 12)">
    <rect width="380" height="78" fill="${C.surface}" stroke="${C.border}"/>
    <rect width="380" height="2" fill="${C.accent}"/>
    <!-- subtle dot pattern inside card -->
    <rect width="380" height="78" fill="url(#dots)" opacity="0.5"/>

    <rect x="13" y="15" width="34" height="34" fill="${C.bg}" stroke="${C.border}"/>
    <text x="30" y="38" font-family="${SANS}" font-size="15" fill="${C.fg}" text-anchor="middle">◐</text>

    <text x="60" y="32" font-family="${MONO}" font-size="11" fill="${C.fg}"
          font-weight="500" letter-spacing="2.2">1 MIN TO BREAK</text>
    <text x="60" y="52" font-family="${SANS}" font-size="12" fill="${C.fgDim}">Your break is coming up in 1 minute.</text>

    <rect x="346" y="13" width="22" height="22" fill="none" stroke="${C.border}"/>
    <text x="357" y="29" font-family="${MONO}" font-size="11" fill="${C.fgDim}" text-anchor="middle">✕</text>
  </g>

  <g transform="translate(8 100)">
    <rect width="380" height="78" fill="${C.surface}" stroke="${C.border}"/>
    <rect width="240" height="2" fill="${C.accent}"/>
    <rect width="380" height="78" fill="url(#dots)" opacity="0.5"/>

    <rect x="13" y="15" width="34" height="34" fill="${C.bg}" stroke="${C.border}"/>
    <text x="30" y="38" font-family="${SANS}" font-size="15" fill="${C.fg}" text-anchor="middle">◇</text>

    <text x="60" y="42" font-family="${MONO}" font-size="28" font-weight="600"
          fill="${C.accent}">10s</text>
    <text x="118" y="42" font-family="${MONO}" font-size="10" fill="${C.fgDim}"
          letter-spacing="2">→ WATER</text>

    <rect x="346" y="13" width="22" height="22" fill="none" stroke="${C.border}"/>
    <text x="357" y="29" font-family="${MONO}" font-size="11" fill="${C.fgDim}" text-anchor="middle">✕</text>
  </g>
</svg>`;
}

// ─── Reminder modal ──────────────────────────────────────────────────────────
function modalSvg() {
  const W = 1100;
  const H = 700;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${defs()}
  <!-- Faux desktop background -->
  <rect width="${W}" height="${H}" fill="#1a1a1a"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>

  <!-- Overlay dim with dot pattern -->
  <rect width="${W}" height="${H}" fill="rgba(0,0,0,0.78)"/>
  <pattern id="overlayDots" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
    <circle cx="3" cy="3" r="1" fill="rgba(60,60,60,0.7)"/>
  </pattern>
  <rect width="${W}" height="${H}" fill="url(#overlayDots)"/>

  <!-- Modal card -->
  <g transform="translate(310 130)">
    <rect width="480" height="440" fill="rgba(10,10,10,0.92)" stroke="${C.border}"/>

    <!-- progress bar (red, top) -->
    <rect width="480" height="3" fill="${C.accent}"/>

    <!-- Top tag (left) with blinking red dot -->
    <circle cx="29" cy="38" r="3" fill="${C.accent}"/>
    <text x="40" y="42" font-family="${MONO}" font-size="10" fill="${C.fgDim}"
          letter-spacing="2.4">SYS · BREAK</text>

    <!-- Top corner (right) -->
    <text x="458" y="42" font-family="${MONO}" font-size="10" fill="${C.fgDim}"
          letter-spacing="2.4" text-anchor="end">[ PAUSELY ]</text>

    <!-- Icon -->
    <rect x="202" y="84" width="76" height="76" fill="${C.bg}" stroke="${C.border}"/>
    <text x="240" y="135" font-family="${SANS}" font-size="36" fill="${C.fg}" text-anchor="middle">◐</text>

    <!-- Title -->
    <text x="240" y="206" font-family="${MONO}" font-size="22" font-weight="600"
          fill="${C.fg}" letter-spacing="1.2" text-anchor="middle">TIME FOR A BREAK</text>

    <!-- Body -->
    <text x="240" y="246" font-family="${SANS}" font-size="14" fill="${C.fgDim}"
          text-anchor="middle">Stand up, stretch, and look at something</text>
    <text x="240" y="266" font-family="${SANS}" font-size="14" fill="${C.fgDim}"
          text-anchor="middle">far away for a moment.</text>

    <!-- Buttons -->
    <rect x="79"  y="316" width="150" height="40" fill="none" stroke="${C.accent}"/>
    <text x="154" y="341" font-family="${MONO}" font-size="11" fill="${C.accent}"
          letter-spacing="2.5" text-anchor="middle">↺ RESTART TIMER</text>

    <rect x="251" y="316" width="150" height="40" fill="none" stroke="${C.border}"/>
    <text x="326" y="341" font-family="${MONO}" font-size="11" fill="${C.fgDim}"
          letter-spacing="2.5" text-anchor="middle">⟲ CLOSE (3)</text>
  </g>
</svg>`;
}

// ─── Write all ───────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(OUT, 'dashboard.svg'),    dashboardSvg());
fs.writeFileSync(path.join(OUT, 'settings.svg'),     settingsSvg());
fs.writeFileSync(path.join(OUT, 'notification.svg'), notificationSvg());
fs.writeFileSync(path.join(OUT, 'modal.svg'),        modalSvg());

console.log('Generated:');
console.log(' - docs/screenshots/dashboard.svg');
console.log(' - docs/screenshots/settings.svg');
console.log(' - docs/screenshots/notification.svg');
console.log(' - docs/screenshots/modal.svg');
