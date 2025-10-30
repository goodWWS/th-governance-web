import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { WorkflowNode } from '@/types'
import { dataGovernanceService } from '@/services/dataGovernanceService'

// 数据治理任务状态类型
export type TaskStatus = 'idle' | 'running' | 'completed' | 'error' | 'paused'

// 连接测试错误接口
interface ConnectionTestError {
    connectionId: string
    status: 'error'
    lastTestTime: string
}

// 任务配置接口
export interface TaskConfig {
    [key: string]: string | number | boolean | undefined
}

// 数据治理任务接口
export interface GovernanceTask {
    id: string
    name: string
    description: string
    status: TaskStatus
    progress: number
    processedRecords: number
    totalRecords: number
    startTime?: string
    endTime?: string
    errorMessage?: string
    config?: TaskConfig
}

// 数据库连接接口
export interface DatabaseConnection {
    id: string
    name: string
    type: 'mysql' | 'postgresql' | 'oracle' | 'sqlserver'
    host: string
    port: number
    database: string
    username: string
    status: 'connected' | 'disconnected' | 'error'
    createTime: string
    lastTestTime: string
}

// 统计数据接口
export interface StatisticData {
    totalTables: number
    processedTables: number
    totalRecords: number
    cleanedRecords: number
    duplicateRecords: number
    errorRecords: number
}

// 状态接口
interface DataGovernanceState {
    tasks: GovernanceTask[]
    connections: DatabaseConnection[]
    statistics: StatisticData
    workflowConfig: WorkflowNode[]
    workflowLoading: boolean
    loading: boolean
    error: string | null
}

// 初始状态
const initialState: DataGovernanceState = {
    tasks: [
        {
            id: '1',
            name: '数据清洗',
            description: '清理无效字符，确保数据质量',
            status: 'idle',
            progress: 0,
            processedRecords: 0,
            totalRecords: 1180000,
        },
        {
            id: '2',
            name: '数据去重',
            description: '移除重复数据，防止数据失真',
            status: 'idle',
            progress: 0,
            processedRecords: 0,
            totalRecords: 45000,
        },
        {
            id: '3',
            name: '类型转换',
            description: '将字符串类型转换为数据模型定义的标准类型',
            status: 'idle',
            progress: 0,
            processedRecords: 0,
            totalRecords: 850000,
        },
        {
            id: '4',
            name: '标准字典对照',
            description: '将多源数据字典统一为标准字典',
            status: 'idle',
            progress: 0,
            processedRecords: 0,
            totalRecords: 850000,
        },
        {
            id: '5',
            name: 'EMPI发放',
            description: '为同一患者发放唯一主索引',
            status: 'idle',
            progress: 0,
            processedRecords: 0,
            totalRecords: 125000,
        },
        {
            id: '6',
            name: 'EMOI发放',
            description: '为检查检验发放就诊唯一主索引',
            status: 'idle',
            progress: 0,
            processedRecords: 0,
            totalRecords: 95000,
        },
        {
            id: '7',
            name: '数据归一',
            description: '统一数据格式和标准值',
            status: 'idle',
            progress: 0,
            processedRecords: 0,
            totalRecords: 920000,
        },
        {
            id: '8',
            name: '孤儿数据处理',
            description: '清理无法关联主表的无效数据',
            status: 'idle',
            progress: 0,
            processedRecords: 0,
            totalRecords: 15000,
        },
        {
            id: '9',
            name: '数据脱敏',
            description: '保护敏感数据安全',
            status: 'idle',
            progress: 0,
            processedRecords: 0,
            totalRecords: 680000,
        },
    ],
    connections: [
        {
            id: '1',
            name: 'HIS主数据库',
            type: 'mysql',
            host: '192.168.1.100',
            port: 3306,
            database: 'his_main',
            username: 'his_user',
            status: 'connected',
            createTime: '2024-01-10 09:00:00',
            lastTestTime: '2024-01-15 16:30:00',
        },
        {
            id: '2',
            name: 'LIS检验系统',
            type: 'oracle',
            host: '192.168.1.101',
            port: 1521,
            database: 'lis_db',
            username: 'lis_user',
            status: 'connected',
            createTime: '2024-01-10 10:30:00',
            lastTestTime: '2024-01-15 15:45:00',
        },
        {
            id: '3',
            name: 'PACS影像系统',
            type: 'postgresql',
            host: '192.168.1.102',
            port: 5432,
            database: 'pacs_db',
            username: 'pacs_user',
            status: 'error',
            createTime: '2024-01-10 11:15:00',
            lastTestTime: '2024-01-15 14:20:00',
        },
    ],
    statistics: {
        totalTables: 40,
        processedTables: 32,
        totalRecords: 1250000,
        cleanedRecords: 1180000,
        duplicateRecords: 45000,
        errorRecords: 25000,
    },
    workflowConfig: [],
    workflowLoading: false,
    loading: false,
    error: null,
}

// 异步操作：获取工作流配置
export const fetchWorkflowConfig = createAsyncThunk(
    'dataGovernance/fetchWorkflowConfig',
    async (_, { rejectWithValue }) => {
        try {
            const response = await dataGovernanceService.getWorkflowConfig()
            return response.data
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '获取工作流配置失败'
            return rejectWithValue(errorMessage)
        }
    }
)

// 异步操作：更新工作流配置
export const updateWorkflowConfig = createAsyncThunk(
    'dataGovernance/updateWorkflowConfig',
    async (
        updates: Array<{ id: number; enabled?: boolean; is_auto?: boolean }>,
        { rejectWithValue, dispatch }
    ) => {
        try {
            await dataGovernanceService.updateWorkflowConfig(updates)
            // 更新成功后重新获取数据
            dispatch(fetchWorkflowConfig())
            return updates
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : '更新工作流配置失败'
            return rejectWithValue(errorMessage)
        }
    }
)

// 异步操作：启动任务
export const startTask = createAsyncThunk(
    'dataGovernance/startTask',
    async (taskId: string, { rejectWithValue }) => {
        try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000))

            return {
                taskId,
                startTime: new Date().toLocaleString('zh-CN'),
            }
        } catch {
            return rejectWithValue('启动任务失败')
        }
    }
)

// 异步操作：暂停任务
export const pauseTask = createAsyncThunk(
    'dataGovernance/pauseTask',
    async (taskId: string, { rejectWithValue }) => {
        try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 500))
            return taskId
        } catch {
            return rejectWithValue('暂停任务失败')
        }
    }
)

// 异步操作：测试数据库连接
export const testConnection = createAsyncThunk(
    'dataGovernance/testConnection',
    async (connectionId: string, { rejectWithValue }) => {
        try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 2000))
            const success = Math.random() > 0.3 // 70% 成功率

            if (!success) {
                throw new Error('连接测试失败')
            }

            return {
                connectionId,
                status: 'connected' as const,
                lastTestTime: new Date().toLocaleString('zh-CN'),
            }
        } catch {
            return rejectWithValue({
                connectionId,
                status: 'error' as const,
                lastTestTime: new Date().toLocaleString('zh-CN'),
            })
        }
    }
)

// 创建 slice
const dataGovernanceSlice = createSlice({
    name: 'dataGovernance',
    initialState,
    reducers: {
        // 更新工作流配置（本地状态）
        updateWorkflowConfigLocal: (
            state,
            action: PayloadAction<{ id: number; enabled?: boolean; isAuto?: boolean }>
        ) => {
            const { id, enabled, isAuto } = action.payload
            const node = state.workflowConfig.find(n => n.id === id)
            if (node) {
                if (enabled !== undefined) {
                    node.enabled = enabled
                    // 如果禁用步骤，同时禁用自动流转
                    if (!enabled) {
                        node.isAuto = false
                    }
                }
                if (isAuto !== undefined) {
                    node.isAuto = isAuto
                }
            }
        },

        // 设置工作流配置
        setWorkflowConfig: (state, action: PayloadAction<WorkflowNode[]>) => {
            state.workflowConfig = action.payload
        },

        // 更新任务配置
        updateTaskConfig: (
            state,
            action: PayloadAction<{ taskId: string; config: TaskConfig }>
        ) => {
            const { taskId, config } = action.payload
            const task = state.tasks.find(t => t.id === taskId)
            if (task) {
                task.config = config
            }
        },

        // 更新任务进度
        updateTaskProgress: (
            state,
            action: PayloadAction<{ taskId: string; progress: number; processedRecords: number }>
        ) => {
            const { taskId, progress, processedRecords } = action.payload
            const task = state.tasks.find(t => t.id === taskId)
            if (task) {
                task.progress = progress
                task.processedRecords = processedRecords

                // 如果进度达到100%，标记为完成
                if (progress >= 100) {
                    task.status = 'completed'
                    task.endTime = new Date().toLocaleString('zh-CN')
                }
            }
        },

        // 添加数据库连接
        addConnection: (
            state,
            action: PayloadAction<
                Omit<DatabaseConnection, 'id' | 'createTime' | 'lastTestTime' | 'status'>
            >
        ) => {
            const newConnection: DatabaseConnection = {
                ...action.payload,
                id: Date.now().toString(),
                status: 'disconnected',
                createTime: new Date().toLocaleString('zh-CN'),
                lastTestTime: '-',
            }
            state.connections.push(newConnection)
        },

        // 更新数据库连接
        updateConnection: (state, action: PayloadAction<DatabaseConnection>) => {
            const index = state.connections.findIndex(conn => conn.id === action.payload.id)
            if (index !== -1) {
                state.connections[index] = action.payload
            }
        },

        // 删除数据库连接
        removeConnection: (state, action: PayloadAction<string>) => {
            state.connections = state.connections.filter(conn => conn.id !== action.payload)
        },

        // 更新统计数据
        updateStatistics: (state, action: PayloadAction<Partial<StatisticData>>) => {
            state.statistics = { ...state.statistics, ...action.payload }
        },

        // 清除错误
        clearError: state => {
            state.error = null
        },

        // 完成任务
        completeTask: (state, action: PayloadAction<{ taskId: string; endTime: string }>) => {
            const { taskId, endTime } = action.payload
            const task = state.tasks.find(t => t.id === taskId)
            if (task) {
                task.status = 'completed'
                task.endTime = endTime
                task.progress = 100
            }
        },
    },
    extraReducers: builder => {
        builder
            // 获取工作流配置
            .addCase(fetchWorkflowConfig.pending, state => {
                state.workflowLoading = true
                state.error = null
            })
            .addCase(fetchWorkflowConfig.fulfilled, (state, action) => {
                state.workflowLoading = false
                state.workflowConfig = action.payload
            })
            .addCase(fetchWorkflowConfig.rejected, (state, action) => {
                state.workflowLoading = false
                state.error = action.payload as string
            })

            // 更新工作流配置
            .addCase(updateWorkflowConfig.pending, state => {
                state.workflowLoading = true
                state.error = null
            })
            .addCase(updateWorkflowConfig.fulfilled, state => {
                state.workflowLoading = false
            })
            .addCase(updateWorkflowConfig.rejected, (state, action) => {
                state.workflowLoading = false
                state.error = action.payload as string
            })

            // 启动任务
            .addCase(startTask.pending, state => {
                state.loading = true
                state.error = null
            })
            .addCase(startTask.fulfilled, (state, action) => {
                state.loading = false
                const { taskId, startTime } = action.payload
                const task = state.tasks.find(t => t.id === taskId)
                if (task) {
                    task.status = 'running'
                    task.startTime = startTime
                    task.errorMessage = undefined
                }
            })
            .addCase(startTask.rejected, (state, action) => {
                state.loading = false
                state.error = action.payload as string
            })

            // 暂停任务
            .addCase(pauseTask.fulfilled, (state, action) => {
                const task = state.tasks.find(t => t.id === action.payload)
                if (task) {
                    task.status = 'paused'
                }
            })

            // 测试连接
            .addCase(testConnection.pending, state => {
                state.loading = true
            })
            .addCase(testConnection.fulfilled, (state, action) => {
                state.loading = false
                const { connectionId, status, lastTestTime } = action.payload
                const connection = state.connections.find(conn => conn.id === connectionId)
                if (connection) {
                    connection.status = status
                    connection.lastTestTime = lastTestTime
                }
            })
            .addCase(testConnection.rejected, (state, action) => {
                state.loading = false
                const payload = action.payload as ConnectionTestError
                const connection = state.connections.find(conn => conn.id === payload.connectionId)
                if (connection) {
                    connection.status = payload.status
                    connection.lastTestTime = payload.lastTestTime
                }
            })
    },
})

// 导出 actions
export const {
    updateWorkflowConfigLocal,
    setWorkflowConfig,
    updateTaskConfig,
    updateTaskProgress,
    addConnection,
    updateConnection,
    removeConnection,
    updateStatistics,
    clearError,
    completeTask,
} = dataGovernanceSlice.actions

// 导出 reducer
export default dataGovernanceSlice.reducer
