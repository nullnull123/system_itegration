import {AC_URL} from '@/api/request'

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
    SET_CURRENT_NOTE: (state, note) => { // 确保处理对象
      state.currentNote = note && typeof note === 'object' ? note : null
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

    async fetchList({ commit, dispatch }, params) { // 方法名改为 fetchList
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('get', {
          url: AC_URL + '/api/v1/notes/',
          params
        }, { root: true })
  
        console.log('Note API响应数据:', response.data)
  
        // 处理分页数据结构 (与 exercise 模块保持一致)
        let notes = []
        if (response.data.results) {
          // 分页格式: {count: 3, next: null, previous: null, results: Array(3)}
          notes = response.data.results
        } else if (Array.isArray(response.data.data)) {
          // 嵌套数组格式: {data: [...]}
          notes = response.data.data
        } else if (Array.isArray(response.data)) {
          // 直接数组格式
          notes = response.data
        } else {
          // 其他情况
          console.warn('Note 数据格式不识别:', response.data)
          notes = []
        }
  
        console.log('处理后的笔记数组:', notes)
  
        commit('SET_NOTES', notes) // 使用 SET_NOTES mutation
        commit('SET_ERROR', null)
        return notes // 返回处理后的数据
      } catch (error) {
        console.error('获取笔记列表失败:', error)
        // 提供更详细的错误信息
        const errorMessage = error.response?.data?.message ||
                             error.response?.data?.detail ||
                             error.message ||
                             '获取笔记列表失败'
        commit('SET_ERROR', errorMessage)
        commit('SET_NOTES', []) // 确保失败时列表为空数组
        throw error // 重新抛出错误
      } finally {
        commit('SET_LOADING', false)
      }
    },
  
    async fetchDetail({ commit, dispatch }, display_id) { // 方法名改为 fetchDetail
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('get', {
          url: AC_URL + `/api/v1/notes/${display_id}/` // 使用 display_id
        }, { root: true })
  
        // 获取单个笔记对象 (与 exercise 模块保持一致)
        const note = response.data.data || response.data
  
        console.log('获取到的笔记详情:', note)
  
        // 设置当前笔记 (使用 SET_CURRENT_NOTE mutation)
        commit('SET_CURRENT_NOTE', note)
        commit('SET_ERROR', null)
  
        return note // 返回获取到的对象
      } catch (error) {
        console.error('获取笔记详情失败:', error)
        // 提供更详细的错误信息
        const errorMessage = error.response?.data?.message ||
                             error.response?.data?.detail ||
                             error.message ||
                             '获取笔记详情失败'
        commit('SET_ERROR', errorMessage)
        // 根据需要决定是否抛出错误
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async uploadNote({ commit, dispatch }, data) {
      commit('SET_LOADING', true)
      try {
        // 这里应该调用 API
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/notes/upload/', 
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
          url: AC_URL + '/api/v1/notes/complete/', 
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
    },

    async saveNoteToServer({ commit, dispatch }, note) {
      commit('SET_LOADING', true)
      try {
        // 调用根级别的 post action 发送请求
        const response = await dispatch('post', {
          url: AC_URL + '/api/v1/notes/save/', // 对应的 API 端点
          data: note // 将整个 note 对象作为数据发送
        }, { root: true })
  
        // 处理响应数据 (与 saveLessonToServer 保持一致)
        const noteData = response.data.data || response.data
  
        // 更新 state 中的当前笔记
        commit('SET_CURRENT_NOTE', noteData)
        // 清除之前的错误
        commit('SET_ERROR', null)
        // 返回保存后的数据
        return noteData
      } catch (error) {
        // 提供更详细的错误信息 (与 saveLessonToServer 保持一致)
        const errorMessage = error.response?.data?.message ||
                            error.response?.data?.error ||
                            error.message ||
                            '笔记保存失败'
        commit('SET_ERROR', errorMessage)
        // 重新抛出错误，以便调用者可以处理
        throw error
      } finally {
        // 无论成功或失败，最后都重置加载状态
        commit('SET_LOADING', false)
      }
    },


        // 全删除方法
    async deleteAllNotes({ commit, dispatch }) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/notes/delete-all/', 
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
    async bulkDeleteNotes({ commit, dispatch }, displayIds) {
      commit('SET_LOADING', true)
      try {
        const response = await dispatch('post', { 
          url: AC_URL + '/api/v1/notes/bulk-delete/', 
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