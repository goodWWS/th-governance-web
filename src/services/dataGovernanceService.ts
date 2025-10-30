/**
 * 数据治理服务
 * 提供数据清洗、去重、标准对照、EMPI/EMOI定义发放等功能的API接口
 */

import type {
    DataGovernanceLog,
    DataGovernanceResult,
    DbConnectionPageParams,
    DbConnectionPageResponse,
    ExecutionLogPageResponse,
    StartWorkflowResponse,
    WorkflowConfigResponse,
    WorkflowConfigUpdateItem,
    WorkflowConfigUpdateResponse,
    WorkflowDetailResponse,
} from '@/types'
import { api } from '@/utils/request'
import { logger } from '@/utils/logger'

/**
 * 数据治理服务类
 * 封装所有数据治理相关的API调用
 */
export class DataGovernanceService {
    /**
     * 0、清空数据、初始化
     * @description 清空所有数据并进行系统初始化
     * @returns Promise<null>
     */
    static async init(): Promise<null> {
        try {
            return await api.post<null>('/data/governance/init')
        } catch (error) {
            throw new Error(
                `数据初始化失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }

    /**
     * 1、数据清洗、空格替换
     * @description 对数据进行清洗，替换多余空格
     * @returns Promise<DataGovernanceResult>
     */
    static async cleanDataFields(): Promise<DataGovernanceResult> {
        try {
            return await api.post<DataGovernanceResult>('/data/governance/cleanDataFields')
        } catch (error) {
            throw new Error(`数据清洗失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
    }

    /**
     * 2、数据去重
     * @description 对数据进行去重处理
     * @returns Promise<DataGovernanceResult>
     */
    static async deduplicateData(): Promise<DataGovernanceResult> {
        try {
            return await api.post<DataGovernanceResult>('/data/governance/deduplicateData')
        } catch (error) {
            throw new Error(`数据去重失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
    }

    /**
     * 4、标准对照
     * @description 应用标准映射规则
     * @returns Promise<DataGovernanceResult>
     */
    static async applyStandardMapping(): Promise<DataGovernanceResult> {
        try {
            return await api.post<DataGovernanceResult>('/data/governance/applyStandardMapping')
        } catch (error) {
            throw new Error(`标准对照失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
    }

    /**
     * 5、EMPI 定义发放
     * @description 分配和发放EMPI（企业主索引）定义
     * @returns Promise<DataGovernanceResult>
     */
    static async assignEmpi(): Promise<DataGovernanceResult> {
        try {
            return await api.post<DataGovernanceResult>('/data/governance/assignEmpi')
        } catch (error) {
            throw new Error(
                `EMPI定义发放失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }

    /**
     * 6、EMOI 定义发放
     * @description 分配和发放EMOI（企业对象索引）定义
     * @returns Promise<DataGovernanceResult>
     */
    static async assignEmoi(): Promise<DataGovernanceResult> {
        try {
            return await api.post<DataGovernanceResult>('/data/governance/assignEmoi')
        } catch (error) {
            throw new Error(
                `EMOI定义发放失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }

    /**
     * 7、数据归一
     * @description 对数据进行归一化处理
     * @returns Promise<DataGovernanceResult>
     */
    static async normalizeData(): Promise<DataGovernanceResult> {
        try {
            return await api.post<DataGovernanceResult>('/data/governance/normalizeData')
        } catch (error) {
            throw new Error(`数据归一失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
    }

    /**
     * 8、丢孤
     * @description 移除孤立记录
     * @returns Promise<DataGovernanceResult>
     */
    static async removeOrphanRecords(): Promise<DataGovernanceResult> {
        try {
            return await api.post<DataGovernanceResult>('/data/governance/removeOrphanRecords')
        } catch (error) {
            throw new Error(`丢孤处理失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
    }

    /**
     * 9、数据脱敏
     * @description 对敏感数据进行脱敏处理
     * @returns Promise<DataGovernanceResult>
     */
    static async maskSensitiveData(): Promise<DataGovernanceResult> {
        try {
            return await api.post<DataGovernanceResult>('/data/governance/maskSensitiveData')
        } catch (error) {
            throw new Error(`数据脱敏失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
    }

    /**
     * 10、同步数据
     * @description 同步数据到目标系统
     * @returns Promise<DataGovernanceResult>
     */
    static async sync(): Promise<DataGovernanceResult> {
        try {
            return await api.post<DataGovernanceResult>('/data/governance/sync')
        } catch (error) {
            throw new Error(`数据同步失败: ${error instanceof Error ? error.message : '未知错误'}`)
        }
    }

    /**
     * 获取执行历史日志列表
     * @returns 执行历史日志全部数据
     */
    static async getExecutionLogPage(): Promise<ExecutionLogPageResponse> {
        try {
            return await api.get<ExecutionLogPageResponse>('/data/governance/task/log/page')
        } catch (error) {
            throw new Error(
                `获取日志列表失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }

    /**
     * 12、日志详细
     * @description 获取指定日志的详细信息
     * @param logId 日志ID
     * @returns Promise<DataGovernanceLog>
     */
    static async getLogDetail(logId: string): Promise<DataGovernanceLog> {
        try {
            if (!logId) {
                throw new Error('日志ID不能为空')
            }
            return await api.get<DataGovernanceLog>(`/data/governance/log/${logId}`)
        } catch (error) {
            throw new Error(
                `获取日志详情失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }

    /**
     * @description 新增数据库连接配置
     * @param connection 数据库连接信息
     * @returns Promise<DataGovernanceResult>
     */
    static async addDbConnection(connection: {
        dbType: string
        dbHost: string
        dbPort: string
        dbName: string
        dbUsername: string
        dbPassword: string
        dbStatus: number
        remark: string
        createUser: string
    }): Promise<any> {
        try {
            return await api.post<any>('/data/governance/db-connection', connection)
        } catch (error) {
            throw new Error(
                `新增数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }

    /**
     * 分页查询数据库连接配置列表
     * @description 根据条件分页查询数据库连接信息
     * @param params 查询参数 { pageNo, pageSize, dbType?, dbStatus? }
     * @returns Promise<DbConnectionPageResponse>
     */
    static async getDbConnectionPage(
        params: DbConnectionPageParams
    ): Promise<DbConnectionPageResponse> {
        try {
            return await api.get<DbConnectionPageResponse>('/data/governance/db-connection/page', {
                params,
            })
        } catch (error) {
            throw new Error(
                `获取数据库连接列表失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }

    /**
     * 删除数据库连接
     */
    static async deleteDbConnection(id: string, updateUser: string): Promise<any> {
        try {
            return await api.delete<any>(`/data/governance/db-connection/${id}`, {
                params: { updateUser },
            })
        } catch (error) {
            throw new Error(
                `删除数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }

    /**
     * 更新数据库连接
     */
    static async updateDbConnection(
        id: string,
        connection: {
            dbType: string
            dbHost: string
            dbPort: string
            dbName: string
            dbUsername: string
            dbPassword: string
            dbStatus: number
            remark: string
            updateUser: string
        }
    ): Promise<any> {
        try {
            return await api.put<any>(`/data/governance/db-connection/${id}`, connection)
        } catch (error) {
            throw new Error(
                `更新数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }

    /**
     * 测试数据库连接
     * @param id 数据库连接ID
     * @returns Promise<any>
     */
    static async testDbConnection(id: string): Promise<any> {
        try {
            return await api.post<any>(`/data/governance/db/connection/test/${id}`)
        } catch (error) {
            throw new Error(
                `测试数据库连接失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }

    /**
     * 获取工作流配置列表
     * @description 获取所有工作流步骤的配置信息
     * @returns Promise<WorkflowConfigResponse>
     */
    static async getWorkflowConfig(): Promise<WorkflowConfigResponse> {
        try {
            return await api.get<WorkflowConfigResponse>('/data/governance/task/config/list')
        } catch (error) {
            throw new Error(
                `获取工作流配置失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }

    /**
     * 批量更新工作流配置
     * @description 批量更新工作流步骤的启用状态和自动流转设置
     * @param configs 要更新的配置项列表
     * @returns Promise<WorkflowConfigUpdateResponse>
     */
    static async updateWorkflowConfig(
        configs: WorkflowConfigUpdateItem[]
    ): Promise<WorkflowConfigUpdateResponse> {
        try {
            return await api.post<WorkflowConfigUpdateResponse>(
                '/data/governance/task/config/update',
                configs
            )
        } catch (error) {
            throw new Error(
                `更新工作流配置失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }

    /**
     * 启动工作流
     * @description 启动数据治理工作流，返回批次ID
     * @returns Promise<StartWorkflowResponse>
     */
    static async startWorkflow(): Promise<StartWorkflowResponse> {
        try {
            logger.debug('发送启动工作流请求到: /data/governance/task/process/start')
            const response = await api.post<StartWorkflowResponse>(
                '/data/governance/task/process/start'
            )
            logger.debug('启动工作流API响应:', response)
            return response
        } catch (error) {
            logger.error('启动工作流API调用失败:', error)
            throw new Error(
                `启动工作流失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }

    /**
     * 获取工作流详情
     * @description 根据批次ID获取工作流执行的详细信息
     * @param batchId 批次ID
     * @returns Promise<WorkflowDetailResponse>
     */
    static async getWorkflowDetail(batchId: string): Promise<WorkflowDetailResponse> {
        try {
            logger.debug(`发送获取工作流详情请求到: /data/governance/log/${batchId}`)
            const response = await api.get<WorkflowDetailResponse>(
                `/data/governance/log/${batchId}`
            )
            logger.debug('获取工作流详情API响应:', response)
            return response
        } catch (error) {
            logger.error('获取工作流详情API调用失败:', error)
            throw new Error(
                `获取工作流详情失败: ${error instanceof Error ? error.message : '未知错误'}`
            )
        }
    }
}

/**
 * 数据治理服务实例
 * 提供便捷的API调用方法
 */
export const dataGovernanceService = {
    // 数据处理操作
    init: DataGovernanceService.init,
    cleanDataFields: DataGovernanceService.cleanDataFields,
    deduplicateData: DataGovernanceService.deduplicateData,
    applyStandardMapping: DataGovernanceService.applyStandardMapping,
    assignEmpi: DataGovernanceService.assignEmpi,
    assignEmoi: DataGovernanceService.assignEmoi,
    normalizeData: DataGovernanceService.normalizeData,
    removeOrphanRecords: DataGovernanceService.removeOrphanRecords,
    maskSensitiveData: DataGovernanceService.maskSensitiveData,
    sync: DataGovernanceService.sync,

    // 日志查询操作
    getLogPage: DataGovernanceService.getLogPage,
    getLogDetail: DataGovernanceService.getLogDetail,

    // 数据库配置操作
    addDbConnection: DataGovernanceService.addDbConnection,
    getDbConnectionPage: DataGovernanceService.getDbConnectionPage,
    deleteDbConnection: DataGovernanceService.deleteDbConnection,
    updateDbConnection: DataGovernanceService.updateDbConnection,
    testDbConnection: DataGovernanceService.testDbConnection,

    // 工作流配置相关
    getWorkflowConfig: DataGovernanceService.getWorkflowConfig,
    updateWorkflowConfig: DataGovernanceService.updateWorkflowConfig,

    // 工作流执行相关
    startWorkflow: DataGovernanceService.startWorkflow,
    getWorkflowDetail: DataGovernanceService.getWorkflowDetail,
}

export default dataGovernanceService
