import { message } from 'antd'
import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'

interface StructuredField {
    label: string
    value: string
}

interface HistoryItem {
    id: string
    title: string
    timestamp: string
    naturalText: string
    documentType: string
    structuredFields: StructuredField[]
    jsonOutput: string
}

function DataStructuring() {
    const [naturalText, setNaturalText] = useState('')
    const [documentType, setDocumentType] = useState('入院记录')
    const [structuredFields, setStructuredFields] = useState<StructuredField[]>([])
    const [jsonOutput, setJsonOutput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [governanceProgress, setGovernanceProgress] = useState(0)
    const [governanceStage, setGovernanceStage] = useState('')
    const [historyList, setHistoryList] = useState<HistoryItem[]>([])
    const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null)

    // 加载历史记录
    useEffect(() => {
        const savedHistory = localStorage.getItem('governance-history')
        if (savedHistory) {
            try {
                setHistoryList(JSON.parse(savedHistory))
            } catch (error) {
                console.error('Failed to load history:', error)
            }
        }
    }, [])

    // 保存历史记录
    const saveToHistory = (data: Omit<HistoryItem, 'id' | 'timestamp'>) => {
        const newItem: HistoryItem = {
            ...data,
            id: Date.now().toString(),
            timestamp: new Date().toLocaleString('zh-CN'),
        }

        const updatedHistory = [newItem, ...historyList.slice(0, 19)]
        setHistoryList(updatedHistory)
        setCurrentHistoryId(newItem.id)
        localStorage.setItem('governance-history', JSON.stringify(updatedHistory))
    }

    // 加载历史记录项
    const loadHistoryItem = (item: HistoryItem) => {
        setNaturalText(item.naturalText)
        setDocumentType(item.documentType)
        setStructuredFields(item.structuredFields)
        setJsonOutput(item.jsonOutput)
        setCurrentHistoryId(item.id)
    }

    // 删除历史记录项
    const deleteHistoryItem = (id: string, event: React.MouseEvent) => {
        event.stopPropagation()
        const updatedHistory = historyList.filter(item => item.id !== id)
        setHistoryList(updatedHistory)
        localStorage.setItem('governance-history', JSON.stringify(updatedHistory))

        if (currentHistoryId === id) {
            setCurrentHistoryId(null)
        }
    }

    // 新建对话
    const startNewChat = () => {
        setNaturalText('')
        setDocumentType('入院记录')
        setStructuredFields([])
        setJsonOutput('')
        setCurrentHistoryId(null)
    }

    // 处理文档类型选择
    const handleDocumentTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedType = e.target.value
        setDocumentType(selectedType)

        // 检查是否为支持的文档类型
        if (selectedType !== '入院记录' && selectedType !== '出院记录') {
            message.error('该文档类型尚未开放')
        }
    }

    // 文档类型映射
    const getDocumentTypeId = (type: string): number => {
        const typeMapping: { [key: string]: number } = {
            入院记录: 1,
            出院记录: 2,
            胃部MR报告: 3,
            '胃部MR-git报告': 4,
            病理报告: 5,
            病理报告jlit: 6,
        }
        return typeMapping[type] || 1
    }

    // 入院记录字段映射
    const getAdmissionFieldMapping = (): { [key: string]: string } => {
        return {
            id: '主键ID',
            admission_id: '关联入院记录id',
            registration_number: '注册号',
            present_illness: '现病史',
            present_illness_wjjc: '胃镜检查',
            present_illness_hjblzd: '活检病理诊断',
            past_history: '既往史',
            Personal_history: '个人史',
            hyyj_history: '婚育史',
            family_history: '家族史',
            review_systems: '系统回顾',
            auxiliary_examination: '辅助检查',
            Medical_history_summary: '历史报告汇总',
            asjmx_assessment: '深静脉血栓评估',
            asjmx_assessment_fs: '深静脉血栓评估分数',
            asjmx_assessment_jb: '深静脉血栓评估级别',
            auxiliary_examination_sfyw: '辅助检查-是否外院就诊',
            auxiliary_examination_wjjc: '辅助检查-胃镜检查',
            auxiliary_examination_bljc: '辅助检查-病理活检',
            auxiliary_examination_ctzq: '辅助检查-胃CT',
            Physical_examination: '体格检查',
            Physical_examination_tw: '体格检查-体温',
            Physical_examination_mb: '体格检查-脉搏',
            Physical_examination_hx: '体格检查-呼吸',
            Physical_examination_xl: '体格检查-心率',
            Physical_examination_xy: '体格检查-血压',
            Physical_examination_fyqk: '体格检查-发育情况',
            Physical_examination_yyqk: '体格检查-营养情况',
            Physical_examination_pfnm: '体格检查-皮肤黏膜',
            Physical_examination_qsnm: '体格检查-全身黏膜',
            Physical_examination_qblbj: '体格检查-浅表淋巴结',
            Physical_examination_qslbj: '体格检查-全身淋巴结',
            Physical_examination_tbtj: '体格检查-头部头颈',
            Physical_examination_yj: '体格检查-眼睑',
            Physical_examination_gm: '体格检查-巩膜',
            Physical_examination_sctk: '体格检查-双侧瞳孔',
            Physical_examination_sgfs: '体格检查-双光反射',
            Physical_examination_we: '体格检查-外耳',
            Physical_examination_rtq: '体格检查-乳突区',
            Physical_examination_wb: '体格检查-外鼻',
            Physical_examination_btq: '体格检查-鼻通气',
            Physical_examination_bqt: '体格检查-鼻前庭',
            Physical_examination_kc: '体格检查-口唇',
            Physical_examination_ss: '体格检查-申舌',
            Physical_examination_ybnm: '体格检查-咽部黏膜',
            Physical_examination_btt: '体格检查-扁桃体',
            Physical_examination_jb: '体格检查-颈部',
            Physical_examination_jzx: '体格检查-甲状腺',
            Physical_examination_xb: '体格检查-胸部',
            Physical_examination_hxyd: '体格检查-呼吸运动',
            speciality_examination: '专科检查',
            speciality_examination_f: '专科检查-腹',
            speciality_examination_jtx: '专科检查-剑突下',
            speciality_examination_qf: '专科检查-全腹',
            speciality_examination_fj: '专科检查-腹肌',
            family_history_fmqk: '家族史-父母情况',
            family_history_xdjm: '家族史-兄弟姐妹情况',
            hyyj_history_zvjk: '婚育史-子女健康情况',
            hyyj_history_poqk: '婚育史-配偶健康情况',
            Personal_history_xys: '个人史-吸烟史',
            Personal_history_yjs: '个人史-饮酒史',
            Personal_history_yws: '个人史-药物史',
            Personal_history_yys: '个人史-冶游史',
            past_history_jkzk: '既往史-健康状况',
            past_history_crbs: '既往史-传染病史',
            past_history_gxy: '既往史-高血压',
            past_history_sss: '既往史-手术史',
            past_history_wss: '既往史-外伤史',
            past_history_sxs: '既往史-输血史',
            past_history_gms: '既往史-过敏史',
            present_illness_ctzq: '现病史-CT增强',
            present_illness_sfhl: '现病史-是否化疗',
            present_illness_hlfa: '现病史-化疗方案',
            present_illness_hlzq: '现病史-化疗周期',
            present_illness_jszt: '现病史-精神状态',
            present_illness_tlqk: '现病史-体力情况',
            present_illness_sysl: '现病史-食欲食量',
            present_illness_smqk: '现病史-睡眠情况',
            present_illness_tzqk: '现病史-体重情况',
            present_illness_dbqk: '现病史-大便情况',
            present_illness_xbqk: '现病史-小便情况',
            asjmx_assessment_cs: '深静脉血栓评估措施',
        }
    }

    // 出院记录字段映射
    const getDischargeFieldMapping = (): { [key: string]: string } => {
        return {
            id: '主键或记录唯一标识',
            empi: '患者主索引标识',
            registration_number: '挂号号或住院登记号',
            disease_admission_datetime: '入院时间',
            Admission_status: '入院状态',
            Admission_status_code: '入院状态编码',
            admission_diagnosis: '入院诊断',
            Diagnosis_treatment: '诊疗经过',
            Signs_at_discharge: '出院症状',
            Discharge_status: '出院状态',
            discharge_diagnosis_code: '出院诊断编码（如ICD-10编码）',
            discharge_diagnosis_name: '出院诊断',
            discharge_date: '出院时间',
            discharge_order: '出院带药（患者出院时带药的医嘱或药品列表）',
            record_date: '记录时间（该出院记录的创建或录入时间）',
            pathologic_diagnosis: '病理诊断',
            '24out_discharge': '24小时内出院情况说明',
        }
    }

    // 根据文档类型获取字段映射
    const getFieldMapping = (docType: string): { [key: string]: string } => {
        switch (docType) {
            case '入院记录':
                return getAdmissionFieldMapping()
            case '出院记录':
                return getDischargeFieldMapping()
            default:
                return {}
        }
    }

    const processStructuredData = async () => {
        if (!naturalText.trim()) {
            message.error('请输入文档内容')
            return
        }

        // 检查文档类型是否为支持的类型
        if (documentType !== '入院记录' && documentType !== '出院记录') {
            message.error('该文档类型尚未开放，无法进行治理')
            return
        }

        setIsLoading(true)
        setGovernanceProgress(0)
        setGovernanceStage('初始化治理流程...')

        try {
            // 模拟治理进度
            const progressStages = [
                { progress: 10, stage: '解析文档结构...', delay: 1500 },
                { progress: 25, stage: '提取关键信息...', delay: 2000 },
                { progress: 45, stage: '数据标准化处理...', delay: 2500 },
                { progress: 65, stage: '字段映射转换...', delay: 2000 },
                { progress: 80, stage: '质量检查验证...', delay: 2200 },
                { progress: 95, stage: '生成治理结果...', delay: 1800 },
            ]

            // 逐步更新进度
            for (const { progress, stage, delay } of progressStages) {
                await new Promise(resolve => setTimeout(resolve, delay))
                setGovernanceProgress(progress)
                setGovernanceStage(stage)
            }
            // 调用数据治理接口
            const response = await fetch('http://10.90.10.13:8999/dataGov/governance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text: naturalText,
                    text_type: getDocumentTypeId(documentType),
                }),
            })

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const result = await response.json()

            if (result.status === 'success') {
                const data = result.data

                // 将返回的数据转换为结构化字段
                const extractedFields: StructuredField[] = []
                if (typeof data === 'object' && data !== null) {
                    const fieldMapping = getFieldMapping(documentType)
                    Object.entries(data).forEach(([key, value]) => {
                        // 如果有字段映射，使用中文名称，否则使用原字段名
                        const displayLabel = fieldMapping[key] || key
                        extractedFields.push({
                            label: displayLabel,
                            value: String(value),
                        })
                    })
                }

                setStructuredFields(extractedFields)
                setJsonOutput(JSON.stringify(data, null, 2))

                // 保存到历史记录
                saveToHistory({
                    title: naturalText.slice(0, 30) + (naturalText.length > 30 ? '...' : ''),
                    naturalText,
                    documentType,
                    structuredFields: extractedFields,
                    jsonOutput: JSON.stringify(data, null, 2),
                })

                setGovernanceProgress(100)
                setGovernanceStage('治理完成')

                // 延迟一下让用户看到100%完成状态
                await new Promise(resolve => setTimeout(resolve, 500))

                message.success(result.message || '文档处理成功！')
            } else {
                throw new Error(result.message || '处理失败')
            }
        } catch (error) {
            console.error('处理失败:', error)
            message.error(`处理失败：${error instanceof Error ? error.message : '未知错误'}`)
        } finally {
            setIsLoading(false)
            setGovernanceProgress(0)
            setGovernanceStage('')
        }
    }

    return (
        <>
            <div className={styles.dataStructuring}>
                {/* 左侧边栏 - 新建对话和历史记录 */}
                <div className={styles.sidebar}>
                    {/* 侧边栏头部 */}
                    <div className={styles.sidebarHeader}>
                        <h1 className={styles.appTitle}>数据治理平台</h1>
                        <button className={styles.newChatBtn} onClick={startNewChat}>
                            <span className={styles.plusIcon}>+</span>
                            新建对话
                        </button>
                    </div>

                    {/* 历史记录列表 */}
                    <div className={styles.historySection}>
                        <div className={styles.historyHeader}>
                            <h3>历史记录</h3>
                        </div>
                        <div className={styles.historyList}>
                            {historyList.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <div className={styles.emptyIcon}>💬</div>
                                    <p>暂无对话记录</p>
                                </div>
                            ) : (
                                historyList.map(item => (
                                    <div
                                        key={item.id}
                                        className={`${styles.historyItem} ${currentHistoryId === item.id ? styles.active : ''}`}
                                        onClick={() => loadHistoryItem(item)}
                                    >
                                        <div className={styles.historyContent}>
                                            <div className={styles.historyTitle}>{item.title}</div>
                                            <div className={styles.historyMeta}>
                                                <span className={styles.historyType}>
                                                    {item.documentType}
                                                </span>
                                                <span className={styles.historyTime}>
                                                    {item.timestamp}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={e => deleteHistoryItem(item.id, e)}
                                            title='删除'
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* 中间内容区 - 自然语言输入 */}
                <div className={styles.middleContent}>
                    <div className={styles.inputPanel}>
                        <div className={styles.panelHeader}>
                            <h2>自然语言输入</h2>
                            <div className={styles.documentTypeSelector}>
                                <label>文档类型：</label>
                                <select
                                    value={documentType}
                                    onChange={handleDocumentTypeChange}
                                    className={styles.typeSelect}
                                >
                                    <option value='入院记录'>入院记录</option>
                                    <option value='出院记录'>出院记录</option>
                                    <option value='胃部MR报告'>胃部MR报告</option>
                                    <option value='胃部MR-git报告'>胃部MR-git报告</option>
                                    <option value='病理报告'>病理报告</option>
                                    <option value='病理报告jlit'>病理报告jlit</option>
                                </select>
                            </div>
                        </div>
                        <div className={styles.panelContent}>
                            <textarea
                                value={naturalText}
                                onChange={e => setNaturalText(e.target.value)}
                                placeholder='请输入需要治理的自然语言文本...'
                                className={styles.textInput}
                            />
                            <div className={styles.actionButtons}>
                                <button
                                    onClick={processStructuredData}
                                    disabled={isLoading}
                                    className={styles.primaryBtn}
                                >
                                    {isLoading ? '治理中...' : '开始治理'}
                                </button>
                            </div>

                            {/* 治理进度 */}
                            {isLoading && (
                                <div className={styles.progressContainer}>
                                    <div className={styles.progressHeader}>
                                        <span className={styles.progressTitle}>治理进度</span>
                                        <span className={styles.progressStage}>
                                            {governanceStage}
                                        </span>
                                    </div>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={styles.progressFill}
                                            style={{ width: `${governanceProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 右侧内容区 - 结构化字段输出 */}
                <div className={styles.rightContent}>
                    <div className={styles.outputPanel}>
                        <div className={styles.panelHeader}>
                            <h2>结构化字段</h2>
                            {structuredFields.length > 0 && (
                                <div className={styles.fieldCount}>
                                    {structuredFields.length} 个字段
                                </div>
                            )}
                        </div>
                        <div className={styles.panelContent}>
                            {structuredFields.length === 0 ? (
                                <div className={styles.emptyOutput}>
                                    <div className={styles.emptyIcon}>📋</div>
                                    <p>结构化字段将在这里显示</p>
                                    <span>输入自然语言文本并点击"开始治理"</span>
                                </div>
                            ) : (
                                <div className={styles.fieldsContainer}>
                                    <div className={styles.fieldsGrid}>
                                        {structuredFields.map((field, index) => (
                                            <div key={index} className={styles.fieldItem}>
                                                <label className={styles.fieldLabel}>
                                                    {field.label}
                                                </label>
                                                <div className={styles.fieldValue}>
                                                    {field.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {jsonOutput && (
                                        <div className={styles.jsonOutput}>
                                            <div className={styles.jsonHeader}>
                                                <span>JSON 输出</span>
                                                <button
                                                    onClick={() =>
                                                        navigator.clipboard.writeText(
                                                            jsonOutput
                                                        )
                                                    }
                                                    className={styles.copyBtn}
                                                    title='复制JSON'
                                                >
                                                    📋
                                                </button>
                                            </div>
                                            <pre className={styles.jsonContent}>
                                                {jsonOutput}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default DataStructuring
