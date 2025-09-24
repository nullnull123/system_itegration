import axios from 'axios'

// 请求头设置
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

// 创建axios实例
const service = axios.create({
	// 请求URL公共部分
	baseURL: process.env.VUE_APP_BASE_API,
	// 超时时间
	timeout: 60000,
	// 允许携带cookies
	withCredentials: true,
})

// 获取CSRF Token的函数
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// 请求拦截器
service.interceptors.request.use(
	config => {
		// 添加token到请求头
		const token = localStorage.getItem('token');
		if (token) {
			config.headers['Authorization'] = `Token ${token}`;
		}
		
		// 添加CSRF Token到请求头
		const csrftoken = getCookie('csrftoken');
		if (csrftoken) {
			config.headers['X-CSRFToken'] = csrftoken;
		}
		
		// 特殊处理文件上传请求
		if (config.data instanceof FormData) {
			// 文件上传时删除Content-Type，让浏览器自动设置
			delete config.headers['Content-Type'];
		}
		
		return config;
	},
	error => Promise.reject(error)
)

// 响应拦截器
service.interceptors.response.use(
	response => response,
	error => {
		const { response } = error;
		if (response) {
			// 处理403错误
			if (response.status === 403) {
				console.error('权限验证失败:', response.data?.detail || '请检查登录状态和权限');
			}
			return Promise.reject(response);
		} else {
			console.error("网络异常");
			return Promise.reject(new Error("网络异常"));
		}
	}
)

export const JOB_URL = '/JobRec/api'
export const KL_URL = '/Graphapps' 
export const AC_URL = '/ai_class_workshop' 
export const VC_URL = '/videocut'

// 导出axios实例
export default service