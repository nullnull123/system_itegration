<template>
	<div>
		<!-- 功能栏 -->
		<!-- <el-row style="width: 100%;margin-top: 10px;margin-bottom: 20px;">
			<el-col :span="10">
				<el-input placeholder="请输入搜索关键词" v-model="key" clearable></el-input>
			</el-col>
			<el-col :span="4">
				<el-button type="primary" @click="search" style="margin-left: 5px;">
					搜索
				</el-button>
				<el-button type="primary" @click="handleAdd()">
					新增职位
				</el-button>
			</el-col>
		</el-row> -->
		<!-- 职位列表 -->
		<el-table :data="tableData" style="width: 100%;margin-top: 10px;">
			<el-table-column label="" width="25">
				<template #default="scope">
					<i class="el-icon-user"></i>
				</template>
			</el-table-column>
			<el-table-column label="职位名" prop="GZZWLBMC" width="180">
			</el-table-column>
			<el-table-column label="" width="20">
				<template #default="scope">
					<i class="el-icon-office-building"></i>
				</template>
			</el-table-column>
			<el-table-column label="公司名" prop="SJDWMC" width="240">
			</el-table-column>
			<el-table-column label="工作地点" prop="DWSZDDM" width="180">
			</el-table-column>
			<!-- <el-table-column label="企业类型" prop="DWXZMC" width="180">
			</el-table-column>
			<el-table-column label="所属领域" prop="DWHYMC" width="180">
			</el-table-column> -->
			<!-- <el-table-column label="创建时间" prop="create_time" width="180">
			</el-table-column> -->
			<!-- <el-table-column label="专业要求" prop="major" width="180">
			</el-table-column>
			<el-table-column label="薪资" prop="salary" width="180">
			</el-table-column>
			<el-table-column label="学历要求" prop="degree" width="180">
			</el-table-column>
			<el-table-column label="工作性质" prop="workNature" width="180">
			</el-table-column>
			<el-table-column label="职位描述" prop="desc" width="180">
			</el-table-column> -->
			<el-table-column label="操作">
				<template #default="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">
						详情
					</el-button>
					<el-button size="small" type="primary" @click="recommend(scope.row.id)">
						精准推荐
					</el-button>
					<!-- 	<el-button size="small" type="danger" @click="handleDelete(scope.$index, scope.row)">
						删除
					</el-button> -->
				</template>
			</el-table-column>
		</el-table>
		<!-- 右侧抽屉界面 -->
		<el-drawer title="精准推荐" :visible.sync="drawer" direction="rtl" size="50%" :with-header="false">
			<div style="margin-top: 20px;" shadow="always">
				<el-card v-for="data in students" style="margin-bottom:20px;" shadow="hover">
					<el-row>
						<el-col :span="20">
							<el-descriptions :title="data.REALNAME">
								<el-descriptions-item label="性别">{{data.XBMC}}</el-descriptions-item>
								<el-descriptions-item label="出生日期">{{data.BIRTHDAY}}</el-descriptions-item>
								<el-descriptions-item label="专业名称">{{data.MAJOR}}</el-descriptions-item>
								<el-descriptions-item label="学院">{{data.DEPARTMENT}}</el-descriptions-item>
								<el-descriptions-item label="专业方向">{{data.ZYFX}}</el-descriptions-item>
								<el-descriptions-item label="学习形式">{{data.XXXSMC}}</el-descriptions-item>
								<el-descriptions-item label="工作经验">{{data.GZZWLBMC}}</el-descriptions-item>
								<el-descriptions-item label="家庭住址">{{data.JTDZ}}</el-descriptions-item>
							</el-descriptions>
						</el-col>
						<el-col :span="4">
							<el-button @click="studentInfo(data)" type="primary"
								style="margin-top: 30px;">详细信息</el-button>
						</el-col>
					</el-row>
				</el-card>
			</div>
		</el-drawer>
		<!-- 分页 -->
		<!-- <el-divider></el-divider>
		<el-pagination background layout="prev, pager, next, jumper" :total="total" :page-size="pageSize"
			@current-change="handleCurrentChange">
		</el-pagination> -->
		<!-- 新增和编辑对话框 -->
		<el-dialog :visible.sync="dialogVisible" :close-on-click-modal="false" :title="type" width="450px">
			<el-form :model="form">
				<el-form-item label="职位名">
					<el-input v-model="form.GZZWLBMC" />
				</el-form-item>
				<el-form-item label="公司名">
					<el-input v-model="form.SJDWMC" />
				</el-form-item>
				<el-form-item label="工作地点">
					<el-input v-model="form.DWSZDDM" />
				</el-form-item>
				<el-form-item label="需求专业">
					<el-input type="textarea" :rows="6" v-model="form.major" />
				</el-form-item>
				<el-form-item label="职位描述">
					<el-input type="textarea" :rows="6" v-model="form.desc" />
				</el-form-item>
			</el-form>
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="dialogVisible = false">取消</el-button>
					<el-button type="primary" @click="dialogVisible = false">
						确认
					</el-button>
					<!-- <el-button type="primary" @click="submit">
						确认
					</el-button> -->
				</div>
			</template>
		</el-dialog>
		<!-- 学术简历对话框-->
		<el-dialog title="学生详情" :visible.sync="studentDialogVisible">
			<!-- 个人优势模块 -->
			<div id="personalAdvantage" class="section-container" :class="{ 'is-hovered': isHovered.personalAdvantage }"
				@mouseenter="isHovered.personalAdvantage = true" @mouseleave="isHovered.personalAdvantage = false">
				<div class="title-container">
					<div class="title-indicator"></div>
					<h2 class="section-title">个人优势</h2>
				</div>
				<div class="info-display">
					<ol class="auto-wrap">
						{{ personalAdvantage }}
					</ol>
				</div>
			</div>
			<!-- 校园经历模块 -->
			<div id="schoolExperience" class="section-container" :class="{ 'is-hovered': isHovered.schoolExperience }"
				@mouseenter="isHovered.schoolExperience = true" @mouseleave="isHovered.schoolExperience = false">
				<div class="title-container">
					<div class="title-indicator"></div>
					<h2 class="section-title">校园经历</h2>
				</div>
				<div class="info-display">
					<ol class="auto-wrap">
						{{ schoolExperience }}
					</ol>
				</div>
			</div>
			<!-- 掌握技能模块 -->
			<div id="skills" class="section-container" :class="{ 'is-hovered': isHovered.skills }"
				@mouseenter="isHovered.skills = true" @mouseleave="isHovered.skills = false">
				<div class="title-container">
					<div class="title-indicator"></div>
					<h2 class="section-title">掌握技能</h2>
				</div>
				<div class="info-display">
					<ol class="auto-wrap">
						{{ skills }}
					</ol>
				</div>
			</div>
			<!-- 期望职位模块 -->
			<div id="expectedPosition" class="section-container" :class="{ 'is-hovered': isHovered.expectedPosition }"
				@mouseenter="isHovered.expectedPosition = true" @mouseleave="isHovered.expectedPosition = false">
				<div class="title-container">
					<div class="title-indicator"></div>
					<h2 class="section-title">期望职位</h2>
				</div>
				<div class="info-display">
					<p v-if="expectedPositions.length === 0">暂无信息</p>
					<p v-else>
						<span class="auto-wrap" v-for="(position, index) in expectedPositions" :key="index">
							<i class="el-icon-star-on" style="margin-right: 5px;"></i> {{ position }}<span
								v-if="index < expectedPositions.length - 1"> | </span>
						</span>
					</p>
				</div>
			</div>
			<span slot="footer" class="dialog-footer">
				<!-- <el-button @click="studentDialogVisible = false">取 消</el-button> -->
				<el-button type="primary" @click="studentDialogVisible = false">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	import {
		jobList,
		jobSearch,
		jobAdd,
		jobDelete,
		myJob,  //
		jobUpdate
	} from '../../api/job.js';
	import {
		studentRecommend,
		getResumeById
	} from '../../api/student.js'
	export default {
		data() {
			return {
				//表格数据
				tableData: [],
				//新增和编辑数据
				form: {},
				//新增or编辑
				type: "新增",
				//控制对话框显示与否
				dialogVisible: false,
				//搜索关键词
				key: "",
				//推荐的学生信息
				students: [],
				//控制抽屉是否显示
				drawer: false,
				//是否加载中
				loading: true,
				//数据总个数
				total: 1000,
				//一页有几条数据
				pageSize: 5,
				//学生详情对话框
				studentDialogVisible: false,
				//简历信息
				personalAdvantage: '',
				schoolExperience: '',
				skills: '',
				expectedPositions: [],
				//控制是否显示
				isHovered: {
					personalInfo: false,
					personalAdvantage: false,
					expectedPosition: false,
					workExperience: false,
					schoolExperience: false,
					projectExperience: false,
					educationExperience: false,
					skills: false
				},
			}
		},
		created() {
			//判断是否登录

			//已经登录
			this.getList();
		},
		methods: {
			//重新请求分页数据
			handleCurrentChange(val) {
				jobList(val).then(response => {
					this.tableData = response.data.results;
					this.total = response.data.count;
					this.pageSize = 5;
				})
			},
			//获取职位列表
			getList() {
				myJob().then(response => {
					console.log(response);
					this.tableData = response.data;
				})
			},
			//点击编辑按钮
			handleEdit(index, row) {
				this.form = row;
				this.type = "职位详情";
				// this.type = "编辑";
				this.dialogVisible = true;
			},
			//点击新增按钮
			handleAdd() {
				this.form = {};
				this.type = "新增";
				this.dialogVisible = true;
			},
			//点击删除按钮
			handleDelete(index, row) {
				this.$confirm("您确定要删除该职位吗？", "确认操作", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "warning"
					})
					.then(() => {
						jobDelete(row.id).then(response => {
							//弹窗提示
							this.$message({
								message: '删除职位成功',
								type: 'success'
							});
							this.getList();
						})
					})
					.catch(() => {

					});
			},
			//确认新增或编辑
			submit() {
				this.dialogVisible = false;
				if (this.type == "新增") {
					//发送新增请求
					jobAdd(this.form).then(response => {
						//弹窗提示
						this.$message({
							message: '新增职位成功',
							type: 'success'
						});
						this.getList();
					})
				} else {
					//发送编辑请求
					jobUpdate(this.form).then(response => {
						//弹窗提示
						this.$message({
							message: '编辑职位成功',
							type: 'success'
						});
						this.getList();
					})
				}
			},
			//搜索职位
			search() {
				if (this.key == "") {
					this.getList();
					return;
				}
				jobSearch(this.key).then(response => {
					// console.log(response.data);
					this.tableData = response.data;
					this.total = response.data.length;
					this.pageSize = 10;
				})
			},
			// 对每个职位进行精准推荐
			recommend(id) {
				studentRecommend(id).then(response => {
					this.students = response.data;
					this.drawer = true;
				})
			},
			// 查看学生的详细信息
			studentInfo(student) {
				//获取简历信息
				getResumeById(student.id).then(response => {
					this.personalAdvantage = response.data.personalAdvantage;
					this.schoolExperience = response.data.schoolExperience;
					this.skills = response.data.skills;

					if (response.data.expectedPositions != null) {
						this.expectedPositions = response.data.expectedPositions.split(",");
					}

					//显示学生详情对话框
					this.studentDialogVisible = true;
				});
			},
		}
	}
</script>

<style lang="less" scoped>
	/* 侧边栏容器样式 */
	.aside-container {
		border: 1px solid #ebeef5;
		border-radius: 10px;
		background-color: #ffffff;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	/* 主内容容器样式 */
	.main-container {
		border: 1px solid #ebeef5;
		/* 边框颜色 */
		border-radius: 10px;
		/* 边框圆角 */
		padding: 20px;
		background-color: #ffffff;
		box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
	}

	/* 内容区域样式 */
	.content {
		padding: 20px;
	}

	/* 每个板块的容器样式 */
	.section-container {
		margin-bottom: 20px;
		padding: 10px;
		border: 1px solid #dcdfe6;
		/* 确保边框样式一致 */
		border-radius: 4px;
		transition: background-color 0.3s;
		/* 只添加背景颜色变化的过渡 */
		position: relative;
		box-sizing: border-box;
		/* 确保边框和内边距不影响元素尺寸 */
	}

	/* 最后一个板块去除底部外边距 */
	.section-container:last-child {
		margin-bottom: 0;
	}

	/* 鼠标悬停时的背景颜色 */
	.section-container:hover {
		background-color: #f0f0f0;
		cursor: pointer;
	}

	/* 标题容器样式 */
	.title-container {
		display: flex;
		align-items: center;
		/* 垂直居中 */
	}

	/* 标题前指示器样式 */
	.title-indicator {
		width: 5px;
		height: 30px;
		background-color: #00bcd4;
		/* 青色长方形块 */
		margin-right: 10px;
	}

	/* 板块标题样式 */
	.section-title {
		margin: 0;
		font-size: 1.25em;
		/* 标题字体大小 */
		font-weight: bold;
		/* 标题字体加粗 */
	}

	/* 信息显示区域样式 */
	.info-display {
		display: flex;
		flex-wrap: wrap;
		white-space: pre-wrap;
	}

	/* 信息列样式 */
	.info-display .el-col {
		display: flex;
		align-items: center;
		margin-bottom: 10px;
		/* 增加子元素的底部外边距 */
	}

	/* 编辑表单样式 */
	.edit-form {
		max-width: 600px;
		margin: 20px auto;
	}

	/* 编辑按钮样式 */
	.edit-button {
		display: none;
		position: absolute;
		right: 10px;
		top: 10px;
		cursor: pointer;
		color: #00a6a7;
	}

	/* 添加按钮样式 */
	.add-button {
		display: none;
		position: absolute;
		right: 10px;
		top: 10px;
		cursor: pointer;
		color: #00a6a7;
	}

	/* 鼠标悬停时显示编辑按钮 */
	.is-hovered .edit-button {
		display: inline-block;
	}

	/* 鼠标悬停时显示添加按钮 */
	.is-hovered .add-button {
		display: inline-block;
	}

	/* 表单按钮区域样式 */
	.form-buttons {
		text-align: right;
		margin-top: 20px;
	}

	/* 图标与文本的间距 */
	.info-display .el-icon {
		margin-right: 20px;
	}

	.word-count {
		position: absolute;
		right: 10px;
		bottom: 10px;
		font-size: 0.8em;
		color: #909399;
	}

	.dialog-content {
		display: flex;
	}

	/* 已选部分样式 */
	.already-choose-list {
		margin-left: 50px;
		// border-left: 1px solid #dcdfe6;
	}

	.already-choose-items {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.already-choose-item {
		padding: 5px 10px;
		border: 1px solid #dcdfe6;
		border-radius: 4px;
		cursor: pointer;
		transition: border-color 0.3s, background-color 0.3s;
	}

	/* 行业分类样式 */
	.industry-list {
		flex: 1;
		// border-right: 1px solid #dcdfe6;
		padding-right: 20px;
	}

	.industry-items {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.industry-item {
		padding: 5px 10px;
		border: 1px solid #dcdfe6;
		border-radius: 4px;
		cursor: pointer;
		transition: border-color 0.3s, background-color 0.3s;
	}

	.industry-item:hover {
		border-color: #409eff;
	}

	.industry-item.selected {
		border-color: #409eff;
		background-color: #ecf5ff;
	}

	/* 岗位列表样式 */
	.job-list {
		flex: 4;
		padding-left: 5px;
		max-height: 500px;
		border-left: 1px solid #dcdfe6;
		// border-right: 1px solid #dcdfe6;
		/* 限制最大高度 */
	}

	.job-items {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		max-width: 500px;
	}

	.job-row {
		display: flex;
		justify-content: flex-start;
		gap: 10px;
		width: 100%;
		/* 确保每行都是完整的宽度 */
	}

	.job-item {
		flex: 1 0 calc(50% - 10px);
		/* 调整宽度，留出间隙 */
		border: 1px solid #dcdfe6;
		border-radius: 4px;
		padding: 10px;
		cursor: pointer;
		transition: border-color 0.3s;
	}

	.job-item:hover {
		border-color: #409eff;
	}

	.job-item.selected {
		border-color: #409eff;
		background-color: #ecf5ff;
	}

	.job-item h4 {
		margin-top: 0;
		margin-bottom: 5px;
	}

	.job-item p {
		margin: 0;
	}

	.auto-wrap {
		word-wrap: break-word;
		/* 允许长单词或 URL 断行到下一行 */
		word-break: break-all;
		/* 强制单词在超出容器宽度时换行 */
		white-space: normal;
		/* 默认的空白处理，允许换行 */
	}
</style>