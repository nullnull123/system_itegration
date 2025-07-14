<template>
	<div class="job-recommendation">
		<!-- 加载状态 -->
		<div v-if="loading" class="loading-container">
			<div class="spinner"></div>
			<p>产生推荐结果中...</p>
		</div>

		<!-- 职位推荐结果 -->
		<div v-else class="job-list">
			<el-collapse @change="handleChange" v-model="activeName" accordion>
				<el-collapse-item v-for="(job, index) in jobData" :title="job.GZZWLBMC" :name="index"
					style="margin: 20px;font-size: 24px;">
					<div class="job-details">
						<p><strong>公司：</strong>{{ job.SJDWMC }}</p>
						<p><strong>专业要求：</strong>{{ job.major }}</p>
						<p><strong>发布时间：</strong>{{ job.create_time }}</p>
						<p v-html="job.desc"></p>
					</div>
					<el-button style='margin-top: 5px;' type="success" @click="goToDetail(job)">职位详情</el-button>
					<!-- <el-button style='margin-top: 5px;' type="primary" @click="send(job)">投递简历</el-button> -->
				</el-collapse-item>
			</el-collapse>
		</div>

		<!-- <div class="job-item" v-for="(job, index) in jobData" :key="index">
			<div class="job-header">
				<h3>{{ job.GZZWLBMC }}</h3>
			</div>
			<div class="job-details">
				<p><strong>公司：</strong>{{ job.SJDWMC }}</p>
				<p><strong>专业要求：</strong>{{ job.major }}</p>
				<p v-html="job.desc"></p>
			</div>
			<el-button style='margin-top: 5px;' type="success" @click="goToDetail(job)">职位详情</el-button>
			<el-button style='margin-top: 5px;' type="primary" @click="send(job)">投递简历</el-button>
		</div> -->

	</div>
</template>

<script>
	import {
		jobRecommend,
		coldRecommend,
		hotList,
		sendResume
	} from '@/api/job.js';
	export default {
		name: "JobRecommendation",
		data() {
			return {
				loading: true,
				jobData: [],
				activeName: -1,
			};
		},
		created() {
			this.getList();
		},
		methods: {
			handleChange(val) {
				console.log(val);
				//跳转到页面顶部
				// window.scrollTo({
				// 	top: 0,
				// 	behavior: 'smooth' // 平滑滚动
				// });
			},
			//投递简历
			send(job) {
				this.$confirm("您确定要投递简历吗？", "确认操作", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "warning"
					})
					.then(() => {
						sendResume(job.id).then(response => {
							this.$message.success("投递成功");
						})
					})
					.catch(() => {

					});
			},
			// 跳转到学校的就业信息网页面
			goToDetail(job) {
				// 新打开标签页
				let url = 'https://job.xidian.edu.cn/job/view/id/' + job.DWZZJGDM;
				window.open(url, '_blank');
				// window.location.href = url;
			},
			//获取职位推荐结果
			getList() {
				coldRecommend().then(response => {
					this.jobData = response.data;
					this.loading = false;
				});
				// 从localStorage中读取JSON字符串
				// const recommendResult = localStorage.getItem("recommendResult");

				// if (recommendResult != null) {
				// 	// 将JSON字符串转换回数组
				// 	this.jobData = JSON.parse(recommendResult);
				// 	this.loading = false;
				// } else {
				// 	coldRecommend().then(response => {
				// 		this.jobData = response.data;
				// 		this.loading = false;
				// 		//将推荐结果保存到本地缓存中
				// 		localStorage.setItem("recommendResult", JSON.stringify(this.jobData));
				// 	});
				// }
			}
		}
	};
</script>

<style scoped>
	.job-recommendation {
		max-width: 800px;
		margin-left: 50px;
		padding: 20px;
		background-color: #f9f9f9;
		border-radius: 8px;
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
	}

	.loading-container {
		text-align: center;
		margin-top: 50px;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid rgba(0, 0, 0, 0.2);
		border-top-color: #007bff;
		border-radius: 50%;
		display: inline-block;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}

		to {
			transform: rotate(360deg);
		}
	}

	.job-list {
		margin-top: 20px;
	}

	.job-item {
		background-color: #fff;
		padding: 15px;
		border: 1px solid #ddd;
		border-radius: 5px;
		margin-bottom: 15px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
	}

	.job-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.job-header h3 {
		margin: 0;
		font-size: 1.2em;
		color: #333;
	}

	.salary {
		font-size: 1em;
		color: #ff5722;
		font-weight: bold;
	}

	.job-details p {
		margin: 5px 0;
		font-size: 0.9em;
		color: #666;
	}
</style>