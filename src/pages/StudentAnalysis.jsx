import React, { useState } from 'react';
import { Card, Row, Col, Table, Progress, Tag, Select } from 'antd';
import { Bar, Line, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const { Option } = Select;

const StudentAnalysis = () => {
  const [selectedClass, setSelectedClass] = useState('高一 (1) 班');

  const classData = {
    labels: ['一班', '二班', '三班', '四班', '五班'],
    datasets: [{
      label: '平均成绩',
      data: [78.5, 82.3, 75.8, 80.1, 77.9],
      backgroundColor: 'rgba(24, 144, 255, 0.6)',
      borderColor: '#1890ff',
      borderWidth: 1
    }]
  };

  const trendData = {
    labels: ['第 1 周', '第 2 周', '第 3 周', '第 4 周', '第 5 周', '第 6 周'],
    datasets: [
      {
        label: '一班',
        data: [75, 77, 76, 78, 79, 78.5],
        borderColor: '#1890ff',
        tension: 0.3
      },
      {
        label: '二班',
        data: [80, 81, 82, 81, 83, 82.3],
        borderColor: '#52c41a',
        tension: 0.3
      }
    ]
  };

  const radarData = {
    labels: ['细胞结构', '遗传进化', '光合作用', '生态系统', '实验技能', '科学思维'],
    datasets: [{
      label: '班级平均水平',
      data: [85, 72, 68, 80, 75, 70],
      backgroundColor: 'rgba(24, 144, 255, 0.2)',
      borderColor: '#1890ff',
      pointBackgroundColor: '#1890ff'
    }]
  };

  const studentList = [
    { key: '1', name: '张三', avgScore: 92.5, trend: 'up', weakPoint: '遗传进化' },
    { key: '2', name: '李四', avgScore: 88.0, trend: 'stable', weakPoint: '实验技能' },
    { key: '3', name: '王五', avgScore: 76.5, trend: 'down', weakPoint: '光合作用' },
    { key: '4', name: '赵六', avgScore: 85.0, trend: 'up', weakPoint: '生态系统' },
    { key: '5', name: '钱七', avgScore: 68.0, trend: 'stable', weakPoint: '遗传进化' }
  ];

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { 
      title: '平均分', 
      dataIndex: 'avgScore', 
      key: 'avgScore',
      render: (score) => (
        <span style={{ 
          color: score >= 85 ? '#52c41a' : score >= 70 ? '#faad14' : '#ff4d4f',
          fontWeight: 'bold'
        }}>
          {score}
        </span>
      )
    },
    { 
      title: '趋势', 
      dataIndex: 'trend', 
      key: 'trend',
      render: (trend) => {
        const icons = { up: '↗', stable: '→', down: '↘' };
        const colors = { up: '#52c41a', stable: '#faad14', down: '#ff4d4f' };
        return <span style={{ color: colors[trend], fontSize: 20 }}>{icons[trend]}</span>;
      }
    },
    { 
      title: '薄弱知识点', 
      dataIndex: 'weakPoint', 
      key: 'weakPoint',
      render: (point) => <Tag color="red">{point}</Tag>
    },
    { title: '操作', key: 'action', render: () => <a>查看详情</a> }
  ];

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>学情分析</h1>
          <p style={{ color: '#666' }}>数据驱动，精准掌握学生学习情况</p>
        </div>
        <Select 
          value={selectedClass} 
          onChange={setSelectedClass}
          style={{ width: 150 }}
        >
          <Option value="高一 (1) 班">高一 (1) 班</Option>
          <Option value="高一 (2) 班">高一 (2) 班</Option>
          <Option value="高二 (1) 班">高二 (1) 班</Option>
        </Select>
      </div>

      {/* 概览统计 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: '#1890ff', fontWeight: 'bold' }}>78.5</div>
              <div style={{ color: '#666', marginTop: 8 }}>班级平均分</div>
              <Progress percent={78.5} strokeColor="#1890ff" style={{ marginTop: 16 }} />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: '#52c41a', fontWeight: 'bold' }}>95%</div>
              <div style={{ color: '#666', marginTop: 8 }}>作业完成率</div>
              <Progress percent={95} strokeColor="#52c41a" style={{ marginTop: 16 }} />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: '#faad14', fontWeight: 'bold' }}>72.5%</div>
              <div style={{ color: '#666', marginTop: 8 }}>知识点掌握率</div>
              <Progress percent={72.5} strokeColor="#faad14" style={{ marginTop: 16 }} />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ borderRadius: 8 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, color: '#722ed1', fontWeight: 'bold' }}>12</div>
              <div style={{ color: '#666', marginTop: 8 }}>需重点关注学生</div>
              <Progress percent={60} strokeColor="#722ed1" style={{ marginTop: 16 }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表分析 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="班级成绩对比" bordered={false} style={{ borderRadius: 8 }}>
            <div style={{ height: 300 }}>
              <Bar 
                data={classData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: { beginAtZero: false, min: 60 }
                  }
                }}
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="成绩变化趋势" bordered={false} style={{ borderRadius: 8 }}>
            <div style={{ height: 300 }}>
              <Line 
                data={trendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' }
                  }
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="知识点掌握情况" bordered={false} style={{ borderRadius: 8 }}>
            <div style={{ height: 300 }}>
              <Radar 
                data={radarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    r: { beginAtZero: true, max: 100 }
                  }
                }}
              />
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="薄弱知识点 TOP5" bordered={false} style={{ borderRadius: 8 }}>
            <Table 
              dataSource={[
                { key: '1', knowledge: 'DNA 复制', errorRate: 45.2, students: 18 },
                { key: '2', knowledge: '有丝分裂', errorRate: 38.5, students: 15 },
                { key: '3', knowledge: '光合作用', errorRate: 35.8, students: 14 },
                { key: '4', knowledge: '遗传定律', errorRate: 32.1, students: 12 },
                { key: '5', knowledge: '蛋白质合成', errorRate: 28.5, students: 11 }
              ]}
              columns={[
                { title: '知识点', dataIndex: 'knowledge', key: 'knowledge' },
                { 
                  title: '错误率', 
                  dataIndex: 'errorRate', 
                  key: 'errorRate',
                  render: (rate) => (
                    <Progress 
                      percent={rate} 
                      strokeColor={{ '0%': '#ff4d4f', '100%': '#faad14' }}
                      format={() => `${rate}%`}
                    />
                  )
                },
                { title: '影响人数', dataIndex: 'students', key: 'students' }
              ]}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 学生列表 */}
      <Card title="学生个体分析" bordered={false} style={{ borderRadius: 8 }}>
        <Table 
          columns={columns} 
          dataSource={studentList} 
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default StudentAnalysis;
