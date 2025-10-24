import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../index'

// 数据治理任务状态类型
export type TaskStatus = 'idle' | 'running' | 'completed' | 'error' | 'paused'

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
    config?: Record<string, any>
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
    loading: false,
    error: null,
}

// 异步操作：启动任务
export const startTask = createAsyncThunk(
    'dataGovernance/startTask',
    async (taskId: string, { rejectWithValue, dispatch, getState }) => {
        try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // 获取任务的总记录数
            const state = getState() as RootState
            const task = state.dataGovernance.tasks.find(t => t.id === taskId)
            const totalRecords = task?.totalRecords || 0
            
            // 启动进度模拟
            const simulateProgress = () => {
                let progress = 0
                const interval = setInterval(() => {
                    progress += Math.random() * 15 + 5 // 每次增加5-20%
                    if (progress >= 100) {
                        progress = 100
                        clearInterval(interval)
                        // 任务完成
                        dispatch(updateTaskProgress({
                            taskId,
                            progress: 100,
                            processedRecords: totalRecords // 完成时处理记录数等于总记录数
                        }))
                        // 标记任务完成
                        dispatch(completeTask({
                            taskId,
                            endTime: new Date().toLocaleString('zh-CN')
                        }))
                    } else {
                        // 根据进度计算已处理记录数
                        const processedRecords = Math.floor((progress / 100) * totalRecords)
                        dispatch(updateTaskProgress({
                            taskId,
                            progress: Math.floor(progress),
                            processedRecords
                        }))
                    }
                }, 2000) // 每2秒更新一次
            }
            
            // 延迟启动进度模拟
            setTimeout(simulateProgress, 1000)
            
            return {
                taskId,
                startTime: new Date().toLocaleString('zh-CN'),
            }
        } catch (error) {
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
        } catch (error) {
            return rejectWithValue('暂停任务失败')
        }
    }
)

// 异步操作：停止任务
export const stopTask = createAsyncThunk(
    'dataGovernance/stopTask',
    async (taskId: string, { rejectWithValue }) => {
        try {
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 500))
            return taskId
        } catch (error) {
            return rejectWithValue('停止任务失败')
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
        } catch (error) {
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
        // 更新任务配置
        updateTaskConfig: (
            state,
            action: PayloadAction<{ taskId: string; config: Record<string, any> }>
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
        completeTask: (
            state,
            action: PayloadAction<{ taskId: string; endTime: string }>
        ) => {
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

            // 停止任务
            .addCase(stopTask.fulfilled, (state, action) => {
                const task = state.tasks.find(t => t.id === action.payload)
                if (task) {
                    task.status = 'idle'
                    task.progress = 0
                    task.processedRecords = 0
                    task.startTime = undefined
                    task.endTime = undefined
                    task.errorMessage = undefined
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
                const payload = action.payload as any
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
