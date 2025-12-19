// project_new/src/aiclass/store/modules/roles.js

// 直接定义AC_URL，避免可能的导入循环
const AC_URL = '/ai_class_workshop';

const state = {
    userData: null,
    users: [],
    schools: [],
    colleges: [], // 新增：学院列表
    collegeDetail: null, // 新增：学院详情（用于存储单个学院的详细信息）
    loading: false,
    userLoading: false,
    schoolLoading: false,
    collegeLoading: false, // 新增：学院加载状态
    error: null,
    userError: null,
    schoolError: null,
    collegeError: null, // 新增：学院错误信息
    courseGroups: [], // 新增：课程组列表
    courseGroupLoading: false, // 新增：课程组加载状态
    courseGroupError: null, // 新增：课程组错误信息
    teachers: [], // 新增：教师列表
    teacherLoading: false, // 新增：教师加载状态
    teacherError: null, // 新增：教师错误信息
    // --- 新增 Course 相关状态 ---
    courses: [], // 存储课程列表
    currentCourse: null, // 存储当前课程详情
}

const mutations = {
    SET_USER_DATA: (state, userData) => {
        state.userData = userData;
    },
    SET_USERS: (state, users) => {
        state.users = users;
    },
    SET_SCHOOLS: (state, schools) => {
        state.schools = schools;
    },
    SET_COLLEGES: (state, colleges) => { // 新增：设置学院列表
        state.colleges = colleges;
    },
    SET_COLLEGE_DETAIL: (state, collegeDetail) => { // 新增：设置学院详情
        state.collegeDetail = collegeDetail;
    },
    SET_LOADING: (state, loading) => {
        state.loading = loading;
    },
    SET_USER_LOADING: (state, loading) => {
        state.userLoading = loading;
    },
    SET_SCHOOL_LOADING: (state, loading) => {
        state.schoolLoading = loading;
    },
    SET_COLLEGE_LOADING: (state, loading) => { // 新增：设置学院加载状态
        state.collegeLoading = loading;
    },
    SET_ERROR: (state, error) => {
        state.error = error;
    },
    SET_USER_ERROR: (state, error) => {
        state.userError = error;
    },
    SET_SCHOOL_ERROR: (state, error) => {
        state.schoolError = error;
    },
    SET_COLLEGE_ERROR: (state, error) => { // 新增：设置学院错误信息
        state.collegeError = error;
    },
    SET_TEACHER_LOADING(state, loading) {
        state.teacherLoading = loading;
      },
    SET_TEACHER_ERROR(state, error) {
        state.teacherError = error;
    },
    SET_COURSE_GROUPS: (state, courseGroups) => { // 新增：设置课程组列表
        state.courseGroups = courseGroups;
    },
    SET_COURSE_GROUP_LOADING: (state, loading) => { // 新增：设置课程组加载状态
        state.courseGroupLoading = loading;
    },
    SET_COURSE_GROUP_ERROR: (state, error) => { // 新增：设置课程组错误信息
        state.courseGroupError = error;
    },
    SET_TEACHERS: (state, teachers) => { // 新增：设置教师列表
        state.teachers = teachers;
      },
    SET_TEACHER_LOADING: (state, loading) => { // 新增：设置教师加载状态
        state.teacherLoading = loading;
    },
    SET_TEACHER_ERROR: (state, error) => { // 新增：设置教师错误信息
        state.teacherError = error;
    },

    // --- 新增 Course 相关 mutations ---
    SET_COURSES: (state, courses) => {
        state.courses = courses
    },
    SET_CURRENT_COURSE: (state, course) => {
        state.currentCourse = course && typeof course === 'object' ? course : null
    },
}

const actions = {
    async loadUserData({ commit, dispatch }) {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        try {
            console.log('[Roles] 开始加载用户数据...');
            
            // 从本地存储获取用户数据
            const userJson = localStorage.getItem('user_data');
            if (userJson) {
                const userData = JSON.parse(userJson);
                commit('SET_USER_DATA', userData);
                return userData;
            } else {
                throw new Error('用户数据未找到');
            }
        } catch (error) {
            console.error('[Roles] 加载用户数据失败:', error);
            commit('SET_ERROR', error.message || '加载用户数据失败');
            throw error;
        } finally {
            commit('SET_LOADING', false);
        }
    },
    
    async getUsers({ commit, dispatch }, pageOrUrl = 1) {
        commit('SET_USER_LOADING', true);
        commit('SET_USER_ERROR', null);
        
        try {
            console.log(`[Roles] 开始获取用户列表 ...: ${pageOrUrl}`);
            
            // 如果传入的是完整URL，直接使用；否则构造
            const requestUrl = `${AC_URL}/api/v1/users/users/?page=${pageOrUrl}`;
            
            const response = await dispatch('get', {
            url: requestUrl,
            isWorkshop: true
            }, { root: true });
            
            console.log('[Roles] User API响应数据:', response.data);
            
            // 处理分页数据结构
            let users = [];
            if (response.data.results) {
                users = response.data.results;
            } else if (Array.isArray(response.data)) {
                users = response.data;
            } else {
                console.warn('[Roles] User 数据格式不识别:', response.data);
                users = [];
            }
            
            console.log('[Roles] 处理后的用户数组:', users);
            
            commit('SET_USERS', users);
            commit('SET_USER_ERROR', null);
            
            // 返回分页信息
            return {
                users,
                total: response.data.count,
                next: response.data.next,
                previous: response.data.previous
            };
        } catch (error) {
            console.error('[Roles] 获取用户列表失败:', error);
            
            // 详细错误处理
            if (error.response) {
                if (error.response.status === 401) {
                    const detail = error.response.data?.detail || '';
                    console.warn('[Roles] 401错误详情:', detail);
                    
                    if (detail.includes('身份认证信息未提供') || 
                        detail.includes('认证失败') || 
                        detail.includes('令牌无效')) {
                        console.log('[Roles] 检测到认证问题，不在此处清除token');
                    } else {
                        commit('SET_USER_ERROR', '您没有权限访问此资源');
                    }
                } else if (error.response.status === 403) {
                    commit('SET_USER_ERROR', '您没有权限访问此资源');
                } else {
                    const errorMessage = error.response.data?.message || 
                                        error.response.data?.error || 
                                        '获取用户列表失败';
                    commit('SET_USER_ERROR', errorMessage);
                }
            } else if (error.request) {
                console.error('[Roles] 请求已发送但无响应:', error.request);
                commit('SET_USER_ERROR', '网络请求超时或服务器无响应');
            } else {
                console.error('[Roles] 请求设置出错:', error.message);
                commit('SET_USER_ERROR', '请求设置出错: ' + error.message);
            }
            
            commit('SET_USERS', []);
            throw error;
        } finally {
            commit('SET_USER_LOADING', false);
        }
    },
    
    async getSchools({ commit, dispatch }, pageOrUrl = 1) {
        commit('SET_SCHOOL_LOADING', true);
        commit('SET_SCHOOL_ERROR', null);
        
        try {
            console.log(`[Roles] 开始获取学校列表... :${pageOrUrl}`);

            // 如果传入的是完整URL，直接使用；否则构造
            const requestUrl = `${AC_URL}/api/v1/users/schools/?page=${pageOrUrl}`;
            
            const response = await dispatch('get', {
            url: requestUrl,
            isWorkshop: true
            }, { root: true });

            
            console.log('[Roles] School API响应数据:', response.data);
            
            // 处理数据结构
            let schools = [];
            if (response.data.results) {
                schools = response.data.results;
            } else if (Array.isArray(response.data)) {
                schools = response.data;
            } else {
                console.warn('[Roles] School 数据格式不识别:', response.data);
                schools = [];
            }
            
            console.log('[Roles] 处理后的学校数组:', schools);
            
            commit('SET_SCHOOLS', schools);
            commit('SET_SCHOOL_ERROR', null);
            return {
                schools,  // 学校数据
                total: response.data.count,  // 总记录数
                next: response.data.next,
                previous: response.data.previous
              };
        } catch (error) {
            console.error('[Roles] 获取学校列表失败:', error);
            
            // 详细错误处理
            if (error.response) {
                if (error.response.status === 401) {
                    const detail = error.response.data?.detail || '';
                    console.warn('[Roles] 401错误详情:', detail);
                    
                    if (detail.includes('身份认证信息未提供') || 
                        detail.includes('认证失败') || 
                        detail.includes('令牌无效')) {
                        console.log('[Roles] 检测到认证问题，不在此处清除token');
                    } else {
                        commit('SET_SCHOOL_ERROR', '您没有权限访问此资源');
                    }
                } else if (error.response.status === 403) {
                    commit('SET_SCHOOL_ERROR', '您没有权限访问此资源');
                } else {
                    const errorMessage = error.response.data?.message || 
                                        error.response.data?.error || 
                                        '获取学校列表失败';
                    commit('SET_SCHOOL_ERROR', errorMessage);
                }
            } else if (error.request) {
                console.error('[Roles] 请求已发送但无响应:', error.request);
                commit('SET_SCHOOL_ERROR', '网络请求超时或服务器无响应');
            } else {
                console.error('[Roles] 请求设置出错:', error.message);
                commit('SET_SCHOOL_ERROR', '请求设置出错: ' + error.message);
            }
            
            commit('SET_SCHOOLS', []);
            throw error;
        } finally {
            commit('SET_SCHOOL_LOADING', false);
        }
    },
    
    async createSchool({ commit, dispatch }, data) {
        commit('SET_SCHOOL_LOADING', true);
        commit('SET_SCHOOL_ERROR', null);
        
        try {
            console.log('[Roles] 开始创建学校...', data);
            
            const response = await dispatch('post', {
                url: `${AC_URL}/api/v1/users/schools/create/`,
                data,
                isWorkshop: true
            }, { root: true });
            
            console.log('[Roles] 创建学校响应:', response.data);
            
            // 重新加载学校列表
            await dispatch('getSchools');
            
            return response.data;
        } catch (error) {
            console.error('[Roles] 创建学校失败:', error);
            
            // 详细错误处理
            if (error.response) {
                const errorMessage = error.response.data?.message || 
                                    error.response.data?.error || 
                                    '创建学校失败';
                commit('SET_SCHOOL_ERROR', errorMessage);
            } else {
                commit('SET_SCHOOL_ERROR', '网络请求失败，请检查网络连接');
            }
            
            throw error;
        } finally {
            commit('SET_SCHOOL_LOADING', false);
        }
    },
    
    async updateProfile({ commit, dispatch }, data) {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        try {
          console.log('[Roles] 开始更新个人信息...', data);
          
          // ✅ 使用正确的 PATCH 方法
          const response = await dispatch('patch', {
            url: `${AC_URL}/api/v1/users/profile/`,
            data,
            isWorkshop: true
          }, { root: true });
          
          console.log('[Roles] 更新个人信息响应:', response);
          
          // ✅ 修正：正确检查响应状态
          // 1. 首先确认响应数据存在
          if (response && response.data) {
            // 2. 检查业务状态是否为成功
            if (response.data.status === 'success') {
              const userJson = localStorage.getItem('user_data');
              if (userJson) {
                const userData = JSON.parse(userJson);
                
                // ✅ 更新所有可能的字段
                if (data.email !== undefined) {
                  userData.email = data.email;
                }
                if (data.title !== undefined) {
                  userData.title = data.title;
                }
                if (data.research_interests !== undefined) {
                  userData.research_interests = data.research_interests;
                }
                if (data.employee_id !== undefined) {
                  userData.employee_id = data.employee_id;
                }
                
                // ✅ 从响应中更新可能的其他字段
                if (response.data.data) {
                  const responseData = response.data.data;
                  
                  // 更新学校、学院、课程组名称
                  if (responseData.school_name) {
                    userData.school_name = responseData.school_name;
                  }
                  if (responseData.college_name) {
                    userData.college_name = responseData.college_name;
                  }
                  if (responseData.course_group_name) {
                    userData.course_group_name = responseData.course_group_name;
                  }
                  
                  // 更新职称显示值
                  if (responseData.title_display) {
                    userData.title_display = responseData.title_display;
                  }
                }
                
                localStorage.setItem('user_data', JSON.stringify(userData));
                commit('SET_USER_DATA', userData);
                
                return response;
              }
            }
          }
          
          // ✅ 如果没有进入成功分支，处理错误
          let errorMessage = '更新失败';
          
          // 从响应中获取更详细的错误信息
          if (response && response.data && response.data.message) {
            errorMessage = response.data.message;
          } else if (response && response.data && response.data.errors) {
            // 处理验证错误
            errorMessage = '验证错误:\n';
            Object.keys(response.data.errors).forEach(field => {
              errorMessage += `${field}: ${response.data.errors[field].join(', ')}\n`;
            });
          }
          
          throw new Error(errorMessage);
        } catch (error) {
          console.error('[Roles] 更新个人信息失败:', error);
          
          let errorMessage = '更新个人信息失败';
          
          // ✅ 优化错误处理
          if (error.response) {
            // 处理后端返回的验证错误
            if (error.response.data && error.response.data.errors) {
              const errors = error.response.data.errors;
              errorMessage = '验证错误:\n';
              Object.keys(errors).forEach(field => {
                errorMessage += `${field}: ${errors[field].join(', ')}\n`;
              });
            } 
            // 处理后端返回的普通错误消息
            else if (error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message;
            } 
            // 处理HTTP状态文本
            else if (error.response.statusText) {
              errorMessage = error.response.statusText;
            }
          } 
          // 处理网络错误
          else if (error.request) {
            errorMessage = '网络请求失败，请检查网络连接';
          } 
          // 处理其他错误
          else if (error.message) {
            errorMessage = error.message;
          }
      
          commit('SET_ERROR', errorMessage);
          throw new Error(errorMessage); // 确保抛出错误消息
        } finally {
          commit('SET_LOADING', false);
        }
    },
      
      // 新增：获取学院列表
    async getColleges({ commit, dispatch }, pageOrUrl = 1) {
        commit('SET_COLLEGE_LOADING', true);
        commit('SET_COLLEGE_ERROR', null);
        
        try {
            console.log(`[Roles] 开始获取学院列表 (page: ${pageOrUrl})...`);


            // 如果传入的是完整URL，直接使用；否则构造
            const requestUrl = `${AC_URL}/api/v1/users/colleges/?page=${pageOrUrl}`;
            
            const response = await dispatch('get', {
            url: requestUrl,
            isWorkshop: true
            }, { root: true });
            
            console.log('[Roles] College API响应数据:', response.data);
            
            // 处理分页数据结构
            let colleges = [];
            if (response.data.results) {
                colleges = response.data.results;
            } else if (Array.isArray(response.data)) {
                colleges = response.data;
            } else {
                console.warn('[Roles] College 数据格式不识别:', response.data);
                colleges = [];
            }
            
            console.log('[Roles] 处理后的学院数组:', colleges);
            
            commit('SET_COLLEGES', colleges);
            commit('SET_COLLEGE_ERROR', null);
            
            // 返回分页信息
            return {
                colleges,
                total: response.data.count,
                next: response.data.next,
                previous: response.data.previous
            };
        } catch (error) {
            console.error('[Roles] 获取学院列表失败:', error);
            
            // 详细错误处理
            if (error.response) {
                if (error.response.status === 401) {
                    const detail = error.response.data?.detail || '';
                    console.warn('[Roles] 401错误详情:', detail);
                    
                    if (detail.includes('身份认证信息未提供') || 
                        detail.includes('认证失败') || 
                        detail.includes('令牌无效')) {
                        console.log('[Roles] 检测到认证问题，不在此处清除token');
                    } else {
                        commit('SET_COLLEGE_ERROR', '您没有权限访问此资源');
                    }
                } else if (error.response.status === 403) {
                    commit('SET_COLLEGE_ERROR', '您没有权限访问此资源');
                } else {
                    const errorMessage = error.response.data?.message || 
                                        error.response.data?.error || 
                                        '获取学院列表失败';
                    commit('SET_COLLEGE_ERROR', errorMessage);
                }
            } else if (error.request) {
                console.error('[Roles] 请求已发送但无响应:', error.request);
                commit('SET_COLLEGE_ERROR', '网络请求超时或服务器无响应');
            } else {
                console.error('[Roles] 请求设置出错:', error.message);
                commit('SET_COLLEGE_ERROR', '请求设置出错: ' + error.message);
            }
            
            commit('SET_COLLEGES', []);
            throw error;
        } finally {
            commit('SET_COLLEGE_LOADING', false);
        }
    },
    
    // 新增：获取学院详情
    async getCollegeDetail({ commit, dispatch }, displayId) {
        commit('SET_COLLEGE_LOADING', true);
        commit('SET_COLLEGE_ERROR', null);
        
        try {
            console.log(`[Roles] 开始获取学院详情 (ID: ${displayId})...`);
            
            const response = await dispatch('get', {
                url: `${AC_URL}/api/v1/users/colleges/${displayId}/`,
                isWorkshop: true
            }, { root: true });
            
            console.log('[Roles] College Detail API响应数据:', response.data);
            
            // 存储学院详情到state
            commit('SET_COLLEGE_DETAIL', response.data);
            commit('SET_COLLEGE_ERROR', null);
            
            return response.data;
        } catch (error) {
            console.error(`[Roles] 获取学院详情 (ID: ${displayId}) 失败:`, error);
            
            // 详细错误处理
            if (error.response) {
                if (error.response.status === 401) {
                    const detail = error.response.data?.detail || '';
                    console.warn('[Roles] 401错误详情:', detail);
                    
                    if (detail.includes('身份认证信息未提供') || 
                        detail.includes('认证失败') || 
                        detail.includes('令牌无效')) {
                        console.log('[Roles] 检测到认证问题，不在此处清除token');
                    } else {
                        commit('SET_COLLEGE_ERROR', '您没有权限访问此资源');
                    }
                } else if (error.response.status === 403) {
                    commit('SET_COLLEGE_ERROR', '您没有权限访问此资源');
                } else if (error.response.status === 404) {
                    commit('SET_COLLEGE_ERROR', '学院不存在');
                } else {
                    const errorMessage = error.response.data?.message || 
                                        error.response.data?.error || 
                                        '获取学院详情失败';
                    commit('SET_COLLEGE_ERROR', errorMessage);
                }
            } else if (error.request) {
                console.error('[Roles] 请求已发送但无响应:', error.request);
                commit('SET_COLLEGE_ERROR', '网络请求超时或服务器无响应');
            } else {
                console.error('[Roles] 请求设置出错:', error.message);
                commit('SET_COLLEGE_ERROR', '请求设置出错: ' + error.message);
            }
            
            throw error;
        } finally {
            commit('SET_COLLEGE_LOADING', false);
        }
    },
    
    // 新增：创建学院
    async createCollege({ commit, dispatch }, data) {
        commit('SET_COLLEGE_LOADING', true);
        commit('SET_COLLEGE_ERROR', null);
        
        try {
          console.log('[Roles] 开始创建学院...', data);
          
          // 验证请求数据
          if (!data || !data.name || !data.school_display_id) {
            throw new Error('请求数据不完整: ' + JSON.stringify(data));
          }
          
          const response = await dispatch('post', {
            url: `${AC_URL}/api/v1/users/colleges/create/`,
            data,
            isWorkshop: true
          }, { root: true });
          
          console.log('[Roles] 创建学院响应:', response.data);
          
          // 重新加载学院列表
          await dispatch('getColleges');
          
          return response.data;
        } catch (error) {
          console.error('[Roles] 创建学院失败:', error);
          
          let errorMessage = '创建学院失败';
          
          // 处理后端返回的特定错误格式
          if (error.response) {
            if (error.response.data) {
              if (error.response.data.errors) {
                const errors = error.response.data.errors;
                if (errors.name) {
                  errorMessage = `学院名称: ${errors.name.join(', ')}`;
                } else if (errors.school_display_id) {
                  errorMessage = `学校ID: ${errors.school_display_id.join(', ')}`;
                } else {
                  errorMessage = `验证错误: ${JSON.stringify(errors)}`;
                }
              } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
              } else {
                errorMessage = JSON.stringify(error.response.data);
              }
            } else {
              errorMessage = error.response.statusText;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          console.error('[Roles] 详细错误信息:', errorMessage);
          commit('SET_COLLEGE_ERROR', errorMessage);
          throw error;
        } finally {
          commit('SET_COLLEGE_LOADING', false);
        }
      },
    
    // 新增：删除学院
    async deleteCollege({ commit, dispatch }, { displayId, force = false, reason = "删除学院" }) {
        commit('SET_COLLEGE_LOADING', true);
        commit('SET_COLLEGE_ERROR', null);
        
        try {
            console.log(`[Roles] 开始删除学院 (ID: ${displayId})...`);
            
            const payload = {
                confirm: true,
                reason: reason
            };
            
            if (force) {
                payload.force = true;
            }
            
            const response = await dispatch('post', {
                url: `${AC_URL}/api/v1/users/colleges/delete/${displayId}/`,
                data: payload,
                isWorkshop: true
            }, { root: true });
            
            console.log('[Roles] 删除学院响应:', response.data);
            
            // 重新加载学院列表
            await dispatch('getColleges');
            
            return response.data;
        } catch (error) {
            console.error(`[Roles] 删除学院 (ID: ${displayId}) 失败:`, error);
            
            // 详细错误处理
            if (error.response) {
                const errorMessage = error.response.data?.message || 
                                    error.response.data?.error || 
                                    '删除学院失败';
                commit('SET_COLLEGE_ERROR', errorMessage);
            } else {
                commit('SET_COLLEGE_ERROR', '网络请求失败，请检查网络连接');
            }
            
            throw error;
        } finally {
            commit('SET_COLLEGE_LOADING', false);
        }
    },
    
    // 新增：批量创建教师
    async bulkCreateTeachers({ commit, dispatch }, data) {
        commit('SET_TEACHER_LOADING', true);
        commit('SET_TEACHER_ERROR', null);
        
        try {
          console.log('[Roles] 开始批量创建教师...', data);
          
          // ✅ 修复：使用正确的API端点
          const url = `${AC_URL}/api/v1/users/teachers/bulk-upload/`;
          console.log('[Roles] 正在请求的URL:', url);
          
          // ✅ 添加：验证必要参数
          if (!data.employee_ids || data.employee_ids.length === 0) {
            throw new Error('缺少必要的教师工号列表');
          }
          
          if (!data.college_display_id) {
            throw new Error('缺少必要的学院ID');
          }
          
          // ✅ 新增：验证课程组ID
          if (!data.course_group_display_id) {
            throw new Error('缺少必要的课程组ID');
          }
          
          const payload = {
            employee_ids: data.employee_ids,
            school_display_id: data.school_display_id,
            college_display_id: data.college_display_id,
            course_group_display_id: data.course_group_display_id
          };
          
          // ✅ 添加：详细的请求日志
          console.log('[Roles] 发送的请求数据:', payload);
          
          const response = await dispatch('post', {
            url: url,
            data: payload,
            isWorkshop: true
          }, { root: true });
          
          console.log('[Roles] 批量创建教师响应:', response.data);
          
          // ✅ 添加：成功处理
          if (response.data && response.data.message) {
            console.log('[Roles] 服务器响应消息:', response.data.message);
          }
          
          return response.data;
        } catch (error) {
          console.error('[Roles] 批量创建教师失败详情:', error);
          
          // ✅ 添加：更详细的错误日志
          if (error.response) {
            console.error('[Roles] 错误响应数据:', error.response.data);
            console.error('[Roles] 错误响应状态:', error.response.status);
            console.error('[Roles] 错误响应头:', error.response.headers);
          } else if (error.request) {
            console.error('[Roles] 无响应 - 请求对象:', error.request);
          } else {
            console.error('[Roles] 错误消息:', error.message);
          }
          
          let errorMessage = '批量创建教师失败';
          
          if (error.response) {
            if (error.response.data) {
              if (error.response.data.detail) {
                errorMessage = error.response.data.detail;
              } else if (error.response.data.errors) {
                const errors = error.response.data.errors;
                if (errors.employee_ids) {
                  errorMessage = `工号列表: ${errors.employee_ids.join(', ')}`;
                } else if (errors.college_display_id) {
                  errorMessage = `学院ID: ${errors.college_display_id.join(', ')}`;
                } else if (errors.course_group_display_id) {
                  errorMessage = `课程组ID: ${errors.course_group_display_id.join(', ')}`;
                } else {
                  errorMessage = `验证错误: ${JSON.stringify(errors)}`;
                }
              } else {
                errorMessage = JSON.stringify(error.response.data);
              }
            } else {
              errorMessage = error.response.statusText;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          commit('SET_TEACHER_ERROR', errorMessage);
          throw new Error(errorMessage);
        } finally {
          // ✅ 修复：确保加载状态在所有情况下都被重置
          commit('SET_TEACHER_LOADING', false);
        }
      },
    
    // 新增：批量删除教师
    async bulkDeleteTeachers({ commit, dispatch }, data) {
        commit('SET_USER_LOADING', true);
        commit('SET_USER_ERROR', null);
        
        try {
            console.log('[Roles] 开始批量删除教师...', data);
            
            const response = await dispatch('post', {
                url: `${AC_URL}/api/v1/users/teachers/bulk-delete/`,
                data,
                isWorkshop: true
            }, { root: true });
            
            console.log('[Roles] 批量删除教师响应:', response.data);
            
            return response.data;
        } catch (error) {
            console.error('[Roles] 批量删除教师失败:', error);
            
            // 详细错误处理
            if (error.response) {
                const errorMessage = error.response.data?.message || 
                                    error.response.data?.error || 
                                    '批量删除教师失败';
                commit('SET_USER_ERROR', errorMessage);
            } else {
                commit('SET_USER_ERROR', '网络请求失败，请检查网络连接');
            }
            
            throw error;
        } finally {
            commit('SET_USER_LOADING', false);
        }
    },
    
    // 新增：批量创建学生
    async bulkCreateStudents({ commit, dispatch }, data) {
        commit('SET_USER_LOADING', true);
        commit('SET_USER_ERROR', null);
        
        try {
            console.log('[Roles] 开始批量创建学生...', data);
            
            const response = await dispatch('post', {
                url: `${AC_URL}/api/v1/users/students/bulk-upload/`,
                data,
                isWorkshop: true
            }, { root: true });
            
            console.log('[Roles] 批量创建学生响应:', response.data);
        
            
            return response.data;
        } catch (error) {
            console.error('[Roles] 批量创建学生失败:', error);
            
            // 详细错误处理
            if (error.response) {
                const errorMessage = error.response.data?.message || 
                                    error.response.data?.error || 
                                    '批量创建学生失败';
                commit('SET_USER_ERROR', errorMessage);
            } else {
                commit('SET_USER_ERROR', '网络请求失败，请检查网络连接');
            }
            
            throw error;
        } finally {
            commit('SET_USER_LOADING', false);
        }
    },
    
    // 新增：批量删除学生
    async bulkDeleteStudents({ commit, dispatch }, data) {
        commit('SET_USER_LOADING', true);
        commit('SET_USER_ERROR', null);
        
        try {
            console.log('[Roles] 开始批量删除学生...', data);
            
            const response = await dispatch('post', {
                url: `${AC_URL}/api/v1/users/students/bulk-delete/`,
                data,
                isWorkshop: true
            }, { root: true });
            
            console.log('[Roles] 批量删除学生响应:', response.data);
            
            return response.data;
        } catch (error) {
            console.error('[Roles] 批量删除学生失败:', error);
            
            // 详细错误处理
            if (error.response) {
                const errorMessage = error.response.data?.message || 
                                    error.response.data?.error || 
                                    '批量删除学生失败';
                commit('SET_USER_ERROR', errorMessage);
            } else {
                commit('SET_USER_ERROR', '网络请求失败，请检查网络连接');
            }
            
            throw error;
        } finally {
            commit('SET_USER_LOADING', false);
        }
    },

    // 新增：获取课程组列表
    async getCourseGroups({ commit, dispatch }, pageOrUrl = 1) {
        commit('SET_COURSE_GROUP_LOADING', true);
        commit('SET_COURSE_GROUP_ERROR', null);
        
        try {
            console.log(`[Roles] 开始获取课程组列表 (page: ${pageOrUrl})...`);


            // 如果传入的是完整URL，直接使用；否则构造
            const requestUrl = `${AC_URL}/api/v1/users/course-groups/?page=${pageOrUrl}`;
            
            const response = await dispatch('get', {
            url: requestUrl,
            isWorkshop: true
            }, { root: true });
            
            // 处理分页数据结构
            let courseGroups = [];
            if (response.data.results) {
                courseGroups = response.data.results;
            } else if (Array.isArray(response.data)) {
                courseGroups = response.data;
            } else {
                console.warn('[Roles] CourseGroup 数据格式不识别:', response.data);
                courseGroups = [];
            }
            
            console.log('[Roles] 处理后的课程组数组:', courseGroups);
            
            commit('SET_COURSE_GROUPS', courseGroups);
            commit('SET_COURSE_GROUP_ERROR', null);
            
            // 返回分页信息
            return {
                courseGroups,
                total: response.data.count,
                next: response.data.next,
                previous: response.data.previous
            };
        } catch (error) {
            console.error('[Roles] 获取课程组列表失败:', error);
            
            // 详细错误处理
            if (error.response) {
                if (error.response.status === 401) {
                const detail = error.response.data?.detail || '';
                console.warn('[Roles] 401错误详情:', detail);
                
                if (detail.includes('身份认证信息未提供') || 
                    detail.includes('认证失败') || 
                    detail.includes('令牌无效')) {
                    console.log('[Roles] 检测到认证问题，不在此处清除token');
                } else {
                    commit('SET_COURSE_GROUP_ERROR', '您没有权限访问此资源');
                }
                } else if (error.response.status === 403) {
                commit('SET_COURSE_GROUP_ERROR', '您没有权限访问此资源');
                } else {
                const errorMessage = error.response.data?.message || 
                                    error.response.data?.error || 
                                    '获取课程组列表失败';
                commit('SET_COURSE_GROUP_ERROR', errorMessage);
                }
            } else if (error.request) {
                console.error('[Roles] 请求已发送但无响应:', error.request);
                commit('SET_COURSE_GROUP_ERROR', '网络请求超时或服务器无响应');
            } else {
                console.error('[Roles] 请求设置出错:', error.message);
                commit('SET_COURSE_GROUP_ERROR', '请求设置出错: ' + error.message);
            }
            
            commit('SET_COURSE_GROUPS', []);
        throw error;
        } finally {
            commit('SET_COURSE_GROUP_LOADING', false);
        }
    },
  
  // 新增：创建课程组
    async createCourseGroup({ commit, dispatch }, data) {
        commit('SET_COURSE_GROUP_LOADING', true);
        commit('SET_COURSE_GROUP_ERROR', null);
        
        try {
        console.log('[Roles] 开始创建课程组...', data);
        
        // 验证请求数据
        if (!data || !data.name || !data.college_display_id) {
            throw new Error('请求数据不完整: ' + JSON.stringify(data));
        }
        
        const response = await dispatch('post', {
            url: `${AC_URL}/api/v1/users/course-groups/create/`,
            data,
            isWorkshop: true
        }, { root: true });
        
        console.log('[Roles] 创建课程组响应:', response.data);
        
        // 重新加载课程组列表
        await dispatch('getCourseGroups');
        
        return response.data;
        } catch (error) {
        console.error('[Roles] 创建课程组失败:', error);
        
        let errorMessage = '创建课程组失败';
        
        // 处理后端返回的特定错误格式
        if (error.response) {
            if (error.response.data) {
            if (error.response.data.errors) {
                const errors = error.response.data.errors;
                if (errors.name) {
                errorMessage = `课程组名称: ${errors.name.join(', ')}`;
                } else if (errors.college_display_id) {
                errorMessage = `学院ID: ${errors.college_display_id.join(', ')}`;
                } else {
                errorMessage = `验证错误: ${JSON.stringify(errors)}`;
                }
            } else if (error.response.data.message) {
                errorMessage = error.response.data.message;
            } else {
                errorMessage = JSON.stringify(error.response.data);
            }
            } else {
            errorMessage = error.response.statusText;
            }
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        console.error('[Roles] 详细错误信息:', errorMessage);
        commit('SET_COURSE_GROUP_ERROR', errorMessage);
        throw error;
        } finally {
        commit('SET_COURSE_GROUP_LOADING', false);
        }
    },
    
    // 新增：删除课程组
    async deleteCourseGroup({ commit, dispatch }, { displayId, force = false, reason = "删除课程组" }) {
        commit('SET_COURSE_GROUP_LOADING', true);
        commit('SET_COURSE_GROUP_ERROR', null);
        
        try {
        console.log(`[Roles] 开始删除课程组 (ID: ${displayId})...`);
        
        const payload = {
            confirm: true,
            reason: reason
        };
        
        if (force) {
            payload.force = true;
        }
        
        const response = await dispatch('post', {
            url: `${AC_URL}/api/v1/users/course-groups/delete/${displayId}/`,
            data: payload,
            isWorkshop: true
        }, { root: true });
        
        console.log('[Roles] 删除课程组响应:', response.data);
        
        // 重新加载课程组列表
        await dispatch('getCourseGroups');
        
        return response.data;
        } catch (error) {
        console.error(`[Roles] 删除课程组 (ID: ${displayId}) 失败:`, error);
        
        // 详细错误处理
        if (error.response) {
            const errorMessage = error.response.data?.message || 
                                error.response.data?.error || 
                                '删除课程组失败';
            commit('SET_COURSE_GROUP_ERROR', errorMessage);
        } else {
            commit('SET_COURSE_GROUP_ERROR', '网络请求失败，请检查网络连接');
        }
        
        throw error;
        } finally {
        commit('SET_COURSE_GROUP_LOADING', false);
        }
    },


    // 新增：获取教师列表
    async getTeachers({ commit, dispatch }, pageOrUrl = 1) {
        commit('SET_TEACHER_LOADING', true);
        commit('SET_TEACHER_ERROR', null);
        
        try {
        console.log(`[Roles] 开始获取教师列表 (page: ${pageOrUrl})...`);

        // 如果传入的是完整URL，直接使用；否则构造
        const requestUrl = `${AC_URL}/api/v1/users/course-groups/teachers/?page=${pageOrUrl}`;
            
        const response = await dispatch('get', {
        url: requestUrl,
        isWorkshop: true
        }, { root: true });
        
        console.log('[Roles] Teacher API响应数据:', response.data);
        
        // 处理分页数据结构
        let teachers = [];
        if (response.data.results) {
            teachers = response.data.results;
        } else if (Array.isArray(response.data)) {
            teachers = response.data;
        } else {
            console.warn('[Roles] Teacher 数据格式不识别:', response.data);
            teachers = [];
        }
        
        console.log('[Roles] 处理后的教师数组:', teachers);
        
        commit('SET_TEACHERS', teachers);
        commit('SET_TEACHER_ERROR', null);
        
        // 返回分页信息
        return {
            teachers,
            total: response.data.count,
            next: response.data.next,
            previous: response.data.previous
        };
        } catch (error) {
        console.error('[Roles] 获取教师列表失败:', error);
        
        // 详细错误处理
        if (error.response) {
            if (error.response.status === 401) {
            const detail = error.response.data?.detail || '';
            console.warn('[Roles] 401错误详情:', detail);
            
            if (detail.includes('身份认证信息未提供') || 
                detail.includes('认证失败') || 
                detail.includes('令牌无效')) {
                console.log('[Roles] 检测到认证问题，不在此处清除token');
            } else {
                commit('SET_TEACHER_ERROR', '您没有权限访问此资源');
            }
            } else if (error.response.status === 403) {
            commit('SET_TEACHER_ERROR', '您没有权限访问此资源');
            } else {
            const errorMessage = error.response.data?.message || 
                                error.response.data?.error || 
                                '获取教师列表失败';
            commit('SET_TEACHER_ERROR', errorMessage);
            }
        } else if (error.request) {
            console.error('[Roles] 请求已发送但无响应:', error.request);
            commit('SET_TEACHER_ERROR', '网络请求超时或服务器无响应');
        } else {
            console.error('[Roles] 请求设置出错:', error.message);
            commit('SET_TEACHER_ERROR', '请求设置出错: ' + error.message);
        }
        
        commit('SET_TEACHERS', []);
        throw error;
        } finally {
        commit('SET_TEACHER_LOADING', false);
        }
    },


    async getUserMe({ commit, dispatch }) {
        commit('SET_LOADING', true);
        commit('SET_ERROR', null);
        
        try {
          console.log('[Roles] 开始获取当前用户详情...');
          
          const response = await dispatch('get', {
            url: `${AC_URL}/api/v1/users/users/me/`,
            isWorkshop: true
          }, { root: true });
          
          console.log('[Roles] 当前用户详情:', response.data);
          
          // 保存用户数据到state
          commit('SET_USER_DATA', response.data);
          
          return response.data;
        } catch (error) {
          console.error('[Roles] 获取当前用户详情失败:', error);
          
          let errorMessage = '获取用户详情失败';
          
          if (error && error.response) {
            if (error.response.data && error.response.data.message) {
              errorMessage = error.response.data.message;
            } else if (error.response.statusText) {
              errorMessage = error.response.statusText;
            }
          } else if (error && error.request) {
            errorMessage = '网络请求失败，请检查网络连接';
          } else if (error && error.message) {
            errorMessage = error.message;
          }
      
          commit('SET_ERROR', errorMessage);
          throw error;
        } finally {
          commit('SET_LOADING', false);
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

}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}