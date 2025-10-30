import axios, {
    type AxiosError,
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type InternalAxiosRequestConfig,
} from 'axios'
import { getEnv } from './env'
import { logger } from './logger'

// 扩展 InternalAxiosRequestConfig 接口
declare module 'axios' {
    interface InternalAxiosRequestConfig {
        metadata?: {
            startTime: number
        }
    }
}

// 请求配置接口
export interface RequestConfig extends AxiosRequestConfig {
    skipErrorHandler?: boolean // 是否跳过全局错误处理
    showLoading?: boolean // 是否显示加载状态
    timeout?: number // 请求超时时间
}

// API 响应数据结构
export interface ApiResponse<T = unknown> {
    code: number
    message: string
    data: T
}

// 错误响应结构
export interface ApiError {
    code: number
    message: string
    details?: unknown
}

// 请求状态枚举
export const RequestStatus = {
    PENDING: 'pending',
    SUCCESS: 'success',
    ERROR: 'error',
} as const

export type RequestStatusType = (typeof RequestStatus)[keyof typeof RequestStatus]

// 创建 axios 实例
const createAxiosInstance = (): AxiosInstance => {
    const instance = axios.create({
        baseURL: getEnv('VITE_APP_API_BASE_URL', '/api'),
        timeout: parseInt(getEnv('VITE_APP_API_TIMEOUT', '10000')),
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        // 允许携带 cookies
        withCredentials: true,
    })

    return instance
}

// 创建请求实例
const request: AxiosInstance = createAxiosInstance()

// 请求拦截器
request.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const startTime = Date.now()
        config.metadata = { startTime }

        // 添加认证 token
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // 添加请求 ID 用于追踪
        config.headers['X-Request-ID'] = generateRequestId()

        // 开发环境下记录请求日志
        logger.debug('API Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            params: config.params,
            data: config.data,
            headers: config.headers,
        })

        return config
    },
    (error: AxiosError) => {
        logger.error('Request Error:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response: AxiosResponse): AxiosResponse => {
        const { config, data } = response
        const endTime = Date.now()
        const duration =
            endTime -
            ((config as InternalAxiosRequestConfig & { metadata?: { startTime: number } }).metadata
                ?.startTime || 0)

        // 记录响应日志
        logger.debug('API Response:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            status: response.status,
            duration: `${duration}ms`,
            data: data,
        })

        // 只返回响应数据，不返回完整的response对象
        return data
    },
    (error: AxiosError) => {
        const { config, response } = error
        const endTime = Date.now()
        const duration =
            endTime -
            ((config as InternalAxiosRequestConfig & { metadata?: { startTime: number } })?.metadata
                ?.startTime || 0)

        // 记录错误日志
        logger.error('API Error:', error, {
            method: config?.method?.toUpperCase(),
            url: config?.url,
            status: response?.status,
            duration: `${duration}ms`,
            message: error.message,
            data: response?.data,
        } as Record<string, unknown>)

        // 处理不同类型的错误
        return handleApiError(error)
    }
)

// 错误处理函数
const handleApiError = (error: AxiosError): Promise<never> => {
    const { response, code } = error

    // 网络错误
    if (!response) {
        if (code === 'ECONNABORTED') {
            return Promise.reject(new Error('请求超时，请稍后重试'))
        }
        if (code === 'ERR_NETWORK') {
            return Promise.reject(new Error('网络连接失败，请检查网络'))
        }
        return Promise.reject(new Error('网络错误，请稍后重试'))
    }

    const { status, data } = response

    // HTTP 状态码错误处理
    switch (status) {
        case 400:
            return Promise.reject(
                new Error((data as { message?: string })?.message || '请求参数错误')
            )
        case 401:
            // 未授权，清除 token 并跳转到登录页
            localStorage.removeItem('access_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login'
            return Promise.reject(
                new Error((data as { message?: string })?.message || '未授权访问')
            )
        case 403:
            return Promise.reject(new Error((data as { message?: string })?.message || '权限不足'))
        case 404:
            return Promise.reject(new Error('请求的资源不存在'))
        case 422:
            return Promise.reject(
                new Error((data as { message?: string })?.message || '请求参数验证失败')
            )
        case 429:
            return Promise.reject(new Error('请求过于频繁，请稍后重试'))
        case 500:
            return Promise.reject(new Error('服务器内部错误'))
        case 502:
            return Promise.reject(new Error('网关错误'))
        case 503:
            return Promise.reject(new Error('服务暂时不可用'))
        case 504:
            return Promise.reject(new Error('网关超时'))
        default:
            return Promise.reject(
                new Error((data as { message?: string })?.message || `请求失败 (${status})`)
            )
    }
}

// 生成请求 ID
const generateRequestId = (): string => {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 请求方法封装
export const apiMethods = {
    // GET 请求
    get: <T = unknown>(url: string, config?: RequestConfig): Promise<T> => {
        return request.get(url, config)
    },

    // POST 请求
    post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> => {
        return request.post(url, data, config)
    },

    // PUT 请求
    put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> => {
        return request.put(url, data, config)
    },

    // PATCH 请求
    patch: <T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> => {
        return request.patch(url, data, config)
    },

    // DELETE 请求
    delete: <T = unknown>(url: string, config?: RequestConfig): Promise<T> => {
        return request.delete(url, config)
    },

    // 文件上传
    upload: <T = unknown>(
        url: string,
        file: File | FormData,
        config?: RequestConfig
    ): Promise<T> => {
        const formData = file instanceof FormData ? file : new FormData()
        if (file instanceof File) {
            formData.append('file', file)
        }

        return request.post(url, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config?.headers,
            },
        })
    },

    // 下载文件
    download: (url: string, filename?: string, config?: RequestConfig): Promise<void> => {
        // 对于下载文件，我们需要直接使用axios实例而不是经过拦截器处理的request
        return axios
            .get(url, {
                ...config,
                responseType: 'blob',
                baseURL: getEnv('VITE_APP_API_BASE_URL', '/api'),
            })
            .then((response: AxiosResponse<Blob>) => {
                const blob = new Blob([response.data])
                const downloadUrl = window.URL.createObjectURL(blob)
                const link = document.createElement('a')
                link.href = downloadUrl
                link.download = filename || 'download'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                window.URL.revokeObjectURL(downloadUrl)
            })
    },
}

// 请求取消功能
export class RequestCanceler {
    private pendingRequests = new Map<string, AbortController>()

    // 添加请求
    addRequest(config: AxiosRequestConfig): void {
        const requestKey = this.getRequestKey(config)
        this.cancelRequest(requestKey)

        const controller = new AbortController()
        config.signal = controller.signal
        this.pendingRequests.set(requestKey, controller)
    }

    // 取消请求
    cancelRequest(requestKey: string): void {
        const controller = this.pendingRequests.get(requestKey)
        if (controller) {
            controller.abort()
            this.pendingRequests.delete(requestKey)
        }
    }

    // 取消所有请求
    cancelAllRequests(): void {
        this.pendingRequests.forEach(controller => {
            controller.abort()
        })
        this.pendingRequests.clear()
    }

    // 移除请求
    removeRequest(config: AxiosRequestConfig): void {
        const requestKey = this.getRequestKey(config)
        this.pendingRequests.delete(requestKey)
    }

    // 生成请求唯一标识
    private getRequestKey(config: AxiosRequestConfig): string {
        return `${config.method}_${config.url}_${JSON.stringify(config.params)}`
    }
}

// 创建全局请求取消器实例
export const requestCanceler = new RequestCanceler()

// 导出 axios 实例（用于特殊情况）
export { request }

// SSE 连接配置接口
export interface SSEConfig {
    url: string
    withCredentials?: boolean
    reconnectInterval?: number
    maxReconnectAttempts?: number
    onOpen?: (event: Event) => void
    onMessage?: (event: MessageEvent) => void
    onError?: (event: Event) => void
    onClose?: () => void
    onMaxReconnectAttemptsReached?: () => void // 新增：达到最大重连次数时的回调
}

// SSE 连接状态
export enum SSEStatus {
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
    DISCONNECTED = 'disconnected',
    ERROR = 'error',
    MAX_RECONNECT_REACHED = 'max_reconnect_reached', // 新增：达到最大重连次数
}

// SSE 管理器类
export class SSEManager {
    private eventSource: EventSource | null = null
    private config: SSEConfig
    private status: SSEStatus = SSEStatus.DISCONNECTED
    private reconnectAttempts = 0
    private reconnectTimer: NodeJS.Timeout | null = null
    private isManualDisconnect = false // 新增：标记是否为手动断开连接

    constructor(config: SSEConfig) {
        this.config = {
            withCredentials: true,
            reconnectInterval: 3000,
            maxReconnectAttempts: 5,
            ...config,
        }
    }

    // 连接 SSE
    connect(): void {
        // 如果已达到最大重连次数且不是手动重新连接，则不允许连接
        if (this.status === SSEStatus.MAX_RECONNECT_REACHED && !this.isManualDisconnect) {
            logger.warn('SSE已达到最大重连次数，请手动重置后再连接')
            return
        }

        if (this.eventSource) {
            this.disconnect(false) // 不重置重连计数器
        }

        try {
            this.status = SSEStatus.CONNECTING
            this.isManualDisconnect = false

            // 构建完整的 URL，复用 request 工具的 baseURL 逻辑
            const fullUrl = this.buildUrl(this.config.url)

            // 创建 EventSource 实例
            this.eventSource = new EventSource(fullUrl, {
                withCredentials: this.config.withCredentials,
            })

            // 设置事件监听器
            this.setupEventListeners()

            logger.info('SSE连接已启动:', fullUrl)
        } catch (error) {
            logger.error('SSE连接失败:', error)
            this.handleError(error as Event)
        }
    }

    // 断开连接
    disconnect(resetReconnectAttempts = true): void {
        this.isManualDisconnect = true

        if (this.eventSource) {
            this.eventSource.close()
            this.eventSource = null
        }

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer)
            this.reconnectTimer = null
        }

        // 只有在手动断开时才重置重连计数器
        if (resetReconnectAttempts) {
            this.reconnectAttempts = 0
            this.status = SSEStatus.DISCONNECTED
        }

        if (this.config.onClose) {
            this.config.onClose()
        }

        logger.info('SSE连接已断开')
    }

    // 重置连接状态（用于手动重新开始连接）
    reset(): void {
        this.disconnect(true)
        this.status = SSEStatus.DISCONNECTED
        logger.info('SSE连接状态已重置')
    }

    // 获取连接状态
    getStatus(): SSEStatus {
        return this.status
    }

    // 是否已连接
    isConnected(): boolean {
        return this.status === SSEStatus.CONNECTED
    }

    // 构建完整的 URL，复用 request 工具的逻辑
    private buildUrl(url: string): string {
        // 如果 URL 已经是完整的 URL，直接返回
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return this.addAuthToUrl(url)
        }

        // 使用与 request 工具相同的 baseURL
        const baseURL = getEnv('VITE_APP_API_BASE_URL', '/api')

        // 如果 URL 以 /api 开头，直接使用
        if (url.startsWith('/api')) {
            return this.addAuthToUrl(url)
        }

        // 否则添加 baseURL 前缀
        const fullUrl = `${baseURL}${url.startsWith('/') ? url : `/${url}`}`
        return this.addAuthToUrl(fullUrl)
    }

    // 添加认证头（通过 URL 参数，因为 EventSource 不支持自定义 headers）
    private addAuthToUrl(url: string): string {
        const token = localStorage.getItem('access_token')
        if (!token) {
            return url
        }

        const separator = url.includes('?') ? '&' : '?'
        return `${url}${separator}token=${encodeURIComponent(token)}`
    }

    // 设置事件监听器
    private setupEventListeners(): void {
        if (!this.eventSource) return

        this.eventSource.onopen = (event: Event) => {
            this.status = SSEStatus.CONNECTED
            this.reconnectAttempts = 0

            logger.info('SSE连接已建立')

            if (this.config.onOpen) {
                this.config.onOpen(event)
            }
        }

        this.eventSource.onmessage = (event: MessageEvent) => {
            logger.debug('收到SSE消息:', event.data)

            if (this.config.onMessage) {
                this.config.onMessage(event)
            }
        }

        this.eventSource.onerror = (event: Event) => {
            logger.error('SSE连接错误:', event)
            this.handleError(event)
        }
    }

    // 处理错误和重连
    private handleError(event: Event): void {
        // 如果是手动断开连接，不进行错误处理
        if (this.isManualDisconnect) {
            return
        }

        this.status = SSEStatus.ERROR

        if (this.config.onError) {
            this.config.onError(event)
        }

        // 检查是否还有重连次数
        const maxAttempts = this.config.maxReconnectAttempts || 5

        if (this.reconnectAttempts < maxAttempts) {
            this.reconnectAttempts++

            logger.warn(
                `SSE连接断开，${this.config.reconnectInterval}ms后尝试第${this.reconnectAttempts}次重连 (剩余${maxAttempts - this.reconnectAttempts}次)`
            )

            this.reconnectTimer = setTimeout(() => {
                // 再次检查是否为手动断开，避免在定时器执行期间状态改变
                if (!this.isManualDisconnect) {
                    this.connect()
                }
            }, this.config.reconnectInterval)
        } else {
            // 达到最大重连次数
            this.status = SSEStatus.MAX_RECONNECT_REACHED

            logger.error(`SSE重连次数已达上限(${maxAttempts}次)，停止重连`)

            // 调用达到最大重连次数的回调
            if (this.config.onMaxReconnectAttemptsReached) {
                this.config.onMaxReconnectAttemptsReached()
            }

            // 清理资源但不重置重连计数器
            this.disconnect(false)
        }
    }
}

// 在 apiMethods 对象中添加 SSE 方法
export const api = {
    ...apiMethods,

    // 创建 SSE 连接
    createSSE: (config: SSEConfig): SSEManager => {
        return new SSEManager(config)
    },

    // SSE 便捷方法
    sse: (url: string, options?: Partial<SSEConfig>): SSEManager => {
        return new SSEManager({
            url,
            ...options,
        })
    },
}

// 默认导出 api 对象
export default api
