import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
// import './assets/css/theme-green/index.css'; // 浅绿色主题
import './assets/css/icon.css';
import './components/common/directives';
import 'babel-polyfill';
import store from './job/store'

Vue.config.productionTip = false;
Vue.use(ElementUI, {
    size: 'small'
});


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


