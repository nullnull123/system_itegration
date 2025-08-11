// src/store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
// 确保所有模块文件都存在
import user from './modules/user'
import smartPrep from './modules/smartPrep'
import noteCompletion from './modules/noteCompletion'
import exercise from './modules/exercise'  // 确保此文件已创建
import request from '@/api/request'

Vue.use(Vuex)

// 从 localStorage 获取初始令牌
const token = localStorage.getItem('token') || ''

export default new Vuex.Store({
  state: {
    token: token,
    // 添加调试标志，便于开发
    isDebug: process.env.NODE_ENV !== 'production'
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
      localStorage.setItem('token', token)
      console.log('已设置令牌:', token ? token.substring(0, 5) + '...' : '空令牌')
    },
    // 添加清除令牌的 mutation
    CLEAR_TOKEN: (state) => {
      state.token = ''
      localStorage.removeItem('token')
      console.log('已清除令牌')
    }
  },
  actions: {
    setToken({ commit }, token) {
      commit('SET_TOKEN', token)
    },
    clearToken({ commit }) {
      commit('CLEAR_TOKEN')
    },
    // 添加通用的 API 调用方法
    async get({ dispatch }, { url, params }) {
      try {
        const response = await dispatch('api/request', { 
          method: 'get', 
          url, 
          params 
        }, { root: true })
        return response
      } catch (error) {
        dispatch('handleApiError', error)
        throw error
      }
    },
    // 修正：使用导入的 request 模块，而不是 this.$axios
    async post({ dispatch }, { url, data }) {
      try {
        // 直接使用 request.post 发送请求
        const response = await request.post(url, data)
        return response
      } catch (error) {
        dispatch('handleApiError', error)
        throw error
      }
    },
    async handleApiError(error) {
      let errorMessage = 'API 请求失败';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message 
          || error.response.data.error 
          || error.response.data.detail;
      }
      
      if (!errorMessage && error.message) {
        errorMessage = error.message;
      }
    
      console.error('API 错误:', errorMessage);
      
      // 可以在这里添加全局错误提示
      if (window.Vue && window.Vue.prototype.$message) {
        window.Vue.prototype.$message.error(errorMessage)
      }
    },
    // API 请求处理
    async 'api/request'({ rootState }, { method, url, params, data }) {
      try {
        // 确保有有效的 token
        if (rootState.token) {
          // request.js 会自动添加 token
        }
        
        // 使用 request 模块发送请求
        let response;
        if (method === 'get') {
          response = await import('@/api/request').then(module => 
            module.default.get(url, { params })
          )
        } else if (method === 'post') {
          response = await import('@/api/request').then(module => 
            module.default.post(url, data)
          )
        }
        
        return response;
      } catch (error) {
        console.error(`API 请求失败 [${method.toUpperCase()} ${url}]:`, error)
        throw error
      }
    }
  },
  modules: {
    user,
    smartPrep,
    noteCompletion,
    exercise
  },
  strict: process.env.NODE_ENV !== 'production'
})