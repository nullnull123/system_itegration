<template>
  <div class="lesson-plan-detail">
    <h1 class="page-title">教案详情</h1>

    <!-- 修改：使用 currentPrep 代替 currentLessonPlan -->
    <el-card class="detail-card" v-if="currentPrep && !loading">
      <div class="detail-header">
        <h2>{{ currentPrep.title }} ({{ currentPrep.subject }})</h2>
        <div class="header-actions">
          <el-button 
            type="primary" 
            @click="handleGenerateOptimizedLesson"
            :loading="isGenerating"
          >
            {{ isGenerating ? '生成中...' : '生成优化教案' }}
          </el-button>
          <!-- 添加修改按钮 -->
          <el-button 
            type="warning" 
            @click="startEditing"
          >
            修改教案
          </el-button>
        </div>
      </div>

      <div class="detail-content">
        <div class="info-section">
          <h3>基本信息</h3>
          <ul>
            <!-- 修改：使用 currentPrep 代替 currentLessonPlan -->
            <li><strong>显示ID:</strong> {{ currentPrep.display_id }}</li>
            <li><strong>课程名:</strong> {{ currentPrep.course_name || 'N/A' }}</li>
            <li><strong>课程ID:</strong> {{ currentPrep.course_display_id || 'N/A' }}</li>
            <li><strong>年级:</strong> {{ currentPrep.grade || 'N/A' }}</li>
            <li><strong>时长(分钟):</strong> {{ currentPrep.duration }}</li>
            <li><strong>第几次课:</strong> {{ currentPrep.lesson_number }}</li>
          </ul>
        </div>

        <div class="content-section">
          <h3>原始教案</h3>
          <!-- 修改：使用 currentPrep 代替 currentLessonPlan -->
          <div class="original-content">{{ currentPrep.original_content }}</div>
        </div>

        <!-- 修改：使用 currentPrep 代替 currentLessonPlan -->
        <div v-if="currentPrep.optimized_content" class="content-section">
          <h3>优化教案</h3>
          <div class="optimized-content">{{ currentPrep.optimized_content }}</div>
        </div>

        <!-- 修改：使用 currentPrep 代替 currentLessonPlan -->
        <div v-if="currentPrep.optimization_notes" class="content-section">
          <h3>优化说明</h3>
          <div class="optimization-notes">{{ currentPrep.optimization_notes }}</div>
        </div>
      </div>

      <div class="detail-footer">
        <!-- 修改：使用 currentPrep 代替 currentLessonPlan -->
        <p>创建时间: {{ formatDate(currentPrep.created_at) }}</p>
        <p v-if="currentPrep.optimization_time">优化时间: {{ formatDate(currentPrep.optimization_time) }}</p>
        <p>更新时间: {{ formatDate(currentPrep.updated_at) }}</p>
      </div>
    </el-card>

    <!-- 加载中状态 -->
    <el-card class="loading-card" v-else-if="loading">
      <div class="loading-content">
        <i class="el-icon-loading" style="font-size: 24px;"></i>
        <p>正在加载教案详情...</p>
      </div>
    </el-card>

    <!-- 错误或无数据状态 -->
    <el-card class="error-card" v-else>
      <p v-if="error">{{ error }}</p>
      <p v-else>未找到指定的教案。</p>
      <div class="error-actions">
        <el-button type="primary" @click="retryFetchDetail" icon="el-icon-refresh">重试</el-button>
        <el-button @click="goToList" icon="el-icon-arrow-left">返回列表</el-button>
      </div>
    </el-card>

    <!-- 优化结果弹窗 -->
    <el-dialog
      title="优化后的教案"
      :visible.sync="showOptimizedDialog"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="optimized-dialog"
    >
      <div class="optimized-header">
        <!-- 修改：使用 optimizedLesson 代替 currentLessonPlan -->
        <h3>{{ optimizedLesson.title }} ({{ optimizedLesson.subject }})</h3>
        <div class="header-actions">
          <el-button 
            type="primary" 
            size="mini"
            icon="el-icon-document-copy"
            @click="copyOptimizedContent"
          >复制内容</el-button>
        </div>
      </div>

      <div class="optimized-content" v-html="formattedOptimizedDialogContent"></div>

      <div class="optimization-notes" v-if="optimizedLesson.optimization_notes">
        <h4>优化说明</h4>
        <p>{{ optimizedLesson.optimization_notes }}</p>
      </div>

      <div class="optimization-meta">
        <span>优化时间: {{ formatDate(optimizedLesson.optimization_time) }}</span>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showOptimizedDialog = false">关闭</el-button>
        </span>
    </el-dialog>

    <!-- 编辑教案弹窗 -->
    <el-dialog
      title="编辑教案"
      :visible.sync="showEditDialog"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="edit-dialog"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="教案标题">
          <el-input v-model="editForm.title"></el-input>
        </el-form-item>
        
        <el-form-item label="学科">
          <el-select v-model="editForm.subject" placeholder="请选择学科">
            <el-option
              v-for="subject in subjects"
              :key="subject.value"
              :label="subject.label"
              :value="subject.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="年级">
          <el-input v-model="editForm.grade" placeholder="例如：九年级"></el-input>
        </el-form-item>

        <el-form-item label="第几次课">
          <el-input-number v-model="editForm.lesson_number" :min="1" :max="100"></el-input-number>
        </el-form-item>
        
        <el-form-item label="时长(分钟)">
          <el-input-number v-model="editForm.duration" :min="1" :max="240"></el-input-number>
        </el-form-item>
        
        <el-form-item label="原始内容">
          <el-input
            type="textarea"
            v-model="editForm.original_content"
            :rows="10"
            placeholder="请输入原始教案内容"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="优化内容">
          <el-input
            type="textarea"
            v-model="editForm.optimized_content"
            :rows="15"
            placeholder="请输入优化后的教案内容"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="优化说明">
          <el-input
            type="textarea"
            v-model="editForm.optimization_notes"
            :rows="3"
            placeholder="请输入优化说明"
          ></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEditedLesson" :loading="saving">保存修改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'LessonPlanDetailPage',
  data() {
    return {
      lessonPlanDisplayId: this.$route.params.displayId,
      isGenerating: false,
      showOptimizedDialog: false,
      showEditDialog: false,
      optimizedLesson: {},
      saving: false,
      // 编辑表单数据
      editForm: {
        display_id: '',
        title: '',
        subject: '',
        grade: '',
        lesson_number: 1,
        duration: 45,
        original_content: '',
        optimized_content: '',
        optimization_notes: '',
        optimization_time: ''
      },
      // 学科选项
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
      ]
    }
  },
  computed: {
    // 关键修改：将 currentLessonPlan 改为 currentPrep
    ...mapState('smartPrep', ['currentPrep', 'loading', 'error']),
    
    // 添加计算属性，保持代码一致性
    currentLessonPlan() {
      return this.currentPrep;
    },
    
    formattedOptimizedDialogContent() {
      if (!this.optimizedLesson.optimized_content) return ''
      return this.optimizedLesson.optimized_content
        .replace(/# (.*)/g, '<h2>$1</h2>')
        .replace(/## (.*)/g, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
    }
  },
  methods: {
    ...mapActions('smartPrep', ['fetchLessonPlanDetail', 'generateOptimizedLesson_id', 'updateLessonPlan']),
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },

    startEditing() {
      if (!this.currentPrep) { // 修改：使用 currentPrep
        this.$message.warning("没有可编辑的教案");
        return;
      }
      
      this.editForm = {
        display_id: this.currentPrep.display_id || this.currentPrep.id, // 修改：使用 currentPrep
        title: this.currentPrep.title || '', // 修改：使用 currentPrep
        subject: this.currentPrep.subject || '', // 修改：使用 currentPrep
        grade: this.currentPrep.grade || '', // 修改：使用 currentPrep
        lesson_number: this.currentPrep.lesson_number || 1, // 修改：使用 currentPrep
        duration: this.currentPrep.duration || 45, // 修改：使用 currentPrep
        original_content: this.currentPrep.original_content || '', // 修改：使用 currentPrep
        optimized_content: this.currentPrep.optimized_content || '', // 修改：使用 currentPrep
        optimization_notes: this.currentPrep.optimization_notes || '', // 修改：使用 currentPrep
        optimization_time: this.currentPrep.optimization_time || new Date().toISOString() // 修改：使用 currentPrep
      };
      
      this.showEditDialog = true;
    },

    async saveEditedLesson() {
      console.log('this.editForm:', this.editForm)
      try {
        this.saving = true;
        
        const saveData = {
          display_id: this.editForm.display_id,
          title: this.editForm.title,
          subject: this.editForm.subject,
          grade: this.editForm.grade,
          lesson_number: this.editForm.lesson_number,
          duration: this.editForm.duration,
          original_content: this.editForm.original_content,
          optimized_content: this.editForm.optimized_content,
          optimization_notes: this.editForm.optimization_notes,
          optimization_time: this.editForm.optimization_time 
            ? new Date(this.editForm.optimization_time).toISOString().slice(0, 19).replace('T', ' ')
            : null
        };

        await this.updateLessonPlan(saveData);
        
        this.$message.success("教案修改已保存");
        this.showEditDialog = false;
        
        await this.fetchLessonPlanDetail(this.lessonPlanDisplayId);
        
      } catch (err) {
        console.error("保存失败:", err);
        
        let errorMessage = "保存失败";
        if (err.response) {
          if (err.response.status === 404) {
            errorMessage = "教案不存在，请刷新页面重试";
          } else if (err.response.status === 400) {
            errorMessage = "数据格式错误，请检查输入内容";
          } else if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = `服务器错误: ${err.response.status}`;
          }
        } else if (err.request) {
          errorMessage = "网络连接失败，请检查网络";
        } else {
          errorMessage = err.message || "未知错误";
        }
        
        this.$message.error(errorMessage);
      } finally {
        this.saving = false;
      }
    },

    async handleGenerateOptimizedLesson() {
      if (!this.lessonPlanDisplayId) {
        this.$message.warning("当前教案信息不完整");
        return;
      }

      this.isGenerating = true;
      let loadingInstance = null;

      try {
        loadingInstance = this.$loading({
          lock: true,
          text: '正在优化教案，请稍候...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });

        const result = await this.generateOptimizedLesson_id(this.lessonPlanDisplayId);
        this.optimizedLesson = result;
        this.showOptimizedDialog = true;
        this.$message.success("优化教案生成成功");
      } catch (err) {
        console.error("生成优化教案失败:", err);
        const errorMsg = err?.response?.data?.message || err?.message || "生成优化教案失败";
        this.$message.error(errorMsg);
      } finally {
        this.isGenerating = false;
        if (loadingInstance) {
          loadingInstance.close();
        }
      }
    },

    

    copyOptimizedContent() {
      const content = this.optimizedLesson.optimized_content;
      if (!content) {
        this.$message.warning("没有可复制的内容");
        return;
      }
      
      navigator.clipboard.writeText(content).then(() => {
        this.$message.success("内容已复制到剪贴板");
      }).catch(() => {
        this.$message.error("复制失败，请手动选择内容");
      });
    },

    async retryFetchDetail() {
      if (this.lessonPlanDisplayId) {
        await this.fetchLessonPlanDetail(this.lessonPlanDisplayId);
      }
    },

    goToList() {
      this.$router.push({ name: 'LessonplanList' }); // 修改：与路由配置一致
    }
  },
  created() {
    if (this.lessonPlanDisplayId) {
      this.fetchLessonPlanDetail(this.lessonPlanDisplayId);
    } else {
      console.error("路由中未找到 displayId 参数");
    }
  },
  watch: {
    '$route.params.displayId': {
      handler(newDisplayId) {
        this.lessonPlanDisplayId = newDisplayId;
        if (newDisplayId) {
          this.fetchLessonPlanDetail(newDisplayId);
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.lesson-plan-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f5f7fa; /* 添加背景色 */
}

.page-title {
  font-size: 28px; /* 稍大一点的标题 */
  margin-bottom: 25px;
  color: #2c3e50; /* 更深的标题色 */
  display: flex;
  align-items: center;
  font-weight: 600; /* 加粗 */
}

.page-title::before {
  content: "";
  display: inline-block;
  width: 5px; /* 稍宽一点 */
  height: 28px;
  background: linear-gradient(to bottom, #409EFF, #1a56db); /* 渐变色条 */
  margin-right: 12px;
  border-radius: 2px;
}

.detail-card {
  padding: 25px; /* 增加内边距 */
  border-radius: 12px; /* 更圆润的角 */
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08); /* 更柔和的阴影 */
  margin-bottom: 25px;
  background-color: #ffffff; /* 卡片背景色 */
  border: 1px solid #e4e7ed; /* 添加边框 */
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* 顶部对齐 */
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.header-main {
  flex: 1;
  display: flex;
  flex-direction: column; /* 垂直排列 */
  gap: 10px; /* 添加间距 */
}

.lesson-plan-title {
  margin: 0;
  color: #303133;
  font-size: 24px; /* 标题字体大小 */
  font-weight: 500;
}

.lesson-plan-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  gap: 12px; /* 增加按钮间距 */
  align-self: flex-start; /* 按钮靠上对齐 */
  flex-wrap: wrap; /* 允许按钮换行 */
}

.detail-content {
  line-height: 1.6;
}

.info-section, .content-section {
  margin-bottom: 30px; /* 增加区块间距 */
  padding: 20px;
  background-color: #fafafa; /* 区块背景色 */
  border-radius: 8px;
  border-left: 5px solid #409EFF; /* 左侧强调色 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02); /* 微弱阴影 */
}

.info-section h3, .content-section h3 {
  margin-bottom: 15px; /* 增加标题与内容的间距 */
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  font-size: 18px; /* 标题字体大小 */
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

.original-content, .optimized-content {
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

.optimization-notes {
  background: #f0f7ff;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.detail-footer {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 14px;
  text-align: right;
}

.loading-card, .error-card {
  text-align: center;
  padding: 50px 25px; /* 增加内边距 */
  background-color: #ffffff; /* 卡片背景色 */
  border-radius: 12px; /* 圆角 */
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08); /* 阴影 */
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

/* 优化结果弹窗样式 */
.optimized-dialog .optimized-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.optimized-dialog .optimized-content {
  line-height: 1.6;
  font-size: 16px;
  white-space: pre-wrap;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
}

.optimized-dialog .optimization-notes {
  margin-top: 20px;
  padding: 15px;
  background: #f0f7ff;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.optimized-dialog .optimization-meta {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
  color: #909399;
  font-size: 14px;
  text-align: right;
}

/* 编辑弹窗样式 */
.edit-dialog .el-form-item {
  margin-bottom: 20px;
}

.edit-dialog .el-textarea {
  width: 100%;
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
  .lesson-plan-detail {
    padding: 15px; /* 减少移动端内边距 */
  }

  .page-title {
    font-size: 24px; /* 移动端标题大小 */
    margin-bottom: 20px;
  }

  .detail-card {
    padding: 20px; /* 减少移动端卡片内边距 */
  }

  .detail-header {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .header-main {
    align-items: center;
  }

  .lesson-plan-meta {
    justify-content: center;
  }

  .header-actions {
    justify-content: center;
    gap: 10px; /* 移动端按钮间距 */
    flex-wrap: wrap;
  }

  .info-section, .content-section {
    margin-bottom: 25px; /* 减少移动端区块间距 */
    padding: 15px;
  }

  .info-section h3, .content-section h3 {
    margin-bottom: 10px; /* 减少移动端标题与内容的间距 */
    padding-bottom: 8px;
    font-size: 16px; /* 移动端标题字体大小 */
  }

  .original-content, .optimized-content {
    max-height: 300px; /* 减少移动端最大高度 */
    padding: 12px;
    font-size: 14px; /* 减少移动端字体大小 */
  }

  .optimization-notes {
    padding: 12px;
  }

  .detail-footer {
    margin-top: 20px; /* 减少移动端顶部间距 */
    padding-top: 15px;
    font-size: 13px; /* 减少移动端字体大小 */
  }

  .loading-card, .error-card {
    padding: 40px 20px; /* 减少移动端内边距 */
    border-radius: 8px; /* 减少移动端圆角 */
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

  /* 优化结果弹窗样式 (移动端) */
  .optimized-dialog .optimized-content {
    padding: 15px;
    font-size: 14px; /* 减少移动端字体大小 */
    min-height: 250px;
    max-height: 400px; /* 减少移动端最大高度 */
  }

  .optimized-dialog .optimization-notes {
    margin-top: 15px;
    padding: 12px;
  }

  .optimized-dialog .optimization-meta {
    margin-top: 12px;
    padding-top: 8px;
    font-size: 13px; /* 减少移动端字体大小 */
  }

  /* 编辑弹窗样式 (移动端) */
  .edit-dialog .el-form-item {
    margin-bottom: 15px;
  }

  .edit-dialog .el-textarea {
    width: 100%;
  }

  /* 添加处理状态样式 (移动端) */
  .processing-info {
    margin-top: 15px;
  }

  .estimated-time {
    font-size: 12px; /* 减少移动端字体大小 */
    margin-left: 8px;
  }
}
</style>