import {AC_URL} from '@/api/request'
const state = {
    preps: [], // 确保有这个状态来存储列表
    currentPrep: null,
    loading: false,
    error: null
  }
  
  const mutations = {
    SET_PREPS: (state, preps) => { // 添加 SET_PREPS
      state.preps = preps
    },
    SET_CURRENT_PREP: (state, prep) => { // 添加 SET_CURRENT_PREP
      state.currentPrep = prep && typeof prep === 'object' ? prep : null
    },
    SET_LOADING: (state, loading) => {
      state.loading = loading
    },
    SET_ERROR: (state, error) => {
      state.error = error
    }
  }
  
  const actions = {
    // --- 你现有的其他 actions 保持不变 ---
    setCurrentPrep({ commit }, prep) {
      commit('SET_CURRENT_PREP', prep)
    },

    async fetchList({ commit, dispatch }, params) { // 方法名改为 fetchList
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('get', {
          url: AC_URL + '/api/v1/prep/',
          params
        }, { root: true })
  
        console.log('SmartPrep API响应数据:', response.data)
  
        // 处理分页数据结构 (与 exercise 模块保持一致)
        let preps = []
        if (response.data.results) {
          // 分页格式: {count: 3, next: null, previous: null, results: Array(3)}
          preps = response.data.results
        } else if (Array.isArray(response.data.data)) {
          // 嵌套数组格式: {data: [...]}
          preps = response.data.data
        } else if (Array.isArray(response.data)) {
          // 直接数组格式
          preps = response.data
        } else {
          // 其他情况
          console.warn('SmartPrep 数据格式不识别:', response.data)
          preps = []
        }
  
        console.log('处理后的备课数组:', preps)
  
        commit('SET_PREPS', preps) // 使用 SET_PREPS mutation
        commit('SET_ERROR', null)
        return preps // 返回处理后的数据
      } catch (error) {
        console.error('获取智能备课列表失败:', error)
        // 提供更详细的错误信息
        const errorMessage = error.response?.data?.message ||
                             error.response?.data?.detail ||
                             error.message ||
                             '获取智能备课列表失败'
        commit('SET_ERROR', errorMessage)
        commit('SET_PREPS', []) // 确保失败时列表为空数组
        throw error // 重新抛出错误，以便调用者可以处理
      } finally {
        commit('SET_LOADING', false)
      }
    },
  
    /**
     * 获取单个智能备课详情 (对应 fetchExercise)
     */
    async fetchDetail({ commit, dispatch }, display_id) { // 方法名改为 fetchDetail
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('get', {
          url: AC_URL + `/api/v1/prep/${display_id}/` // 使用 display_id
        }, { root: true })
  
        // 获取单个备课对象 (与 exercise 模块保持一致)
        const prep = response.data.data || response.data
  
        console.log('获取到的备课详情:', prep)
  
        // 设置当前备课 (使用 SET_CURRENT_PREP mutation)
        commit('SET_CURRENT_PREP', prep)
        commit('SET_ERROR', null)
  
        return prep // 返回获取到的对象
      } catch (error) {
        console.error('获取智能备课详情失败:', error)
        // 提供更详细的错误信息
        const errorMessage = error.response?.data?.message ||
                             error.response?.data?.detail ||
                             error.message ||
                             '获取智能备课详情失败'
        commit('SET_ERROR', errorMessage)
        // 注意：这里通常不抛出错误，或者根据需要决定是否抛出
        // 如果需要组件处理错误，可以抛出
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async uploadLesson({ commit, dispatch }, data) {
      commit('SET_LOADING', true)
      try {
        // 修正 1: 使用 dispatch 调用根级别的 API action
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/prep/upload/', 
          data 
        }, { root: true })

        const lessonData = response.data.data || response.data
        
        commit('SET_CURRENT_PREP', lessonData)
        commit('SET_ERROR', null)
        return lessonData

      } catch (error) {
        // 修正 2: 提供更详细的错误信息
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            '教案上传失败'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async generateOptimizedLesson({ commit, state, dispatch }, display_id) {
      commit('SET_LOADING', true)
      try {
        const lessonId = state.currentPrep?.id || state.currentPrep?.lesson_id

        if (!lessonId) {
          throw new Error('无法获取教案ID')
        }

        // 这里应该调用 API
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/prep/generate/', 
          data: { lesson_id: lessonId } 
        }, { root: true })

        const lessonData = response.data.data || response.data

        commit('SET_CURRENT_PREP', lessonData)
        commit('SET_ERROR', null)
        return lessonData


      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          '教案优化失败'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    async generateOptimizedLesson_id({ commit, state, dispatch }, display_id) {
      commit('SET_LOADING', true)
      try {
        const lessonId = state.currentPrep?.id || state.currentPrep?.lesson_id

        if (!lessonId) {
          throw new Error('无法获取教案ID')
        }

        // 这里应该调用 API
        const response = await dispatch('post', { 
          url: AC_URL + `/api/v1/prep/generate/${display_id}/`, 
          data: { lesson_id: lessonId } 
        }, { root: true })

        const lessonData = response.data.data || response.data

        commit('SET_CURRENT_PREP', lessonData)
        commit('SET_ERROR', null)
        return lessonData


      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          '教案优化失败'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async coverLessonToServer({ commit, dispatch }, lesson) {
      commit('SET_LOADING', true)
      try {
        // 确保 lesson 对象包含 display_id
        const displayId = lesson.display_id || lesson.id
        if (!displayId) {
          throw new Error('缺少教案ID')
        }
    
        // 准备要发送的数据（只发送需要更新的字段）
        const requestData = {
          title: lesson.title,
          subject: lesson.subject,
          grade: lesson.grade,
          duration: lesson.duration,
          original_content: lesson.original_content,
          optimized_content: lesson.optimized_content,
          optimization_notes: lesson.optimization_notes,
          optimization_time: lesson.optimization_time
        }
    
        const response = await dispatch('post', { 
          url: AC_URL + `/api/v1/prep/cover/${displayId}/`, 
          data: requestData 
        }, { root: true })
        
        // 检查响应状态
        if (response.data.status === 'error') {
          throw new Error(response.data.message || '教案保存失败')
        }
    
        const lessonData = response.data.data || response.data
        
        commit('SET_CURRENT_PREP', lessonData)
        commit('SET_ERROR', null)
        
        // 显示成功消息
        if (response.data.message) {
          // 这里可以调用 Element UI 的消息提示
          // Message.success(response.data.message)
        }
        
        return lessonData
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.response?.data?.details ||
                            error.message || 
                            '教案保存失败'
        commit('SET_ERROR', errorMessage)
        
        // 可以在这里添加更详细的错误处理
        if (error.response?.status === 404) {
          // 处理教案不存在的情况
          console.error('教案不存在:', errorMessage)
        } else if (error.response?.status === 400) {
          // 处理参数错误
          console.error('参数错误:', errorMessage)
        }
        
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

        // 全删除方法
    async deleteAllLessons({ commit, dispatch }) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/prep/delete-all/', 
          data: {
            confirm: true  // 修正：添加 data 对象
          } 
        }, { root: true })
        
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            '删除失败'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 批量删除方法
    async bulkDeleteLessons({ commit, dispatch }, displayIds) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/prep/bulk-delete/', 
          data: { display_ids: displayIds } // 注意这里是 display_ids 数组
        }, { root: true })
        
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            '批量删除失败'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }

    
  
  export default {
    namespaced: true,
    state,
    mutations,
    actions
  }