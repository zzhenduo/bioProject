import React, { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // 获取当前用户信息
  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/user/profile')
      setUser(response.data.data)
    } catch (error) {
      console.error('获取用户信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取所有用户列表
  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/user/list')
      setUsers(response.data.data)
    } catch (error) {
      console.error('获取用户列表失败:', error)
    }
  }

  // 更新用户信息
  const updateUserProfile = async (userData) => {
    try {
      const response = await axios.put('http://localhost:3001/api/user/profile', {
        userId: user.id,
        ...userData
      })
      setUser(response.data.data)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // 切换用户
  const switchUser = async (userId) => {
    try {
      const response = await axios.post('http://localhost:3001/api/user/switch', { userId })
      setUser(response.data.data)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  useEffect(() => {
    fetchUserProfile()
    fetchUsers()
  }, [])

  return (
    <UserContext.Provider value={{
      user,
      users,
      loading,
      updateUserProfile,
      switchUser,
      refreshUser: fetchUserProfile
    }}>
      {children}
    </UserContext.Provider>
  )
}
