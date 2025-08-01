import request from '@/api/request'
import {JOB_URL} from '@/api/request'

// 创建公司账户
export function register(form) {
	return request({
		url: JOB_URL+'/company/save/',
		method: 'post',
		data: form
	})
}