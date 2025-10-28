import { HistoryOutlined, ReloadOutlined, SettingOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Space, Typography, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ExecutionRecordTable from '../../components/ExecutionRecordTable'
import { workflowExecutionService } from '../../services/workflowExecutionService'

const { Title } = Typography

const ExecutionHistory: React.FC = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [executions, setExecutions] = useState<any[]>([])
    
    // 模拟执行历史数据 - 按时间倒序排列（最新的在前）
    const mockExecutions = [
        {
            id: '4',
            name: '数据同步工作流',
            status: 'paused',
            processedRecords: 3600,
            totalRecords: 8000,
            startTime: '2024-01-15 14:00:00',
            endTime: null,
            duration: '2小时15分钟',
            config: { 
                steps: ['数据提取', '数据转换', '数据加载'],
                syncRules: ['incremental', 'real_time'] 
            },
            steps: [
                {
                    stepId: '1',
                    stepName: '数据提取',
                    status: 'completed',
                    startTime: '2024-01-15 14:00:00',
                    endTime: '2024-01-15 14:30:00',
                    processedRecords: 8000,
                    totalRecords: 8000,
                    duration: '30分钟'
                },
                {
                    stepId: '2',
                    stepName: '数据转换',
                    status: 'paused',
                    startTime: '2024-01-15 14:30:00',
                    endTime: null,
                    processedRecords: 3600,
                    totalRecords: 8000,
                    duration: '1小时45分钟'
                },
                {
                    stepId: '3',
                    stepName: '数据加载',
                    status: 'idle',
                    startTime: null,
                    endTime: null,
                    processedRecords: 0,
                    totalRecords: 8000,
                    duration: null
                }
            ]
        },
        {
            id: '3',
            name: '数据脱敏工作流',
            status: 'completed',
            processedRecords: 8000,
            totalRecords: 8000,
            startTime: '2024-01-15 11:00:00',
            endTime: '2024-01-15 11:20:00',
            duration: '20分钟',
            config: { 
                steps: ['敏感数据识别', '数据脱敏', '结果验证'],
                maskingRules: ['phone_mask', 'email_mask'] 
            }
        },
        {
            id: '2',
            name: '数据质量检查工作流',
            status: 'completed',
            processedRecords: 12000,
            totalRecords: 12000,
            startTime: '2024-01-15 10:00:00',
            endTime: '2024-01-15 10:45:00',
            duration: '45分钟',
            config: { 
                steps: ['质量检查', '异常检测', '报告生成'],
                qualityRules: ['completeness', 'accuracy'] 
            }
        },
        {
            id: '1',
            name: '数据清洗工作流',
            status: 'completed',
            processedRecords: 15000,
            totalRecords: 15000,
            startTime: '2024-01-15 09:00:00',
            endTime: '2024-01-15 09:30:00',
            duration: '30分钟',
            config: { 
                steps: ['数据清洗', '数据去重', '类型转换'],
                cleaningRules: ['remove_null', 'trim_spaces'] 
            }
        }
    ]

    // 加载执行历史记录
    const loadExecutions = () => {
        setLoading(true)
        
        try {
            // 获取实际的执行记录
            const realExecutions = workflowExecutionService.getAllExecutions()
            const convertedExecutions = realExecutions.map(execution => 
                workflowExecutionService.convertToExecutionRecord(execution)
            )
            
            // 合并模拟数据和实际数据，实际数据在前
            const allExecutions = [...convertedExecutions, ...mockExecutions]
            
            // 按时间倒序排列
            allExecutions.sort((a, b) => {
                const timeA = new Date(a.startTime || '').getTime() || 0
                const timeB = new Date(b.startTime || '').getTime() || 0
                return timeB - timeA
            })
            
            setExecutions(allExecutions)
        } catch (error) {
            console.error('加载执行历史失败:', error)
            // 如果加载失败，使用模拟数据
            setExecutions(mockExecutions)
        } finally {
            setLoading(false)
        }
    }

    // 刷新执行记录
    const refreshRecords = () => {
        loadExecutions()
        message.success('执行历史已刷新')
    }

    // 跳转到工作流配置页面
    const goToWorkflowConfig = () => {
        navigate('/data-governance/workflow-config')
        message.info('跳转到工作流配置页面')
    }

    // 查看执行详情
    const viewExecutionDetail = (executionId: string) => {
        navigate(`/data-governance/execution/${executionId}`)
    }

    // 初始化加载执行历史
    useEffect(() => {
        loadExecutions()
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
                    数据治理执行历史
                </Title>
                <Space>
                    <Button
                        type='primary'
                        icon={<SettingOutlined />}
                        onClick={goToWorkflowConfig}
                    >
                        工作流配置
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

            <Alert
                message='执行历史记录'
                description='查看所有数据治理工作流的历史执行记录，包括成功、失败和正在运行的任务。点击记录可查看详细执行信息。'
                type='info'
                showIcon
                style={{ marginBottom: 24 }}
            />

            {/* 执行历史表格 */}
            <Card>
                <ExecutionRecordTable
                    records={executions}
                    loading={loading}
                    onRefresh={refreshRecords}
                    onViewDetail={viewExecutionDetail}
                />
            </Card>
        </div>
    )
}

export default ExecutionHistory