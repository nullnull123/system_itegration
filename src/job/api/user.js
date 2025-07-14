import request from './request'


// 用户登录
export function login(username, password) {
	return request({
		url: '/user/login/',
		method: 'post',
		data: {
			'username': username,
			'password': password
		}
	})
}

// 学生统一身份认证登录
export function casLogin() {
	return request({
		url: '/user/casLogin/',
		method: 'get',
	})
}

//根据票据获取token
export function getToken(uid, name) {
	return request({
		url: '/user/getToken/?uid=' + uid + '&name=' + name,
		method: 'get',
	})
}

// 学生修改密码
export function changePassword(oldPassword, newPassword) {
	return request({
		url: '/user/changePassword',
		method: 'post',
		data: {
			'oldPassword': oldPassword,
			'new': newPassword
		}
	})
}

// 获取学生信息
export function getStudentInfo() {
	return request({
		url: '/user/studentInfo/',
		method: 'get',
	})
}

// 修改学生信息
export function updateStudentInfo(student) {
	return request({
		url: '/user/updateStudent/',
		method: 'post',
		data: student
	})
}