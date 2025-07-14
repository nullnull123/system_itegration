<template>
	<div class="resume-container">
		<el-table :data="resumeList" style="width: 100%" :row-class-name="tableRowClassName">
			<el-table-column label="简历编号" type="index" width="100" align="center"></el-table-column>
			<el-table-column prop="student.REALNAME" label="学生姓名" width="100" align="center"></el-table-column>
			<el-table-column prop="student.MAJOR" label="专业" width="100" align="center"></el-table-column>
			<el-table-column prop="student.JTDZ" label="家庭地址" width="280" align="center"></el-table-column>
			<el-table-column prop="job.GZZWLBMC" label="投递岗位" width="100" align="center"></el-table-column>
			<el-table-column prop="student.phone" label="联系方式" width="220" align="center"></el-table-column>
			<el-table-column label="投递时间" width="180" align="center">
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
			<el-table-column label="操作" width="180">
				<template slot-scope="scope">
					<el-button type="text" @click="viewResume(scope.row)">查看简历</el-button>
					<!-- <el-button type="text" @click="deleteResume(scope.row.resumeId)">删除简历</el-button> -->
				</template>
			</el-table-column>
		</el-table>

		<!-- 分页控件 -->
		<!-- <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="currentPage"
			:page-sizes="[10, 20, 30, 40]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
			:total="total"></el-pagination> -->

		<!-- 学生简历对话框 -->
		<el-dialog title="学生简历" :visible.sync="dialogVisible" width="60%">
			<!-- 个人信息 -->
			<div id="personalInfo" class="section-container">
				<div class="title-container">
					<div class="title-indicator"></div>
					<h2 class="section-title">个人信息</h2>
				</div>
				<div class="personal-info-page">
					<div class="info-display">
						<el-row :gutter="20">
							<el-col :span="8">
								<i style="opacity: 50%">姓名:</i> {{ personalInfo.REALNAME }}
							</el-col>
							<el-col :span="8">
								<i style="opacity: 50%">性别:</i> {{ personalInfo.XBMC }}
							</el-col>
							<el-col :span="8">
								<i style="opacity: 50%">出生日期:</i> {{ personalInfo.BIRTHDAY }}
							</el-col>
							<el-col :span="8">
								<i style="opacity: 50%">专业方向:</i> {{ personalInfo.ZYFX }}
							</el-col>
							<el-col :span="8">
								<i style="opacity: 50%">专业:</i> {{ personalInfo.MAJOR }}
							</el-col>
							<el-col :span="8">
								<i style="opacity: 50%">学院:</i> {{ personalInfo.DEPARTMENT }}
							</el-col>
							<el-col :span="8">
								<i style="opacity: 50%">家庭地址:</i>{{ personalInfo.JTDZ }}
							</el-col>
							<el-col :span="8">
								<i style="opacity: 50%">手机号:</i>{{ personalInfo.phone }}
							</el-col>
						</el-row>
					</div>
				</div>
			</div>
			<!-- 个人优势 -->
			<div id="personalAdvantage" class="section-container">
				<div class="title-container">
					<div class="title-indicator"></div>
					<h2 class="section-title">个人优势</h2>
				</div>
				<div class="info-display">
					<ol>
						{{ personalAdvantage }}
					</ol>
				</div>
			</div>
			<!-- 校园经历 -->
			<div id="schoolExperience" class="section-container">
				<div class="title-container">
					<div class="title-indicator"></div>
					<h2 class="section-title">校园经历</h2>
				</div>
				<div class="info-display">
					<ol>
						{{ schoolExperience }}
					</ol>
				</div>
			</div>
			<!-- 掌握的技能 -->
			<div id="skills" class="section-container">
				<div class="title-container">
					<div class="title-indicator"></div>
					<h2 class="section-title">掌握技能</h2>
				</div>
				<div class="info-display">
					<ol>
						{{ skills }}
					</ol>
				</div>
			</div>
			<!-- 期望职位 -->
			<div id="expectedPosition" class="section-container">
				<div class="title-container">
					<div class="title-indicator"></div>
					<h2 class="section-title">期望职位</h2>
				</div>
				<div class="info-display">
					<p v-if="expectedPositions.length === 0">暂无信息</p>
					<p v-else>
						<span v-for="(position, index) in expectedPositions" :key="index">
							<i class="el-icon-star-on" style="margin-right: 5px;"></i> {{ position }}<span
								v-if="index < expectedPositions.length - 1"> | </span>
						</span>
					</p>
				</div>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button type="primary" @click="dialogVisible = false">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	import {
		getCompany,
		changeStatus
	} from '@/api/recruit';
	import {
		getResumeById,
		studentInfoById
	} from '@/api/student';
	export default {
		data() {
			return {
				// 投递简历数据
				resumeList: [],
				currentPage: 1,
				pageSize: 10,
				total: 0,
				dialogVisible: false,
				// 当前打开的学生简历和学生信息
				personalInfo: {},
				personalAdvantage: '',
				schoolExperience: '',
				expectedPositions: [],
				skills: ''
			};
		},
		created() {
			getCompany().then(response => {
				this.resumeList = response.data;
			})
		},
		methods: {
			handleClose(done) {
				this.$confirm('确认关闭？')
					.then(_ => {
						done();
					})
					.catch(_ => {});
			},
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
				// 修改简历查看状态
				changeStatus(row.id).then(response => {
					this.resumeList = response.data;
					getCompany().then(response => {
						// console.log(response);
						this.resumeList = response.data;
					})
				});
				// 打开简历对话框
				this.dialogVisible = true;
				// 发送请求获取简历详情
				const student_id = row.student.id;
				//获取当前登录的学生信息
				studentInfoById(student_id).then(response => {
					this.personalInfo = response.data;
				});
				//获取简历信息
				getResumeById(student_id).then(response => {
					this.personalAdvantage = response.data.personalAdvantage;
					this.schoolExperience = response.data.schoolExperience;
					this.skills = response.data.skills;
					this.expectedPositions = response.data.expectedPositions.split(",");
				});
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