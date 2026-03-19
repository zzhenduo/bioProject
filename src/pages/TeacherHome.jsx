import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Button, Table, Tag, Progress } from 'antd'
import {
  BookOutlined,
  ExperimentOutlined,
  TeamOutlined,
  TrophyOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const TeacherHome = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // 获取用户信息
    fetch('http://localhost:3001/api/user/profile')
      .then(res => res.json())
      .then(res => setUser(res.data))
      .catch(() => setUser({ name: '王老师' }))

    setStats({
      totalLessons: 15,
      totalStudents: 120,
      averageScore: 78.5,
      completionRate: 85.2
    })
  }, [])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return '夜深了，注意休息 🌙'
    if (hour < 9) return '早上好 ☀️'
    if (hour < 12) return '上午好 🌞'
    if (hour < 14) return '中午好 🍚'
    if (hour < 18) return '下午好 ☕'
    if (hour < 22) return '晚上好 🌆'
    return '夜深了，注意休息 🌙'
  }

  const quickActions = [
    { title: '一键备课', icon: <ThunderboltOutlined />, color: '#1890ff', action: () => navigate('/teacher/lesson-plans'), description: 'AI 智能生成教案' },
    { title: '创建题目', icon: <BookOutlined />, color: '#52c41a', action: () => navigate('/teacher/questions'), description: '手动或 AI 生成题目' },
    { title: '虚拟实验', icon: <ExperimentOutlined />, color: '#faad14', action: () => navigate('/teacher/experiments'), description: '3D 实验模拟' },
    { title: '学情分析', icon: <TeamOutlined />, color: '#722ed1', action: () => navigate('/teacher/analysis'), description: '学生学习数据分析' }
  ]

  const recentLessons = [
    { key: '1', title: '细胞的结构与功能', chapter: '必修一', date: '2024-01-19', status: 'completed' },
    { key: '2', title: 'DNA 的结构', chapter: '必修二', date: '2024-01-18', status: 'completed' },
    { key: '3', title: '光合作用过程', chapter: '必修一', date: '2024-01-17', status: 'in_progress' }
  ]

  const experimentRecommendations = [
    { key: '1', title: '观察植物细胞有丝分裂', usage: 45, difficulty: '中等' },
    { key: '2', title: '绿叶色素提取分离', usage: 38, difficulty: '简单' },
    { key: '3', title: 'DNA 粗提取与鉴定', usage: 25, difficulty: '困难' }
  ]

  const activityData = {
    labels: ['周一', '周二', '周三', '周四', '周五'],
    datasets: [
      { label: '授课班级数', data: [3, 2, 4, 3, 3], borderColor: '#1890ff', backgroundColor: 'rgba(24, 144, 255, 0.1)', tension: 0.3 },
      { label: '学生参与数', data: [45, 38, 52, 41, 48], borderColor: '#52c41a', backgroundColor: 'rgba(82, 196, 26, 0.1)', tension: 0.3 }
    ]
  }

  const knowledgeData = {
    labels: ['细胞结构', '遗传进化', '光合作用', '生态系统', '其他'],
    datasets: [{ data: [25, 30, 20, 15, 10], backgroundColor: ['#1890ff', '#52c41a', '#faad14', '#722ed1', '#f0f0f0'] }]
  }

  const columns = [
    { title: '课程名称', dataIndex: 'title', key: 'title' },
    { title: '章节', dataIndex: 'chapter', key: 'chapter' },
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status) => <Tag color={status === 'completed' ? 'green' : 'blue'}>{status === 'completed' ? '已完成' : '进行中'}</Tag> }
  ]

  if (!user) return <div>加载中...</div>

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>{getGreeting()}，{user.name}！👋</h1>
        <p style={{ color: '#666' }}>今天是个好日子，准备好开始新的教学旅程了吗？</p>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {quickActions.map((action, index) => (
          <Col span={6} key={index}>
            <Card hoverable onClick={action.action} style={{ borderRadius: 8, border: '1px solid #f0f0f0' }} bodyStyle={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: 8, background: `${action.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <span style={{ fontSize: 24, color: action.color }}>{action.icon}</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16 }}>{action.title}</h3>
                  <p style={{ margin: 0, color: '#999', fontSize: 12 }}>{action.description}</p>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card bordered={false} style={{ borderRadius: 8 }}>
              <Statistic title="备课总数" value={stats.totalLessons} prefix={<BookOutlined />} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ borderRadius: 8 }}>
              <Statistic title="学生总数" value={stats.totalStudents} prefix={<TeamOutlined />} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ borderRadius: 8 }}>
              <Statistic title="平均成绩" value={stats.averageScore} suffix="分" prefix={<TrophyOutlined />} valueStyle={{ color: '#faad14' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ borderRadius: 8 }}>
              <Statistic title="完成率" value={stats.completionRate} suffix="%" prefix={<Progress percent={stats.completionRate} type="line" strokeColor="#1890ff" />} valueStyle={{ color: '#722ed1' }} />
            </Card>
          </Col>
        </Row>
      )}

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="近期教学活动" bordered={false} style={{ borderRadius: 8, marginBottom: 16 }}>
            <div style={{ height: 300 }}>
              <Line data={activityData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } } }} />
            </div>
          </Card>
          <Card title="最近备课记录" bordered={false} style={{ borderRadius: 8 }} extra={<Button type="link" onClick={() => navigate('/teacher/lesson-plans')}>查看全部 <ArrowRightOutlined /></Button>}>
            <Table columns={columns} dataSource={recentLessons} pagination={false} size="small" />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="知识点分布" bordered={false} style={{ borderRadius: 8, marginBottom: 16 }}>
            <div style={{ height: 250 }}>
              <Pie data={knowledgeData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
            </div>
          </Card>
          <Card title="推荐实验资源" bordered={false} style={{ borderRadius: 8 }} extra={<Button type="link" onClick={() => navigate('/teacher/experiments')}>更多 <ArrowRightOutlined /></Button>}>
            <Table dataSource={experimentRecommendations} pagination={false} size="small" columns={[
              { title: '实验名称', dataIndex: 'title', key: 'title' },
              { title: '使用次数', dataIndex: 'usage', key: 'usage', render: (usage) => <Tag color="blue">{usage}次</Tag> },
              { title: '难度', dataIndex: 'difficulty', key: 'difficulty', render: (d) => <Tag color={d === '简单' ? 'green' : d === '中等' ? 'orange' : 'red'}>{d}</Tag> }
            ]} />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default TeacherHome
