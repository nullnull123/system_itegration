import request from './request'

// 创建公司账户
export function register(form) {
	return request({
		url: '/company/save/',
		method: 'post',
		data: form
	})
}