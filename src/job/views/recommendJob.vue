<template>
	<div class="card-container" style="margin-left: 50px;" v-loading="loading">
		<!-- <el-row style="margin-bottom: 20px;">
			<el-tabs v-model="activeName" @tab-click="handleClick">
				<el-tab-pane label="全部岗位" name="third"></el-tab-pane>
				<el-tab-pane label="全职岗位" name="first"></el-tab-pane>
				<el-tab-pane label="实习岗位" name="second"></el-tab-pane>
			</el-tabs>
		</el-row> -->
		<el-row :gutter="5">
			<el-col :span="6" v-for="(job,index) in showJobs" :key="job.id">
				<el-card :body-style="{ padding: '0px' }" class="card" @click.native="goToDetail(job)">
					<div :class="index % 2 === 0 ? 'card-header-red' : 'card-header-blue'">
						<div>{{ job.GZZWLBMC }}</div>
					</div>
					<div style="padding: 10px;color:#343437;">
						<div style="color: royalblue;margin-left: 10px;margin-top: 10px;">
							<i class="el-icon-office-building"></i>{{job.SJDWMC}}
						</div>
						<div style="margin-left: 8px;margin-top: 10px;">
							<i class="el-icon-location-outline"></i>{{job.DWSZDDM}}
						</div>
						<div style="margin-left: 10px;margin-top: 10px;">
							发布时间：{{job.create_time}}</br>
							招聘人数：{{job.NUM}}
						</div>
						<!-- <div style="margin-bottom: 15px;">单位：{{ job.SJDWMC }}</div>
						<div style="margin-bottom: 5px;">工作地点：{{ job.DWSZDDM }}</div>
						<div>发布时间：{{ job.create_time }}</div> -->
					</div>
				</el-card>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import {
		coldRecommend,  //
		clickJob  //
	} from '../api/job';
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
				activeName: 'third',
				//展示的职位数据(根据是否实习)
				showJobs: []
			};
		},
		methods: {
			handleClick(tab, event) {
				if (this.activeName == 'first') {
					// 展示全职岗位
					this.showJobs = this.jobs.filter(job => !job.GZZWLBMC.includes('实习'));
				} else if (this.activeName == 'second') {
					// 展示实习岗位
					this.showJobs = this.jobs.filter(job => job.GZZWLBMC.includes('实习'));
				} else {
					this.showJobs = this.jobs;
				}
			},
			// 跳转到学校的就业信息网页面
			goToDetail(job) {
				let id = job.DWZZJGDM;
				let url = 'https://job.xidian.edu.cn/job/view/id/' + id;
				// window.open(url, '_blank');
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
				// this.jobs = this.data.slice(0, 5);
				this.jobs = this.data;
				this.showJobs = this.jobs;
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
				// this.jobs = this.data.slice(0, 5);
				this.jobs = this.data;
				this.showJobs = this.jobs;
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

<style scoped>
	/* .card-container {
		height: 1280px;
		margin: 0 auto;
	} */

	.image {
		width: 100%;
		display: block;
		height: 80px;
	}

	.clearfix:before,
	.clearfix:after {
		display: table;
		content: "";
	}

	.clearfix:after {
		clear: both
	}

	.card {
		width: 350px;
		height: 260px;
		cursor: pointer;
		margin-bottom: 30px;
	}

	.card:hover {
		box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
		transform: translateY(-5px);
	}

	.card-header-red {
		background-image: url('../assets/pic1.png');
		width: 350px;
		height: 75px;
		line-height: 75px;
		color: white;
		text-align: center;
	}

	.card-header-blue {
		background-image: url('../assets/pic2.png');
		width: 350px;
		height: 75px;
		line-height: 75px;
		color: white;
		text-align: center;
	}
</style>