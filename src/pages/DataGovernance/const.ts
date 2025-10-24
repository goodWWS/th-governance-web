// 数据治理相关常量定义

// 执行状态
export const EXECUTION_STATUS = {
    PENDING: 'pending',
    RUNNING: 'running',
    COMPLETED: 'completed',
    FAILED: 'failed',
} as const

// 执行状态标签映射
export const STATUS_LABELS = {
    [EXECUTION_STATUS.PENDING]: '等待中',
    [EXECUTION_STATUS.RUNNING]: '执行中',
    [EXECUTION_STATUS.COMPLETED]: '已完成',
    [EXECUTION_STATUS.FAILED]: '执行失败',
} as const

// 执行状态颜色映射
export const STATUS_COLORS = {
    [EXECUTION_STATUS.PENDING]: 'default',
    [EXECUTION_STATUS.RUNNING]: 'processing',
    [EXECUTION_STATUS.COMPLETED]: 'success',
    [EXECUTION_STATUS.FAILED]: 'error',
} as const

// 步骤类型
export const STEP_TYPES = {
    DATA_COLLECTION: 'data_collection',
    DATA_VALIDATION: 'data_validation',
    DATA_TRANSFORMATION: 'data_transformation',
    DATA_LOADING: 'data_loading',
    QUALITY_CHECK: 'quality_check',
} as const

// 步骤名称映射
export const STEP_NAMES = {
    [STEP_TYPES.DATA_COLLECTION]: '数据收集',
    [STEP_TYPES.DATA_VALIDATION]: '数据验证',
    [STEP_TYPES.DATA_TRANSFORMATION]: '数据转换',
    [STEP_TYPES.DATA_LOADING]: '数据加载',
    [STEP_TYPES.QUALITY_CHECK]: '质量检查',
} as const

export type ExecutionStatus = (typeof EXECUTION_STATUS)[keyof typeof EXECUTION_STATUS]
export type StepType = (typeof STEP_TYPES)[keyof typeof STEP_TYPES]
