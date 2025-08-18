<template>
  <div class="smart-prep-detail">
    <h1 class="page-title">教案详情</h1>

    <!-- 加载成功并有数据时显示详情 -->
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
        <h3>原始教案</h3>
        <div class="original-content" v-html="formattedOriginalContent"></div>

        <h3 v-if="currentPrep.optimized_content">优化教案</h3>
        <div class="optimized-content" v-html="formattedOptimizedContent" v-if="currentPrep.optimized_content"></div>

        <div v-if="currentPrep.optimization_notes" class="optimization-notes">
          <h3>优化说明</h3>
          <p>{{ currentPrep.optimization_notes }}</p>
        </div>
      </div>

      <div class="detail-footer">
        <p>创建时间: {{ formatDate(currentPrep.created_at) }}</p>
        <p v-if="currentPrep.optimization_time">优化时间: {{ formatDate(currentPrep.optimization_time) }}</p>
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
      <el-button type="primary" @click="retryFetchDetail" icon="el-icon-refresh">重试</el-button>
      <el-button @click="goToList" icon="el-icon-arrow-left">返回列表</el-button>
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
      <el-form :model="editForm" label-width="80px">
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
        
        <el-form-item label="课时">
          <el-input-number v-model="editForm.duration" :min="1" :max="120"></el-input-number>
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
  name: 'SmartPrepDetailPage',
  data() {
    return {
      lessonDisplayId: this.$route.params.displayId,
      isGenerating: false,
      showOptimizedDialog: false,
      showEditDialog: false, // 添加编辑弹窗状态
      optimizedLesson: {},
      covering: false,
      saving: false,
      // 编辑表单数据
      editForm: {
        display_id: '',
        title: '',
        subject: '',
        grade: '',
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
    ...mapState('smartPrep', ['currentPrep', 'loading', 'error']),
    formattedOriginalContent() {
      if (!this.currentPrep) return ''
      return this.currentPrep.original_content ? this.currentPrep.original_content.replace(/\n/g, '<br>') : ''
    },
    formattedOptimizedContent() {
      if (!this.currentPrep || !this.currentPrep.optimized_content) return ''
      return this.currentPrep.optimized_content ? this.currentPrep.optimized_content.replace(/\n/g, '<br>') : ''
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
    ...mapActions('smartPrep', 
    ['fetchDetail', 
    'generateOptimizedLesson_id', 
    'coverLessonToServer']
    ),
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },

    // 开始编辑教案
    startEditing() {
      if (!this.currentPrep) {
        this.$message.warning("没有可编辑的教案");
        return;
      }
      
      // 将当前教案数据填充到编辑表单
      this.editForm = {
        display_id: this.currentPrep.display_id || this.currentPrep.id,
        title: this.currentPrep.title || '',
        subject: this.currentPrep.subject || '',
        grade: this.currentPrep.grade || '',
        duration: this.currentPrep.duration || 45,
        original_content: this.currentPrep.original_content || '',
        optimized_content: this.currentPrep.optimized_content || '',
        optimization_notes: this.currentPrep.optimization_notes || '',
        optimization_time: this.currentPrep.optimization_time || new Date().toISOString()
      };
      
      this.showEditDialog = true;
    },

    // 保存编辑后的教案
    async saveEditedLesson() {
      console.log('this.editForm:', this.editForm)
      try {
        this.saving = true;
        
        // 构造要保存的数据对象
        const saveData = {
          display_id: this.editForm.display_id,
          title: this.editForm.title,
          subject: this.editForm.subject,
          grade: this.editForm.grade,
          duration: this.editForm.duration,
          original_content: this.editForm.original_content,
          optimized_content: this.editForm.optimized_content,
          optimization_notes: this.editForm.optimization_notes,
          optimization_time: this.editForm.optimization_time 
        ? new Date(this.editForm.optimization_time).toISOString().slice(0, 19).replace('T', ' ')
        : null
        };

        // 调用 Vuex action 保存数据
        await this.coverLessonToServer(saveData);
        
        this.$message.success("教案修改已保存");
        this.showEditDialog = false;
        
        // 保存成功后刷新详情，获取最新的数据
        await this.fetchDetail(this.lessonDisplayId);
        
      } catch (err) {
        console.error("保存失败:", err);
        
        // 更详细的错误处理
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
      if (!this.currentPrep?.id && !this.currentPrep?.lesson_id) {
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

        const result = await this.generateOptimizedLesson_id(this.lessonDisplayId);
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

    retryFetchDetail() {
      if (this.lessonDisplayId) {
        this.fetchDetail(this.lessonDisplayId);
      }
    },

    goToList() {
      this.$router.push('/SmartPrep');
    }
  },
  created() {
    if (this.lessonDisplayId) {
      this.fetchDetail(this.lessonDisplayId);
    } else {
      console.error("路由中未找到 displayId 参数");
    }
  },
  watch: {
    '$route.params.displayId': {
      handler(newDisplayId) {
        this.lessonDisplayId = newDisplayId;
        if (newDisplayId) {
          this.fetchDetail(newDisplayId);
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.smart-prep-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.detail-card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.detail-content {
  line-height: 1.6;
}

.original-content, .optimized-content {
  white-space: pre-wrap;
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

.optimization-notes {
  background: #f0f7ff;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.detail-footer {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  color: #666;
  font-size: 14px;
}

.loading-card, .error-card {
  text-align: center;
  padding: 40px 20px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

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
</style>