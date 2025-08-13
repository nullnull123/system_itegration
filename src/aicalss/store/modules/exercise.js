import {AC_URL} from '@/api/request'
const state = {
    exercises: [],
    submissions: [],
    currentExercise: null,
    loading: false,
    error: null
  }
  
  const mutations = {
    SET_EXERCISES: (state, exercises) => {
      state.exercises = exercises
    },
    SET_SUBMISSIONS: (state, submissions) => {
      state.submissions = submissions
    },
    SET_CURRENT_EXERCISE: (state, exercise) => {
      state.currentExercise = exercise
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
        // 这里应该调用 API
        const response = await dispatch('get', { 
          url: AC_URL + '/api/v1/exercises/', 
          params 
        }, { root: true })
        
        // 确保返回一致的数据结构
        const exercises = response.data.data || response.data
        
        commit('SET_EXERCISES', exercises)
        commit('SET_ERROR', null)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchExercise({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        // 这里应该调用 API
        const response = await dispatch('get', { 
          url: AC_URL + `/api/v1/exercises/${id}/` 
        }, { root: true })
        
        // 确保返回一致的数据结构
        const exercises = response.data.data || response.data
        
        commit('SET_EXERCISES', exercises)
        commit('SET_ERROR', null)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createExercise({ commit, dispatch }, data) {
      commit('SET_LOADING', true)
      try {
        // 这里应该调用 API
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/exercises/create/', 
          data 
        }, { root: true })
        
        // 确保返回一致的数据结构
        const exercises = response.data.data || response.data
        
        commit('SET_EXERCISES', exercises)
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchSubmissions({ commit, dispatch }, params) {
      commit('SET_LOADING', true)
      try {
        // 这里应该调用 API
        const response = await dispatch('get', { 
          url: AC_URL + '/api/v1/exercises/submissions/', 
          params 
        }, { root: true })
        
        // 确保返回一致的数据结构
        const exercises = response.data.data || response.data
        
        commit('SET_EXERCISES', exercises)
        commit('SET_ERROR', null)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async submitAnswer({ commit, dispatch }, data) {
      commit('SET_LOADING', true)
      try {
        // 这里应该调用 API
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/exercises/submit/', 
          data 
        }, { root: true })
        
        // 确保返回一致的数据结构
        const exercises = response.data.data || response.data
        
        commit('SET_EXERCISES', exercises)
        commit('SET_ERROR', null)
      } catch (error) {
        commit('SET_ERROR', error.message)
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