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
                    ]
                },
                {
                    // 系统首页
                    path: '/dashboard',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/Dashboard.vue'),
                    meta: { title: '系统首页' }
                },
                {
                    // 基于XXTS模型的语音克隆
                    path: '/VoiceCloningXxts',
                    component: () => import(/* webpackChunkName: "markdown" */ '../components/common/Header.vue'),
                    meta: { title: '基于XXTS模型的语音克隆' }
                },
                {
                    // 基于FreeVC的语音克隆
                    path: '/VoiceCloningFreeVC',
                    component: () => import(/* webpackChunkName: "markdown" */ '../components/page/Markdown.vue'),
                    meta: { title: '基于FreeVC的语音克隆' }
                },
                {
                    // 文本转语音
                    path: '/TextToSpeech',
                    component: () => import(/* webpackChunkName: "form" */ '../components/page/BaseForm.vue'),
                    meta: { title: '文本转语音' }
                },
                {
                    // 批量文本转语音
                    path: '/TextToSpeechs',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '批量文本转语音' }
                },
                {
                    // 互动
                    path: '/interaction',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '互动' }
                },
                {
                    // 知识点检索
                    path: '/KnowledgeRetrieval',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '知识点检索' }
                },
                {
                    // 大纲匹配
                    path: '/OutlineMatching',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '大纲匹配' }
                },
                {
                    // 智能备课
                    path: '/IntelligentLessonPreparation',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '智能备课' }
                },
                {
                    // 智能复习
                    path: '/IntelligentReview',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '智能复习' }
                },
                {
                    // 自动化测评
                    path: '/AutomatedEvaluation',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '自动化测评' }
                },
                {
                    // 课堂到课率和抬头率
                    path: '/car',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '课堂到课率和抬头率' }
                },
                {
                    // 智能课堂数据采集
                    path: '/icdc',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '智能课堂数据采集' }
                },
                {
                    // 多智能体协同督导
                    path: '/macs',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '多智能体协同督导' }
                },
                {
                    // 实体识别
                    path: '/EntityRecognition',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '实体识别' }
                },
                {
                    // 关系抽取
                    path: '/RelationExtraction',
                    component: () => import(/* webpackChunkName: "upload" */ '../abc/index1.vue'),
                    meta: { title: '关系抽取' }
                },
                {
                    // 知识融合
                    path: '/KnowledgeFusion',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '知识融合' }
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
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '图谱构建' }
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
                {
                    path: '/donate',
                    component: () => import(/* webpackChunkName: "donate" */ '../components/page/Donate.vue'),
                    meta: { title: '支持作者' }
                },
                {
                    path: '/test1',
                    component: () => import(/* webpackChunkName: "test1" */ '../components/page/test1.vue'),
                    meta: { title: '测试' }
                }
                ,
                {
                    path: '/Tabs',
                    component: () => import(/* webpackChunkName: "tabs" */ '../components/page/Tabs.vue'),
                    meta: { title: '消息' }
                },
            ]
        },
        {
            path: '/logintest',
            component: () => import(/* webpackChunkName: "logintest" */ '../components/page/Login.vue'),
            meta: { title: '登录测试' }
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
