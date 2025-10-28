import { ArrowLeftOutlined, ReloadOutlined, EyeOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Progress, Spin, Steps, Tag, Typography, Modal, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { workflowExecutionService, type WorkflowExecution, type WorkflowStep } from '../../services/workflowExecutionService'

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
        description: '将数据按照标准格式进行归一化处理',
        isAutomatic: true,
        resultSummary: '归一化处理了 45,678 条记录'
    },
    { 
        title: '数据入库', 
        description: '将处理后的数据存储到目标数据库',
        isAutomatic: false,
        resultSummary: '成功入库 98.5% 的数据，需人工处理 234 条异常记录'
    },
    { 
        title: '数据验证', 
        description: '验证入库数据的完整性和准确性',
        isAutomatic: true,
        resultSummary: '验证通过率 99.2%，发现 156 个潜在问题'
    }
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
    
    // 工作流执行状态
    const [workflowExecution, setWorkflowExecution] = useState<WorkflowExecution | null>(null)
    const [loading, setLoading] = useState(true)

    // 获取工作流执行详情
    useEffect(() => {
        const loadExecutionDetail = async () => {
            if (!id) return
            
            try {
                setLoading(true)
                const execution = workflowExecutionService.getExecution(id)
                setWorkflowExecution(execution || null)
                
                if (execution) {
    // 设置进度更新回调
                    workflowExecutionService.onStepProgress(id, (stepId, progress, processedRecords, totalRecords) => {
                        setWorkflowExecution(prev => {
                            if (!prev) return prev
                            return {
                                ...prev,
                                steps: prev.steps.map(step => 
                                    step.id === stepId 
                                        ? { 
                                            ...step, 
                                            progress, 
                                            processedRecords: {
                                                processed: processedRecords,
                                                total: totalRecords
                                            }
                                        }
                                        : step
                                )
                            }
                        })
                    })
                    
                    // 设置步骤状态更新回调
                    workflowExecutionService.onStepStatus(id, (stepId, status, step) => {
                        setWorkflowExecution(prev => {
                            if (!prev) return prev
                            return {
                                ...prev,
                                steps: prev.steps.map(s => 
                                    s.id === stepId ? { ...step } : s
                                )
                            }
                        })
                    })
                    
                    // 设置工作流状态更新回调
                    workflowExecutionService.onWorkflowStatus(id, (updatedExecution) => {
                        setWorkflowExecution(updatedExecution)
                    })
                }
            } catch (error) {
                console.error('加载执行详情失败:', error)
            } finally {
                setLoading(false)
            }
        }

        loadExecutionDetail()
    }, [id])

    // 继续执行步骤
    const handleContinueExecution = async (stepId: string) => {
        if (!id || !workflowExecution) return
        
        try {
            await workflowExecutionService.executeStep(id, stepId)
        } catch (error) {
            console.error('继续执行失败:', error)
        }
    }

    // 计算整体进度的辅助函数
    const calculateOverallProgress = (steps: WorkflowStep[]): number => {
        if (!steps || steps.length === 0) return 0
        
        // 只计算启用的步骤
        const enabledSteps = steps.filter(step => step.enabled)
        if (enabledSteps.length === 0) return 0
        
        const totalProgress = enabledSteps.reduce((sum, step) => sum + (step.progress || 0), 0)
        return Math.round(totalProgress / enabledSteps.length)
    }

    // 计算已处理记录数的辅助函数
    const calculateProcessedRecords = (steps: WorkflowStep[]): { processed: number; total: number } => {
        if (!steps || steps.length === 0) return { processed: 0, total: 0 }
        
        // 只计算启用的步骤
        const enabledSteps = steps.filter(step => step.enabled)
        
        const processed = enabledSteps.reduce((sum, step) => {
            return sum + (step.processedRecords?.processed || 0)
        }, 0)
        
        const total = enabledSteps.reduce((sum, step) => {
            return sum + (step.processedRecords?.total || 0)
        }, 0)
        
        return { processed, total }
    }

    // 格式化持续时间的辅助函数
    const formatDuration = (startTime: Date, endTime: Date): string => {
        const diffMs = endTime.getTime() - startTime.getTime()
        const diffSeconds = Math.floor(diffMs / 1000)
        const diffMinutes = Math.floor(diffSeconds / 60)
        const diffHours = Math.floor(diffMinutes / 60)
        
        if (diffHours > 0) {
            return `${diffHours}小时${diffMinutes % 60}分钟`
        } else if (diffMinutes > 0) {
            return `${diffMinutes}分钟${diffSeconds % 60}秒`
        } else {
            return `${diffSeconds}秒`
        }
    }

    // 返回上一页
    const goBack = () => {
        if (window.history.length > 1) {
            navigate(-1)
        } else {
            navigate('/data-governance/workflow-config')
        }
    }

    // 关闭结果查看弹窗
    const handleCloseResultModal = () => {
        setResultModalVisible(false)
        setSelectedStepResult(null)
    }

    // 获取状态标签
    const getStatusTag = (status: string) => {
        const statusMap = {
            'pending': { color: 'default', text: '等待中' },
            'running': { color: 'processing', text: '执行中' },
            'completed': { color: 'success', text: '已完成' },
            'failed': { color: 'error', text: '失败' },
            'paused': { color: 'warning', text: '已暂停' }
        }
        
        const config = statusMap[status as keyof typeof statusMap] || { color: 'default', text: status }
        return <Tag color={config.color}>{config.text}</Tag>
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <Spin size="large" />
                <Text style={{ marginLeft: 16 }}>加载执行详情中...</Text>
            </div>
        )
    }

    if (!workflowExecution) {
        return (
            <div style={{ padding: '24px' }}>
                <Alert
                    message="执行记录不存在"
                    description="未找到对应的工作流执行记录，请检查执行ID是否正确。"
                    type="warning"
                    showIcon
                    action={
                        <Button size="small" onClick={goBack}>
                            返回
                        </Button>
                    }
                />
            </div>
        )
    }

    const overallProgress = calculateOverallProgress(workflowExecution.steps)
    const { processed, total } = calculateProcessedRecords(workflowExecution.steps)

    return (
        <div style={{ padding: '24px' }}>
            {/* 页面头部 */}
            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={goBack}
                        style={{ marginRight: '16px' }}
                    >
                        返回
                    </Button>
                    <Title level={3} style={{ margin: 0 }}>
                        工作流执行详情
                    </Title>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {getStatusTag(workflowExecution.status)}
                    <Text type="secondary">执行ID: {workflowExecution.id}</Text>
                </div>
            </div>

            {/* 整体进度卡片 */}
            <Card style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <Title level={4} style={{ margin: 0 }}>整体执行进度</Title>
                    <Text strong style={{ fontSize: '18px' }}>{overallProgress}%</Text>
                </div>
                <Progress 
                    percent={overallProgress} 
                    status={workflowExecution.status === 'failed' ? 'exception' : 'active'}
                    strokeWidth={8}
                />
                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">已处理记录: {processed.toLocaleString()} / {total.toLocaleString()}</Text>
                    <Text type="secondary">
                        开始时间: {workflowExecution.startTime ? new Date(workflowExecution.startTime).toLocaleString() : '未开始'}
                    </Text>
                </div>
            </Card>

            {/* 步骤详情 */}
            <Card title="执行步骤详情">
                <Steps direction="vertical" current={-1}>
                    {workflowExecution.steps.map((step, index) => {
                        const isRunning = step.status === 'running'
                        const isCompleted = step.status === 'completed'
                        const isFailed = step.status === 'failed'
                        const isPaused = step.status === 'paused'
                        const canContinue = (isPaused || isFailed) && step.enabled
                        
                        return (
                            <Step
                                key={step.id}
                                title={
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span>{step.title || `步骤 ${index + 1}`}</span>
                                        {getStatusTag(step.status)}
                                        {!step.isAutomatic && (
                                            <Tag color="orange" size="small">手动</Tag>
                                        )}
                                        {!step.enabled && (
                                            <Tag color="default" size="small">已禁用</Tag>
                                        )}
                                    </div>
                                }
                                description={
                                    <div style={{ marginTop: '8px' }}>
                                        <Text type="secondary" style={{ display: 'block', marginBottom: '8px' }}>
                                            {step.description || '执行数据处理步骤'}
                                        </Text>
                                        
                                        {step.enabled && (
                                            <>
                                                {/* 进度条 */}
                                                {(isRunning || isCompleted) && (
                                                    <div style={{ marginBottom: '8px' }}>
                                                        <Progress 
                                                            percent={step.progress || 0} 
                                                            size="small"
                                                            status={isFailed ? 'exception' : isCompleted ? 'success' : 'active'}
                                                        />
                                                        {step.processedRecords && (
                                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                                已处理: {step.processedRecords.processed?.toLocaleString() || 0} / {step.processedRecords.total?.toLocaleString() || 0}
                                                            </Text>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* 执行时间信息 */}
                                                {(step.startTime || step.endTime) && (
                                                    <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
                                                        {step.startTime && (
                                                            <div>开始时间: {new Date(step.startTime).toLocaleString()}</div>
                                                        )}
                                                        {step.endTime && (
                                                            <div>结束时间: {new Date(step.endTime).toLocaleString()}</div>
                                                        )}
                                                        {step.startTime && step.endTime && (
                                                            <div>
                                                                执行时长: {formatDuration(new Date(step.startTime), new Date(step.endTime))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                
                                                {/* 错误信息 */}
                                                {step.error && (
                                                    <Alert
                                                        message="执行错误"
                                                        description={step.error}
                                                        type="error"
                                                        size="small"
                                                        style={{ marginBottom: '8px' }}
                                                    />
                                                )}
                                                
                                                {/* 操作按钮 */}
                                                <Space size="small">
                                                    {canContinue && (
                                                        <Button
                                                            size="small"
                                                            type="primary"
                                                            icon={<PlayCircleOutlined />}
                                                            onClick={() => handleContinueExecution(step.id)}
                                                        >
                                                            继续执行
                                                        </Button>
                                                    )}
                                                    {(isCompleted || step.result) && (
                                                        <Button
                                                            size="small"
                                                            icon={<EyeOutlined />}
                                                            onClick={() => {
                                                                setSelectedStepResult({
                                                                    title: step.title || `步骤 ${index + 1}`,
                                                                    resultSummary: step.result || '执行完成',
                                                                    stepIndex: index
                                                                })
                                                                setResultModalVisible(true)
                                                            }}
                                                        >
                                                            查看结果
                                                        </Button>
                                                    )}
                                                </Space>
                                            </>
                                        )}
                                    </div>
                                }
                                status={
                                    !step.enabled ? 'wait' :
                                    isFailed ? 'error' : 
                                    isCompleted ? 'finish' : 
                                    isRunning ? 'process' : 'wait'
                                }
                            />
                        )
                    })}
                </Steps>
            </Card>

            {/* 结果查看弹窗 */}
            <Modal
                title={`${selectedStepResult?.title} - 执行结果`}
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
                        <div style={{ marginBottom: '16px' }}>
                            <Text strong>步骤序号：</Text>
                            <Text>第 {selectedStepResult.stepIndex + 1} 步</Text>
                        </div>
                        <div>
                            <Text strong>执行结果：</Text>
                            <div style={{ 
                                marginTop: '8px', 
                                padding: '12px', 
                                backgroundColor: '#f6f8fa', 
                                borderRadius: '6px',
                                border: '1px solid #e1e4e8'
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
