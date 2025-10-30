import {
    BookOutlined,
    ClearOutlined,
    CopyOutlined,
    DeleteOutlined,
    EyeInvisibleOutlined,
    PlayCircleOutlined,
    SettingOutlined,
    SwapOutlined,
    UnorderedListOutlined,
} from '@ant-design/icons'
import { Alert, Button, Card, message, Space, Spin, Switch, Typography } from 'antd'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounceCallback } from '../../hooks/useDebounce'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import {
    startTask as _startTask,
    fetchWorkflowConfig,
    updateWorkflowConfig,
    updateWorkflowConfigLocal,
} from '../../store/slices/dataGovernanceSlice'
import type { WorkflowConfigUpdateItem } from '../../types'
import { dataGovernanceService } from '../../services/dataGovernanceService'
import { logger } from '../../utils/logger'

const { Title, _Text } = Typography

// 节点类型到图标的映射
const nodeTypeIconMap = {
    dataAccess: <UnorderedListOutlined />,
    dataValidate: <BookOutlined />,
    dataClean: <ClearOutlined />,
    dataTransform: <SwapOutlined />,
    dataFilter: <DeleteOutlined />,
    dataMerge: <CopyOutlined />,
    dataMask: <EyeInvisibleOutlined />,
    dataRecheck: <BookOutlined />,
    dataLoad: <UnorderedListOutlined />,
}

/**
 * 工作流步骤页面
 * 提供工作流执行步骤的配置和管理
 */
const WorkflowConfig: React.FC = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    // 从Redux获取状态
    const {
        workflowConfig: steps,
        workflowLoading,
        error: _error,
    } = useAppSelector(state => state.dataGovernance)

    const [loading, setLoading] = useState(false)
    const [isRunning, setIsRunning] = useState(false)

    // 用于收集待更新的配置项
    const pendingUpdatesRef = useRef<Map<number, WorkflowConfigUpdateItem>>(new Map())

    /**
     * 初始化加载工作流配置
     */
    const _loadWorkflowConfig = useCallback(async () => {
        try {
            setInitialLoading(true)
            const response = await dataGovernanceService.getWorkflowConfig()

            if (response.code === 200 && response.data) {
                // 按步骤序号排序
                const sortedSteps = response.data.sort((a, b) => a.nodeStep - b.nodeStep)
                setSteps(sortedSteps)
            } else {
                message.error(response.msg || '获取工作流配置失败')
            }
        } catch (error) {
            logger.error('加载工作流配置失败:', error)
            message.error('加载工作流配置失败，请刷新页面重试')
        } finally {
            setInitialLoading(false)
        }
    }, [])

    /**
     * 批量更新工作流配置
     */
    const updateWorkflowConfigs = useCallback(async () => {
        const updates = Array.from(pendingUpdatesRef.current.values())
        if (updates.length === 0) return

        try {
            // 显示保存中的toast提示
            const hideLoading = message.loading('正在保存配置...', 0)

            // 使用Redux action进行更新
            await dispatch(updateWorkflowConfig(updates)).unwrap()

            // 隐藏loading提示
            hideLoading()
            message.success(`成功更新 ${updates.length} 个配置项`)

            // 清空待更新列表
            pendingUpdatesRef.current.clear()
        } catch (error: any) {
            logger.error('更新工作流配置失败:', error)
            message.error(error || '更新工作流配置失败，请稍后重试')
        }
    }, [dispatch])

    // 使用防抖机制，避免频繁更新
    const debouncedUpdate = useDebounceCallback(updateWorkflowConfigs, 300)

    /**
     * 添加待更新的配置项
     */
    const addPendingUpdate = useCallback(
        (stepId: number, enabled: boolean, isAuto: boolean) => {
            pendingUpdatesRef.current.set(stepId, {
                id: stepId,
                enabled,
                is_auto: isAuto,
            })

            // 触发防抖更新
            debouncedUpdate()
        },
        [debouncedUpdate]
    )

    /**
     * 处理步骤启用状态变更
     */
    const handleStepEnabledChange = useCallback(
        (stepId: number, enabled: boolean) => {
            // 先更新本地Redux状态
            dispatch(updateWorkflowConfigLocal({ id: stepId, enabled }))

            // 获取当前步骤的isAuto状态
            const currentStep = steps.find(step => step.id === stepId)
            const isAuto = enabled ? currentStep?.isAuto || false : false

            // 添加到待更新列表
            addPendingUpdate(stepId, enabled, isAuto)
        },
        [dispatch, steps, addPendingUpdate]
    )
    /**
     * 处理自动化流转开关变更
     */
    const handleAutoFlowChange = useCallback(
        (stepId: number, isAuto: boolean) => {
            // 先更新本地Redux状态
            dispatch(updateWorkflowConfigLocal({ id: stepId, isAuto }))

            // 获取当前步骤的enabled状态
            const currentStep = steps.find(step => step.id === stepId)
            const enabled = currentStep?.enabled || false

            // 添加到待更新列表
            addPendingUpdate(stepId, enabled, isAuto)
        },
        [dispatch, steps, addPendingUpdate]
    )

    /**
     * 页面初始化
     */
    useEffect(() => {
        dispatch(fetchWorkflowConfig())
    }, [dispatch])

    /**
     * 启动工作流
     */
    const handleStartWorkflow = async () => {
        try {
            setLoading(true)
            logger.debug('工作流配置页面 - 开始启动工作流...')

            // 检查是否有启用的步骤
            const enabledSteps = steps.filter(step => step.enabled)
            if (enabledSteps.length === 0) {
                message.warning('请至少启用一个工作流步骤')
                return
            }

            logger.debug('启用的工作流步骤:', enabledSteps)

            // 调用真实的启动工作流API
            logger.debug('调用 dataGovernanceService.startWorkflow()')
            const response = await dataGovernanceService.startWorkflow()
            logger.debug('启动工作流响应:', response)

            // 根据实际接口响应格式处理
            if (response.code === 200 && response.data) {
                const taskId = response.data
                logger.debug('获取到任务ID:', taskId)

                setIsRunning(true)
                message.success('工作流启动成功！正在跳转到详情页面...')

                // 延迟跳转，让用户看到成功消息
                setTimeout(() => {
                    navigate(`/data-governance/workflow/${taskId}`)
                }, 1500)
            } else {
                logger.error('启动工作流失败:', response)
                message.error(response.msg || '启动工作流失败，请重试')
            }
        } catch (error) {
            logger.error('启动工作流异常:', error)
            message.error('启动工作流失败，请检查网络连接')
        } finally {
            setLoading(false)
        }
    }

    // 如果正在加载初始数据，显示加载状态
    if (workflowLoading && steps.length === 0) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '400px',
                }}
            >
                <Spin size='large' tip='正在加载工作流配置...' />
            </div>
        )
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
                    <SettingOutlined style={{ marginRight: 8 }} />
                    工作流步骤
                </Title>

                {/* 操作按钮 */}
                <Space>
                    <Button
                        type='primary'
                        icon={<PlayCircleOutlined />}
                        loading={loading && !isRunning}
                        disabled={isRunning || workflowLoading}
                        onClick={handleStartWorkflow}
                    >
                        启动工作流
                    </Button>
                </Space>
            </div>

            {/* 信息提示 */}
            <Alert
                message='工作流步骤配置'
                description='配置数据治理工作流的执行步骤，每个步骤可以独立启用或禁用，并设置是否自动流转到下一步骤。配置更改将自动保存。'
                type='info'
                showIcon
                style={{ marginBottom: 24 }}
            />

            {/* 状态提示 */}
            {isRunning && (
                <Alert
                    message='工作流运行中'
                    description='当前工作流正在执行中，请在执行历史页面查看详细进度。'
                    type='success'
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* 更新状态提示 */}
            {/* 移除Alert组件，改为使用message toast提示 */}

            {/* 工作流步骤卡片 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {steps.map((step, _index) => (
                    <Card
                        key={step.id}
                        style={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e8e8e8',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                            transition: 'all 0.2s ease',
                            opacity: step.enabled ? 1 : 0.7,
                        }}
                        styles={{
                            body: {
                                padding: '20px',
                            },
                        }}
                        hoverable
                    >
                        {/* 第一行：序号、图标、标题、启用开关 */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '12px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    flex: 1,
                                }}
                            >
                                {/* 步骤序号 */}
                                <div
                                    style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor: step.enabled ? '#1890ff' : '#d9d9d9',
                                        color: '#ffffff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                    }}
                                >
                                    {step.nodeStep}
                                </div>

                                {/* 图标 */}
                                <div
                                    style={{
                                        fontSize: '20px',
                                        color: step.enabled ? '#1890ff' : '#bfbfbf',
                                    }}
                                >
                                    {nodeTypeIconMap[step.nodeType] || <SettingOutlined />}
                                </div>

                                {/* 标题 */}
                                <div>
                                    <h3
                                        style={{
                                            margin: 0,
                                            fontSize: '16px',
                                            fontWeight: '500',
                                            color: step.enabled ? '#262626' : '#8c8c8c',
                                        }}
                                    >
                                        {step.nodeName}
                                    </h3>
                                </div>
                            </div>

                            {/* 启用开关 */}
                            <Switch
                                checked={step.enabled}
                                loading={workflowLoading}
                                onChange={checked => handleStepEnabledChange(step.id, checked)}
                            />
                        </div>

                        {/* 第二行：描述和自动化流转开关 */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: '16px',
                                paddingLeft: '40px',
                            }}
                        >
                            {/* 描述 */}
                            <div
                                style={{
                                    flex: 1,
                                    lineHeight: '1.6',
                                    fontSize: '14px',
                                    color: step.enabled ? '#595959' : '#8c8c8c',
                                }}
                            >
                                {step.descript}
                            </div>

                            {/* 自动化流转开关 */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    flexShrink: 0,
                                    padding: '4px 8px',
                                    backgroundColor: '#fafafa',
                                    borderRadius: '4px',
                                    border: '1px solid #f0f0f0',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: '12px',
                                        color: step.enabled ? '#595959' : '#bfbfbf',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    自动流转
                                </span>
                                <Switch
                                    size='small'
                                    checked={step.isAuto}
                                    loading={workflowLoading}
                                    onChange={checked => handleAutoFlowChange(step.id, checked)}
                                    disabled={!step.enabled}
                                />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export default WorkflowConfig
