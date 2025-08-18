import {AC_URL} from '@/api/request'
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
        const response = await dispatch('get', { 
          url: AC_URL + '/api/v1/exercises/', 
          params 
        }, { root: true })
        
        console.log('API响应数据:', response.data)
        
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
        
        console.log('处理后的习题数组:', exercises)
        
        commit('SET_EXERCISES', exercises)
        commit('SET_ERROR', null)
        return exercises
      } catch (error) {
        console.error('获取习题列表失败:', error)
        commit('SET_ERROR', error.message || '获取习题列表失败')
        commit('SET_EXERCISES', [])
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchDetail({ commit, dispatch }, display_id) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('get', { 
          url: AC_URL + `/api/v1/exercises/${display_id}/` 
        }, { root: true })
        
        // 获取单个习题对象
        const exercise = response.data.data || response.data

        console.log('获取到的习题详情:', exercise)
        
        // 设置当前习题（应该有专门的mutation）
        commit('SET_CURRENT_EXERCISE', exercise)
        commit('SET_ERROR', null)
        
        return exercise
      } catch (error) {
        console.error('获取习题失败:', error)
        commit('SET_ERROR', error.message || '获取习题失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createExercise({ commit, dispatch }, data) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/exercises/create/', 
          data 
        }, { root: true })
        
        // 创建习题通常返回创建的单个对象
        const newExercise = response.data.data || response.data
        
        // 重新获取习题列表以确保数据一致性
        try {
          const listResponse = await dispatch('get', { 
            url: AC_URL + '/api/v1/exercises/' 
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
        } catch {
          // 如果重新获取失败，至少添加新创建的习题
          const state = this.state.exercise
          const existingExercises = Array.isArray(state.exercises) ? state.exercises : []
          commit('SET_EXERCISES', [...existingExercises, newExercise])
        }
        
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('创建习题失败:', error)
        commit('SET_ERROR', error.message || '创建习题失败')
        commit('SET_EXERCISES', [])
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchSubmissions({ commit, dispatch }, params) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('get', { 
          url: AC_URL + '/api/v1/exercises/submissions/', 
          params 
        }, { root: true })
        
        console.log('提交记录API响应数据:', response.data)
        
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
        
        console.log('处理后的提交记录数组:', submissions)
        
        commit('SET_SUBMISSIONS', submissions)
        commit('SET_ERROR', null)
        return submissions
      } catch (error) {
        console.error('获取提交记录失败:', error)
        commit('SET_ERROR', error.message || '获取提交记录失败')
        commit('SET_SUBMISSIONS', [])
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchSubmissionDetail({ commit, dispatch }, display_id) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('get', { 
          url: AC_URL + `/api/v1/exercises/submissions/${display_id}/` 
        }, { root: true })
        
        // 获取单个提交记录对象
        const submission = response.data.data || response.data
    
        console.log('获取到的提交记录详情:', submission)
        
        // 设置当前提交记录
        commit('SET_CURRENT_SUBMISSION', submission)
        commit('SET_ERROR', null)
        
        return submission
      } catch (error) {
        console.error('获取提交记录失败:', error)
        commit('SET_ERROR', error.message || '获取提交记录失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async submitAnswer({ commit, dispatch }, data ) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('post', { 
          url: AC_URL + `/api/v1/exercises/submit/${data.display_id}/`, 
          data
        }, { root: true })
        // 提交答案的响应不应该设置到习题列表
        const submissionResult = response.data.data || response.data
        
        // 可以更新提交记录或当前习题状态
        commit('SET_SUBMISSION_RESULT', submissionResult) // 专门的mutation
        commit('SET_ERROR', null)
        
        return submissionResult
      } catch (error) {
        console.error('提交答案失败:', error)
        console.error('answer:', data.answer)
        console.error('data.display_id:', data.display_id)
        console.error('data:', data)
        console.error('请求的URL:', AC_URL + `/api/v1/exercises/submit/${data.display_id}/`)
        commit('SET_ERROR', error.message || '提交答案失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },


        // 全删除方法
    async deleteAllExercises({ commit, dispatch }) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/exercises/delete-all/', 
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
    async bulkDeleteExercises({ commit, dispatch }, displayIds) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/exercises/bulk-delete/', 
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
    },

    async deleteAllSubmissions({ commit, dispatch }) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/exercises/submissions/delete-all/', 
          data: {
            confirm: true
          } 
        }, { root: true })
        
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
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
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/exercises/submissions/bulk-delete/', 
          data: { display_ids: displayIds }
        }, { root: true })
        
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
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