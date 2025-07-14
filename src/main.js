import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import VueI18n from 'vue-i18n';
import { messages } from './components/common/i18n';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
// import './assets/css/theme-green/index.css'; // 浅绿色主题
import './assets/css/icon.css';
import './components/common/directives';
import 'babel-polyfill';
import store from './job/store'

Vue.config.productionTip = false;
Vue.use(VueI18n);
Vue.use(ElementUI, {
    size: 'small'
});
const i18n = new VueI18n({
    locale: 'zh',
    messages
});

//使用钩子函数对路由进行权限跳转
// router.beforeEach((to, from, next) => {
//     document.title = `${to.meta.title} | vue-manage-system`;
//     const role = localStorage.getItem('ms_username');
//     if (!role && to.path !== '/login') {
//         next('/login');
//     } else if (to.meta.permission) {
//         // 如果是管理员权限则可进入，这里只是简单的模拟管理员权限而已
//         role === 'admin' ? next() : next('/403');
//     } else {
//         // 简单的判断IE10及以下不进入富文本编辑器，该组件不兼容
//         if (navigator.userAgent.indexOf('MSIE') > -1 && to.path === '/editor') {
//             Vue.prototype.$alert('vue-quill-editor组件不兼容IE10及以下浏览器，请使用更高版本的浏览器查看', '浏览器不兼容通知', {
//                 confirmButtonText: '确定'
//             });
//         } else {
//             next();
//         }
//     }
// });

Vue.prototype.$baseUrl = process.env.VUE_APP_BASE_API

// 1. 初始化时从 localStorage 读取值（若无则用默认值 true）
const initialIsStu = localStorage.getItem('isStu');
export const globalState = Vue.observable({
  isStu: initialIsStu ? JSON.parse(initialIsStu) : true
});
 
// 2. 挂载到 Vue 原型
Vue.prototype.$global = globalState;

new Vue({
    router,
    i18n,
    store,
    render: h => h(App)
}).$mount('#app');

new Vue({
  created() {
    // 监听 isStu 的变化
    this.$watch(
      () => this.$global.isStu,
      (newVal) => {
        localStorage.setItem('isStu', JSON.stringify(newVal));
      },
      { immediate: true } // 立即触发一次以确保初始值同步
    );
  }
});


