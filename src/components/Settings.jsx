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
import {
  CoffeeOutlined,
  ExperimentOutlined,
  DesktopOutlined,
  SaveOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

const FG     = '#ffffff';
const FG_DIM = '#888888';
const BORDER = '#333333';

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

function ReminderSection({ icon, name, title, subtitle, valueKey, addonAfter, max }) {
  return (
    <Card
      style={{
        background: '#0d0d0d',
        border: `1px solid ${BORDER}`,
        marginBottom: 14,
      }}
      styles={{ body: { padding: '20px 24px' } }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span
            style={{
              width: 36,
              height: 36,
              border: `1px solid ${BORDER}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 16,
              color: FG,
            }}
          >
            {icon}
          </span>
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
    <div style={{ paddingTop: 24, maxWidth: 620 }}>
      {contextHolder}

      <div style={{ marginBottom: 22 }}>
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

      <Form
        form={form}
        layout="horizontal"
        labelCol={{ style: { minWidth: 130 } }}
        onFinish={handleFinish}
        onValuesChange={() => setHasChanges(true)}
        initialValues={settings}
      >
        <ReminderSection
          icon={<CoffeeOutlined />}
          name="break"
          title="Break"
          subtitle="Stand up and stretch"
          valueKey="interval"
          addonAfter="MIN"
          max={480}
        />

        <ReminderSection
          icon={<ExperimentOutlined />}
          name="water"
          title="Water"
          subtitle="Stay hydrated"
          valueKey="interval"
          addonAfter="MIN"
          max={480}
        />

        <ReminderSection
          icon={<DesktopOutlined />}
          name="screenTime"
          title="Screen Break"
          subtitle="Take a short break after set time"
          valueKey="threshold"
          addonAfter="MIN"
          max={1440}
        />

        <Form.Item style={{ marginTop: 24, marginBottom: 14 }}>
          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            disabled={!hasChanges}
            style={{ height: 40, paddingInline: 28 }}
          >
            Save Settings
          </Button>
        </Form.Item>

        <Text
          style={{
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
