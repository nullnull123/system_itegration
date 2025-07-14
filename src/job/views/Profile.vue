<template>
	<el-container style="height: 100vh;">
		<!-- 左侧部分 -->
		<!-- <el-aside width="200px" class="aside-container">
			<el-menu default-active="selectedSection">
				<el-menu-item index="1">个人信息</el-menu-item>
				<el-menu-item index="2">个人优势</el-menu-item>
				<el-menu-item index="3">校园经历</el-menu-item>
				<el-menu-item index="4">掌握技能</el-menu-item>
				<el-menu-item index="2">期望职位</el-menu-item>
			</el-menu>
		</el-aside> -->
		<!-- 中间部分 -->
		<el-main class="main-container">
			<div class="content">
				<!-- 个人基本信息模块 -->
				<div id="personalInfo" class="section-container" :class="{ 'is-hovered': isHovered.personalInfo }"
					@mouseenter="isHovered.personalInfo = true" @mouseleave="isHovered.personalInfo = false">
					<div class="title-container">
						<div class="title-indicator"></div>
						<h2 class="section-title">个人信息</h2>
						<el-button v-if="isHovered.personalInfo && !isEditing.personalInfo" type="text"
							icon="el-icon-edit" class="edit-button" @click="openEditMode('personalInfo')">编辑</el-button>
					</div>
					<div class="personal-info-page">
						<div class="info-display" v-if="!isEditing.personalInfo">
							<el-row :gutter="20">
								<el-col :span="8">
									<i style="opacity: 50%">姓名:</i> {{ personalInfo.REALNAME }}
								</el-col>
								<el-col :span="8">
									<i style="opacity: 50%">性别:</i> {{ personalInfo.XBMC }}
								</el-col>
								<!-- <el-col :span="8">
									<i style="opacity: 50%">学历:</i> {{ personalInfo.XLMC }}
								</el-col> -->
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
						<!-- 编辑个人信息 -->
						<el-form :model="editInfo.personalInfo" label-width="120px" class="edit-form"
							v-if="isEditing.personalInfo">
							<el-row>
								<el-col :span="12">
									<el-form-item label="姓名">
										<el-input v-model="editInfo.personalInfo.REALNAME"></el-input>
									</el-form-item>
									<el-form-item label="性别">
										<el-radio-group v-model="editInfo.personalInfo.XBMC">
											<el-radio :label="'男'">男</el-radio>
											<el-radio :label="'女'">女</el-radio>
										</el-radio-group>
									</el-form-item>
								</el-col>
								<el-col :span="12">
									<el-form-item label="出生年月日">
										<el-input v-model="editInfo.personalInfo.BIRTHDAY"></el-input>
										<!-- <el-date-picker v-model="personalInfo.BIRTHDAY" type="date" placeholder="选择日期"
											format="yyyy.MM.dd" value-format="yyyy.MM.dd" @change="updateDatePickerKey">
										</el-date-picker> -->
									</el-form-item>
								</el-col>
							</el-row>
							<el-row>
								<el-col :span="12">
									<el-form-item label="学院">
										<el-input v-model="editInfo.personalInfo.DEPARTMENT"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="12">
									<el-form-item label="专业">
										<el-input v-model="editInfo.personalInfo.MAJOR"></el-input>
									</el-form-item>
								</el-col>
								<el-col :span="12">
									<el-form-item label="专业方向">
										<el-input v-model="editInfo.personalInfo.ZYFX"></el-input>
									</el-form-item>
								</el-col>
							</el-row>
							<el-form-item label="家庭住址">
								<el-input v-model="editInfo.personalInfo.JTDZ"></el-input>
							</el-form-item>
							<el-form-item label="电话号码">
								<el-input v-model="editInfo.personalInfo.phone"></el-input>
							</el-form-item>
							<el-form-item class="form-buttons">
								<el-button @click="cancelEdit('personalInfo')">取消</el-button>
								<el-button type="primary" @click="submitInfo('personalInfo')">保存</el-button>
							</el-form-item>
						</el-form>
					</div>
				</div>
				<!-- 个人优势模块 -->
				<div id="personalAdvantage" class="section-container"
					:class="{ 'is-hovered': isHovered.personalAdvantage }"
					@mouseenter="isHovered.personalAdvantage = true" @mouseleave="isHovered.personalAdvantage = false">
					<div class="title-container">
						<div class="title-indicator"></div>
						<h2 class="section-title">个人优势</h2>
						<el-button v-if="isHovered.personalAdvantage && !isEditing.personalAdvantage" type="text"
							icon="el-icon-edit" class="edit-button"
							@click="openEditMode('personalAdvantage')">编辑</el-button>
					</div>
					<div v-if="!isEditing.personalAdvantage" class="info-display">
						<ol class="auto-wrap">
							{{ personalAdvantage }}
						</ol>
					</div>
					<el-form v-if="isEditing.personalAdvantage" label-width="120px" class="edit-form">
						<el-form-item label="编辑个人优势">
							<el-input type="textarea" v-model="editInfo.personalAdvantage" :rows="10"
								placeholder="请输入个人优势" style=" width: 800px; right: 200px" />
							<div class="word-count" style=" left: 350px">当前字数：{{ editInfo.personalAdvantage.length }} /
								1000</div>
						</el-form-item>
						<el-form-item class="form-buttons">
							<el-button @click="cancelEdit('personalAdvantage')">取消</el-button>
							<el-button type="primary" @click="submitInfo('personalAdvantage')">保存</el-button>
						</el-form-item>
					</el-form>
				</div>
				<!-- 校园经历模块 -->
				<div id="schoolExperience" class="section-container"
					:class="{ 'is-hovered': isHovered.schoolExperience }"
					@mouseenter="isHovered.schoolExperience = true" @mouseleave="isHovered.schoolExperience = false">
					<div class="title-container">
						<div class="title-indicator"></div>
						<h2 class="section-title">校园经历</h2>
						<el-button v-if="isHovered.schoolExperience && !isEditing.schoolExperience" type="text"
							icon="el-icon-edit" class="edit-button"
							@click="openEditMode('schoolExperience')">编辑</el-button>
					</div>
					<div v-if="!isEditing.schoolExperience" class="info-display">
						<ol class="auto-wrap">
							{{ schoolExperience }}
						</ol>
					</div>
					<el-form v-if="isEditing.schoolExperience" label-width="120px" class="edit-form">
						<el-form-item label="编辑校园经历">
							<el-input type="textarea" v-model="editInfo.schoolExperience" :rows="10"
								placeholder="请输入校园经历" style=" width: 800px; right: 200px" />
						</el-form-item>
						<el-form-item class="form-buttons">
							<el-button @click="cancelEdit('schoolExperience')">取消</el-button>
							<el-button type="primary" @click="submitInfo('schoolExperience')">保存</el-button>
						</el-form-item>
					</el-form>
				</div>
				<!-- 掌握技能模块 -->
				<div id="skills" class="section-container" :class="{ 'is-hovered': isHovered.skills }"
					@mouseenter="isHovered.skills = true" @mouseleave="isHovered.skills = false">
					<div class="title-container">
						<div class="title-indicator"></div>
						<h2 class="section-title">掌握技能</h2>
						<el-button v-if="isHovered.skills && !isEditing.skills" type="text" icon="el-icon-edit"
							class="edit-button" @click="openEditMode('skills')">编辑</el-button>
					</div>
					<div v-if="!isEditing.skills" class="info-display">
						<ol class="auto-wrap">
							{{ skills }}
						</ol>
					</div>
					<el-form v-if="isEditing.skills" label-width="120px" class="edit-form">
						<el-form-item label="编辑掌握技能">
							<el-input type="textarea" v-model="editInfo.skills" :rows="10" placeholder="请输入掌握的技能"
								style=" width: 800px; right: 200px" />
						</el-form-item>
						<el-form-item class="form-buttons">
							<el-button @click="cancelEdit('skills')">取消</el-button>
							<el-button type="primary" @click="submitInfo('skills')">保存</el-button>
						</el-form-item>
					</el-form>
				</div>
				<!-- 期望职位模块 -->
				<div id="expectedPosition" class="section-container"
					:class="{ 'is-hovered': isHovered.expectedPosition }"
					@mouseenter="isHovered.expectedPosition = true" @mouseleave="isHovered.expectedPosition = false">
					<div class="title-container">
						<div class="title-indicator"></div>
						<h2 class="section-title">期望职位</h2>
						<el-button v-if="isHovered.expectedPosition" type="text" icon="el-icon-plus" class="add-button"
							@click="openAddExpectedPositionDialog">编辑</el-button>
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
				<!-- 新增期望职位对话框 -->
				<el-dialog :visible.sync="isAddingExpectedPosition" title="添加期望职位" width="800px">
					<div class="dialog-content">
						<!-- 行业分类 -->
						<div class="industry-list">
							<h3>行业分类</h3>
							<div class="industry-items">
								<div v-for="(industry, index) in industries" :key="index" class="industry-item"
									:class="{ 'selected': defaultIndustry === industry }"
									@click="selectIndustry(industry)">
									{{ industry }}
								</div>
							</div>
						</div>
						<!-- 职位列表 -->
						<div class="job-list">
							<h3>岗位列表</h3>
							<div class="job-items">
								<template v-for="rowIndex in Math.ceil(allJobs[defaultIndustry].length / 2)">
									<div class="job-row" :key="rowIndex">
										<div v-for="(job, index) in allJobs[defaultIndustry].slice((rowIndex - 1) * 2, rowIndex * 2)"
											:key="index" class="job-item"
											:class="{ 'selected': expectedPositions.includes(job.label) }"
											@click="toggleJobSelection(job.label)">
											<h4>{{ job.label }}</h4>
											<p>{{ job.description }}</p>
										</div>
									</div>
								</template>
							</div>
						</div>
						<!-- 已选部分 -->
						<div class="already-choose-list">
							<h3>已选</h3>
							<div class="already-choose-items">
								<el-tag v-for="(expectedPosition, index) in expectedPositions" :key="index" closable
									@close="handleCloseTag(index)">
									{{ expectedPosition }}
								</el-tag>
							</div>
						</div>
					</div>
					<span slot="footer" class="dialog-footer">
						<el-button @click="isAddingExpectedPosition = false">取消</el-button>
						<el-button type="primary" @click="saveExpectedPosition">确认</el-button>
					</span>
				</el-dialog>
				<!-- 在校经历模块 -->
				<!-- <div id="workExperience" class="section-container">
					<div class="title-container">
						<el-descriptions class="margin-top" title="在校经历" :column="3" :size="size" border>
							<el-descriptions-item>
								<template slot="label">
									四级成绩
								</template>
								462
							</el-descriptions-item>
							<el-descriptions-item>
								<template slot="label">
									六级成绩
								</template>
								525
							</el-descriptions-item>
							<el-descriptions-item>
								<template slot="label">
									发表过的学术论文
								</template>
								《利用Matlab改进电波传播课程教学的讨论》
							</el-descriptions-item>
							<el-descriptions-item>
								<template slot="label">
									技能认证
								</template>
							</el-descriptions-item>
						</el-descriptions>
					</div>
				</div> -->
			</div>
			<!-- 保存按钮 -->
			<el-button type="primary" style="margin-left: 30px;" @click="submit()">保存简历</el-button>
		</el-main>
	</el-container>
</template>

<script>
	import {
		getStudentInfo
	} from '../api/user';
	import {
		getResume,
		updateResume,
		updateStudentInfo
	} from '../api/student';
	export default {
		data() {
			return {
				size: "medium",
				selectedSection: null,
				isEditing: {
					personalInfo: false,
					personalAdvantage: false,
					expectedPosition: false,
					workExperience: false,
					schoolExperience: false,
					projectExperience: false,
					educationExperience: false,
					skills: false
				},
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
				personalInfo: {},
				personalAdvantage: '',
				schoolExperience: '',
				skills: '',
				//期望职位
				expectedPositions: [],
				isAddingExpectedPosition: false,
				selectedJobs: [],
				defaultIndustry: '互联网', // 默认选中的行业
				industries: ['互联网', '运营', '硬件', 'IC方向', '通信', '人工智能', '电子电气', ], // 扩充行业分类
				allJobs: {
					'互联网': [{
							label: 'Java程序员',
							description: '负责后端开发'
						},
						{
							label: '前端开发',
							description: '负责用户界面开发'
						},
						{
							label: '产品经理',
							description: '负责产品规划和设计'
						},
						{
							label: '测试工程师',
							description: '负责软件测试'
						},
						{
							label: '运维工程师',
							description: '负责系统运维'
						},
					],
					'运营': [{
							label: '运营经理',
							description: '负责日常运营管理'
						},
						{
							label: '数据分析师',
							description: '负责数据分析'
						},
					],
					'硬件': [{
							label: '硬件工程师',
							description: '负责硬件电路设计与开发'
						},
						{
							label: 'FPGA工程师',
							description: '负责FPGA开发与优化'
						},
						{
							label: '嵌入式工程师',
							description: '负责嵌入式系统开发与调试'
						},
						{
							label: '芯片设计工程师',
							description: '负责集成电路设计与验证'
						},
						{
							label: 'PCB工程师',
							description: '负责印制电路板设计与优化'
						},
					],
					'IC方向': [{
							label: '模拟电路工程师',
							description: '负责模拟电路设计与优化'
						},
						{
							label: '数字电路工程师',
							description: '负责数字电路设计与验证'
						},
						{
							label: '半导体工艺工程师',
							description: '负责半导体制造工艺优化'
						},
						{
							label: '芯片验证工程师',
							description: '负责芯片功能与性能验证'
						},
						{
							label: 'IC封装工程师',
							description: '负责芯片封装设计与测试'
						},
					],
					'通信': [{
							label: '通信工程师',
							description: '负责通信系统设计与优化'
						},
						{
							label: '无线通信工程师',
							description: '负责无线通信技术研发'
						},
						{
							label: '光通信工程师',
							description: '负责光通信系统开发与维护'
						},
						{
							label: '网络工程师',
							description: '负责网络架构设计与运维'
						},
						{
							label: '信号处理工程师',
							description: '负责信号处理算法开发与优化'
						},
					],
					'人工智能': [{
							label: '机器学习工程师',
							description: '负责机器学习算法开发与应用'
						},
						{
							label: '深度学习工程师',
							description: '负责深度学习模型开发与优化'
						},
						{
							label: '自然语言处理工程师',
							description: '负责自然语言处理技术研发'
						},
						{
							label: '计算机视觉工程师',
							description: '负责图像识别与处理技术研发'
						},
						{
							label: '数据科学家',
							description: '负责大数据分析与挖掘'
						},
					],
					'电子电气': [{
							label: '电气工程师',
							description: '负责电气系统设计与维护'
						},
						{
							label: '自动化工程师',
							description: '负责自动化控制系统开发'
						},
						{
							label: '电子工程师',
							description: '负责电子设备研发与调试'
						},
						{
							label: '测试工程师（硬件）',
							description: '负责硬件设备测试与验证'
						},
						{
							label: '电源工程师',
							description: '负责电源系统设计与优化'
						},
					],
				},
				editInfo: {
					personalInfo: {},
					personalAdvantage: '',
					schoolExperience: '',
					skills: ''
				},
			};
		},
		methods: {
			//关闭标签
			handleCloseTag(index) {
				//根据索引移除职位
				this.expectedPositions.splice(index, 1);
			},
			submit() {
				//发送请求保存学生简历
				let data = {};
				data.personalAdvantage = this.personalAdvantage;
				data.schoolExperience = this.schoolExperience;
				data.skills = this.skills;
				data.expectedPositions = this.expectedPositions.join(',');
				console.log("修改后的简历信息", data);
				updateResume(data).then(response => {
					this.$message({
						message: '保存个人简历成功',
						type: 'success'
					});
				});
			},
			updateDatePickerKey() {
				this.$forceUpdate();
			},
			scrollTo(sectionId) {
				const element = document.getElementById(sectionId);
				if (element) {
					element.scrollIntoView({
						behavior: 'smooth'
					});
				}
			},
			openEditMode(section) {
				this.isEditing[section] = true;
				if (section === 'personalInfo') {
					this.editInfo.personalInfo = this.personalInfo;
				}
				if (section === 'personalAdvantage') {
					this.editInfo.personalAdvantage = this.personalAdvantage;
				} else if (section === 'schoolExperience') {
					this.editInfo.schoolExperience = this.schoolExperience;
				} else if (section === 'skills') {
					this.editInfo.skills = this.skills;
				}
			},
			submitInfo(section) {
				if (section === 'personalAdvantage') {
					this.personalAdvantage = this.editInfo.personalAdvantage;
				} else if (section === 'schoolExperience') {
					this.schoolExperience = this.editInfo.schoolExperience;
				} else if (section === 'skills') {
					this.skills = this.editInfo.skills;
				} else if (section === 'personalInfo') {
					updateStudentInfo(this.editInfo.personalInfo).then(response => {
						this.$message({
							message: '修改个人信息成功',
							type: 'success'
						});
					});
				}
				this.isEditing[section] = false;
			},
			cancelEdit(section) {
				this.isEditing[section] = false;
			},
			openAddExpectedPositionDialog() {
				this.isAddingExpectedPosition = true;
				this.selectedJobs = []; // 清空已选岗位
			},
			selectIndustry(industry) {
				this.defaultIndustry = industry; // 选择行业
			},
			toggleJobSelection(jobLabel) {
				if (this.selectedJobs.includes(jobLabel)) {
					this.selectedJobs = this.selectedJobs.filter(job => job !== jobLabel);
				} else {
					this.selectedJobs.push(jobLabel);
				}
				//更新el-tag
				this.selectedJobs.forEach(job => {
					const index = this.expectedPositions.indexOf(job);
					if (index == -1) {
						// 如果元素不存在于 expectedPositions 中，则添加该元素
						this.expectedPositions.push(job);
					}
				});
			},
			saveExpectedPosition() {
				// this.selectedJobs.forEach(job => {
				// 	const index = this.expectedPositions.indexOf(job);
				// 	if (index !== -1) {
				// 		// 如果元素存在于 expectedPositions 中，则删除该元素
				// 		this.expectedPositions.splice(index, 1);
				// 	} else {
				// 		// 如果元素不存在于 expectedPositions 中，则添加该元素
				// 		this.expectedPositions.push(job);
				// 	}
				// });
				this.isAddingExpectedPosition = false;
			},
		},
		created() {
			//获取当前登录的学生信息
			getStudentInfo().then(response => {
				console.log("当前登录的学生信息", response);
				this.personalInfo = response.data;
			});
			//获取简历信息
			getResume().then(response => {
				console.log("获取的简历信息", response);
				this.personalAdvantage = response.data.personalAdvantage;
				this.schoolExperience = response.data.schoolExperience;
				this.skills = response.data.skills;
				this.expectedPositions = response.data.expectedPositions.split(",");
			});
		}
	};
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