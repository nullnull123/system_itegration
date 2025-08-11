const state = {
    notes: [],
    currentNote: null,
    loading: false,
    error: null
  }
  
  const mutations = {
    SET_NOTES: (state, notes) => {
      state.notes = notes
    },
    SET_CURRENT_NOTE: (state, note) => {
      state.currentNote = note
    },
    SET_LOADING: (state, loading) => {
      state.loading = loading
    },
    SET_ERROR: (state, error) => {
      state.error = error
    }
  }
  
  const actions = {

    // 添加这个 action，确保能手动设置 currentNote
    setCurrentNote({ commit }, note) {
      commit('SET_CURRENT_NOTE', note)
    },

    async fetchNotes({ commit, dispatch }, params) {
      commit('SET_LOADING', true)
      try {
        // 这里应该调用 API
        const response = await dispatch('get', { 
          url: '/api/v1/notes/', 
          params 
        }, { root: true })
        commit('SET_NOTES', response.data.data)
        commit('SET_ERROR', null)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchNoteDetail({ commit, dispatch }, id) {
      commit('SET_LOADING', true)
      try {
        // 这里应该调用 API
        const response = await dispatch('get', { 
          url: `/api/v1/notes/${id}/` 
        }, { root: true })
        commit('SET_CURRENT_NOTE', response.data.data)
        commit('SET_ERROR', null)
      } catch (error) {
        commit('SET_ERROR', error.message)
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async uploadNote({ commit, dispatch }, data) {
      commit('SET_LOADING', true)
      try {
        // 这里应该调用 API
        const response = await dispatch('post', { 
          url: '/api/v1/notes/upload/', 
          data 
        }, { root: true })
        commit('SET_CURRENT_NOTE', response.data.data)
        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async completeNote({ commit, state, dispatch }) {
      commit('SET_LOADING', true)
      try {
        // 这里应该调用 API
        const response = await dispatch('post', { 
          url: '/api/v1/notes/complete/', 
          data: { note_id: state.currentNote?.id } 
        }, { root: true })

        const noteData = response.data.data || response.data

        commit('SET_CURRENT_NOTE', noteData)
        commit('SET_ERROR', null)
        return noteData
      } catch (error) {
        const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error || 
                        error.message || 
                        '笔记补全失败'
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