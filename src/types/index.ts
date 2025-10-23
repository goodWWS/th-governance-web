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
export type { RootState, AppDispatch } from '../store'

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
