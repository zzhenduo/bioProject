import React, { useState } from 'react';
import { Card, Row, Col, Button, List, Tag, Steps, message } from 'antd';
import { PlayCircleOutlined, BookOutlined, SafetyOutlined } from '@ant-design/icons';

const ExperimentLab = () => {
  const [selectedExperiment, setSelectedExperiment] = useState(null);

  const experiments = [
    {
      key: '1',
      title: '观察植物细胞的有丝分裂',
      description: '通过显微镜观察洋葱根尖细胞的有丝分裂过程',
      grade: '高一',
      difficulty: '中等',
      duration: '45 分钟',
      steps: [
        { step: 1, content: '培养洋葱根尖', duration: '3-4 天' },
        { step: 2, content: '解离：将根尖放入盐酸酒精混合液中解离 3-5 分钟', duration: '5 分钟' },
        { step: 3, content: '漂洗：用清水漂洗根尖', duration: '10 分钟' },
        { step: 4, content: '染色：用龙胆紫溶液染色 3-5 分钟', duration: '5 分钟' },
        { step: 5, content: '制片：将根尖放在载玻片上，加盖玻片，轻压', duration: '5 分钟' },
        { step: 6, content: '观察：先用低倍镜找到分生区，再用高倍镜观察', duration: '10 分钟' }
      ],
      materials: [
        { name: '洋葱', quantity: '1 个' },
        { name: '质量分数为 15% 的盐酸', quantity: '适量' },
        { name: '体积分数为 95% 的酒精', quantity: '适量' },
        { name: '龙胆紫溶液', quantity: '适量' },
        { name: '显微镜', quantity: '1 台' }
      ],
      safetyNotes: '注意盐酸具有腐蚀性，操作时戴手套；使用显微镜时注意规范操作'
    },
    {
      key: '2',
      title: '绿叶中色素的提取和分离',
      description: '提取和分离叶绿体中的色素',
      grade: '高一',
      difficulty: '简单',
      duration: '40 分钟',
      steps: [
        { step: 1, content: '称取 5g 新鲜菠菜叶，剪碎', duration: '5 分钟' },
        { step: 2, content: '加入二氧化硅、碳酸钙和无水乙醇，迅速研磨', duration: '5 分钟' },
        { step: 3, content: '过滤，收集滤液', duration: '3 分钟' },
        { step: 4, content: '制备滤纸条，画滤液细线', duration: '10 分钟' },
        { step: 5, content: '层析：将滤纸条插入层析液中', duration: '15 分钟' },
        { step: 6, content: '观察色素带', duration: '5 分钟' }
      ]
    },
    {
      key: '3',
      title: 'DNA 的粗提取与鉴定',
      description: '从生物材料中提取 DNA 并进行鉴定',
      grade: '高二',
      difficulty: '困难',
      duration: '60 分钟'
    }
  ];

  const startExperiment = () => {
    if (!selectedExperiment) {
      message.warning('请先选择实验');
      return;
    }
    message.success(`开始实验：${selectedExperiment.title}`);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>虚拟实验</h1>
        <p style={{ color: '#666' }}>3D 仿真实验，安全高效的学习体验</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="实验列表" bordered={false} style={{ borderRadius: 8 }}>
            <List
              dataSource={experiments}
              renderItem={(item) => (
                <List.Item
                  style={{ 
                    cursor: 'pointer',
                    background: selectedExperiment?.key === item.key ? '#e6f7ff' : 'transparent',
                    padding: '12px',
                    borderRadius: 4
                  }}
                  onClick={() => setSelectedExperiment(item)}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.title}</span>
                        <Tag color={item.difficulty === '简单' ? 'green' : item.difficulty === '中等' ? 'orange' : 'red'}>
                          {item.difficulty}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <p style={{ margin: '4px 0', color: '#666' }}>{item.description}</p>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#999' }}>
                          <span>{item.grade}</span>
                          <span>{item.duration}</span>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={16}>
          {selectedExperiment ? (
            <Card 
              title={selectedExperiment.title}
              bordered={false}
              style={{ borderRadius: 8 }}
              extra={
                <Button type="primary" icon={<PlayCircleOutlined />} size="large" onClick={startExperiment}>
                  开始实验
                </Button>
              }
            >
              <div style={{ marginBottom: 24 }}>
                <h3>实验简介</h3>
                <p>{selectedExperiment.description}</p>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3><SafetyOutlined /> 安全须知</h3>
                <div style={{ 
                  background: '#fffbe6', 
                  padding: 12, 
                  borderRadius: 4,
                  border: '1px solid #ffe58f'
                }}>
                  {selectedExperiment.safetyNotes || '本实验无明显安全风险'}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <h3><BookOutlined /> 实验材料</h3>
                {selectedExperiment.materials ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#fafafa' }}>
                        <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>材料名称</th>
                        <th style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #f0f0f0' }}>数量</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedExperiment.materials.map((material, index) => (
                        <tr key={index}>
                          <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{material.name}</td>
                          <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{material.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : <p>无特殊材料要求</p>}
              </div>

              <div>
                <h3>实验步骤</h3>
                <Steps
                  current={-1}
                  direction="vertical"
                  items={selectedExperiment.steps?.map((step, index) => ({
                    key: index,
                    title: step.content,
                    description: `预计用时：${step.duration}`,
                    status: 'wait'
                  }))}
                />
              </div>
            </Card>
          ) : (
            <Card 
              title="实验详情" 
              bordered={false}
              style={{ 
                borderRadius: 8, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: 500
              }}
            >
              <div style={{ textAlign: 'center', color: '#999' }}>
                <PlayCircleOutlined style={{ fontSize: 64, marginBottom: 16, color: '#1890ff' }} />
                <p>请从左侧选择实验项目</p>
              </div>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default ExperimentLab;
