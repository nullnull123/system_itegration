<template>
	<div id="display" v-loading="loading">
		<el-row type="flex" justify="center" style="margin-top: 20px;">
			<!-- 左侧区域 -->
			<el-col :span="6" class="job-card-col">
				<div v-for="job in jobs" :key="job.id" class="job-card"
					:class="{ 'selected': job.id === selectedJobId }" @click="selectJob(job)">
					<el-card class="job-card-content">
						<div class="job-info">
							<!-- 职位名称 -->
							<h3 class="job-title">{{ job.GZZWLBMC }}</h3>
							<!-- 公司信息和位置 -->
							<div class="company-info" style="margin-top: 30px;">
								{{ job.SJDWMC }}
							</div>
						</div>
					</el-card>
				</div>
				<!-- 分页组件 -->
				<el-pagination background layout="prev, pager, next" :total="total" :page-size="5"
					@current-change="handleCurrentChange">
				</el-pagination>
			</el-col>
			<!-- 右侧区域 -->
			<el-col :span="18" class="job-detail-col">
				<el-card v-if="selectedJob" class="job-detail">
					<div class="detail-header" style="margin-bottom: 20px;">
						<!-- 职位名称和薪资信息 -->
						<h2 class="job-detail-title">
							{{ selectedJob.GZZWLBMC }}
						</h2>
					</div>
					<div class="detail-body">
						<p style="margin-bottom: 20px;"><i
								class="el-icon-location-outline"></i><strong>工作地点:&nbsp;&nbsp;&nbsp;</strong>
							{{ selectedJob.DWSZDDM }}
						</p>
						<p style="margin-bottom: 20px;"><i class="el-icon-date"></i><strong>专业要求:</strong></p>
						<p style="margin-bottom: 20px;">{{ selectedJob.major }}</p>
						<el-divider></el-divider>
						<div class="job-responsibilities">
							<div v-html="selectedJob.desc"></div>
						</div>
						<el-divider></el-divider>
						<el-button style='margin-top: 5px;' type="success" @click="goToDetail()">职位详情</el-button>
					</div>
				</el-card>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import {
		coldRecommend,
		clickJob
	} from '@/api/job';
	export default {
		data() {
			return {
				//选中的职位id
				selectedJobId: null,
				//选中的职位
				selectedJob: null,
				//搜索关键词
				key: "",
				//浏览职位数据
				jobs: [],
				//数据总个数
				total: 15,
				//全部的职位推荐数据
				data: [],
				//是否加载中
				loading: true,
			};
		},
		methods: {
			// 跳转到学校的就业信息网页面
			goToDetail() {
				let id = this.selectedJob.DWZZJGDM;
				let url = 'https://job.xidian.edu.cn/job/view/id/' + id;
				window.open(url, '_blank');
			},
			//分页请求
			handleCurrentChange(page) {
				const pageSize = 5;
				const start = (page - 1) * pageSize;
				const end = start + pageSize;
				this.jobs = this.data.slice(start, end);
			},
			//点击某个工作时调用
			selectJob(job) {
				//处理数据
				this.selectedJob = job;
				this.selectedJobId = job.id;
				//添加职位浏览数据
				clickJob(this.selectedJobId).then(response => {});
				//保存学生上一次点击的职位名称
				localStorage.setItem('key', job.GZZWLBMC);
				return;
				//使用正则表达式提取三种数据
				let text = job.desc.replace(/&nbsp;/g, '');
				//正则表达式匹配岗位职责并分割成数组
				//正则表达式匹配岗位职责
				const jobResponsibilitiesRegex = /岗位职责：([\s\S]*?)(?=任职要求：)/;
				const jobResponsibilitiesMatches = jobResponsibilitiesRegex.exec(text)[1].trim();
				const jobResponsibilities = jobResponsibilitiesMatches.substring(0, jobResponsibilitiesMatches.length - 1)
					.split('；');
				//正则表达式匹配任职要求
				const jobRequirementsRegex = /任职要求：([\s\S]*?)(?=工作地点：)/;
				const jobRequirementsMatches = jobRequirementsRegex.exec(text)[1].trim();
				const jobRequirements = jobRequirementsMatches.substring(0, jobRequirementsMatches.length - 1)
					.split('；');
				//正则表达式匹配工作地点
				const workLocationRegex = /工作地点：([\s\S]*?)(?=\s*$)/;
				const workLocation = workLocationRegex.exec(text)[1].trim();
				//保存数据
				this.selectedJob.workLocation = workLocation;
				this.selectedJob.responsibilities = jobResponsibilities;
				this.selectedJob.workrequire = jobRequirements;
			}
		},
		created() {
			//判断缓存中有无数据
			if (localStorage.getItem('recommendResult') !== null) {
				this.data = JSON.parse(localStorage.getItem('recommendResult'));
				this.total = this.data.length;
				// 页面加载时默认选择第一个职位
				this.jobs = this.data.slice(0, 5);
				if (this.jobs.length > 0) {
					this.selectJob(this.jobs[0]);
				}
				this.loading = false;
				return;
			}
			//获取职位推荐结果
			coldRecommend().then(response => {
				this.data = response.data;
				this.total = response.data.length;
				// 页面加载时默认选择第一个职位
				this.jobs = this.data.slice(0, 5);
				if (this.jobs.length > 0) {
					this.selectJob(this.jobs[0]);
				}
				//修改加载状态
				this.loading = false;
				//保存到缓存中
				// 设置 token 的过期时间
				const expirationTime = new Date().getTime() + (15 * 60 * 1000);
				localStorage.setItem('recommendResult', JSON.stringify(this.data));
			});
		}
	};
</script>

<style lang="less" scoped>
	#display {
		overflow: hidden;
	}

	.job-card-col {
		margin-right: 20px;
	}

	.job-card {
		margin-bottom: 10px;
		cursor: pointer;
		border-radius: 8px;
	}

	.job-card.selected {
		box-shadow: 0 0 10px #22b1b2;
	}

	.job-card-content {
		position: relative;
		padding: 10px;
	}

	.job-title {
		margin: 0 0 10px;
		color: black;
		transition: color 0.3s;
		// 过长的部分用省略号代替
		white-space: nowrap;
		/* 防止文本换行 */
		overflow: hidden;
		/* 隐藏超出部分 */
		text-overflow: ellipsis;
		/* 超出部分显示省略号 */
		width: 100%;
		/* 设置一个固定的宽度，可以根据实际需求调整 */
	}

	.job-card:hover .job-title,
	.job-card.selected .job-title {
		color: #22b1b2;
	}

	.job-tags {
		display: flex;
		flex-wrap: wrap;
	}

	.company-info {
		display: flex;
		align-items: center;
		margin-top: 10px;
	}

	.company-link {
		text-decoration: none;
		color: black;
		transition: color 0.3s;
	}

	.company-logo {
		width: 30px;
		height: 30px;
		margin-top: 20px;
		margin-right: 10px;
		border-radius: 50%;
	}

	.company-name:hover {
		color: #22b1b2;
	}

	.salary {
		position: absolute;
		top: 10px;
		right: 20px;
		color: orange;
		font-weight: bold;
	}

	.job-detail {
		margin-left: 20px;
		padding: 20px;
		border-radius: 8px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.detail-header {
		display: flex;
		align-items: center;
	}

	.job-detail-title {
		margin: 0;
		font-size: 24px;
		flex-grow: 1;
	}

	.action-buttons {
		display: flex;
		gap: 8px;
		margin-top: 20px;
	}

	.action-buttons .el-button {
		padding: 8px;
	}

	.detail-body {
		margin-top: 20px;
	}

	.detail-body p {
		display: flex;
		align-items: center;
		margin: 10px 0;
		font-size: 16px;
		color: #666;
		/* 调整图标和文本的位置 */
		padding-left: 20px;
		/* 为图标留出空间 */
	}

	.detail-body strong {
		color: #333;
		font-weight: bold;
	}

	.detail-body i {
		margin-right: 10px;
		/* 图标和文本之间的间距 */
	}

	.description-tags .el-tag {
		background-color: #f8f8f8;
		/* 青色背景 */
		border-color: #f8f8f8;
		/* 保持边框颜色与背景色一致 */
		margin-right: 20px;
		/* 标签之间的间隔 */
		margin-bottom: 8px;
		/* 标签垂直方向的间隔，如果不需要可以去掉 */
	}

	.description-tags .el-tag {
		border-radius: 4px;
		/* 圆角边框 */
	}

	.description-tags .el-tag:hover {
		opacity: 0.8;
	}
</style>