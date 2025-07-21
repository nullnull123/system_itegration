<template>
	<div class="login-register-container">
		<h1 style="color: white;">双向就业推荐系统企业端</h1>
		<el-card class="box">
			<el-form :model="activeForm" :rules="rules" ref="loginForm" class="login-form"
				@submit.native.prevent="handleFormSubmit">
				<div class="title-container">
					<h3 class="title">{{ isLogin ? '企业登录' : '注册' }}</h3>
				</div>
				<el-form-item prop="username">
					<el-input v-model="activeForm.username" placeholder="企业账户" prefix-icon="el-icon-user"></el-input>
				</el-form-item>
				<el-form-item prop="password">
					<el-input :type="pwdType" v-model="activeForm.password" placeholder="密码" prefix-icon="el-icon-lock"
						@keyup.enter.native="handleFormSubmit"></el-input>
				</el-form-item>
				<template v-if="isLogin">
					<el-button type="primary" class="login-btn" @click="handleFormSubmit">
						{{ isLogin ? '登录' : '注册' }}
					</el-button>
				</template>
				<template v-else>
					<el-form-item prop="confirmPassword">
						<el-input type="password" v-model="activeForm.confirmPassword" placeholder="确认密码"
							prefix-icon="el-icon-lock"></el-input>
					</el-form-item>
					<el-form-item prop="name">
						<el-input v-model="activeForm.name" placeholder="公司名称" autocomplete="off"></el-input>
					</el-form-item>
					<el-form-item prop="unifiedCode">
						<el-input v-model="activeForm.unifiedCode" placeholder="统一社会信用代码" autocomplete="off"></el-input>
					</el-form-item>
					<el-form-item prop="email">
						<el-input v-model="activeForm.email" placeholder="企业注册邮箱" autocomplete="off"></el-input>
					</el-form-item>
					<el-button type="primary" class="login-btn" @click="handleFormSubmit">
						注册
					</el-button>
				</template>
				<!-- 注册按钮 -->
				<div class="options">
					<el-button type="text" @click="switchForm">{{ isLogin ? '注册企业账户' : '已有账户？去登录' }}</el-button>
				</div>
			</el-form>
		</el-card>
		<h5 style="color: white;text-decoration: underline;cursor: pointer;" @click="gotoHome">学生登录</h5>
	</div>
</template>

<script>
	import {
		login
	} from '../../api/user';  //
	import {
		register
	} from '@/job/api/company';  //
	export default {
		name: 'LoginRegister',
		data() {
			return {
				isLogin: true, //记录当前的表单状态(是登录还是注册)
				activeForm: {
					username: '',
					password: '',
					name: '',
					confirmPassword: '',
					unifiedCode: '',
					email: '',
				},
				rules: {
					username: [{
							required: true,
							message: '请输入企业账户',
							trigger: 'blur'
						},
						{
							min: 3,
							max: 15,
							message: '长度在 3 到 15 个字符',
							trigger: 'blur'
						}
					],
					password: [{
							required: true,
							message: '请输入密码',
							trigger: 'blur'
						},
						{
							min: 5,
							max: 30,
							message: '长度在 5 到 30 个字符',
							trigger: 'blur'
						}
					],
					confirmPassword: [{
						validator: this.confirmPasswordValidator,
						trigger: 'blur'
					}]
				},
				pwdType: 'password', // 密码框类型
			};
		},
		methods: {
			gotoHome() {
				this.$router.push({
					path: '/login'
				});
			},
			//显示密码
			showPwd() {
				if (this.pwdType === 'password') {
					this.pwdType = '';
				} else {
					this.pwdType = 'password';
				}
			},
			//验证两次密码输入是否一致
			confirmPasswordValidator(rule, value, callback) {
				if (value !== this.activeForm.password) {
					callback(new Error('两次输入密码不一致!'));
				} else {
					callback();
				}
			},
			//在登录或者注册两个表单间切换
			switchForm() {
				this.isLogin = !this.isLogin;
				this.$refs.loginForm.resetFields();
			},
			//提交登录或注册表单
			handleFormSubmit() {
				this.$refs.loginForm.validate((valid) => {
					//测试用
					// this.$global.isStu = false;
					// this.$router.push({
					// 				path: '/main'
					// 			});
					//
					if (valid) {
						if (this.isLogin) {
							//发送登录请求
							login(this.activeForm.username, this.activeForm.password).then(response => {
								//保存token到浏览器缓存中
								localStorage.setItem("token", response.data.token);
								//登录成功，跳转到企业端首页
								this.$global.isStu = false;
								this.$router.push({
									path: '/main'
								});
							}).catch(error => {
								// 弹窗提示
								this.$message({
									message: '密码错误',
									type: 'warning'
								});
							});
						} else {
							const password = this.activeForm.password;
							// 校验密码长度（不少于8位）
							const lengthCheck = password.length >= 8;

							// 校验密码是否包含数字
							const hasNumber = /[0-9]/.test(password);

							// 校验密码是否包含大写字母
							const hasUpperCase = /[A-Z]/.test(password);

							// 校验密码是否包含小写字母
							const hasLowerCase = /[a-z]/.test(password);

							// 校验密码是否包含特殊符号
							const hasSpecialChar = /[\W]/.test(password); // \W 匹配非字母数字字符

							// 统计满足的条件数量
							const conditionCount = [hasNumber, hasUpperCase, hasLowerCase, hasSpecialChar].filter(
								Boolean).length;

							// 检查是否满足至少三种条件
							const typeCheck = conditionCount >= 3;

							// 综合校验结果
							const isValid = lengthCheck && typeCheck;

							if (!isValid) {
								this.$message({
									message: '密码应不少于8位，至少包含三个元素（数字、大写字母、小写字母、特殊符号）',
									type: 'warning'
								});
								// 返回
								return;
							}

							// 判断两次输入的密码是否相同
							if (this.activeForm.password === this.activeForm.confirmPassword) {
								//发送注册请求
								register(this.activeForm).then(response => {
									console.log(response);
									this.$global.isStu = false;
									this.$router.push({
										path: '/enterprisehome'
									});
									this.$message({
										message: '注册成功',
										type: 'success'
									});
								})
							} else {
								//弹窗两次输入的密码不一致
								this.$message({
									message: '两次输入的密码不一致',
									type: 'warning'
								});
							}

						}
					}
				});
			}
		},
		created() {},
	};
</script>

<style scoped>
	.login-register-container {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		height: 100vh;
		/**
		 * 设置背景图片
		 */
		background-image: url(../../assets/background1.jpg);
		background-size: 100% 100%;
	}

	.box {
		width: 400px;
		padding: 20px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	}

	.title-container {
		text-align: center;
		margin-bottom: 20px;
	}

	.login-form {
		width: 100%;
	}

	.login-btn {
		width: 100%;
		margin-bottom: 20px;
	}

	.options {
		text-align: center;
	}

	.show-pwd {
		position: absolute;
		right: 10px;
		top: 7px;
		font-size: 16px;
		cursor: pointer;
		color: #409eff;
	}
</style>