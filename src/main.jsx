import React from 'react'
import ReactDOM from 'react-dom/client'
import axios from 'axios'
import App from './App.jsx'
import './index.css'

// 配置 API 基础 URL
// 在 Electron 生产环境中，后端服务器运行在 localhost:3001
const isElectron = window.location.protocol === 'file:'
const API_BASE_URL = isElectron ? 'http://localhost:3001' : ''

// 设置 axios 默认基础 URL
axios.defaults.baseURL = API_BASE_URL
axios.defaults.timeout = 60000

// 错误捕获
window.addEventListener('error', (e) => {
  console.error('全局错误:', e.error)
})

try {
  const root = ReactDOM.createRoot(document.getElementById('root'))
  root.render(<App />)
} catch (error) {
  console.error('渲染错误:', error)
  document.getElementById('root').innerHTML = `
    <div style="padding: 50px; text-align: center;">
      <h1 style="color: red;">渲染错误</h1>
      <p>${error.message}</p>
    </div>
  `
}
