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
            meta: { title: '自述文件' },
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
                            path: '/home',
                            component: () => import(/* webpackChunkName: "home" */ '../job/views/Home.vue'),
                            meta: { title: 'home' }
                        },
                        {
                            path: '/user',
                            component: () => import(/* webpackChunkName: "user" */ '../job/views/User.vue'),
                            meta: { title: 'user' }
                        },
                        {
                            path: '/profile',
                            component: () => import(/* webpackChunkName: "profile" */ '../job/views/Profile.vue'),
                            meta: { title: 'profile' }
                        },
                        {
                            path: '/findJob',
                            component: () => import(/* webpackChunkName: "findJob" */ '../job/views/JobRec.vue'),
                            meta: { title: 'findJob' }
                        },
                        {
                            path: '/sendResume',
                            component: () => import(/* webpackChunkName: "sendResume" */ '../job/views/recruit.vue'),
                            meta: { title: 'sendResume' }
                        },
                        {
                            path: '/usercenter',
                            component: () => import(/* webpackChunkName: "usercenter" */ '../job/views/UserCenter.vue'),
                            meta: { title: 'usercenter' }
                        },
                    ]
                },
                {
                    path: '/dashboard',
                    component: () => import(/* webpackChunkName: "dashboard" */ '../components/page/Dashboard.vue'),
                    meta: { title: '系统首页' }
                },
                {
                    path: '/form',
                    component: () => import(/* webpackChunkName: "form" */ '../components/page/BaseForm.vue'),
                    meta: { title: '文本转语音' }
                },
                {
                    // markdown组件
                    path: '/markdown1',
                    component: () => import(/* webpackChunkName: "markdown" */ '../components/page/BaseForm.vue'),
                    meta: { title: '基于XXTS模型的语音克隆' }
                },
                {
                    // markdown组件
                    path: '/markdown',
                    component: () => import(/* webpackChunkName: "markdown" */ '../components/page/Markdown.vue'),
                    meta: { title: '基于FreeVC的语音克隆' }
                },
                {
                    // 图片上传组件
                    path: '/upload',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '批量文本转语音' }
                },
                {
                    // 图片上传组件
                    path: '/upload1',
                    component: () => import(/* webpackChunkName: "upload" */ '../components/page/Upload.vue'),
                    meta: { title: '互动' }
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
