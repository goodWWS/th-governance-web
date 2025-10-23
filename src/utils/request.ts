import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
    type AxiosError,
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
    success: boolean
    timestamp?: number
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
    (response: AxiosResponse) => {
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

        // 统一处理响应数据格式
        if (data && typeof data === 'object') {
            // 如果后端返回的是标准格式
            if ('code' in data && 'message' in data) {
                // 业务逻辑错误
                if (data.code !== 0 && data.code !== 200) {
                    const error = new Error(data.message || '请求失败') as Error & {
                        code: number
                        response: AxiosResponse
                    }
                    error.code = data.code
                    error.response = response
                    return Promise.reject(error)
                }
                return data
            }
        }

        // 直接返回数据
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
export const api = {
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
        return request
            .get(url, {
                ...config,
                responseType: 'blob',
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

// 默认导出 api 对象
export default api
