import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
// import './assets/css/theme-green/index.css'; // 浅绿色主题

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'   // 可选，JS 组件

import './assets/css/videocutcss/iconfont.css'
import './assets/css/icon.css';//后于 import './assets/css/videocutcss/iconfont.css'
import './components/common/directives';
import 'babel-polyfill';
import jobstore from './job/store'
import store from './aiclass/store'
import request from './api/request'
// localStorage.removeItem('token');

Vue.config.productionTip = false;
Vue.use(ElementUI, {
    size: 'small'
});


Vue.prototype.$baseUrl = process.env.VUE_APP_BASE_API
Vue.prototype.Event = new Vue

// 1. 初始化时从 localStorage 读取值（若无则用默认值 true）
const initialIsStu = sessionStorage.getItem('isStu');
export const globalState = Vue.observable({
  isStu: initialIsStu ? JSON.parse(initialIsStu) : true
});
 
// 2. 挂载到 Vue 原型
Vue.prototype.$axios = request

Vue.config.productionTip = false

Vue.prototype.$global = globalState;
// console.log('Store Structure:', store.state.smartPrep)
new Vue({
    router,
    jobstore,
    store,
    render: h => h(App)
}).$mount('#app');


new Vue({
  created() {
    // 监听 isStu 的变化
    this.$watch(
      () => this.$global.isStu,
      (newVal) => {
        sessionStorage.setItem('isStu', JSON.stringify(newVal));
      },
      { immediate: true } // 立即触发一次以确保初始值同步
    );
  }
});


