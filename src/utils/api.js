import axios from 'axios';

console.log('========================================');
console.log('API 模块初始化');
console.log('  baseURL: http://localhost:3001');
console.log('========================================');

// 创建 axios 实例
const api = axios.create({
  baseURL: 'http://localhost:3001',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
api.interceptors.request.use(
  config => {
    console.log(`📤 [API 请求] ${config.method?.toUpperCase()} ${config.url}`);
    console.log('  请求数据:', config.data);
    return config;
  },
  error => {
    console.error('❌ [API 请求错误]', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  response => {
    console.log(`📥 [API 响应] ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('  响应状态:', response.status);
    console.log('  响应数据:', response.data);
    return response;
  },
  error => {
    console.error('========================================');
    console.error('❌ API 请求失败:');
    console.error('  URL:', error.config?.url);
    console.error('  方法:', error.config?.method?.toUpperCase());
    console.error('  状态码:', error.response?.status);
    console.error('  错误信息:', error.message);
    console.error('  响应数据:', error.response?.data);
    console.error('========================================');
    return Promise.reject(error);
  }
);

export default api;
