import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
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
                    // 智能备课
                    path: '/SmartPrep',
                    component: () => import(/* webpackChunkName: "upload" */ '../aiclass/views/SmartPrep/index.vue'),
                    meta: { title: '智能备课' },
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
                    meta: { title: '笔记补全' },
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
                    meta: { title: '习题测评' },
                    children: [
                            {
                                path: '',
                                component: () => import('../aiclass/views/ExerciseAssessment/List.vue'),
                                meta: {title: '习题列表',}
                            },
                            {
                                path: 'list',
                                component: () => import('../aiclass/views/ExerciseAssessment/List.vue'),
                                meta: { title: '习题列表',}
                            },
                            {
                                path: 'create',
                                component: () => import('../aiclass/views/ExerciseAssessment/Create.vue'),
                                meta: { title: '创建习题',}
                            },
                            {
                                path: 'submissions',
                                component: () => import('../aiclass/views/ExerciseAssessment/Submissions.vue'),
                                meta: { title: '提交记录',}
                            },
                            {
                                path: 'detail/:display_id',
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
                    // 视频裁剪S
                    path: '/VideoCutS',
                    component: () => import(/* webpackChunkName: "VideoCut" */ '../videocut/VideoCutsimple.vue'),
                    meta: { title: '视频裁剪S' }
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
