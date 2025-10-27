import { ArrowLeftOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Progress, Spin, Steps, Tag, Typography, Modal, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

const { Title, Text } = Typography
const { Step } = Steps

// 定义九个执行步骤
const EXECUTION_STEPS = [
    { 
        title: '数据清洗', 
        description: '清理无效字符，确保数据质量',
        isAutomatic: true,
        resultSummary: '清理了 1,234 条无效记录，修复了 567 个格式错误'
    },
    { 
        title: '数据去重', 
        description: '移除重复数据，防止数据失真',
        isAutomatic: true,
        resultSummary: '检测到 892 条重复记录，已成功去重'
    },
    { 
        title: '类型转换', 
        description: '将字符串类型转换为数据模型定义的标准类型',
        isAutomatic: true,
        resultSummary: '转换了 15,678 个字段，成功率 99.8%'
    },
    { 
        title: '标准字典对照', 
        description: '将多源数据字典统一为标准字典',
        isAutomatic: false,
        resultSummary: '匹配了 2,345 个字典项，需人工确认 23 项'
    },
    { 
        title: 'EMPI发放', 
        description: '为同一患者发放唯一主索引',
        isAutomatic: true,
        resultSummary: '为 8,901 名患者分配了唯一标识'
    },
    { 
        title: 'EMOI发放', 
        description: '为检查检验发放就诊唯一主索引',
        isAutomatic: true,
        resultSummary: '处理了 12,345 次就诊记录'
    },
    { 
        title: '数据归一', 
        description: '统一数据格式和标准值',
        isAutomatic: true,
        resultSummary: '标准化了 45,678 条记录'
    },
    { 
        title: '孤儿数据处理', 
        description: '清理无法关联主表的无效数据',
        isAutomatic: false,
        resultSummary: '发现 156 条孤儿数据，已标记待处理'
    },
    { 
        title: '数据脱敏', 
        description: '保护敏感数据安全',
        isAutomatic: true,
        resultSummary: '脱敏处理了 3,456 个敏感字段'
    },
]

const ExecutionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    
    // 状态管理
    const [resultModalVisible, setResultModalVisible] = useState(false)
    const [selectedStepResult, setSelectedStepResult] = useState<{
        title: string
        resultSummary: string
        stepIndex: number
    } | null>(null)

    const { tasks, loading } = useAppSelector(state => state.dataGovernance)
    const executionDetail = tasks.find(task => task.id === id)

    // 获取当前执行步骤
    const getCurrentStep = () => {
        if (!executionDetail) return 0
        
        // 根据任务状态和进度计算当前步骤
        if (executionDetail.status === 'idle') return 0
        if (executionDetail.status === 'error') return Math.floor(executionDetail.progress / 11.11) // 100/9 ≈ 11.11
        if (executionDetail.status === 'completed') return 9
        
        // 运行中状态，根据进度计算
        return Math.floor(executionDetail.progress / 11.11)
    }

    // 获取步骤状态
    const getStepStatus = (stepIndex: number) => {
        const currentStep = getCurrentStep()
        
        if (executionDetail?.status === 'error' && stepIndex === currentStep) {
            return 'error'
        }
        if (stepIndex < currentStep) {
            return 'finish'
        }
        if (stepIndex === currentStep && executionDetail?.status === 'running') {
            return 'process'
        }
        return 'wait'
    }

    useEffect(() => {
        // 这里可以添加获取详情的逻辑
        console.log('获取执行详情', id)
    }, [id])

    // 返回上一页
    const goBack = () => {
        // 检查是否有历史记录可以返回
        if (window.history.length > 1) {
            // 使用浏览器历史记录返回上一页
            navigate(-1)
        } else {
            // 如果没有历史记录（比如直接访问URL），则返回到工作流配置页面作为默认行为
            navigate('/data-governance/workflow-config')
        }
    }

    // 查看执行结果
    const handleViewResult = (stepIndex: number) => {
        const step = EXECUTION_STEPS[stepIndex]
        setSelectedStepResult({
            title: step.title,
            resultSummary: step.resultSummary,
            stepIndex
        })
        setResultModalVisible(true)
    }

    // 关闭结果弹窗
    const handleCloseResultModal = () => {
        setResultModalVisible(false)
        setSelectedStepResult(null)
    }

    // 获取状态标签
    const getStatusTag = (status: string) => {
        const statusMap = {
            running: { color: 'processing', text: '执行中' },
            completed: { color: 'success', text: '已完成' },
            error: { color: 'error', text: '执行失败' },
            idle: { color: 'default', text: '等待中' },
            paused: { color: 'warning', text: '已暂停' },
        }
        const config = statusMap[status as keyof typeof statusMap] || {
            color: 'default',
            text: status,
        }
        return <Tag color={config.color}>{config.text}</Tag>
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size='large' />
                <div style={{ marginTop: 16 }}>
                    <Text>加载执行详情中...</Text>
                </div>
            </div>
        )
    }

    if (!executionDetail) {
        return (
            <Alert
                message='未找到执行记录'
                description='请检查执行记录ID是否正确，或返回列表页重新选择。'
                type='warning'
                showIcon
                action={
                    <Button size='small' onClick={goBack}>
                        返回列表
                    </Button>
                }
            />
        )
    }

    return (
        <div>
            {/* 头部 */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={goBack}
                        style={{ marginRight: 16 }}
                    >
                        返回
                    </Button>
                    <Title level={2} style={{ margin: 0 }}>
                        执行详情
                    </Title>
                </div>
                <Button icon={<ReloadOutlined />} onClick={() => console.log('刷新详情')} loading={loading}>
                    刷新
                </Button>
            </div>

            {/* 基本信息 */}
            <Card title='基本信息' style={{ marginBottom: 24 }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 16,
                    }}
                >
                    <div>
                        <Text strong>任务ID：</Text>
                        <Text copyable>{executionDetail.id}</Text>
                    </div>
                    <div>
                        <Text strong>任务名称：</Text>
                        <Text>{executionDetail.name}</Text>
                    </div>
                    <div>
                        <Text strong>状态：</Text>
                        {getStatusTag(executionDetail.status)}
                    </div>
                    <div>
                        <Text strong>开始时间：</Text>
                        <Text>{executionDetail.startTime || '未开始'}</Text>
                    </div>
                    <div>
                        <Text strong>结束时间：</Text>
                        <Text>{executionDetail.endTime || '进行中'}</Text>
                    </div>
                    <div>
                        <Text strong>进度：</Text>
                        <Text>{executionDetail.progress}%</Text>
                    </div>
                    <div>
                        <Text strong>已处理记录：</Text>
                        <Text>{executionDetail.processedRecords.toLocaleString()}</Text>
                    </div>
                    <div>
                        <Text strong>总记录数：</Text>
                        <Text>{executionDetail.totalRecords.toLocaleString()}</Text>
                    </div>
                </div>
                {executionDetail.errorMessage && (
                    <Alert
                        message='错误信息'
                        description={executionDetail.errorMessage}
                        type='error'
                        style={{ marginTop: 16 }}
                    />
                )}
            </Card>

            {/* 执行步骤 */}
            <Card title='执行步骤' style={{ marginBottom: 24 }}>
                <Steps
                    current={getCurrentStep()}
                    direction='vertical'
                    size='small'
                    style={{ marginBottom: 24 }}
                >
                    {EXECUTION_STEPS.map((step, index) => {
                        const stepStatus = getStepStatus(index)
                        const currentStep = getCurrentStep()
                        const isCompleted = stepStatus === 'finish' || stepStatus === 'error'
                        const canViewResult = isCompleted && executionDetail?.status !== 'idle'
                        
                        return (
                            <Step
                                key={index}
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <span>{step.title}</span>
                                        <Space>
                                            <Tag 
                                                color={step.isAutomatic ? 'blue' : 'orange'}
                                                size="small"
                                            >
                                                {step.isAutomatic ? '自动执行' : '手动执行'}
                                            </Tag>
                                            {stepStatus === 'finish' && (
                                                <Tag color="success" size="small">已完成</Tag>
                                            )}
                                            {stepStatus === 'error' && (
                                                <Tag color="error" size="small">执行失败</Tag>
                                            )}
                                            {stepStatus === 'process' && (
                                                <Tag color="processing" size="small">执行中</Tag>
                                            )}
                                        </Space>
                                    </div>
                                }
                                description={
                                    <div>
                                        <div style={{ marginBottom: 8 }}>{step.description}</div>
                                        {canViewResult && (
                                            <Button
                                                type="link"
                                                size="small"
                                                icon={<EyeOutlined />}
                                                onClick={() => handleViewResult(index)}
                                                style={{ padding: 0, height: 'auto' }}
                                            >
                                                查看执行结果
                                            </Button>
                                        )}
                                    </div>
                                }
                                status={stepStatus}
                            />
                        )
                    })}
                </Steps>
                
                {/* 整体进度条 */}
                <div style={{ marginTop: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text strong>整体进度</Text>
                        <Text>{executionDetail?.progress || 0}%</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '12px', color: '#8c8c8c' }}>
                        <Text>已处理记录数: {executionDetail?.processedRecords?.toLocaleString() || 0}</Text>
                        <Text>总记录数: {executionDetail?.totalRecords?.toLocaleString() || 0}</Text>
                    </div>
                    <Progress
                        percent={executionDetail?.progress || 0}
                        status={
                            executionDetail?.status === 'error' 
                                ? 'exception' 
                                : executionDetail?.status === 'completed' 
                                ? 'success' 
                                : 'active'
                        }
                        strokeColor={
                            executionDetail?.status === 'running' 
                                ? { from: '#108ee9', to: '#87d068' }
                                : undefined
                        }
                    />
                </div>
            </Card>

            {/* 配置信息 */}
            {executionDetail.config && (
                <Card title='配置信息'>
                    <pre
                        style={{
                            background: '#f5f5f5',
                            padding: 16,
                            borderRadius: 4,
                            fontSize: 12,
                            whiteSpace: 'pre-wrap',
                            overflow: 'auto',
                        }}
                    >
                        {JSON.stringify(executionDetail.config, null, 2)}
                    </pre>
                </Card>
            )}

            {/* 执行结果查看弹窗 */}
            <Modal
                title={`执行结果 - ${selectedStepResult?.title}`}
                open={resultModalVisible}
                onCancel={handleCloseResultModal}
                footer={[
                    <Button key="close" onClick={handleCloseResultModal}>
                        关闭
                    </Button>
                ]}
                width={600}
            >
                {selectedStepResult && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>步骤名称：</Text>
                            <Text>{selectedStepResult.title}</Text>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>执行类型：</Text>
                            <Tag color={EXECUTION_STEPS[selectedStepResult.stepIndex]?.isAutomatic ? 'blue' : 'orange'}>
                                {EXECUTION_STEPS[selectedStepResult.stepIndex]?.isAutomatic ? '自动执行' : '手动执行'}
                            </Tag>
                        </div>
                        <div>
                            <Text strong>执行结果：</Text>
                            <div style={{ 
                                marginTop: 8, 
                                padding: 12, 
                                background: '#f5f5f5', 
                                borderRadius: 4,
                                border: '1px solid #d9d9d9'
                            }}>
                                <Text>{selectedStepResult.resultSummary}</Text>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default ExecutionDetail
