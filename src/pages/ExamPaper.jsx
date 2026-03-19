import React, { useState, useEffect } from 'react'
import { Card, Button, Tabs, Form, Input, InputNumber, Select, Checkbox, Table, Space, Tag, Modal, message, Divider, Row, Col, Collapse } from 'antd'
import { ThunderboltOutlined, PlusOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined, CheckCircleOutlined } from '@ant-design/icons'
import axios from 'axios'
import { exportExamPaper, exportAnswerKey } from '../utils/exportExam'

const { Option } = Select
const { TextArea } = Input
const { Panel } = Collapse

const ExamPaper = () => {
  const [activeTab, setActiveTab] = useState('1') // 1: AI 组卷，2: 手动组卷
  const [aiMode, setAiMode] = useState('chapter') // chapter: 章节，knowledge: 知识点
  const [knowledgePoints, setKnowledgePoints] = useState([])
  const [curriculumData, setCurriculumData] = useState([])
  const [selectedChapters, setSelectedChapters] = useState([])
  const [selectedKnowledge, setSelectedKnowledge] = useState([])
  const [aiForm] = Form.useForm()
  const [generating, setGenerating] = useState(false)
  const [generatedPaper, setGeneratedPaper] = useState(null)
  const [questionBank, setQuestionBank] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [manualScores, setManualScores] = useState({
    '选择题': 5,
    '填空题': 5,
    '简答题': 10,
    '实验题': 15
  })
  const [manualPaperTitle, setManualPaperTitle] = useState('')
  const [questionTypeFilter, setQuestionTypeFilter] = useState('选择题') // 默认显示选择题
  const [filterChapter, setFilterChapter] = useState('') // 章节筛选
  const [filterKnowledge, setFilterKnowledge] = useState('') // 知识点筛选

  // 加载知识点和课程数据
  useEffect(() => {
    loadData()
    // 初始化难度比例默认值
    aiForm.setFieldValue('difficulty_ratio', [5, 3, 2])
  }, [])

  const loadData = async () => {
    try {
      // 加载知识点
      const kpResponse = await axios.get('http://localhost:3001/api/knowledge')
      if (kpResponse.data.success) {
        setKnowledgePoints(kpResponse.data.data)
      }

      // 加载课程数据
      const curriculumModule = await import('../data/curriculum')
      setCurriculumData(curriculumModule.curriculumData)

      // 加载题库
      loadQuestionBank()
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const loadQuestionBank = async () => {
    setLoading(true)
    try {
      const response = await axios.get('http://localhost:3001/api/questions')
      if (response.data.success) {
        const questions = response.data.data.map(q => {
          // 解析选项（如果是选择题且 options 是字符串）
          let options = q.options
          if (q.type === '选择题' && typeof q.options === 'string') {
            try {
              options = JSON.parse(q.options)
            } catch (e) {
              console.error('解析选项失败:', e)
            }
          }
          return { ...q, key: q.id, options }
        })
        setQuestionBank(questions)
      }
    } catch (error) {
      console.error('加载题库失败:', error)
    }
    setLoading(false)
  }

  // AI 组卷
  const handleAIGenerate = async () => {
    try {
      const values = await aiForm.validateFields()
      setGenerating(true)

      const difficultyRatio = values.difficulty_ratio || [5, 3, 2]

      const paperData = {
        mode: aiMode,
        chapters: aiMode === 'chapter' ? selectedChapters : [],
        knowledge_points: aiMode === 'knowledge' ? selectedKnowledge : [],
        question_counts: values.question_counts || {},
        question_scores: values.question_scores || {
          '选择题': 5,
          '填空题': 5,
          '简答题': 10,
          '实验题': 15
        },
        difficulty_ratio: difficultyRatio,
        paper_title: values.paper_title
      }

      const response = await axios.post('http://localhost:3001/api/ai/generate-paper', paperData)
      
      if (response.data.success) {
        setGeneratedPaper(response.data.data)
        message.success('AI 组卷成功！')
      }
    } catch (error) {
      console.error('AI 组卷失败:', error)
      message.error('组卷失败：' + error.message)
    } finally {
      setGenerating(false)
    }
  }

  // 手动选题
  const handleQuestionSelect = (questionId) => {
    if (selectedQuestions.includes(questionId)) {
      setSelectedQuestions(selectedQuestions.filter(id => id !== questionId))
    } else {
      setSelectedQuestions([...selectedQuestions, questionId])
    }
  }

  // 生成手动组卷
  const handleManualGenerate = () => {
    if (selectedQuestions.length === 0) {
      message.warning('请至少选择一道题目')
      return
    }

    const paperData = {
      title: manualPaperTitle || '手动组卷',
      question_ids: selectedQuestions,
      question_scores: manualScores
    }

    axios.post('http://localhost:3001/api/paper/manual', paperData).then(response => {
      if (response.data.success) {
        setGeneratedPaper(response.data.data)
        message.success('组卷成功！')
        setActiveTab('3') // 切换到预览标签
      }
    })
  }

  // 导出试卷
  const handleExport = () => {
    if (!generatedPaper) {
      message.warning('没有可导出的试卷')
      return
    }
    exportExamPaper(generatedPaper, knowledgePoints)
    message.success('试卷导出成功！')
  }

  // 导出答案和解析
  const handleExportAnswer = () => {
    if (!generatedPaper) {
      message.warning('没有可导出的答案')
      return
    }
    exportAnswerKey(generatedPaper, knowledgePoints)
    message.success('答案与解析导出成功！')
  }

  // 过滤题目列表
  const filteredQuestionBank = questionBank.filter(q => {
    // 题型筛选
    if (questionTypeFilter && q.type !== questionTypeFilter) {
      return false
    }
    // 章节筛选
    if (filterChapter) {
      const chapter = knowledgePoints.find(k => k.id === parseInt(q.knowledge_point_id))
      if (!chapter || !chapter.chapter.includes(filterChapter)) {
        return false
      }
    }
    // 知识点筛选
    if (filterKnowledge) {
      const kp = knowledgePoints.find(k => k.id === parseInt(q.knowledge_point_id))
      if (!kp || !kp.title.includes(filterKnowledge)) {
        return false
      }
    }
    return true
  })

  // 统计各题型数量
  const questionTypeStats = {
    '选择题': questionBank.filter(q => q.type === '选择题').length,
    '填空题': questionBank.filter(q => q.type === '填空题').length,
    '简答题': questionBank.filter(q => q.type === '简答题').length,
    '实验题': questionBank.filter(q => q.type === '实验题').length
  }

  // 渲染树节点（章节选择）
  const renderTreeNodes = (nodes, level = 0) => {
    return nodes.map(node => {
      const isLeaf = !node.children || node.children.length === 0
      return (
        <div key={node.key} style={{ marginLeft: level * 16, marginBottom: 4 }}>
          {isLeaf ? (
            <div
              onClick={() => {
                const newSelected = selectedChapters.includes(node.key)
                  ? selectedChapters.filter(k => k !== node.key)
                  : [...selectedChapters, node.key]
                setSelectedChapters(newSelected)
              }}
              style={{
                padding: '4px 8px',
                cursor: 'pointer',
                background: selectedChapters.includes(node.key) ? '#e6f7ff' : 'transparent',
                borderRadius: 4
              }}
            >
              <Checkbox checked={selectedChapters.includes(node.key)} />
              <span>{node.title}</span>
            </div>
          ) : (
            <Collapse bordered={false} style={{ background: 'transparent' }}>
              <Panel header={node.title} key={node.key}>
                {renderTreeNodes(node.children, level + 1)}
              </Panel>
            </Collapse>
          )}
        </div>
      )
    })
  }

  const columns = [
    {
      title: '选择',
      key: 'select',
      width: 80,
      render: (_, record) => (
        <Checkbox
          checked={selectedQuestions.includes(record.id)}
          onChange={() => handleQuestionSelect(record.id)}
        />
      )
    },
    {
      title: '题目',
      dataIndex: 'content',
      key: 'content',
      width: 450,
      render: (content, record) => (
        <div style={{ maxWidth: 450 }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.title || '无标题'}</div>
          <div style={{ color: '#666', fontSize: 13, marginBottom: 4 }}>
            {content || ''}
          </div>
          {record.options && typeof record.options === 'object' && (
            <div style={{ fontSize: 13, color: '#1890ff', marginTop: 4 }}>
              {Object.entries(record.options).map(([key, value]) => (
                <div key={key} style={{ marginLeft: 8 }}>
                  {key}. {value}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
    { title: '题型', dataIndex: 'type', key: 'type', width: 90, render: (type) => <Tag>{type}</Tag> },
    {
      title: '知识点',
      dataIndex: 'knowledge_point_id',
      key: 'knowledge_point_id',
      width: 150,
      render: (knowledge_point_id) => {
        const kp = knowledgePoints.find(k => k.id === parseInt(knowledge_point_id))
        return <Tag color="blue">{kp ? kp.title : '未分类'}</Tag>
      }
    },
    {
      title: '难度',
      dataIndex: 'difficulty_level',
      key: 'difficulty_level',
      width: 80,
      render: (difficulty) => {
        const colors = { 1: 'green', 2: 'orange', 3: 'red' }
        const texts = { 1: '基础', 2: '中等', 3: '困难' }
        return <Tag color={colors[difficulty] || 'default'}>{texts[difficulty] || '未知'}</Tag>
      }
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>智能组卷</h1>
        <p style={{ color: '#666' }}>支持 AI 智能组卷和手动选题组卷</p>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* AI 组卷 */}
        <Tabs.TabPane tab="AI 组卷" key="1">
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <Form form={aiForm} layout="vertical">
              <Form.Item label="试卷标题" name="paper_title" rules={[{ required: true, message: '请输入试卷标题' }]}>
                <Input placeholder="例如：高一生物第一次月考" size="large" />
              </Form.Item>

              <Form.Item label="组卷模式" initialValue="chapter">
                <Select
                  size="large"
                  onChange={setAiMode}
                  options={[
                    { value: 'chapter', label: '按章节组卷' },
                    { value: 'knowledge', label: '按知识点组卷' }
                  ]}
                />
              </Form.Item>

              {aiMode === 'chapter' ? (
                <Form.Item label="选择章节" required>
                  <div style={{ border: '1px solid #d9d9d9', borderRadius: 4, padding: 16, maxHeight: 400, overflow: 'auto' }}>
                    {renderTreeNodes(curriculumData)}
                  </div>
                  <div style={{ marginTop: 8, color: '#999' }}>
                    已选择：{selectedChapters.length} 个章节
                  </div>
                </Form.Item>
              ) : (
                <Form.Item label="选择知识点" required>
                  <Select
                    mode="multiple"
                    placeholder="请选择知识点"
                    size="large"
                    onChange={setSelectedKnowledge}
                    style={{ width: '100%' }}
                  >
                    {knowledgePoints.map(kp => (
                      <Option key={kp.id} value={kp.id}>{kp.title}</Option>
                    ))}
                  </Select>
                  <div style={{ marginTop: 8, color: '#999' }}>
                    已选择：{selectedKnowledge.length} 个知识点
                  </div>
                </Form.Item>
              )}

              <Divider>题型设置</Divider>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="选择题数量"
                    name={['question_counts', '选择题']}
                    initialValue={10}
                    rules={[{ required: true, message: '请输入数量' }]}
                  >
                    <InputNumber min={0} max={50} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="选择题每题分数"
                    name={['question_scores', '选择题']}
                    initialValue={5}
                    rules={[{ required: true, message: '请输入分数' }]}
                  >
                    <InputNumber min={1} max={20} style={{ width: '100%' }} addonAfter="分" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="填空题数量"
                    name={['question_counts', '填空题']}
                    initialValue={5}
                    rules={[{ required: true, message: '请输入数量' }]}
                  >
                    <InputNumber min={0} max={50} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="填空题每题分数"
                    name={['question_scores', '填空题']}
                    initialValue={5}
                    rules={[{ required: true, message: '请输入分数' }]}
                  >
                    <InputNumber min={1} max={20} style={{ width: '100%' }} addonAfter="分" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item
                    label="简答题数量"
                    name={['question_counts', '简答题']}
                    initialValue={3}
                    rules={[{ required: true, message: '请输入数量' }]}
                  >
                    <InputNumber min={0} max={20} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="简答题每题分数"
                    name={['question_scores', '简答题']}
                    initialValue={10}
                    rules={[{ required: true, message: '请输入分数' }]}
                  >
                    <InputNumber min={1} max={50} style={{ width: '100%' }} addonAfter="分" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="实验题数量"
                    name={['question_counts', '实验题']}
                    initialValue={2}
                    rules={[{ required: true, message: '请输入数量' }]}
                  >
                    <InputNumber min={0} max={10} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item
                    label="实验题每题分数"
                    name={['question_scores', '实验题']}
                    initialValue={15}
                    rules={[{ required: true, message: '请输入分数' }]}
                  >
                    <InputNumber min={1} max={50} style={{ width: '100%' }} addonAfter="分" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="难度比例（基础：中等：困难）"
                name="difficulty_ratio"
                initialValue={[5, 3, 2]}
                rules={[{ required: true, message: '请设置难度比例' }]}
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <InputNumber
                      addonBefore="基础"
                      min={0}
                      max={10}
                      onChange={(val) => {
                        const currentValues = aiForm.getFieldValue('difficulty_ratio') || [5, 3, 2]
                        const newValues = [val, currentValues[1], currentValues[2]]
                        aiForm.setFieldValue('difficulty_ratio', newValues)
                      }}
                      value={(aiForm.getFieldValue('difficulty_ratio') || [5, 3, 2])[0]}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={8}>
                    <InputNumber
                      addonBefore="中等"
                      min={0}
                      max={10}
                      onChange={(val) => {
                        const currentValues = aiForm.getFieldValue('difficulty_ratio') || [5, 3, 2]
                        const newValues = [currentValues[0], val, currentValues[2]]
                        aiForm.setFieldValue('difficulty_ratio', newValues)
                      }}
                      value={(aiForm.getFieldValue('difficulty_ratio') || [5, 3, 2])[1]}
                      style={{ width: '100%' }}
                    />
                  </Col>
                  <Col span={8}>
                    <InputNumber
                      addonBefore="困难"
                      min={0}
                      max={10}
                      onChange={(val) => {
                        const currentValues = aiForm.getFieldValue('difficulty_ratio') || [5, 3, 2]
                        const newValues = [currentValues[0], currentValues[1], val]
                        aiForm.setFieldValue('difficulty_ratio', newValues)
                      }}
                      value={(aiForm.getFieldValue('difficulty_ratio') || [5, 3, 2])[2]}
                      style={{ width: '100%' }}
                    />
                  </Col>
                </Row>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  icon={<ThunderboltOutlined />}
                  onClick={handleAIGenerate}
                  loading={generating}
                  block
                >
                  {generating ? 'AI 正在组卷中...' : '开始 AI 组卷'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Tabs.TabPane>

        {/* 手动组卷 */}
        <Tabs.TabPane tab="手动组卷" key="2">
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <Input
                  placeholder="请输入试卷名称（例如：高一生物第一次月考）"
                  value={manualPaperTitle}
                  onChange={(e) => setManualPaperTitle(e.target.value)}
                  style={{ width: 400 }}
                  size="large"
                  allowClear
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <span style={{ marginRight: 16 }}>已选：{selectedQuestions.length} 道题</span>
                  <Button onClick={handleManualGenerate} type="primary" icon={<PlusOutlined />}>
                    生成试卷
                  </Button>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span>题型分数设置：</span>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div>
                      <label>选择题:</label>
                      <InputNumber
                        min={1}
                        max={20}
                        value={manualScores['选择题']}
                        onChange={(val) => setManualScores(prev => ({ ...prev, '选择题': val }))}
                        addonAfter="分"
                        style={{ width: 100, marginLeft: 4 }}
                      />
                    </div>
                    <div>
                      <label>填空题:</label>
                      <InputNumber
                        min={1}
                        max={20}
                        value={manualScores['填空题']}
                        onChange={(val) => setManualScores(prev => ({ ...prev, '填空题': val }))}
                        addonAfter="分"
                        style={{ width: 100, marginLeft: 4 }}
                      />
                    </div>
                    <div>
                      <label>简答题:</label>
                      <InputNumber
                        min={1}
                        max={50}
                        value={manualScores['简答题']}
                        onChange={(val) => setManualScores(prev => ({ ...prev, '简答题': val }))}
                        addonAfter="分"
                        style={{ width: 100, marginLeft: 4 }}
                      />
                    </div>
                    <div>
                      <label>实验题:</label>
                      <InputNumber
                        min={1}
                        max={50}
                        value={manualScores['实验题']}
                        onChange={(val) => setManualScores(prev => ({ ...prev, '实验题': val }))}
                        addonAfter="分"
                        style={{ width: 100, marginLeft: 4 }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 题目筛选区域 */}
              <Divider>题目筛选</Divider>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <Space wrap>
                  <span>题型:</span>
                  {['选择题', '填空题', '简答题', '实验题'].map(type => (
                    <Tag
                      key={type}
                      color={questionTypeFilter === type ? 'blue' : 'default'}
                      style={{ cursor: 'pointer', fontSize: 14 }}
                      onClick={() => setQuestionTypeFilter(type)}
                    >
                      {type} ({questionTypeStats[type]})
                    </Tag>
                  ))}
                </Space>
                
                <Select
                  placeholder="按章节筛选"
                  style={{ width: 200 }}
                  value={filterChapter || undefined}
                  onChange={setFilterChapter}
                  allowClear
                >
                  <Option value="必修一">必修一·分子与细胞</Option>
                  <Option value="必修二">必修二·遗传与进化</Option>
                  <Option value="选择性必修一">选择性必修一·稳态与调节</Option>
                </Select>

                <Input
                  placeholder="搜索知识点"
                  value={filterKnowledge}
                  onChange={(e) => setFilterKnowledge(e.target.value)}
                  style={{ width: 200 }}
                  allowClear
                />
              </div>
            </div>

            <Table
              columns={columns}
              dataSource={filteredQuestionBank}
              loading={loading}
              pagination={{ pageSize: 10 }}
              rowKey="id"
              scroll={{ x: 1000 }}
            />
          </Card>
        </Tabs.TabPane>

        {/* 试卷预览 */}
        {generatedPaper && (
          <Tabs.TabPane tab={
            <span><EyeOutlined /> 试卷预览</span>
          } key="3">
            <Card
              bordered={false}
              style={{ borderRadius: 8 }}
              extra={
                <Space>
                  <Button icon={<DownloadOutlined />} onClick={handleExport}>
                    导出试卷
                  </Button>
                  <Button icon={<DownloadOutlined />} onClick={handleExportAnswer} type="primary">
                    导出答案
                  </Button>
                </Space>
              }
            >
              <h2 style={{ textAlign: 'center', marginBottom: 32 }}>{generatedPaper.title}</h2>
              
              {['选择题', '填空题', '简答题', '实验题'].map(type => {
                const questions = generatedPaper.questions.filter(q => q.type === type)
                if (questions.length === 0) return null
                
                // 获取该题型的每题分数
                const scorePerQuestion = generatedPaper.question_scores?.[type] || 5
                
                // 解析选择题的选项
                const processedQuestions = questions.map(q => {
                  let options = q.options
                  if (q.type === '选择题' && typeof q.options === 'string') {
                    try {
                      options = JSON.parse(q.options)
                    } catch (e) {
                      console.error('解析选项失败:', e)
                    }
                  }
                  return { ...q, options }
                })
                
                return (
                  <div key={type} style={{ marginBottom: 32 }}>
                    <h3 style={{ borderBottom: '2px solid #1890ff', paddingBottom: 8 }}>
                      {type}（共{questions.length}题，每题{scorePerQuestion}分，共{questions.length * scorePerQuestion}分）
                    </h3>
                    {processedQuestions.map((q, index) => (
                      <div key={q.id} style={{ marginBottom: 24, padding: 16, background: '#fafafa', borderRadius: 4 }}>
                        <div style={{ fontWeight: 500, marginBottom: 8 }}>
                          {index + 1}. {q.content}
                        </div>
                        {q.options && typeof q.options === 'object' && (
                          <div style={{ marginLeft: 20, marginTop: 8 }}>
                            {Object.entries(q.options).map(([key, value]) => (
                              <div key={key}>{key}. {value}</div>
                            ))}
                          </div>
                        )}
                        <div style={{ marginTop: 8, color: '#999', fontSize: 13 }}>
                          知识点：{knowledgePoints.find(k => k.id === parseInt(q.knowledge_point_id))?.title || '未分类'}
                          {' | '}
                          难度：
                          <Tag color={q.difficulty_level === 1 ? 'green' : q.difficulty_level === 2 ? 'orange' : 'red'}>
                            {q.difficulty_level === 1 ? '基础' : q.difficulty_level === 2 ? '中等' : '困难'}
                          </Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}

              <Divider />
              <div style={{ textAlign: 'center', color: '#999' }}>
                试卷总分：{generatedPaper.total_score} 分
                {' | '}
                题目总数：{generatedPaper.questions.length} 道
              </div>
            </Card>
          </Tabs.TabPane>
        )}

        {/* 答案和解析 */}
        {generatedPaper && (
          <Tabs.TabPane tab={
            <span><CheckCircleOutlined /> 答案与解析</span>
          } key="4">
            <Card
              bordered={false}
              style={{ borderRadius: 8 }}
              extra={
                <Space>
                  <Button icon={<DownloadOutlined />} onClick={handleExport}>
                    导出试卷
                  </Button>
                  <Button icon={<DownloadOutlined />} onClick={handleExportAnswer} type="primary">
                    导出答案
                  </Button>
                </Space>
              }
            >
              <h2 style={{ textAlign: 'center', marginBottom: 32 }}>{generatedPaper.title} - 参考答案与解析</h2>
              
              {['选择题', '填空题', '简答题', '实验题'].map(type => {
                const questions = generatedPaper.questions.filter(q => q.type === type)
                if (questions.length === 0) return null
                
                // 获取该题型的每题分数
                const scorePerQuestion = generatedPaper.question_scores?.[type] || 5
                
                return (
                  <div key={type} style={{ marginBottom: 32 }}>
                    <h3 style={{ borderBottom: '2px solid #52c41a', paddingBottom: 8 }}>
                      {type}答案与解析（共{questions.length}题，每题{scorePerQuestion}分）
                    </h3>
                    {questions.map((q, index) => (
                      <div key={q.id} style={{ marginBottom: 24, padding: 16, background: '#f6ffed', borderRadius: 4, border: '1px solid #b7eb8f' }}>
                        <div style={{ fontWeight: 500, marginBottom: 8 }}>
                          {index + 1}. {q.title || type}
                        </div>
                        
                        {/* 不同题型的答案格式 */}
                        {type === '选择题' && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ color: '#fa8c16', fontWeight: 500, marginBottom: 4 }}>
                              【答案】{q.answer}
                            </div>
                          </div>
                        )}
                        
                        {type === '填空题' && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ color: '#fa8c16', fontWeight: 500, marginBottom: 4 }}>
                              【答案】{q.answer}
                            </div>
                            <div style={{ color: '#666', fontSize: 13 }}>
                              提示：填空题答案中的分号（；）表示不同的填空位置
                            </div>
                          </div>
                        )}
                        
                        {type === '简答题' && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ color: '#fa8c16', fontWeight: 500, marginBottom: 4 }}>
                              【参考答案】
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                              {q.answer}
                            </div>
                          </div>
                        )}
                        
                        {type === '实验题' && (
                          <div style={{ marginBottom: 8 }}>
                            <div style={{ color: '#fa8c16', fontWeight: 500, marginBottom: 4 }}>
                              【参考答案】
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                              {q.answer}
                            </div>
                          </div>
                        )}
                        
                        {/* 解析部分（所有题型都有） */}
                        {q.analysis && (
                          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #b7eb8f' }}>
                            <div style={{ color: '#1890ff', fontWeight: 500, marginBottom: 4 }}>
                              【解析】
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#333' }}>
                              {q.analysis}
                            </div>
                          </div>
                        )}
                        
                        {/* 题目信息 */}
                        <div style={{ marginTop: 8, color: '#999', fontSize: 13 }}>
                          知识点：{knowledgePoints.find(k => k.id === parseInt(q.knowledge_point_id))?.title || '未分类'}
                          {' | '}
                          难度：
                          <Tag color={q.difficulty_level === 1 ? 'green' : q.difficulty_level === 2 ? 'orange' : 'red'}>
                            {q.difficulty_level === 1 ? '基础' : q.difficulty_level === 2 ? '中等' : '困难'}
                          </Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}

              <Divider />
              <div style={{ textAlign: 'center', color: '#999' }}>
                试卷总分：{generatedPaper.total_score} 分
                {' | '}
                题目总数：{generatedPaper.questions.length} 道
              </div>
            </Card>
          </Tabs.TabPane>
        )}
      </Tabs>
    </div>
  )
}

export default ExamPaper
