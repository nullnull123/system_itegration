const state = {
    lessonPlans: [],
    currentLesson: null,
    loading: false,
    error: null
  }
  
  const mutations = {
    SET_LESSON_PLANS: (state, lessonPlans) => {
      state.lessonPlans = lessonPlans
    },
    SET_CURRENT_LESSON: (state, lesson) => {
      state.currentLesson = lesson
    },
    SET_LOADING: (state, loading) => {
      state.loading = loading
    },
    SET_ERROR: (state, error) => {
      state.error = error
    }
  }
  
  const actions = {
    setCurrentLesson({ commit }, lesson) {
      commit('SET_CURRENT_LESSON', lesson)
    },

    async fetchLessonPlans({ commit }, params) {
      commit('SET_LOADING', true)
      try {
        // 这里应该调用 API
        const response = await this.$axios.get('/api/v1/prep/', { params })
        commit('SET_LESSON_PLANS', response.data.data)
        commit('SET_ERROR', null)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchLessonPlanDetail({ commit }, id) {
      commit('SET_LOADING', true)
      try {
        // 这里应该调用 API
        const response = await this.$axios.get(`/api/v1/prep/${id}/`)
        commit('SET_CURRENT_LESSON', response.data.data)
        commit('SET_ERROR', null)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async uploadLesson({ commit, dispatch }, data) {
      commit('SET_LOADING', true)
      try {
        // 修正 1: 使用 dispatch 调用根级别的 API action
        const response = await dispatch('post', { 
          url: '/api/v1/prep/upload/', 
          data 
        }, { root: true })

        const lessonData = response.data.data || response.data
        
        commit('SET_CURRENT_LESSON', lessonData)
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
    
    async generateOptimizedLesson({ commit, state, dispatch }) {
      commit('SET_LOADING', true)
      try {
        const lessonId = state.currentLesson?.id || state.currentLesson?.lesson_id

        if (!lessonId) {
          throw new Error('无法获取教案ID')
        }

        // 这里应该调用 API
        const response = await dispatch('post', { 
          url: '/api/v1/prep/generate/', 
          data: { lesson_id: lessonId } 
        }, { root: true })

        const lessonData = response.data.data || response.data

        commit('SET_CURRENT_LESSON', lessonData)
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
    
    async saveLessonToServer({ commit, dispatch }, lesson) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('post', { 
          url: '/api/v1/prep/save/', 
          data: lesson 
        }, { root: true })
        
        const lessonData = response.data.data || response.data
        
        commit('SET_CURRENT_LESSON', lessonData)
        commit('SET_ERROR', null)
        return lessonData
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error || 
                            error.message || 
                            '教案保存失败'
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