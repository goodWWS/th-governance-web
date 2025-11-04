/**
 * 工作流执行服务
 * 提供独立的工作流启动和管理功能，不依赖于 React 组件生命周期
 */

import uiMessage from '@/utils/uiMessage'
import { store } from '../store'
import { addMessage, updateExecutionStatus } from '../store/slices/workflowExecutionSlice'
import api, { SSEManager, SSEStatus, SSEStatusType } from '../utils/request'

// 启动工作流的配置参数
export interface StartWorkflowConfig {
    onSuccess?: (taskId: string) => void // 成功回调
    onError?: (error: string) => void // 错误回调
    onMessage?: (message: string) => void // 消息回调
    onOpen?: (taskId: string) => void // SSE连接建立后的导航回调
}

// SSE连接状态
export interface SSEConnectionState {
    status: SSEStatusType
    manager: SSEManager | null
}

/**
 * 工作流执行服务类
 * 单例模式，确保全局只有一个实例管理工作流执行
 */
class WorkflowExecutionService {
    private static instance: WorkflowExecutionService | null = null

    // 多路SSE连接管理（支持并发工作流）
    private sseManagers: Map<string, SSEManager> = new Map() // taskId -> manager
    private managerToTaskId: Map<SSEManager, string> = new Map() // manager -> taskId
    private sseStatus: SSEStatusType = SSEStatus.DISCONNECTED
    private currentConfig: StartWorkflowConfig | null = null

    // 订阅者管理：按 taskId 注册订阅者，在关闭/完成/错误时通知
    private subscribers: Map<
        string,
        Set<(event: { type: 'completed' | 'closed' | 'error'; taskId: string }) => void>
    > = new Map()

    // 私有构造函数，确保单例
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {}

    /**
     * 获取服务实例（单例模式）
     */
    public static getInstance(): WorkflowExecutionService {
        if (!WorkflowExecutionService.instance) {
            WorkflowExecutionService.instance = new WorkflowExecutionService()
        }
        return WorkflowExecutionService.instance
    }

    /**
     * 启动工作流
     */
    public async startWorkflow(config: StartWorkflowConfig): Promise<boolean> {
        return this.executeWorkflow('/data/governance/task/process/start', config, '启动')
    }

    /**
     * 继续执行工作流
     */
    public async continueWorkflow(taskId: string, config: StartWorkflowConfig): Promise<boolean> {
        return this.executeWorkflow(
            `/data/governance/task/process/continue/${taskId}`,
            config,
            '继续执行'
        )
    }

    /**
     * 通用的工作流执行方法
     */
    private async executeWorkflow(
        url: string,
        config: StartWorkflowConfig,
        actionName: string
    ): Promise<boolean> {
        try {
            console.debug(`开始${actionName}工作流...`, config)
            // 保存配置
            this.currentConfig = config

            // 创建SSE连接管理器
            const manager = api.createSSE({
                url,
                method: 'POST',
                maxReconnectAttempts: 3,
                reconnectInterval: 5000,
                onOpen: event => {
                    console.debug(`工作流${actionName}SSE连接已建立:`, event)
                    this.sseStatus = SSEStatus.CONNECTED
                    console.debug(`SSE连接已建立，开始监听工作流${actionName}过程`)

                    // 如果配置了 onOpen 回调，在连接建立时调用
                    // 注意：此时还没有 taskId，需要等待第一个消息
                },
                onMessage: event => {
                    this.handleSSEMessage(event, manager)
                },
                onError: event => {
                    console.error(`工作流${actionName}SSE连接错误:`, event)
                    this.sseStatus = SSEStatus.ERROR

                    const errorMsg = `工作流${actionName}连接失败`
                    uiMessage.error(errorMsg)

                    // 基于 manager->taskId 映射标记错误并通知订阅者
                    const taskId = this.managerToTaskId.get(manager)
                    if (taskId) {
                        try {
                            store.dispatch(
                                updateExecutionStatus({
                                    taskId,
                                    status: 'error',
                                    endTime: Date.now(),
                                })
                            )
                        } catch (e) {
                            console.error('更新工作流错误状态失败', e)
                        }
                        this.notifySubscribers(taskId, 'error')
                        this.cleanupManager(taskId, manager)
                    }

                    config.onError?.(errorMsg)
                },
                onClose: () => {
                    console.debug(`工作流${actionName}SSE连接已关闭`)
                    this.sseStatus = SSEStatus.DISCONNECTED
                    // 连接关闭时通知订阅者（通过 manager->taskId 映射）
                    const taskId = this.managerToTaskId.get(manager)
                    if (taskId) {
                        this.notifySubscribers(taskId, 'closed')
                        this.cleanupManager(taskId, manager)
                    }
                },
                onMaxReconnectAttemptsReached: () => {
                    console.warn(`工作流${actionName}SSE重连次数已达上限`)
                    this.sseStatus = SSEStatus.MAX_RECONNECT_REACHED

                    const errorMsg = `工作流${actionName}连接失败，请检查网络连接`
                    uiMessage.error(errorMsg)

                    // 基于 manager->taskId 映射标记错误并通知订阅者
                    const taskId = this.managerToTaskId.get(manager)
                    if (taskId) {
                        try {
                            store.dispatch(
                                updateExecutionStatus({
                                    taskId,
                                    status: 'error',
                                    endTime: Date.now(),
                                })
                            )
                        } catch (e) {
                            console.error('更新工作流错误状态失败', e)
                        }
                        this.notifySubscribers(taskId, 'error')
                        this.cleanupManager(taskId, manager)
                    }

                    config.onError?.(errorMsg)
                },
            })

            // 建立SSE连接
            manager.connect()

            console.debug(`SSE连接已启动，等待工作流${actionName}消息...`)
            return true
        } catch (error) {
            const errorMsg = `${actionName}工作流失败: ${error instanceof Error ? error.message : '未知错误'}`
            console.error(`${actionName}工作流异常:`, error)

            uiMessage.error(errorMsg)

            config.onError?.(errorMsg)

            // 清理SSE连接
            this.disconnectAll()

            return false
        }
    }

    /**
     * 处理SSE消息
     */
    private handleSSEMessage(event: MessageEvent, manager: SSEManager): void {
        try {
            const messageObj = JSON.parse(event.data)

            // 只保留需要的消息
            if (!messageObj.executionStatus || !messageObj.taskId) {
                return
            }

            const taskId: string = String(messageObj.taskId)
            // 建立 manager -> taskId 映射与多路连接记录
            if (!this.managerToTaskId.get(manager)) {
                this.managerToTaskId.set(manager, taskId)
            }
            if (!this.sseManagers.has(taskId)) {
                this.sseManagers.set(taskId, manager)
            }

            // 添加消息到Redux，按taskId分组存储
            store.dispatch(
                addMessage({
                    taskId,
                    message: messageObj,
                })
            )

            // 调用配置的消息回调
            const config = this.currentConfig
            if (config?.onMessage) {
                config.onMessage(messageObj)
            }

            if (messageObj.executionStatus === 'start') {
                // 标记为运行中
                try {
                    store.dispatch(updateExecutionStatus({ taskId, status: 'running' }))
                } catch (e) {
                    console.error('更新工作流运行状态失败', e)
                }

                if (config?.onOpen) {
                    config.onOpen(taskId)
                }
            }

            if (messageObj.executionStatus === 'end' && manager) {
                console.debug('工作流执行完成，当前Redux状态:', store.getState().workflowExecution)
                // 标记完成并通知订阅者
                try {
                    store.dispatch(
                        updateExecutionStatus({ taskId, status: 'completed', endTime: Date.now() })
                    )
                } catch (e) {
                    console.error('更新工作流完成状态失败', e)
                }
                this.notifySubscribers(taskId, 'completed')
                manager.disconnect()
                this.cleanupManager(taskId, manager)
            }
        } catch (error) {
            console.error('解析工作流启动SSE数据失败:', error)
        }
    }

    // 清理指定 taskId 的 manager 映射
    private cleanupManager(taskId: string, manager: SSEManager): void {
        try {
            this.managerToTaskId.delete(manager)
            this.sseManagers.delete(taskId)
            if (this.sseManagers.size === 0) {
                this.sseStatus = SSEStatus.DISCONNECTED
            }
        } catch (e) {
            console.error('清理SSE管理器失败', e)
        }
    }

    /**
     * 订阅指定 taskId 的工作流事件（completed/closed/error）
     * 返回取消订阅函数
     */
    public subscribe(
        taskId: string,
        callback: (event: { type: 'completed' | 'closed' | 'error'; taskId: string }) => void
    ): () => void {
        try {
            if (!this.subscribers.has(taskId)) {
                this.subscribers.set(taskId, new Set())
            }
            const set = this.subscribers.get(taskId)!
            set.add(callback)
            return () => {
                try {
                    set.delete(callback)
                    if (set.size === 0) {
                        this.subscribers.delete(taskId)
                    }
                } catch (e) {
                    console.error('取消订阅失败', e)
                }
            }
        } catch (e) {
            console.error('注册订阅者失败', e)
            // 返回空操作的取消订阅函数，避免调用端出错
            return () => {}
        }
    }

    /** 通知订阅者 */
    private notifySubscribers(taskId: string, type: 'completed' | 'closed' | 'error'): void {
        const subs = this.subscribers.get(taskId)
        if (!subs || subs.size === 0) return
        subs.forEach(cb => {
            try {
                cb({ type, taskId })
            } catch (e) {
                console.error('订阅者回调执行失败', e)
            }
        })
    }

    /**
     * 停止工作流执行
     */
    public stopWorkflow(): void {
        this.disconnectAll()
        console.debug('工作流执行已停止')
    }

    /**
     * 重置工作流状态
     */
    public resetWorkflow(): void {
        this.disconnectAll()
        this.currentConfig = null
        console.debug('工作流状态已重置')
    }

    /**
     * 获取SSE连接状态
     */
    public getSSEStatus(): SSEConnectionState {
        // 聚合状态：若任一连接处于connected，则返回connected；否则若存在connecting，则返回connecting
        let aggregated: SSEStatusType = SSEStatus.DISCONNECTED
        for (const mgr of this.sseManagers.values()) {
            const st = mgr.getStatus()
            if (st === SSEStatus.CONNECTED) {
                aggregated = SSEStatus.CONNECTED
                break
            }
            if (st === SSEStatus.CONNECTING) {
                aggregated = SSEStatus.CONNECTING
            }
        }
        return {
            status: aggregated,
            manager: null,
        }
    }

    /**
     * 断开SSE连接
     */
    private disconnectAll(): void {
        try {
            for (const [taskId, mgr] of this.sseManagers.entries()) {
                console.debug('断开工作流启动SSE连接', taskId)
                mgr.disconnect()
            }
            this.sseManagers.clear()
            this.managerToTaskId.clear()
        } catch (e) {
            console.error('断开所有SSE连接失败', e)
        }
        this.sseStatus = SSEStatus.DISCONNECTED
    }

    /**
     * 销毁服务实例（用于测试或特殊情况）
     */
    public static destroy(): void {
        if (WorkflowExecutionService.instance) {
            WorkflowExecutionService.instance.disconnectAll()
            WorkflowExecutionService.instance = null
        }
    }
}

// 导出服务实例
export const workflowExecutionService = WorkflowExecutionService.getInstance()

// 导出独立的启动工作流函数，供其他页面直接调用
export const startWorkflow = (config: StartWorkflowConfig): Promise<boolean> => {
    return workflowExecutionService.startWorkflow(config)
}

// 导出独立的继续执行工作流函数，供其他页面直接调用
export const continueWorkflow = (taskId: string, config: StartWorkflowConfig): Promise<boolean> => {
    return workflowExecutionService.continueWorkflow(taskId, config)
}

// 导出其他常用方法
export const stopWorkflow = (): void => {
    workflowExecutionService.stopWorkflow()
}

export const resetWorkflow = (): void => {
    workflowExecutionService.resetWorkflow()
}

export const getWorkflowSSEStatus = (): SSEConnectionState => {
    return workflowExecutionService.getSSEStatus()
}

// 导出订阅方法，供页面使用
export const subscribeWorkflow = (
    taskId: string,
    callback: (event: { type: 'completed' | 'closed' | 'error'; taskId: string }) => void
): (() => void) => {
    return workflowExecutionService.subscribe(taskId, callback)
}

export default workflowExecutionService
