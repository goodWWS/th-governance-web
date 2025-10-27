// 全局类型定义

export interface ApiResponse<T = unknown> {
    success: boolean
    data: T
    message?: string
    code?: number
}

export interface PaginationParams {
    page: number
    pageSize: number
    total?: number
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: PaginationParams
}

export interface User {
    id: string
    name: string
    email: string
    avatar?: string
    role: 'admin' | 'user' | 'guest'
    createdAt: string
    updatedAt: string
}

// Redux 相关类型定义
export interface CounterState {
    value: number
    step: number
    history: number[]
}

export interface UserState {
    currentUser: User | null
    users: User[]
    loading: boolean
    error: string | null
}

// Redux Store 类型 (从 store 导入)
export type { AppDispatch, RootState } from '../store'

export interface RouteConfig {
    path: string
    component: React.ComponentType
    exact?: boolean
    meta?: {
        title?: string
        requireAuth?: boolean
        roles?: string[]
    }
}

// 环境变量类型
export interface ImportMetaEnv {
    readonly VITE_APP_TITLE: string
    readonly VITE_APP_API_BASE_URL: string
    readonly VITE_APP_ENV: 'development' | 'production' | 'test'
}

// 通用工具类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// 事件处理类型
export type EventHandler<T = Event> = (event: T) => void
export type ChangeHandler = EventHandler<React.ChangeEvent<HTMLInputElement>>
export type ClickHandler = EventHandler<React.MouseEvent<HTMLElement>>
export type SubmitHandler = EventHandler<React.FormEvent<HTMLFormElement>>

// 表单相关类型
export interface FormField {
    name: string
    label: string
    type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select'
    required?: boolean
    placeholder?: string
    options?: Array<{ label: string; value: string | number }>
}

export interface FormErrors {
    [key: string]: string | undefined
}

// HTTP 请求相关类型
export interface HttpResponse<T = unknown> {
    code: number
    message: string
    data: T
    success: boolean
    timestamp?: number
}

export interface HttpError {
    code: number
    message: string
    details?: unknown
    stack?: string
}

export interface RequestOptions {
    timeout?: number
    retries?: number
    skipErrorHandler?: boolean
    showLoading?: boolean
    headers?: Record<string, string>
}

// API 状态类型
export type ApiStatus = 'idle' | 'loading' | 'success' | 'error'

export interface ApiState<T = unknown> {
    data: T | null
    loading: boolean
    error: string | null
    status: ApiStatus
}

// 分页请求类型
export interface PaginationRequest {
    page: number
    pageSize: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    filters?: Record<string, unknown>
}

// 文件上传类型
export interface UploadFile {
    uid: string
    name: string
    status: 'uploading' | 'done' | 'error'
    url?: string
    percent?: number
    response?: unknown
    error?: unknown
}

export interface UploadOptions {
    accept?: string
    multiple?: boolean
    maxSize?: number
    maxCount?: number
    beforeUpload?: (file: File) => boolean | Promise<boolean>
    onProgress?: (percent: number, file: File) => void
    onSuccess?: (response: unknown, file: File) => void
    onError?: (error: unknown, file: File) => void
}

// ==================== 数据治理相关类型定义 ====================

// 数据治理操作结果类型
export interface DataGovernanceResult {
    /** 操作影响的记录数 */
    count: number
}

// 数据治理日志类型
export interface DataGovernanceLog {
    /** 日志ID */
    id: string
    /** 操作类型 */
    operationType: string
    /** 操作描述 */
    description: string
    /** 操作状态 */
    status: 'success' | 'failed' | 'running'
    /** 开始时间 */
    startTime: string
    /** 结束时间 */
    endTime?: string
    /** 操作结果 */
    result?: DataGovernanceResult
    /** 错误信息 */
    errorMessage?: string
    /** 操作人员 */
    operator?: string
    /** 创建时间 */
    createTime: string
    /** 更新时间 */
    updateTime: string
}

// 日志分页查询参数
export interface LogPageParams extends PaginationParams {
    /** 操作类型筛选 */
    operationType?: string
    /** 状态筛选 */
    status?: 'success' | 'failed' | 'running'
    /** 开始时间 */
    startTime?: string
    /** 结束时间 */
    endTime?: string
    /** 操作人员 */
    operator?: string
}

// 日志分页响应
export type LogPageResponse = PaginatedResponse<DataGovernanceLog>

// 数据治理操作枚举
export const DataGovernanceOperation = {
    /** 清空数据、初始化 */
    INIT: 'init',
    /** 数据清洗、空格替换 */
    CLEAN_DATA_FIELDS: 'cleanDataFields',
    /** 数据去重 */
    DEDUPLICATE_DATA: 'deduplicateData',
    /** 标准对照 */
    APPLY_STANDARD_MAPPING: 'applyStandardMapping',
    /** EMPI 定义发放 */
    ASSIGN_EMPI: 'assignEmpi',
    /** EMOI 定义发放 */
    ASSIGN_EMOI: 'assignEmoi',
    /** 数据归一 */
    NORMALIZE_DATA: 'normalizeData',
    /** 丢孤 */
    REMOVE_ORPHAN_RECORDS: 'removeOrphanRecords',
    /** 数据脱敏 */
    MASK_SENSITIVE_DATA: 'maskSensitiveData',
    /** 同步数据 */
    SYNC: 'sync',
} as const

export type DataGovernanceOperation =
    (typeof DataGovernanceOperation)[keyof typeof DataGovernanceOperation]

// 数据库连接相关类型定义
export interface DbConnection {
    id: string
    connectionName: string
    dbType: string
    dbHost: string
    dbPort: string
    dbName: string
    dbUsername: string
    dbPassword: string
    dbStatus: number
    remark: string
    createUser: string
    createTime: string
}

export interface DbConnectionPageParams {
    pageNo: number
    pageSize: number
    dbType?: string
    dbStatus?: number
}

export interface DbConnectionPageData {
    pageNo: number
    pageSize: number
    total: number
    list: DbConnection[]
    statusStats: {
        abnormalCount: number
        connectedCount: number
        totalConnections: number
    }
}

export interface DbConnectionPageResponse {
    code: number
    msg: string
    data: DbConnectionPageData
}
