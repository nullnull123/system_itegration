// src/store/modules/noteCompletion.js

// 直接定义AC_URL，避免可能的导入循环
const AC_URL = '/ai_class_workshop';

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
      // 确保正确处理对象类型
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

    async fetchList({ commit, dispatch }, params = {}) {
      commit('SET_LOADING', true)
      try {
        console.log('[NoteCompletion] 开始获取笔记列表...', params);
        
        // 关键修改：使用更全面的路径识别（确保被识别为智课工坊请求）
        const response = await dispatch('get', {
          url: `${AC_URL}/api/v1/notes/`,
          params,
          isWorkshop: true  // 明确标记为智课工坊请求
        }, { root: true })
  
        console.log('[NoteCompletion] Note API响应数据:', response.data)
  
        // 处理分页数据结构 (与 exercise 模块保持一致)
        let notes = []
        if (response.data.results) {
          // 分页格式: {count: 3, next: null, previous: null, results: Array(3)}
          notes = response.data.results
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // 嵌套数组格式: {data: [...]}
          notes = response.data.data
        } else if (Array.isArray(response.data)) {
          // 直接数组格式
          notes = response.data
        } else {
          // 其他情况
          console.warn('[NoteCompletion] Note 数据格式不识别:', response.data)
          notes = []
        }
  
        console.log('[NoteCompletion] 处理后的笔记数组:', notes)
  
        commit('SET_NOTES', notes)
        commit('SET_ERROR', null)
        return notes
      } catch (error) {
        console.error('[NoteCompletion] 获取笔记列表失败:', error)
        
        // 详细错误处理
        if (error.response) {
          console.error('[NoteCompletion] 错误详情:', {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers
          });
          
          // 401错误特殊处理 - 可能是token问题
          if (error.response.status === 401) {
            const detail = error.response.data?.detail || '';
            console.warn('[NoteCompletion] 401错误详情:', detail);
            
            // 只有在确定是认证问题时才清除token
            if (detail.includes('身份认证信息未提供') || 
                detail.includes('认证失败') || 
                detail.includes('令牌无效')) {
              console.log('[NoteCompletion] 检测到认证问题，不在此处清除token');
              // 注意：这里不直接清除token，由请求拦截器处理
            } else {
              console.log('[NoteCompletion] 401错误，但可能不是认证问题，保留token');
              commit('SET_ERROR', '您没有权限访问此资源');
            }
          } 
          // 403错误 - 权限不足
          else if (error.response.status === 403) {
            commit('SET_ERROR', '您没有权限访问此资源');
          } 
          // 其他错误
          else {
            const errorMessage = error.response.data?.message || 
                                error.response.data?.error || 
                                '获取笔记列表失败';
            commit('SET_ERROR', errorMessage);
          }
        } else if (error.request) {
          console.error('[NoteCompletion] 请求已发送但无响应:', error.request);
          commit('SET_ERROR', '网络请求超时或服务器无响应');
        } else {
          console.error('[NoteCompletion] 请求设置出错:', error.message);
          commit('SET_ERROR', '请求设置出错: ' + error.message);
        }
        
        commit('SET_NOTES', [])
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
  
    async fetchDetail({ commit, dispatch }, display_id) {
      if (!display_id) {
        console.error('[NoteCompletion] 缺少必要的display_id参数');
        commit('SET_ERROR', '缺少必要的笔记ID');
        throw new Error('缺少必要的笔记ID');
      }
      
      commit('SET_LOADING', true)
      try {
        console.log(`[NoteCompletion] 开始获取笔记详情 (display_id: ${display_id})...`);
        
        const response = await dispatch('get', {
          url: `${AC_URL}/api/v1/notes/${display_id}/`,
          isWorkshop: true
        }, { root: true })
  
        // 获取单个笔记对象
        const note = response.data.data || response.data
  
        console.log('[NoteCompletion] 获取到的笔记详情:', note)
  
        commit('SET_CURRENT_NOTE', note)
        commit('SET_ERROR', null)
        return note
      } catch (error) {
        console.error(`[NoteCompletion] 获取ID为 ${display_id} 的笔记详情失败:`, error)
        
        // 详细错误处理
        if (error.response) {
          if (error.response.status === 404) {
            commit('SET_ERROR', `ID为 ${display_id} 的笔记不存在`);
          } else if (error.response.status === 401) {
            const detail = error.response.data?.detail || '';
            console.warn('[NoteCompletion] 401错误详情:', detail);
            
            if (detail.includes('身份认证信息未提供')) {
              commit('SET_ERROR', '身份认证信息未提供，请重新登录');
            } else {
              commit('SET_ERROR', '您没有权限查看此笔记');
            }
          } else {
            commit('SET_ERROR', error.response.data?.message || '获取笔记详情失败');
          }
        } else {
          commit('SET_ERROR', '网络请求失败，请检查网络连接');
        }
        
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async uploadNote({ commit, dispatch }, data) {
      if (!data || !data.title || !data.original_content) {
        console.error('[NoteCompletion] 上传数据不完整', data);
        commit('SET_ERROR', '上传数据不完整，需要标题和原始内容');
        throw new Error('上传数据不完整');
      }
      
      commit('SET_LOADING', true)
      try {
        console.log('[NoteCompletion] 开始上传笔记...', data);
        
        const response = await dispatch('post', { 
          url: `${AC_URL}/api/v1/notes/upload/`, 
          data,
          isWorkshop: true
        }, { root: true })
        
        const noteData = response.data.data || response.data
        
        console.log('[NoteCompletion] 上传笔记响应:', noteData)
        
        commit('SET_CURRENT_NOTE', noteData)
        commit('SET_ERROR', null)
        return noteData
      } catch (error) {
        console.error('[NoteCompletion] 笔记上传失败:', error)
        
        // 详细错误处理
        if (error.response) {
          const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          error.response.data?.details ||
                          '笔记上传失败';
                          
          if (error.response.status === 400) {
            const errors = error.response.data?.errors || {};
            console.error('[NoteCompletion] 请求参数错误:', errors);
            commit('SET_ERROR', `上传失败: ${errorMessage}`);
          } else {
            commit('SET_ERROR', errorMessage);
          }
        } else {
          commit('SET_ERROR', '网络请求失败，请检查网络连接');
        }
        
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async completeNote({ commit, state, dispatch }) {
      if (!state.currentNote || !state.currentNote.id) {
        console.error('[NoteCompletion] 当前笔记不存在或ID缺失', state.currentNote);
        commit('SET_ERROR', '当前笔记不存在或ID缺失');
        throw new Error('当前笔记不存在或ID缺失');
      }
      
      commit('SET_LOADING', true)
      try {
        console.log('[NoteCompletion] 开始补全笔记 (ID: ' + state.currentNote.id + ')...');
        
        const response = await dispatch('post', { 
          url: `${AC_URL}/api/v1/notes/complete/`, 
          data: { note_id: state.currentNote.id },
          isWorkshop: true
        }, { root: true })

        const noteData = response.data.data || response.data

        console.log('[NoteCompletion] 补全笔记响应:', noteData)

        commit('SET_CURRENT_NOTE', noteData)
        commit('SET_ERROR', null)
        return noteData
      } catch (error) {
        console.error('[NoteCompletion] 笔记补全失败:', error)
        
        // 详细错误处理
        if (error.response) {
          const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          '笔记补全失败';
                          
          // 特殊错误处理
          if (error.response.status === 404) {
            commit('SET_ERROR', '原始笔记不存在');
          } else if (error.response.status === 400) {
            commit('SET_ERROR', '请求参数错误: ' + errorMessage);
          } else {
            commit('SET_ERROR', errorMessage);
          }
        } else {
          commit('SET_ERROR', '网络请求失败，请检查网络连接');
        }
        
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async completeNote_id({ commit, dispatch }, display_id) {
      if (!display_id) {
        console.error('[NoteCompletion] 缺少必要的display_id参数');
        commit('SET_ERROR', '缺少必要的笔记ID');
        throw new Error('缺少必要的笔记ID');
      }
      
      commit('SET_LOADING', true)
      try {
        console.log(`[NoteCompletion] 开始通过ID补全笔记 (display_id: ${display_id})...`);
        
        const response = await dispatch('post', { 
          url: `${AC_URL}/api/v1/notes/complete/${display_id}/`, 
          params: { overwrite: true },
          isWorkshop: true
        }, { root: true })

        const noteData = response.data.data || response.data

        console.log('[NoteCompletion] 通过ID补全笔记响应:', noteData)

        commit('SET_CURRENT_NOTE', noteData)
        commit('SET_ERROR', null)
        return noteData
      } catch (error) {
        console.error(`[NoteCompletion] 通过ID ${display_id} 补全笔记失败:`, error)
        
        // 详细错误处理
        if (error.response) {
          const errorMessage = error.response.data?.message || 
                          error.response.data?.error || 
                          '笔记补全失败';
                          
          if (error.response.status === 404) {
            commit('SET_ERROR', `ID为 ${display_id} 的笔记不存在`);
          } else {
            commit('SET_ERROR', errorMessage);
          }
        } else {
          commit('SET_ERROR', '网络请求失败，请检查网络连接');
        }
        
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    async coverNoteToServer({ commit, dispatch }, note) {
      if (!note || !note.display_id) {
        console.error('[NoteCompletion] 缺少必要的note对象或display_id', note);
        commit('SET_ERROR', '缺少必要的笔记信息');
        throw new Error('缺少必要的笔记信息');
      }
      
      commit('SET_LOADING', true)
      try {
        const displayId = note.display_id;
        const requestData = {
          title: note.title,
          subject: note.subject,
          grade: note.grade,
          original_content: note.original_content,
          completed_content: note.completed_content,
          completion_notes: note.completion_notes
        }
    
        console.log(`[NoteCompletion] 开始保存笔记 (display_id: ${displayId})...`, requestData);
        
        const response = await dispatch('post', {
          url: `${AC_URL}/api/v1/notes/cover/${displayId}/`, 
          data: requestData,
          isWorkshop: true
        }, { root: true })
    
        // 检查响应状态
        if (response.data.status === 'error') {
          console.error('[NoteCompletion] 笔记保存失败:', response.data.message)
          throw new Error(response.data.message || '笔记保存失败')
        }
    
        const noteData = response.data.data || response.data
    
        console.log('[NoteCompletion] 保存笔记响应:', noteData)

        commit('SET_CURRENT_NOTE', noteData)
        commit('SET_ERROR', null)
    
        return noteData
      } catch (error) {
        console.error('[NoteCompletion] 笔记保存失败:', error)
        
        // 详细错误处理
        if (error.response) {
          const errorMessage = error.response.data?.message || 
                              error.response.data?.error || 
                              error.response.data?.details ||
                              '笔记保存失败';
                              
          if (error.response.status === 404) {
            commit('SET_ERROR', '笔记不存在，无法保存');
          } else if (error.response.status === 400) {
            commit('SET_ERROR', '请求参数错误: ' + errorMessage);
          } else {
            commit('SET_ERROR', errorMessage);
          }
        } else {
          commit('SET_ERROR', '网络请求失败，请检查网络连接');
        }
    
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },


    // 全删除方法
    async deleteAllNotes({ commit, dispatch }) {
      commit('SET_LOADING', true)
      try {
        console.log('[NoteCompletion] 开始删除所有笔记...');
        
        const response = await dispatch('post', { 
          url: `${AC_URL}/api/v1/notes/delete-all/`, 
          data: { confirm: true },
          isWorkshop: true
        }, { root: true })
        
        console.log('[NoteCompletion] 删除所有笔记响应:', response.data)

        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('[NoteCompletion] 删除所有笔记失败:', error)
        
        // 详细错误处理
        if (error.response) {
          const errorMessage = error.response.data?.message || 
                              error.response.data?.error || 
                              '删除失败';
          commit('SET_ERROR', errorMessage);
        } else {
          commit('SET_ERROR', '网络请求失败，请检查网络连接');
        }
        
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },

    // 批量删除方法
    async bulkDeleteNotes({ commit, dispatch }, displayIds) {
      if (!displayIds || displayIds.length === 0) {
        console.error('[NoteCompletion] 缺少需要删除的笔记ID列表');
        commit('SET_ERROR', '缺少需要删除的笔记ID列表');
        throw new Error('缺少需要删除的笔记ID列表');
      }
      
      commit('SET_LOADING', true)
      try {
        console.log(`[NoteCompletion] 开始批量删除笔记 (${displayIds.length}个)...`, displayIds);
        
        const response = await dispatch('post', { 
          url: `${AC_URL}/api/v1/notes/bulk-delete/`, 
          data: { display_ids: displayIds },
          isWorkshop: true
        }, { root: true })
        
        console.log('[NoteCompletion] 批量删除笔记响应:', response.data)

        commit('SET_ERROR', null)
        return response.data
      } catch (error) {
        console.error('[NoteCompletion] 批量删除笔记失败:', error)
        
        // 详细错误处理
        if (error.response) {
          const errorMessage = error.response.data?.message || 
                              error.response.data?.error || 
                              '批量删除失败';
          commit('SET_ERROR', errorMessage);
        } else {
          commit('SET_ERROR', '网络请求失败，请检查网络连接');
        }
        
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