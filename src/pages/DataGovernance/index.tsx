import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Progress,
  Tag,
  Modal,
  Form,
  Select,
  Input,
  Table,
  Space,
  Typography,
  Divider,
  Alert,
  Statistic,
} from 'antd';
import {
  PlayCircleOutlined,
  PauseCircleOutlined,
  SettingOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  StopOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface GovernanceTask {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error' | 'paused';
  progress: number;
  processedRecords: number;
  totalRecords: number;
  startTime?: string;
  endTime?: string;
  errorMessage?: string;
}

interface TaskLog {
  id: string;
  taskId: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error';
  message: string;
}

const DataGovernance: React.FC = () => {
  const [tasks, setTasks] = useState<GovernanceTask[]>([
    {
      id: '1',
      name: '数据清洗',
      description: '清理无效字符，确保数据质量',
      status: 'completed',
      progress: 100,
      processedRecords: 1180000,
      totalRecords: 1180000,
      startTime: '2024-01-15 09:00:00',
      endTime: '2024-01-15 10:30:00',
    },
    {
      id: '2',
      name: '数据去重',
      description: '移除重复数据，防止数据失真',
      status: 'running',
      progress: 75,
      processedRecords: 33750,
      totalRecords: 45000,
      startTime: '2024-01-15 14:20:00',
    },
    {
      id: '3',
      name: '类型转换',
      description: '将字符串类型转换为数据模型定义的标准类型',
      status: 'idle',
      progress: 0,
      processedRecords: 0,
      totalRecords: 850000,
    },
    {
      id: '4',
      name: '标准字典对照',
      description: '将多源数据字典统一为标准字典',
      status: 'completed',
      progress: 100,
      processedRecords: 850000,
      totalRecords: 850000,
      startTime: '2024-01-15 11:00:00',
      endTime: '2024-01-15 12:45:00',
    },
    {
      id: '5',
      name: 'EMPI发放',
      description: '为同一患者发放唯一主索引',
      status: 'error',
      progress: 30,
      processedRecords: 37500,
      totalRecords: 125000,
      startTime: '2024-01-15 13:15:00',
      errorMessage: '身份证号格式验证失败',
    },
    {
      id: '6',
      name: 'EMOI发放',
      description: '为检查检验发放就诊唯一主索引',
      status: 'idle',
      progress: 0,
      processedRecords: 0,
      totalRecords: 95000,
    },
    {
      id: '7',
      name: '数据归一',
      description: '统一数据格式和标准值',
      status: 'completed',
      progress: 100,
      processedRecords: 920000,
      totalRecords: 920000,
      startTime: '2024-01-15 08:00:00',
      endTime: '2024-01-15 09:30:00',
    },
    {
      id: '8',
      name: '孤儿数据处理',
      description: '清理无法关联主表的无效数据',
      status: 'running',
      progress: 60,
      processedRecords: 9000,
      totalRecords: 15000,
      startTime: '2024-01-15 15:30:00',
    },
    {
      id: '9',
      name: '数据脱敏',
      description: '保护敏感数据安全',
      status: 'idle',
      progress: 0,
      processedRecords: 0,
      totalRecords: 680000,
    },
  ]);

  const [selectedTask, setSelectedTask] = useState<GovernanceTask | null>(null);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [logModalVisible, setLogModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 模拟任务日志
  const [taskLogs] = useState<TaskLog[]>([
    {
      id: '1',
      taskId: '2',
      timestamp: '2024-01-15 14:25:30',
      level: 'info',
      message: '开始处理表 t_patient_info，预计处理 15000 条记录',
    },
    {
      id: '2',
      taskId: '2',
      timestamp: '2024-01-15 14:26:15',
      level: 'info',
      message: '已处理 5000 条记录，发现重复记录 120 条',
    },
    {
      id: '3',
      taskId: '2',
      timestamp: '2024-01-15 14:27:00',
      level: 'warning',
      message: '发现异常数据格式，已自动跳过处理',
    },
    {
      id: '4',
      taskId: '2',
      timestamp: '2024-01-15 14:28:45',
      level: 'info',
      message: '已处理 10000 条记录，当前进度 66.7%',
    },
  ]);

  // 状态标签渲染
  const renderStatusTag = (status: string) => {
    const statusConfig = {
      idle: { color: 'default', icon: <ClockCircleOutlined />, text: '待执行' },
      running: { color: 'processing', icon: <PlayCircleOutlined />, text: '运行中' },
      completed: { color: 'success', icon: <CheckCircleOutlined />, text: '已完成' },
      error: { color: 'error', icon: <ExclamationCircleOutlined />, text: '执行错误' },
      paused: { color: 'warning', icon: <PauseCircleOutlined />, text: '已暂停' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 处理任务操作
  const handleTaskAction = (taskId: string, action: 'start' | 'pause' | 'stop' | 'config') => {
    if (action === 'config') {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
        setConfigModalVisible(true);
      }
      return;
    }

    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        switch (action) {
          case 'start':
            return {
              ...task,
              status: 'running' as const,
              startTime: new Date().toLocaleString('zh-CN'),
            };
          case 'pause':
            return { ...task, status: 'paused' as const };
          case 'stop':
            return {
              ...task,
              status: 'idle' as const,
              progress: 0,
              processedRecords: 0,
              startTime: undefined,
              endTime: undefined,
            };
          default:
            return task;
        }
      }
      return task;
    }));
  };

  // 查看任务日志
  const handleViewLogs = (task: GovernanceTask) => {
    setSelectedTask(task);
    setLogModalVisible(true);
  };

  // 日志表格列配置
  const logColumns: ColumnsType<TaskLog> = [
    {
      title: '时间',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (level: string) => {
        const levelConfig = {
          info: { color: 'blue', text: '信息' },
          warning: { color: 'orange', text: '警告' },
          error: { color: 'red', text: '错误' },
        };
        const config = levelConfig[level as keyof typeof levelConfig];
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
    },
  ];

  // 渲染任务卡片
  const renderTaskCard = (task: GovernanceTask) => {
    const canStart = task.status === 'idle' || task.status === 'paused';
    const canPause = task.status === 'running';
    const canStop = task.status === 'running' || task.status === 'paused';

    return (
      <Card
        key={task.id}
        title={
          <Space>
            <span>{task.name}</span>
            {renderStatusTag(task.status)}
          </Space>
        }
        extra={
          <Space>
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => handleTaskAction(task.id, 'config')}
            >
              配置
            </Button>
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => handleViewLogs(task)}
            >
              日志
            </Button>
          </Space>
        }
        style={{ height: '100%' }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">{task.description}</Text>
        </div>

        {task.status === 'error' && task.errorMessage && (
          <Alert
            message={task.errorMessage}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span>执行进度</span>
            <span>{task.progress}%</span>
          </div>
          <Progress
            percent={task.progress}
            status={task.status === 'error' ? 'exception' : task.progress === 100 ? 'success' : 'active'}
          />
        </div>

        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={12}>
            <Statistic
              title="已处理"
              value={task.processedRecords}
              formatter={(value) => `${Number(value).toLocaleString()}`}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="总记录数"
              value={task.totalRecords}
              formatter={(value) => `${Number(value).toLocaleString()}`}
            />
          </Col>
        </Row>

        {task.startTime && (
          <div style={{ marginBottom: 16 }}>
            <Text type="secondary">开始时间: {task.startTime}</Text>
            {task.endTime && (
              <>
                <br />
                <Text type="secondary">结束时间: {task.endTime}</Text>
              </>
            )}
          </div>
        )}

        <Space>
          {canStart && (
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              onClick={() => handleTaskAction(task.id, 'start')}
            >
              开始
            </Button>
          )}
          {canPause && (
            <Button
              icon={<PauseCircleOutlined />}
              onClick={() => handleTaskAction(task.id, 'pause')}
            >
              暂停
            </Button>
          )}
          {canStop && (
            <Button
              danger
              icon={<StopOutlined />}
              onClick={() => handleTaskAction(task.id, 'stop')}
            >
              停止
            </Button>
          )}
        </Space>
      </Card>
    );
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        <SettingOutlined style={{ marginRight: 8 }} />
        数据治理
      </Title>

      <Alert
        message="数据治理说明"
        description="数据治理包含九个核心功能模块，每个模块都可以独立配置和执行。请按照业务需求选择合适的执行顺序，建议按照数据清洗 → 去重 → 类型转换 → 字典对照 → EMPI/EMOI发放 → 数据归一 → 孤儿数据处理 → 数据脱敏的顺序执行。"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Row gutter={[16, 16]}>
        {tasks.map(task => (
          <Col xs={24} sm={12} lg={8} key={task.id}>
            {renderTaskCard(task)}
          </Col>
        ))}
      </Row>

      {/* 任务配置弹窗 */}
      <Modal
        title={`配置任务: ${selectedTask?.name}`}
        open={configModalVisible}
        onCancel={() => setConfigModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setConfigModalVisible(false)}>
            取消
          </Button>,
          <Button key="save" type="primary">
            保存配置
          </Button>,
        ]}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="执行模式" name="mode">
            <Select placeholder="请选择执行模式">
              <Option value="full">全量处理</Option>
              <Option value="incremental">增量处理</Option>
              <Option value="custom">自定义范围</Option>
            </Select>
          </Form.Item>

          <Form.Item label="目标表" name="tables">
            <Select mode="multiple" placeholder="请选择要处理的表">
              <Option value="t_patient_info">患者信息表</Option>
              <Option value="t_medical_record">病案首页</Option>
              <Option value="t_examination_report">检查报告表</Option>
              <Option value="t_lab_item">检验项目表</Option>
            </Select>
          </Form.Item>

          <Form.Item label="并发数" name="concurrency">
            <Select placeholder="请选择并发处理数">
              <Option value={1}>1 (串行)</Option>
              <Option value={2}>2</Option>
              <Option value={4}>4</Option>
              <Option value={8}>8</Option>
            </Select>
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <TextArea rows={3} placeholder="请输入任务备注信息" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 任务日志弹窗 */}
      <Modal
        title={`任务日志: ${selectedTask?.name}`}
        open={logModalVisible}
        onCancel={() => setLogModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setLogModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <Table
          columns={logColumns}
          dataSource={taskLogs.filter(log => log.taskId === selectedTask?.id)}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Modal>
    </div>
  );
};

export default DataGovernance;