import React from 'react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import Layout from './components/Layout'
import TeacherHome from './pages/TeacherHome'
import LessonPlanCenter from './pages/LessonPlanCenter'
import KnowledgeBase from './pages/KnowledgeBase'
import QuestionBank from './pages/QuestionBank'
import ExamPaper from './pages/ExamPaper'
import ExperimentLab from './pages/ExperimentLab'
import AIAssistant from './pages/AIAssistant'
import StudentAnalysis from './pages/StudentAnalysis'
import PersonalCenter from './pages/PersonalCenter'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/teacher/home" replace />} />
            <Route path="teacher/home" element={<TeacherHome />} />
            <Route path="teacher/lesson-plans" element={<LessonPlanCenter />} />
            <Route path="teacher/knowledge" element={<KnowledgeBase />} />
            <Route path="teacher/questions" element={<QuestionBank />} />
            <Route path="teacher/exam-paper" element={<ExamPaper />} />
            <Route path="teacher/experiments" element={<ExperimentLab />} />
            <Route path="teacher/ai-assistant" element={<AIAssistant />} />
            <Route path="teacher/analysis" element={<StudentAnalysis />} />
            <Route path="teacher/profile" element={<PersonalCenter />} />
          </Route>
        </Routes>
      </HashRouter>
    </ConfigProvider>
  )
}

export default App
