<template>
	<div>
		<el-menu :default-active="defaultActive" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
			:collapse="isCollapse" :background-color="backgroundColor" :text-color="textColor"
			:active-text-color="activeTextColor">
			<!-- 菜单项 -->
			<h3>{{ isCollapse? ' ' : '学生端' }}</h3>
			<el-menu-item v-for="item in noChildren" :key="item.name" :index="item.name" v-on:click="clickMenu(item)">
				<i :class="`el-icon-${item.icon}`"></i>
				<span slot="title">{{ item.label }}</span>
			</el-menu-item>
		</el-menu>
	</div>
</template>

<style lang="less" scoped>
	.el-menu-vertical-demo:not(.el-menu--collapse) {
		width: 200px;
		min-height: 400px;
	}

	.el-menu {
		height: 150vh;
		border-right: none;

		h3 {
			color: #ffff;
			text-align: center;
			line-height: 48px;
			font-size: 16px;
			font-weight: 400;
		}
	}

	.el-menu-vertical-demo {
		overflow: auto;
		/* 允许滚动，但隐藏滚动条 */
	}
</style>

<script>
	export default {
		data() {
			return {
				defaultActive: 'home',
				backgroundColor: '#545c64', // 背景颜色
				textColor: '#ffd04b', // 文字颜色
				activeTextColor: '#ffd04b', // 激活项文字颜色
				menuData: [{
						path: "/recommendJob",
						name: "recommendJob",
						label: "职位推荐",
						icon: "magic-stick",
					},
					// {
					//   path: "/home",
					//   name: "home",
					//   label: "首页",
					//   icon: "s-home",
					// },
					// {
					//   path: "/profile",
					//   name: "profile",
					//   label: "个人信息",
					//   icon: "s-custom",
					// },
					// {
					//   path: "/findjob",
					//   name: "findjob",
					//   label: "我要求职",
					//   icon: "magic-stick",
					// },
				]
			};
		},
		methods: {
			handleOpen(key, keyPath) {
				console.log(key, keyPath);
			},
			handleClose(key, keyPath) {
				console.log(key, keyPath);
			},
			clickMenu(item) {
				console.log(item)
				if (this.$route.path !== item.path && !(this.$route.path === '/home' && (item.path === '/'))) {
					this.$router.push(item.path)
				}
			}
		},
		computed: {
			noChildren() {
				return this.menuData.filter(item => !item.children);
			},
			isCollapse() {
				return this.$store.state.tab.isCollapse
			}
		}
	}
</script>