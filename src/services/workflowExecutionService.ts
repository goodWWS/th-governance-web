/**
 * 工作流执行服务
 * 提供工作流执行的核心逻辑，包括步骤配置读取、跳过逻辑、进度跟踪等
 */

// 工作流步骤接口
export interface WorkflowStep {
    id: string
    taskId: string
    title: string
    description: string
    enabled: boolean
    isAutomatic: boolean
    icon?: React.ReactNode
    // 执行状态
    status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'paused'
    // 进度信息
    progress: number
    processedRecords: {
        processed: number
        total: number
    }
    totalRecords: number
    // 时间信息
    startTime?: Date
    endTime?: Date
    duration?: number // 执行耗时（毫秒）
    // 执行结果
    result?: string
    errorMessage?: string
    // 执行日志
    logs?: string[]
}

// 工作流执行状态
export interface WorkflowExecution {
    id: string
    status: 'idle' | 'running' | 'completed' | 'failed' | 'paused'
    steps: WorkflowStep[]
    currentStepIndex: number
    startTime?: Date
    endTime?: Date
}

// 步骤执行进度回调
export type StepProgressCallback = (
    stepId: string,
    progress: number,
    processedRecords: number,
    totalRecords: number
) => void

// 步骤状态变更回调
export type StepStatusCallback = (
    stepId: string,
    status: WorkflowStep['status'],
    step: WorkflowStep
) => void

// 工作流状态变更回调
export type WorkflowStatusCallback = (execution: WorkflowExecution) => void

/**
 * 工作流执行服务类
 */
export class WorkflowExecutionService {
    private static instance: WorkflowExecutionService
    private executions: Map<string, WorkflowExecution> = new Map()
    private stepProgressCallbacks: Map<string, StepProgressCallback[]> = new Map()
    private stepStatusCallbacks: Map<string, StepStatusCallback[]> = new Map()
    private workflowStatusCallbacks: Map<string, WorkflowStatusCallback[]> = new Map()

    private constructor() {}

    static getInstance(): WorkflowExecutionService {
        if (!WorkflowExecutionService.instance) {
            WorkflowExecutionService.instance = new WorkflowExecutionService()
        }
        return WorkflowExecutionService.instance
    }

    /**
     * 创建工作流执行实例
     */
    createExecution(
        id: string,
        stepConfigs: Omit<
            WorkflowStep,
            | 'status'
            | 'progress'
            | 'processedRecords'
            | 'totalRecords'
            | 'startTime'
            | 'endTime'
            | 'duration'
            | 'result'
            | 'errorMessage'
            | 'logs'
        >[]
    ): WorkflowExecution {
        const steps: WorkflowStep[] = stepConfigs.map(config => ({
            ...config,
            status: config.enabled ? 'pending' : 'skipped',
            progress: 0,
            processedRecords: {
                processed: 0,
                total: this.getStepTotalRecords(config.id),
            },
            totalRecords: this.getStepTotalRecords(config.id),
            logs: [],
        }))

        const execution: WorkflowExecution = {
            id,
            status: 'idle',
            steps,
            currentStepIndex: 0,
        }

        this.executions.set(id, execution)
        return execution
    }

    /**
     * 获取步骤的总记录数（模拟数据）
     */
    private getStepTotalRecords(stepId: string): number {
        const recordCounts: Record<string, number> = {
            'data-cleaning': 1180000,
            'data-deduplication': 45000,
            'type-conversion': 850000,
            'standard-mapping': 850000,
            'empi-assignment': 125000,
            'emoi-assignment': 95000,
            'data-normalization': 920000,
            'orphan-removal': 15000,
            'data-desensitization': 680000,
        }

        return recordCounts[stepId] || 100000
    }

    /**
     * 获取步骤的详细执行结果（模拟数据）
     */
    private getStepExecutionResult(stepId: string, processedRecords: number): string {
        const results: Record<string, (records: number) => string> = {
            'data-cleaning': records =>
                `数据清洗完成：清理了 ${records} 条记录，删除了 ${Math.floor(records * 0.05)} 条无效数据，修复了 ${Math.floor(records * 0.12)} 条格式错误`,
            'data-deduplication': records =>
                `数据去重完成：处理了 ${records} 条记录，发现并合并了 ${Math.floor(records * 0.15)} 条重复数据`,
            'type-conversion': records =>
                `类型转换完成：转换了 ${records} 条记录，成功率 99.8%，失败 ${Math.floor(records * 0.002)} 条记录已标记`,
            'standard-mapping': records =>
                `标准映射完成：映射了 ${records} 条记录，匹配率 95.6%，新增 ${Math.floor(records * 0.044)} 个标准编码`,
            'empi-assignment': records =>
                `EMPI分配完成：为 ${records} 条记录分配了主索引，新建 ${Math.floor(records * 0.3)} 个EMPI，关联 ${Math.floor(records * 0.7)} 个已有EMPI`,
            'emoi-assignment': records =>
                `EMOI分配完成：为 ${records} 条记录分配了机构索引，覆盖率 98.5%`,
            'data-normalization': records =>
                `数据标准化完成：标准化了 ${records} 条记录，统一了 ${Math.floor(records * 0.8)} 个数据格式`,
            'orphan-removal': records =>
                `孤儿数据清理完成：清理了 ${records} 条孤儿记录，释放存储空间 ${Math.floor(records * 0.5)}MB`,
            'data-desensitization': records =>
                `数据脱敏完成：脱敏了 ${records} 条记录，保护了姓名、身份证、电话等敏感信息`,
        }

        const resultFunc = results[stepId]
        return resultFunc
            ? resultFunc(processedRecords)
            : `${stepId} 执行完成，处理了 ${processedRecords} 条记录`
    }

    /**
     * 获取步骤的执行日志（模拟数据）
     */
    private getStepExecutionLogs(stepId: string): string[] {
        const logs: Record<string, string[]> = {
            'data-cleaning': [
                '开始数据清洗任务...',
                '检测到 15,234 条空值记录',
                '检测到 8,567 条格式异常记录',
                '开始清理无效数据...',
                '清理完成，数据质量提升至 98.5%',
            ],
            'data-deduplication': [
                '启动数据去重引擎...',
                '基于姓名+身份证进行重复检测',
                '发现 6,750 组重复数据',
                '执行数据合并策略...',
                '去重完成，数据唯一性达到 99.2%',
            ],
            'type-conversion': [
                '开始数据类型转换...',
                '转换日期格式：YYYY-MM-DD',
                '转换数值格式：保留2位小数',
                '转换编码格式：UTF-8',
                '类型转换完成，成功率 99.8%',
            ],
            'standard-mapping': [
                '加载标准编码字典...',
                '开始标准编码映射...',
                '匹配ICD-10疾病编码',
                '匹配药品标准编码',
                '标准映射完成，覆盖率 95.6%',
            ],
            'empi-assignment': [
                '启动EMPI分配引擎...',
                '基于姓名+身份证+电话进行匹配',
                '匹配已有EMPI记录',
                '为新患者创建EMPI',
                'EMPI分配完成，覆盖率 100%',
            ],
            'emoi-assignment': [
                '启动EMOI分配引擎...',
                '匹配医疗机构编码',
                '验证机构有效性',
                '分配机构索引',
                'EMOI分配完成，覆盖率 98.5%',
            ],
            'data-normalization': [
                '开始数据标准化处理...',
                '统一地址格式',
                '标准化联系方式',
                '规范化医疗术语',
                '数据标准化完成',
            ],
            'orphan-removal': [
                '扫描孤儿数据...',
                '检测到 15,000 条孤儿记录',
                '验证数据关联性',
                '清理无关联数据',
                '孤儿数据清理完成',
            ],
            'data-desensitization': [
                '启动数据脱敏引擎...',
                '识别敏感数据字段',
                '应用脱敏规则',
                '验证脱敏效果',
                '数据脱敏完成，安全等级：高',
            ],
        }

        return logs[stepId] || ['步骤开始执行...', '处理中...', '步骤执行完成']
    }

    /**
     * 启动工作流执行
     */
    async startExecution(executionId: string): Promise<void> {
        const execution = this.executions.get(executionId)
        if (!execution) {
            throw new Error(`工作流执行实例不存在: ${executionId}`)
        }

        if (execution.status === 'running') {
            throw new Error('工作流已在执行中')
        }

        try {
            execution.status = 'running'
            execution.startTime = new Date()
            execution.currentStepIndex = this.findNextEnabledStep(execution, -1)

            // 立即通知状态变化
            this.notifyWorkflowStatus(executionId, execution)

            // 如果没有找到可执行的步骤，直接完成
            if (execution.currentStepIndex === -1) {
                execution.status = 'completed'
                execution.endTime = new Date()
                this.notifyWorkflowStatus(executionId, execution)
                return
            }

            // 异步开始执行步骤，避免阻塞UI
            setTimeout(async () => {
                try {
                    await this.executeNextStep(executionId)
                } catch (error) {
                    console.error('执行步骤失败:', error)
                    execution.status = 'failed'
                    execution.endTime = new Date()
                    this.notifyWorkflowStatus(executionId, execution)
                }
            }, 100) // 短暂延迟确保UI能及时响应
        } catch (error) {
            execution.status = 'failed'
            execution.endTime = new Date()
            this.notifyWorkflowStatus(executionId, execution)
            throw error
        }
    }

    /**
     * 暂停工作流执行
     */
    pauseExecution(executionId: string): void {
        const execution = this.executions.get(executionId)
        if (!execution) return

        execution.status = 'paused'
        const currentStep = execution.steps[execution.currentStepIndex]
        if (currentStep && currentStep.status === 'running') {
            currentStep.status = 'paused'
        }

        this.notifyWorkflowStatus(executionId, execution)
    }

    /**
     * 继续工作流执行
     */
    async resumeExecution(executionId: string): Promise<void> {
        const execution = this.executions.get(executionId)
        if (!execution) return

        if (execution.status !== 'paused') {
            throw new Error('工作流未处于暂停状态')
        }

        execution.status = 'running'
        const currentStep = execution.steps[execution.currentStepIndex]
        if (currentStep && currentStep.status === 'paused') {
            currentStep.status = 'running'
        }

        this.notifyWorkflowStatus(executionId, execution)

        // 继续执行当前步骤或下一步骤
        await this.executeNextStep(executionId)
    }

    /**
     * 执行单个步骤
     */
    async executeStep(executionId: string, stepId: string): Promise<void> {
        let execution = this.executions.get(executionId)

        // 如果在executions Map中找不到，检查是否为模拟历史记录
        if (!execution) {
            const knownMockIds = ['1', '2', '3', '4']
            if (knownMockIds.includes(executionId)) {
                // 为模拟历史记录生成执行实例并存储到Map中，以支持继续执行
                execution = this.generateMockExecutionForHistoryRecord(executionId)
                this.executions.set(executionId, execution)
                console.log(`为模拟历史记录 ${executionId} 创建执行实例以支持继续执行`)
            } else {
                throw new Error(`执行实例 ${executionId} 不存在`)
            }
        }

        const step = execution.steps.find(s => s.id === stepId)
        if (!step) {
            throw new Error(`步骤 ${stepId} 不存在`)
        }

        if (step.status === 'running') {
            throw new Error(`步骤 ${stepId} 正在执行中`)
        }

        const stepIndex = execution.steps.findIndex(s => s.id === stepId)

        try {
            // 更新步骤状态为执行中
            step.status = 'running'
            step.startTime = new Date()
            step.progress = 0
            step.processedRecords = {
                processed: 0,
                total: step.totalRecords,
            }

            // 更新工作流状态
            execution.status = 'running'
            execution.currentStepIndex = stepIndex

            // 触发状态更新回调
            this.notifyStepStatus(executionId, stepId, step.status, step)
            this.notifyWorkflowStatus(executionId, execution)

            // 模拟步骤执行过程
            await this.simulateStepExecution(executionId, stepIndex)

            // 执行完成
            step.status = 'completed'
            step.endTime = new Date()
            step.duration = step.endTime.getTime() - step.startTime!.getTime()
            step.progress = 100
            step.processedRecords = {
                processed: step.totalRecords,
                total: step.totalRecords,
            }
            step.result = this.getStepExecutionResult(step.id, step.totalRecords)

            // 触发状态更新回调
            this.notifyStepStatus(executionId, stepId, step.status, step)

            // 检查是否还有后续步骤需要执行
            const nextStepIndex = this.findNextEnabledStep(execution, stepIndex)

            if (nextStepIndex === -1) {
                // 所有步骤执行完成
                execution.status = 'completed'
                execution.endTime = new Date()
                this.notifyWorkflowStatus(executionId, execution)
            } else {
                // 有后续步骤，继续执行
                execution.currentStepIndex = nextStepIndex
                const nextStep = execution.steps[nextStepIndex]

                if (!nextStep) {
                    console.error(`步骤索引 ${nextStepIndex} 对应的步骤不存在`)
                    return
                }

                if (nextStep.isAutomatic) {
                    // 自动步骤，延迟后自动执行
                    setTimeout(() => {
                        this.executeNextStep(executionId).catch(console.error)
                    }, 1000)
                } else {
                    // 手动步骤，暂停等待用户操作
                    execution.status = 'paused'
                    nextStep.status = 'paused'
                    this.notifyStepStatus(executionId, nextStep.id, nextStep.status, nextStep)
                    this.notifyWorkflowStatus(executionId, execution)
                }
            }
        } catch (error) {
            // 执行失败
            step.status = 'failed'
            step.endTime = new Date()
            if (step.startTime) {
                step.duration = step.endTime.getTime() - step.startTime.getTime()
            }
            step.errorMessage = error instanceof Error ? error.message : '未知错误'

            // 工作流执行失败
            execution.status = 'failed'
            execution.endTime = new Date()

            // 触发状态更新回调
            this.notifyStepStatus(executionId, stepId, step.status, step)
            this.notifyWorkflowStatus(executionId, execution)

            throw error
        }
    }

    /**
     * 暂停步骤执行
     */
    async pauseStep(executionId: string, stepId: string): Promise<void> {
        const execution = this.executions.get(executionId)
        if (!execution) {
            throw new Error(`执行实例 ${executionId} 不存在`)
        }

        const step = execution.steps.find(s => s.id === stepId)
        if (!step) {
            throw new Error(`步骤 ${stepId} 不存在`)
        }

        if (step.status !== 'running') {
            throw new Error(`步骤 ${stepId} 未在执行中，无法暂停`)
        }

        step.status = 'paused'
        this.notifyWorkflowStatus(executionId, execution)
    }

    /**
     * 恢复步骤执行
     */
    async resumeStep(executionId: string, stepId: string): Promise<void> {
        const execution = this.executions.get(executionId)
        if (!execution) {
            throw new Error(`执行实例 ${executionId} 不存在`)
        }

        const step = execution.steps.find(s => s.id === stepId)
        if (!step) {
            throw new Error(`步骤 ${stepId} 不存在`)
        }

        if (step.status !== 'paused') {
            throw new Error(`步骤 ${stepId} 未暂停，无法恢复`)
        }

        const stepIndex = execution.steps.findIndex(s => s.id === stepId)

        try {
            // 恢复步骤执行状态
            step.status = 'running'

            // 更新工作流状态
            execution.status = 'running'
            execution.currentStepIndex = stepIndex

            // 触发状态更新回调
            this.notifyStepStatus(executionId, stepId, step.status, step)
            this.notifyWorkflowStatus(executionId, execution)

            // 继续模拟步骤执行过程（从当前进度继续）
            await this.simulateStepExecution(executionId, stepIndex)

            // 执行完成
            step.status = 'completed'
            step.endTime = new Date()
            if (step.startTime) {
                step.duration = step.endTime.getTime() - step.startTime.getTime()
            }
            step.progress = 100
            step.processedRecords = {
                processed: step.totalRecords,
                total: step.totalRecords,
            }
            step.result = this.getStepExecutionResult(step.id, step.totalRecords)

            // 触发状态更新回调
            this.notifyStepStatus(executionId, stepId, step.status, step)

            // 检查是否还有后续步骤需要执行
            const nextStepIndex = this.findNextEnabledStep(execution, stepIndex)

            if (nextStepIndex === -1) {
                // 所有步骤执行完成
                execution.status = 'completed'
                execution.endTime = new Date()
                this.notifyWorkflowStatus(executionId, execution)
            } else {
                // 有后续步骤，继续执行
                execution.currentStepIndex = nextStepIndex
                const nextStep = execution.steps[nextStepIndex]

                if (!nextStep) {
                    console.error(`步骤索引 ${nextStepIndex} 对应的步骤不存在`)
                    return
                }

                if (nextStep.isAutomatic) {
                    // 自动步骤，延迟后自动执行
                    setTimeout(() => {
                        this.executeNextStep(executionId).catch(console.error)
                    }, 1000)
                } else {
                    // 手动步骤，暂停等待用户操作
                    execution.status = 'paused'
                    nextStep.status = 'paused'
                    this.notifyStepStatus(executionId, nextStep.id, nextStep.status, nextStep)
                    this.notifyWorkflowStatus(executionId, execution)
                }
            }
        } catch (error) {
            // 执行失败
            step.status = 'failed'
            step.endTime = new Date()
            if (step.startTime) {
                step.duration = step.endTime.getTime() - step.startTime.getTime()
            }
            step.errorMessage = error instanceof Error ? error.message : '未知错误'

            // 工作流执行失败
            execution.status = 'failed'
            execution.endTime = new Date()

            // 触发状态更新回调
            this.notifyStepStatus(executionId, stepId, step.status, step)
            this.notifyWorkflowStatus(executionId, execution)

            throw error
        }
    }

    /**
     * 查找下一个启用的步骤
     */
    private findNextEnabledStep(execution: WorkflowExecution, currentIndex: number): number {
        for (let i = currentIndex + 1; i < execution.steps.length; i++) {
            const step = execution.steps[i]
            if (step && step.enabled && step.status !== 'completed' && step.status !== 'skipped') {
                return i
            }
        }
        return -1 // 没有更多步骤
    }

    /**
     * 执行下一个步骤
     */
    private async executeNextStep(executionId: string): Promise<void> {
        const execution = this.executions.get(executionId)
        if (!execution) return

        const nextStepIndex = this.findNextEnabledStep(execution, execution.currentStepIndex - 1)

        if (nextStepIndex === -1) {
            // 所有步骤执行完成
            execution.status = 'completed'
            execution.endTime = new Date()
            this.notifyWorkflowStatus(executionId, execution)
            return
        }

        execution.currentStepIndex = nextStepIndex
        await this.executeStepInternal(executionId, nextStepIndex)
    }

    /**
     * 执行具体步骤
     */
    private async executeStepInternal(executionId: string, stepIndex: number): Promise<void> {
        const execution = this.executions.get(executionId)
        if (!execution) return

        const step = execution.steps[stepIndex]
        if (!step) return

        try {
            // 更新步骤状态
            step.status = 'running'
            step.startTime = new Date()
            step.progress = 0
            step.processedRecords = {
                processed: 0,
                total: step.totalRecords,
            }
            step.logs = this.getStepExecutionLogs(step.id)

            this.notifyStepStatus(executionId, step.id, step.status, step)

            // 如果是手动步骤，暂停等待用户操作
            if (!step.isAutomatic) {
                execution.status = 'paused'
                step.status = 'paused'
                this.notifyStepStatus(executionId, step.id, step.status, step)
                this.notifyWorkflowStatus(executionId, execution)
                return
            }

            // 模拟步骤执行
            await this.simulateStepExecution(executionId, stepIndex)

            // 步骤执行完成
            step.status = 'completed'
            step.endTime = new Date()
            step.progress = 100
            step.processedRecords = {
                processed: step.totalRecords,
                total: step.totalRecords,
            }

            if (step.startTime) {
                step.duration = step.endTime.getTime() - step.startTime.getTime()
            }

            step.result = this.getStepExecutionResult(step.id, step.processedRecords.processed)

            // 通知步骤完成
            this.notifyStepStatus(executionId, step.id, step.status, step)

            // 如果是自动步骤，继续执行下一步骤
            if (step.isAutomatic) {
                // 延迟1秒后自动执行下一步骤，模拟处理间隔
                setTimeout(() => {
                    this.executeNextStep(executionId)
                }, 1000)
            } else {
                // 非自动步骤，暂停等待手动继续
                execution.status = 'paused'
                this.notifyWorkflowStatus(executionId, execution)
            }
        } catch (error) {
            // 步骤执行失败
            step.status = 'failed'
            step.endTime = new Date()

            if (step.startTime) {
                step.duration = step.endTime.getTime() - step.startTime.getTime()
            }

            step.errorMessage = error instanceof Error ? error.message : '未知错误'
            execution.status = 'failed'

            this.notifyStepStatus(executionId, step.id, step.status, step)
            this.notifyWorkflowStatus(executionId, execution)
        }
    }

    /**
     * 模拟步骤执行过程 - 改进版本，更真实的数据处理模拟
     */
    private async simulateStepExecution(executionId: string, stepIndex: number): Promise<void> {
        const execution = this.executions.get(executionId)
        if (!execution) return

        const step = execution.steps[stepIndex]
        if (!step) return

        const totalRecords = step.totalRecords

        // 根据步骤类型设置不同的处理特性
        const stepCharacteristics = this.getStepProcessingCharacteristics(step.id)

        let processed = 0
        let batchCount = 0
        const maxBatches = stepCharacteristics.totalBatches

        while (processed < totalRecords && batchCount < maxBatches) {
            // 检查是否被暂停
            if (execution.status === 'paused' || step.status === 'paused') {
                break
            }

            // 动态计算批次大小，模拟真实处理的波动
            const batchSize = this.calculateDynamicBatchSize(
                step.id,
                batchCount,
                maxBatches,
                totalRecords,
                stepCharacteristics
            )

            const currentProcessed = Math.min(processed + batchSize, totalRecords)
            const progress = Math.floor((currentProcessed / totalRecords) * 100)

            // 更新步骤进度，使用正确的数据结构
            step.processedRecords = {
                processed: currentProcessed,
                total: totalRecords,
            }
            step.progress = progress

            // 通知进度更新
            this.notifyStepProgress(executionId, step.id, progress, step.processedRecords)

            // 动态处理延迟，模拟不同步骤的处理速度差异
            const delay = this.calculateProcessingDelay(step.id, batchCount, stepCharacteristics)
            await new Promise(resolve => setTimeout(resolve, delay))

            processed = currentProcessed
            batchCount++
        }
    }

    /**
     * 获取步骤处理特性
     */
    private getStepProcessingCharacteristics(stepId: string) {
        const characteristics: Record<
            string,
            {
                totalBatches: number
                baseDelay: number
                variability: number
                processingPattern: 'linear' | 'fast-start' | 'slow-start' | 'variable'
                complexity: number
            }
        > = {
            'data-cleaning': {
                totalBatches: 25,
                baseDelay: 200,
                variability: 0.4,
                processingPattern: 'slow-start',
                complexity: 0.8,
            },
            'data-deduplication': {
                totalBatches: 15,
                baseDelay: 300,
                variability: 0.6,
                processingPattern: 'variable',
                complexity: 0.9,
            },
            'type-conversion': {
                totalBatches: 20,
                baseDelay: 150,
                variability: 0.3,
                processingPattern: 'linear',
                complexity: 0.5,
            },
            'standard-mapping': {
                totalBatches: 30,
                baseDelay: 400,
                variability: 0.7,
                processingPattern: 'variable',
                complexity: 1.0,
            },
            'empi-assignment': {
                totalBatches: 18,
                baseDelay: 250,
                variability: 0.5,
                processingPattern: 'fast-start',
                complexity: 0.7,
            },
            'emoi-assignment': {
                totalBatches: 12,
                baseDelay: 180,
                variability: 0.4,
                processingPattern: 'linear',
                complexity: 0.6,
            },
            'data-normalization': {
                totalBatches: 22,
                baseDelay: 220,
                variability: 0.5,
                processingPattern: 'slow-start',
                complexity: 0.6,
            },
            'orphan-removal': {
                totalBatches: 8,
                baseDelay: 100,
                variability: 0.3,
                processingPattern: 'fast-start',
                complexity: 0.4,
            },
            'data-desensitization': {
                totalBatches: 16,
                baseDelay: 350,
                variability: 0.6,
                processingPattern: 'variable',
                complexity: 0.8,
            },
        }

        return (
            characteristics[stepId] || {
                totalBatches: 20,
                baseDelay: 200,
                variability: 0.5,
                processingPattern: 'linear' as const,
                complexity: 0.6,
            }
        )
    }

    /**
     * 计算动态批次大小
     */
    private calculateDynamicBatchSize(
        _stepId: string,
        batchCount: number,
        maxBatches: number,
        totalRecords: number,
        characteristics: ReturnType<typeof this.getStepProcessingCharacteristics>
    ): number {
        const baseBatchSize = Math.floor(totalRecords / maxBatches)
        const progress = batchCount / maxBatches

        let multiplier = 1

        switch (characteristics.processingPattern) {
            case 'fast-start':
                // 开始快，后面慢
                multiplier = 1.5 - progress * 0.8
                break
            case 'slow-start':
                // 开始慢，后面快
                multiplier = 0.5 + progress * 0.8
                break
            case 'variable':
                // 波动处理
                multiplier = 0.7 + 0.6 * Math.sin(progress * Math.PI * 3)
                break
            case 'linear':
            default:
                // 线性处理，但有小幅波动
                multiplier = 0.9 + 0.2 * Math.random()
                break
        }

        // 添加随机变化
        const randomFactor = 1 + (Math.random() - 0.5) * characteristics.variability

        return Math.max(
            Math.floor(baseBatchSize * multiplier * randomFactor),
            Math.floor(totalRecords * 0.01) // 最小批次大小为总数的1%
        )
    }

    /**
     * 计算处理延迟
     */
    private calculateProcessingDelay(
        _stepId: string,
        _batchCount: number,
        characteristics: ReturnType<typeof this.getStepProcessingCharacteristics>
    ): number {
        const baseDelay = characteristics.baseDelay
        const complexityFactor = 1 + characteristics.complexity * 0.5
        const randomFactor = 0.7 + Math.random() * 0.6

        return Math.floor(baseDelay * complexityFactor * randomFactor)
    }

    /**
     * 为历史记录生成对应的模拟执行数据
     */
    private generateMockExecutionForHistoryRecord(id: string): WorkflowExecution {
        const stepConfigs = [
            {
                id: '1',
                taskId: '1',
                title: '数据源连接检查',
                description: '检查数据源连接状态和权限',
                enabled: true,
                isAutomatic: true,
            },
            {
                id: '2',
                taskId: '2',
                title: '数据质量评估',
                description: '评估数据质量，识别异常数据',
                enabled: true,
                isAutomatic: true,
            },
            {
                id: '3',
                taskId: '3',
                title: '重复数据检测',
                description: '检测并标记重复的数据记录',
                enabled: true,
                isAutomatic: true,
            },
            {
                id: '4',
                taskId: '4',
                title: '数据标准化',
                description: '按照预定义规则标准化数据格式',
                enabled: true,
                isAutomatic: true,
            },
            {
                id: '5',
                taskId: '5',
                title: '敏感数据识别',
                description: '识别和标记敏感数据字段',
                enabled: true,
                isAutomatic: true,
            },
            {
                id: '6',
                taskId: '6',
                title: '数据分类标签',
                description: '为数据添加分类和标签',
                enabled: true,
                isAutomatic: true,
            },
            {
                id: '7',
                taskId: '7',
                title: '数据血缘分析',
                description: '分析数据的来源和流向关系',
                enabled: true,
                isAutomatic: true,
            },
            {
                id: '8',
                taskId: '8',
                title: '孤立数据清理',
                description: '清理无关联的孤立数据记录',
                enabled: true,
                isAutomatic: false,
            },
            {
                id: '9',
                taskId: '9',
                title: '执行结果汇总',
                description: '汇总整个工作流的执行结果',
                enabled: true,
                isAutomatic: true,
            },
        ]

        const mockResults = [
            '数据源连接正常，权限验证通过，共检测到 3 个数据源',
            '数据质量评估完成，发现 1,234 条异常数据，质量评分 92.5%',
            '重复数据检测完成，发现 567 条重复记录，去重率 98.8%',
            '数据标准化处理完成，格式化 45,678 条记录，成功率 99.2%',
            '敏感数据识别完成，标记 2,345 个敏感字段，覆盖率 100%',
            '数据分类完成，添加 12 个分类标签，分类准确率 96.7%',
            '数据血缘分析完成，建立 1,456 个血缘关系，关系图谱已生成',
            '孤立数据清理进行中，已处理 15,234 条记录，剩余 8,766 条待处理',
            '执行结果汇总完成，生成详细报告和统计图表',
        ]

        // 根据ID确定执行状态和步骤状态
        let executionStatus: 'running' | 'paused' | 'completed' | 'failed'
        let steps: WorkflowStep[]

        if (id === '4') {
            // ID为4的是暂停状态的工作流
            executionStatus = 'paused'
            const baseTime = new Date()
            baseTime.setHours(baseTime.getHours() - 1) // 1小时前开始

            steps = stepConfigs.map((config, index) => {
                const stepStartTime = new Date(baseTime.getTime() + index * 8 * 60 * 1000) // 每步间隔8分钟
                const totalRecords = Math.floor(20000 + Math.random() * 10000) // 20k-30k记录

                if (index < 7) {
                    // 前7步已完成
                    const stepEndTime = new Date(
                        stepStartTime.getTime() + (5 + Math.random() * 10) * 60 * 1000
                    )
                    const processedRecords = Math.floor(
                        totalRecords * (0.95 + Math.random() * 0.05)
                    )

                    return {
                        ...config,
                        status: 'completed' as const,
                        progress: 100,
                        processedRecords: {
                            processed: processedRecords,
                            total: totalRecords,
                        },
                        totalRecords,
                        startTime: stepStartTime,
                        endTime: stepEndTime,
                        duration: stepEndTime.getTime() - stepStartTime.getTime(),
                        result: mockResults[index],
                        logs: [
                            `${stepStartTime.toLocaleTimeString()} - 开始执行${config.title}`,
                            `${stepEndTime.toLocaleTimeString()} - ${config.title}执行完成`,
                        ],
                    }
                } else if (index === 7) {
                    // 第8步（孤立数据清理）暂停中
                    const processedRecords = Math.floor(totalRecords * 0.63) // 63%进度

                    return {
                        ...config,
                        status: 'paused' as const,
                        progress: 63,
                        processedRecords: {
                            processed: processedRecords,
                            total: totalRecords,
                        },
                        totalRecords,
                        startTime: stepStartTime,
                        endTime: undefined,
                        duration: undefined,
                        result: mockResults[index],
                        logs: [
                            `${stepStartTime.toLocaleTimeString()} - 开始执行${config.title}`,
                            `${new Date(stepStartTime.getTime() + 15 * 60 * 1000).toLocaleTimeString()} - 处理进度 63%，已处理 ${processedRecords.toLocaleString()} 条记录`,
                            `${new Date(stepStartTime.getTime() + 20 * 60 * 1000).toLocaleTimeString()} - 执行暂停，等待用户确认`,
                        ],
                    }
                } else {
                    // 后续步骤待执行
                    return {
                        ...config,
                        status: 'pending' as const,
                        progress: 0,
                        processedRecords: {
                            processed: 0,
                            total: totalRecords,
                        },
                        totalRecords,
                        startTime: undefined,
                        endTime: undefined,
                        duration: undefined,
                        result: undefined,
                        logs: [],
                    }
                }
            })
        } else {
            // 其他ID都是已完成状态
            executionStatus = 'completed'
            const baseTime = new Date()
            baseTime.setHours(baseTime.getHours() - 3) // 3小时前开始

            steps = stepConfigs.map((config, index) => {
                const stepStartTime = new Date(baseTime.getTime() + index * 10 * 60 * 1000)
                const stepEndTime = new Date(
                    stepStartTime.getTime() + (6 + Math.random() * 12) * 60 * 1000
                )
                const totalRecords = Math.floor(18000 + Math.random() * 12000)
                const processedRecords = Math.floor(totalRecords * (0.96 + Math.random() * 0.04))

                return {
                    ...config,
                    status: 'completed' as const,
                    progress: 100,
                    processedRecords: {
                        processed: processedRecords,
                        total: totalRecords,
                    },
                    totalRecords,
                    startTime: stepStartTime,
                    endTime: stepEndTime,
                    duration: stepEndTime.getTime() - stepStartTime.getTime(),
                    result: mockResults[index],
                    logs: [
                        `${stepStartTime.toLocaleTimeString()} - 开始执行${config.title}`,
                        `${stepEndTime.toLocaleTimeString()} - ${config.title}执行完成`,
                    ],
                }
            })
        }

        const execution: WorkflowExecution = {
            id,
            status: executionStatus,
            steps,
            currentStepIndex: executionStatus === 'paused' ? 7 : steps.length - 1,
            startTime: steps[0]?.startTime,
            endTime: executionStatus === 'completed' ? steps[steps.length - 1]?.endTime : undefined,
        }

        // 不存储到内存中，避免影响getAllExecutions的结果
        return execution
    }

    /**
     * 生成历史模拟数据
     * 当找不到执行记录时，生成一个包含完整历史数据的模拟执行记录
     * 动态读取WorkflowConfig中的步骤配置，包含所有步骤（启用和禁用的）
     */
    generateMockExecution(id: string): WorkflowExecution {
        // 完整的工作流步骤配置（包含所有9个步骤）
        const allStepConfigs = [
            {
                id: 'data-cleaning',
                taskId: '1',
                title: '数据清洗',
                description:
                    '脏数据主要是数据值域内包含了一些无效字符、特殊字符、过渡态的拼接符等。脏数据处理是通过清洗函数等工程手段，在固定环节调用，将数据装载到ODS数据中心的过程。',
                enabled: true, // 默认启用
                isAutomatic: true,
            },
            {
                id: 'data-deduplication',
                taskId: '2',
                title: '数据去重',
                description: 'PK完全相同的某一条数据，或者某部分数据。',
                enabled: true, // 默认启用
                isAutomatic: true,
            },
            {
                id: 'type-conversion',
                taskId: '3',
                title: '类型转换',
                description: '将string类型转化为模型中约束的类型的过程。',
                enabled: true, // 默认启用
                isAutomatic: true,
            },
            {
                id: 'standard-mapping',
                taskId: '4',
                title: '标准字典对照',
                description: '将多源数据字典统一为标准字典的过程。',
                enabled: true, // 默认启用
                isAutomatic: false, // 对应WorkflowConfig中的autoFlow: false
            },
            {
                id: 'empi-assignment',
                taskId: '5',
                title: 'EMPI发放',
                description: '为同一患者发放唯一主索引的过程。',
                enabled: true, // 默认启用
                isAutomatic: true,
            },
            {
                id: 'emoi-assignment',
                taskId: '6',
                title: 'EMOI发放',
                description: '为检查检验发放就诊唯一主索引的过程。',
                enabled: true, // 默认启用
                isAutomatic: true,
            },
            {
                id: 'data-normalization',
                taskId: '7',
                title: '数据归一',
                description:
                    '数据格式标准化的一种，基于国家规定，将所需数据进行标准归一，定义所有数据标准格式和标准值。',
                enabled: true, // 默认启用
                isAutomatic: true,
            },
            {
                id: 'orphan-removal',
                taskId: '8',
                title: '丢孤儿',
                description:
                    '数据中无法与主表有任何关联的数据，可能是系统上线前测试或违规操作产生，无使用价值。',
                enabled: true, // 现在默认启用，实际应该从WorkflowConfig读取
                isAutomatic: false,
            },
            {
                id: 'data-desensitization',
                taskId: '9',
                title: '数据脱敏',
                description: '出于数据安全考虑，对数据中的关键字段进行脱敏处理。',
                enabled: true, // 默认启用
                isAutomatic: false, // 对应WorkflowConfig中的autoFlow: false
            },
        ]

        // 只包含启用的步骤
        const enabledSteps = allStepConfigs.filter(step => step.enabled)

        // 生成模拟的执行结果，与实际步骤对应
        const mockResults = [
            '清理了 1,234 条无效记录，修复了 567 个格式错误，清除特殊字符 89 个',
            '检测到 892 条重复记录，已成功去重，数据完整性提升 15.2%',
            '转换了 15,678 个字段，成功率 99.8%，类型匹配度达到预期标准',
            '匹配了 2,345 个字典项，标准化率 96.7%，需人工确认 23 项异常映射',
            '为 8,901 名患者分配了唯一标识，EMPI覆盖率 99.1%',
            '处理了 12,345 次就诊记录，EMOI分配成功率 98.9%',
            '归一化处理了 45,678 条记录，数据标准化完成度 97.8%',
            '检测到 456 条孤儿数据，已清理无关联记录，数据关联性提升 8.3%',
            '脱敏处理了 3,456 个敏感字段，安全等级提升至A级标准',
        ]

        // 生成随机的执行时间
        const baseTime = new Date()
        baseTime.setHours(baseTime.getHours() - 2) // 2小时前开始

        const steps: WorkflowStep[] = enabledSteps.map((config, index) => {
            const stepStartTime = new Date(baseTime.getTime() + index * 12 * 60 * 1000) // 每步间隔12分钟
            const stepEndTime = new Date(
                stepStartTime.getTime() + (8 + Math.random() * 15) * 60 * 1000
            ) // 执行8-23分钟
            const totalRecords = Math.floor(15000 + Math.random() * 35000) // 15k-50k记录
            const processedRecords = Math.floor(totalRecords * (0.96 + Math.random() * 0.04)) // 96%-100%处理率

            // 根据taskId获取对应的结果描述
            const resultIndex = parseInt(config.taskId) - 1
            const result =
                mockResults[resultIndex] ||
                `${config.title}执行完成，处理了 ${processedRecords.toLocaleString()} 条记录`

            return {
                ...config,
                status: 'completed' as const,
                progress: 100,
                processedRecords: {
                    processed: processedRecords,
                    total: totalRecords,
                },
                totalRecords,
                startTime: stepStartTime,
                endTime: stepEndTime,
                duration: stepEndTime.getTime() - stepStartTime.getTime(),
                result,
                logs: [
                    `${stepStartTime.toLocaleTimeString()} - 开始执行${config.title}`,
                    `${stepStartTime.toLocaleTimeString()} - 初始化处理环境，加载配置参数`,
                    `${new Date(stepStartTime.getTime() + 3 * 60 * 1000).toLocaleTimeString()} - 开始处理数据，预计处理 ${totalRecords.toLocaleString()} 条记录`,
                    `${new Date(stepEndTime.getTime() - 2 * 60 * 1000).toLocaleTimeString()} - 数据处理完成，成功处理 ${processedRecords.toLocaleString()} 条记录`,
                    `${stepEndTime.toLocaleTimeString()} - ${config.title}执行完成，耗时 ${Math.round((stepEndTime.getTime() - stepStartTime.getTime()) / 60000)} 分钟`,
                ],
            }
        })

        const execution: WorkflowExecution = {
            id,
            status: 'completed',
            steps,
            currentStepIndex: steps.length - 1,
            startTime: steps[0]?.startTime,
            endTime: steps[steps.length - 1]?.endTime,
        }

        // 将模拟数据存储到内存中
        this.executions.set(id, execution)
        return execution
    }

    /**
     * 注册步骤进度回调
     */
    onStepProgress(executionId: string, callback: StepProgressCallback): void {
        if (!this.stepProgressCallbacks.has(executionId)) {
            this.stepProgressCallbacks.set(executionId, [])
        }
        this.stepProgressCallbacks.get(executionId)!.push(callback)
    }

    /**
     * 注册步骤状态变更回调
     */
    onStepStatus(executionId: string, callback: StepStatusCallback): void {
        if (!this.stepStatusCallbacks.has(executionId)) {
            this.stepStatusCallbacks.set(executionId, [])
        }
        this.stepStatusCallbacks.get(executionId)!.push(callback)
    }

    /**
     * 注册工作流状态变更回调
     */
    onWorkflowStatus(executionId: string, callback: WorkflowStatusCallback): void {
        if (!this.workflowStatusCallbacks.has(executionId)) {
            this.workflowStatusCallbacks.set(executionId, [])
        }
        this.workflowStatusCallbacks.get(executionId)!.push(callback)
    }

    /**
     * 通知步骤进度更新
     */
    private notifyStepProgress(
        executionId: string,
        stepId: string,
        progress: number,
        processedRecords: { processed: number; total: number }
    ): void {
        const callbacks = this.stepProgressCallbacks.get(executionId)
        if (callbacks) {
            // 使用 setTimeout 确保回调异步执行，避免阻塞主线程
            setTimeout(() => {
                callbacks.forEach(callback => {
                    try {
                        callback(
                            stepId,
                            progress,
                            processedRecords.processed,
                            processedRecords.total
                        )
                    } catch (error) {
                        console.error('步骤进度回调执行失败:', error)
                    }
                })
            }, 0)
        }
    }

    /**
     * 通知步骤状态变更
     */
    private notifyStepStatus(
        executionId: string,
        stepId: string,
        status: WorkflowStep['status'],
        step: WorkflowStep
    ): void {
        const callbacks = this.stepStatusCallbacks.get(executionId)
        if (callbacks) {
            // 使用 setTimeout 确保回调异步执行，避免阻塞主线程
            setTimeout(() => {
                callbacks.forEach(callback => {
                    try {
                        callback(stepId, status, step)
                    } catch (error) {
                        console.error('步骤状态回调执行失败:', error)
                    }
                })
            }, 0)
        }
    }

    /**
     * 通知工作流状态变更
     */
    private notifyWorkflowStatus(executionId: string, execution: WorkflowExecution): void {
        const callbacks = this.workflowStatusCallbacks.get(executionId)
        if (callbacks) {
            // 使用 setTimeout 确保回调异步执行，避免阻塞主线程
            setTimeout(() => {
                callbacks.forEach(callback => {
                    try {
                        callback(execution)
                    } catch (error) {
                        console.error('工作流状态回调执行失败:', error)
                    }
                })
            }, 0)
        }
    }

    /**
     * 获取工作流执行实例
     * 如果找不到执行记录，检查是否为已知的模拟历史记录ID
     */
    getExecution(id: string): WorkflowExecution | undefined {
        let execution = this.executions.get(id)

        // 如果找不到执行记录，检查是否为已知的模拟历史记录ID
        if (!execution) {
            // 检查是否为ExecutionHistory中的模拟数据ID
            const knownMockIds = ['1', '2', '3', '4']
            if (knownMockIds.includes(id)) {
                console.log(`生成模拟历史数据 ${id}`)
                execution = this.generateMockExecutionForHistoryRecord(id)
                // 不存储到executions Map中，避免影响getAllExecutions的结果
                return execution
            } else {
                console.log(`执行记录 ${id} 不存在，生成默认模拟数据`)
                execution = this.generateMockExecution(id)
            }
        }

        return execution
    }

    /**
     * 获取所有执行记录
     * 返回按时间倒序排列的执行记录列表
     */
    getAllExecutions(): WorkflowExecution[] {
        const executions = Array.from(this.executions.values())

        // 按开始时间倒序排列（最新的在前）
        return executions.sort((a, b) => {
            const timeA = a.startTime?.getTime() || 0
            const timeB = b.startTime?.getTime() || 0
            return timeB - timeA
        })
    }

    /**
     * 转换WorkflowExecution为ExecutionHistory页面需要的格式
     */
    convertToExecutionRecord(execution: WorkflowExecution) {
        const totalSteps = execution.steps.length
        const completedSteps = execution.steps.filter(step => step.status === 'completed').length
        const totalRecords = execution.steps.reduce((sum, step) => sum + step.totalRecords, 0)
        const processedRecords = execution.steps.reduce(
            (sum, step) => sum + step.processedRecords.processed,
            0
        )

        // 计算整体进度
        let progress = 0
        if (execution.status === 'completed') {
            progress = 100
        } else if (execution.status === 'running') {
            progress = Math.round((completedSteps / totalSteps) * 100)
        }

        // 格式化时间
        const formatTime = (date?: Date) => {
            if (!date) return null
            return date.toLocaleString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })
        }

        // 计算执行时长
        let duration = undefined
        if (execution.startTime) {
            const endTime = execution.endTime || new Date()
            const durationMs = endTime.getTime() - execution.startTime.getTime()
            const minutes = Math.floor(durationMs / 60000)
            const seconds = Math.floor((durationMs % 60000) / 1000)
            duration = `${minutes}分${seconds}秒`
        }

        // 获取错误信息
        const failedStep = execution.steps.find(step => step.status === 'failed')
        const errorMessage = failedStep?.errorMessage

        return {
            id: execution.id,
            name: '数据治理工作流', // 可以根据步骤配置生成更具体的名称
            status: execution.status === 'idle' ? 'pending' : execution.status,
            progress,
            startTime: formatTime(execution.startTime),
            endTime: formatTime(execution.endTime),
            processedRecords,
            totalRecords,
            currentStep: completedSteps + 1,
            totalSteps,
            duration,
            errorMessage,
            config: {
                steps: execution.steps.map(step => step.title),
                enabledSteps: execution.steps.filter(step => step.enabled).map(step => step.title),
            },
        }
    }

    /**
     * 清理执行实例
     */
    removeExecution(executionId: string): void {
        this.executions.delete(executionId)
        this.stepProgressCallbacks.delete(executionId)
        this.stepStatusCallbacks.delete(executionId)
        this.workflowStatusCallbacks.delete(executionId)
    }
}

// 导出服务实例
export const workflowExecutionService = WorkflowExecutionService.getInstance()
export default workflowExecutionService
