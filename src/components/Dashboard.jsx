import React from 'react';
import { Row, Col, Card, Typography, Button, Tooltip, Skeleton } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import DotClock from './DotClock';

import breakMascot   from '../../assets/mascot/break.png';
import waterMascot   from '../../assets/mascot/water.png';
import screenMascot  from '../../assets/mascot/screen.png';
import idleMascot    from '../../assets/mascot/idle.png';

const { Text } = Typography;

const ACCENT  = '#ff6b1a';
const FG      = '#ffffff';
const FG_DIM  = '#999999';
const BORDER  = '#3d3d3d';
const SURFACE = '#2a2a2a';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function formatElapsed(seconds) {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ enabled, stopped }) {
  let label = 'ACTIVE';
  let color = FG;
  if (!enabled) { label = 'OFF';     color = FG_DIM; }
  else if (stopped) { label = 'STOPPED'; color = ACCENT; }

  return (
    <span
      style={{
        fontFamily: "'JetBrains Mono', 'Consolas', monospace",
        fontSize: 10,
        letterSpacing: '0.16em',
        color,
        border: `1px solid ${color}`,
        padding: '3px 8px',
        textTransform: 'uppercase',
      }}
    >
      ● {label}
    </span>
  );
}

// ─── ReminderCard ─────────────────────────────────────────────────────────────

function ReminderCard({
  mascot,
  label,
  description,
  percent,
  countdown,
  enabled,
  stopped,
  onReset,
}) {
  return (
    <Card
      style={{
        border: `1px solid ${stopped ? ACCENT : BORDER}`,
        background: SURFACE,
        height: '100%',
      }}
      styles={{ body: { padding: 22 } }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img
            src={mascot}
            alt=""
            style={{ width: 44, height: 44, objectFit: 'contain', flexShrink: 0 }}
          />
          <div>
            <Text
              style={{
                fontSize: 12,
                fontWeight: 500,
                display: 'block',
                color: FG,
                fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </Text>
            <Text style={{ fontSize: 11, color: FG_DIM, fontWeight: 300, letterSpacing: '0.04em' }}>
              {description}
            </Text>
          </div>
        </div>
        <StatusPill enabled={enabled} stopped={stopped} />
      </div>

      {/* Dot-matrix clock */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <DotClock
          percent={percent}
          value={countdown}
          label={stopped ? 'STOPPED' : (enabled ? 'REMAINING' : 'OFF')}
          enabled={enabled}
          stopped={stopped}
          size={150}
        />

        <Tooltip title={stopped ? 'Restart timer' : 'Reset timer'}>
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={onReset}
            disabled={!enabled}
          >
            {stopped ? 'Restart' : 'Reset'}
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard({ timerState, onReset }) {
  if (!timerState) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Row gutter={[16, 16]}>
          {[0, 1, 2].map((i) => (
            <Col key={i} xs={24} sm={12} lg={8}>
              <Card><Skeleton active /></Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  }

  const { break: br, water, screenTime } = timerState;

  const breakPercent = br.total > 0
    ? ((br.total - br.remaining) / br.total) * 100
    : 0;

  const waterPercent = water.total > 0
    ? ((water.total - water.remaining) / water.total) * 100
    : 0;

  const screenPercent = screenTime.threshold > 0
    ? (screenTime.elapsed / screenTime.threshold) * 100
    : 0;

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Page heading */}
      <div style={{ marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={idleMascot} alt="" style={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0 }} />
          <div>
            <Text
              style={{
                fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                fontSize: 11,
                letterSpacing: '0.24em',
                color: FG_DIM,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 4,
              }}
            >
              // Hi, I'm your buddy
            </Text>
            <Text style={{ fontSize: 26, fontWeight: 700, color: FG, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              Pausely
            </Text>
          </div>
        </div>
        <Text
          style={{
            fontFamily: "'JetBrains Mono', 'Consolas', monospace",
            fontSize: 10,
            color: FG_DIM,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          v1.1.0 · ONLINE
        </Text>
      </div>

      {/* Screen time summary bar */}
      {screenTime.enabled && (
        <div
          style={{
            background: SURFACE,
            border: `1px solid ${BORDER}`,
            padding: '14px 20px',
            marginBottom: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Text
            style={{
              fontSize: 11,
              color: FG_DIM,
              fontFamily: "'JetBrains Mono', 'Consolas', monospace",
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
            }}
          >
            Screen Time / Session
          </Text>
          <Text
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: FG,
              fontFamily: "'JetBrains Mono', 'Consolas', monospace",
              letterSpacing: '0.04em',
            }}
          >
            {formatElapsed(screenTime.elapsed)}
            <Text style={{ fontSize: 13, color: FG_DIM, fontWeight: 300 }}>
              {' / '}{formatElapsed(screenTime.threshold)}
            </Text>
          </Text>
        </div>
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <ReminderCard
            mascot={breakMascot}
            label="Break"
            description="Stand up & stretch"
            percent={breakPercent}
            countdown={formatTime(br.remaining)}
            enabled={br.enabled}
            stopped={br.stopped}
            onReset={() => onReset('break')}
          />
        </Col>

        <Col xs={24} sm={8}>
          <ReminderCard
            mascot={waterMascot}
            label="Water"
            description="Stay hydrated"
            percent={waterPercent}
            countdown={formatTime(water.remaining)}
            enabled={water.enabled}
            stopped={water.stopped}
            onReset={() => onReset('water')}
          />
        </Col>

        <Col xs={24} sm={8}>
          <ReminderCard
            mascot={screenMascot}
            label="Screen Break"
            description="Pause from the screen"
            percent={screenPercent}
            countdown={formatElapsed(screenTime.elapsed)}
            enabled={screenTime.enabled}
            stopped={screenTime.stopped}
            onReset={() => onReset('screenTime')}
          />
        </Col>
      </Row>

      <div
        style={{
          marginTop: 28,
          paddingTop: 16,
          borderTop: `1px solid ${BORDER}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: "'JetBrains Mono', 'Consolas', monospace",
            fontSize: 10,
            color: FG_DIM,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          PAUSELY · TIMER UTILITY
        </Text>
        <Text
          style={{
            fontFamily: "'JetBrains Mono', 'Consolas', monospace",
            fontSize: 10,
            color: FG_DIM,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          made with ♥ by{' '}
          <a
            href="https://www.gopu.work"
            target="_blank"
            rel="noreferrer"
            style={{ color: FG, textDecoration: 'none', borderBottom: `1px solid ${FG}` }}
            onClick={(e) => { e.preventDefault(); window.electronAPI.openExternal('https://www.gopu.work'); }}
          >
            GOPU
          </a>
        </Text>
      </div>
    </div>
  );
}
