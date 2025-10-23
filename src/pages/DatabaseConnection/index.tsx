import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  message,
  Typography,
  Row,
  Col,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Title } = Typography;
const { Option } = Select;

interface DatabaseConnection {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'oracle' | 'sqlserver';
  host: string;
  port: number;
  database: string;
  username: string;
  status: 'connected' | 'disconnected' | 'error';
  createTime: string;
  lastTestTime: string;
}

const DatabaseConnection: React.FC = () => {
  const [connections, setConnections] = useState<DatabaseConnection[]>([
    {
      id: '1',
      name: 'HIS主数据库',
      type: 'mysql',
      host: '192.168.1.100',
      port: 3306,
      database: 'his_main',
      username: 'his_user',
      status: 'connected',
      createTime: '2024-01-10 09:00:00',
      lastTestTime: '2024-01-15 16:30:00',
    },
    {
      id: '2',
      name: 'LIS检验系统',
      type: 'oracle',
      host: '192.168.1.101',
      port: 1521,
      database: 'lis_db',
      username: 'lis_user',
      status: 'connected',
      createTime: '2024-01-10 10:30:00',
      lastTestTime: '2024-01-15 15:45:00',
    },
    {
      id: '3',
      name: 'PACS影像系统',
      type: 'postgresql',
      host: '192.168.1.102',
      port: 5432,
      database: 'pacs_db',
      username: 'pacs_user',
      status: 'error',
      createTime: '2024-01-10 11:15:00',
      lastTestTime: '2024-01-15 14:20:00',
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null);
  const [form] = Form.useForm();

  // 数据库类型配置
  const dbTypeOptions = [
    { value: 'mysql', label: 'MySQL', port: 3306 },
    { value: 'postgresql', label: 'PostgreSQL', port: 5432 },
    { value: 'oracle', label: 'Oracle', port: 1521 },
    { value: 'sqlserver', label: 'SQL Server', port: 1433 },
  ];

  // 状态标签渲染
  const renderStatusTag = (status: string) => {
    const statusConfig = {
      connected: { color: 'success', icon: <CheckCircleOutlined />, text: '已连接' },
      disconnected: { color: 'default', icon: <ExclamationCircleOutlined />, text: '未连接' },
      error: { color: 'error', icon: <ExclamationCircleOutlined />, text: '连接错误' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  // 表格列配置
  const columns: ColumnsType<DatabaseConnection> = [
    {
      title: '连接名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '数据库类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const typeConfig = dbTypeOptions.find(opt => opt.value === type);
        return typeConfig?.label || type.toUpperCase();
      },
    },
    {
      title: '主机地址',
      dataIndex: 'host',
      key: 'host',
      width: 150,
    },
    {
      title: '端口',
      dataIndex: 'port',
      key: 'port',
      width: 80,
    },
    {
      title: '数据库名',
      dataIndex: 'database',
      key: 'database',
      width: 120,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: renderStatusTag,
    },
    {
      title: '最后测试时间',
      dataIndex: 'lastTestTime',
      key: 'lastTestTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            size="small"
            onClick={() => handleTestConnection(record.id)}
          >
            测试连接
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个数据库连接吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理新增连接
  const handleAdd = () => {
    setEditingConnection(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 处理编辑连接
  const handleEdit = (connection: DatabaseConnection) => {
    setEditingConnection(connection);
    form.setFieldsValue(connection);
    setIsModalVisible(true);
  };

  // 处理删除连接
  const handleDelete = (id: string) => {
    setConnections(connections.filter(conn => conn.id !== id));
    message.success('数据库连接已删除');
  };

  // 处理测试连接
  const handleTestConnection = async (id: string) => {
    message.loading({ content: '正在测试连接...', key: 'test' });
    
    // 模拟测试连接
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% 成功率
      
      setConnections(prev => prev.map(conn => 
        conn.id === id 
          ? { 
              ...conn, 
              status: success ? 'connected' : 'error',
              lastTestTime: new Date().toLocaleString('zh-CN')
            }
          : conn
      ));

      message.destroy('test');
      if (success) {
        message.success('连接测试成功');
      } else {
        message.error('连接测试失败，请检查配置');
      }
    }, 2000);
  };

  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingConnection) {
        // 编辑模式
        setConnections(prev => prev.map(conn => 
          conn.id === editingConnection.id 
            ? { ...conn, ...values }
            : conn
        ));
        message.success('数据库连接已更新');
      } else {
        // 新增模式
        const newConnection: DatabaseConnection = {
          ...values,
          id: Date.now().toString(),
          status: 'disconnected' as const,
          createTime: new Date().toLocaleString('zh-CN'),
          lastTestTime: '-',
        };
        setConnections(prev => [...prev, newConnection]);
        message.success('数据库连接已添加');
      }
      
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理数据库类型变化
  const handleDbTypeChange = (type: string) => {
    const typeConfig = dbTypeOptions.find(opt => opt.value === type);
    if (typeConfig) {
      form.setFieldsValue({ port: typeConfig.port });
    }
  };

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24 }}>
        <DatabaseOutlined style={{ marginRight: 8 }} />
        数据库连接管理
      </Title>

      {/* 统计信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
                {connections.length}
              </div>
              <div style={{ color: '#666' }}>总连接数</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
                {connections.filter(conn => conn.status === 'connected').length}
              </div>
              <div style={{ color: '#666' }}>已连接</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff4d4f' }}>
                {connections.filter(conn => conn.status === 'error').length}
              </div>
              <div style={{ color: '#666' }}>连接异常</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 连接列表 */}
      <Card
        title="数据库连接列表"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增连接
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={connections}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 新增/编辑连接弹窗 */}
      <Modal
        title={editingConnection ? '编辑数据库连接' : '新增数据库连接'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ port: 3306 }}
        >
          <Form.Item
            name="name"
            label="连接名称"
            rules={[{ required: true, message: '请输入连接名称' }]}
          >
            <Input placeholder="请输入连接名称" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="数据库类型"
                rules={[{ required: true, message: '请选择数据库类型' }]}
              >
                <Select placeholder="请选择数据库类型" onChange={handleDbTypeChange}>
                  {dbTypeOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="port"
                label="端口"
                rules={[{ required: true, message: '请输入端口号' }]}
              >
                <Input type="number" placeholder="请输入端口号" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="host"
            label="主机地址"
            rules={[{ required: true, message: '请输入主机地址' }]}
          >
            <Input placeholder="请输入主机地址" />
          </Form.Item>

          <Form.Item
            name="database"
            label="数据库名"
            rules={[{ required: true, message: '请输入数据库名' }]}
          >
            <Input placeholder="请输入数据库名" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password placeholder="请输入密码" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default DatabaseConnection;