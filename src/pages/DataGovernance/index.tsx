import { HistoryOutlined, PlayCircleOutlined, ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Space, Typography, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ExecutionRecordTable from '../../components/ExecutionRecordTable'

const { Title } = Typography

const DataGovernance: React.FC = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [isExecuting, setIsExecuting] = useState(false)
    
    // 模拟执行记录数据
    const [mockTasks] = useState([
        {
            id: '1',
            name: '数据清洗任务',
            status: 'completed',
            progress: 100,
            startTime: '2024-01-15 09:00:00',
            endTime: '2024-01-15 09:30:00',
            processedRecords: 15000,
            totalRecords: 15000,
            config: { cleaningRules: ['remove_null', 'trim_spaces'] }
        },
        {
            id: '2',
            name: '数据去重任务',
            status: 'completed',
            progress: 100,
            startTime: '2024-01-15 10:00:00',
            endTime: '2024-01-15 10:15:00',
            processedRecords: 12000,
            totalRecords: 12000,
            config: { deduplicationStrategy: 'exact_match' }
        },
        {
            id: '3',
            name: '类型转换任务',
            status: 'idle',
            progress: 0,
            startTime: null,
            endTime: null,
            processedRecords: 0,
            totalRecords: 8000,
            config: { conversionRules: ['string_to_date', 'string_to_number'] }
        }
    ])

    // 获取执行记录 - 纯前端模拟
    const refreshRecords = () => {
        setLoading(true)
        // 模拟API调用延迟
        setTimeout(() => {
            setLoading(false)
            message.success('执行记录已刷新')
        }, 500)
    }

    // 执行工作流 - 纯前端模拟
    const executeWorkflow = async () => {
        try {
            setIsExecuting(true)
            
            // 模拟执行延迟
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // 查找第一个空闲任务
            const firstIdleTask = mockTasks.find(task => task.status === 'idle')
            if (firstIdleTask) {
                message.success('工作流开始执行')
                // 跳转到执行详情页
                navigate(`/data-governance/execution/${firstIdleTask.id}`)
            } else {
                message.warning('没有可执行的任务，所有任务都已完成')
            }
        } catch (error) {
            message.error('工作流执行失败')
        } finally {
            setIsExecuting(false)
        }
    }

    // 检查是否有任务正在运行
    const hasRunningTask = mockTasks.some(task => task.status === 'running')

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
                        loading={isExecuting}
                        disabled={hasRunningTask || isExecuting}
                        onClick={executeWorkflow}
                    >
                        {hasRunningTask ? '执行中...' : isExecuting ? '启动中...' : '执行工作流'}
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
                    records={mockTasks}
                    loading={loading}
                    onRefresh={refreshRecords}
                />
            </Card>
        </div>
    )
}

export default DataGovernance
