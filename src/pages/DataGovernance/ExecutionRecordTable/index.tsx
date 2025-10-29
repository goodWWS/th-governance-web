import {
    DuplicateCheckDetails,
    ExecutionLogItem,
    ExecutionStepStatus,
    ExecutionStepStatusColors,
    ExecutionStepStatusLabels,
    OrphanCheckDetails,
    SpecialCharCheckDetails,
} from '@/types'
import { EyeOutlined } from '@ant-design/icons'
import { Button, Card, Descriptions, Divider, Modal, Space, Table, Tag, Typography } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import dayjs from 'dayjs'
import React, { useMemo, useState } from 'react'
import { logger } from '@/utils/logger'

const { Text, _Paragraph } = Typography

/**
 * 执行记录表格组件属性
 */
interface ExecutionRecordTableProps {
    /** 执行记录数据 */
    data: ExecutionLogItem[]
    /** 加载状态 */
    loading?: boolean
    /** 查看详情回调 */
    onViewDetails?: (record: ExecutionLogItem) => void
    /** 刷新回调 */
    onRefresh?: () => void
    /** 分页配置 */
    pagination?: TablePaginationConfig
}

/**
 * 执行记录表格组件
 * 展示数据治理工作流的执行历史记录
 */
export const ExecutionRecordTable: React.FC<ExecutionRecordTableProps> = ({
    data,
    loading = false,
    onViewDetails,
    pagination,
}) => {
    const [detailModalVisible, setDetailModalVisible] = useState(false)
    const [selectedRecord, setSelectedRecord] = useState<ExecutionLogItem | null>(null)

    /**
     * 渲染步骤状态标签
     */
    const renderStatus = (status: ExecutionStepStatus) => {
        const label = ExecutionStepStatusLabels[status]
        const color = ExecutionStepStatusColors[status]
        return <Tag color={color}>{label}</Tag>
    }

    /**
     * 格式化时间
     */
    const formatTime = (timeStr: string) => {
        if (!timeStr) return '-'
        return dayjs(timeStr).format('YYYY-MM-DD HH:mm:ss')
    }

    /**
     * 计算执行时长
     */
    const calculateDuration = (startTime: string, endTime: string) => {
        if (!startTime || !endTime) return '-'
        const start = dayjs(startTime)
        const end = dayjs(endTime)
        const duration = end.diff(start, 'second')

        if (duration < 60) {
            return `${duration}秒`
        } else if (duration < 3600) {
            const minutes = Math.floor(duration / 60)
            const seconds = duration % 60
            return `${minutes}分${seconds}秒`
        } else {
            const hours = Math.floor(duration / 3600)
            const minutes = Math.floor((duration % 3600) / 60)
            return `${hours}小时${minutes}分钟`
        }
    }

    /**
     * 解析详情JSON字符串
     */
    const parseDetails = (detailsStr: string) => {
        try {
            return JSON.parse(detailsStr)
        } catch (error) {
            logger.error('解析详情失败:', error)
            return null
        }
    }

    /**
     * 渲染详情内容
     */
    const renderDetailsContent = (details: any) => {
        if (!details) return <Text type='secondary'>无详情信息</Text>

        // 处理数组格式的详情
        if (Array.isArray(details)) {
            return (
                <Space direction='vertical' style={{ width: '100%' }}>
                    {details.map((item, index) => (
                        <Card key={index} size='small' style={{ marginBottom: 8 }}>
                            {renderSingleDetailItem(item)}
                        </Card>
                    ))}
                </Space>
            )
        }

        // 处理单个对象格式的详情
        return renderSingleDetailItem(details)
    }

    /**
     * 渲染单个详情项
     */
    const renderSingleDetailItem = (item: any) => {
        // 数据重复检查详情
        if (item.table && item.problems) {
            const duplicateDetails = item as DuplicateCheckDetails
            return (
                <div>
                    <Text strong>表名：</Text>
                    <Text>{duplicateDetails.table}</Text>
                    <br />
                    <Text strong>总记录数：</Text>
                    <Text>{duplicateDetails.total}</Text>
                    <br />
                    <Text strong>重复问题：</Text>
                    {duplicateDetails.problems.map((problem, idx) => (
                        <div key={idx} style={{ marginLeft: 16, marginTop: 8 }}>
                            <Text strong>字段：</Text>
                            <Text>{problem.field}</Text>
                            <br />
                            <Text strong>重复组数：</Text>
                            <Text>{problem.duplicate_groups.length}</Text>
                            <br />
                            <Text strong>重复记录总数：</Text>
                            <Text>{problem.total_count}</Text>
                            <br />
                            <details style={{ marginTop: 4 }}>
                                <summary style={{ cursor: 'pointer', color: '#1890ff' }}>
                                    查看重复组详情
                                </summary>
                                {problem.duplicate_groups.map((group, groupIdx) => (
                                    <div key={groupIdx} style={{ marginLeft: 16, marginTop: 4 }}>
                                        <Text>
                                            值：{group.value} | 记录数：{group.count} | ID：
                                            {group.ids.join(', ')}
                                        </Text>
                                    </div>
                                ))}
                            </details>
                        </div>
                    ))}
                </div>
            )
        }

        // 特殊字符检查详情
        if (item.table && item.problem_fields) {
            const specialCharDetails = item as SpecialCharCheckDetails
            return (
                <div>
                    <Text strong>表名：</Text>
                    <Text>{specialCharDetails.table}</Text>
                    <br />
                    <Text strong>问题记录总数：</Text>
                    <Text>{specialCharDetails.total_count}</Text>
                    <br />
                    <Text strong>问题字段：</Text>
                    {specialCharDetails.problem_fields.map((field, idx) => (
                        <div key={idx} style={{ marginLeft: 16, marginTop: 8 }}>
                            <Text strong>字段：</Text>
                            <Text>{field.field}</Text>
                            <br />
                            <Text strong>问题类型：</Text>
                            <Text type='warning'>{field.problem_type}</Text>
                            <br />
                            <Text strong>问题记录数：</Text>
                            <Text>{field.count}</Text>
                            <br />
                            <Text strong>记录ID：</Text>
                            <Text>{field.ids.join(', ')}</Text>
                        </div>
                    ))}
                </div>
            )
        }

        // 丢孤检查详情
        if (item.table && item.masterTable && item.orphanDetails) {
            const orphanDetails = item as OrphanCheckDetails
            return (
                <div>
                    <Text strong>子表：</Text>
                    <Text>{orphanDetails.table}</Text>
                    <br />
                    <Text strong>主表：</Text>
                    <Text>{orphanDetails.masterTable}</Text>
                    <br />
                    <Text strong>孤儿记录数：</Text>
                    <Text>{orphanDetails.orphanCount}</Text>
                    <br />
                    <Text strong>关联字段：</Text>
                    <Text>{orphanDetails.relatedFields.join(', ')}</Text>
                    <br />
                    <Text strong>孤儿记录详情：</Text>
                    {orphanDetails.orphanDetails.map((orphan, idx) => (
                        <div key={idx} style={{ marginLeft: 16, marginTop: 8 }}>
                            <Text strong>ID：</Text>
                            <Text>{orphan.id}</Text>
                            <br />
                            <Text strong>字段值：</Text>
                            <Text>{JSON.stringify(orphan.fields)}</Text>
                            <br />
                            <Text strong>原因：</Text>
                            <Text type='danger'>{orphan.reason}</Text>
                        </div>
                    ))}
                </div>
            )
        }

        // 默认JSON展示
        return (
            <pre
                style={{
                    background: '#f5f5f5',
                    padding: 12,
                    borderRadius: 4,
                    fontSize: 12,
                    maxHeight: 300,
                    overflow: 'auto',
                }}
            >
                {JSON.stringify(item, null, 2)}
            </pre>
        )
    }

    /**
     * 查看详情
     */
    const handleViewDetails = (record: ExecutionLogItem) => {
        setSelectedRecord(record)
        setDetailModalVisible(true)
    }

    /**
     * 关闭详情弹窗
     */
    const handleCloseModal = () => {
        setDetailModalVisible(false)
        setSelectedRecord(null)
    }

    /**
     * 表格列定义
     */
    const columns: ColumnsType<ExecutionLogItem> = [
        {
            title: '日志ID',
            dataIndex: 'log_id',
            key: 'log_id',
            width: 80,
            sorter: (a, b) => a.log_id - b.log_id,
        },
        {
            title: '批次ID',
            dataIndex: 'batch_id',
            key: 'batch_id',
            width: 120,
            render: (batchId: number) => <Text code>{batchId}</Text>,
        },
        {
            title: '步骤',
            dataIndex: 'step_no',
            key: 'step_no',
            width: 60,
            align: 'center',
            sorter: (a, b) => a.step_no - b.step_no,
        },
        {
            title: '步骤名称',
            dataIndex: 'step_name',
            key: 'step_name',
            width: 200,
            ellipsis: true,
        },
        {
            title: '状态',
            dataIndex: 'step_status',
            key: 'step_status',
            width: 80,
            align: 'center',
            render: (status: ExecutionStepStatus) => renderStatus(status),
            filters: [
                { text: '成功', value: 0 },
                { text: '失败', value: 1 },
                { text: '进行中', value: 2 },
            ],
            onFilter: (value, record) => record.step_status === value,
        },
        {
            title: '开始时间',
            dataIndex: 'create_time',
            key: 'create_time',
            width: 160,
            render: (time: string) => formatTime(time),
            sorter: (a, b) => dayjs(a.create_time).unix() - dayjs(b.create_time).unix(),
        },
        {
            title: '结束时间',
            dataIndex: 'end_time',
            key: 'end_time',
            width: 160,
            render: (time: string) => formatTime(time),
        },
        {
            title: '执行时长',
            key: 'duration',
            width: 100,
            render: (_, record) => calculateDuration(record.create_time, record.end_time),
        },
        {
            title: '操作',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (_, record) => (
                <Space>
                    <Button
                        type='link'
                        size='small'
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetails(record)}
                    >
                        详情
                    </Button>
                </Space>
            ),
        },
    ]

    /**
     * 表格数据处理
     */
    const tableData = useMemo(() => {
        return data.map(item => ({
            ...item,
            key: `${item.log_id}-${item.batch_id}`,
        }))
    }, [data])

    return (
        <>
            <Card>
                <Table
                    columns={columns}
                    dataSource={tableData}
                    loading={loading}
                    pagination={pagination}
                    scroll={{ x: 1200 }}
                    size='middle'
                />
            </Card>

            {/* 详情弹窗 */}
            <Modal
                title='执行详情'
                open={detailModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key='close' onClick={handleCloseModal}>
                        关闭
                    </Button>,
                    selectedRecord && onViewDetails && (
                        <Button
                            key='viewMore'
                            type='primary'
                            onClick={() => {
                                onViewDetails(selectedRecord)
                                handleCloseModal()
                            }}
                        >
                            查看完整详情
                        </Button>
                    ),
                ]}
                width={800}
                style={{ top: 20 }}
            >
                {selectedRecord && (
                    <div>
                        {/* 基本信息 */}
                        <Descriptions title='基本信息' bordered size='small' column={2}>
                            <Descriptions.Item label='日志ID'>
                                {selectedRecord.log_id}
                            </Descriptions.Item>
                            <Descriptions.Item label='批次ID'>
                                <Text code>{selectedRecord.batch_id}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label='步骤编号'>
                                {selectedRecord.step_no}
                            </Descriptions.Item>
                            <Descriptions.Item label='步骤名称'>
                                {selectedRecord.step_name}
                            </Descriptions.Item>
                            <Descriptions.Item label='执行状态'>
                                {renderStatus(selectedRecord.step_status)}
                            </Descriptions.Item>
                            <Descriptions.Item label='执行时长'>
                                {calculateDuration(
                                    selectedRecord.create_time,
                                    selectedRecord.end_time
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label='开始时间'>
                                {formatTime(selectedRecord.create_time)}
                            </Descriptions.Item>
                            <Descriptions.Item label='结束时间'>
                                {formatTime(selectedRecord.end_time)}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        {/* 详情信息 */}
                        <div>
                            <Text strong style={{ fontSize: 16 }}>
                                详情信息
                            </Text>
                            <div style={{ marginTop: 16 }}>
                                {renderDetailsContent(parseDetails(selectedRecord.details))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    )
}
