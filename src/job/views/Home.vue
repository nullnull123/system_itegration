<template>
	<div>
		<div class="block">
			<div>
				<el-divider class="divider1"></el-divider>
			</div>
			<el-carousel class="carousel">
				<el-carousel-item v-for="(item, index) in links" :key="index">
					<template #default>
						<a :href="item.url" target="_blank">
							<img :src="item.image" class="carousel-image" />
						</a>
					</template>
				</el-carousel-item>
			</el-carousel>
		</div>
		<div class="grid-content bg-purple-dark"></div>
		<h1 class="text1">热招岗位</h1>
		<!-- 热招岗位列表 -->
		<el-row class="company-showcase" :gutter="20">
			<el-col :span="8" v-for="(job, index) in jobs" :key="index" v-if="index < 9">
				<el-card class="company-card" @mouseover="isHovering = true" @mouseleave="isHovering = false">
					<div class="card-content">
						<!-- 职位标题 -->
						<span class="job-position" :class="{ 'brighten-on-hover': isHovering }"
							@click="goToDetail(job)">
							<h3>{{ job.GZZWLBMC }}</h3>
						</span>
						<!-- 工作地址 -->
						<div class="address" style="margin-bottom: 10px;">
							<span>工作地点：{{ job.DWSZDDM }}</span>
						</div>
						<!-- 职位描述 -->
						<!-- <div class="job-description" style="margin-bottom: 10px;">
							<span>工作性质：{{ job.workNature }}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
							<span>学历要求：{{ job.degree }}</span>
						</div> -->
						<div>
							<!-- <span>职位数量：{{ job.workNum }}</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; -->
							<span>公司名称：{{ job.SJDWMC }}</span>
						</div>
					</div>
				</el-card>
			</el-col>
		</el-row>
	</div>
</template>

<script>
	import {
		hotList
	} from '../api/job';
	export default {
		data() {
			return {
				isHovering: false,
				activeIndex: '1',
				//轮播图
				links: [{
						image: require('../assets/1.png'),
						url: 'https://job.xidian.edu.cn/news/view/aid/338222/tag/tzgg?target=_blank'
					},
					{
						image: require('../assets/2.jpg'),
						url: 'https://www.iguopin.com/'
					},
					{
						image: require('../assets/3.png'),
						url: 'https://job.xidian.edu.cn/campus/view/id/747617?target=_blank'
					},
					{
						image: require('../assets/4.jpg'),
						url: 'https://jobone.51job.com/home.html?schpkid=c2bec403-a6b7-4144-8f8e-8b7471478474'
					},
					{
						image: require('../assets/5.jpg'),
						url: 'https://job.ncss.cn/student/jobfair/joint.html'
					},
				],
				//热招岗位数据
				jobs: [],
			};
		},
		methods: {
			handleSelect(key, keyPath) {
				console.log(key, keyPath);
			},
			// 跳转到学校的就业信息网页面
			goToDetail(job) {
				let url = 'https://job.xidian.edu.cn/job/view/id/' + job.DWZZJGDM;
				window.open(url, '_blank');
				// window.location.href = url;
			},
		},
		created() {
			// 获取热招岗位数据
			hotList().then(response => {
				this.jobs = response.data;
			})
		}
	};
</script>

<style lang="less" scoped>
	.el-carousel {
		margin-top: -20px;
	}

	::v-deep .el-carousel__container {
		height: 450px;
	}

	::v-deep .carousel-image {
		width: 100%;
		height: 100%;
	}

	.divider1 {
		margin-top: -10px;
	}

	.text1 {
		font-size: 30px;
		text-align: center;
		padding: 10px;
	}

	// .menu {
	// 	height: 60px;
	// 	width: 90%;
	// 	margin: auto;
	// }

	// .el-menu--horizontal {
	// 	width: 80%;
	// }

	// .el-menu--horizontal>.el-submenu,
	// .el-menu--horizontal>.el-menu-item {
	// 	flex: auto;
	// 	min-width: 220px;
	// }

	.company-card {
		display: flex;
		flex-direction: column;
		align-items: start;
		margin-top: 20px;
		transition: box-shadow 0.3s ease;
		position: relative;
	}

	.company-card:hover {
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
	}

	.job-position {
		margin-right: 10px;
		/* 初始状态的字体颜色 */
		color: #333;
		/* 假设职位初始颜色为灰色 */
		transition: color 0.3s ease;
	}

	.salary {
		color: orange;
		font-weight: bold;
		margin-left: auto;
	}

	.company-logo-container {
		display: flex;
		align-items: center;
		position: relative;
		/* 为 .company-name 添加绝对定位提供参考 */
	}

	.company-logo {
		border-radius: 50%;
		width: 50px;
		height: 50px;
		margin-right: 10px;
	}

	.company-name {
		margin-left: 10px;
		color: #000;
		/* 假设公司名初始颜色为黑色 */
		transition: color 0.3s ease;
		cursor: pointer;
		/* 显示手形光标 */
		position: relative;
		/* 为 z-index 工作 */
		z-index: 10;
		/* 确保公司名在 logo 上方 */
	}

	.company-card:hover .job-position {
		color: #00a6a7;
		cursor: pointer;
		text-decoration: underline;
		/* 保持灰色 */
	}

	/* 悬停在公司名上时，公司名变成灰色，职位恢复原来颜色 */
	.company-name:hover {
		color: #00a6a7;
		/* 公司名变为灰色 */
	}

	/* 确保职位在公司名悬停时不受影响 */
	.company-card:hover .company-name:hover .job-position {
		color: #00a6a7;
		/* 职位保持原来颜色 */
	}

	/* 通用链接样式 */
	.company-card-link,
	.company-logo-link {
		display: block;
		text-decoration: none;
		cursor: pointer;
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
</style>