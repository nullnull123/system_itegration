import request from '@/api/request'
import {JOB_URL} from '@/api/request'

// 获取职位列表
export function jobList(page) {
	return request({
		url: JOB_URL+'/job/?page=' + page,
		method: 'get',
	})
}

// 获取职位详情
export function jobInfo(job_id) {
	return request({
		url: JOB_URL+'/job/' + job_id,
		method: 'get',
	})
}


// 向学生推荐职位
// export function jobRecommend() {
// 	return request({
// 		url: JOB_URL+'/job/recommend/',
// 		method: 'get',
// 	})
// }
export function jobRecommend(key) {
	return request({
		url: JOB_URL+'/job/recommendJob/?key=' + key + '',
		method: 'get',
	})
}
// export function jobRecommend() {
// 	return request({
// 		url: JOB_URL+'/job/recommend_jobs',
// 		method: 'get',
// 	})
// }

// 冷启动推荐
export function coldRecommend() {
	return request({
		url: JOB_URL+'/job/coldRecommend/',
		method: 'get',
	})
}

// 新增职位
export function jobAdd(job) {
	return request({
		url: JOB_URL+'/job/save/',
		method: 'post',
		data: job
	})
}

// 更新职位信息
export function jobUpdate(job) {
	return request({
		url: JOB_URL+'/job/' + job.id + '/',
		method: 'put',
		data: job
	})
}

// 根据关键词查询职位
export function jobSearch(key) {
	return request({
		url: JOB_URL+'/job/searchJob/',
		method: 'post',
		data: {
			'GZZWLBMC': key,
		}
	})
}

// 删除职位
export function jobDelete(job_id) {
	return request({
		url: JOB_URL+'/job/' + job_id + '/',
		method: 'delete',
	})
}

// 获取热门职位列表
export function hotList() {
	return request({
		url: JOB_URL+'/job/hotList/',
		method: 'get',
	})
}

// 获取职位列表数据
export function workList(page) {
	return request({
		url: JOB_URL+'/work/?page=' + page,
		method: 'get',
	})
}

// 企业获取自己创建的所有职位
export function myJob(page) {
	return request({
		url: JOB_URL+'/job/myJob/',
		method: 'get',
	})
}

// 学生投递简历
export function sendResume(id) {
	return request({
		url: JOB_URL+'/recruit/send/',
		method: 'post',
		data: {
			'job_id': id
		}
	})
}

// 学生点击职位
export function clickJob(id) {
	return request({
		url: JOB_URL+'/job/clickJob/',
		method: 'post',
		data: {
			'id': id
		}
	})
}