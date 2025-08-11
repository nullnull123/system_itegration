import axios from 'axios'

// 请求头设置
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'

// 创建axios实例
const service = axios.create({
	// 请求URL公共部分
	baseURL: process.env.VUE_APP_BASE_API,
	// 超时时间
	timeout: 60000,
	// 所有请求携带token
	// headers: {
	// 	'Authorization': 'Token ' + localStorage.getItem('token'),
	// },
})

// 请求拦截器
service.interceptors.request.use(
	config => {
		const token = localStorage.getItem('token');
		// 如果token存在，将其添加到请求头中
		if (token) {
			config.headers['Authorization'] = `Token ${token}`;
		}
		return config;
	},
	error => Promise.error(error)
)

// 响应拦截器
service.interceptors.response.use(
	// // 请求成功
	// res => res.status === 200 ? Promise.resolve(res) : Promise.reject(res),
	// // 请求失败
	// error => {
	// 	const {
	// 		response
	// 	} = error;
	// 	if (response) {
	// 		return Promise.reject(response);
	// 	} else {
	// 		console.log("网络异常")
	// 	}
	// }
)

export const JOB_URL = '/JobRec/api'
export const KL_URL = '/Graphapps' 

// 导出axios实例
export default service