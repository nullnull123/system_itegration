// src/store/index.js
import Vue from 'vue'
import Vuex from 'vuex'
// 确保所有模块文件都存在
import user from './modules/user'
import smartPrep from './modules/smartPrep'
import noteCompletion from './modules/noteCompletion'
import exercise from './modules/exercise'
import roles from './modules/roles'

// 重要：导入配置好的request实例（包含拦截器）
import request from '@/utils/request'

Vue.use(Vuex)

// 从 localStorage 获取初始令牌
const token = localStorage.getItem('token') || ''
const aiWorkshopToken = localStorage.getItem('ai_workshop_token') || ''

export default new Vuex.Store({
  state: {
    token: token,
    aiWorkshopToken: aiWorkshopToken, // 新增智课工坊专用token
    // 添加调试标志，便于开发
    isDebug: process.env.NODE_ENV !== 'production'
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
      localStorage.setItem('token', token)
      console.log('已设置通用令牌:', token ? token.substring(0, 5) + '...' : '空令牌')
    },
    SET_AI_WORKSHOP_TOKEN: (state, token) => {
      state.aiWorkshopToken = token
      localStorage.setItem('ai_workshop_token', token)
      console.log('已设置智课工坊令牌:', token ? token.substring(0, 5) + '...' : '空令牌')
    },
    // 添加清除令牌的 mutation
    CLEAR_TOKEN: (state) => {
      state.token = ''
      localStorage.removeItem('token')
      console.log('已清除通用令牌')
    },
    CLEAR_AI_WORKSHOP_TOKEN: (state) => {
      state.aiWorkshopToken = ''
      localStorage.removeItem('ai_workshop_token')
      console.log('已清除智课工坊令牌')
    }
  },
  actions: {
    setToken({ commit }, token) {
      commit('SET_TOKEN', token)
    },
    setAiWorkshopToken({ commit }, token) {
      commit('SET_AI_WORKSHOP_TOKEN', token)
    },
    clearToken({ commit }) {
      commit('CLEAR_TOKEN')
    },
    clearAiWorkshopToken({ commit }) {
      commit('CLEAR_AI_WORKSHOP_TOKEN')
    },
    
    // 统一的API请求处理方法
    async apiRequest({ state, dispatch }, { method, url, params, data, isWorkshop = false }) {
      try {
        console.log(`[API] 准备 ${method.toUpperCase()} 请求: ${url}`);
        console.log(`[API] Workshop请求? ${isWorkshop}`);
        
        let response;
        // 使用统一的request实例（已配置拦截器）
        if (method === 'get') {
          response = await request.get(url, { params });
        } else if (method === 'post') {
          response = await request.post(url, data);
        } else if (method === 'put') {
          response = await request.put(url, data);
        } else if (method === 'delete') {
          response = await request.delete(url, { data });
        } else if (method === 'patch') {
          response = await request.patch(url, data);
        }

        console.log(`[API] 成功响应 ${method.toUpperCase()} ${url}:`, response);
        return response;
      } catch (error) {
        console.error(`[API] 请求失败 [${method.toUpperCase()} ${url}]:`, error);
        
        // 处理401错误 - 仅处理智课工坊相关的401
        if (error.response && error.response.status === 401 && isWorkshop) {
          console.log('[API] 检测到401错误，清除智课工坊token并重定向');
          dispatch('clearAiWorkshopToken');
          
          // 获取当前路径用于重定向
          const currentPath = window.location.hash.replace('#', '');
          console.log('[API] 将重定向到登录页，原路径:', currentPath);
          
          // 延迟执行，确保token已清除
          setTimeout(() => {
            if (window.Vue && window.Vue.prototype.$router) {
              window.Vue.prototype.$router.push({
                path: '/ai-workshop-login',
                query: { redirect: currentPath }
              });
            }
          }, 100);
        }
        
        dispatch('handleApiError', { error, isWorkshop });
        throw error;
      }
    },
    
    // 简化的get方法
    async get({ dispatch }, { url, params, isWorkshop = false }) {
      return dispatch('apiRequest', { 
        method: 'get', 
        url, 
        params,
        isWorkshop
      });
    },
    
    // 简化的post方法
    async post({ dispatch }, { url, data, isWorkshop = false }) {
      return dispatch('apiRequest', { 
        method: 'post', 
        url, 
        data,
        isWorkshop
      });
    },

    async patch({ dispatch }, { url, data, isWorkshop = false }) {
      return dispatch('apiRequest', { 
        method: 'patch', 
        url, 
        data,
        isWorkshop
      });
    },
    
    // 统一的错误处理
    handleApiError({ state }, { error, isWorkshop }) {
      let errorMessage = 'API 请求失败';
      
      if (error.response && error.response.data) {
        errorMessage = error.response.data.message 
          || error.response.data.error 
          || error.response.data.detail
          || '服务器返回错误';
      } else if (error.message) {
        errorMessage = error.message;
      }
    
      console.error(`API 错误 [${isWorkshop ? '智课工坊' : '通用'}]:`, errorMessage);
      
      // 添加全局错误提示
      if (window.Vue && window.Vue.prototype.$message) {
        window.Vue.prototype.$message.error(`请求失败: ${errorMessage}`);
      }
      
      // 特殊处理智课工坊的401错误（已在apiRequest中处理，这里只是日志）
      if (isWorkshop && error.response && error.response.status === 401) {
        console.log('已处理智课工坊401错误，用户将被重定向到登录页');
      }
    }
  },
  modules: {
    user,
    smartPrep,
    noteCompletion,
    exercise,
    roles
  },
  strict: process.env.NODE_ENV !== 'production'
});