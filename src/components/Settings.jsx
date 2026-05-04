import React, { useEffect, useState } from 'react';
import {
  Form,
  InputNumber,
  Switch,
  Button,
  Card,
  Typography,
  message,
  Skeleton,
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';

import breakMascot   from '../../assets/mascot/break.png';
import waterMascot   from '../../assets/mascot/water.png';
import screenMascot  from '../../assets/mascot/screen.png';

const { Text } = Typography;

const FG      = '#ffffff';
const FG_DIM  = '#999999';
const BORDER  = '#3d3d3d';
const SURFACE = '#2a2a2a';

const MONO_LABEL = {
  fontFamily: "'JetBrains Mono', 'Consolas', monospace",
  fontSize: 12,
  fontWeight: 500,
  color: FG,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  display: 'block',
};

const SUB_TEXT = { fontSize: 11, color: FG_DIM, fontWeight: 300, letterSpacing: '0.04em' };

// ─── Settings ─────────────────────────────────────────────────────────────────

function ReminderSection({ mascot, name, title, subtitle, valueKey, addonAfter, max }) {
  return (
    <Card
      style={{
        background: SURFACE,
        border: `1px solid ${BORDER}`,
        marginBottom: 14,
      }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <img src={mascot} alt="" style={{ width: 48, height: 48, objectFit: 'contain', flexShrink: 0 }} />
          <div>
            <Text style={MONO_LABEL}>{title}</Text>
            <Text style={SUB_TEXT}>{subtitle}</Text>
          </div>
        </div>
        <Form.Item name={[name, 'enabled']} valuePropName="checked" noStyle>
          <Switch size="small" />
        </Form.Item>
      </div>
      <Form.Item
        label={valueKey === 'threshold' ? 'Alert After' : 'Every'}
        name={[name, valueKey]}
        rules={[{ required: true, type: 'number', min: 1, max }]}
        style={{ marginBottom: 0 }}
      >
        <InputNumber
          min={1}
          max={max}
          addonAfter={addonAfter}
          style={{ width: 180 }}
        />
      </Form.Item>
    </Card>
  );
}

export default function Settings({ settings, onSave }) {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
      setHasChanges(false);
    }
  }, [settings, form]);

  const handleFinish = async (values) => {
    await onSave(values);
    setHasChanges(false);
    messageApi.success({ content: 'Settings saved · Timers reset', duration: 2.5 });
  };

  if (!settings) {
    return (
      <div style={{ paddingTop: 24 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 24 }}>
      {contextHolder}

      <Form
        form={form}
        layout="horizontal"
        labelCol={{ style: { minWidth: 130 } }}
        onFinish={handleFinish}
        onValuesChange={() => setHasChanges(true)}
        initialValues={settings}
      >
        {/* Heading row with the Save Settings button at the top */}
        <div
          style={{
            marginBottom: 20,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
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
              // Configuration
            </Text>
            <Text style={{ fontSize: 26, fontWeight: 700, color: FG, letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              Settings
            </Text>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              disabled={!hasChanges}
              style={{ height: 40, paddingInline: 28 }}
            >
              Save Settings
            </Button>
            <Text
              style={{
                fontFamily: "'JetBrains Mono', 'Consolas', monospace",
                fontSize: 9,
                color: FG_DIM,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
              }}
            >
              {hasChanges ? '→ Click to save changes' : '→ Edit a value below to enable'}
            </Text>
          </div>
        </div>

        <ReminderSection
          mascot={breakMascot}
          name="break"
          title="Break"
          subtitle="Stand up and stretch"
          valueKey="interval"
          addonAfter="MIN"
          max={480}
        />

        <ReminderSection
          mascot={waterMascot}
          name="water"
          title="Water"
          subtitle="Stay hydrated"
          valueKey="interval"
          addonAfter="MIN"
          max={480}
        />

        <ReminderSection
          mascot={screenMascot}
          name="screenTime"
          title="Screen Break"
          subtitle="Take a short break after set time"
          valueKey="threshold"
          addonAfter="MIN"
          max={1440}
        />

        <Text
          style={{
            display: 'block',
            marginTop: 16,
            fontFamily: "'JetBrains Mono', 'Consolas', monospace",
            fontSize: 10,
            color: FG_DIM,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}
        >
          → Saving resets all active timers to their new intervals
        </Text>
      </Form>
    </div>
  );
}
