import { api } from '@/utils/request'
import type { HttpResponse, PaginationRequest } from '@/types'

// 用户相关接口
export interface User {
    id: number
    username: string
    email: string
    avatar?: string
    role: string
    createdAt: string
    updatedAt: string
}

export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse {
    token: string
    refreshToken: string
    user: User
    expiresIn: number
}

export interface RegisterRequest {
    username: string
    email: string
    password: string
    confirmPassword: string
}

// 用户 API
export const userApi = {
    // 登录
    login: (data: LoginRequest): Promise<HttpResponse<LoginResponse>> =>
        api.post('/auth/login', data),

    // 注册
    register: (data: RegisterRequest): Promise<HttpResponse<User>> =>
        api.post('/auth/register', data),

    // 登出
    logout: (): Promise<HttpResponse<null>> => api.post('/auth/logout'),

    // 刷新 token
    refreshToken: (
        refreshToken: string
    ): Promise<HttpResponse<{ token: string; expiresIn: number }>> =>
        api.post('/auth/refresh', { refreshToken }),

    // 获取用户信息
    getUserInfo: (): Promise<HttpResponse<User>> => api.get('/user/profile'),

    // 更新用户信息
    updateUserInfo: (data: Partial<User>): Promise<HttpResponse<User>> =>
        api.put('/user/profile', data),

    // 修改密码
    changePassword: (data: {
        oldPassword: string
        newPassword: string
    }): Promise<HttpResponse<null>> => api.put('/user/password', data),

    // 上传头像
    uploadAvatar: (file: File): Promise<HttpResponse<{ avatar: string }>> =>
        api.upload('/user/avatar', file),

    // 获取用户列表（管理员）
    getUserList: (params: PaginationRequest & { keyword?: string; role?: string }) =>
        api.get('/admin/users', { params }),
}

// 文章相关接口
export interface Article {
    id: number
    title: string
    content: string
    summary: string
    cover?: string
    author: User
    category: Category
    tags: Tag[]
    status: 'draft' | 'published' | 'archived'
    viewCount: number
    likeCount: number
    commentCount: number
    createdAt: string
    updatedAt: string
}

export interface Category {
    id: number
    name: string
    description?: string
    articleCount: number
}

export interface Tag {
    id: number
    name: string
    color?: string
    articleCount: number
}

export interface CreateArticleRequest {
    title: string
    content: string
    summary?: string
    cover?: string
    categoryId: number
    tagIds: number[]
    status: 'draft' | 'published'
}

// 文章 API
export const articleApi = {
    // 获取文章列表
    getArticleList: (
        params: PaginationRequest & {
            keyword?: string
            categoryId?: number
            tagId?: number
            status?: string
            authorId?: number
        }
    ) => api.get('/articles', { params }),

    // 获取文章详情
    getArticleDetail: (id: number): Promise<HttpResponse<Article>> => api.get(`/articles/${id}`),

    // 创建文章
    createArticle: (data: CreateArticleRequest): Promise<HttpResponse<Article>> =>
        api.post('/articles', data),

    // 更新文章
    updateArticle: (
        id: number,
        data: Partial<CreateArticleRequest>
    ): Promise<HttpResponse<Article>> => api.put(`/articles/${id}`, data),

    // 删除文章
    deleteArticle: (id: number): Promise<HttpResponse<null>> => api.delete(`/articles/${id}`),

    // 点赞文章
    likeArticle: (id: number): Promise<HttpResponse<{ liked: boolean; likeCount: number }>> =>
        api.post(`/articles/${id}/like`),

    // 获取分类列表
    getCategoryList: (): Promise<HttpResponse<Category[]>> => api.get('/categories'),

    // 获取标签列表
    getTagList: (params?: { keyword?: string }): Promise<HttpResponse<Tag[]>> =>
        api.get('/tags', { params }),

    // 上传文章封面
    uploadCover: (file: File): Promise<HttpResponse<{ url: string }>> =>
        api.upload('/upload/cover', file),
}

// 评论相关接口
export interface Comment {
    id: number
    content: string
    author: User
    article: Pick<Article, 'id' | 'title'>
    parentId?: number
    children?: Comment[]
    likeCount: number
    createdAt: string
    updatedAt: string
}

export interface CreateCommentRequest {
    content: string
    articleId: number
    parentId?: number
}

// 评论 API
export const commentApi = {
    // 获取评论列表
    getCommentList: (
        params: PaginationRequest & {
            articleId?: number
            parentId?: number
        }
    ) => api.get('/comments', { params }),

    // 创建评论
    createComment: (data: CreateCommentRequest): Promise<HttpResponse<Comment>> =>
        api.post('/comments', data),

    // 删除评论
    deleteComment: (id: number): Promise<HttpResponse<null>> => api.delete(`/comments/${id}`),

    // 点赞评论
    likeComment: (id: number): Promise<HttpResponse<{ liked: boolean; likeCount: number }>> =>
        api.post(`/comments/${id}/like`),
}

// 文件上传 API
export const uploadApi = {
    // 上传单个文件
    uploadFile: (
        file: File
    ): Promise<
        HttpResponse<{
            url: string
            filename: string
            size: number
            type: string
        }>
    > => api.upload('/upload/file', file),

    // 批量上传文件
    uploadFiles: (
        files: File[]
    ): Promise<
        HttpResponse<
            Array<{
                url: string
                filename: string
                size: number
                type: string
            }>
        >
    > => {
        const formData = new FormData()
        files.forEach((file, index) => {
            formData.append(`files[${index}]`, file)
        })
        return api.upload('/upload/files', formData)
    },

    // 删除文件
    deleteFile: (url: string): Promise<HttpResponse<null>> =>
        api.delete('/upload/file', { data: { url } }),
}

// 系统配置 API
export interface SystemConfig {
    siteName: string
    siteDescription: string
    siteLogo: string
    siteKeywords: string[]
    allowRegister: boolean
    requireEmailVerification: boolean
    maxFileSize: number
    allowedFileTypes: string[]
}

// 系统相关 API
export const systemApi = {
    // 获取系统配置
    getSystemConfig: (): Promise<HttpResponse<SystemConfig>> => api.get('/system/config'),

    // 更新系统配置（管理员）
    updateSystemConfig: (data: Partial<SystemConfig>): Promise<HttpResponse<SystemConfig>> =>
        api.put('/system/config', data),

    // 获取系统统计
    getSystemStats: (): Promise<
        HttpResponse<{
            userCount: number
            articleCount: number
            commentCount: number
            viewCount: number
        }>
    > => api.get('/system/stats'),
}

// 导出所有 API
export const apiCollection = {
    user: userApi,
    article: articleApi,
    comment: commentApi,
    upload: uploadApi,
    system: systemApi,
}

export default apiCollection
