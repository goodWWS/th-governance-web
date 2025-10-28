import { HistoryOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Space, Typography, message } from 'antd'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ExecutionRecordTable from '../../components/ExecutionRecordTable'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { startTask } from '../../store/slices/dataGovernanceSlice'

const { Title } = Typography

const DataGovernance: React.FC = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { tasks, loading, error } = useAppSelector(state => state.dataGovernance)

    // 获取执行记录
    const refreshRecords = () => {
        // 这里可以添加刷新逻辑
        console.log('刷新执行记录')
    }

    // 执行工作流
    const executeWorkflow = async () => {
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
    const hasRunningTask = tasks.some(task => task.status === 'running')

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
                        loading={hasRunningTask}
                        disabled={hasRunningTask}
                        onClick={executeWorkflow}
                    >
                        {hasRunningTask ? '执行中...' : '执行工作流'}
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={refreshRecords} loading={loading}>
                        刷新记录
                    </Button>
                </Space>
            </div>

            <Alert
                message='数据治理执行记录'
                description='查看所有数据治理工作流的执行历史记录，点击单条记录可查看详细的执行步骤和进度信息。'
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
