import {
    Alert,
    Button,
    Card,
    Space,
    Switch,
    Typography,
    message,
    Row,
    Col,
} from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../store/hooks'
import { startTask } from '../../store/slices/dataGovernanceSlice'
import { 
  PlayCircleOutlined, 
  StopOutlined,
  SettingOutlined,
  ClearOutlined,
  CopyOutlined,
  SwapOutlined,
  BookOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  UnorderedListOutlined,
  EyeInvisibleOutlined,
  DeleteOutlined
} from '@ant-design/icons'

const { Title, Text } = Typography

/**
 * 工作流步骤页面
 * 提供工作流执行步骤的配置和管理
 */
const WorkflowConfig: React.FC = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const [loading, setLoading] = useState(false)
    const [isRunning, setIsRunning] = useState(false)

    // 工作流步骤配置
    const [steps, setSteps] = useState([
        {
            id: 'data-cleaning',
            taskId: '1', // 对应Redux中的任务ID
            title: '数据清洗',
            description: '脏数据主要是数据值域内包含了一些无效字符、特殊字符、过渡态的拼接符等。脏数据处理是通过清洗函数等工程手段，在固定环节调用，将数据装载到ODS数据中心的过程。',
            enabled: true,
            autoFlow: false,
            icon: <ClearOutlined />
        },
        {
            id: 'data-deduplication',
            taskId: '2', // 对应Redux中的任务ID
            title: '数据去重',
            description: 'PK完全相同的某一条数据，或者某部分数据。',
            enabled: true,
            autoFlow: true,
            icon: <CopyOutlined />
        },
        {
            id: 'type-conversion',
            taskId: '3', // 对应Redux中的任务ID
            title: '类型转换',
            description: '将string类型转化为模型中约束的类型的过程。',
            enabled: true,
            autoFlow: true,
            icon: <SwapOutlined />
        },
        {
            id: 'standard-mapping',
            taskId: '4', // 对应Redux中的任务ID
            title: '标准对照',
            description: '对多源数据依据标准字典对照，及对数据清洗成标准字典的一系列过程。',
            enabled: false,
            autoFlow: false,
            icon: <BookOutlined />
        },
        {
            id: 'empi-distribution',
            taskId: '5', // 对应Redux中的任务ID
            title: 'EMPI定义发放',
            description: '将同一个区域医院中同一个患者的多个患者号进行标记识别，合并患者，统一发布患者唯一主索引。',
            enabled: true,
            autoFlow: true,
            icon: <UserOutlined />
        },
        {
            id: 'emoi-distribution',
            taskId: '6', // 对应Redux中的任务ID
            title: 'EMOI定义发放',
            description: '将同一个区域同一个患者的多次就诊号进行标记识别，根据就诊时间标明检查检验所属就诊时间，统一发布检查检验就诊唯一主索引。',
            enabled: true,
            autoFlow: false,
            icon: <MedicineBoxOutlined />
        },
        {
            id: 'data-normalization',
            taskId: '7', // 对应Redux中的任务ID
            title: '数据归一',
            description: '数据格式标准化的一种，基于国家规定，将所需数据进行标准归一，定义所有数据标准格式和标准值。',
            enabled: true,
            autoFlow: true,
            icon: <UnorderedListOutlined />
        },
        {
            id: 'orphan-removal',
            taskId: '8', // 对应Redux中的任务ID
            title: '丢孤儿',
            description: '数据中无法与主表有任何关联的数据，可能是系统上线前测试或违规操作产生，无使用价值。',
            enabled: false,
            autoFlow: false,
            icon: <DeleteOutlined />
        },
        {
            id: 'data-desensitization',
            taskId: '9', // 对应Redux中的任务ID
            title: '数据脱敏',
            description: '出于数据安全考虑，对数据中的关键字段进行脱敏处理。',
            enabled: true,
            autoFlow: true,
            icon: <EyeInvisibleOutlined />
        }
    ])

    /**
     * 启动工作流
     */
    const handleStartWorkflow = async () => {
        try {
            setLoading(true)
            
            // 检查是否有启用的步骤
            const enabledSteps = steps.filter(step => step.enabled)
            if (enabledSteps.length === 0) {
                message.warning('请至少启用一个工作流步骤')
                return
            }
            
            // 模拟启动工作流
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // 启动第一个启用的任务（使用Redux中的真实任务ID）
            const firstEnabledStep = enabledSteps[0]
            const taskId = firstEnabledStep.taskId // 使用映射的任务ID
            
            // 通过Redux启动任务
            await dispatch(startTask(taskId))
            
            setIsRunning(true)
            message.success('工作流启动成功！正在跳转到详情页面...')
            
            console.log('启用的工作流步骤:', enabledSteps)
            console.log('启动的任务ID:', taskId)
            
            // 延迟跳转，让用户看到成功消息
            setTimeout(() => {
                navigate(`/data-governance/execution/${taskId}`)
            }, 1500)
            
        } catch (error) {
            console.error('启动工作流失败:', error)
            message.error('启动工作流失败，请检查配置')
        } finally {
            setLoading(false)
        }
    }

    /**
     * 停止工作流
     */
    const handleStopWorkflow = async () => {
        try {
            setLoading(true)
            
            // 模拟停止工作流
            await new Promise(resolve => setTimeout(resolve, 500))
            
            setIsRunning(false)
            message.success('工作流已停止')
        } catch (error) {
            console.error('停止工作流失败:', error)
            message.error('停止工作流失败')
        } finally {
            setLoading(false)
        }
    }

    /**
     * 处理步骤启用状态变更
     */
    const handleStepEnabledChange = (stepId: string, enabled: boolean) => {
        setSteps(prev => prev.map(step => 
            step.id === stepId ? { 
                ...step, 
                enabled,
                // 禁用步骤时自动关闭自动化流转
                autoFlow: enabled ? step.autoFlow : false
            } : step
        ))
    }

    /**
     * 处理自动化流转开关变更
     */
    const handleAutoFlowChange = (stepId: string, autoFlow: boolean) => {
        setSteps(prev => prev.map(step => 
            step.id === stepId ? { ...step, autoFlow } : step
        ))
    }

    return (
        <div>
            {/* 页面标题 */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                }}
            >
                <Title level={2} style={{ margin: 0 }}>
                    <SettingOutlined style={{ marginRight: 8 }} />
                    工作流步骤
                </Title>
                
                {/* 操作按钮 */}
                <Space>
                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        loading={loading && !isRunning}
                        disabled={isRunning}
                        onClick={handleStartWorkflow}
                    >
                        启动工作流
                    </Button>
                    <Button
                        danger
                        icon={<StopOutlined />}
                        loading={loading && isRunning}
                        disabled={!isRunning}
                        onClick={handleStopWorkflow}
                    >
                        停止工作流
                    </Button>
                </Space>
            </div>

            {/* 信息提示 */}
            <Alert
                message="工作流步骤配置"
                description="配置数据治理工作流的执行步骤，每个步骤可以独立启用或禁用，并设置是否自动流转到下一步骤。"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
            />

            {/* 状态提示 */}
            {isRunning && (
                <Alert
                    message="工作流运行中"
                    description="当前工作流正在执行中，请在执行历史页面查看详细进度。"
                    type="success"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* 工作流步骤卡片 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {steps.map((step, index) => (
                <Card
                  key={step.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8e8e8',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.2s ease',
                    opacity: step.enabled ? 1 : 0.7
                  }}
                  styles={{
                    body: { 
                      padding: '20px'
                    }
                  }}
                  hoverable
                >
                  {/* 第一行：序号、图标、标题、启用开关 */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                      {/* 步骤序号 */}
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: step.enabled ? '#1890ff' : '#d9d9d9',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        {index + 1}
                      </div>
                      
                      {/* 图标 */}
                      <div style={{
                        fontSize: '20px',
                        color: step.enabled ? '#1890ff' : '#bfbfbf'
                      }}>
                        {step.icon}
                      </div>
                      
                      {/* 标题 */}
                      <div>
                        <h3 style={{ 
                          margin: 0, 
                          fontSize: '16px', 
                          fontWeight: '500',
                          color: step.enabled ? '#262626' : '#8c8c8c'
                        }}>
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    
                    {/* 启用开关 */}
                    <Switch
                      checked={step.enabled}
                      onChange={(checked) => handleStepEnabledChange(step.id, checked)}
                    />
                  </div>
                  
                  {/* 第二行：描述和自动化流转开关 */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between',
                    gap: '16px',
                    paddingLeft: '40px'
                  }}>
                    {/* 描述 */}
                    <div style={{ 
                      flex: 1,
                      lineHeight: '1.6',
                      fontSize: '14px',
                      color: step.enabled ? '#595959' : '#8c8c8c'
                    }}>
                      {step.description}
                    </div>
                    
                    {/* 自动化流转开关 */}
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      flexShrink: 0,
                      padding: '4px 8px',
                      backgroundColor: '#fafafa',
                      borderRadius: '4px',
                      border: '1px solid #f0f0f0'
                    }}>
                      <span style={{ 
                        fontSize: '12px',
                        color: step.enabled ? '#595959' : '#bfbfbf',
                        whiteSpace: 'nowrap'
                      }}>
                        自动流转
                      </span>
                      <Switch
                        size="small"
                        checked={step.autoFlow}
                        onChange={(checked) => handleAutoFlowChange(step.id, checked)}
                        disabled={!step.enabled}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
        </div>
    )
}

export default WorkflowConfig