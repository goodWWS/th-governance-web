// 执行状态映射
export const statusConfig = {
    0: { text: '等待中', color: 'default' }, // 灰色 - 等待状态
    1: { text: '执行中', color: 'processing' }, // 蓝色 - 执行中状态
    2: { text: '已完成', color: 'success' }, // 绿色 - 完成状态
    3: { text: '暂停中', color: 'warning' }, // 橙色 - 暂停状态
    4: { text: '已跳过', color: 'default' }, // 灰色 - 跳过状态
    5: { text: '失败', color: 'error' }, // 红色 - 失败状态
}
