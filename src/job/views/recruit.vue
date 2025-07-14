<template>
	<div class="resume-container">
		<el-table :data="resumeList" style="width: 100%" :row-class-name="tableRowClassName">
			<el-table-column label="简历编号" type="index" width="180" align="center"></el-table-column>
			<!-- 			<el-table-column prop="id" label="简历编号" width="180" align="center"></el-table-column> -->
			<el-table-column prop="job.GZZWLBMC" label="投递职位" width="200" align="center"></el-table-column>
			<el-table-column prop="job.SJDWMC" label="投递企业" width="300" align="center"></el-table-column>
			<el-table-column label="投递时间" width="200" align="center">
				<template slot-scope="scope">
					{{ formatDate(scope.row.create_time) }}
				</template>
			</el-table-column>
			<el-table-column label="简历查看状态" width="120">
				<template slot-scope="scope">
					<el-tag :type="scope.row.status ? 'success' : 'danger'">
						{{ scope.row.status ? '企业已查看' : '企业未查看' }}
					</el-tag>
				</template>
			</el-table-column>
			<!-- <el-table-column label="操作" width="180">
				<template slot-scope="scope">
					<el-button type="text" @click="viewResume(scope.row)">查看简历</el-button>
						<el-button type="text" @click="deleteResume(scope.row.resumeId)">删除简历</el-button>
				</template>
			</el-table-column> -->
		</el-table>

		<!-- 分页控件 -->
		<!-- <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
			:page-sizes="[10, 20, 30, 40]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
			:total="total"></el-pagination> -->

	</div>
</template>

<script>
	import {
		getStudent,
		changeStatus
	} from '../api/recruit';
	export default {
		data() {
			return {
				// 投递简历数据
				resumeList: [],
				currentPage: 1,
				pageSize: 10,
				total: 0,
			};
		},
		created() {
			getStudent().then(response => {
				this.resumeList = response.data;
			})
		},
		methods: {
			tableRowClassName({
				row,
				rowIndex
			}) {
				if (row.viewed) {
					return 'viewed-row';
				}
				return '';
			},
			formatDate(date) {
				// 格式化日期
				return date;
			},
			viewResume(row) {

			},
			deleteResume(resumeId) {
				// 删除简历的逻辑
				console.log('删除简历', resumeId);
			},
			handleSizeChange(newSize) {
				this.pageSize = newSize;
			},
			handleCurrentChange(newPage) {
				this.currentPage = newPage;
			},
		},
	};
</script>

<style scoped>
	.resume-container {
		padding: 20px;
		/* background-color: #f0f2f5; */
	}

	.viewed-row {
		background-color: #f0f9eb;
	}
</style>