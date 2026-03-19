import React, { useState, useEffect, useRef } from 'react'
import { Layout as AntLayout, Menu, Avatar, Badge, Dropdown, message } from 'antd'
import {
  HomeOutlined,
  BookOutlined,
  DatabaseOutlined,
  ExperimentOutlined,
  RobotOutlined,
  BarChartOutlined,
  FileTextOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SearchOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  SwitcherOutlined
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'

const { Header, Sider, Content } = AntLayout

const Layout = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [hearts, setHearts] = useState([])
  const heartsRef = useRef([])

  // 清除爱心
  useEffect(() => {
    if (hearts.length > 0) {
      const timer = setTimeout(() => {
        setHearts([])
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [hearts])

  // 双击小草触发爱心特效
  const handleGrassDoubleClick = () => {
    const newHearts = []
    for (let i = 0; i < 30; i++) {
      newHearts.push({
        id: Date.now() + i,
        left: Math.random() * 100, // 随机水平位置
        delay: Math.random() * 2, // 随机延迟
        duration: 1 + Math.random() * 2, // 随机持续时间
        size: 20 + Math.random() * 30 // 随机大小
      })
    }
    setHearts(newHearts)
  }

  useEffect(() => {
    // 获取当前用户
    axios.get('http://localhost:3001/api/user/profile').then(res => {
      setUser(res.data.data)
    }).catch(err => {
      console.error('获取用户信息失败:', err)
      // 默认用户
      setUser({ id: 1, name: '王老师', avatar: '王', school: '第一中学' })
    })

    // 获取用户列表
    axios.get('http://localhost:3001/api/user/list').then(res => {
      setUsers(res.data.data)
    }).catch(err => {
      console.error('获取用户列表失败:', err)
    })
  }, [])

  const menuItems = [
    { key: '/teacher/home', icon: <HomeOutlined />, label: '首页' },
    { key: '/teacher/lesson-plans', icon: <BookOutlined />, label: '备课中心' },
    { key: '/teacher/knowledge', icon: <DatabaseOutlined />, label: '知识点库' },
    { key: '/teacher/questions', icon: <DatabaseOutlined />, label: '智能题库' },
    { key: '/teacher/exam-paper', icon: <FileTextOutlined />, label: '智能组卷' },
    { key: '/teacher/experiments', icon: <ExperimentOutlined />, label: '虚拟实验' },
    { key: '/teacher/ai-assistant', icon: <RobotOutlined />, label: 'AI 助手' },
    { key: '/teacher/analysis', icon: <BarChartOutlined />, label: '学情分析' }
  ]

  // 用户下拉菜单
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate('/teacher/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '账户设置',
      onClick: () => message.info('功能开发中...')
    },
    { type: 'divider' },
    {
      key: 'switch',
      icon: <SwitcherOutlined />,
      label: '切换用户',
      children: users.map(u => ({
        key: u.id,
        label: u.name,
        icon: <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>{u.avatar || u.name.charAt(0)}</Avatar>,
        onClick: async () => {
          try {
            const res = await axios.post('http://localhost:3001/api/user/switch', { userId: u.id })
            setUser(res.data.data)
            message.success(`已切换到 ${u.name}`)
          } catch (err) {
            message.error('切换失败')
          }
        }
      }))
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => message.info('功能开发中...')
    }
  ]

  // 获取个性化问候语
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

  if (!user) {
    return (
      <div style={{ padding: 50, textAlign: 'center' }}>
        <h1>加载中...</h1>
      </div>
    )
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme="light" 
        style={{ 
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          zIndex: 10,
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0',
          flexShrink: 0
        }}>
          {collapsed ? (
            <span style={{ fontSize: 24 }}>🧬</span>
          ) : (
            <h2 style={{ margin: 0, color: '#1890ff' }}>天天向上</h2>
          )}
        </div>
        {/* 菜单区域 - 可滚动 */}
        <div style={{ 
          flex: 1,
          overflow: 'auto',
          overflowX: 'hidden',
          minHeight: 0,
          paddingBottom: '80px' // 为底部小草预留空间
        }}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ borderRight: 0 }}
          />
        </div>
        
        {/* 底部装饰图片 - 固定在侧边栏最下方，使用绝对定位 */}
        <div style={{ 
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: collapsed ? '8px 4px' : '16px 8px',
          textAlign: 'center',
          borderTop: collapsed ? 'none' : '1px solid #f0f0f0ff',
          background: collapsed ? 'transparent' : 'linear-gradient(to bottom, transparent, #f9f9f9)',
          cursor: 'pointer'
        }}
        onDoubleClick={handleGrassDoubleClick}
        >
          {/* SVG 小草图标 */}
          <svg 
            width={collapsed ? 60 : 180} 
            height={collapsed ? 60 : 180} 
            viewBox="0 0 100 100"
            style={{
              animation: 'grow 10s ease-in-out infinite',
              transition: 'all 0.3s ease'
            }}
          >
              {/* 草叶 1 */}
              <path 
                d="M50 90 Q50 60 30 40 Q20 30 15 25 Q25 30 35 40 Q50 60 50 90" 
                fill="#4CAF50"
                opacity="0.9"
              />
              {/* 草叶 2 */}
              <path 
                d="M50 90 Q50 55 55 35 Q60 20 65 15 Q60 25 55 40 Q50 60 50 90" 
                fill="#66BB6A"
                opacity="0.8"
              />
              {/* 草叶 3 */}
              <path 
                d="M50 90 Q50 65 70 45 Q80 35 85 30 Q75 40 65 50 Q50 70 50 90" 
                fill="#81C784"
                opacity="0.85"
              />
              {/* 草茎 */}
              <line 
                x1="50" 
                y1="90" 
                x2="50" 
                y2="50" 
                stroke="#4CAF50" 
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <style>
              {`
                @keyframes grow {
                  0%, 100% {
                    transform: scaleY(1) translateY(0);
                  }
                  50% {
                    transform: scaleY(1.5) translateY(-3px);
                  }
                }
              `}
            </style>
          </div>
      </Sider>
      
      {/* 爱心特效 */}
      {hearts.map(heart => (
        <div
          key={heart.id}
          style={{
            position: 'fixed',
            left: `${heart.left}%`,
            bottom: '-50px',
            fontSize: `${heart.size}px`,
            color: '#ff4444',
            pointerEvents: 'none',
            zIndex: 9999,
            animation: `heartFloat ${heart.duration}s ease-out ${heart.delay}s forwards`
          }}
        >
          ❤️
        </div>
      ))}
      
      <style>
        {`
          @keyframes heartFloat {
            0% {
              transform: translateY(0) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(-100vh) rotate(360deg);
              opacity: 0;
            }
          }
        `}
      </style>
      
      <AntLayout style={{ 
        marginLeft: collapsed ? 80 : 200,
        transition: 'margin-left 0.2s'
      }}>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 9,
          position: 'sticky',
          top: 0,
          left: 0,
          right: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
              style: { fontSize: 18, cursor: 'pointer' }
            })}
            <div style={{ 
              marginLeft: 16, 
              display: 'flex', 
              alignItems: 'center',
              background: '#f5f5f5',
              padding: '4px 12px',
              borderRadius: 20
            }}>
              <SearchOutlined style={{ color: '#999' }} />
              <input 
                placeholder="搜索知识点、题目、实验..." 
                style={{ 
                  border: 'none', 
                  background: 'transparent', 
                  marginLeft: 8,
                  outline: 'none',
                  width: 200
                }} 
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Badge count={3} size="small">
              <BellOutlined style={{ fontSize: 18, color: '#666', cursor: 'pointer' }} />
            </Badge>
            
            <Dropdown 
              menu={{ items: userMenuItems }} 
              trigger={['click']}
              placement="bottomRight"
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 4,
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Avatar style={{ backgroundColor: '#1890ff' }}>
                  {user.avatar || user.name.charAt(0)}
                </Avatar>
                <span style={{ color: '#666' }}>{user.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: '#fff',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  )
}

export default Layout
