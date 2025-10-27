import { HistoryOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Space, Typography, message } from 'antd'
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ExecutionRecordTable from '../../components/ExecutionRecordTable'
import { useAppDispatch, useAppSelector } from '../../store/hooks'

const { Title } = Typography

/**
 * 执行历史页面
 * 显示所有数据治理工作流的执行历史记录
 */
const ExecutionHistory: React.FC = () => {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { tasks, loading, error } = useAppSelector(state => state.dataGovernance)

    // 获取执行记录
    const refreshRecords = () => {
        // 这里可以添加刷新逻辑
        console.log('刷新执行记录')
        message.info('执行记录已刷新')
    }

    // 跳转到工作流步骤页面
    const goToWorkflowConfig = () => {
        navigate('/data-governance/workflow-config')
    }

    // 查看执行详情
    const viewExecutionDetail = (recordId: string) => {
        navigate(`/data-governance/execution/${recordId}`)
    }

    // 检查是否有任务正在运行
    const hasRunningTask = tasks.some(task => task.status === 'running')
    const runningTaskCount = tasks.filter(task => task.status === 'running').length

    // 初始化加载执行记录
    useEffect(() => {
        refreshRecords()
    }, [])

    return (
        <div>
            {/* 页面头部 */}
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
                    执行历史
                </Title>
                <Space>
                    <Button
                        icon={<SettingOutlined />}
                        onClick={goToWorkflowConfig}
                    >
                        工作流步骤
                    </Button>
                    <Button 
                        icon={<ReloadOutlined />} 
                        onClick={refreshRecords} 
                        loading={loading}
                    >
                        刷新记录
                    </Button>
                </Space>
            </div>

            {/* 状态提示 */}
            {hasRunningTask && (
                <Alert
                    message={`当前有 ${runningTaskCount} 个工作流正在执行`}
                    description="工作流正在后台执行中，您可以在下方列表中查看实时进度。"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                    action={
                        <Button 
                            size="small" 
                            onClick={goToWorkflowConfig}
                        >
                            查看配置
                        </Button>
                    }
                />
            )}

            {error && (
                <Alert
                    message="加载错误"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* 页面说明 */}
            <Alert
                message="执行历史记录"
                description="查看所有数据治理工作流的执行历史记录，点击单条记录可查看详细的执行步骤和进度信息。您也可以通过工作流步骤页面启动新的执行任务。"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            {/* 执行记录表格 */}
            <Card>
                <ExecutionRecordTable
                    records={tasks}
                    loading={loading}
                    onRefresh={refreshRecords}
                    onViewDetail={viewExecutionDetail}
                />
            </Card>
        </div>
    )
}

export default ExecutionHistory