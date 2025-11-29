// src/store/modules/exercise.js

// 直接定义AC_URL，避免可能的导入循环
const AC_URL = '/ai_class_workshop';

const state = {
    exercises: [],          // 习题列表
    currentExercise: null,  // 当前习题
    submissions: [],        // 提交记录
    submissionResult: null, // 提交结果
    loading: false,
    error: null
}
  
const mutations = {
    SET_EXERCISES(state, exercises) {
      state.exercises = Array.isArray(exercises) ? exercises : []
    },
    
    SET_CURRENT_EXERCISE(state, exercise) {
      state.currentExercise = exercise && typeof exercise === 'object' ? exercise : null
    },
    
    SET_SUBMISSIONS(state, submissions) {
      state.submissions = Array.isArray(submissions) ? submissions : []
    },
    
    SET_SUBMISSION_RESULT(state, result) {
      state.submissionResult = result
    },

    SET_LOADING: (state, loading) => {
      state.loading = loading
    },
    
    SET_ERROR: (state, error) => {
      state.error = error
    }
}
  
const actions = {
    async fetchList({ commit, dispatch }, params) {
      commit('SET_LOADING', true)
      try {
        console.log('[Exercise] 开始获取习题列表...');
        
        // 关键修改：使用根store的get方法，并标记为智课工坊请求
        const response = await dispatch('get', { 
          url: `${AC_URL}/api/v1/exercises/`, 
          params,
          isWorkshop: true  // 标记为智课工坊请求
        }, { root: true })
        
        console.log('[Exercise] API响应数据:', response.data)
        
        // 处理分页数据结构
        let exercises = []
        if (response.data.results) {
          // 分页格式: {count: 3, next: null, previous: null, results: Array(3)}
          exercises = response.data.results
        } else if (Array.isArray(response.data.data)) {
          // 嵌套数组格式: {data: [...]}
          exercises = response.data.data
        } else if (Array.isArray(response.data)) {
          // 直接数组格式
          exercises = response.data
        } else {
          // 其他情况
          exercises = []
        }
        
        console.log('[Exercise] 处理后的习题数组:', exercises)
        
        commit('SET_EXERCISES', exercises)
        commit('SET_ERROR', null)
        return exercises
      } catch (error) {
        console.error('[Exercise] 获取习题列表失败:', error)
        const errorMessage = error.response?.data?.message ||
                             error.response?.data?.detail ||
                             error.message ||
                             '获取习题列表失败'
        commit('SET_ERROR', errorMessage)
        commit('SET_EXERCISES', [])
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchDetail({ commit, dispatch }, display_id) {
      commit('SET_LOADING', true)
      try {
        console.log(`[Exercise] 开始获取习题详情 (display_id: ${display_id})...`);
        
        // 关键修改：使用根store的get方法，并标记为智课工坊请求
        const response = await dispatch('get', { 
          url: `${AC_URL}/api/v1/exercises/${display_id}/`,
          isWorkshop: true  // 标记为智课工坊请求
        }, { root: true })
        
        // 获取单个习题对象
        const exercise = response.data.data || response.data

        console.log('[Exercise] 获取到的习题详情:', exercise)
        
        // 设置当前习题
        commit('SET_CURRENT_EXERCISE', exercise)
        commit('SET_ERROR', null)
        
        return exercise
      } catch (error) {
        console.error('[Exercise] 获取习题失败:', error)
        const errorMessage = error.response?.data?.message ||
                             error.response?.data?.detail ||
                             error.message ||
                             '获取习题失败'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createExercise({ commit, dispatch }, data) {
      commit('SET_LOADING', true)
      try {
        console.log('[Exercise] 开始创建习题...', data);
        
        // 关键修改：使用根store的post方法，并标记为智课工坊请求
        const response = await dispatch('post', { 
          url: `${AC_URL}/api/v1/exercises/create/`, 
          data,
          isWorkshop: true  // 标记为智课工坊请求
        }, { root: true })
        
        // 创建习题通常返回创建的单个对象
        const newExercise = response.data.data || response.data
        
        console.log('[Exercise] 创建习题响应:', newExercise)
        
        // 重新获取习题列表以确保数据一致性
        try {
          const listResponse = await dispatch('get', { 
            url: `${AC_URL}/api/v1/exercises/`,
            isWorkshop: true  // 标记为智课工坊请求
          }, { root: true })
          
          let exercises = []
          if (listResponse.data.results) {
            exercises = listResponse.data.results
          } else if (Array.isArray(listResponse.data)) {
            exercises = listResponse.data
          } else {
            exercises = Array.isArray(listResponse.data.data) ? listResponse.data.data : []
          }
          
          commit('SET_EXERCISES', exercises)
        } catch (listError) {
          console.error('[Exercise] 重新获取习题列表失败:', listError)
          // 如果重新获取失败，至少添加新创建的习题
          const state = this.state.exercise
          const existingExercises = Array.isArray(state.exercises) ? state.exercises : []
          commit('SET_EXERCISES', [...existingExercises, newExercise])
        }
        
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('[Exercise] 创建习题失败:', error)
        const errorMessage = error.response?.data?.message ||
                             error.response?.data?.detail ||
                             error.message ||
                             '创建习题失败'
        commit('SET_ERROR', errorMessage)
        commit('SET_EXERCISES', [])
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchSubmissions({ commit, dispatch }, params) {
      commit('SET_LOADING', true)
      try {
        console.log('[Exercise] 开始获取提交记录...');
        
        // 关键修改：使用根store的get方法，并标记为智课工坊请求
        const response = await dispatch('get', { 
          url: `${AC_URL}/api/v1/exercises/submissions/`, 
          params,
          isWorkshop: true  // 标记为智课工坊请求
        }, { root: true })
        
        console.log('[Exercise] 提交记录API响应数据:', response.data)
        
        // 处理分页数据结构
        let submissions = []
        if (response.data.results) {
          // 分页格式: {count: 3, next: null, previous: null, results: Array(3)}
          submissions = response.data.results
        } else if (Array.isArray(response.data.data)) {
          // 嵌套数组格式: {data: [...]}
          submissions = response.data.data
        } else if (Array.isArray(response.data)) {
          // 直接数组格式
          submissions = response.data
        } else {
          // 其他情况
          submissions = []
        }
        
        console.log('[Exercise] 处理后的提交记录数组:', submissions)
        
        commit('SET_SUBMISSIONS', submissions)
        commit('SET_ERROR', null)
        return submissions
      } catch (error) {
        console.error('[Exercise] 获取提交记录失败:', error)
        const errorMessage = error.response?.data?.message ||
                             error.response?.data?.detail ||
                             error.message ||
                             '获取提交记录失败'
        commit('SET_ERROR', errorMessage)
        commit('SET_SUBMISSIONS', [])
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchSubmissionDetail({ commit, dispatch }, display_id) {
      commit('SET_LOADING', true)
      try {
        console.log(`[Exercise] 开始获取提交记录详情 (display_id: ${display_id})...`);
        
        // 关键修改：使用根store的get方法，并标记为智课工坊请求
        const response = await dispatch('get', { 
          url: `${AC_URL}/api/v1/exercises/submissions/${display_id}/`,
          isWorkshop: true  // 标记为智课工坊请求
        }, { root: true })
        
        // 获取单个提交记录对象
        const submission = response.data.data || response.data
    
        console.log('[Exercise] 获取到的提交记录详情:', submission)
        
        // 设置当前提交记录
        commit('SET_SUBMISSION_RESULT', submission)
        commit('SET_ERROR', null)
        
        return submission
      } catch (error) {
        console.error('[Exercise] 获取提交记录失败:', error)
        const errorMessage = error.response?.data?.message ||
                             error.response?.data?.detail ||
                             error.message ||
                             '获取提交记录失败'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async submitAnswer({ commit, dispatch }, { display_id, data }) {
      commit('SET_LOADING', true);
      try {
        console.log(`[Exercise] 开始提交答案 (display_id: ${display_id})...`, data);
        
        // 关键修改：使用根store的post方法，并标记为智课工坊请求
        const response = await dispatch('post', {
          url: `${AC_URL}/api/v1/exercises/submit/${display_id}/`,
          data, // 只包含 { answer: "..." }
          isWorkshop: true  // 标记为智课工坊请求
        }, { root: true });

        const submissionResult = response.data.data || response.data;
        
        console.log('[Exercise] 提交答案响应:', submissionResult);

        commit('SET_SUBMISSION_RESULT', submissionResult);
        commit('SET_ERROR', null);
        return submissionResult;
      } catch (error) {
        console.error('[Exercise] 提交答案失败:', error);
        const errorMessage = error.response?.data?.message ||
                             error.response?.data?.detail ||
                             error.message ||
                             '提交失败';
        commit('SET_ERROR', errorMessage);
        throw error;
      } finally {
        commit('SET_LOADING', false);
      }
    },


    // 全删除方法
    async deleteAllExercises({ commit, dispatch }) {
      commit('SET_LOADING', true)
      try {
        console.log('[Exercise] 开始删除所有习题...');
        
        // 关键修改：使用根store的post方法，并标记为智课工坊请求
        const response = await dispatch('post', { 
          url: `${AC_URL}/api/v1/exercises/delete-all/`, 
          data: {
            confirm: true
          },
          isWorkshop: true  // 标记为智课工坊请求
        }, { root: true })
        
        console.log('[Exercise] 删除所有习题响应:', response.data)

        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('[Exercise] 删除所有习题失败:', error)
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
    async bulkDeleteExercises({ commit, dispatch }, displayIds) {
      commit('SET_LOADING', true)
      try {
        console.log(`[Exercise] 开始批量删除习题 (${displayIds.length}个)...`, displayIds);
        
        // 关键修改：使用根store的post方法，并标记为智课工坊请求
        const response = await dispatch('post', { 
          url: `${AC_URL}/api/v1/exercises/bulk-delete/`, 
          data: { display_ids: displayIds },
          isWorkshop: true  // 标记为智课工坊请求
        }, { root: true })
        
        console.log('[Exercise] 批量删除习题响应:', response.data)

        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('[Exercise] 批量删除习题失败:', error)
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            '批量删除失败'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async deleteAllSubmissions({ commit, dispatch }) {
      commit('SET_LOADING', true)
      try {
        console.log('[Exercise] 开始删除所有提交记录...');
        
        // 关键修改：使用根store的post方法，并标记为智课工坊请求
        const response = await dispatch('post', { 
          url: `${AC_URL}/api/v1/exercises/submissions/delete-all/`, 
          data: {
            confirm: true
          },
          isWorkshop: true  // 标记为智课工坊请求
        }, { root: true })
        
        console.log('[Exercise] 删除所有提交记录响应:', response.data)

        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('[Exercise] 删除提交记录失败:', error)
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            '删除提交记录失败'
        commit('SET_ERROR', errorMessage)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    // 批量删除提交记录方法
    async bulkDeleteSubmissions({ commit, dispatch }, displayIds) {
      commit('SET_LOADING', true)
      try {
        console.log(`[Exercise] 开始批量删除提交记录 (${displayIds.length}个)...`, displayIds);
        
        // 关键修改：使用根store的post方法，并标记为智课工坊请求
        const response = await dispatch('post', { 
          url: `${AC_URL}/api/v1/exercises/submissions/bulk-delete/`, 
          data: { display_ids: displayIds },
          isWorkshop: true  // 标记为智课工坊请求
        }, { root: true })
        
        console.log('[Exercise] 批量删除提交记录响应:', response.data)

        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('[Exercise] 批量删除提交记录失败:', error)
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            '批量删除提交记录失败'
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