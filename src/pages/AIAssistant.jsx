import React, { useState, useRef, useEffect } from 'react';
import { Card, Input, Button, List, Avatar, Tag, Space, message } from 'antd';
import { SendOutlined, RobotOutlined, ThunderboltOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '您好！我是您的 AI 生物教学助手，有什么可以帮您的吗？我可以帮您解答生物问题、生成教案、批改作业等。',
      time: '09:00'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // 调用真实 AI 接口
      const response = await axios.post('http://localhost:3001/api/ai/chat', {
        message: inputValue,
        context: {}
      });

      if (response.data.success) {
        const botMessage = {
          id: messages.length + 2,
          type: 'bot',
          content: response.data.data.reply,
          time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
          suggestions: response.data.data.suggestions || []
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(response.data.error || 'AI 响应失败');
      }
    } catch (error) {
      console.error('AI 对话失败:', error);
      message.error('AI 响应失败：' + (error.message || '请稍后再试'));
      
      // 失败时显示默认回复
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: '抱歉，我遇到了一些问题，暂时无法回答您的问题。请稍后再试。',
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
  };

  return (
    <div style={{ 
      height: '100%',
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ 
        marginBottom: 16,
        flexShrink: 0
      }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>AI 教学助手</h1>
        <p style={{ color: '#666' }}>智能问答、备课辅助、作业批改</p>
      </div>

      <Card 
        bordered={false}
        style={{ 
          borderRadius: 8, 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0
        }}
      >
        {/* 消息列表 - 可滚动区域 */}
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto',
            overflowX: 'hidden',
            marginBottom: 16,
            padding: '0 8px',
            height: '100%'
          }}
        >
          {messages.map((item) => (
            <div key={item.id} style={{ 
              padding: '16px 8px',
              display: 'flex', 
              alignItems: 'flex-start',
              justifyContent: item.type === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                maxWidth: '70%',
                flexDirection: item.type === 'user' ? 'row-reverse' : 'row'
              }}>
                <Avatar 
                  icon={item.type === 'user' ? null : <RobotOutlined />}
                  style={{ 
                    backgroundColor: item.type === 'user' ? '#1890ff' : '#52c41a',
                    flexShrink: 0
                  }}
                >
                  {item.type === 'user' ? '我' : null}
                </Avatar>
                <div style={{ 
                  margin: '0 12px',
                  background: item.type === 'user' ? '#e6f7ff' : '#f0f0f0',
                  padding: 12,
                  borderRadius: 8
                }}>
                  <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{item.content}</p>
                  <div style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
                    {item.time}
                  </div>
                  {item.suggestions && item.suggestions.length > 0 && (
                    <Space wrap style={{ marginTop: 8 }}>
                      {item.suggestions.map((suggestion, index) => (
                        <Tag 
                          key={index} 
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleSuggestionClick(suggestion)}
                        >
                          {suggestion}
                        </Tag>
                      ))}
                    </Space>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div style={{ padding: '16px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#52c41a' }} />
                <div style={{ marginLeft: 12, color: '#999' }}>AI 正在思考...</div>
              </div>
            </div>
          )}
          {/* 用于自动滚动的锚点 */}
          <div ref={messagesEndRef} style={{ height: '1px' }} />
        </div>

        {/* 输入区域 */}
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <Button size="small" icon={<ThunderboltOutlined />}>AI 生成教案</Button>
            <Button size="small">智能批改</Button>
            <Button size="small">生成题目</Button>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <TextArea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="请输入您的问题，例如：如何讲解光合作用的过程？"
              rows={3}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={handleSend}
              style={{ height: 'auto', alignSelf: 'flex-end' }}
            >
              发送
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;
