import { DataGovernanceService } from '@/services/dataGovernanceService'
import type { ExecutionLogItem } from '@/types'
import { logger } from '@/utils/logger'
import { ReloadOutlined, SettingOutlined } from '@ant-design/icons'
import { Button, Card, message, Space, Typography } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExecutionRecordTable } from './ExecutionRecordTable'

const { Title, Paragraph } = Typography

/**
 * 执行历史页面
 * 展示数据治理工作流的执行历史记录
 */
export const ExecutionHistory: React.FC = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [allExecutionRecords, setAllExecutionRecords] = useState<ExecutionLogItem[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    /**
     * 获取执行历史数据
     */
    const fetchExecutionHistory = useCallback(async () => {
        try {
            setLoading(true)
            const response = await DataGovernanceService.getExecutionLogPage()

            if (response.code === 200) {
                setAllExecutionRecords(response.data)
            } else {
                message.error(response.msg || '获取执行历史失败')
            }
        } catch (error) {
            logger.error('获取执行历史失败', error as Error)
            message.error('获取执行历史失败，请稍后重试')
        } finally {
            setLoading(false)
        }
    }, [])

    /**
     * 计算当前页显示的数据
     */
    const currentPageData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        return allExecutionRecords.slice(startIndex, endIndex)
    }, [allExecutionRecords, currentPage, pageSize])

    /**
     * 处理分页变化
     */
    const handlePageChange = useCallback((page: number, size: number) => {
        setCurrentPage(page)
        setPageSize(size)
    }, [])

    /**
     * 页面初始化时获取数据
     */
    useEffect(() => {
        fetchExecutionHistory()
    }, [fetchExecutionHistory])

    /**
     * 刷新执行记录
     */
    const handleRefresh = useCallback(() => {
        fetchExecutionHistory()
    }, [fetchExecutionHistory])

    /**
     * 跳转到工作流配置页面
     */
    const handleGoToWorkflowConfig = useCallback(() => {
        navigate('/data-governance/workflow-config')
    }, [navigate])

    /**
     * 查看执行详情
     */
    const handleViewDetails = useCallback(
        (record: ExecutionLogItem) => {
            navigate(`/data-governance/execution/${record.batch_id}`)
        },
        [navigate]
    )

    return (
        <div className='execution-history-page'>
            {/* 页面头部 */}
            <div className='page-header' style={{ marginBottom: 24 }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Title level={2} style={{ margin: 0 }}>
                        执行历史
                    </Title>
                    <Space>
                        <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
                            刷新记录
                        </Button>
                        <Button
                            type='primary'
                            icon={<SettingOutlined />}
                            onClick={handleGoToWorkflowConfig}
                        >
                            工作流配置
                        </Button>
                    </Space>
                </div>
            </div>

            {/* 状态提示 */}
            <Card
                size='small'
                style={{
                    marginBottom: 16,
                    backgroundColor: '#f6ffed',
                    border: '1px solid #b7eb8f',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', color: '#52c41a' }}>
                    <span style={{ fontSize: 16, marginRight: 8 }}>✓</span>
                    <span>数据治理工作流正在正常运行中</span>
                </div>
            </Card>

            {/* 页面说明 */}
            <Card style={{ marginBottom: 24 }}>
                <Paragraph>
                    此页面展示数据治理工作流的执行历史记录，包括每个步骤的执行状态、时间和详细信息。
                    您可以查看具体的执行详情，了解数据处理过程中的问题和结果。
                </Paragraph>
            </Card>

            {/* 执行记录表格 */}
            <ExecutionRecordTable
                data={currentPageData}
                loading={loading}
                onViewDetails={handleViewDetails}
                onRefresh={handleRefresh}
                pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: allExecutionRecords.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    onChange: handlePageChange,
                }}
            />
        </div>
    )
}
