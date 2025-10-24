import {
    BarChartOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    DatabaseOutlined,
    ExclamationCircleOutlined,
    HistoryOutlined,
} from '@ant-design/icons'
import { Alert, Card, Col, Progress, Row, Space, Statistic, Table, Tag, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import React, { useState } from 'react'

const { Title } = Typography

interface TaskRecord {
    key: string
    taskName: string
    status: 'completed' | 'running' | 'pending' | 'error'
    progress: number
    recordCount: number
    lastRunTime: string
}

interface StatisticData {
    totalTables: number
    processedTables: number
    totalRecords: number
    cleanedRecords: number
    duplicateRecords: number
    errorRecords: number
}

const Dashboard: React.FC = () => {
    const [statisticData, setStatisticData] = useState<StatisticData>({
        totalTables: 40,
        processedTables: 32,
        totalRecords: 1250000,
        cleanedRecords: 1180000,
        duplicateRecords: 45000,
        errorRecords: 25000,
    })

    const [taskData, setTaskData] = useState<TaskRecord[]>([
        {
            key: '1',
            taskName: '数据清洗',
            status: 'completed',
            progress: 100,
            recordCount: 1180000,
            lastRunTime: '2024-01-15 14:30:00',
        },
        {
            key: '2',
            taskName: '数据去重',
            status: 'running',
            progress: 75,
            recordCount: 45000,
            lastRunTime: '2024-01-15 15:20:00',
        },
        {
            key: '3',
            taskName: '类型转换',
            status: 'pending',
            progress: 0,
            recordCount: 0,
            lastRunTime: '-',
        },
        {
            key: '4',
            taskName: '标准字典对照',
            status: 'completed',
            progress: 100,
            recordCount: 850000,
            lastRunTime: '2024-01-15 13:45:00',
        },
        {
            key: '5',
            taskName: 'EMPI发放',
            status: 'error',
            progress: 30,
            recordCount: 125000,
            lastRunTime: '2024-01-15 12:15:00',
        },
        {
            key: '6',
            taskName: 'EMOI发放',
            status: 'pending',
            progress: 0,
            recordCount: 0,
            lastRunTime: '-',
        },
        {
            key: '7',
            taskName: '数据归一',
            status: 'completed',
            progress: 100,
            recordCount: 920000,
            lastRunTime: '2024-01-15 11:30:00',
        },
        {
            key: '8',
            taskName: '孤儿数据处理',
            status: 'running',
            progress: 60,
            recordCount: 15000,
            lastRunTime: '2024-01-15 16:00:00',
        },
        {
            key: '9',
            taskName: '数据脱敏',
            status: 'pending',
            progress: 0,
            recordCount: 0,
            lastRunTime: '-',
        },
    ])

    // 状态标签渲染
    const renderStatusTag = (status: string) => {
        const statusConfig = {
            completed: { color: 'success', icon: <CheckCircleOutlined />, text: '已完成' },
            running: { color: 'processing', icon: <ClockCircleOutlined />, text: '运行中' },
            pending: { color: 'default', icon: <ExclamationCircleOutlined />, text: '待执行' },
            error: { color: 'error', icon: <ExclamationCircleOutlined />, text: '错误' },
        }

        const config = statusConfig[status as keyof typeof statusConfig]
        return (
            <Tag color={config.color} icon={config.icon}>
                {config.text}
            </Tag>
        )
    }

    // 表格列配置
    const columns: ColumnsType<TaskRecord> = [
        {
            title: '任务名称',
            dataIndex: 'taskName',
            key: 'taskName',
            width: 150,
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: renderStatusTag,
        },
        {
            title: '进度',
            dataIndex: 'progress',
            key: 'progress',
            width: 200,
            render: (progress: number) => (
                <Progress
                    percent={progress}
                    size='small'
                    status={progress === 100 ? 'success' : progress > 0 ? 'active' : 'normal'}
                />
            ),
        },
        {
            title: '处理记录数',
            dataIndex: 'recordCount',
            key: 'recordCount',
            width: 120,
            render: (count: number) => count.toLocaleString(),
        },
        {
            title: '最后运行时间',
            dataIndex: 'lastRunTime',
            key: 'lastRunTime',
            width: 180,
        },
    ]

    // 计算处理进度
    const overallProgress = Math.round(
        (statisticData.processedTables / statisticData.totalTables) * 100
    )
    const dataQualityRate = Math.round(
        (statisticData.cleanedRecords / statisticData.totalRecords) * 100
    )

    return (
        <div>
            {/* 页面标题 - 与数据治理页面保持一致的风格 */}
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
            </div>

            {/* 信息提示 - 与数据治理页面保持一致 */}
            <Alert
                message='数据治理概览'
                description='实时监控数据治理工作流的执行状态、处理进度和数据质量指标，帮助您全面了解数据治理的整体情况。'
                type='info'
                showIcon
                style={{ marginBottom: 24 }}
            />

            {/* 统计卡片 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title='总表数量'
                            value={statisticData.totalTables}
                            prefix={<DatabaseOutlined />}
                            suffix='张'
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title='已处理表数'
                            value={statisticData.processedTables}
                            prefix={<CheckCircleOutlined />}
                            suffix='张'
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title='总记录数'
                            value={statisticData.totalRecords}
                            precision={0}
                            formatter={value => `${Number(value).toLocaleString()}`}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title='已清洗记录'
                            value={statisticData.cleanedRecords}
                            precision={0}
                            formatter={value => `${Number(value).toLocaleString()}`}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* 进度概览 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col xs={24} lg={12}>
                    <Card title='整体处理进度' extra={`${overallProgress}%`}>
                        <Progress
                            percent={overallProgress}
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                        />
                        <div style={{ marginTop: 16 }}>
                            <Space>
                                <span>已处理: {statisticData.processedTables} 张表</span>
                                <span>
                                    剩余:{' '}
                                    {statisticData.totalTables - statisticData.processedTables} 张表
                                </span>
                            </Space>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title='数据质量率' extra={`${dataQualityRate}%`}>
                        <Progress
                            percent={dataQualityRate}
                            strokeColor={{
                                '0%': '#ff4d4f',
                                '50%': '#faad14',
                                '100%': '#52c41a',
                            }}
                        />
                        <div style={{ marginTop: 16 }}>
                            <Space direction='vertical' size='small'>
                                <span>
                                    重复记录: {statisticData.duplicateRecords.toLocaleString()}
                                </span>
                                <span>错误记录: {statisticData.errorRecords.toLocaleString()}</span>
                            </Space>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 任务执行状态表格 - 使用Card包装，与数据治理页面保持一致 */}
            <Card>
                <div style={{ marginBottom: 16 }}>
                    <Title level={4} style={{ margin: 0 }}>
                        <HistoryOutlined style={{ marginRight: 8 }} />
                        数据治理任务执行状态
                    </Title>
                </div>
                <Table
                    columns={columns}
                    dataSource={taskData}
                    pagination={false}
                    size='middle'
                    scroll={{ x: 800 }}
                />
            </Card>
        </div>
    )
}

export default Dashboard
