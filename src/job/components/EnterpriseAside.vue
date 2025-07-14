<template>
	
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
				defaultActive: 'studentList',
				backgroundColor: '#324157', // 背景颜色
				textColor: '#fff', // 文字颜色
				activeTextColor: '#ffd04b', // 激活项文字颜色
				menuData: [{
          path: "/enterprise/manage",
          name: "profile",
          label: "人才推荐",
          icon: "s-custom",
        },
          // {
					// 	path: "/enterprise/studentList",
					// 	name: "findjob",
					// 	label: "人才浏览",
					// 	icon: "magic-stick",
					// },
					// {
					// 	path: "/enterprise/recruit",
					// 	name: "recruit",
					// 	label: "投递简历管理",
					// 	icon: "s-custom",
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