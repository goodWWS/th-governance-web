import { dataGovernanceService } from '@/services/dataGovernanceService'
import type { DbConnection } from '@/types'
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    DatabaseOutlined,
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    EyeInvisibleOutlined,
    EyeTwoTone,
    PlusOutlined,
    ReloadOutlined,
    SyncOutlined,
} from '@ant-design/icons'
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
    Typography,
    message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useEffect, useState } from 'react'

const { Title } = Typography
const { Option } = Select
const { confirm } = Modal

// 数据库连接接口定义
interface DatabaseConnection {
    id: string
    name: string
    type: 'mysql' | 'postgresql' | 'oracle' | 'sqlserver' | 'mongodb'
    host: string
    port: number
    database: string
    username: string
    password: string
    status: 'connected' | 'disconnected' | 'testing'
    lastTestTime?: string
    description?: string
    createdAt: string
    updatedAt: string
}

const DatabaseConnectionPage: React.FC = () => {
    const [form] = Form.useForm()
    const [connections, setConnections] = useState<DatabaseConnection[]>([])
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)
    const [editingConnection, setEditingConnection] = useState<DatabaseConnection | null>(null)
    const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set())

    // 初始化模拟数据
    const initMockData = () => {
        const mockConnections: DatabaseConnection[] = [
            {
                id: '1',
                name: '生产环境MySQL',
                type: 'mysql',
                host: '192.168.1.100',
                port: 3306,
                database: 'production_db',
                username: 'admin',
                password: 'password123',
                status: 'connected',
                lastTestTime: '2024-01-15 14:30:00',
                description: '生产环境主数据库',
                createdAt: '2024-01-10 09:00:00',
                updatedAt: '2024-01-15 14:30:00'
            },
            {
                id: '2',
                name: '测试环境PostgreSQL',
                type: 'postgresql',
                host: '192.168.1.101',
                port: 5432,
                database: 'test_db',
                username: 'testuser',
                password: 'testpass',
                status: 'connected',
                lastTestTime: '2024-01-15 10:15:00',
                description: '测试环境数据库',
                createdAt: '2024-01-12 10:00:00',
                updatedAt: '2024-01-15 10:15:00'
            },
            {
                id: '3',
                name: '开发环境MongoDB',
                type: 'mongodb',
                host: '192.168.1.102',
                port: 27017,
                database: 'dev_db',
                username: 'devuser',
                password: 'devpass',
                status: 'disconnected',
                lastTestTime: '2024-01-14 16:45:00',
                description: '开发环境NoSQL数据库',
                createdAt: '2024-01-08 15:30:00',
                updatedAt: '2024-01-14 16:45:00'
            }
        ]
        setConnections(mockConnections)
    }

    // 获取连接列表 - 模拟API调用
    const fetchConnections = async () => {
        setLoading(true)
        try {
            // 模拟API延迟
            await new Promise(resolve => setTimeout(resolve, 500))
            // 使用已有的连接数据，模拟刷新
            message.success('数据源列表已刷新')
        } catch (error) {
            message.error('获取数据源列表失败')
        } finally {
            setLoading(false)
        }
    }

    // 测试连接 - 模拟测试
    const handleTestConnection = async (connection: DatabaseConnection) => {
        const connectionId = connection.id
        setTestingConnections(prev => new Set(prev).add(connectionId))
        
        try {
            // 模拟测试延迟
            await new Promise(resolve => setTimeout(resolve, 2000))
            
            // 随机模拟测试结果
            const isSuccess = Math.random() > 0.3 // 70% 成功率
            
            if (isSuccess) {
                // 更新连接状态
                setConnections(prev => prev.map(conn => 
                    conn.id === connectionId 
                        ? { 
                            ...conn, 
                            status: 'connected', 
                            lastTestTime: new Date().toLocaleString('zh-CN')
                          }
                        : conn
                ))
                message.success(`数据源 "${connection.name}" 连接测试成功`)
            } else {
                setConnections(prev => prev.map(conn => 
                    conn.id === connectionId 
                        ? { 
                            ...conn, 
                            status: 'disconnected', 
                            lastTestTime: new Date().toLocaleString('zh-CN')
                          }
                        : conn
                ))
                message.error(`数据源 "${connection.name}" 连接测试失败`)
            }
        } catch (error) {
            message.error('连接测试失败')
        } finally {
            setTestingConnections(prev => {
                const newSet = new Set(prev)
                newSet.delete(connectionId)
                return newSet
            })
        }
    }

    // 删除连接
    const handleDeleteConnection = (connection: DatabaseConnection) => {
        confirm({
            title: '确认删除',
            icon: <ExclamationCircleOutlined />,
            content: `确定要删除数据源 "${connection.name}" 吗？此操作不可恢复。`,
            okText: '确认删除',
            okType: 'danger',
            cancelText: '取消',
            onOk: async () => {
                try {
                    // 模拟删除延迟
                    await new Promise(resolve => setTimeout(resolve, 300))
                    
                    setConnections(prev => prev.filter(conn => conn.id !== connection.id))
                    message.success(`数据源 "${connection.name}" 已删除`)
                } catch (error) {
                    message.error('删除数据源失败')
                }
            }
        })
    }

    // 编辑连接
    const handleEditConnection = (connection: DatabaseConnection) => {
        setEditingConnection(connection)
        form.setFieldsValue({
            ...connection,
            password: '' // 出于安全考虑，不显示密码
        })
        setModalVisible(true)
    }

    // 添加新连接
    const handleAddConnection = () => {
        setEditingConnection(null)
        form.resetFields()
        setModalVisible(true)
    }

    // 提交表单 - 添加或更新连接
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()
            
            // 模拟提交延迟
            await new Promise(resolve => setTimeout(resolve, 500))
            
            const now = new Date().toLocaleString('zh-CN')
            
            if (editingConnection) {
                // 更新现有连接
                setConnections(prev => prev.map(conn => 
                    conn.id === editingConnection.id 
                        ? { 
                            ...conn, 
                            ...values,
                            updatedAt: now,
                            status: 'disconnected' // 更新后需要重新测试连接
                          }
                        : conn
                ))
                message.success(`数据源 "${values.name}" 已更新`)
            } else {
                // 添加新连接
                const newConnection: DatabaseConnection = {
                    ...values,
                    id: Date.now().toString(),
                    status: 'disconnected',
                    createdAt: now,
                    updatedAt: now
                }
                setConnections(prev => [...prev, newConnection])
                message.success(`数据源 "${values.name}" 已添加`)
            }
            
            setModalVisible(false)
            form.resetFields()
        } catch (error) {
            message.error('保存数据源失败')
        }
    }

    // 取消编辑
    const handleCancel = () => {
        setModalVisible(false)
        form.resetFields()
        setEditingConnection(null)
    }

    // 统计数据
    const statistics = {
        total: connections.length,
        connected: connections.filter(conn => conn.status === 'connected').length,
        disconnected: connections.filter(conn => conn.status === 'disconnected').length,
        testing: connections.filter(conn => testingConnections.has(conn.id)).length
    }

    // 表格列定义
    const columns: ColumnsType<DatabaseConnection> = [
        {
            title: '数据源名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: DatabaseConnection) => (
                <Space>
                    <DatabaseOutlined />
                    <span style={{ fontWeight: 500 }}>{text}</span>
                </Space>
            ),
        },
        {
            title: '数据库类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => {
                const typeMap = {
                    mysql: { color: 'blue', text: 'MySQL' },
                    postgresql: { color: 'cyan', text: 'PostgreSQL' },
                    oracle: { color: 'red', text: 'Oracle' },
                    sqlserver: { color: 'purple', text: 'SQL Server' },
                    mongodb: { color: 'green', text: 'MongoDB' }
                }
                const config = typeMap[type as keyof typeof typeMap]
                return <Tag color={config.color}>{config.text}</Tag>
            },
        },
        {
            title: '连接地址',
            key: 'address',
            render: (_, record: DatabaseConnection) => `${record.host}:${record.port}`,
        },
        {
            title: '数据库名',
            dataIndex: 'database',
            key: 'database',
        },
        {
            title: '连接状态',
            dataIndex: 'status',
            key: 'status',
            render: (status: string, record: DatabaseConnection) => {
                if (testingConnections.has(record.id)) {
                    return (
                        <Tag icon={<SyncOutlined spin />} color="processing">
                            测试中
                        </Tag>
                    )
                }
                
                const statusMap = {
                    connected: { icon: <CheckCircleOutlined />, color: 'success', text: '已连接' },
                    disconnected: { icon: <CloseCircleOutlined />, color: 'error', text: '未连接' },
                    testing: { icon: <SyncOutlined spin />, color: 'processing', text: '测试中' }
                }
                const config = statusMap[status as keyof typeof statusMap]
                return (
                    <Tag icon={config.icon} color={config.color}>
                        {config.text}
                    </Tag>
                )
            },
        },
        {
            title: '最后测试时间',
            dataIndex: 'lastTestTime',
            key: 'lastTestTime',
            render: (time: string) => time || '-',
        },
        {
            title: '操作',
            key: 'actions',
            render: (_, record: DatabaseConnection) => (
                <Space>
                    <Button
                        type="link"
                        icon={<SyncOutlined />}
                        loading={testingConnections.has(record.id)}
                        onClick={() => handleTestConnection(record)}
                        size="small"
                    >
                        测试连接
                    </Button>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEditConnection(record)}
                        size="small"
                    >
                        编辑
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteConnection(record)}
                        size="small"
                    >
                        删除
                    </Button>
                </Space>
            ),
        },
    ]

    // 组件初始化
    useEffect(() => {
        initMockData()
    }, [])

    return (
        <div>
            {/* 页面标题 */}
            <div style={{ marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>
                    <DatabaseOutlined style={{ marginRight: 8 }} />
                    数据源管理
                </Title>
            </div>

            {/* 统计卡片 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="总数据源"
                            value={statistics.total}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="已连接"
                            value={statistics.connected}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="未连接"
                            value={statistics.disconnected}
                            valueStyle={{ color: '#ff4d4f' }}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="测试中"
                            value={statistics.testing}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 操作按钮 */}
            <div style={{ marginBottom: 16 }}>
                <Space>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={handleAddConnection}
                    >
                        添加数据源
                    </Button>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchConnections}
                        loading={loading}
                    >
                        刷新列表
                    </Button>
                </Space>
            </div>

            {/* 数据源列表 */}
            <Card>
                <Table
                    columns={columns}
                    dataSource={connections}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        total: connections.length,
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条记录`,
                    }}
                />
            </Card>

            {/* 添加/编辑数据源模态框 */}
            <Modal
                title={editingConnection ? '编辑数据源' : '添加数据源'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={handleCancel}
                width={600}
                okText="保存"
                cancelText="取消"
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{
                        type: 'mysql',
                        port: 3306,
                    }}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="name"
                                label="数据源名称"
                                rules={[{ required: true, message: '请输入数据源名称' }]}
                            >
                                <Input placeholder="请输入数据源名称" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="type"
                                label="数据库类型"
                                rules={[{ required: true, message: '请选择数据库类型' }]}
                            >
                                <Select placeholder="请选择数据库类型">
                                    <Option value="mysql">MySQL</Option>
                                    <Option value="postgresql">PostgreSQL</Option>
                                    <Option value="oracle">Oracle</Option>
                                    <Option value="sqlserver">SQL Server</Option>
                                    <Option value="mongodb">MongoDB</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={16}>
                            <Form.Item
                                name="host"
                                label="主机地址"
                                rules={[{ required: true, message: '请输入主机地址' }]}
                            >
                                <Input placeholder="请输入主机地址" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item
                                name="port"
                                label="端口"
                                rules={[{ required: true, message: '请输入端口号' }]}
                            >
                                <InputNumber
                                    placeholder="端口号"
                                    min={1}
                                    max={65535}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

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
                                <Input.Password
                                    placeholder="请输入密码"
                                    iconRender={(visible) =>
                                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="description" label="描述">
                        <Input.TextArea
                            placeholder="请输入数据源描述（可选）"
                            rows={3}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default DatabaseConnectionPage
