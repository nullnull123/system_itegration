// src/store/modules/user.js
import request from '@/api/request'

const state = {
  token: localStorage.getItem('token') || '',
  name: '',
  avatar: '',
  roles: []
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
    localStorage.setItem('token', token)
    console.log('已存储令牌:', token ? token.substring(0, 5) + '...' : '空令牌')
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  }
}

const actions = {
  // 登录
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      request({
        url: '/api-token-auth/',
        method: 'post',
        data: {
          username: username.trim(),
          password: password
        }
      }).then(response => {
        // 关键修复：直接使用 response.token
        let token = null
        
        // 处理不同响应格式
        if (response.token) {
          token = response.token
        } else if (response.data && response.data.token) {
          token = response.data.token
        } else {
          token = response
        }
        
        if (!token) {
          console.error('获取令牌失败:', response)
          reject(new Error('获取令牌失败'))
          return
        }
        
        commit('SET_TOKEN', token)
        console.log('令牌已存储:', token.substring(0, 5) + '...')
        resolve()
      }).catch(error => {
        console.error('登录错误:', error)
        reject(error)
      })
    })
  },

  // 注册
  register({ commit }, userInfo) {
    return new Promise((resolve, reject) => {
      request({
        url: '/api/v1/register/',
        method: 'post',
        data: userInfo
      }).then(response => {
        // 关键修复：直接使用 response.token
        let token = null
        
        // 处理不同响应格式
        if (response.token) {
          token = response.token
        } else if (response.data && response.data.token) {
          token = response.data.token
        } else {
          token = response
        }
        
        if (!token) {
          console.error('注册后获取令牌失败:', response)
          reject(new Error('注册后获取令牌失败'))
          return
        }
        
        commit('SET_TOKEN', token)
        console.log('注册后已存储令牌:', token.substring(0, 5) + '...')
        resolve(response)
      }).catch(error => {
        console.error('注册错误:', error)
        reject(error)
      })
    })
  },

  // 退出登录
  logout({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      localStorage.removeItem('token')
      resolve()
    })
  },

  // 重置 Token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      localStorage.removeItem('token')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}