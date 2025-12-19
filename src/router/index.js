import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

const router = new Router({
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/main',
            component: () => import(/* webpackChunkName: "home" */ '../components/common/Home.vue'),
            meta: { title: '首页' },
            children: [
                {
                //企业端
                path: '/enterprise',
		        name: '企业端',
                component: () => import(/* webpackChunkName: "enterprise" */ '../job/views/enterprise/index.vue'),
                    children: [
                        {
                        path: '/manage',
                        component: () => import('../job/views/enterprise/manage.vue'),
                        meta: { title: '管理' }
                        },
                        {
                        path: '/enterprisehome',
                        component: () => import(/* webpackChunkName: "enterprisehome" */ '../job/views/enterprise//home.vue'),
                        meta: { title: '系统首页' }
                        },
                    ]
                },
                {
                //学生端
                path: '/student',
		        name: '学生端',
                component: () => import(/* webpackChunkName: "student" */ '../job/views/Main.vue'),
                    children: [
                        {
                            path: '/recommendJob',
                            component: () => import(/* webpackChunkName: "recommendJob" */ '../job/views/recommendJob.vue'),
                            meta: { title: '职位推荐' }
                        },
                        {
                            path: '/profile',
                            component: () => import(/* webpackChunkName: "recommendJob" */ '../job/views/Profile.vue'),
                            meta: { title: '个人简历' }
                        },
                    ]
                },
                {
                    // 系统首页
                    path: '/dashboard',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/Dashboard_.vue'),
                    meta: { title: '系统首页' }
                },
                {
                    // 语音克隆
                    path: '/VoiceCloning',
                    component: () => import('../voiceclone/views/VoiceCloning.vue'),
                    meta: { title: '语音克隆' }
                },
                {
                    // 批量文本转语音
                    path: '/TextToSpeechs',
                    component: () => import('../voiceclone/views/TextToSpeechs.vue'),
                    meta: { title: '批量文本转语音' }
                },
                {
                    // 留言互动
                    path: '/interaction',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Dashboard_.vue'),
                    meta: { title: '留言互动' }
                },
                {
                    // 知识点检索
                    path: '/KnowledgeRetrieval',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Dashboard_.vue'),
                    meta: { title: '知识点检索' }
                },
                {
                    // 大纲匹配
                    path: '/OutlineMatching',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Dashboard_.vue'),
                    meta: { title: '大纲匹配' }
                },


                {
                    path: '/Roles',
                    component: () => import(/* webpackChunkName: "upload" */ '@/aiclass/views/Roles/index.vue'),
                    meta: { title: '角色详情', requiresAuth: true },
                    children: [
                        {
                            path: 'systemadmindetail',
                            name: 'SystemAdminDetail',
                            component: () => import(/* webpackChunkName: "roles-system-admin" */ '@/aiclass/views/Roles/Details/SystemAdminDetail.vue'),
                            meta: { title: '系统管理员详情' }
                        },
                        {
                            path: 'schooldetail',
                            name: 'SchoolDetail',
                            component: () => import(/* webpackChunkName: "roles-school" */ '@/aiclass/views/Roles/Details/SchoolDetail.vue'),
                            meta: { title: '学校用户详情' }
                        },
                        {
                            path: 'collegedetail',
                            name: 'CollegeDetail',
                            component: () => import(/* webpackChunkName: "roles-college" */ '@/aiclass/views/Roles/Details/CollegeDetail.vue'),
                            meta: { title: '学院用户详情' }
                        },
                        {
                            path: 'coursegroupdetail',
                            name: 'CourseGroupDetail',
                            component: () => import(/* webpackChunkName: "roles-course-group" */ '@/aiclass/views/Roles/Details/CourseGroupDetail.vue'),
                            meta: { title: '课程组用户详情' }
                        },
                        {
                            path: 'teacherdetail',
                            name: 'TeacherDetail',
                            component: () => import(/* webpackChunkName: "roles-teacher" */ '@/aiclass/views/Roles/Details/TeacherDetail.vue'),
                            meta: { title: '教师用户详情' }
                        },
                        {
                            path: 'studentdetail',
                            name: 'StudentDetail',
                            component: () => import(/* webpackChunkName: "roles-student" */ '@/aiclass/views/Roles/Details/StudentDetail.vue'),
                            meta: { title: '学生用户详情' }
                        }
                    ]
                },

                {
                    // 智能备课
                    path: '/SmartPrep',
                    component: () => import(/* webpackChunkName: "upload" */ '../aiclass/views/SmartPrep/index.vue'),
                    meta: { title: '智能备课', requiresAuth: true  },
                    children: [
                            // --- 首页 ---
                            {
                                path: '', 
                                component: () => import('../aiclass/views/SmartPrep/Course/List.vue'), // 假设的组件路径
                                meta: { title: '课程列表' }
                            },
                            // --- Course 相关路由 ---
                            {
                                path: 'course', 
                                component: () => import('../aiclass/views/SmartPrep/Course/List.vue'), // 假设的组件路径
                                meta: { title: '课程列表' }
                            },
                            {
                                path: 'course/list',
                                name: 'CourseList', // 添加 name
                                component: () => import('../aiclass/views/SmartPrep/Course/List.vue'),
                                meta: { title: '课程列表' }
                            },
                            {
                                path: 'course/upload', 
                                name: 'CourseUpload', // 添加 name
                                component: () => import('../aiclass/views/SmartPrep/Course/Upload.vue'), // 假设的组件路径
                                meta: { title: '创建课程' }
                            },
                            {
                                path: 'course/detail/:displayId',
                                name: 'CourseDetail',
                                component: () => import('../aiclass/views/SmartPrep/Course/Detail.vue'), // 假设的组件路径
                                meta: { title: '课程详情' }
                            },
                    
                            // --- Outline 相关路由 ---
                            {
                                path: 'outline',
                                component: () => import('../aiclass/views/SmartPrep/Outline/List.vue'), // 假设的组件路径
                                meta: { title: '大纲列表' }
                            },
                            {
                                path: 'outline/list',
                                name: 'OutlineList',
                                component: () => import('../aiclass/views/SmartPrep/Outline/List.vue'),
                                meta: { title: '大纲列表' }
                            },
                            {
                                path: 'outline/upload', 
                                name: 'OutlineUpload',
                                component: () => import('../aiclass/views/SmartPrep/Outline/Upload.vue'), // 假设的组件路径
                                meta: { title: '创建大纲' }
                            },
                            {
                                path: 'outline/detail/:displayId',
                                name: 'OutlineDetail',
                                component: () => import('../aiclass/views/SmartPrep/Outline/Detail.vue'), // 假设的组件路径
                                meta: { title: '大纲详情' }
                            },
                    
                            // --- KnowledgeList 相关路由 ---
                            {
                                path: 'knowledge-list', // 或者 'knowledge'
                                component: () => import('../aiclass/views/SmartPrep/KnowledgeList/List.vue'), // 假设的组件路径
                                meta: { title: '知识列表' }
                            },
                            {
                                path: 'knowledge-list/list',
                                name: 'KnowledgeList',
                                component: () => import('../aiclass/views/SmartPrep/KnowledgeList/List.vue'),
                                meta: { title: '知识列表' }
                            },
                            
                            {
                                path: 'knowledge-list/detail/:displayId',
                                name: 'KnowledgelistDetail',
                                component: () => import('../aiclass/views/SmartPrep/KnowledgeList/Detail.vue'), // 假设的组件路径
                                meta: { title: '知识列表详情' }
                            },
                    
                            // --- ClassPlan 相关路由 ---
                            {
                                path: 'classplan', // 或者 'classplan'
                                component: () => import('../aiclass/views/SmartPrep/ClassPlan/List.vue'), // 假设的组件路径
                                meta: { title: '教学计划' }
                            },
                            {
                                path: 'classplan/list',
                                name: 'ClassplanList',
                                component: () => import('../aiclass/views/SmartPrep/ClassPlan/List.vue'),
                                meta: { title: '教学计划' }
                            },
                            
                            {
                                path: 'classplan/detail/:displayId',
                                name: 'ClassplanDetail',
                                component: () => import('../aiclass/views/SmartPrep/ClassPlan/Detail.vue'), // 假设的组件路径
                                meta: { title: '教学计划详情' }
                            },
                    
                            // --- LessonPlan 相关路由 ---
                            {
                                path: 'lesson-plan', 
                                component: () => import('../aiclass/views/SmartPrep/LessonPlan/List.vue'),
                                meta: { title: '教案列表' }
                            },
                            {
                                path: 'lesson-plan/list', 
                                name: 'LessonplanList',
                                component: () => import('../aiclass/views/SmartPrep/LessonPlan/List.vue'),
                                meta: { title: '教案列表' }
                            },
                            {
                                path: 'lesson-plan/upload',
                                name: 'LessonplanUpload',
                                component: () => import('../aiclass/views/SmartPrep/LessonPlan/Upload.vue'),
                                meta: { title: '上传教案' }
                            },
                            {
                                path: 'lesson-plan/detail/:displayId',
                                name: 'LessonplanDetail',
                                component: () => import('../aiclass/views/SmartPrep/LessonPlan/Detail.vue'),
                                meta: { title: '教案详情' }
                            },
                    ]
                },
                
                {
                    // 笔记补全
                    path: '/NoteCompletion',
                    component: () => import(/* webpackChunkName: "upload" */ '../aiclass/views/NoteCompletion/index.vue'),
                    meta: { title: '笔记补全', requiresAuth: true },
                    children: [
                            {
                                path: '',
                                component: () => import('../aiclass/views/NoteCompletion/List.vue'),
                                meta: {title: '笔记列表',}
                            },
                            {
                                path: 'list',
                                name: 'NoteList',
                                component: () => import('../aiclass/views/NoteCompletion/List.vue'),
                                meta: { title: '笔记列表',}
                            },
                            {
                                path: 'upload',
                                name: 'NoteUpload',
                                component: () => import('../aiclass/views/NoteCompletion/Upload.vue'),
                                meta: { title: '上传笔记',}
                            },
                            {
                                path: 'detail/:displayId',
                                name: 'NoteDetail',
                                component: () => import('../aiclass/views/NoteCompletion/Detail.vue'),
                                meta: { title: '笔记详情',}
                            }
                            ]
                },

                {
                    // 习题测评
                    path: '/ExerciseAssessment',
                    component: () => import(/* webpackChunkName: "upload" */ '../aiclass/views/ExerciseAssessment/index.vue'),
                    meta: { title: '习题测评', requiresAuth: true },
                    children: [
                            {
                                path: '',
                                component: () => import('../aiclass/views/ExerciseAssessment/List.vue'),
                                meta: {title: '习题列表',}
                            },
                            {
                                path: 'list',
                                name: 'ExerciseList',
                                component: () => import('../aiclass/views/ExerciseAssessment/List.vue'),
                                meta: { title: '习题列表',}
                            },
                            {
                                path: 'create',
                                name: 'ExerciseCreate',
                                component: () => import('../aiclass/views/ExerciseAssessment/Create.vue'),
                                meta: { title: '创建习题',}
                            },
                            {
                                path: 'submissions',
                                name: 'ExerciseSubmissions',
                                component: () => import('../aiclass/views/ExerciseAssessment/Submissions.vue'),
                                meta: { title: '提交记录',}
                            },
                            {
                                path: 'detail/:display_id',
                                name: 'ExerciseDetail',
                                component: () => import('../aiclass/views/ExerciseAssessment/Detail.vue'),
                                meta: { title: '习题详情',}
                            }
                            ]
                },

                {
                    // 课堂到课率和抬头率
                    path: '/car',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Dashboard_.vue'),
                    meta: { title: '课堂到课率和抬头率' }
                },
                {
                    // 智能课堂数据采集
                    path: '/icdc',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Dashboard_.vue'),
                    meta: { title: '智能课堂数据采集' }
                },
                {
                    // 多智能体协同督导
                    path: '/macs',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Dashboard_.vue'),
                    meta: { title: '多智能体协同督导' }
                },
                {
                    // 数据采集
                    path: '/DataAcquisition',
                    component: () => import(/* webpackChunkName: "upload" */ '../abc/admin.vue'),
                    meta: { title: '数据采集' }
                },
                {
                    // 图谱构建
                    path: '/GeneticMapping',
                    component: () => import(/* webpackChunkName: "upload" */ '../abc/index.vue'),
                    meta: { title: '图谱构建' }
                },
                {
                    // 视频裁剪
                    path: '/VideoCut',
                    component: () => import(/* webpackChunkName: "VideoCut" */ '../videocut/VideoCut.vue'),
                    meta: { title: '视频裁剪' }
                },
                {
                    // 视频裁剪快捷
                    path: '/VideoCutS',
                    component: () => import(/* webpackChunkName: "VideoCut" */ '../videocut/VideoCutsimple.vue'),
                    meta: { title: '视频裁剪快捷' }
                },
                {
                    // PPT2Video
                    path: '/PPT2Video',
                    component: () => import(/* webpackChunkName: "VideoCut" */ '../ppt2video/ppt2video.vue'),
                    meta: { title: 'PPT2Video' }
                },
                {
                    path: '/404',
                    component: () => import(/* webpackChunkName: "404" */ '../components/page/404.vue'),
                    meta: { title: '404' }
                },
                {
                    path: '/403',
                    component: () => import(/* webpackChunkName: "403" */ '../components/page/403.vue'),
                    meta: { title: '403' }
                },
            ]
        },
        {
            path: '/ai-workshop-login',
            component: () => import(/* webpackChunkName: "ai-workshop-login" */ '../components/common/AIWorkshopLogin.vue'),
            meta: { 
              title: '智课工坊登录',
              requiresAuth: false // 必须明确设置为false
            }
        },
        {
            path: '/login',
            component: () => import(/* webpackChunkName: "login" */ '../job/views/LoginRegister.vue'),
            meta: { title: '登录' }
        },
        //企业端注册
        {
            path: '/companyLogin',
            component: () => import('../job/views/enterprise/LoginRegister.vue'),
            meta: { title: '企业端登录' }
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
});

router.beforeEach(async (to, from, next) => {
    console.log('===== localStorage诊断 =====');
    console.log('ai_class_workshop_token存在:', !!localStorage.getItem('ai_class_workshop_token'));
    console.log('token存在:', !!localStorage.getItem('token'));
    console.log('完整localStorage:', { ...localStorage });
    console.log('===== 路由信息 =====');
    console.log(`导航: ${from.path} → ${to.path}`);
    console.log('需要认证:', to.matched.some(r => r.meta.requiresAuth));
    console.log('==================');
    
    // 关键修复3: 检查所有可能的token
    const hasToken = !!localStorage.getItem('ai_class_workshop_token') || 
                    !!localStorage.getItem('token');
    
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const isLoginPage = to.path === '/ai-workshop-login';
    const isForceLogout = to.query.forceLogout === 'true';
    
    // 关键修复4: 检测重定向循环
    const isRedirectCycle = from.path === '/SmartPrep' && 
                            to.path === '/ai-workshop-login' && 
                            hasToken;
    
    if (isRedirectCycle) {
      console.log('[路由守卫] 检测到重定向循环，强制清除所有token');
      localStorage.removeItem('ai_class_workshop_token');
      localStorage.removeItem('token');
      return next();
    }
    
    // 1. 专门处理强制退出请求
    if (isForceLogout) {
      console.log('[路由守卫] 处理强制退出请求');
      localStorage.removeItem('ai_class_workshop_token');
      localStorage.removeItem('token');
      
      return next({
        path: '/ai-workshop-login',
        query: { 
          loggedOut: 'true',
          redirect: to.query.redirect || from.fullPath 
        },
        replace: true
      });
    }
    
    // 2. 需要认证但无token
    if (requiresAuth && !hasToken) {
      console.log('[路由守卫] 需要认证但无token');
      
      if (from.path === '/ai-workshop-login') {
        return next();
      }
      
      return next({
        path: '/ai-workshop-login',
        query: { 
          redirect: to.fullPath,
          fromAuthCheck: 'true'
        }
      });
    } 
    
    // 3. 已登录访问登录页
    if (isLoginPage && hasToken) {
      console.log('[路由守卫] 已登录访问登录页');
      
      // 关键修复5: 如果是退出操作但token仍存在，强制清除
      if (isForceLogout || to.query.loggedOut === 'true') {
        console.log('[路由守卫] 检测到退出操作但token存在，强制清除');
        localStorage.removeItem('ai_class_workshop_token');
        localStorage.removeItem('token');
        return next();
      }
      
      // 安全验证重定向路径
      let redirectPath = to.query.redirect || '/SmartPrep';
      
      try {
        const resolved = router.resolve(redirectPath);
        if (!resolved.route.matched.length) {
          console.warn('[路由守卫] 无效的重定向路径，使用默认路径');
          redirectPath = '/';
        }
      } catch (e) {
        console.error('[路由守卫] 验证重定向路径出错', e);
        redirectPath = '/';
      }
      
      console.log(`[路由守卫] 重定向到: ${redirectPath}`);
      return next(redirectPath);
    }
    
    // ===== 新增：角色验证逻辑 =====
    // 定义角色路由映射
    const roleRoutes = {
      'SystemAdminDetail': 'system_admin',
      'SchoolDetail': 'school',
      'CollegeDetail': 'college',
      'CourseGroupDetail': 'course_group',
      'TeacherDetail': 'teacher',
      'StudentDetail': 'student'
    };
    
    // 检查是否是角色详情页面
    const requiredRole = roleRoutes[to.name];
    if (requiredRole) {
      try {
        console.log(`[路由守卫] 正在验证角色详情页面: ${to.name} (需要角色: ${requiredRole})`);
        
        // 尝试从localStorage获取用户数据
        const userDataJson = localStorage.getItem('user_data');
        let currentUser;
        
        if (userDataJson) {
          try {
            currentUser = JSON.parse(userDataJson);
            console.log('[路由守卫] 从localStorage获取到用户数据:', currentUser);
          } catch (e) {
            console.error('[路由守卫] 解析用户数据失败:', e);
            throw new Error('用户数据格式错误');
          }
        } else {
          // 如果localStorage中没有user_data，但有token，尝试从API获取
          const token = localStorage.getItem('ai_class_workshop_token');
          if (token) {
            console.log('[路由守卫] localStorage中没有user_data，尝试从API获取');
            
            const response = await fetch('/ai_class_workshop/api/v1/users/users/me/', {
              method: 'GET',
              headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (response.ok) {
              currentUser = await response.json();
              localStorage.setItem('user_data', JSON.stringify(currentUser));
              console.log('[路由守卫] 从API获取到用户数据:', currentUser);
            } else {
              console.error('[路由守卫] API请求失败:', response.status, response.statusText);
              throw new Error('无法获取用户信息');
            }
          } else {
            console.error('[路由守卫] 无token，无法获取用户信息');
            throw new Error('缺少认证token');
          }
        }
        
        if (!currentUser) {
          console.error('[路由守卫] 无法获取当前用户信息');
          throw new Error('无法获取当前用户信息');
        }
        
        // 检查角色是否匹配
        console.log(`[路由守卫] 当前用户角色: ${currentUser.role}`);
        if (currentUser.role !== requiredRole) {
          console.warn(`[路由守卫] 角色不匹配: 需要 ${requiredRole}，当前为 ${currentUser.role}`);
          
          // 重定向到正确的角色页面
          const correctRouteName = Object.keys(roleRoutes).find(key => 
            roleRoutes[key] === currentUser.role
          );
          
          if (correctRouteName) {
            console.log(`[路由守卫] 重定向到正确的角色页面: ${correctRouteName}`);
            return next({ name: correctRouteName });
          } else {
            console.warn('[路由守卫] 无法确定正确的角色页面，重定向到首页');
            return next('/');
          }
        }
      } catch (error) {
        console.error('[路由守卫] 角色验证失败:', error);
        // 清除可能无效的token
        localStorage.removeItem('ai_class_workshop_token');
        localStorage.removeItem('user_data');
        return next({
          path: '/ai-workshop-login',
          query: { 
            redirect: to.fullPath,
            roleError: 'true'
          }
        });
      }
    }
    
    next();
  });

export default router;
