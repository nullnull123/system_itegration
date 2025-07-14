<template>
	<div>
		<el-container>
			<el-aside width="auto">
				<enterprise-aside />
			</el-aside>
			<el-container>
				<el-header><enterprise-header></enterprise-header></el-header>
				<el-main class="main"><router-view></router-view></el-main>
				<el-footer class="footer" height='200px'>
					<div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
						<!-- 左边 logo -->
						<div style="display: flex; align-items: center;margin-top: 20px;margin-left: 20px;">
							<el-image style="width: 130px; height: 130px" :src="leftUrl"></el-image>
						</div>
						<!-- 中间文字 -->
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
						<!-- 右边图片 -->
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
	import EnterpriseAside from "../../components/EnterpriseAside.vue";
	import EnterpriseHeader from "../../components/EnterpriseHeader.vue";
	export default {
		data() {
			return {
				leftUrl: require('../../assets/flogo.png'),
				rightUrl: require('../../assets/er.jpg'),
			}
		},
		components: {
			// EnterpriseAside,
			EnterpriseHeader
		},
	}
</script>

<style lang="less" scoped>
	.el-header {
		padding: 0;
	}

	.main {
		/**
		 * 设置背景图片
		 */
		background-image: url(../../assets/main_back.png);
		background-size: 100% 100%;
		background-attachment: fixed;
		min-height: 800px;
	}

	.footer {
		width: 100%;
		background-color: #aa0018;
	}
</style>