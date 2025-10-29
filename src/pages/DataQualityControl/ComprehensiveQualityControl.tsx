import {
    BarChartOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    FileExcelOutlined,
    InboxOutlined,
    UploadOutlined,
} from '@ant-design/icons'
import {
    Alert,
    Button,
    Card,
    Col,
    Form,
    Progress,
    Row,
    Select,
    Statistic,
    Table,
    Typography,
    Upload,
    message,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { UploadProps } from 'antd/es/upload'
import React, { useState } from 'react'

const { Title, _Text } = Typography
const { Dragger } = Upload

interface QualityMetric {
    key: string
    metric: string
    score: number
    status: 'excellent' | 'good' | 'warning' | 'poor'
    description: string
}

interface QualityReport {
    key: string
    category: string
    totalItems: number
    passedItems: number
    failedItems: number
    passRate: number
}

const ComprehensiveQualityControl: React.FC = () => {
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([])
    const [qualityReports, setQualityReports] = useState<QualityReport[]>([])
    const [overallScore, setOverallScore] = useState(0)

    // 数据源选项
    const dataSourceOptions = [
        { label: '全部数据表', value: 'all_tables' },
        { label: '患者信息相关表', value: 'patient_tables' },
        { label: '诊疗信息相关表', value: 'medical_tables' },
        { label: '检查检验相关表', value: 'examination_tables' },
        { label: '药品处方相关表', value: 'prescription_tables' },
    ]

    // Excel文件上传配置
    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        accept: '.xlsx,.xls',
        beforeUpload: file => {
            const isExcel =
                file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel'
            if (!isExcel) {
                message.error('只支持 Excel 格式的文件！')
                return false
            }
            const isLt5M = file.size / 1024 / 1024 < 5
            if (!isLt5M) {
                message.error('文件大小不能超过 5MB！')
                return false
            }
            return false // 阻止自动上传
        },
        onChange: info => {
            const { status } = info.file
            if (status === 'done') {
                message.success(`${info.file.name} 文件上传成功`)
                // 模拟解析Excel文件
                parseExcelResults()
            } else if (status === 'error') {
                message.error(`${info.file.name} 文件上传失败`)
            }
        },
    }

    // 解析Excel结果
    const parseExcelResults = () => {
        // 模拟Excel解析结果
        const mockReports: QualityReport[] = [
            {
                key: '1',
                category: '数据完整性',
                totalItems: 1000,
                passedItems: 850,
                failedItems: 150,
                passRate: 85,
            },
            {
                key: '2',
                category: '数据准确性',
                totalItems: 1000,
                passedItems: 920,
                failedItems: 80,
                passRate: 92,
            },
            {
                key: '3',
                category: '数据一致性',
                totalItems: 1000,
                passedItems: 780,
                failedItems: 220,
                passRate: 78,
            },
            {
                key: '4',
                category: '数据时效性',
                totalItems: 1000,
                passedItems: 950,
                failedItems: 50,
                passRate: 95,
            },
        ]
        setQualityReports(mockReports)
        message.success('Excel质控结果解析完成！')
    }

    // 执行综合质控
    const handleComprehensiveCheck = async (_values: any) => {
        setLoading(true)
        try {
            // 模拟质控检查过程
            await new Promise(resolve => setTimeout(resolve, 3000))

            // 模拟质控指标结果
            const mockMetrics: QualityMetric[] = [
                {
                    key: '1',
                    metric: '数据完整性',
                    score: 85,
                    status: 'good',
                    description: '大部分字段填充完整，少数字段存在空值',
                },
                {
                    key: '2',
                    metric: '数据准确性',
                    score: 92,
                    status: 'excellent',
                    description: '数据格式规范，准确性较高',
                },
                {
                    key: '3',
                    metric: '数据一致性',
                    score: 78,
                    status: 'warning',
                    description: '部分关联数据存在不一致问题',
                },
                {
                    key: '4',
                    metric: '数据时效性',
                    score: 95,
                    status: 'excellent',
                    description: '数据更新及时，时效性良好',
                },
                {
                    key: '5',
                    metric: '数据唯一性',
                    score: 88,
                    status: 'good',
                    description: '存在少量重复记录，需要清理',
                },
            ]

            setQualityMetrics(mockMetrics)
            const avgScore = Math.round(
                mockMetrics.reduce((sum, item) => sum + item.score, 0) / mockMetrics.length
            )
            setOverallScore(avgScore)
            message.success('综合质控检查完成！')
        } catch (error) {
            message.error('质控检查失败，请重试')
        } finally {
            setLoading(false)
        }
    }

    // 质控指标表格列配置
    const metricsColumns: ColumnsType<QualityMetric> = [
        {
            title: '质控指标',
            dataIndex: 'metric',
            key: 'metric',
            width: 120,
        },
        {
            title: '得分',
            dataIndex: 'score',
            key: 'score',
            width: 80,
            render: (score: number) => (
                <span style={{ fontWeight: 'bold', fontSize: 16 }}>{score}</span>
            ),
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            render: (status: string) => {
                const statusConfig = {
                    excellent: { color: '#52c41a', text: '优秀', icon: <CheckCircleOutlined /> },
                    good: { color: '#1890ff', text: '良好', icon: <CheckCircleOutlined /> },
                    warning: {
                        color: '#faad14',
                        text: '警告',
                        icon: <ExclamationCircleOutlined />,
                    },
                    poor: { color: '#ff4d4f', text: '较差', icon: <ExclamationCircleOutlined /> },
                }
                const config = statusConfig[status as keyof typeof statusConfig]
                return (
                    <span style={{ color: config.color }}>
                        {config.icon} {config.text}
                    </span>
                )
            },
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
        },
    ]

    // 质控报告表格列配置
    const reportsColumns: ColumnsType<QualityReport> = [
        {
            title: '质控类别',
            dataIndex: 'category',
            key: 'category',
            width: 120,
        },
        {
            title: '总数',
            dataIndex: 'totalItems',
            key: 'totalItems',
            width: 80,
            render: (value: number) => value.toLocaleString(),
        },
        {
            title: '通过',
            dataIndex: 'passedItems',
            key: 'passedItems',
            width: 80,
            render: (value: number) => (
                <span style={{ color: '#52c41a' }}>{value.toLocaleString()}</span>
            ),
        },
        {
            title: '失败',
            dataIndex: 'failedItems',
            key: 'failedItems',
            width: 80,
            render: (value: number) => (
                <span style={{ color: '#ff4d4f' }}>{value.toLocaleString()}</span>
            ),
        },
        {
            title: '通过率',
            dataIndex: 'passRate',
            key: 'passRate',
            width: 120,
            render: (rate: number) => (
                <Progress
                    percent={rate}
                    size='small'
                    status={rate >= 90 ? 'success' : rate >= 70 ? 'active' : 'exception'}
                />
            ),
        },
    ]

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
                    综合质控
                </Title>
            </div>

            {/* 信息提示 */}
            <Alert
                message='综合质控功能'
                description='对数据进行全面的质量检查，包括完整性、准确性、一致性、时效性等多个维度。支持上传Excel格式的质控结果文件进行分析。'
                type='info'
                showIcon
                style={{ marginBottom: 24 }}
            />

            {/* 整体质控得分 */}
            {overallScore > 0 && (
                <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title='综合质控得分'
                                value={overallScore}
                                suffix='分'
                                valueStyle={{
                                    color:
                                        overallScore >= 90
                                            ? '#52c41a'
                                            : overallScore >= 70
                                              ? '#1890ff'
                                              : '#ff4d4f',
                                    fontSize: 32,
                                }}
                                prefix={<BarChartOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title='检查项目数'
                                value={qualityMetrics.length}
                                suffix='项'
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title='优秀项目数'
                                value={qualityMetrics.filter(m => m.status === 'excellent').length}
                                suffix='项'
                                valueStyle={{ color: '#52c41a' }}
                                prefix={<CheckCircleOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            <Row gutter={[16, 16]}>
                {/* 左侧：质控配置 */}
                <Col xs={24} lg={8}>
                    <Card
                        title={
                            <>
                                <BarChartOutlined style={{ marginRight: 8 }} />
                                质控配置
                            </>
                        }
                    >
                        <Form form={form} layout='vertical' onFinish={handleComprehensiveCheck}>
                            <Form.Item
                                label='选择数据源'
                                name='dataSource'
                                rules={[{ required: true, message: '请选择数据源' }]}
                            >
                                <Select
                                    placeholder='请选择要进行质控的数据源'
                                    options={dataSourceOptions}
                                    size='large'
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type='primary'
                                    htmlType='submit'
                                    loading={loading}
                                    icon={<UploadOutlined />}
                                    size='large'
                                    block
                                >
                                    开始综合质控
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>

                    {/* Excel结果上传 */}
                    <Card
                        title={
                            <>
                                <FileExcelOutlined style={{ marginRight: 8 }} />
                                Excel结果上传
                            </>
                        }
                        style={{ marginTop: 16 }}
                    >
                        <Dragger {...uploadProps}>
                            <p className='ant-upload-drag-icon'>
                                <InboxOutlined />
                            </p>
                            <p className='ant-upload-text'>上传Excel质控结果</p>
                            <p className='ant-upload-hint'>
                                支持 .xlsx、.xls 格式，文件大小不超过 5MB
                            </p>
                        </Dragger>
                    </Card>
                </Col>

                {/* 右侧：质控结果 */}
                <Col xs={24} lg={16}>
                    {/* 质控指标 */}
                    <Card
                        title={
                            <>
                                <CheckCircleOutlined style={{ marginRight: 8 }} />
                                质控指标
                            </>
                        }
                        style={{ marginBottom: 16 }}
                    >
                        {qualityMetrics.length > 0 ? (
                            <Table
                                columns={metricsColumns}
                                dataSource={qualityMetrics}
                                pagination={false}
                                size='middle'
                            />
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                                <BarChartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                                <div>暂无质控结果</div>
                                <div style={{ fontSize: 12, marginTop: 8 }}>
                                    请先执行综合质控检查
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* Excel解析结果 */}
                    {qualityReports.length > 0 && (
                        <Card
                            title={
                                <>
                                    <FileExcelOutlined style={{ marginRight: 8 }} />
                                    Excel解析结果
                                </>
                            }
                        >
                            <Table
                                columns={reportsColumns}
                                dataSource={qualityReports}
                                pagination={false}
                                size='middle'
                            />
                        </Card>
                    )}
                </Col>
            </Row>
        </div>
    )
}

export default ComprehensiveQualityControl
