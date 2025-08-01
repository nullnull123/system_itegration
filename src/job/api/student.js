import request from '@/api/request'
import {JOB_URL} from '@/api/request'

// 获取学生列表
export function studentList(page) {
	return request({
		url: JOB_URL+'/student/?page=' + page,
		method: 'get',
	})
}

// 获取学生详细信息
export function studentInfo(student_id) {
	return request({
		url: JOB_URL+'/student/' + student_id,
		method: 'get',
	})
}

// 根据id获取学生详细信息
export function studentInfoById(id) {
	return request({
		url: JOB_URL+'/student/' + id + '/',
		method: 'get',
	})
}

// 向职位推荐候选人
export function studentRecommend(job_id) {
	return request({
		url: JOB_URL+'/student/recommend/',
		method: 'post',
		data: {
			'id': job_id
		}
	})
}

// 根据关键词查询
export function studentSearch(key) {
	return request({
		url: '/student/search/' + key,
		method: 'get',
	})
}


// 条件检索学生信息
export function searchStudent(data, page) {
	return request({
		url: JOB_URL+'/student/searchStudent/?page=' + page,
		method: 'post',
		data: data
	})
}

// 获取学生简历
export function getResume() {
	return request({
		url: '/resume/getResume/',
		method: 'get'
	})
}

// 根据id获取学生简历
export function getResumeById(id) {
	return request({
		url: '/resume/getResumeById/?id=' + id,
		method: 'get'
	})
}

// 修改学生简历
export function updateResume(data) {
	return request({
		url: JOB_URL+'/resume/updateResume/',
		method: 'post',
		data: data
	})
}

// 编辑学生信息
export function updateStudentInfo(data) {
	return request({
		url: JOB_URL+'/student/' + data.id + '/',
		method: 'put',
		data: data
	})
}