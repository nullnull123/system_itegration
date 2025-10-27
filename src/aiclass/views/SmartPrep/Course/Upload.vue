<template>
  <div class="course-create">
    <h1 class="page-title">课程管理系统</h1>

    <el-card class="create-card">
      <h2>创建新课程</h2>

      <el-form
        :model="courseForm"
        :rules="rules"
        ref="courseForm"
        label-width="120px"
        :disabled="loading"
      >
        <el-form-item prop="name">
          <label for="course-name" class="el-form-item__label">课程名称</label>
          <div class="el-form-item__content">
            <el-input
              id="course-name"
              v-model="courseForm.name"
              placeholder="请输入课程名称，例如：九年级数学"
              clearable
            ></el-input>
          </div>
        </el-form-item>

        <!-- 由于后端 CourseUploadSerializer 只需要 name，其他字段通常在后续步骤设置 -->
        <!-- 例如，在课程详情页或大纲创建页设置年级、学科等 -->

        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm"
            :loading="loading"
            :disabled="loading"
          >
            <span v-if="!loading">创建课程</span>
            <span v-else>正在创建中...</span>
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 添加处理进度提示 -->
      <div v-if="processing" class="processing-info">
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <div>
            <span>课程正在创建中，请耐心等待...</span>
          </div>
        </el-alert>
      </div>

    </el-card>

    <!-- 保存成功提示对话框 -->
    <el-dialog
      title="创建成功"
      :visible.sync="createSuccessDialog"
      width="30%"
    >
      <p>课程 "{{ createdCourseName }}" 已成功创建！</p>
      <div class="save-options">
        <router-link :to="{ name: 'CourseList' }"> <!-- 修正：使用 name -->
          <el-button type="primary">查看课程列表</el-button>
        </router-link>
        <el-button @click="resetFormAndClose">继续创建新课程</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'CourseCreatePage', // 重命名组件
  data() {
    return {
      courseForm: {
        name: '' // 后端 CourseUploadSerializer 只需要 name
      },
      createSuccessDialog: false,
      processing: false,
      createdCourseName: '' // 用于在成功对话框中显示课程名
    }
  },
  computed: {
    ...mapState('smartPrep', { // 如果模块名仍为 'smartPrep'
      loading: state => state.loading,
      error: state => state.error
    }),
    rules() {
      return {
        name: [
          { required: true, message: '请输入课程名称', trigger: 'blur' },
          { min: 2, message: '课程名称至少需要2个字符', trigger: 'blur' },
          { max: 100, message: '课程名称不能超过100个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    ...mapActions('smartPrep', ['createCourse']), // 如果模块名仍为 'smartPrep'

    async submitForm() {
      this.$refs.courseForm.validate(async valid => {
        if (valid) {
          this.processing = true;

          try {
            const courseData = {
              name: this.courseForm.name,
              // 后端 CourseUploadSerializer 只需要 name
              // 其他信息如年级、学科等通常在后续步骤（如编辑课程详情）中设置
            }

            console.log('提交课程数据:', courseData)

            // 显示加载提示
            const loading = this.$loading({
              lock: true,
              text: '正在创建课程...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            })

            // 调用创建课程的 action
            const response = await this.createCourse(courseData)
            console.log('课程创建成功:', response)

            // 获取并保存课程名用于提示
            this.createdCourseName = response.data?.name || this.courseForm.name

            this.createSuccessDialog = true; // 显示成功对话框

          } catch (error) {
            console.error('课程创建失败:', error)
            this.$message({
              type: 'error',
              message: error.message || '课程创建失败',
              duration: 3000
            })
          } finally {
            this.processing = false;
            // 确保无论成功还是失败都关闭加载提示
            if (this.$loading) {
              try { this.$loading().close(); } catch(e) { /* ignore */ }
            }
          }
        }
      })
    },

    resetForm() {
      this.$refs.courseForm.resetFields()
      this.courseForm.name = '';
      this.createdCourseName = '';
      this.createSuccessDialog = false;
    },

    resetFormAndClose() {
      this.resetForm()
      this.createSuccessDialog = false
    },
  },
  watch: {
    error(newVal) {
      if (newVal) {
        this.$message.error({
          message: newVal,
          duration: 3000
        })
      }
    }
  }
}
</script>

<style scoped>
.course-create { /* 重命名最外层类名 */
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  display: flex;
  align-items: center;
}

.page-title::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 24px;
  background-color: #409EFF;
  margin-right: 10px;
  border-radius: 2px;
}

.create-card { /* 重命名卡片类名 */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.content-hint {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

.save-options {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

/* 添加处理状态样式 */
.processing-info {
  margin-top: 20px;
}

.estimated-time {
  color: #606266;
  font-size: 13px;
  margin-left: 10px;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-create {
    padding: 10px;
  }

  .create-card {
    padding: 15px;
  }

  .save-options {
    flex-direction: column;
    gap: 10px;
  }

  .save-options button {
    width: 100%;
  }
}
</style>