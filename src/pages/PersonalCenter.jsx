import React, { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Avatar, message, Divider } from 'antd'
import { UserOutlined, SaveOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons'
import axios from 'axios'

const PersonalCenter = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    // 获取用户信息
    axios.get('http://localhost:3001/api/user/profile')
      .then(res => {
        setUser(res.data.data)
        form.setFieldsValue(res.data.data)
      })
      .catch(err => {
        console.error('获取用户信息失败:', err)
        // 默认用户
        const defaultUser = { id: 1, name: '王老师', email: 'wang@school.edu', phone: '13800138001', school: '第一中学' }
        setUser(defaultUser)
        form.setFieldsValue(defaultUser)
      })
  }, [form])

  const handleSave = async (values) => {
    setLoading(true)
    try {
      const res = await axios.put('http://localhost:3001/api/user/profile', {
        userId: user.id,
        ...values
      })
      setUser(res.data.data)
      message.success('个人信息保存成功！')
    } catch (err) {
      message.error('保存失败：' + err.message)
    }
    setLoading(false)
  }

  if (!user) {
    return <div style={{ padding: 50, textAlign: 'center' }}>加载中...</div>
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>个人中心</h1>
        <p style={{ color: '#666' }}>管理您的个人信息和账户设置</p>
      </div>

      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        {/* 个人信息卡片 */}
        <Card 
          title="基本信息" 
          bordered={false}
          style={{ borderRadius: 8, flex: '1 1 400px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar 
              size={100} 
              style={{ 
                backgroundColor: '#1890ff', 
                fontSize: 40,
                marginBottom: 16
              }}
            >
              {user.avatar || user.name.charAt(0)}
            </Avatar>
            <div>
              <h3 style={{ margin: '8px 0', fontSize: 20 }}>{user.name}</h3>
              <p style={{ color: '#666', margin: 0 }}>{user.school}</p>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSave}
          >
            <Form.Item
              name="name"
              label="姓名"
              rules={[{ required: true, message: '请输入姓名' }]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="请输入您的姓名"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="请输入邮箱地址"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
              ]}
            >
              <Input 
                prefix={<PhoneOutlined />} 
                placeholder="请输入手机号"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="school"
              label="学校"
              rules={[{ required: true, message: '请输入学校名称' }]}
            >
              <Input 
                prefix={<HomeOutlined />} 
                placeholder="请输入学校名称"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                size="large"
                loading={loading}
                block
              >
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* 账户信息卡片 */}
        <Card 
          title="账户信息" 
          bordered={false}
          style={{ borderRadius: 8, flex: '1 1 300px' }}
        >
          <div style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#999', marginBottom: 4 }}>用户 ID</div>
              <div style={{ fontSize: 16 }}>#{user.id}</div>
            </div>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#999', marginBottom: 4 }}>角色</div>
              <div style={{ fontSize: 16 }}>
                <span style={{ 
                  background: '#e6f7ff', 
                  color: '#1890ff',
                  padding: '4px 12px',
                  borderRadius: 4
                }}>
                  {user.role === 'teacher' ? '教师' : '管理员'}
                </span>
              </div>
            </div>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#999', marginBottom: 4 }}>注册时间</div>
              <div style={{ fontSize: 16 }}>
                {user.created_at ? new Date(user.created_at).toLocaleDateString('zh-CN') : '2024-01-01'}
              </div>
            </div>
          </div>

          <Button block onClick={() => message.info('功能开发中...')}>修改密码</Button>
        </Card>
      </div>
    </div>
  )
}

export default PersonalCenter
