<template>
	<div>
		<el-container>
			<el-container>
				<el-header><common-header></common-header></el-header>
				<el-main class="main">
					<div>
						<!-- <el-row style="margin-left: 50px;">
							<el-tabs v-model="activeName" @tab-click="handleClick">
								<el-tab-pane label="职位推荐" name="recommend"></el-tab-pane>
								<el-tab-pane label="学生简历" name="profile"></el-tab-pane>
							</el-tabs>
						</el-row> -->
						<router-view></router-view>
					</div>
				</el-main>
				<el-footer class="footer" height='200px'>
					<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
						<div style="font-size: 14px; color: white;width: 600px;margin-top: 10px;">
							<el-row>
								<el-col :span="8">
									学生服务:<br>
									本科生:029-81891222<br>
									研究生:029-88202234
								</el-col>
								<el-col :span="8">
									单位服务:<br>
									南校区:029-81891196<br>
									北校区:029-88202234
								</el-col>
								<el-col :span="8">
									电子邮箱:<br>
									研究生:xdjy@xidian.edu.cn<br>
									本科生:jy@mail.xidian.edu.cn
								</el-col>
							</el-row>
							<el-row>
								智能推荐说明:<br>
								本网站采用先进模型算法，基于学生简历信息（如技能、经历）与企业岗位需求进行智能匹配，实现精准职位推荐。
							</el-row>
							<el-row>
								安全隐私说明:<br>
								我们严格保护师生个人信息安全，采用行业标准加密技术，遵守隐私法规，确保数据仅用于匹配推荐，杜绝泄露风险。
							</el-row>
						</div>
						<div style="display: flex; align-items: center;margin-top: 20px;margin-right: 20px;">
							<el-image style="width: 130px; height: 130px" :src="rightUrl"></el-image>
						</div>
					</div>
				</el-footer>
			</el-container>
		</el-container>

	</div>
</template>


<script>
	import CommonAside from "../components/CommonAside.vue";
	import CommonHeader from "../components/CommonHeader.vue";
	export default {
		data() {
			return {
				leftUrl: require('../assets/flogo.png'),
				rightUrl: require('../assets/er.jpg'),
				activeName: 'recommend',
			}
		},
		// methods: {
		// 	handleClick(tab, event) {
		// 		if (this.activeName == 'recommend') {
		// 			this.$router.push({
		// 				path: '/recommendJob'
		// 			});
		// 		} else if (this.activeName == 'profile') {
		// 			this.$router.push({
		// 				path: '/profile'
		// 			});
		// 		}
		// 	},
		// },
		components: {
			CommonAside,
			CommonHeader
		},
	}
</script>

<style lang="less" scoped>
	// * {
	// 	padding: 0;
	// }

	.el-header {
		padding: 0;
		// margin-bottom: 50px;
	}

	.main {
		/**
		 * 设置背景图片
		 */
		background-image: url(../assets/main_back.png);
		background-size: 100% 100%;
		background-attachment: fixed;
		min-height: 800px;
	}

	.footer {
		width: 100%;
		background-color: #aa0018;
	}
</style>