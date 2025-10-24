import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Progress, Spin, Steps, Tag, Typography } from 'antd'
import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

const { Title, Text } = Typography
const { Step } = Steps

// 定义九个执行步骤
const EXECUTION_STEPS = [
    { title: '数据清洗', description: '清理无效字符，确保数据质量' },
    { title: '数据去重', description: '移除重复数据，防止数据失真' },
    { title: '类型转换', description: '将字符串类型转换为数据模型定义的标准类型' },
    { title: '标准字典对照', description: '将多源数据字典统一为标准字典' },
    { title: 'EMPI发放', description: '为同一患者发放唯一主索引' },
    { title: 'EMOI发放', description: '为检查检验发放就诊唯一主索引' },
    { title: '数据归一', description: '统一数据格式和标准值' },
    { title: '孤儿数据处理', description: '清理无法关联主表的无效数据' },
    { title: '数据脱敏', description: '保护敏感数据安全' },
]

const ExecutionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

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

    // 返回列表页
    const goBack = () => {
        navigate('/data-governance')
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

            {/* 执行步骤 */}
            <Card title='执行步骤' style={{ marginBottom: 24 }}>
                <Steps
                    current={getCurrentStep()}
                    direction='vertical'
                    size='small'
                    style={{ marginBottom: 24 }}
                >
                    {EXECUTION_STEPS.map((step, index) => (
                        <Step
                            key={index}
                            title={step.title}
                            description={step.description}
                            status={getStepStatus(index)}
                        />
                    ))}
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
        </div>
    )
}

export default ExecutionDetail
