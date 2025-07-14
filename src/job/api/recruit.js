import request from './request'

// 学生查看已投递简历
export function getStudent() {
	return request({
		url: '/recruit/getStudent/',
		method: 'get',
	})
}

// 企业查看收到的学生简历
export function getCompany() {
	return request({
		url: '/recruit/getCompany/',
		method: 'get',
	})
}

// 企业修改简历状态
export function changeStatus(job_id) {
	return request({
		url: '/recruit/changeStatus/',
		method: 'post',
		data: {
			'job_id': job_id,
		}
	})
}