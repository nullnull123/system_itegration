<template>
  <div class="note-upload-container">
    <!-- 只有在有课程时才渲染表单 -->
    <template v-if="hasCoursesLoaded && courses.length > 0">
      <div class="header-section">
        <h1 class="page-title">上传笔记</h1>
      </div>

      <el-card class="upload-card">
        <el-form
          :model="noteForm"
          :rules="rules"
          ref="noteFormRef"
          label-width="120px"
          v-loading="loading"
        >
          <el-form-item label="笔记标题" prop="title">
            <el-input v-model="noteForm.title" placeholder="请输入笔记标题"></el-input>
          </el-form-item>

          <el-form-item label="学科" prop="subject">
            <el-select v-model="noteForm.subject" placeholder="请选择学科" style="width: 100%">
              <el-option
                v-for="subject in subjects"
                :key="subject.value"
                :label="subject.label"
                :value="subject.value">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="年级" prop="grade">
            <el-input v-model="noteForm.grade" placeholder="例如：九年级"></el-input>
          </el-form-item>

          <!-- 所属课程选择 -->
          <el-form-item label="所属课程" prop="course_display_id">
            <el-select
              v-model="noteForm.course_display_id"
              placeholder="请选择课程（可选）"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="course in courses"
                :key="course.display_id"
                :label="course.name"
                :value="course.display_id">
                <span>{{ course.name }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">ID: {{ course.display_id }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="笔记内容" prop="original_content">
            <el-input
              type="textarea"
              v-model="noteForm.original_content"
              :rows="15"
              placeholder="请输入笔记内容"
            ></el-input>
          </el-form-item>

          <el-form-item>
            <el-checkbox v-model="noteForm.autoComplete">
              笔记上传后立即进行AI补全（约需1-2分钟）
            </el-checkbox>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="submitForm"
              :loading="loading"
              :disabled="loading"
              size="large"
            >
              <span v-if="!loading">{{ noteForm.autoComplete ? '上传并补全' : '仅上传' }}</span>
              <span v-else>处理中...</span>
            </el-button>
            <el-button @click="resetForm" size="large">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 上传成功提示对话框 -->
      <el-dialog
        title="上传成功"
        :visible.sync="uploadSuccessDialog"
        width="30%"
      >
        <p>
          笔记 "{{ uploadedNoteTitle }}" 已成功{{ noteForm.autoComplete ? '上传并补全' : '上传' }}！
        </p>
        <div class="upload-options">
          <router-link :to="{ name: 'NoteList' }">
            <el-button type="primary">查看笔记列表</el-button>
          </router-link>
          <el-button @click="resetFormAndClose">继续上传新笔记</el-button>
        </div>
      </el-dialog>
    </template>

    <!-- 加载中或无课程时不显示内容（跳转已在 created 中处理） -->
    <el-card v-else-if="!hasCoursesLoaded" class="loading-card">
      <div class="loading-content">
        <i class="el-icon-loading" style="font-size: 24px;"></i>
        <p>正在检查课程...</p>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { AC_URL } from '@/api/request'

export default {
  name: 'NoteUploadPage',
  data() {
    return {
      noteForm: {
        title: '',
        subject: '',
        grade: '',
        course_display_id: null,
        original_content: '',
        autoComplete: false,
      },
      rules: {
        title: [{ required: true, message: '请输入笔记标题', trigger: 'blur' }],
        subject: [{ required: true, message: '请选择学科', trigger: 'change' }],
        original_content: [{ required: true, message: '请输入笔记内容', trigger: 'blur' }]
      },
      courses: [],
      uploadSuccessDialog: false,
      uploadedNoteTitle: '',
      hasCoursesLoaded: false // 用于控制是否已完成课程加载检查
    }
  },
  computed: {
    ...mapState('noteCompletion', ['loading', 'error']),
    subjects() {
      return [
        { value: 'math', label: '数学' },
        { value: 'chinese', label: '语文' },
        { value: 'english', label: '英语' },
        { value: 'physics', label: '物理' },
        { value: 'chemistry', label: '化学' },
        { value: 'biology', label: '生物' },
        { value: 'history', label: '历史' },
        { value: 'geography', label: '地理' },
        { value: 'politics', label: '政治' }
      ]
    },
  },
  methods: {
    ...mapActions('noteCompletion', ['uploadNote', 'completeNote', 'setCurrentNote']),

    async fetchCoursesFromBackend() {
      try {
        const response = await this.$store.dispatch('get', {
          url: AC_URL + '/api/v1/prep/course/'
        }, { root: true });
        return response?.data?.results || [];
      } catch (error) {
        console.error('获取课程列表失败:', error);
        return [];
      }
    },

    async submitForm() {
      this.$refs.noteFormRef.validate(async (valid) => {
        if (valid) {
          try {
            const loadingInstance = this.$loading({
              lock: true,
              text: this.noteForm.autoComplete ? '正在上传并补全笔记...' : '正在上传笔记...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            });

            const response = await this.uploadNote(this.noteForm);
            this.uploadedNoteTitle = response.data?.title || this.noteForm.title;
            this.$message.success('笔记上传成功');

            if (this.noteForm.autoComplete) {
              await this.setCurrentNote({
                id: response.data.id,
                display_id: response.data.display_id,
              });
              await this.completeNote(response.data.display_id);
              this.$message.success('笔记补全成功');
            }

            loadingInstance.close();
            this.uploadSuccessDialog = true;
          } catch (error) {
            console.error('笔记处理失败:', error);
            const errorMsg = error?.response?.data?.message || error.message || '笔记处理失败';
            this.$message.error(errorMsg);
          }
        }
      });
    },

    resetForm() {
      this.$refs.noteFormRef.resetFields();
      this.noteForm.autoComplete = false;
    },

    resetFormAndClose() {
      this.resetForm();
      this.uploadSuccessDialog = false;
    }
  },

  async created() {
    const courses = await this.fetchCoursesFromBackend();
    this.courses = courses;
    this.hasCoursesLoaded = true;

    if (courses.length === 0) {
      this.$message.warning('当前无可关联课程，无法上传笔记。');
      // 立即跳转回笔记列表
      this.$router.push({ name: 'NoteList' });
    }
  },
}
</script>

<style scoped>
.note-upload-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  background-color: #f5f7fa;
}

.header-section {
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.upload-card {
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.el-form-item {
  margin-bottom: 25px;
}

.el-button {
  margin-right: 10px;
}

.upload-options {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

@media (max-width: 768px) {
  .upload-options {
    flex-direction: column;
    gap: 10px;
  }
  .upload-options button {
    width: 100%;
  }
}

/* 加载卡片样式 */
.loading-card {
  text-align: center;
  padding: 50px 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}
</style>