<template>
	<div class="header-container">
		<!-- 返回按钮 -->
		<div class="l-content">
			<el-image style="width: 370px; height: 60px" :src="url" :fit="fit"></el-image>
		</div>
		<div class="r-content">
			<el-button @click="goToHome" plain style="background-color: #aa0018;color: white;">首页</el-button>
			<!-- <el-button @click="back" plain style="background-color: #aa0018;color: white;">登录</el-button> -->
		</div>
		<!-- 用户头像 -->
		<!-- <div class="r-content">
			<el-dropdown class="dropdown" trigger="hover">
				<span class="el-dropdown-link" @click="goToPersonalCenter" @mouseover="isHover = true"
					@mouseout="isHover = false">
					<div class="user-info" :class="{ 'active-border': isHover }">
						<span class="username">{{ username }}</span>
					</div>
				</span>
				<el-dropdown-menu slot="dropdown">
					<el-dropdown-item @click.native="goToPersonalCenter">个人中心</el-dropdown-item>
					<el-dropdown-item>偏好设置</el-dropdown-item>
					<el-dropdown-item>退出账号</el-dropdown-item>
				</el-dropdown-menu>
			</el-dropdown>
		</div> -->
	</div>
</template>

<script>
	export default {
		data() {
			return {
				username: '用户中心',
				isHover: false,
				url: require('../assets/jyxxw_logo.png'),
				fit: 'fill'
			};
		},
		methods: {
			handleMenu() {
				this.$store.commit('collapseMenu');
			},
			goToPersonalCenter() {
				if (this.$router.currentRoute.path !== '/usercenter') {
					this.$router.push({
						name: 'UserCenter'
					});
				}
			},
			//返回
			back() {
				this.$router.push({
					path: '/login'
				});
			},
			//调转到就业信息网
			goToHome() {
				let url = 'https://job.xidian.edu.cn/';
				window.open(url);
			}
		},
	};
</script>

<style lang="less" scoped>
	.header-container {
		padding: 0 20px;
		background-color: white;
		height: 60px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid #a90015;
	}

	.l-content {
		display: flex;
		align-items: center;
	}

	.text {
		color: #fff;
		font-size: 14px;
		margin-left: 10px;
	}

	.r-content {
		display: flex;
		align-items: center;
	}

	.el-dropdown-link {
		display: flex;
		align-items: center;
		cursor: pointer;
		/* 鼠标悬停时显示手型光标 */
	}

	.user-info {
		display: flex;
		align-items: center;
		transition: box-shadow 0.3s;
		/* 平滑过渡效果 */
		cursor: pointer;
		/* 允许点击 */
		padding: 5px;
	}

	.user-info:hover {
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
		/* 鼠标悬停时添加阴影效果 */
		border-radius: 5px;
		/* 添加边框圆角 */
		background-color: #3c3f40;
		/* 悬停时背景色 */

	}

	.user-img {
		width: 40px;
		height: 40px;
		border-radius: 20px;
		margin-right: 8px;
		transition: transform 0.2s;
		/* 平滑过渡效果 */
	}

	.username {
		color: #fff;
		font-size: 14px;
		white-space: nowrap;
		margin-right: 10px;
	}

	/* 下拉菜单样式 */
	.el-dropdown-menu__item {
		padding: 10px;
		color: #333;
	}

	.el-dropdown-menu__item:hover {
		background-color: #e1e1e1;
	}
</style>