import React, { useState } from 'react'
import { Row, Col, Card, Button, Input, Slider, Switch, Select, message, Spin, Checkbox, Collapse, Tag } from 'antd'
import {
  FolderOutlined,
  FileTextOutlined,
  SettingOutlined,
  SaveOutlined,
  ExportOutlined,
  ThunderboltOutlined,
  EditOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  BookOutlined
} from '@ant-design/icons'
import axios from 'axios'
import { curriculumData } from '../data/curriculum'

const { TextArea } = Input
const { Option } = Select
const { Panel } = Collapse

const LessonPlanCenter = () => {
  const [selectedChapters, setSelectedChapters] = useState([])
  const [expandedKeys, setExpandedKeys] = useState(['b1', 'b2', 'sb1', 'sb2'])
  const [generatedPlans, setGeneratedPlans] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [settings, setSettings] = useState({
    animationSpeed: 1.0,
    showAnnotations: true,
    viewAngle: 'default',
    difficulty: 2,
    duration: 45
  })

  // 处理节点选择
  const handleCheckChange = (checkedKeys) => {
    setSelectedChapters(checkedKeys)
  }

  // 处理节点展开/折叠
  const handleExpand = (keys) => {
    setExpandedKeys(keys)
  }

  // 递归渲染树节点（带复选框）
  const renderTreeNodes = (nodes, level = 0) => {
    return nodes.map(node => {
      const isLeaf = !node.children || node.children.length === 0
      
      if (isLeaf) {
        return (
          <div 
            key={node.key}
            style={{
              padding: '8px 12px',
              marginLeft: `${level * 20}px`,
              cursor: 'pointer',
              background: selectedChapters.includes(node.key) ? '#e6f7ff' : 'transparent',
              borderRadius: 4,
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center'
            }}
            onClick={() => {
              const newSelected = selectedChapters.includes(node.key)
                ? selectedChapters.filter(k => k !== node.key)
                : [...selectedChapters, node.key]
              setSelectedChapters(newSelected)
            }}
          >
            <Checkbox
              checked={selectedChapters.includes(node.key)}
              onChange={() => {}}
              style={{ marginRight: 8 }}
            />
            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            <span>{node.title}</span>
          </div>
        )
      }

      const isExpanded = expandedKeys.includes(node.key)
      
      return (
        <div key={node.key}>
          <div
            style={{
              padding: '8px 12px',
              marginLeft: `${level * 20}px`,
              cursor: 'pointer',
              background: '#fafafa',
              borderRadius: 4,
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 'bold'
            }}
            onClick={() => {
              const newExpanded = isExpanded
                ? expandedKeys.filter(k => k !== node.key)
                : [...expandedKeys, node.key]
              setExpandedKeys(newExpanded)
            }}
          >
            <span style={{ marginRight: 8, transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▶</span>
            <FolderOutlined style={{ marginRight: 8, color: '#faad14' }} />
            <span>{node.title}</span>
            {node.grade && (
              <Tag color="blue" style={{ marginLeft: 8 }}>{node.grade}</Tag>
            )}
          </div>
          {isExpanded && renderTreeNodes(node.children, level + 1)}
        </div>
      )
    })
  }

  // 获取选中的课程标题
  const getSelectedTitles = () => {
    const titles = []
    const findNode = (nodes, key) => {
      for (const node of nodes) {
        if (node.key === key) {
          titles.push(node.title)
          return true
        }
        if (node.children && findNode(node.children, key)) {
          return true
        }
      }
      return false
    }
    
    selectedChapters.forEach(key => findNode(curriculumData, key))
    return titles
  }

  // 生成教案
  const handleGeneratePlan = async () => {
    if (selectedChapters.length === 0) {
      message.warning('请至少选择一节课')
      return
    }

    setIsGenerating(true)

    try {
      const plans = []
      
      // 批量生成教案
      for (const chapterKey of selectedChapters) {
        // 查找课程标题
        let chapterTitle = ''
        const findTitle = (nodes, key) => {
          for (const node of nodes) {
            if (node.key === key) {
              chapterTitle = node.title
              return true
            }
            if (node.children && findTitle(node.children, key)) {
              return true
            }
          }
          return false
        }
        findTitle(curriculumData, chapterKey)

        try {
          // 调用后端 AI 接口
          const response = await axios.post('http://localhost:3001/api/ai/generate-lesson-plan', {
            chapter: chapterTitle,
            grade_level: '高一',
            duration: settings.duration,
            difficulty: settings.difficulty,
            settings: settings
          })

          if (response.data.success) {
            plans.push({
              key: chapterKey,
              title: chapterTitle,
              ...response.data.data
            })
          }
        } catch (error) {
          console.error(`生成${chapterTitle}教案失败:`, error)
          // 使用本地模拟数据
          const mockPlan = generateMockPlan(chapterTitle, settings)
          plans.push({
            key: chapterKey,
            title: chapterTitle,
            ...mockPlan
          })
        }
      }

      setGeneratedPlans(plans)
      message.success(`成功生成${plans.length}份教案！`)
    } catch (error) {
      console.error('批量生成失败:', error)
      message.error('生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  // 本地模拟数据生成
  const generateMockPlan = (chapter, settings) => {
    return {
      title: `${chapter} 教学设计`,
      chapter: chapter,
      objectives: `1. 理解${chapter}的核心概念
2. 掌握相关实验技能和科学方法
3. 培养科学思维和探究能力
4. 形成生命观念和社会责任意识`,
      content: `# ${chapter} 教学设计

## 一、教材分析
本节内容选自${chapter}，是高中生物的核心知识点之一。

## 二、教学目标
### 1. 生命观念
- 形成结构与功能相适应的观念

### 2. 科学思维
- 运用归纳与概括的方法

### 3. 科学探究
- 设计实验方案

### 4. 社会责任
- 关注生物学知识在生活实践中的应用

## 三、教学重难点
### 重点
- 核心概念的理解和掌握

### 难点
- 抽象概念的具体化

## 四、教学过程
### 环节一：情境导入（5 分钟）
### 环节二：新知探究（20 分钟）
### 环节三：巩固提升（15 分钟）
### 环节四：课堂小结（5 分钟）

## 五、板书设计
## 六、教学反思`,
      activities: [
        { type: 'discussion', title: '小组讨论', duration: '10 分钟' },
        { type: 'experiment', title: '实验观察', duration: '20 分钟' },
        { type: 'quiz', title: '随堂测试', duration: '10 分钟' }
      ],
      resources: [
        { type: 'video', title: '教学视频', url: '#', duration: '5 分钟' },
        { type: 'animation', title: '3D 动画', url: '#', duration: '3 分钟' },
        { type: 'experiment', title: '虚拟实验', url: '#', duration: '15 分钟' }
      ],
      settings: settings
    }
  }

  const handleSave = () => {
    if (generatedPlans.length === 0) {
      message.warning('请先生成教案')
      return
    }
    message.success(`已保存${generatedPlans.length}份教案！`)
  }

  const handleExport = () => {
    if (generatedPlans.length === 0) {
      message.warning('请先生成教案')
      return
    }
    message.success(`已导出${generatedPlans.length}份教案为 PDF！`)
  }

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>备课中心</h1>
          <p style={{ color: '#666' }}>AI 智能生成教案，支持批量备课</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button icon={<SaveOutlined />} onClick={handleSave}>保存全部</Button>
          <Button icon={<ExportOutlined />} onClick={handleExport}>导出全部</Button>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* 左侧：教材目录树 */}
        <Col span={6}>
          <Card 
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>教材目录</span>
                <Tag color="blue">{selectedChapters.length} 节已选</Tag>
              </div>
            }
            bordered={false}
            extra={
              <Button 
                size="small" 
                type="link" 
                onClick={() => setSelectedChapters([])}
              >
                清空选择
              </Button>
            }
            style={{ borderRadius: 8, height: 'calc(100vh - 180px)', overflow: 'auto' }}
          >
            {renderTreeNodes(curriculumData)}
          </Card>
        </Col>

        {/* 中间：AIGC 生成预览区 */}
        <Col span={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>教案预览</span>
                <Button 
                  type="primary" 
                  icon={<ThunderboltOutlined />} 
                  onClick={handleGeneratePlan}
                  loading={isGenerating}
                  size="large"
                  disabled={selectedChapters.length === 0}
                >
                  {isGenerating ? 'AI 生成中...' : `一键生成 (${selectedChapters.length})`}
                </Button>
              </div>
            }
            bordered={false}
            style={{ borderRadius: 8, minHeight: 'calc(100vh - 180px)' }}
          >
            {isGenerating ? (
              <div style={{ padding: '100px 0', textAlign: 'center' }}>
                <Spin size="large" tip="AI 正在生成教案..." />
                <p style={{ marginTop: 16, color: '#999' }}>正在分析教材内容、设计教学活动...</p>
                <p style={{ color: '#666', fontSize: 12 }}>
                  预计生成 {selectedChapters.length} 份教案，请稍候...
                </p>
              </div>
            ) : generatedPlans.length > 0 ? (
              <Collapse accordion>
                {generatedPlans.map((plan, index) => (
                  <Panel 
                    header={
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />{plan.title}</span>
                        <Tag color="green">已生成</Tag>
                      </div>
                    } 
                    key={plan.key || index}
                  >
                    <div style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 16, marginBottom: 8 }}>教学目标</h3>
                      <TextArea 
                        value={plan.objectives}
                        rows={6}
                        readOnly
                        style={{ background: '#fafafa' }}
                      />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 16, marginBottom: 8 }}>教学内容</h3>
                      <TextArea 
                        value={plan.content}
                        rows={20}
                        readOnly
                        style={{ fontFamily: 'monospace', background: '#fafafa' }}
                      />
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <h3 style={{ fontSize: 16, marginBottom: 8 }}>教学活动</h3>
                      {plan.activities.map((activity, i) => (
                        <Card key={i} size="small" style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <strong>{activity.title}</strong>
                            <span style={{ color: '#666' }}>{activity.duration}</span>
                          </div>
                        </Card>
                      ))}
                    </div>

                    <div>
                      <h3 style={{ fontSize: 16, marginBottom: 8 }}>推荐资源</h3>
                      {plan.resources.map((resource, i) => (
                        <Card key={i} size="small" style={{ marginBottom: 8 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                              <strong>{resource.title}</strong>
                              {resource.duration && <span style={{ marginLeft: 8, color: '#999' }}>({resource.duration})</span>}
                            </div>
                            <Button type="link">查看</Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </Panel>
                ))}
              </Collapse>
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '100px 0',
                color: '#999'
              }}>
                <ThunderboltOutlined style={{ fontSize: 64, marginBottom: 16, color: '#1890ff' }} />
                <p style={{ fontSize: 16 }}>从左侧选择要备课的章节（支持多选）</p>
                <p>点击"一键生成"按钮，AI 将批量生成教案</p>
                <div style={{ marginTop: 16, padding: '16px', background: '#f5f5f5', borderRadius: 8, display: 'inline-block' }}>
                  <p style={{ margin: '4px 0', fontSize: 14 }}>💡 使用提示：</p>
                  <p style={{ margin: '4px 0', fontSize: 12 }}>1. 点击章节前的复选框进行选择</p>
                  <p style={{ margin: '4px 0', fontSize: 12 }}>2. 可以跨章节、跨教材选择</p>
                  <p style={{ margin: '4px 0', fontSize: 12 }}>3. 一次最多可选择多节课进行批量备课</p>
                </div>
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧：参数调节面板 */}
        <Col span={6}>
          <Card 
            title={<><SettingOutlined /> 参数设置</>} 
            bordered={false}
            style={{ borderRadius: 8, height: 'calc(100vh - 180px)', overflow: 'auto' }}
          >
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, marginBottom: 12, color: '#666' }}>当前选择</h3>
              <div style={{ maxHeight: 200, overflow: 'auto' }}>
                {selectedChapters.length > 0 ? (
                  getSelectedTitles().map((title, index) => (
                    <Tag key={index} color="blue" style={{ marginBottom: 8, display: 'block' }}>
                      {title}
                    </Tag>
                  ))
                ) : (
                  <p style={{ color: '#999', fontSize: 12 }}>暂无选择</p>
                )}
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, marginBottom: 12, color: '#666' }}>教学参数</h3>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>课时长度（分钟）</label>
                <Input 
                  type="number" 
                  value={settings.duration}
                  onChange={(e) => setSettings({...settings, duration: parseInt(e.target.value) || 45})}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>难度等级</label>
                <Select 
                  value={settings.difficulty}
                  onChange={(value) => setSettings({...settings, difficulty: value})}
                  style={{ width: '100%' }}
                >
                  <Option value={1}>基础 - 适合基础薄弱的学生</Option>
                  <Option value={2}>中等 - 适合大多数学生</Option>
                  <Option value={3}>提高 - 适合学有余力的学生</Option>
                </Select>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, marginBottom: 12, color: '#666' }}>可视化设置</h3>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>
                  动画速度：{settings.animationSpeed}x
                </label>
                <Slider 
                  min={0.5} 
                  max={2} 
                  step={0.1}
                  value={settings.animationSpeed}
                  onChange={(value) => setSettings({...settings, animationSpeed: value})}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8 }}>视角模式</label>
                <Select 
                  value={settings.viewAngle}
                  onChange={(value) => setSettings({...settings, viewAngle: value})}
                  style={{ width: '100%' }}
                >
                  <Option value="default">默认视角</Option>
                  <Option value="macro">宏观视角 - 整体概览</Option>
                  <Option value="micro">微观视角 - 细节展示</Option>
                  <Option value="3d">3D 全景 - 立体呈现</Option>
                </Select>
              </div>

              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label>显示标注</label>
                  <Switch 
                    checked={settings.showAnnotations}
                    onChange={(checked) => setSettings({...settings, showAnnotations: checked})}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: 14, marginBottom: 12, color: '#666' }}>快捷操作</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Button block icon={<BookOutlined />} onClick={() => message.info('功能开发中...')}>查看课标要求</Button>
                <Button block icon={<FileTextOutlined />} onClick={() => message.info('功能开发中...')}>下载教学视频</Button>
                <Button block icon={<FileTextOutlined />} onClick={() => message.info('功能开发中...')}>打开 3D 动画</Button>
                <Button block icon={<FileTextOutlined />} onClick={() => message.info('功能开发中...')}>启动虚拟实验</Button>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default LessonPlanCenter
