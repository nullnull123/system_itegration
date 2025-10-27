import { AC_URL } from '@/api/request'

const state = {
  // --- 保持原有的 Lesson Plan 相关状态 ---
  preps: [], // 存储教案列表
  currentPrep: null, // 存储当前教案详情

  // --- 新增 Course 相关状态 ---
  courses: [], // 存储课程列表
  currentCourse: null, // 存储当前课程详情

  // --- 新增 Outline 相关状态 ---
  outlines: [], // 存储大纲列表
  currentOutline: null, // 存储当前大纲详情

  // --- 新增 KnowledgeList 相关状态 ---
  knowledgeLists: [], // 存储知识列表列表
  currentKnowledgeList: null, // 存储当前知识列表详情

  // --- 新增 ClassPlan 相关状态 ---
  classPlans: [], // 存储教学计划列表
  currentClassPlan: null, // 存储当前教学计划详情

  loading: false,
  error: null
}

const mutations = {
  // --- 保持原有的 Lesson Plan 相关 mutations ---
  SET_PREPS: (state, preps) => {
    state.preps = preps
  },
  SET_CURRENT_PREP: (state, prep) => {
    state.currentPrep = prep && typeof prep === 'object' ? prep : null
  },

  // --- 新增 Course 相关 mutations ---
  SET_COURSES: (state, courses) => {
    state.courses = courses
  },
  SET_CURRENT_COURSE: (state, course) => {
    state.currentCourse = course && typeof course === 'object' ? course : null
  },

  // --- 新增 Outline 相关 mutations ---
  SET_OUTLINES: (state, outlines) => {
    state.outlines = outlines
  },
  SET_CURRENT_OUTLINE: (state, outline) => {
    state.currentOutline = outline && typeof outline === 'object' ? outline : null
  },

  // --- 新增 KnowledgeList 相关 mutations ---
  SET_KNOWLEDGE_LISTS: (state, knowledgeLists) => {
    state.knowledgeLists = knowledgeLists
  },
  SET_CURRENT_KNOWLEDGE_LIST: (state, knowledgeList) => {
    state.currentKnowledgeList = knowledgeList && typeof knowledgeList === 'object' ? knowledgeList : null
  },

  // --- 新增 ClassPlan 相关 mutations ---
  SET_CLASS_PLANS: (state, classPlans) => {
    state.classPlans = classPlans
  },
  SET_CURRENT_CLASS_PLAN: (state, classPlan) => {
    state.currentClassPlan = classPlan && typeof classPlan === 'object' ? classPlan : null
  },

  SET_LOADING: (state, loading) => {
    state.loading = loading
  },
  SET_ERROR: (state, error) => {
    state.error = error
  }
}

const actions = {
  // --- 完善 Lesson Plan 相关 actions ---
  setCurrentPrep({ commit }, prep) {
    commit('SET_CURRENT_PREP', prep)
  },

  async fetchLessonPlanList({ commit, dispatch }, params) { // 保持原方法名，用于教案列表
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('get', {
        url: AC_URL + '/api/v1/prep/lesson-plan',
        params
      }, { root: true })

      console.log('LessonPlan API响应数据:', response.data)

      let preps = []
      if (response.data.results) {
        preps = response.data.results
      } else if (Array.isArray(response.data.data)) {
        preps = response.data.data
      } else if (Array.isArray(response.data)) {
        preps = response.data
      } else {
        console.warn('LessonPlan 数据格式不识别:', response.data)
        preps = []
      }

      console.log('处理后的教案数组:', preps)

      commit('SET_PREPS', preps)
      commit('SET_ERROR', null)
      return preps
    } catch (error) {
      console.error('获取教案列表失败:', error)
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.detail ||
                           error.message ||
                           '获取教案列表失败'
      commit('SET_ERROR', errorMessage)
      commit('SET_PREPS', [])
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchLessonPlanDetail({ commit, dispatch }, display_id) { // 保持原方法名，用于教案详情
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('get', {
        url: AC_URL + `/api/v1/prep/lesson-plan/${display_id}/`
      }, { root: true })

      const prep = response.data.data || response.data
      console.log('获取到的教案详情:', prep)

      commit('SET_CURRENT_PREP', prep)
      commit('SET_ERROR', null)

      return prep
    } catch (error) {
      console.error('获取教案详情失败:', error)
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.detail ||
                           error.message ||
                           '获取教案详情失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createLessonPlan({ commit, dispatch }, data) { // 重命名 action
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('post', {
        url: AC_URL + '/api/v1/prep/lesson-plan/upload/',
        data
      }, { root: true })

      const lessonData = response.data.data || response.data

      commit('SET_CURRENT_PREP', lessonData) // 可能需要调整，如果详情页也用这个 state
      commit('SET_ERROR', null)
      return lessonData

    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          '教案创建失败'
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

      const response = await dispatch('post', {
        url: AC_URL + '/api/v1/prep/lesson-plan/generate/',
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

  async generateOptimizedLesson_id({ commit, dispatch }, display_id) {
    commit('SET_LOADING', true)
    try {
      // 关键修改：使用GET请求并添加overwrite参数
      const response = await dispatch('post', {
        url: AC_URL + `/api/v1/prep/lesson-plan/generate/${display_id}/`,
        params: { overwrite: true }  // 添加覆盖参数
      }, { root: true })
  
      // 处理返回数据 - 将优化后的内容覆盖原始内容
      const lessonData = response.data.data || response.data;
      
      // 关键修改：将优化后的内容覆盖原始内容
      if (lessonData.optimized_content) {
        lessonData.original_content = lessonData.optimized_content;
        
        // 清理优化相关字段（避免后续操作中误用）
        delete lessonData.optimized_content;
        delete lessonData.optimization_notes;
        delete lessonData.optimization_time;
      }
  
      commit('SET_CURRENT_PREP', lessonData)
      commit('SET_ERROR', null)
      return lessonData
  
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                        error.response?.data?.error ||
                        error.message ||
                        '教案优化失败'
      commit('SET_ERROR', errorMessage)
      console.error('教案优化请求失败:', {
        url: AC_URL + `/api/v1/prep/lesson-plan/generate/${display_id}/?overwrite=true`,
        status: error.response?.status,
        data: error.response?.data
      })
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateLessonPlan({ commit, dispatch }, data) { // 重命名 action
    commit('SET_LOADING', true)
    try {
      const displayId = data.display_id || data.id
      if (!displayId) {
        throw new Error('缺少教案ID')
      }

      // 准备要发送的数据（只发送需要更新的字段）
      const requestData = {
        title: data.title,
        subject: data.subject,
        grade: data.grade,
        duration: data.duration,
        lesson_number: data.lesson_number,
        original_content: data.original_content,
        optimized_content: data.optimized_content,
        optimization_notes: data.optimization_notes,
        optimization_time: data.optimization_time
      }

      const response = await dispatch('post', {
        url: AC_URL + `/api/v1/prep/lesson-plan/cover/${displayId}/`,
        data: requestData
      }, { root: true })

      if (response.data.status === 'error') {
        throw new Error(response.data.message || '教案保存失败')
      }

      const lessonData = response.data.data || response.data

      commit('SET_CURRENT_PREP', lessonData)
      commit('SET_ERROR', null)

      return lessonData
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.response?.data?.details ||
                          error.message ||
                          '教案保存失败'
      commit('SET_ERROR', errorMessage)

      if (error.response?.status === 404) {
        console.error('教案不存在:', errorMessage)
      } else if (error.response?.status === 400) {
        console.error('参数错误:', errorMessage)
      }

      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteAllLessonPlans({ commit, dispatch }) { // 重命名 action
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('post', {
        url: AC_URL + '/api/v1/prep/lesson-plan/delete-all/',
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
                          '删除所有教案失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async bulkDeleteLessonPlans({ commit, dispatch }, displayIds) { // 重命名 action
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('post', {
        url: AC_URL + '/api/v1/prep/lesson-plan/bulk-delete/',
        data: { display_ids: displayIds }
      }, { root: true })

      commit('SET_ERROR', null)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          '批量删除教案失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // --- 新增 Course 相关 actions ---
  async fetchCourseList({ commit, dispatch }, params) {
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('get', {
        url: AC_URL + '/api/v1/prep/course',
        params
      }, { root: true })

      console.log('Course API响应数据:', response.data)

      let courses = []
      if (response.data.results) {
        courses = response.data.results
      } else if (Array.isArray(response.data.data)) {
        courses = response.data.data
      } else if (Array.isArray(response.data)) {
        courses = response.data
      } else {
        console.warn('Course 数据格式不识别:', response.data)
        courses = []
      }

      console.log('处理后的课程数组:', courses)

      commit('SET_COURSES', courses)
      commit('SET_ERROR', null)
      return courses
    } catch (error) {
      console.error('获取课程列表失败:', error)
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.detail ||
                           error.message ||
                           '获取课程列表失败'
      commit('SET_ERROR', errorMessage)
      commit('SET_COURSES', [])
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchCourseDetail({ commit, dispatch }, display_id) {
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('get', {
        url: AC_URL + `/api/v1/prep/course/${display_id}/`
      }, { root: true })

      const course = response.data.data || response.data
      console.log('获取到的课程详情:', course)

      commit('SET_CURRENT_COURSE', course)
      commit('SET_ERROR', null)

      return course
    } catch (error) {
      console.error('获取课程详情失败:', error)
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.detail ||
                           error.message ||
                           '获取课程详情失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createCourse({ commit, dispatch }, data) {
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('post', {
        url: AC_URL + '/api/v1/prep/course/upload/',
        data // data 只包含 { name: '...' }
      }, { root: true })

      const courseData = response.data.data || response.data

      commit('SET_ERROR', null)
      return courseData

    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          '课程创建失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateCourse({ commit, dispatch }, data) {
    commit('SET_LOADING', true)
    try {
      const displayId = data.display_id || data.id
      if (!displayId) {
        throw new Error('缺少课程ID')
      }

      const requestData = {
        name: data.name
      }

      const response = await dispatch('post', {
        url: AC_URL + `/api/v1/prep/course/cover/${displayId}/`,
        data: requestData
      }, { root: true })

      if (response.data.status === 'error') {
        throw new Error(response.data.message || '课程更新失败')
      }

      const courseData = response.data.data || response.data

      commit('SET_ERROR', null)

      return courseData
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.response?.data?.details ||
                          error.message ||
                          '课程更新失败'
      commit('SET_ERROR', errorMessage)

      if (error.response?.status === 404) {
        console.error('课程不存在:', errorMessage)
      } else if (error.response?.status === 400) {
        console.error('参数错误:', errorMessage)
      }

      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteAllCourses({ commit, dispatch }) {
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('post', {
        url: AC_URL + '/api/v1/prep/course/delete-all/',
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
                          '删除所有课程失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async bulkDeleteCourses({ commit, dispatch }, displayIds) {
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('post', {
        url: AC_URL + '/api/v1/prep/course/bulk-delete/',
        data: { display_ids: displayIds }
      }, { root: true })

      commit('SET_ERROR', null)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          '批量删除课程失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // --- 新增 Outline 相关 actions ---
  async fetchOutlineList({ commit, dispatch }, params) {
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('get', {
        url: AC_URL + '/api/v1/prep/outline',
        params
      }, { root: true })

      console.log('Outline API响应数据:', response.data)

      let outlines = []
      if (response.data.results) {
        outlines = response.data.results
      } else if (Array.isArray(response.data.data)) {
        outlines = response.data.data
      } else if (Array.isArray(response.data)) {
        outlines = response.data
      } else {
        console.warn('Outline 数据格式不识别:', response.data)
        outlines = []
      }

      console.log('处理后的大纲数组:', outlines)

      commit('SET_OUTLINES', outlines)
      commit('SET_ERROR', null)
      return outlines
    } catch (error) {
      console.error('获取大纲列表失败:', error)
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.detail ||
                           error.message ||
                           '获取大纲列表失败'
      commit('SET_ERROR', errorMessage)
      commit('SET_OUTLINES', [])
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchOutlineDetail({ commit, dispatch }, display_id) {
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('get', {
        url: AC_URL + `/api/v1/prep/outline/${display_id}/`
      }, { root: true })

      const outline = response.data.data || response.data
      console.log('获取到的大纲详情:', outline)

      commit('SET_CURRENT_OUTLINE', outline)
      commit('SET_ERROR', null)

      return outline
    } catch (error) {
      console.error('获取大纲详情失败:', error)
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.detail ||
                           error.message ||
                           '获取大纲详情失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async createOutline({ commit, dispatch }, data) {
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('post', {
        url: AC_URL + '/api/v1/prep/outline/upload/',
        data
      }, { root: true })

      const outlineData = response.data.data || response.data

      commit('SET_ERROR', null)
      return outlineData

    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          '大纲创建失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async updateOutline({ commit, dispatch }, data) {
    commit('SET_LOADING', true)
    try {
      const displayId = data.display_id || data.id
      if (!displayId) {
        throw new Error('缺少大纲ID')
      }

      const requestData = {
        title: data.title,
        subject: data.subject,
        grade: data.grade,
        original_content: data.original_content
      }

      const response = await dispatch('post', {
        url: AC_URL + `/api/v1/prep/outline/cover/${displayId}/`,
        data: requestData
      }, { root: true })

      if (response.data.status === 'error') {
        throw new Error(response.data.message || '大纲更新失败')
      }

      const outlineData = response.data.data || response.data

      commit('SET_ERROR', null)

      return outlineData
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.response?.data?.details ||
                          error.message ||
                          '大纲更新失败'
      commit('SET_ERROR', errorMessage)

      if (error.response?.status === 404) {
        console.error('大纲不存在:', errorMessage)
      } else if (error.response?.status === 400) {
        console.error('参数错误:', errorMessage)
      }

      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteAllOutlines({ commit, dispatch }) {
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('post', {
        url: AC_URL + '/api/v1/prep/outline/delete-all/',
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
                          '删除所有大纲失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async bulkDeleteOutlines({ commit, dispatch }, displayIds) {
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('post', {
        url: AC_URL + '/api/v1/prep/outline/bulk-delete/',
        data: { display_ids: displayIds }
      }, { root: true })

      commit('SET_ERROR', null)
      return response.data
    } catch (error) {
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          '批量删除大纲失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // --- 新增 KnowledgeList 相关 actions ---
  async fetchKnowledgeList({ commit, dispatch }, params) { // 列表视图
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('get', {
        url: AC_URL + '/api/v1/prep/knowledge-list',
        params
      }, { root: true })

      console.log('KnowledgeList API响应数据:', response.data)

      let knowledgeLists = []
      if (response.data.results) {
        knowledgeLists = response.data.results
      } else if (Array.isArray(response.data.data)) {
        knowledgeLists = response.data.data
      } else if (Array.isArray(response.data)) {
        knowledgeLists = response.data
      } else {
        console.warn('KnowledgeList 数据格式不识别:', response.data)
        knowledgeLists = []
      }

      console.log('处理后的知识列表数组:', knowledgeLists)

      commit('SET_KNOWLEDGE_LISTS', knowledgeLists)
      commit('SET_ERROR', null)
      return knowledgeLists
    } catch (error) {
      console.error('获取知识列表失败:', error)
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.detail ||
                           error.message ||
                           '获取知识列表失败'
      commit('SET_ERROR', errorMessage)
      commit('SET_KNOWLEDGE_LISTS', [])
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchKnowledgeListDetail({ commit, dispatch }, display_id) { // 详情视图
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('get', {
        url: AC_URL + `/api/v1/prep/knowledge-list/${display_id}/`
      }, { root: true })

      const knowledgeList = response.data.data || response.data
      console.log('获取到的知识列表详情:', knowledgeList)

      commit('SET_CURRENT_KNOWLEDGE_LIST', knowledgeList)
      commit('SET_ERROR', null)

      return knowledgeList
    } catch (error) {
      console.error('获取知识列表详情失败:', error)
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.detail ||
                           error.message ||
                           '获取知识列表详情失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // Note: KnowledgeList 通常不直接创建或删除，由 Outline 或 Course 管理

  // --- 新增 ClassPlan 相关 actions ---
  async fetchClassPlanList({ commit, dispatch }, params) { // 列表视图
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('get', {
        url: AC_URL + '/api/v1/prep/classplan',
        params
      }, { root: true })

      console.log('ClassPlan API响应数据:', response.data)

      let classPlans = []
      if (response.data.results) {
        classPlans = response.data.results
      } else if (Array.isArray(response.data.data)) {
        classPlans = response.data.data
      } else if (Array.isArray(response.data)) {
        classPlans = response.data
      } else {
        console.warn('ClassPlan 数据格式不识别:', response.data)
        classPlans = []
      }

      console.log('处理后的教学计划数组:', classPlans)

      commit('SET_CLASS_PLANS', classPlans)
      commit('SET_ERROR', null)
      return classPlans
    } catch (error) {
      console.error('获取教学计划列表失败:', error)
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.detail ||
                           error.message ||
                           '获取教学计划列表失败'
      commit('SET_ERROR', errorMessage)
      commit('SET_CLASS_PLANS', [])
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchClassPlanDetail({ commit, dispatch }, display_id) { // 详情视图
    commit('SET_LOADING', true)
    try {
      const response = await dispatch('get', {
        url: AC_URL + `/api/v1/prep/classplan/${display_id}/`
      }, { root: true })

      const classPlan = response.data.data || response.data
      console.log('获取到的教学计划详情:', classPlan)

      commit('SET_CURRENT_CLASS_PLAN', classPlan)
      commit('SET_ERROR', null)

      return classPlan
    } catch (error) {
      console.error('获取教学计划详情失败:', error)
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.detail ||
                           error.message ||
                           '获取教学计划详情失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  }

  // Note: ClassPlan 通常不直接创建或删除，由 KnowledgeList 管理
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}