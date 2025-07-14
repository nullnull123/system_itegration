<template>
	<div>
		<div style="margin-top: 150px;margin-left: 100px;">
			<!-- 企业招聘数量对比图 -->
			<div ref="barChart" style="width: 400px;height:400px;float: left; overflow: hidden"></div>
			<div ref="pieChart" style="width: 400px;height:400px;float: left; overflow: hidden"></div>
			<!-- 职位一周访问量图表-->
			<div ref="chart" style="width: 400px; height: 400px;overflow: hidden"></div>
		</div>
	</div>
</template>

<script>
	// 引入ECharts
	import * as echarts from 'echarts';
	export default {
		name: 'EChartsComponent',
		data() {
			return {
				// 存储ECharts实例
				barChart: null,
				pieChart: null,
				chart: null,
			};
		},
		mounted() {
			this.initBarChart();
			this.initPieChart();
			this.initChart();
		},
		methods: {
			initBarChart() {
				// 初始化柱状图ECharts实例
				this.barChart = echarts.init(this.$refs.barChart);

				// 指定柱状图的配置项和数据
				const barOption = {
					title: {
						text: '招聘人数对比'
					},
					tooltip: {},
					// legend: {
					// 	data: ['去年招聘人数', '今年招聘人数']
					// },
					xAxis: {
						data: ['华为', '腾讯', '中兴', '小米', '蔚来', '比亚迪']
					},
					yAxis: {},
					series: [{
							name: '去年招聘人数',
							type: 'bar',
							data: [120, 132, 101, 134, 90, 230]
						},
						{
							name: '今年招聘人数',
							type: 'bar',
							data: [220, 182, 191, 234, 290, 330],
							itemStyle: {
								color: '#7ed6df' // 可以设置不同的颜色
							}
						}
					]
				};
				// 使用刚指定的配置项和数据显示柱状图
				this.barChart.setOption(barOption);
			},
			initPieChart() {
				// 初始化饼状图ECharts实例
				this.pieChart = echarts.init(this.$refs.pieChart);
				// 指定饼状图的配置项和数据
				const pieOption = {
					title: {
						text: '招聘人数占比',
						left: 'center'
					},
					tooltip: {
						trigger: 'item'
					},
					legend: {
						orient: 'vertical',
						left: 'left'
					},
					series: [{
						name: '去年招聘人数',
						type: 'pie',
						radius: '50%',
						data: [{
								value: 120,
								name: '华为'
							},
							{
								value: 132,
								name: '腾讯'
							},
							{
								value: 101,
								name: '中兴'
							},
							{
								value: 134,
								name: '小米'
							},
							{
								value: 90,
								name: '比亚迪'
							},
							{
								value: 230,
								name: '蔚来'
							}
						]
					}]
				};
				// 使用刚指定的配置项和数据显示饼状图
				this.pieChart.setOption(pieOption);
			},
			initChart() {
				this.chart = echarts.init(this.$refs.chart);
				this.chart.setOption(this.getOptions());
			},
			getOptions() {
				const options = {
					title: {
						text: '七天内职位访问量变化'
					},
					tooltip: {
						trigger: 'axis'
					},
					legend: false,
					grid: {
						left: '3%',
						right: '4%',
						bottom: '3%',
						containLabel: true
					},
					toolbox: {
						feature: {
							saveAsImage: {}
						}
					},
					xAxis: {
						type: 'category',
						boundaryGap: false,
						data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
					},
					yAxis: {
						type: 'value'
					},
					toolbox: {
						feature: {
							// 移除 saveAsImage 功能，不显示下载按钮
						}
					},
					series: [{
						name: '职位A',
						type: 'line',
						data: [120, 132, 101, 134, 90, 230, 210]
					}, ]
				};
				return options;
			}
		},
		beforeDestroy() {
			// 在组件销毁之前，先销毁ECharts实例
			if (this.barChart) {
				this.barChart.dispose();
			}
			if (this.pieChart) {
				this.pieChart.dispose();
			}
			if (this.chart) {
				this.chart.dispose();
			}
		}
	};
</script>

<style scoped>

</style>