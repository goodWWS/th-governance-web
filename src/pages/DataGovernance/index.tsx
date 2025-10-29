import { HistoryOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Space, Typography, message } from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ExecutionRecordTable from '../../components/ExecutionRecordTable'
import { dataGovernanceService } from '../../services/dataGovernanceService'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { startTask } from '../../store/slices/dataGovernanceSlice'
import { logger } from '../../utils/logger'

const { Title } = Typography

const DataGovernance: React.FC = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { tasks, loading, error: _error } = useAppSelector(state => state.dataGovernance)
    const [startingWorkflow, setStartingWorkflow] = useState(false)

    // 获取执行记录
    const refreshRecords = () => {
        // 这里可以添加刷新逻辑
        logger.debug('刷新执行记录')
    }

    // 启动工作流
    const startWorkflow = useCallback(async () => {
        try {
            logger.debug('开始启动工作流...')
            setStartingWorkflow(true)

            // 调用启动工作流API
            logger.debug('调用 dataGovernanceService.startWorkflow()')
            const response = await dataGovernanceService.startWorkflow()
            logger.debug('启动工作流响应:', response)

            if (response.code === 200) {
                const batchId = response.data
                logger.debug('获取到批次ID:', batchId)
                message.success('工作流启动成功！')

                // 跳转到工作流详情页面
                navigate(`/data-governance/workflow/${batchId}`)
            } else {
                logger.error('启动工作流失败:', response)
                message.error(response.msg || '工作流启动失败')
            }
        } catch (error) {
            logger.error('启动工作流异常:', error)
            message.error('工作流启动失败，请稍后重试')
        } finally {
            setStartingWorkflow(false)
        }
    }, [navigate])

    // 执行工作流（保留原有逻辑作为备用）
    const _executeWorkflow = async () => {
        try {
            // 启动第一个任务作为示例
            const firstIdleTask = tasks.find(task => task.status === 'idle')
            if (firstIdleTask) {
                await dispatch(startTask(firstIdleTask.id)).unwrap()
                message.success('工作流开始执行')
                // 跳转到执行详情页
                navigate(`/data-governance/execution/${firstIdleTask.id}`)
            } else {
                message.warning('没有可执行的任务')
            }
        } catch (error) {
            message.error('工作流执行失败')
        }
    }

    // 检查是否有任务正在运行
    const _hasRunningTask = tasks.some(task => task.status === 'running')

    // 初始化加载执行记录
    useEffect(() => {
        refreshRecords()
    }, [])

    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                }}
            >
                <Title level={2} style={{ margin: 0 }}>
                    <HistoryOutlined style={{ marginRight: 8 }} />
                    数据治理执行记录
                </Title>
                <Space>
                    <Button
                        type='primary'
                        size='large'
                        icon={<PlayCircleOutlined />}
                        loading={startingWorkflow}
                        onClick={startWorkflow}
                    >
                        {startingWorkflow ? '启动中...' : '启动工作流'}
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={refreshRecords} loading={loading}>
                        刷新记录
                    </Button>
                </Space>
            </div>

            <Alert
                message='数据治理执行记录'
                description='查看所有数据治理工作流的执行历史记录，点击单条记录可查看详细的执行步骤和进度信息。点击"启动工作流"开始新的数据治理流程。'
                type='info'
                showIcon
                style={{ marginBottom: 24 }}
            />

            {/* 执行记录表格 */}
            <Card>
                <ExecutionRecordTable
                    records={tasks}
                    loading={loading}
                    onRefresh={refreshRecords}
                />
            </Card>
        </div>
    )
}

export default DataGovernance
