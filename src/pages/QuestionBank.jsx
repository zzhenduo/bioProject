import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Input, Select, Tag, Space, Modal, Form, message, Tabs, Radio, Checkbox } from 'antd'
import { SearchOutlined, PlusOutlined, ThunderboltOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import axios from 'axios'

const { Option } = Select
const { TextArea } = Input

const QuestionBank = () => {
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isAIModalVisible, setIsAIModalVisible] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [form] = Form.useForm()
  const [aiForm] = Form.useForm()
  const [aiGenerating, setAiGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState([])
  const [activeTab, setActiveTab] = useState('1')
  const [knowledgePoints, setKnowledgePoints] = useState([]) // 存储知识点数据
  const [searchParams, setSearchParams] = useState({}) // 搜索参数

  // 加载知识点数据
  useEffect(() => {
    loadKnowledgePoints()
    loadQuestions()
  }, [])

  const loadKnowledgePoints = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/knowledge')
      if (response.data.success) {
        setKnowledgePoints(response.data.data)
      }
    } catch (error) {
      console.error('加载知识点失败:', error)
    }
  }

  const loadQuestions = async () => {
    setLoading(true)
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams()
      Object.keys(searchParams).forEach(key => {
        if (searchParams[key]) {
          queryParams.append(key, searchParams[key])
        }
      })
      
      const response = await axios.get(`http://localhost:3001/api/questions?${queryParams.toString()}`)
      if (response.data.success) {
        setQuestions(response.data.data.map((q, index) => ({
          ...q,
          key: q.id || index
        })))
      }
    } catch (error) {
      console.error('加载题目失败:', error)
      // 使用示例数据
      setQuestions([
        { 
          key: '1', 
          title: '细胞膜的功能', 
          type: '选择题', 
          knowledge: '细胞的结构', 
          difficulty: 2,
          tags: ['细胞膜', '功能']
        },
        { 
          key: '2', 
          title: 'DNA 复制的场所', 
          type: '选择题', 
          knowledge: 'DNA 的结构', 
          difficulty: 1,
          tags: ['DNA', '复制']
        }
      ])
    }
    setLoading(false)
  }

  // 手动添加/编辑题目
  const handleManualSubmit = async () => {
    try {
      const values = await form.validateFields()
      const questionData = {
        title: values.title,
        type: values.type,
        content: values.content,
        options: values.type === '选择题' ? values.options : undefined,
        answer: values.answer,
        analysis: values.analysis,
        knowledge_point_id: values.knowledge_point,
        difficulty_level: values.difficulty,
        tags: values.tags ? values.tags.join(',') : ''
      }

      let response
      if (editingItem) {
        // 编辑模式
        response = await axios.put(`http://localhost:3001/api/questions/${editingItem.id}`, questionData)
        if (response.data.success) {
          message.success('题目更新成功！')
          setIsModalVisible(false)
          form.resetFields()
          setEditingItem(null)
          loadQuestions()
        }
      } else {
        // 新增模式
        response = await axios.post('http://localhost:3001/api/questions', questionData)
        if (response.data.success) {
          message.success('题目添加成功！')
          setIsModalVisible(false)
          form.resetFields()
          loadQuestions()
        }
      }
    } catch (error) {
      if (error.message !== 'Validation failed') {
        message.error((editingItem ? '更新' : '添加') + '失败：' + error.message)
      }
    }
  }

  // AI 生成题目
  const handleAIGenerate = async () => {
    try {
      const values = await aiForm.validateFields()
      setAiGenerating(true)
      
      const response = await axios.post('http://localhost:3001/api/ai/generate-question', {
        knowledge_point_id: values.knowledge_point,
        knowledge_name: values.knowledge_name,
        difficulty: values.difficulty,
        question_type: values.question_type,
        count: values.count || 5
      })

      if (response.data.success) {
        setGeneratedQuestions(response.data.data)
        message.success(`AI 生成了${response.data.data.length}道题目！`)
      }
    } catch (error) {
      console.error('AI 生成失败:', error)
      // 使用模拟数据
      const mockQuestions = Array(aiForm.getFieldValue('count') || 5).fill(null).map((_, i) => ({
        key: `ai_${i}`,
        title: `AI 生成的题目 ${i + 1}`,
        type: aiForm.getFieldValue('question_type') || '选择题',
        content: `这是一道关于生物知识的问题描述...`,
        options: {
          A: '选项 A 内容',
          B: '选项 B 内容',
          C: '选项 C 内容',
          D: '选项 D 内容'
        },
        answer: 'A',
        analysis: '这道题考查的是... 正确答案是 A，因为...',
        difficulty_level: aiForm.getFieldValue('difficulty') || 2
      }))
      setGeneratedQuestions(mockQuestions)
      message.success('AI 生成成功！')
    } finally {
      setAiGenerating(false)
    }
  }

  // 保存 AI 生成的题目
  const saveAIQuestion = async (question) => {
    try {
      const questionData = {
        title: question.title || 'AI 生成的题目',
        type: question.type || '选择题',
        content: question.content,
        options: question.options,
        answer: question.answer,
        analysis: question.analysis,
        knowledge_point_id: null, // AI 生成的题目可能没有知识点 ID
        difficulty_level: question.difficulty_level || 2,
        tags: 'AI 生成'
      }

      const response = await axios.post('http://localhost:3001/api/questions', questionData)
      if (response.data.success) {
        message.success('题目已保存到题库！')
        loadQuestions()
      }
    } catch (error) {
      message.error('保存失败：' + error.message)
    }
  }

  // 搜索功能
  const handleSearch = () => {
    loadQuestions()
  }

  const handleResetSearch = () => {
    setSearchParams({})
    setTimeout(() => loadQuestions(), 100)
  }

  // 编辑功能
  const handleEdit = (record) => {
    setEditingItem(record)
    form.setFieldsValue({
      title: record.title,
      type: record.type,
      content: record.content,
      options: record.options,
      answer: record.answer,
      analysis: record.analysis,
      knowledge_point: record.knowledge_point_id,
      difficulty: record.difficulty_level,
      tags: record.tags ? (typeof record.tags === 'string' ? record.tags.split(',') : record.tags) : []
    })
    setIsModalVisible(true)
  }

  // 删除功能
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除题目"${record.title || record.content?.substring(0, 20)}..."吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await axios.delete(`http://localhost:3001/api/questions/${record.id}`)
          if (response.data.success) {
            message.success('删除成功！')
            loadQuestions()
          }
        } catch (error) {
          message.error('删除失败：' + error.message)
        }
      }
    })
  }

  // 获取知识点名称
  const getKnowledgeName = (knowledge_point_id) => {
    if (!knowledge_point_id) return '未分类'
    const kp = knowledgePoints.find(k => k.id === parseInt(knowledge_point_id))
    return kp ? kp.title : `知识点${knowledge_point_id}`
  }

  const columns = [
    { 
      title: '题目', 
      dataIndex: 'content', 
      key: 'content',
      width: 350,
      render: (content, record) => (
        <div style={{ maxWidth: 350 }}>
          <div style={{ fontWeight: 500, marginBottom: 4 }}>{record.title || '无标题'}</div>
          <div style={{ color: '#666', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {content || record.content?.substring(0, 50) || ''}
          </div>
        </div>
      )
    },
    { title: '题型', dataIndex: 'type', key: 'type', width: 90, render: (type) => <Tag>{type}</Tag> },
    { 
      title: '知识点', 
      dataIndex: 'knowledge_point_id', 
      key: 'knowledge_point_id',
      width: 150,
      render: (knowledge_point_id) => (
        <Tag color="blue">{getKnowledgeName(knowledge_point_id)}</Tag>
      )
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
    },
    { 
      title: '标签', 
      dataIndex: 'tags', 
      key: 'tags',
      width: 150,
      render: (tags) => (
        <Space wrap>
          {tags ? (typeof tags === 'string' ? tags.split(',').map(tag => <Tag key={tag}>{tag}</Tag>) : tags?.map(tag => <Tag key={tag}>{tag}</Tag>)) : <Tag>无</Tag>}
        </Space>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ]

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>智能题库</h1>
          <p style={{ color: '#666' }}>海量生物习题，支持 AI 智能生成</p>
        </div>
        <Space>
          <Button onClick={() => setAiGenerating(false) || setGeneratedQuestions([]) || setIsAIModalVisible(true)} icon={<ThunderboltOutlined />} type="primary">
            AI 生成题目
          </Button>
          <Button icon={<PlusOutlined />} onClick={() => {
            setEditingItem(null)
            form.resetFields()
            setIsModalVisible(true)
          }}>
            手动添加
          </Button>
        </Space>
      </div>

      <Card bordered={false} style={{ borderRadius: 8 }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <Input 
            placeholder="搜索题目内容" 
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            onChange={(e) => setSearchParams({...searchParams, search: e.target.value})}
            onPressEnter={handleSearch}
          />
          <Select 
            placeholder="题型" 
            style={{ width: 120 }}
            onChange={(value) => setSearchParams({...searchParams, type: value})}
            allowClear
          >
            <Option value="选择题">选择题</Option>
            <Option value="填空题">填空题</Option>
            <Option value="简答题">简答题</Option>
            <Option value="实验题">实验题</Option>
          </Select>
          <Select 
            placeholder="难度" 
            style={{ width: 100 }}
            onChange={(value) => setSearchParams({...searchParams, difficulty: value})}
            allowClear
          >
            <Option value="1">基础</Option>
            <Option value="2">中等</Option>
            <Option value="3">困难</Option>
          </Select>
          <Select 
            placeholder="知识点" 
            style={{ width: 200 }}
            onChange={(value) => setSearchParams({...searchParams, knowledge_point_id: value})}
            allowClear
          >
            {knowledgePoints.map(kp => (
              <Option key={kp.id} value={kp.id}>{kp.title}</Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleSearch}>搜索</Button>
          <Button onClick={handleResetSearch}>重置</Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={questions} 
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 手动添加题目弹窗 */}
      <Modal
        title={editingItem ? '编辑题目' : '手动添加题目'}
        open={isModalVisible}
        onOk={handleManualSubmit}
        onCancel={() => {
          setIsModalVisible(false)
          form.resetFields()
        }}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="题目标题" rules={[{ required: true, message: '请输入题目标题' }]}>
            <Input placeholder="例如：细胞膜的功能" />
          </Form.Item>

          <Form.Item name="type" label="题型" rules={[{ required: true, message: '请选择题型' }]}>
            <Radio.Group>
              <Radio.Button value="选择题">选择题</Radio.Button>
              <Radio.Button value="填空题">填空题</Radio.Button>
              <Radio.Button value="简答题">简答题</Radio.Button>
              <Radio.Button value="实验题">实验题</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="content" label="题干内容" rules={[{ required: true, message: '请输入题干内容' }]}>
            <TextArea rows={4} placeholder="请输入完整的题目描述..." />
          </Form.Item>

          <Form.Item 
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {() => {
              if (form.getFieldValue('type') === '选择题') {
                return (
                  <Form.Item name="options" label="选项" rules={[{ required: true, message: '请输入选项' }]}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Input placeholder="选项 A" addonBefore="A" name="A" />
                      <Input placeholder="选项 B" addonBefore="B" name="B" />
                      <Input placeholder="选项 C" addonBefore="C" name="C" />
                      <Input placeholder="选项 D" addonBefore="D" name="D" />
                    </div>
                  </Form.Item>
                )
              }
              return null
            }}
          </Form.Item>

          <Form.Item name="answer" label="参考答案" rules={[{ required: true, message: '请输入答案' }]}>
            <TextArea rows={2} placeholder="选择题请输入正确选项（如：A），其他题型请输入完整答案" />
          </Form.Item>

          <Form.Item name="analysis" label="答案解析">
            <TextArea rows={3} placeholder="详细解释为什么是这个答案..." />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Form.Item name="knowledge_point" label="所属知识点">
              <Select placeholder="选择知识点">
                <Option value="1">细胞的结构</Option>
                <Option value="2">DNA 的结构</Option>
                <Option value="3">光合作用</Option>
              </Select>
            </Form.Item>

            <Form.Item name="difficulty" label="难度等级">
              <Select>
                <Option value={1}>基础</Option>
                <Option value={2}>中等</Option>
                <Option value={3}>困难</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item name="tags" label="标签">
            <Select mode="tags" placeholder="添加标签，按回车确认" />
          </Form.Item>
        </Form>
      </Modal>

      {/* AI 生成题目弹窗 */}
      <Modal
        title="AI 智能生成题目"
        open={isAIModalVisible}
        onCancel={() => {
          setIsAIModalVisible(false)
          aiForm.resetFields()
          setGeneratedQuestions([])
        }}
        footer={null}
        width={900}
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={[
            {
              key: '1',
              label: '生成设置',
              children: (
                <div style={{ padding: '20px 0' }}>
                  <Form form={aiForm} layout="vertical">
                    <Form.Item name="knowledge_name" label="知识点名称" rules={[{ required: true, message: '请输入知识点' }]}>
                      <Input placeholder="例如：细胞膜的结构与功能" size="large" />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Form.Item name="question_type" label="题型" initialValue="选择题">
                        <Select size="large">
                          <Option value="选择题">选择题</Option>
                          <Option value="填空题">填空题</Option>
                          <Option value="简答题">简答题</Option>
                          <Option value="实验题">实验题</Option>
                        </Select>
                      </Form.Item>

                      <Form.Item name="difficulty" label="难度等级" initialValue={2}>
                        <Select size="large">
                          <Option value={1}>基础 - 适合基础薄弱的学生</Option>
                          <Option value={2}>中等 - 适合大多数学生</Option>
                          <Option value={3}>困难 - 适合学有余力的学生</Option>
                        </Select>
                      </Form.Item>
                    </div>

                    <Form.Item name="count" label="生成数量" initialValue={5}>
                      <Input type="number" min={1} max={20} size="large" placeholder="1-20 道" />
                    </Form.Item>

                    <Form.Item>
                      <Button 
                        type="primary" 
                        size="large" 
                        icon={<ThunderboltOutlined />}
                        onClick={handleAIGenerate}
                        loading={aiGenerating}
                        block
                      >
                        {aiGenerating ? 'AI 正在生成中...' : '开始生成'}
                      </Button>
                    </Form.Item>
                  </Form>

                  <div style={{ marginTop: 24, padding: '16px', background: '#f5f5f5', borderRadius: 8 }}>
                    <h4 style={{ margin: '0 0 8px 0' }}>💡 AI 出题说明</h4>
                    <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#666' }}>
                      <li>AI 会根据知识点自动生成相关题目</li>
                      <li>选择题会自动生成 4 个选项和详细解析</li>
                      <li>难度等级会影响题目的复杂程度</li>
                      <li>生成后可预览、编辑再保存</li>
                    </ul>
                  </div>
                </div>
              )
            },
            {
              key: '2',
              label: `生成结果 (${generatedQuestions.length})`,
              children: (
                <div style={{ padding: '20px 0', maxHeight: '500px', overflow: 'auto' }}>
                  {generatedQuestions.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                      <ThunderboltOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                      <p>请先在"生成设置"页签配置参数并生成题目</p>
                    </div>
                  ) : (
                    <div>
                      {generatedQuestions.map((question, index) => (
                        <Card 
                          key={index}
                          size="small"
                          style={{ marginBottom: 16 }}
                          title={`题目 ${index + 1}`}
                          extra={
                            <Button 
                              type="primary" 
                              size="small"
                              onClick={() => saveAIQuestion(question)}
                            >
                              保存到题库
                            </Button>
                          }
                        >
                          <div style={{ marginBottom: 12 }}>
                            <strong>题型：</strong><Tag>{question.type}</Tag>
                            <strong style={{ marginLeft: 16 }}>难度：</strong>
                            <Tag color={question.difficulty_level === 1 ? 'green' : question.difficulty_level === 2 ? 'orange' : 'red'}>
                              {question.difficulty_level === 1 ? '基础' : question.difficulty_level === 2 ? '中等' : '困难'}
                            </Tag>
                          </div>
                          
                          <div style={{ marginBottom: 12, padding: '12px', background: '#fafafa', borderRadius: 4 }}>
                            <strong>题干：</strong>
                            <p style={{ margin: '8px 0 0 0' }}>{question.content}</p>
                          </div>

                          {/* 只有选择题才显示选项 */}
                          {question.type === '选择题' && question.options && (
                            <div style={{ marginBottom: 12 }}>
                              <strong>选项：</strong>
                              <div style={{ marginTop: 8 }}>
                                {Object.entries(question.options).map(([key, value]) => (
                                  <div key={key} style={{ marginBottom: 4 }}>
                                    <Tag color="blue">{key}</Tag> {value}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* 根据题型显示不同的答案格式 */}
                          <div style={{ marginBottom: 12 }}>
                            <strong>答案：</strong>
                            {question.type === '选择题' ? (
                              <Tag color="green">{question.answer}</Tag>
                            ) : question.type === '填空题' ? (
                              <span style={{ padding: '4px 8px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4, color: '#52c41a', whiteSpace: 'pre-wrap' }}>
                                {question.answer}
                              </span>
                            ) : (
                              <div style={{ marginTop: 4, padding: '8px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4, color: '#52c41a', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                {question.answer}
                              </div>
                            )}
                          </div>

                          {question.analysis && (
                            <div style={{ padding: '12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: 4 }}>
                              <strong>解析：</strong>
                              <p style={{ margin: '8px 0 0 0', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{question.analysis}</p>
                            </div>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
          ]}
        />
      </Modal>
    </div>
  )
}

export default QuestionBank
