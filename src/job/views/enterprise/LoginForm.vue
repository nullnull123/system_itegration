<template>
	<el-form :model="form" status-icon @submit.native.prevent="handleSubmit">
		<h3 class="title">{{ isRegister ? '注册' : '登录' }}</h3>
		<el-form-item prop="username">
			<el-input v-model="form.username" placeholder="用户名"></el-input>
		</el-form-item>
		<el-form-item prop="password">
			<el-input type="password" v-model="form.password" :placeholder="isRegister ? '设置密码' : '密码'"
				autocomplete="off"></el-input>
		</el-form-item>
		<!-- 只在注册时显示确认密码 -->
		<template v-if="isRegister">
			<el-form-item prop="confirmPassword">
				<el-input type="password" v-model="form.confirmPassword" placeholder="确认密码"
					autocomplete="off"></el-input>
			</el-form-item>
		</template>
		<template v-if="isRegister">
			<el-form-item prop="name">
				<el-input v-model="form.name" placeholder="公司名称" autocomplete="off"></el-input>
			</el-form-item>
		</template>
		<template v-if="isRegister">
			<el-form-item prop="unifiedCode">
				<el-input v-model="form.unifiedCode" placeholder="统一社会信用代码" autocomplete="off"></el-input>
			</el-form-item>
		</template>
		<template v-if="isRegister">
			<el-form-item prop="email">
				<el-input v-model="form.email" placeholder="企业注册邮箱" autocomplete="off"></el-input>
			</el-form-item>
		</template>
		<el-form-item>
			<el-button type="primary" @click="handleSubmit">{{ isRegister ? '注册' : '登录' }}</el-button>
		</el-form-item>
	</el-form>
</template>

<script>
	export default {
		name: 'LoginForm',
		props: ['isRegister'],
		data() {
			return {
				form: {
					username: '',
					password: '',
					confirmPassword: '',
					unifiedCode: '',
					email: '',
				}
			};
		},
		methods: {
			handleSubmit() {
				if (this.isRegister && this.form.password !== this.form.confirmPassword) {
					alert('两次输入的密码不一致！');
					return;
				}
				// 根据isRegister的值触发注册或登录逻辑
				this.$emit(this.isRegister ? 'register' : 'login', this.form);
			}
		}
	};
</script>

<style scoped>
	.title {
		text-align: center;
		margin-bottom: 20px;
	}
</style>