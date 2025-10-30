<template>
	<div class="login-register-container">
		<h1 style="color: white;">学生端登录</h1>
		<el-card class="box">
			<div>
				<el-form :model="activeForm" ref="loginForm" class="login-form"
					@submit.native.prevent="handleFormSubmit">
					<div class="title-container">
						<h3 class="title">{{ isLogin ? '学生登录' : '注册' }}</h3>
					</div>
					<!-- <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
						<el-tab-pane label="学生登录" name="first"></el-tab-pane>
						<el-tab-pane label="企业登录" name="second"></el-tab-pane>
					</el-tabs> -->
					<el-form-item prop="username">
						<el-input v-model="activeForm.username" placeholder="用户名" prefix-icon="el-icon-user"></el-input>
					</el-form-item>
					<el-form-item prop="password">
						<el-input :type="pwdType" v-model="activeForm.password" placeholder="密码"
							prefix-icon="el-icon-lock" @keyup.enter.native="handleFormSubmit"></el-input>
						<!-- 控制密码是否显示 -->
						<!-- <span class="show-pwd" @click="showPwd">{{ pwdType === 'password' ? '显示' : '隐藏' }}</span> -->
					</el-form-item>
					<template v-if="isLogin">
						<el-button type="primary" class="login-btn" @click="handleFormSubmit">
							<!-- {{ isLogin ? '统一身份认证' : '注册' }} -->
							{{ isLogin ? '免密登录' : '注册' }}
						</el-button>
					</template>
					<template v-else>
						<el-form-item prop="confirmPassword">
							<el-input type="password" v-model="activeForm.confirmPassword" placeholder="确认密码"
								prefix-icon="el-icon-lock"></el-input>
						</el-form-item>
						<el-button type="primary" class="login-btn" @click="handleFormSubmit">
							注册
						</el-button>
					</template>
					<!-- 注册按钮 -->
					<!-- <div class="options">
					<el-button type="text" @click="switchForm">{{ isLogin ? '注册账户' : '已有账户？去登录' }}</el-button>
				</div> -->
				</el-form>
			</div>
		</el-card>
		<h5 style="color: white;text-decoration: underline;cursor: pointer;" @click="gotoCompany">企业登录</h5>
		<!-- <el-button @click="test">测试</el-button> -->
	</div>
</template>

<script>
	import axios from 'axios';
	import {
		login,
		casLogin,
		getToken  //
	} from '@/job/api/user';
	import {
		jobList
	} from '@/job/api/job';
	export default {
		name: 'LoginRegister',
		data() {
			return {
				//选中的标签名
				activeName: 'first',
				isLogin: true, // 默认为登录状态
				activeForm: {
					username: '',
					password: '',
					confirmPassword: '' // 只在注册时使用
				},
				rules: {
					username: [{
							required: true,
							message: '请输入用户名',
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
			//测试统一身份认证
			test() {
				let url = 'https://ids.xidian.edu.cn/authserver/login?service=https%3A%2F%2Fjyxxw.xidian.edu.cn%2FexamIDS';
				window.location.href = url;
				// casLogin().then(response => {
				// 	console.log("casLogin", response);
				// })
			},
			//前往企业端
			gotoCompany() {
				this.$router.push({
					path: '/companyLogin'
				});
			},
			//切换标签时调用
			handleClick(tab, event) {
				console.log(tab, event);
			},
			showPwd() {
				if (this.pwdType === 'password') {
					this.pwdType = '';
				} else {
					this.pwdType = 'password';
				}
			},
			confirmPasswordValidator(rule, value, callback) {
				if (value !== this.activeForm.password) {
					callback(new Error('两次输入密码不一致!'));
				} else {
					callback();
				}
			},
			switchForm() {
				this.isLogin = !this.isLogin;
				this.$refs.loginForm.resetFields();
			},
			//提交表单
			handleFormSubmit() {
				this.$refs.loginForm.validate((valid) => {
					if (valid) {
						// 静态验证用户名和密码
						const isValidUser = this.activeForm.username === 'admin';
						const isValidPass = this.activeForm.password === 'admin';
						if (this.isLogin) {
							this.$global.isStu = true;


							//方便测试,部署时把这里注释掉
							this.$router.push('/main');
							localStorage.setItem("token", "e351cf1a5cde9d05bb5bd40dbdfabe9e3a3a1ff5");
							return;


							//跳转到统一身份认证
							let url =
								'https://ids.xidian.edu.cn/authserver/login?service=https%3A%2F%2Fjyxxw.xidian.edu.cn';
							window.location.href = url;
							调用统一身份认证接口
							casLogin().then(response => {
								console.log("casLogin", response);
							})
						} else {
							// 注册逻辑
							if (isValidUser && isValidPass && this.activeForm.password === this.activeForm
								.confirmPassword) {
								// alert('注册成功！');
								// 注册成功后的跳转逻辑，通常注册后可能需要登录或者显示成功消息
								this.$router.push({
									path: '/login'
								}); // 可以选择跳转到登录页或其他页面
							} else {
								// alert('注册失败，请确保信息正确填写！');
							}
						}
					}
				});
			}
		},
		created() {
			//从url链接中获取票据
			const params = new URLSearchParams(window.location.search);
			// 获取ticket参数的值
			const ticket = params.get('ticket');
			// 如果票据不为空
			if (ticket != null) {
				const that = this;
				//根据票据获取学生学号
				const service = 'https%3A%2F%2Fjyxxw.xidian.edu.cn';
				// 构建请求URL
				const service_validate_url =
					`https://ids.xidian.edu.cn/authserver/serviceValidate?service=${service}&ticket=${ticket}`;
				// 使用 axios 发送 GET 请求
				axios.get(service_validate_url)
					.then(function(response) {
						console.log("验证票据返回信息", response);
						const xmlString = response.data;
						const parser = new DOMParser();
						const xmlDoc = parser.parseFromString(xmlString, "text/xml");
						const uid = xmlDoc.getElementsByTagName("cas:uid")[0].textContent;
						const name = xmlDoc.getElementsByTagName("cas:userName")[0].textContent;
						getToken(uid, name).then(response => {
							console.log("getToken接口返回信息", response);
							localStorage.setItem("token", response.data.token);
							// 去掉 URL 中的 ticket 参数
							const url = new URL(window.location);
							url.searchParams.delete('ticket');
							history.replaceState({}, '', url);
							// 跳转到系统首页
							this.$global.isStu = true;
							that.$router.push({
								path: '/main'
							});
							// 弹窗提示
							// that.$message({
							// 	message: '请添加期望职位以获取更精确的推荐结果',
							// 	type: 'warning'
							// });
							localStorage.setItem('key', '研发工程师');
							//移除浏览器缓存
							localStorage.removeItem('show');
							localStorage.removeItem('visit');
							localStorage.removeItem('recommendResult');
						})
					})
					.catch(function(error) {
						console.log(error);
					});
			}
		},
	};
</script>

<style scoped>
	.login-register-container {
		display: flex;
		justify-content: center;
		flex-direction: column;
		align-items: center;
		height: 100vh;
		/**
		 * 设置背景图片
		 */
		background-image: url(../assets/background.jpg);
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