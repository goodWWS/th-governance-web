/**
 * 工作流执行服务
 * 提供独立的工作流启动和管理功能，不依赖于 React 组件生命周期
 */

import { message } from 'antd'
import { store } from '../store'
import { addMessage } from '../store/slices/workflowExecutionSlice'
import api, { SSEManager, SSEStatus, SSEStatusType } from '../utils/request'
import { logger } from '../utils/logger'

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

    // SSE连接管理
    private sseManager: SSEManager | null = null
    private sseStatus: SSEStatusType = SSEStatus.DISCONNECTED
    private currentConfig: StartWorkflowConfig | null = null

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
            logger.debug(`开始${actionName}工作流...`, config)
            // 保存配置
            this.currentConfig = config

            // 断开现有连接
            if (this.sseManager) {
                this.sseManager.disconnect()
                this.sseManager = null
            }

            // 创建SSE连接管理器
            const manager = api.createSSE({
                url,
                method: 'POST',
                maxReconnectAttempts: 3,
                reconnectInterval: 5000,
                onOpen: event => {
                    logger.debug(`工作流${actionName}SSE连接已建立:`, event)
                    this.sseStatus = SSEStatus.CONNECTED
                    logger.debug(`SSE连接已建立，开始监听工作流${actionName}过程`)

                    // 如果配置了 onOpen 回调，在连接建立时调用
                    // 注意：此时还没有 taskId，需要等待第一个消息
                },
                onMessage: event => {
                    this.handleSSEMessage(event)
                },
                onError: event => {
                    logger.error(`工作流${actionName}SSE连接错误:` + JSON.stringify(event))
                    this.sseStatus = SSEStatus.ERROR

                    const errorMsg = `工作流${actionName}连接失败`
                    message.error(errorMsg)

                    config.onError?.(errorMsg)
                },
                onClose: () => {
                    logger.debug(`工作流${actionName}SSE连接已关闭`)
                    this.sseStatus = SSEStatus.DISCONNECTED
                },
                onMaxReconnectAttemptsReached: () => {
                    logger.warn(`工作流${actionName}SSE重连次数已达上限`)
                    this.sseStatus = SSEStatus.MAX_RECONNECT_REACHED

                    const errorMsg = `工作流${actionName}连接失败，请检查网络连接`
                    message.error(errorMsg)

                    config.onError?.(errorMsg)
                },
            })

            this.sseManager = manager

            // 建立SSE连接
            manager.connect()

            logger.debug(`SSE连接已启动，等待工作流${actionName}消息...`)
            return true
        } catch (error) {
            const errorMsg = `${actionName}工作流失败: ${error instanceof Error ? error.message : '未知错误'}`
            logger.error(`${actionName}工作流异常:`, error as Error)

            message.error(errorMsg)

            config.onError?.(errorMsg)

            // 清理SSE连接
            if (this.sseManager) {
                this.sseManager.disconnect()
                this.sseManager = null
            }

            return false
        }
    }

    /**
     * 处理SSE消息
     */
    private handleSSEMessage(event: MessageEvent): void {
        try {
            const messageObj = JSON.parse(event.data)

            // 只保留需要的消息
            if (!messageObj.executionStatus || !messageObj.taskId) {
                return
            }

            // 添加消息到Redux，按taskId分组存储
            store.dispatch(
                addMessage({
                    taskId: messageObj.taskId,
                    message: messageObj,
                })
            )

            // 调用配置的消息回调
            const config = this.currentConfig
            if (config?.onMessage) {
                config.onMessage(messageObj)
            }

            if (config?.onOpen && messageObj.executionStatus === 'start') {
                config.onOpen(messageObj.taskId)
            }

            if (messageObj.executionStatus === 'end' && this.sseManager) {
                logger.debug('工作流执行完成，当前Redux状态:', store.getState().workflowExecution)
                this.sseManager.disconnect()
                this.sseManager = null
            }

            logger.info('工作流启动进度更新:', {
                taskId: messageObj.taskId,
                status: messageObj.executionStatus,
            })
        } catch (error) {
            logger.error(
                '解析工作流启动SSE数据失败:',
                error instanceof Error ? error : new Error(String(error))
            )
        }
    }

    /**
     * 停止工作流执行
     */
    public stopWorkflow(): void {
        this.disconnect()
        logger.debug('工作流执行已停止')
    }

    /**
     * 重置工作流状态
     */
    public resetWorkflow(): void {
        this.disconnect()
        this.currentConfig = null
        logger.debug('工作流状态已重置')
    }

    /**
     * 获取SSE连接状态
     */
    public getSSEStatus(): SSEConnectionState {
        return {
            status: this.sseStatus,
            manager: this.sseManager,
        }
    }

    /**
     * 断开SSE连接
     */
    private disconnect(): void {
        if (this.sseManager) {
            logger.debug('断开工作流启动SSE连接')
            this.sseManager.disconnect()
            this.sseManager = null
        }
        this.sseStatus = SSEStatus.DISCONNECTED
    }

    /**
     * 销毁服务实例（用于测试或特殊情况）
     */
    public static destroy(): void {
        if (WorkflowExecutionService.instance) {
            WorkflowExecutionService.instance.disconnect()
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

export default workflowExecutionService
