<template>
  <div class="note-completion-detail">
    <h1 class="page-title">笔记详情</h1>

    <!-- 加载成功并有数据时显示详情 -->
    <el-card class="detail-card" v-if="currentNote && !loading">
      <div class="detail-header">
        <h2>{{ currentNote.title }} ({{ currentNote.subject }})</h2>
        <div class="header-actions">
          <!-- 添加 loading 状态到按钮 -->
          <el-button 
            type="primary" 
            @click="handleCompleteNote"
            :loading="isCompleting"
          >
            {{ isCompleting ? '补全中...' : '补全笔记' }}
          </el-button>
          <!-- 添加修改按钮 -->
          <el-button 
            type="warning" 
            @click="startEditing"
          >
            修改笔记
          </el-button>
        </div>
      </div>

      <div class="detail-content">
        <h3>原始笔记</h3>
        <div class="original-content" v-html="formattedOriginalContent"></div>

        <h3 v-if="currentNote.completed_content">补全笔记</h3>
        <div class="completed-content" v-html="formattedCompletedContent" v-if="currentNote.completed_content"></div>

        <div v-if="currentNote.completion_notes" class="completion-notes">
          <h3>补全说明</h3>
          <p>{{ currentNote.completion_notes }}</p>
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
      <!-- 显示具体的错误信息 -->
      <p v-if="error">{{ error }}</p>
      <p v-else>未找到指定的笔记。</p>
      <el-button type="primary" @click="retryFetchDetail" icon="el-icon-refresh">重试</el-button>
      <el-button @click="goToList" icon="el-icon-arrow-left">返回列表</el-button>
    </el-card>

    <!-- 补全结果弹窗 -->
    <el-dialog
      title="补全后的笔记"
      :visible.sync="showCompletedDialog"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="completed-dialog"
      v-if="completedNote"
    >
      <div class="completed-header">
        <h3>{{ completedNote.title }} ({{ getSubjectLabel(completedNote.subject) }})</h3>
        <div class="header-actions">
          <el-button 
            type="primary" 
            size="mini"
            icon="el-icon-document-copy"
            @click="copyCompletedContent"
          >复制内容</el-button>
        </div>
      </div>

      <div class="completed-content" v-html="formattedCompletedDialogContent"></div>

      <div class="completion-notes" v-if="completedNote.completion_notes">
        <h4>补全说明</h4>
        <p>{{ completedNote.completion_notes }}</p>
      </div>

      <div class="completion-meta">
        <span>补全时间: {{ formatDate(completedNote.completion_time) }}</span>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 编辑笔记弹窗 -->
    <el-dialog
      title="编辑笔记"
      :visible.sync="showEditDialog"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="edit-dialog"
    >
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="笔记标题">
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
        
        <el-form-item label="原始内容">
          <el-input
            type="textarea"
            v-model="editForm.original_content"
            :rows="10"
            placeholder="请输入原始笔记内容"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="补全内容">
          <el-input
            type="textarea"
            v-model="editForm.completed_content"
            :rows="15"
            placeholder="请输入补全后的笔记内容"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="补全说明">
          <el-input
            type="textarea"
            v-model="editForm.completion_notes"
            :rows="3"
            placeholder="请输入补全说明"
          ></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEditedNote" :loading="saving">保存修改</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'NoteCompletionDetailPage',
  data() {
    return {
      // 1. 修改 data 属性名以反映其内容
      noteDisplayId: this.$route.params.displayId, // 2. 使用 displayId
      isCompleting: false, // 用于跟踪笔记补全的生成状态
      showCompletedDialog: false,
      showEditDialog: false, // 添加编辑弹窗状态
      completedNote: null,
      covering: false,
      saving: false,
      processingStartTime: null,
      // 编辑表单数据
      editForm: {
        display_id: '',
        title: '',
        subject: '',
        grade: '',
        original_content: '',
        completed_content: '',
        completion_notes: '',
        completion_time: ''
      }
    }
  },
  computed: {
    // 3. 从 Vuex 映射状态 
    ...mapState('noteCompletion', ['currentNote', 'loading', 'error']), 
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
    formattedOriginalContent() {
      if (!this.currentNote) return ''
      // 4. 添加空值检查
      return this.currentNote.original_content ? this.currentNote.original_content.replace(/\n/g, '<br>') : ''
    },
    formattedCompletedContent() {
      if (!this.currentNote || !this.currentNote.completed_content) return ''
      // 5. 添加空值检查
      return this.currentNote.completed_content ? this.currentNote.completed_content.replace(/\n/g, '<br>') : ''
    },
    formattedCompletedDialogContent() {
      if (!this.completedNote?.completed_content) return ''
      return this.completedNote.completed_content
        .replace(/# (.*)/g, '<h2>$1</h2>')
        .replace(/## (.*)/g, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
    }
  },
  methods: {
    // 6. 映射 Vuex actions
    ...mapActions('noteCompletion', [
      'fetchDetail', 
      'completeNote_id', 
      'coverNoteToServer', 
      'setCurrentNote']), 

    getSubjectLabel(value) {
      const subject = this.subjects.find(s => s.value === value)
      return subject ? subject.label : value
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },

    // 开始编辑笔记
    startEditing() {
      if (!this.currentNote) {
        this.$message.warning("没有可编辑的笔记");
        return;
      }
      
      // 将当前笔记数据填充到编辑表单
      this.editForm = {
        display_id: this.currentNote.display_id || this.currentNote.id,
        title: this.currentNote.title || '',
        subject: this.currentNote.subject || '',
        grade: this.currentNote.grade || '',
        original_content: this.currentNote.original_content || '',
        completed_content: this.currentNote.completed_content || '',
        completion_notes: this.currentNote.completion_notes || '',
        completion_time: this.currentNote.completion_time || new Date().toISOString()
      };
      
      this.showEditDialog = true;
    },

    // 保存编辑后的笔记
    async saveEditedNote() {
      console.log('this.editForm:', this.editForm)
      try {
        this.saving = true;
        
        // 构造要保存的数据对象
        const saveData = {
          display_id: this.editForm.display_id,
          title: this.editForm.title,
          subject: this.editForm.subject,
          grade: this.editForm.grade,
          original_content: this.editForm.original_content,
          completed_content: this.editForm.completed_content,
          completion_notes: this.editForm.completion_notes,
          completion_time: this.editForm.completion_time 
        ? new Date(this.editForm.completion_time).toISOString().slice(0, 19).replace('T', ' ')
        : null
        };

        // 调用 Vuex action 保存数据
        await this.coverNoteToServer(saveData);
        
        this.$message.success("笔记修改已保存");
        this.showEditDialog = false;
        
        // 保存成功后刷新详情，获取最新的数据
        await this.fetchDetail(this.noteDisplayId);
        
      } catch (err) {
        console.error("保存失败:", err);
        
        // 更详细的错误处理
        let errorMessage = "保存失败";
        if (err.response) {
          if (err.response.status === 404) {
            errorMessage = "笔记不存在，请刷新页面重试";
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

    async handleCompleteNote() {
      if (!this.currentNote?.id && !this.currentNote?.note_id) {
        this.$message.warning("当前笔记信息不完整")
        return
      }

      this.isCompleting = true
      this.processingStartTime = Date.now()
      let loadingInstance = null

      try {
        // 显示处理提示
        loadingInstance = this.$loading({
          lock: true,
          text: '正在补全笔记，请耐心等待...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })

        // 设置当前笔记
        await this.setCurrentNote({
          id: this.currentNote.id || this.currentNote.note_id,
          title: this.currentNote.title,
          subject: this.currentNote.subject
        })

        // 补全笔记
        const result = await this.completeNote_id(this.noteDisplayId)
        console.log('笔记补全成功:', result)
        
        this.completedNote = result.data || result
        this.showCompletedDialog = true
        
        this.$message.success("笔记补全成功")
      } catch (err) {
        console.error("补全笔记失败:", err)
        
        // 计算处理时间
        const processingTime = Date.now() - this.processingStartTime
        const minutes = Math.floor(processingTime / 60000)
        const seconds = ((processingTime % 60000) / 1000).toFixed(0)
        
        // 根据错误类型显示不同提示
        if (err.code === 'ECONNABORTED') {
          this.$message({
            type: 'warning',
            message: `请求超时（${minutes}分${seconds}秒）。请检查网络连接或联系管理员。`,
            duration: 5000
          })
        } else {
          const errorMsg = err?.response?.data?.message || err?.message || "补全笔记失败"
          this.$message.error(errorMsg)
        }
      } finally {
        this.isCompleting = false
        if (loadingInstance) {
          loadingInstance.close()
        }
      }
    },

    copyCompletedContent() {
      if (!this.completedNote) return
      const content = this.completedNote.completed_content
      navigator.clipboard.writeText(content).then(() => {
        this.$message.success("补全笔记内容已复制到剪贴板")
      }).catch(err => {
        console.error('复制失败:', err)
        this.$message.error("复制失败，请手动选择内容")
      })
    },

    closeDialog() {
      this.showCompletedDialog = false
    },

    retryFetchDetail() {
      if (this.noteDisplayId) {
        this.fetchDetail(this.noteDisplayId)
      }
    },

    goToList() {
      this.$router.push('/NoteCompletion')
    }
  },
  created() {
    if (this.noteDisplayId) {
      this.fetchDetail(this.noteDisplayId)
    } else {
      console.error("路由中未找到 displayId 参数")
    }
  },
  watch: {
    '$route.params.displayId': {
      handler(newDisplayId) {
        this.noteDisplayId = newDisplayId
        if (newDisplayId) {
          this.fetchDetail(newDisplayId)
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.note-completion-detail {
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

.original-content, .completed-content {
  white-space: pre-wrap;
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

.completion-notes {
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

/* 补全弹窗样式 */
.completed-dialog .completed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.completed-dialog .completed-content {
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

.completed-dialog .completed-content h1, 
.completed-dialog .completed-content h2, 
.completed-dialog .completed-content h3 {
  margin: 15px 0 10px;
  color: #303133;
}

.completed-dialog .completed-content p {
  margin: 10px 0;
}

.completed-dialog .completed-content code {
  background: #e6e6e6;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.completed-dialog .completion-notes {
  margin-top: 20px;
  padding: 15px;
  background: #f0f7ff;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.completed-dialog .completion-notes h4 {
  margin: 0 0 8px;
  color: #303133;
}

.completed-dialog .completion-meta {
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