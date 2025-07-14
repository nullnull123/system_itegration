<template>
	<div id="display">
		<!-- 功能栏 -->
		<!-- <el-row style="width: 100%;margin-top: 10px;margin-bottom: 20px;">
			<el-col :span="10">
				<el-input placeholder="请输入搜索关键词" v-model="key" clearable></el-input>
			</el-col>
			<el-col :span="4">
				<el-button type="primary" @click="search">
					搜索
				</el-button>
			</el-col>
		</el-row> -->
		<el-row type="flex" justify="center" style="margin-top: 20px;">
			<el-col :span="8" class="job-card-col">
				<!-- 卡片区域 -->
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
							<!-- <div class="salary"
								style="position: absolute; top: 35px; right: 20px; color: orange; font-weight: bold;">
								{{ job.salary }}
							</div> -->
						</div>
					</el-card>
				</div>
				<!-- 分页组件 -->
				<el-pagination background layout="prev, pager, next" :total="total" :page-size="5"
					@current-change="handleCurrentChange">
				</el-pagination>
			</el-col>
			<el-col :span="16" class="job-detail-col">
				<!-- 详细职位信息区域 -->
				<el-card v-if="selectedJob" class="job-detail">
					<div class="detail-header" style="margin-bottom: 20px;">
						<!-- 职位名称和薪资信息 -->
						<h2 class="job-detail-title">
							{{ selectedJob.GZZWLBMC }}
							<!-- <span class="salary">{{ selectedJob.salary }}</span> -->
						</h2>
						<!-- 动作按钮 -->
						<!-- <div class="action-buttons">
							<el-button type="primary" icon="el-icon-star-off" circle
								@click="handleFavorite"></el-button>
							<el-button type="success" icon="el-icon-chat-round" circle
								@click="handleCommunicate"></el-button>
						</div> -->
					</div>
					<div class="detail-body">
						<p style="margin-bottom: 20px;"><i
								class="el-icon-location-outline"></i><strong>工作地点:&nbsp;&nbsp;&nbsp;</strong>
							{{ selectedJob.DWSZDDM }}
						</p>
						<p style="margin-bottom: 20px;"><i class="el-icon-date"></i><strong>专业要求:</strong></p>
						<p style="margin-bottom: 20px;">{{ selectedJob.major }}</p>
						<!-- <p><i class="el-icon-school"></i><strong>学历要求:&nbsp;&nbsp;&nbsp;</strong>
							{{ selectedJob.degree }}
						</p> -->
						<!-- <el-divider></el-divider> -->
						<!-- <div class="job-description">
							<h4>职位描述</h4>
							<p>{{ selectedJob.jobDescription }}</p>
							<div class="description-tags"
								v-if="selectedJob.descriptionTags && selectedJob.descriptionTags.length">
								<el-tag v-for="tag in selectedJob.descriptionTags" :key="tag"
									size="small">{{ tag }}</el-tag>
							</div>
						</div> -->
						<el-divider></el-divider>
						<div class="job-responsibilities">
							<!-- <h4>职位描述</h4> -->
							<div v-html="selectedJob.desc"></div>
						</div>
						<el-divider></el-divider>
						<el-button style='margin-top: 5px;' type="success" @click="goToDetail()">职位详情</el-button>
						<!-- <el-button type="primary" @click="send()">投递简历</el-button> -->
						<!-- 地图 -->
						<!-- <div id="map-container" class="map-container"></div> -->
					</div>
				</el-card>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import {
		jobList,
		sendResume,
		clickJob
	} from '../api/job';
	export default {
		data() {
			return {
				//地图实例
				map: null,
				//选中的职位id
				selectedJobId: null,
				//选中的职位
				selectedJob: null,
				//搜索关键词
				key: "",
				//浏览职位数据
				jobs: [],
				//数据总个数
				total: 1000,
			};
		},
		methods: {
			//投递简历
			send() {
				this.$confirm("您确定要投递简历吗？", "确认操作", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "warning"
					})
					.then(() => {
						sendResume(this.selectedJobId).then(response => {
							this.$message.success("投递成功");
						})
					})
					.catch(() => {

					});
			},
			// 跳转到学校的就业信息网页面
			goToDetail() {
				let id = this.selectedJob.DWZZJGDM;
				let url = 'https://job.xidian.edu.cn/job/view/id/' + id;
				window.open(url, '_blank');
				// window.location.href = url;
			},
			//分页请求
			handleCurrentChange(val) {
				jobList(val).then(response => {
					this.jobs = response.data.results;
					this.total = response.data.count;
					// 页面重新加载时默认选择第一个职位
					if (this.jobs.length > 0) {
						this.selectJob(this.jobs[0]);
					}
				})
			},
			//根据关键词搜索
			search() {},
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
				// console.log(this.selectedJob);
				//初始化地图
				// this.initMap();
			},
			selectCompany(job) {
				console.log(`Company ${job.companyName} selected.`);
			},
			handleFavorite() {
				// 待实现的收藏职位功能
			},
			handleCommunicate() {
				// 待实现的沟通职位功能
			},
			loadAMapApi() {
				let script = document.createElement('script');
				script.type = 'text/javascript';
				script.src =
					'//webapi.amap.com/maps?v=2.0&key=9689120cdeaba8b4ebfda01c49956065&plugin=AMap.Marker,AMap.ControlBar';
				script.async = true;
				document.head.appendChild(script);
				script.onload = () => {
					this.initMap();
				};
			},
			initMap() {
				// 确保 AMap API 已加载并创建地图实例
				if (window.AMap && this.selectedJob && this.selectedJob.coordinates) {
					this.createMap();
				}
			},
			//创建地图
			createMap() {
				if (!this.selectedJob || !this.selectedJob.coordinates || this.selectedJob.coordinates.some(coord => isNaN(
						coord))) {
					console.error('Selected job or coordinates are invalid.');
					return; // 退出函数，不创建地图
				}
				// 确保地图容器有尺寸
				const mapContainer = document.getElementById('map-container');
				if (!mapContainer || !mapContainer.offsetWidth || !mapContainer.offsetHeight) {
					console.error('Map container does not have a size.');
					return;
				}
				// 创建地图实例
				this.map = new AMap.Map('map-container', {
					zoom: 18, // 初始缩放级别
					center: this.selectedJob.coordinates, // 地图中心点坐标
					viewMode: '3D', // 设置为3D视图
					pitch: 45, // 初始俯仰角度
				});
				// 确保地图实例被创建后再添加标记和控件
				if (this.map) {
					// 添加地图标记
					new AMap.Marker({
						position: this.selectedJob.coordinates,
						map: this.map,
						title: this.selectedJob.companyName, // 鼠标悬停时的提示信息
					});
					// 添加控制栏控件
					this.map.addControl(new AMap.ControlBar({
						position: {
							right: '10px',
							top: '10px'
						}
					}));
					// 地图加载完成后，设置3D视图的初始视角
					this.map.on('complete', () => {
						// 可以在这里添加额外的3D视图设置代码
					});
				}
			},
		},
		mounted() {
			document.title = '工作推荐';
			// 组件挂载后加载高德地图 API
			this.loadAMapApi();
		},
		destroyed() {
			// 销毁地图实例
			if (this.map) {
				this.map.destroy();
			}
			// 确保地图实例被设置为null
			this.map = null;
			if (this.mapModule) {
				this.mapModule.dispose();
				this.mapModule = null;
			}
		},
		created() {
			// 获取职位列表数据
			jobList(1).then(response => {
				this.jobs = response.data.results;
				this.total = response.data.count;
				// 页面加载时默认选择第一个职位
				if (this.jobs.length > 0) {
					this.selectJob(this.jobs[0]);
				}
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

	.map-container {
		height: 400px;
		/* 增加高度以适应3D视图 */
		width: 100%;
	}

	/* 根据需要添加其他样式 */
</style>