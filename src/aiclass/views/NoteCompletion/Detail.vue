<template>
  <div class="note-detail">
    <h1 class="page-title">笔记详情</h1>

    <!-- 笔记详情 -->
    <el-card class="detail-card" v-if="currentNote && !loading">
      <div class="detail-header">
        <h2>{{ currentNote.title }} ({{ getSubjectLabel(currentNote.subject) }})</h2>
        <div class="header-actions">
          <el-button 
            v-if="!currentNote.course_display_id" 
            type="warning" 
            @click="openCourseDialog"
          >
            关联课程
          </el-button>
          <el-button 
            type="primary" 
            @click="completeNote" 
            :loading="isCompleting"
          >
            {{ isCompleting ? '补全中...' : '补全笔记' }}
          </el-button>
          <el-button type="info" @click="openEditDialog">修改笔记</el-button>
        </div>
      </div>

      <div class="detail-content">
        <div class="info-section">
          <h3>基本信息</h3>
          <ul>
            <li><strong>显示ID:</strong> {{ currentNote.display_id }}</li>
            <li><strong>年级:</strong> {{ currentNote.grade || 'N/A' }}</li>
            <li><strong>课程ID:</strong> {{ currentNote.course_display_id || 'N/A' }}</li>
          </ul>
        </div>

        <div class="content-section">
          <h3>原始笔记</h3>
          <div class="original-content">{{ currentNote.original_content }}</div>
        </div>

        <div v-if="currentNote.completed_content" class="content-section">
          <h3>补全笔记</h3>
          <div class="completed-content" v-html="formatContent(currentNote.completed_content)"></div>
        </div>

        <div v-if="currentNote.completion_notes" class="content-section">
          <h3>补全说明</h3>
          <div class="completion-notes">{{ currentNote.completion_notes }}</div>
        </div>

        <!-- 补全结果区域（保持原逻辑，仅样式统一） -->
        <div v-if="completionResult" class="content-section result-section">
          <h3 :class="completionResult.status">{{
            completionResult.status === 'success' ? '补全结果' :
            completionResult.status === 'warning' ? '补全警告' : '补全错误'
          }}</h3>
          <div class="result-content" :class="completionResult.status">
            <div v-if="completionResult.status === 'success'" v-html="formatContent(completionResult.data.completed_content)"></div>
            <p v-else>{{ completionResult.message }}</p>
          </div>
          <div class="result-meta" v-if="completionResult.status === 'success'">
            <p>说明: {{ completionResult.data.completion_notes }}</p>
            <p>时间: {{ formatDate(completionResult.data.completion_time) }}</p>
          </div>
        </div>
      </div>

      <div class="detail-footer">
        <p>创建时间: {{ formatDate(currentNote.created_at) }}</p>
        <p v-if="currentNote.completion_time">补全时间: {{ formatDate(currentNote.completion_time) }}</p>
      </div>
    </el-card>

    <!-- 加载中状态 -->
    <el-card class="loading-card" v-else-if="loading">
      <div class="loading-content">
        <i class="el-icon-loading" style="font-size: 24px;"></i>
        <p>正在加载笔记详情...</p>
      </div>
    </el-card>

    <!-- 错误或无数据状态 -->
    <el-card class="error-card" v-else>
      <p v-if="error">{{ error }}</p>
      <p v-else>未找到指定的笔记。</p>
      <div class="error-actions">
        <el-button type="primary" @click="retryFetch" icon="el-icon-refresh">重试</el-button>
        <el-button @click="goToList" icon="el-icon-arrow-left">返回列表</el-button>
      </div>
    </el-card>

    <!-- 关联课程对话框 -->
    <el-dialog title="关联课程" :visible.sync="showCourseDialog" width="40%">
      <el-select v-model="selectedCourse" placeholder="选择课程" style="width: 100%">
        <el-option
          v-for="course in courses"
          :key="course.display_id"
          :label="course.name"
          :value="course.display_id"
        >
          <span>{{ course.name }} <em>ID: {{ course.display_id }}</em></span>
        </el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showCourseDialog = false">取消</el-button>
        <el-button type="primary" @click="associateCourse" :loading="associating">确认关联</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      title="编辑笔记"
      :visible.sync="showEditDialog"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="edit-dialog"
    >
      <el-form :model="editForm" label-width="100px" :rules="editRules" ref="editForm">
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title"></el-input>
        </el-form-item>
        <el-form-item label="学科" prop="subject">
          <el-select v-model="editForm.subject" placeholder="请选择学科">
            <el-option
              v-for="subject in subjects"
              :key="subject.value"
              :label="subject.label"
              :value="subject.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="editForm.grade" placeholder="例如：九年级"></el-input>
        </el-form-item>
        <el-form-item label="原始内容">
          <el-input
            type="textarea"
            v-model="editForm.original_content"
            :rows="8"
            placeholder="请输入原始笔记内容"
          ></el-input>
        </el-form-item>
        <el-form-item label="补全内容">
          <el-input
            type="textarea"
            v-model="editForm.completed_content"
            :rows="12"
            placeholder="AI补全后的内容将显示在此"
          ></el-input>
        </el-form-item>
        <el-form-item label="补全说明">
          <el-input
            type="textarea"
            v-model="editForm.completion_notes"
            :rows="3"
            placeholder="记录AI补全时的注意事项"
          ></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveNote" :loading="saving">保存修改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
export default {
  name: 'NoteDetail',
  data() {
    return {
      noteId: this.$route.params.displayId,
      isCompleting: false,
      showEditDialog: false,
      showCourseDialog: false,
      associating: false,
      saving: false,
      courses: [],
      selectedCourse: null,
      editForm: {},
      completionResult: null,
      subjects: [
        { value: 'math', label: '数学' },
        { value: 'chinese', label: '语文' },
        { value: 'english', label: '英语' },
        { value: 'physics', label: '物理' },
        { value: 'chemistry', label: '化学' },
        { value: 'biology', label: '生物' },
        { value: 'history', label: '历史' },
        { value: 'geography', label: '地理' },
        { value: 'politics', label: '政治' }
      ],
      editRules: {
        title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
        subject: [{ required: true, message: '请选择学科', trigger: 'change' }],
        original_content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
      }
    }
  },
  computed: {
    currentNote() {
      return this.$store.state.noteCompletion.currentNote;
    },
    loading() {
      return this.$store.state.noteCompletion.loading;
    },
    error() {
      return this.$store.state.noteCompletion.error;
    }
  },
  methods: {
    ...mapActions('noteCompletion', ['fetchDetail', 'completeNote_id', 'updateNote']),

    getSubjectLabel(value) {
      return this.subjects.find(s => s.value === value)?.label || value;
    },

    formatDate(dateString) {
      return dateString ? new Date(dateString).toLocaleString() : '';
    },

    formatContent(content) {
      return content
        .replace(/# (.*)/g, '<h2>$1</h2>')
        .replace(/## (.*)/g, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');
    },

    async completeNote() {
      if (!this.currentNote?.id) return;

      this.isCompleting = true;
      this.completionResult = null;

      try {
        const result = await this.completeNote_id(this.noteId);

        if (result.status === 'success') {
          this.completionResult = {
            status: 'success',
            message: result.message,
            data: result.data
          };
          await this.fetchDetail(this.noteId);
        } else {
          this.completionResult = {
            status: result.status,
            message: result.message || '操作失败',
            data: result.data
          };
        }
      } catch (err) {
        this.completionResult = {
          status: 'error',
          message: err.response?.data?.message || '操作失败'
        };
      } finally {
        this.isCompleting = false;
      }
    },

    openEditDialog() {
      if (!this.currentNote) return;

      this.editForm = {
        display_id: this.currentNote.display_id,
        title: this.currentNote.title,
        subject: this.currentNote.subject,
        grade: this.currentNote.grade,
        original_content: this.currentNote.original_content,
        completed_content: this.currentNote.completed_content || '',
        completion_notes: this.currentNote.completion_notes || ''
      };
      this.showEditDialog = true;
    },

    async saveNote() {
      try {
        this.saving = true;
        await this.updateNote(this.editForm);
        this.$message.success('保存成功');
        this.showEditDialog = false;
        await this.fetchDetail(this.noteId);
      } catch (err) {
        this.$message.error(err.response?.data?.message || '保存失败');
      } finally {
        this.saving = false;
      }
    },

    async openCourseDialog() {
      try {
        this.courses = await this.fetchCourses();
        this.selectedCourse = null;
        this.showCourseDialog = true;
      } catch (err) {
        this.$message.error('获取课程列表失败');
      }
    },

    async associateCourse() {
      if (!this.selectedCourse) {
        this.$message.warning('请选择课程');
        return;
      }

      try {
        this.associating = true;
        await this.updateNote({
          display_id: this.currentNote.display_id,
          course_display_id: this.selectedCourse
        });
        this.$message.success('关联成功');
        this.showCourseDialog = false;
        await this.fetchDetail(this.noteId);
      } finally {
        this.associating = false;
      }
    },

    async fetchCourses() {
      return new Promise(resolve => {
        setTimeout(() => resolve([
          { display_id: 'MATH101', name: '高一数学' },
          { display_id: 'ENG202', name: '高三英语' }
        ]), 300);
      });
    },

    retryFetch() {
      if (this.noteId) this.fetchDetail(this.noteId);
    },

    goToList() {
      this.$router.push({ name: 'NoteList' });
    }
  },
  created() {
    if (this.noteId) this.fetchDetail(this.noteId);
  },
  watch: {
    '$route.params.displayId': {
      handler(newId) {
        if (newId) {
          this.noteId = newId;
          this.fetchDetail(newId);
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.note-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f5f7fa;
}

.page-title {
  font-size: 28px;
  margin-bottom: 25px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  font-weight: 600;
}

.page-title::before {
  content: "";
  display: inline-block;
  width: 5px;
  height: 28px;
  background: linear-gradient(to bottom, #409EFF, #1a56db);
  margin-right: 12px;
  border-radius: 2px;
}

.detail-card {
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
  margin-bottom: 25px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-self: flex-start;
  flex-wrap: wrap;
}

.detail-content {
  line-height: 1.6;
}

.info-section,
.content-section {
  margin-bottom: 30px;
  padding: 20px;
  background-color: #fafafa;
  border-radius: 8px;
  border-left: 5px solid #409EFF;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.info-section h3,
.content-section h3 {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  font-size: 18px;
  font-weight: 500;
}

.info-section ul {
  list-style: none;
  padding-left: 0;
}

.info-section li {
  padding: 5px 0;
  border-bottom: 1px dashed #eee;
}

.original-content,
.completed-content {
  white-space: pre-wrap;
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace;
  line-height: 1.5;
  max-height: 400px;
  overflow-y: auto;
}

.completion-notes {
  background: #f0f7ff;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.result-section h3.success {
  color: #67c23a;
}
.result-section h3.warning {
  color: #e6a23c;
}
.result-section h3.error {
  color: #f56c6c;
}

.result-content {
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}
.result-content.success {
  background: #f0f9ff;
  border-left: 4px solid #67c23a;
}
.result-content.warning {
  background: #fdf6ec;
  border-left: 4px solid #e6a23c;
}
.result-content.error {
  background: #fef0f0;
  border-left: 4px solid #f56c6c;
}

.result-meta {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
}

.detail-footer {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 14px;
  text-align: right;
}

.loading-card,
.error-card {
  text-align: center;
  padding: 50px 25px;
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

.error-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* 编辑弹窗样式 */
.edit-dialog .el-form-item {
  margin-bottom: 20px;
}

.edit-dialog .el-textarea {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .note-detail {
    padding: 15px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .detail-card {
    padding: 20px;
  }

  .detail-header {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .header-actions {
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .info-section,
  .content-section {
    margin-bottom: 25px;
    padding: 15px;
  }

  .info-section h3,
  .content-section h3 {
    margin-bottom: 10px;
    padding-bottom: 8px;
    font-size: 16px;
  }

  .original-content,
  .completed-content {
    max-height: 300px;
    padding: 12px;
    font-size: 14px;
  }

  .completion-notes,
  .result-content {
    padding: 12px;
  }

  .detail-footer {
    margin-top: 20px;
    padding-top: 15px;
    font-size: 13px;
  }

  .loading-card,
  .error-card {
    padding: 40px 20px;
    border-radius: 8px;
  }

  .loading-content {
    gap: 10px;
  }

  .error-actions {
    flex-direction: column;
    gap: 10px;
  }

  .error-actions button {
    width: 100%;
  }

  .edit-dialog .el-form-item {
    margin-bottom: 15px;
  }
}
</style>