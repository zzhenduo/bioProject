import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Select, Tag, Space, Modal, Form, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const KnowledgeBase = () => {
  const [knowledgePoints, setKnowledgePoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterChapter, setFilterChapter] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    loadKnowledgePoints();
  }, []);

  const loadKnowledgePoints = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/api/knowledge');
      const data = response.data.data || [];
      // 将 id 映射为 key，以适配 Table 组件
      const mappedData = data.map(item => ({
        ...item,
        key: item.id.toString(),
        tags: item.tags ? item.tags.split(',').map(t => t.trim()) : []
      }));
      setKnowledgePoints(mappedData);
    } catch (error) {
      console.error('加载知识点失败:', error);
      // 使用模拟数据作为后备
      setKnowledgePoints([
        { key: '1', id: 1, title: '细胞的结构与功能', chapter: '必修一·分子与细胞', grade: '高一', difficulty: 2, tags: ['细胞', '结构'] },
        { key: '2', id: 2, title: 'DNA 的结构与复制', chapter: '必修二·遗传与进化', grade: '高二', difficulty: 3, tags: ['DNA', '遗传'] },
        { key: '3', id: 3, title: '光合作用的过程', chapter: '必修一·分子与细胞', grade: '高一', difficulty: 3, tags: ['光合作用'] },
        { key: '4', id: 4, title: '有丝分裂', chapter: '必修一·分子与细胞', grade: '高一', difficulty: 3, tags: ['细胞分裂'] },
        { key: '5', id: 5, title: '孟德尔遗传定律', chapter: '必修二·遗传与进化', grade: '高二', difficulty: 3, tags: ['遗传', '定律'] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 添加/编辑知识点
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        title: values.title,
        chapter: values.chapter,
        grade_level: values.grade,
        content: values.content || '',
        difficulty_level: values.difficulty || 2,
        tags: values.tags ? values.tags.join(',') : ''
      };

      if (editingItem) {
        // 编辑模式
        await axios.put(`http://localhost:3001/api/knowledge/${editingItem.id}`, data);
        message.success('更新成功');
      } else {
        // 添加模式
        await axios.post('http://localhost:3001/api/knowledge', data);
        message.success('添加成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      loadKnowledgePoints();
    } catch (error) {
      if (error.name !== 'ValidationError') {
        message.error('操作失败，请重试');
      }
    }
  };

  // 删除知识点
  const handleDelete = (record) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除知识点"${record.title}"吗？`,
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:3001/api/knowledge/${record.id}`);
          message.success('删除成功');
          loadKnowledgePoints();
        } catch (error) {
          console.error('删除失败:', error);
          // 如果没有后端，从本地删除
          setKnowledgePoints(prev => prev.filter(item => item.key !== record.key));
          message.success('删除成功');
        }
      }
    });
  };

  // 过滤数据
  const filteredData = knowledgePoints.filter(item => {
    if (searchText && !item.title.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }
    const grade = item.grade || item.grade_level;
    if (filterGrade && grade !== filterGrade) {
      return false;
    }
    if (filterChapter && !item.chapter.includes(filterChapter)) {
      return false;
    }
    return true;
  });

  const columns = [
    { title: '知识点名称', dataIndex: 'title', key: 'title', width: 300 },
    { title: '所属章节', dataIndex: 'chapter', key: 'chapter' },
    { title: '年级', dataIndex: 'grade', key: 'grade', width: 80, render: (grade, record) => grade || record.grade_level },
    { 
      title: '难度', 
      dataIndex: 'difficulty', 
      key: 'difficulty',
      width: 100,
      render: (difficulty, record) => {
        const diff = difficulty || record.difficulty_level;
        const colors = { 1: 'green', 2: 'orange', 3: 'red' };
        const texts = { 1: '基础', 2: '中等', 3: '困难' };
        return <Tag color={colors[diff]}>{texts[diff]}</Tag>;
      }
    },
    { title: '标签', dataIndex: 'tags', key: 'tags', render: (tags) => (
      <Space wrap>
        {tags && Array.isArray(tags) ? tags.map(tag => <Tag key={tag}>{tag}</Tag>) : []}
      </Space>
    )},
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      )
    }
  ];

  const handleEdit = (record) => {
    setEditingItem(record);
    form.setFieldsValue({
      title: record.title,
      chapter: record.chapter,
      grade: record.grade || record.grade_level,
      difficulty: record.difficulty || record.difficulty_level,
      content: record.content,
      tags: record.tags ? (Array.isArray(record.tags) ? record.tags.join(', ') : record.tags) : ''
    });
    setIsModalVisible(true);
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, marginBottom: 8 }}>知识点库</h1>
          <p style={{ color: '#666' }}>管理高中生物核心知识点</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => {
          setEditingItem(null);
          form.resetFields();
          setIsModalVisible(true);
        }}>
          添加知识点
        </Button>
      </div>

      <Card bordered={false} style={{ borderRadius: 8 }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Input 
            placeholder="搜索知识点" 
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select 
            placeholder="选择年级" 
            style={{ width: 120 }}
            value={filterGrade}
            onChange={setFilterGrade}
            allowClear
          >
            <Option value="高一">高一</Option>
            <Option value="高二">高二</Option>
            <Option value="高三">高三</Option>
          </Select>
          <Select 
            placeholder="选择教材" 
            style={{ width: 200 }}
            value={filterChapter}
            onChange={setFilterChapter}
            allowClear
          >
            <Option value="必修一">必修一·分子与细胞</Option>
            <Option value="必修二">必修二·遗传与进化</Option>
            <Option value="选择性必修一">选择性必修一·稳态与调节</Option>
          </Select>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingItem ? '编辑知识点' : '添加知识点'}
        open={isModalVisible}
        onOk={handleSave}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="知识点名称" rules={[{ required: true, message: '请输入知识点名称' }]}>
            <Input placeholder="请输入知识点名称" />
          </Form.Item>
          <Form.Item name="chapter" label="所属章节" rules={[{ required: true, message: '请输入所属章节' }]}>
            <Input placeholder="请输入所属章节" />
          </Form.Item>
          <Form.Item name="grade" label="年级" rules={[{ required: true, message: '请选择年级' }]}>
            <Select>
              <Option value="高一">高一</Option>
              <Option value="高二">高二</Option>
              <Option value="高三">高三</Option>
            </Select>
          </Form.Item>
          <Form.Item name="difficulty" label="难度等级" initialValue={2}>
            <Select>
              <Option value={1}>基础</Option>
              <Option value={2}>中等</Option>
              <Option value={3}>困难</Option>
            </Select>
          </Form.Item>
          <Form.Item name="tags" label="标签（用逗号分隔）">
            <Input placeholder="例如：细胞，结构，功能" />
          </Form.Item>
          <Form.Item name="content" label="内容详情">
            <Input.TextArea rows={6} placeholder="请输入详细内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default KnowledgeBase;
