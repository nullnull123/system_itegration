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
    async fetchExercises({ commit, dispatch }, params) {
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
    
    async fetchExercise({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('get', { 
          url: AC_URL + `/api/v1/exercises/${id}/` 
        }, { root: true })
        
        // 获取单个习题对象
        const exercise = response.data.data || response.data
        
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
        
        // 处理提交记录数据（可能需要专门的state来存储）
        let submissions = []
        if (response.data.results) {
          submissions = response.data.results
        } else if (Array.isArray(response.data.data)) {
          submissions = response.data.data
        } else if (Array.isArray(response.data)) {
          submissions = response.data
        } else {
          submissions = []
        }
        
        commit('SET_SUBMISSIONS', submissions) // 应该有专门的mutation
        commit('SET_ERROR', null)
        
        return submissions
      } catch (error) {
        console.error('获取提交记录失败:', error)
        commit('SET_ERROR', error.message || '获取提交记录失败')
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async submitAnswer({ commit, dispatch }, data) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/exercises/submit/', 
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
        commit('SET_ERROR', error.message || '提交答案失败')
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