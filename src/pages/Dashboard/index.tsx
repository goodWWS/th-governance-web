import {
    BarChartOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    CloseCircleOutlined,
    DatabaseOutlined,
    ExclamationCircleOutlined,
    HistoryOutlined,
    SettingOutlined,
    SyncOutlined,
    UserOutlined,
    BookOutlined,
    ClearOutlined,
    CopyOutlined,
    SwapOutlined,
    MedicineBoxOutlined,
    UnorderedListOutlined,
    EyeInvisibleOutlined,
    DeleteOutlined,
    PlayCircleOutlined,
    ReloadOutlined,
    PieChartOutlined,
    LineChartOutlined,
    TrophyOutlined,
    WarningOutlined,
} from '@ant-design/icons'
import { Alert, Card, Col, Progress, Row, Space, Statistic, Table, Tag, Typography, Button, Divider } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Line, Column, Pie } from '@ant-design/charts'

const { Title, Text } = Typography

// 工作流步骤接口
interface WorkflowStep {
    id: string
    title: string
    description: string
    enabled: boolean
    status: 'completed' | 'running' | 'pending' | 'error' | 'disabled'
    progress: number
    recordCount: number
    lastRunTime: string
    icon: React.ReactNode
}

// 数据源连接接口
interface DataSourceConnection {
    id: string
    name: string
    type: string
    status: 'connected' | 'disconnected' | 'testing'
    lastTestTime: string
}

// 执行历史记录接口
interface ExecutionRecord {
    id: string
    taskName: string
    status: 'completed' | 'running' | 'pending' | 'error'
    startTime: string
    endTime?: string
    progress: number
    recordCount: number
}

// 数据质量指标接口
interface DataQualityMetric {
    category: string
    totalRecords: number
    qualifiedRecords: number
    qualityScore: number
    trend: 'up' | 'down' | 'stable'
}

const Dashboard: React.FC = () => {
    const navigate = useNavigate()
    
    // 工作流步骤数据 - 基于真实的数据治理模块
    const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
        {
            id: 'data-cleaning',
            title: '数据清洗',
            description: '清理无效字符，确保数据质量',
            enabled: true,
            status: 'completed',
            progress: 100,
            recordCount: 1234567,
            lastRunTime: '2024-01-15 14:30:00',
            icon: <ClearOutlined />
        },
        {
            id: 'data-deduplication',
            title: '数据去重',
            description: '移除重复数据，防止数据失真',
            enabled: true,
            status: 'running',
            progress: 75,
            recordCount: 892345,
            lastRunTime: '2024-01-15 15:20:00',
            icon: <CopyOutlined />
        },
        {
            id: 'type-conversion',
            title: '类型转换',
            description: '将字符串类型转换为标准类型',
            enabled: true,
            status: 'pending',
            progress: 0,
            recordCount: 0,
            lastRunTime: '-',
            icon: <SwapOutlined />
        },
        {
            id: 'standard-mapping',
            title: '标准字典对照',
            description: '将多源数据字典统一为标准字典',
            enabled: true,
            status: 'completed',
            progress: 100,
            recordCount: 2345678,
            lastRunTime: '2024-01-15 13:45:00',
            icon: <BookOutlined />
        },
        {
            id: 'empi-assignment',
            title: 'EMPI发放',
            description: '为同一患者发放唯一主索引',
            enabled: true,
            status: 'error',
            progress: 30,
            recordCount: 125000,
            lastRunTime: '2024-01-15 12:15:00',
            icon: <UserOutlined />
        },
        {
            id: 'emoi-assignment',
            title: 'EMOI发放',
            description: '为检查检验发放就诊唯一主索引',
            enabled: true,
            status: 'pending',
            progress: 0,
            recordCount: 0,
            lastRunTime: '-',
            icon: <MedicineBoxOutlined />
        },
        {
            id: 'data-normalization',
            title: '数据归一',
            description: '数据格式标准化处理',
            enabled: true,
            status: 'completed',
            progress: 100,
            recordCount: 1876543,
            lastRunTime: '2024-01-15 11:30:00',
            icon: <UnorderedListOutlined />
        },
        {
            id: 'orphan-removal',
            title: '孤儿数据处理',
            description: '清理无关联的孤儿数据',
            enabled: true,
            status: 'running',
            progress: 60,
            recordCount: 15000,
            lastRunTime: '2024-01-15 16:00:00',
            icon: <DeleteOutlined />
        },
        {
            id: 'data-masking',
            title: '数据脱敏',
            description: '对敏感数据进行脱敏处理',
            enabled: false,
            status: 'disabled',
            progress: 0,
            recordCount: 0,
            lastRunTime: '-',
            icon: <EyeInvisibleOutlined />
        }
    ])

    // 数据源连接数据
    const [dataSources, setDataSources] = useState<DataSourceConnection[]>([
        {
            id: '1',
            name: '生产环境MySQL',
            type: 'MySQL',
            status: 'connected',
            lastTestTime: '2024-01-15 14:30:00'
        },
        {
            id: '2',
            name: '测试环境PostgreSQL',
            type: 'PostgreSQL',
            status: 'connected',
            lastTestTime: '2024-01-15 10:15:00'
        },
        {
            id: '3',
            name: '开发环境MongoDB',
            type: 'MongoDB',
            status: 'disconnected',
            lastTestTime: '2024-01-14 16:45:00'
        },
        {
            id: '4',
            name: '数据仓库Oracle',
            type: 'Oracle',
            status: 'connected',
            lastTestTime: '2024-01-15 09:20:00'
        }
    ])

    // 最近执行历史
    const [recentExecutions, setRecentExecutions] = useState<ExecutionRecord[]>([
        {
            id: 'exec-001',
            taskName: '完整数据治理流程',
            status: 'running',
            startTime: '2024-01-15 15:00:00',
            progress: 65,
            recordCount: 2500000
        },
        {
            id: 'exec-002',
            taskName: '数据清洗+去重',
            status: 'completed',
            startTime: '2024-01-15 14:00:00',
            endTime: '2024-01-15 14:45:00',
            progress: 100,
            recordCount: 1800000
        },
        {
            id: 'exec-003',
            taskName: 'EMPI发放流程',
            status: 'error',
            startTime: '2024-01-15 12:00:00',
            endTime: '2024-01-15 12:30:00',
            progress: 30,
            recordCount: 125000
        }
    ])

    // 数据质量指标
    const [qualityMetrics, setQualityMetrics] = useState<DataQualityMetric[]>([
        {
            category: '患者基础信息',
            totalRecords: 500000,
            qualifiedRecords: 485000,
            qualityScore: 97.0,
            trend: 'up'
        },
        {
            category: '诊断信息',
            totalRecords: 1200000,
            qualifiedRecords: 1080000,
            qualityScore: 90.0,
            trend: 'stable'
        },
        {
            category: '手术信息',
            totalRecords: 300000,
            qualifiedRecords: 255000,
            qualityScore: 85.0,
            trend: 'down'
        },
        {
            category: '检验检查',
            totalRecords: 2000000,
            qualifiedRecords: 1900000,
            qualityScore: 95.0,
            trend: 'up'
        }
    ])

    // 计算统计数据
    const totalRecords = workflowSteps.reduce((sum, step) => sum + step.recordCount, 0)
    const completedSteps = workflowSteps.filter(step => step.status === 'completed').length
    const runningSteps = workflowSteps.filter(step => step.status === 'running').length
    const errorSteps = workflowSteps.filter(step => step.status === 'error').length
    const connectedDataSources = dataSources.filter(ds => ds.status === 'connected').length
    const overallProgress = Math.round((completedSteps / workflowSteps.filter(step => step.enabled).length) * 100)
    const avgQualityScore = Math.round(qualityMetrics.reduce((sum, metric) => sum + metric.qualityScore, 0) / qualityMetrics.length)

    // 状态标签渲染
    const renderStatusTag = (status: string) => {
        const statusConfig = {
            completed: { color: 'success', icon: <CheckCircleOutlined />, text: '已完成' },
            running: { color: 'processing', icon: <ClockCircleOutlined />, text: '运行中' },
            pending: { color: 'default', icon: <ExclamationCircleOutlined />, text: '待执行' },
            error: { color: 'error', icon: <ExclamationCircleOutlined />, text: '错误' },
            disabled: { color: 'default', icon: <ExclamationCircleOutlined />, text: '已禁用' },
            connected: { color: 'success', icon: <CheckCircleOutlined />, text: '已连接' },
            disconnected: { color: 'error', icon: <CloseCircleOutlined />, text: '未连接' },
            testing: { color: 'processing', icon: <SyncOutlined />, text: '测试中' }
        }

        const config = statusConfig[status as keyof typeof statusConfig]
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        )
    }

    // 工作流步骤表格列配置
    const workflowColumns: ColumnsType<WorkflowStep> = [
        {
            title: '步骤',
            dataIndex: 'title',
            key: 'title',
            width: 150,
            render: (title: string, record: WorkflowStep) => (
                <Space>
                    {record.icon}
                    <span>{title}</span>
                </Space>
            )
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: renderStatusTag,
        },
        {
            title: '进度',
            dataIndex: 'progress',
            key: 'progress',
            width: 150,
            render: (progress: number, record: WorkflowStep) => (
                <Progress
                    percent={progress}
                    size='small'
                    status={
                        record.status === 'completed' ? 'success' : 
                        record.status === 'running' ? 'active' : 
                        record.status === 'error' ? 'exception' : 'normal'
                    }
                />
            ),
        },
        {
            title: '处理记录数',
            dataIndex: 'recordCount',
            key: 'recordCount',
            width: 120,
            render: (count: number) => count > 0 ? count.toLocaleString() : '-',
        },
        {
            title: '最后运行时间',
            dataIndex: 'lastRunTime',
            key: 'lastRunTime',
            width: 160,
        }
    ]

    // 数据源表格列配置
    const dataSourceColumns: ColumnsType<DataSourceConnection> = [
        {
            title: '数据源名称',
            dataIndex: 'name',
            key: 'name',
            width: 200,
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
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
            width: 160,
        }
    ]

    // 执行历史表格列配置
    const executionColumns: ColumnsType<ExecutionRecord> = [
        {
            title: '任务名称',
            dataIndex: 'taskName',
            key: 'taskName',
            width: 200,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: renderStatusTag,
        },
        {
            title: '进度',
            dataIndex: 'progress',
            key: 'progress',
            width: 120,
            render: (progress: number) => `${progress}%`,
        },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            key: 'startTime',
            width: 160,
        }
    ]

    // 工作流执行趋势数据
    const [executionTrendData, setExecutionTrendData] = useState([
        { date: '01-10', completed: 12, running: 3, error: 1 },
        { date: '01-11', completed: 15, running: 2, error: 0 },
        { date: '01-12', completed: 18, running: 4, error: 2 },
        { date: '01-13', completed: 22, running: 1, error: 1 },
        { date: '01-14', completed: 25, running: 3, error: 0 },
        { date: '01-15', completed: 28, running: 2, error: 1 },
        { date: '01-16', completed: 30, running: 5, error: 0 }
    ])

    // 数据质量分布饼图数据
    const [qualityDistributionData, setQualityDistributionData] = useState([
        { type: '优秀(95-100%)', value: 35, color: '#52c41a' },
        { type: '良好(85-94%)', value: 45, color: '#1890ff' },
        { type: '一般(70-84%)', value: 15, color: '#faad14' },
        { type: '较差(<70%)', value: 5, color: '#ff4d4f' }
    ])

    // 数据处理量趋势数据
    const [processingVolumeData, setProcessingVolumeData] = useState([
        { date: '01-10', volume: 1200000 },
        { date: '01-11', volume: 1350000 },
        { date: '01-12', volume: 1180000 },
        { date: '01-13', volume: 1420000 },
        { date: '01-14', volume: 1380000 },
        { date: '01-15', volume: 1500000 },
        { date: '01-16', volume: 1450000 }
    ])

    // 工作流执行趋势图配置
    const executionTrendConfig = {
        data: executionTrendData.flatMap(item => [
            { date: item.date, type: '已完成', value: item.completed },
            { date: item.date, type: '运行中', value: item.running },
            { date: item.date, type: '错误', value: item.error }
        ]),
        xField: 'date',
        yField: 'value',
        seriesField: 'type',
        color: ['#52c41a', '#1890ff', '#ff4d4f'],
        smooth: true,
        animation: {
            appear: {
                animation: 'path-in',
                duration: 1000,
            },
        },
        legend: {
            position: 'top' as const,
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: datum.type, value: `${datum.value} 个` }
            },
        },
    }

    // 数据质量分布饼图配置
    const qualityDistributionConfig = {
        data: qualityDistributionData,
        angleField: 'value',
        colorField: 'type',
        color: qualityDistributionData.map(item => item.color),
        radius: 0.8,
        innerRadius: 0.4,
        label: {
            type: 'outer' as const,
            content: (data: any) => `${data.type}: ${(data.percent * 100).toFixed(1)}%`,
        },
        interactions: [
            {
                type: 'element-selected',
            },
            {
                type: 'element-active',
            },
        ],
        statistic: {
            title: false,
            content: {
                style: {
                    whiteSpace: 'pre-wrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                },
                content: '数据质量\n分布',
            },
        },
    }

    // 数据处理量趋势图配置
    const processingVolumeConfig = {
        data: processingVolumeData,
        xField: 'date',
        yField: 'volume',
        color: '#722ed1',
        smooth: true,
        animation: {
            appear: {
                animation: 'wave-in',
                duration: 1000,
            },
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: '处理量', value: `${(datum.volume / 10000).toFixed(1)}万条` }
            },
        },
        yAxis: {
            label: {
                formatter: (v: string) => `${(Number(v) / 10000).toFixed(0)}万`,
            },
        },
    }

    return (
        <div>
            {/* 页面标题 */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                }}
            >
                <Title level={2} style={{ margin: 0 }}>
                    <BarChartOutlined style={{ marginRight: 8 }} />
                    数据治理仪表盘
                </Title>
                <Space>
                    <Button 
                        type="primary" 
                        icon={<PlayCircleOutlined />}
                        onClick={() => navigate('/data-governance/workflow-config')}
                    >
                        启动工作流
                    </Button>
                    <Button 
                        icon={<ReloadOutlined />}
                        onClick={() => window.location.reload()}
                    >
                        刷新数据
                    </Button>
                </Space>
            </div>

            {/* 信息提示 */}
            <Alert
                message='数据治理概览'
                description='实时监控数据治理工作流的执行状态、数据源连接状态、处理进度和数据质量指标，帮助您全面了解数据治理的整体情况。'
                type='info'
                showIcon
                style={{ marginBottom: 24 }}
            />

            {/* 核心统计指标 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title='工作流步骤'
                            value={workflowSteps.filter(step => step.enabled).length}
                            prefix={<SettingOutlined />}
                            suffix='个'
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            已完成: {completedSteps} | 运行中: {runningSteps} | 错误: {errorSteps}
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title='数据源连接'
                            value={connectedDataSources}
                            prefix={<DatabaseOutlined />}
                            suffix={`/ ${dataSources.length}`}
                            valueStyle={{ color: connectedDataSources === dataSources.length ? '#3f8600' : '#faad14' }}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            连接率: {Math.round((connectedDataSources / dataSources.length) * 100)}%
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title='总处理记录'
                            value={totalRecords}
                            precision={0}
                            formatter={value => `${Number(value).toLocaleString()}`}
                            prefix={<PieChartOutlined />}
                            valueStyle={{ color: '#722ed1' }}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            今日新增: 125,000 条
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title='数据质量评分'
                            value={avgQualityScore}
                            prefix={<TrophyOutlined />}
                            suffix='分'
                            valueStyle={{ 
                                color: avgQualityScore >= 95 ? '#3f8600' : 
                                       avgQualityScore >= 85 ? '#faad14' : '#ff4d4f' 
                            }}
                        />
                        <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                            较昨日: +2.3 分
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 数据可视化图表区域 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                {/* 工作流执行趋势 */}
                <Col xs={24} lg={12}>
                    <Card 
                        title={
                            <Space>
                                <LineChartOutlined />
                                <span>工作流执行趋势</span>
                            </Space>
                        }
                    >
                        <Line {...executionTrendConfig} height={300} />
                    </Card>
                </Col>

                {/* 数据质量分布 */}
                <Col xs={24} lg={12}>
                    <Card 
                        title={
                            <Space>
                                <PieChartOutlined />
                                <span>数据质量分布</span>
                            </Space>
                        }
                    >
                        <Pie {...qualityDistributionConfig} height={300} />
                    </Card>
                </Col>
            </Row>

            {/* 数据处理量趋势 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24}>
                    <Card 
                        title={
                            <Space>
                                <BarChartOutlined />
                                <span>数据处理量趋势</span>
                            </Space>
                        }
                        extra={
                            <Space>
                                <Text type="secondary">单位：万条</Text>
                            </Space>
                        }
                    >
                        <Line {...processingVolumeConfig} height={200} />
                    </Card>
                </Col>
            </Row>

            {/* 工作流执行进度 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                    <Card 
                        title={
                            <Space>
                                <LineChartOutlined />
                                <span>整体执行进度</span>
                            </Space>
                        } 
                        extra={`${overallProgress}%`}
                    >
                        <Progress
                            percent={overallProgress}
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                            size={[300, 8]}
                        />
                        <div style={{ marginTop: 16 }}>
                            <Row gutter={16}>
                                <Col span={8}>
                                    <Statistic 
                                        title="已完成" 
                                        value={completedSteps} 
                                        valueStyle={{ fontSize: 16, color: '#52c41a' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic 
                                        title="运行中" 
                                        value={runningSteps} 
                                        valueStyle={{ fontSize: 16, color: '#1890ff' }}
                                    />
                                </Col>
                                <Col span={8}>
                                    <Statistic 
                                        title="错误" 
                                        value={errorSteps} 
                                        valueStyle={{ fontSize: 16, color: '#ff4d4f' }}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card 
                        title={
                            <Space>
                                <TrophyOutlined />
                                <span>数据质量分布</span>
                            </Space>
                        }
                    >
                        <div style={{ marginBottom: 16 }}>
                            {qualityMetrics.map((metric, index) => (
                                <div key={index} style={{ marginBottom: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <Text>{metric.category}</Text>
                                        <Space>
                                            <Text strong>{metric.qualityScore}%</Text>
                                            {metric.trend === 'up' && <span style={{ color: '#52c41a' }}>↗</span>}
                                            {metric.trend === 'down' && <span style={{ color: '#ff4d4f' }}>↘</span>}
                                            {metric.trend === 'stable' && <span style={{ color: '#faad14' }}>→</span>}
                                        </Space>
                                    </div>
                                    <Progress 
                                        percent={metric.qualityScore} 
                                        size="small"
                                        strokeColor={
                                            metric.qualityScore >= 95 ? '#52c41a' :
                                            metric.qualityScore >= 85 ? '#faad14' : '#ff4d4f'
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 详细信息表格 */}
            <Row gutter={[16, 16]}>
                {/* 工作流步骤状态 */}
                <Col xs={24} xl={14}>
                    <Card
                        title={
                            <Space>
                                <SettingOutlined />
                                <span>工作流步骤状态</span>
                            </Space>
                        }
                        extra={
                            <Button 
                                type="link" 
                                onClick={() => navigate('/data-governance/workflow-config')}
                            >
                                查看配置
                            </Button>
                        }
                    >
                        <Table
                            columns={workflowColumns}
                            dataSource={workflowSteps}
                            pagination={false}
                            size='small'
                            scroll={{ x: 600 }}
                            rowKey="id"
                        />
                    </Card>
                </Col>

                {/* 数据源连接状态 */}
                <Col xs={24} xl={10}>
                    <Card
                        title={
                            <Space>
                                <DatabaseOutlined />
                                <span>数据源连接状态</span>
                            </Space>
                        }
                        extra={
                            <Button 
                                type="link" 
                                onClick={() => navigate('/database-connection')}
                            >
                                管理数据源
                            </Button>
                        }
                        style={{ marginBottom: 16 }}
                    >
                        <Table
                            columns={dataSourceColumns}
                            dataSource={dataSources}
                            pagination={false}
                            size='small'
                            scroll={{ x: 400 }}
                            rowKey="id"
                        />
                    </Card>

                    {/* 最近执行历史 */}
                    <Card
                        title={
                            <Space>
                                <HistoryOutlined />
                                <span>最近执行历史</span>
                            </Space>
                        }
                        extra={
                            <Button 
                                type="link" 
                                onClick={() => navigate('/data-governance/execution-history')}
                            >
                                查看全部
                            </Button>
                        }
                    >
                        <Table
                            columns={executionColumns}
                            dataSource={recentExecutions}
                            pagination={false}
                            size='small'
                            scroll={{ x: 400 }}
                            rowKey="id"
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default Dashboard
