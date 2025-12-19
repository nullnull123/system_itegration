// src/store/modules/smartPrep.js

// 注意：不再需要单独导入axios，因为我们将通过Vuex dispatch使用配置好的实例
const AC_URL = '/ai_class_workshop'; // 直接定义AC_URL，避免循环依赖

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
  error: null,

  teachingSuggestions: [], // 存储教学建议列表
  currentTeachingSuggestion: null, // 存储当前教学建议详情
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
  },

  // --- 新增 TeachingSuggestion 相关 mutations ---
  SET_TEACHING_SUGGESTIONS: (state, suggestions) => {
    state.teachingSuggestions = suggestions
  },
  SET_CURRENT_TEACHING_SUGGESTION: (state, suggestion) => {
    state.currentTeachingSuggestion = suggestion && typeof suggestion === 'object' ? suggestion : null
  },
}

const actions = {
  // --- 完善 Lesson Plan 相关 actions ---
  setCurrentPrep({ commit }, prep) {
    commit('SET_CURRENT_PREP', prep)
  },

  async fetchLessonPlanList({ commit, dispatch }, params) {
    commit('SET_LOADING', true)
    try {
      console.log('[SmartPrep] 开始获取教案列表...');
      
      // 关键修改：使用根store的get方法，并标记为智课工坊请求
      const response = await dispatch('get', {
        url: `${AC_URL}/api/v1/prep/lesson-plan`,
        params,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      console.log('[SmartPrep] LessonPlan API响应数据:', response.data)

      let preps = []
      if (response.data.results) {
        preps = response.data.results
      } else if (Array.isArray(response.data.data)) {
        preps = response.data.data
      } else if (Array.isArray(response.data)) {
        preps = response.data
      } else {
        console.warn('[SmartPrep] LessonPlan 数据格式不识别:', response.data)
        preps = []
      }

      console.log('[SmartPrep] 处理后的教案数组:', preps)

      commit('SET_PREPS', preps)
      commit('SET_ERROR', null)
      return preps
    } catch (error) {
      console.error('[SmartPrep] 获取教案列表失败:', error)
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

  async fetchLessonPlanDetail({ commit, dispatch }, display_id) {
    commit('SET_LOADING', true)
    try {
      console.log(`[SmartPrep] 开始获取教案详情 (display_id: ${display_id})...`);
      
      // 关键修改：使用根store的get方法，并标记为智课工坊请求
      const response = await dispatch('get', {
        url: `${AC_URL}/api/v1/prep/lesson-plan/${display_id}/`,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      const prep = response.data.data || response.data
      console.log('[SmartPrep] 获取到的教案详情:', prep)

      commit('SET_CURRENT_PREP', prep)
      commit('SET_ERROR', null)

      return prep
    } catch (error) {
      console.error('[SmartPrep] 获取教案详情失败:', error)
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

  async createLessonPlan({ commit, dispatch }, data) {
    commit('SET_LOADING', true)
    try {
      console.log('[SmartPrep] 开始创建教案...', data);
      
      // 关键修改：使用根store的post方法，并标记为智课工坊请求
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/lesson-plan/upload/`,
        data,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      const lessonData = response.data.data || response.data
      console.log('[SmartPrep] 创建教案响应:', lessonData)

      commit('SET_CURRENT_PREP', lessonData)
      commit('SET_ERROR', null)
      return lessonData

    } catch (error) {
      console.error('[SmartPrep] 教案创建失败:', error)
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

  async fetchOptimizationPrompt({ commit, dispatch }, { display_id }) {
    commit('SET_LOADING', true)
    try {
      console.log(`[SmartPrep] 获取优化提示词 (display_id: ${display_id})...`);
      
      // 两个端口都是POST，使用post方法
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/lesson-plan/generate/${display_id}/?preview=true`,
        params: { 
          preview: true  // 作为查询参数
        },
        // 没有请求体
        isWorkshop: true
      }, { root: true })

      const promptData = response.data
      console.log('[SmartPrep] 获取到的优化提示词:', promptData)
      
      commit('SET_ERROR', null)
      return promptData
    } catch (error) {
      console.error('[SmartPrep] 获取优化提示词失败:', error)
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          '获取优化提示词失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  // === 修正：应用优化教案 (POST请求) ===
  async applyOptimizedLesson({ commit, dispatch }, { display_id, custom_prompt }) {
    commit('SET_LOADING', true);
    commit('SET_ERROR', null);
    try {
      console.log(`[SmartPrep Vuex] 应用优化教案 (display_id: ${display_id})...`);
  
      // 调用API
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/lesson-plan/generate/${display_id}/?overwrite=true`,
        data: {
          custom_prompt: custom_prompt
        },
        isWorkshop: true
      }, { root: true });
  
      console.log('[SmartPrep Vuex] 优化教案原始响应:', response);
  
      // 1. 首先验证响应结构
      if (!response || !response.data || response.data.status !== 'success') {
        const errorMsg = response?.data?.message || '教案优化失败，响应格式不正确';
        console.error('[SmartPrep Vuex] 无效的API响应:', response);
        throw new Error(errorMsg);
      }
  
      // 2. 确保data和lesson_plan存在
      if (!response.data.data || !response.data.data.lesson_plan) {
        console.error('[SmartPrep Vuex] 响应中缺少lesson_plan数据:', response.data);
        throw new Error('API响应中缺少教案数据');
      }
  
      // 3. 提取教案数据
      const lessonPlanData = response.data.data.lesson_plan;
      
      // 4. 创建安全的教案副本
      const safeLessonPlanData = JSON.parse(JSON.stringify(lessonPlanData));
      
      // 5. 特别处理optimized_content可能为null的情况
      if (safeLessonPlanData.optimized_content === null) {
        console.warn('[SmartPrep Vuex] optimized_content为null，使用original_content作为替代');
        safeLessonPlanData.optimized_content = safeLessonPlanData.original_content || '';
      }
      
      // 6. 确保必要字段存在
      if (!('original_content' in safeLessonPlanData)) {
        console.warn('[SmartPrep Vuex] 教案数据中缺少original_content字段');
        safeLessonPlanData.original_content = '';
      }
      if (!('optimized_content' in safeLessonPlanData)) {
        console.warn('[SmartPrep Vuex] 教案数据中缺少optimized_content字段');
        safeLessonPlanData.optimized_content = safeLessonPlanData.original_content || '';
      }
  
      // 7. 设置当前教案
      commit('SET_CURRENT_PREP', safeLessonPlanData);
  
      // 8. 处理教学建议
      let safeTeachingSuggestionData;
      if (response.data.data.teaching_suggestion) {
        // 深拷贝教学建议
        safeTeachingSuggestionData = JSON.parse(JSON.stringify(response.data.data.teaching_suggestion));
        
        // 确保所有前端可能访问的字段都存在
        const ensureField = (field, defaultValue = '') => {
          if (!(field in safeTeachingSuggestionData) || safeTeachingSuggestionData[field] === null) {
            console.warn(`[SmartPrep Vuex] 教学建议中缺少"${field}"字段，已设置默认值`);
            safeTeachingSuggestionData[field] = defaultValue;
          }
        };
        
        // 根据响应示例确保这些字段存在
        ensureField('lecture_suggestions');
        ensureField('engagement_suggestions');
        ensureField('teacher_resources');
        ensureField('generated_at', new Date().toISOString());
      } else {
        // 如果API没有返回教学建议，创建一个安全的默认结构
        console.warn('[SmartPrep Vuex] API响应中缺少teaching_suggestion字段');
        safeTeachingSuggestionData = {
          lecture_suggestions: '',
          engagement_suggestions: '',
          teacher_resources: '',
          generated_at: new Date().toISOString()
        };
      }
  
      // 9. 设置当前教学建议
      commit('SET_CURRENT_TEACHING_SUGGESTION', safeTeachingSuggestionData);
  
      commit('SET_ERROR', null);
      
      // 10. 返回结构化的结果
      return {
        lesson_plan: safeLessonPlanData,
        teaching_suggestion: safeTeachingSuggestionData
      };
    } catch (error) {
      console.error('[SmartPrep Vuex] 应用优化教案失败:', error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          '应用优化教案失败';
      commit('SET_ERROR', errorMessage);
      
      // 错误处理时也设置安全的教学建议结构
      commit('SET_CURRENT_TEACHING_SUGGESTION', {
        lecture_suggestions: '',
        engagement_suggestions: '',
        teacher_resources: '',
        generated_at: new Date().toISOString()
      });
      
      throw error;
    } finally {
      commit('SET_LOADING', false);
    }
  },

  async updateLessonPlan({ commit, dispatch }, data) {
    commit('SET_LOADING', true)
    try {
      const displayId = data.display_id || data.id
      if (!displayId) {
        console.error('[SmartPrep] 缺少教案ID', data)
        throw new Error('缺少教案ID')
      }

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

      console.log(`[SmartPrep] 开始更新教案 (display_id: ${displayId})...`, requestData);
      
      // 关键修改：使用根store的post方法，并标记为智课工坊请求
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/lesson-plan/cover/${displayId}/`,
        data: requestData,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      if (response.data.status === 'error') {
        console.error('[SmartPrep] 教案更新失败:', response.data.message)
        throw new Error(response.data.message || '教案保存失败')
      }

      const lessonData = response.data.data || response.data

      commit('SET_CURRENT_PREP', lessonData)
      commit('SET_ERROR', null)

      return lessonData
    } catch (error) {
      console.error('[SmartPrep] 教案保存失败:', error)
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.response?.data?.details ||
                          error.message ||
                          '教案保存失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteAllLessonPlans({ commit, dispatch }) {
    commit('SET_LOADING', true)
    try {
      console.log('[SmartPrep] 开始删除所有教案...');
      
      // 关键修改：使用根store的post方法，并标记为智课工坊请求
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/lesson-plan/delete-all/`,
        data: { confirm: true },
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      commit('SET_ERROR', null)
      return response.data
    } catch (error) {
      console.error('[SmartPrep] 删除所有教案失败:', error)
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

  async bulkDeleteLessonPlans({ commit, dispatch }, displayIds) {
    commit('SET_LOADING', true)
    try {
      console.log(`[SmartPrep] 开始批量删除教案 (${displayIds.length}个)...`, displayIds);
      
      // 关键修改：使用根store的post方法，并标记为智课工坊请求
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/lesson-plan/bulk-delete/`,
        data: { display_ids: displayIds },
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      commit('SET_ERROR', null)
      return response.data
    } catch (error) {
      console.error('[SmartPrep] 批量删除教案失败:', error)
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
      console.log('[SmartPrep] 开始获取课程列表...');
      
      // 关键修改：使用根store的get方法，并标记为智课工坊请求
      const response = await dispatch('get', {
        url: `${AC_URL}/api/v1/prep/course/`,
        params,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      console.log('[SmartPrep] Course API响应数据:', response.data)

      let courses = []
      if (response.data.results) {
        courses = response.data.results
      } else if (Array.isArray(response.data.data)) {
        courses = response.data.data
      } else if (Array.isArray(response.data)) {
        courses = response.data
      } else {
        console.warn('[SmartPrep] Course 数据格式不识别:', response.data)
        courses = []
      }

      console.log('[SmartPrep] 处理后的课程数组:', courses)

      commit('SET_COURSES', courses)
      commit('SET_ERROR', null)
      return courses
    } catch (error) {
      console.error('[SmartPrep] 获取课程列表失败:', error)
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
      console.log(`[SmartPrep] 开始获取课程详情 (display_id: ${display_id})...`);
      
      // 关键修改：使用根store的get方法，并标记为智课工坊请求
      const response = await dispatch('get', {
        url: `${AC_URL}/api/v1/prep/course/${display_id}/`,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      const course = response.data.data || response.data
      console.log('[SmartPrep] 获取到的课程详情:', course)

      commit('SET_CURRENT_COURSE', course)
      commit('SET_ERROR', null)

      return course
    } catch (error) {
      console.error('[SmartPrep] 获取课程详情失败:', error)
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
      console.log('[SmartPrep] 开始创建课程...', data);
      
      // 关键修改：使用根store的post方法，并标记为智课工坊请求
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/course/upload/`,
        data,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      const courseData = response.data.data || response.data
      console.log('[SmartPrep] 创建课程响应:', courseData)

      commit('SET_ERROR', null)
      return courseData

    } catch (error) {
      console.error('[SmartPrep] 课程创建失败:', error)
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
        console.error('[SmartPrep] 缺少课程ID', data)
        throw new Error('缺少课程ID')
      }

      const requestData = {
        name: data.name
      }

      console.log(`[SmartPrep] 开始更新课程 (display_id: ${displayId})...`, requestData);
      
      // 关键修改：使用根store的post方法，并标记为智课工坊请求
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/course/cover/${displayId}/`,
        data: requestData,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      if (response.data.status === 'error') {
        console.error('[SmartPrep] 课程更新失败:', response.data.message)
        throw new Error(response.data.message || '课程更新失败')
      }

      const courseData = response.data.data || response.data

      commit('SET_ERROR', null)

      return courseData
    } catch (error) {
      console.error('[SmartPrep] 课程更新失败:', error)
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.response?.data?.details ||
                          error.message ||
                          '课程更新失败'
      commit('SET_ERROR', errorMessage)

      if (error.response?.status === 404) {
        console.error('[SmartPrep] 课程不存在:', errorMessage)
      } else if (error.response?.status === 400) {
        console.error('[SmartPrep] 参数错误:', errorMessage)
      }

      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteAllCourses({ commit, dispatch }) {
    commit('SET_LOADING', true)
    try {
      console.log('[SmartPrep] 开始删除所有课程...');
      
      // 关键修改：使用根store的post方法，并标记为智课工坊请求
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/course/delete-all/`,
        data: { confirm: true },
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      commit('SET_ERROR', null)
      return response.data
    } catch (error) {
      console.error('[SmartPrep] 删除所有课程失败:', error)
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
      console.log(`[SmartPrep] 开始批量删除课程 (${displayIds.length}个)...`, displayIds);
      
      // 关键修改：使用根store的post方法，并标记为智课工坊请求
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/course/bulk-delete/`,
        data: { display_ids: displayIds },
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      commit('SET_ERROR', null)
      return response.data
    } catch (error) {
      console.error('[SmartPrep] 批量删除课程失败:', error)
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
      console.log('[SmartPrep] 开始获取大纲列表...');
      
      // 关键修改：使用根store的get方法，并标记为智课工坊请求
      const response = await dispatch('get', {
        url: `${AC_URL}/api/v1/prep/outline`,
        params,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      console.log('[SmartPrep] Outline API响应数据:', response.data)

      let outlines = []
      if (response.data.results) {
        outlines = response.data.results
      } else if (Array.isArray(response.data.data)) {
        outlines = response.data.data
      } else if (Array.isArray(response.data)) {
        outlines = response.data
      } else {
        console.warn('[SmartPrep] Outline 数据格式不识别:', response.data)
        outlines = []
      }

      console.log('[SmartPrep] 处理后的大纲数组:', outlines)

      commit('SET_OUTLINES', outlines)
      commit('SET_ERROR', null)
      return outlines
    } catch (error) {
      console.error('[SmartPrep] 获取大纲列表失败:', error)
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
      console.log(`[SmartPrep] 开始获取大纲详情 (display_id: ${display_id})...`);
      
      // 关键修改：使用根store的get方法，并标记为智课工坊请求
      const response = await dispatch('get', {
        url: `${AC_URL}/api/v1/prep/outline/${display_id}/`,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      const outline = response.data.data || response.data
      console.log('[SmartPrep] 获取到的大纲详情:', outline)

      commit('SET_CURRENT_OUTLINE', outline)
      commit('SET_ERROR', null)

      return outline
    } catch (error) {
      console.error('[SmartPrep] 获取大纲详情失败:', error)
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
      console.log('[SmartPrep] 开始创建大纲...', data);
      
      // 关键修改：使用根store的post方法，并标记为智课工坊请求
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/outline/upload/`,
        data,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      const outlineData = response.data.data || response.data
      console.log('[SmartPrep] 创建大纲响应:', outlineData)

      commit('SET_ERROR', null)
      return outlineData

    } catch (error) {
      console.error('[SmartPrep] 大纲创建失败:', error)
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
        console.error('[SmartPrep] 缺少大纲ID', data)
        throw new Error('缺少大纲ID')
      }

      const requestData = {
        title: data.title,
        subject: data.subject,
        grade: data.grade,
        original_content: data.original_content
      }

      console.log(`[SmartPrep] 开始更新大纲 (display_id: ${displayId})...`, requestData);
      
      // 关键修改：使用根store的post方法，并标记为智课工坊请求
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/outline/cover/${displayId}/`,
        data: requestData,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      if (response.data.status === 'error') {
        console.error('[SmartPrep] 大纲更新失败:', response.data.message)
        throw new Error(response.data.message || '大纲更新失败')
      }

      const outlineData = response.data.data || response.data

      commit('SET_ERROR', null)

      return outlineData
    } catch (error) {
      console.error('[SmartPrep] 大纲更新失败:', error)
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.response?.data?.details ||
                          error.message ||
                          '大纲更新失败'
      commit('SET_ERROR', errorMessage)

      if (error.response?.status === 404) {
        console.error('[SmartPrep] 大纲不存在:', errorMessage)
      } else if (error.response?.status === 400) {
        console.error('[SmartPrep] 参数错误:', errorMessage)
      }

      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async deleteAllOutlines({ commit, dispatch }) {
    commit('SET_LOADING', true)
    try {
      console.log('[SmartPrep] 开始删除所有大纲...');
      
      // 关键修改：使用根store的post方法，并标记为智课工坊请求
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/outline/delete-all/`,
        data: { confirm: true },
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      commit('SET_ERROR', null)
      return response.data
    } catch (error) {
      console.error('[SmartPrep] 删除所有大纲失败:', error)
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
      console.log(`[SmartPrep] 开始批量删除大纲 (${displayIds.length}个)...`, displayIds);
      
      // 关键修改：使用根store的post方法，并标记为智课工坊请求
      const response = await dispatch('post', {
        url: `${AC_URL}/api/v1/prep/outline/bulk-delete/`,
        data: { display_ids: displayIds },
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      commit('SET_ERROR', null)
      return response.data
    } catch (error) {
      console.error('[SmartPrep] 批量删除大纲失败:', error)
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
  async fetchKnowledgeList({ commit, dispatch }, params) {
    commit('SET_LOADING', true)
    try {
      console.log('[SmartPrep] 开始获取知识列表...');
      
      // 关键修改：使用根store的get方法，并标记为智课工坊请求
      const response = await dispatch('get', {
        url: `${AC_URL}/api/v1/prep/knowledge-list`,
        params,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      console.log('[SmartPrep] KnowledgeList API响应数据:', response.data)

      let knowledgeLists = []
      if (response.data.results) {
        knowledgeLists = response.data.results
      } else if (Array.isArray(response.data.data)) {
        knowledgeLists = response.data.data
      } else if (Array.isArray(response.data)) {
        knowledgeLists = response.data
      } else {
        console.warn('[SmartPrep] KnowledgeList 数据格式不识别:', response.data)
        knowledgeLists = []
      }

      console.log('[SmartPrep] 处理后的知识列表数组:', knowledgeLists)

      commit('SET_KNOWLEDGE_LISTS', knowledgeLists)
      commit('SET_ERROR', null)
      return knowledgeLists
    } catch (error) {
      console.error('[SmartPrep] 获取知识列表失败:', error)
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

  async fetchKnowledgeListDetail({ commit, dispatch }, display_id) {
    commit('SET_LOADING', true)
    try {
      console.log(`[SmartPrep] 开始获取知识列表详情 (display_id: ${display_id})...`);
      
      // 关键修改：使用根store的get方法，并标记为智课工坊请求
      const response = await dispatch('get', {
        url: `${AC_URL}/api/v1/prep/knowledge-list/${display_id}/`,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      const knowledgeList = response.data.data || response.data
      console.log('[SmartPrep] 获取到的知识列表详情:', knowledgeList)

      commit('SET_CURRENT_KNOWLEDGE_LIST', knowledgeList)
      commit('SET_ERROR', null)

      return knowledgeList
    } catch (error) {
      console.error('[SmartPrep] 获取知识列表详情失败:', error)
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

  // --- 新增 ClassPlan 相关 actions ---
  async fetchClassPlanList({ commit, dispatch }, params) {
    commit('SET_LOADING', true)
    try {
      console.log('[SmartPrep] 开始获取教学计划列表...');
      
      // 关键修改：使用根store的get方法，并标记为智课工坊请求
      const response = await dispatch('get', {
        url: `${AC_URL}/api/v1/prep/classplan`,
        params,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      console.log('[SmartPrep] ClassPlan API响应数据:', response.data)

      let classPlans = []
      if (response.data.results) {
        classPlans = response.data.results
      } else if (Array.isArray(response.data.data)) {
        classPlans = response.data.data
      } else if (Array.isArray(response.data)) {
        classPlans = response.data
      } else {
        console.warn('[SmartPrep] ClassPlan 数据格式不识别:', response.data)
        classPlans = []
      }

      console.log('[SmartPrep] 处理后的教学计划数组:', classPlans)

      commit('SET_CLASS_PLANS', classPlans)
      commit('SET_ERROR', null)
      return classPlans
    } catch (error) {
      console.error('[SmartPrep] 获取教学计划列表失败:', error)
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

  async fetchClassPlanDetail({ commit, dispatch }, display_id) {
    commit('SET_LOADING', true)
    try {
      console.log(`[SmartPrep] 开始获取教学计划详情 (display_id: ${display_id})...`);
      
      // 关键修改：使用根store的get方法，并标记为智课工坊请求
      const response = await dispatch('get', {
        url: `${AC_URL}/api/v1/prep/classplan/${display_id}/`,
        isWorkshop: true  // 标记为智课工坊请求
      }, { root: true })

      const classPlan = response.data.data || response.data
      console.log('[SmartPrep] 获取到的教学计划详情:', classPlan)

      commit('SET_CURRENT_CLASS_PLAN', classPlan)
      commit('SET_ERROR', null)

      return classPlan
    } catch (error) {
      console.error('[SmartPrep] 获取教学计划详情失败:', error)
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.detail ||
                           error.message ||
                           '获取教学计划详情失败'
      commit('SET_ERROR', errorMessage)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },

  async fetchTeachingSuggestionDetail({ commit, dispatch }, lessonPlanDisplayId) {
    commit('SET_LOADING', true)
    try {
      console.log('[SmartPrep] 开始获取教学建议详情 (教案ID: ' + lessonPlanDisplayId + ')...');
      
      // 修复：移除重复的 ai_class_workshop 路径
      const response = await dispatch('get', {
        url: `${AC_URL}/api/v1/prep/teachingsuggestion/${lessonPlanDisplayId}/`,
        isWorkshop: true
      }, { root: true })
  
      console.log('[SmartPrep] TeachingSuggestion API响应数据:', response.data)
      
      let suggestion = response.data;
      if (!suggestion || Array.isArray(suggestion)) {
        throw new Error('教学建议数据格式不正确');
      }
  
      commit('SET_CURRENT_TEACHING_SUGGESTION', suggestion)
      commit('SET_ERROR', null)
      return suggestion
    } catch (error) {
      console.error('[SmartPrep] 获取教学建议详情失败:', error)
      const errorMessage = error.response?.data?.message ||
                           error.response?.data?.detail ||
                           error.message ||
                           '获取教学建议详情失败'
      commit('SET_ERROR', errorMessage)
      commit('SET_CURRENT_TEACHING_SUGGESTION', null)
      throw error
    } finally {
      commit('SET_LOADING', false)
    }
  },
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}