<template>
  <div class="smart-prep-upload">
    <h1 class="page-title">智能备课系统</h1>
    
    <el-card class="upload-card">
      <h2>上传教案</h2>
      
      <el-form 
        :model="lessonForm" 
        :rules="rules" 
        ref="lessonForm" 
        label-width="120px"
        :disabled="loading"
      >
        <el-form-item prop="title">
          <label for="lesson-title" class="el-form-item__label">教案标题</label>
          <div class="el-form-item__content">
            <el-input 
              id="lesson-title" 
              v-model="lessonForm.title" 
              placeholder="请输入教案标题"
              clearable
            ></el-input>
          </div>
        </el-form-item>
        
        <el-form-item prop="subject">
          <label for="lesson-subject" class="el-form-item__label">学科</label>
          <div class="el-form-item__content">
            <el-select 
              id="lesson-subject"
              v-model="lessonForm.subject" 
              placeholder="请选择学科"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="subject in subjects"
                :key="subject.value"
                :label="subject.label"
                :value="subject.value">
              </el-option>
            </el-select>
          </div>
        </el-form-item>
        
        <el-form-item prop="grade">
          <label for="lesson-grade" class="el-form-item__label">年级</label>
          <div class="el-form-item__content">
            <el-input 
              id="lesson-grade"
              v-model="lessonForm.grade" 
              placeholder="例如：九年级"
              clearable
            ></el-input>
          </div>
        </el-form-item>
        
        <el-form-item prop="original_content">
          <label for="lesson-content" class="el-form-item__label">教案内容</label>
          <div class="el-form-item__content">
            <el-input
              id="lesson-content"
              type="textarea"
              v-model="lessonForm.original_content"
              :rows="15"
              placeholder="请输入教案内容"
              :autosize="{ minRows: 5, maxRows: 15 }"
            ></el-input>
            <div class="content-hint">
              <small>支持Markdown格式，可使用#标题、**加粗**、*斜体*等语法</small>
            </div>
          </div>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="optimizeEnabled">
            同时生成优化版教案（约需1-2分钟）
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="submitForm" 
            :loading="loading"
            :disabled="loading"
          >
            <span v-if="!loading">{{ optimizeEnabled ? '提交并优化教案' : '仅提交教案' }}</span>
            <span v-else>正在处理中...</span>
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
            <span>教案正在处理中，请耐心等待...</span>
            <span class="estimated-time">(预计需要 1-2 分钟)</span>
          </div>
        </el-alert>
      </div>


    </el-card>
    
    <el-dialog 
      title="优化后的教案" 
      :visible.sync="dialogVisible" 
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      v-if="optimizedLesson"
      class="optimized-dialog"
    >
      <div class="optimized-header">
        <h3>{{ optimizedLesson.title }} ({{ getSubjectLabel(optimizedLesson.subject) }})</h3>
        <div class="header-actions">
          <el-button 
            type="primary" 
            size="mini"
            icon="el-icon-document-copy"
            @click="copyOptimizedContent"
          >复制内容</el-button>
        </div>
      </div>
      
      <div class="optimized-content" v-html="formattedContent"></div>
      
      <div class="optimization-notes" v-if="optimizedLesson.optimization_notes">
        <h4>优化说明</h4>
        <p>{{ optimizedLesson.optimization_notes }}</p>
      </div>
      
      <div class="optimization-meta">
        <span>优化时间: {{ formatDate(optimizedLesson.optimization_time) }}</span>
      </div>
      
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">关闭</el-button>
      </span>
    </el-dialog>
    
    <el-dialog
      title="保存成功"
      :visible.sync="saveSuccessDialog"
      width="30%"
    >
      <p>教案已成功保存！</p>
      <div class="save-options">
        <router-link to="/SmartPrep">
          <el-button type="primary">查看教案列表</el-button>
        </router-link>
        <el-button @click="resetFormAndClose">继续创建新教案</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// 修正 1: 只导入实际使用的辅助函数
import { mapActions, mapState } from 'vuex' // 移除未使用的 mapGetters

export default {
  name: 'SmartPrepUploadPage',
  
  data() {
    return {
      lessonForm: {
        title: '',
        subject: '',
        grade: '',
        original_content: ''
      },
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
      dialogVisible: false,
      optimizedLesson: null,
      saveSuccessDialog: false,
      processing: false,  // 添加处理状态标志
      processingStartTime: null,
      optimizeEnabled: true
    }
  },
  // 修正 2: 合并重复的 computed 属性，只保留一个
  computed: {

    formattedContent() {
      if (!this.optimizedLesson?.optimized_content) {
        return ''
      }
      
      // 将 Markdown 转换为 HTML
      return this.optimizedLesson.optimized_content
        .replace(/# (.*)/g, '<h2>$1</h2>')
        .replace(/## (.*)/g, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
    },

    ...mapState('smartPrep', {
      loading: state => state.loading,
      error: state => state.error,
      // 添加 currentPrep 的 computed 属性
      currentPrep: state => state.currentPrep
    }),
    rules() {
      return {
        title: [
          { required: true, message: '请输入教案标题', trigger: 'blur' },
          { min: 2, message: '教案标题至少需要2个字符', trigger: 'blur' },
          { max: 100, message: '教案标题不能超过100个字符', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: '请选择学科', trigger: 'change' }
        ],
        original_content: [
          { required: true, message: '请输入教案内容', trigger: 'blur' },
          { min: 10, message: '教案内容至少需要10个字符', trigger: 'blur' }
        ]
      }
    },
    // 如果有需要，可以在这里使用 mapState
    ...mapState('smartPrep', {
      smartPrepLoading: state => state.loading,
      smartPrepError: state => state.error
    })
  },
  methods: {

    // 修正 2: 添加 formatContent 方法作为备用
    formatContent(content) {
      if (!content) return ''
      return content
        .replace(/# (.*)/g, '<h2>$1</h2>')
        .replace(/## (.*)/g, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
    },

    ...mapActions('smartPrep', [
      'uploadLesson', 
      'generateOptimizedLesson', 
      'setCurrentPrep'  // 修正 2: 确保逗号位置正确
    ]),
    
    getSubjectLabel(value) {
      const subject = this.subjects.find(s => s.value === value)
      return subject ? subject.label : value
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    
    async submitForm() {
      this.$refs.lessonForm.validate(async valid => {
        if (valid) {
          this.processing = true
          this.processingStartTime = Date.now()

          let loading = null

          try {
            const lessonData = {
              title: this.lessonForm.title,
              subject: this.lessonForm.subject,
              grade: this.lessonForm.grade,
              original_content: this.lessonForm.original_content
            }

            console.log('提交教案数据:', lessonData)

            // 显示处理提示
            loading = this.$loading({
              lock: true,
              text: this.optimizeEnabled ? '正在上传并优化教案...' : '正在上传教案...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            })

            // 上传教案
            const uploadResponse = await this.uploadLesson(lessonData)
            console.log('教案上传成功:', uploadResponse)

            const lessonId = uploadResponse.id || uploadResponse.lesson_id || (uploadResponse.data && uploadResponse.data.id)

            if (!lessonId) {
              console.error('无法从响应中获取教案ID:', uploadResponse)
              throw new Error('教案上传成功但未获取到教案ID')
            }

            console.log('获取到教案ID:', lessonId)

            await this.setCurrentPrep({
              id: lessonId,
              title: this.lessonForm.title,
              subject: this.lessonForm.subject,
            })

            if (this.optimizeEnabled) {
              loading.text = '正在优化教案，请耐心等待...'

              // 生成优化教案
              const optimizedResponse = await this.generateOptimizedLesson()
              this.optimizedLesson = optimizedResponse
              this.dialogVisible = true

              this.$message.success('教案上传并优化成功')
            } else {
              this.$message.success('教案已成功提交')
            }
          } catch (error) {
            console.error('教案处理失败:', error)

            const processingTime = Date.now() - this.processingStartTime
            const minutes = Math.floor(processingTime / 60000)
            const seconds = ((processingTime % 60000) / 1000).toFixed(0)

            if (error.code === 'ECONNABORTED') {
              this.$message({
                type: 'warning',
                message: `请求超时（${minutes}分${seconds}秒）。请检查网络连接或联系管理员。`,
                duration: 5000
              })
            } else {
              this.$message({
                type: 'error',
                message: error.message || '教案处理失败',
                duration: 3000
              })
            }
          } finally {
            try {
              if (loading) {
                loading.close()
                console.log('loading 已关闭')
              }
            } catch (e) {
              console.error('关闭 loading 时出错:', e)
            }
            this.processing = false
          }
        }
      })
    },
    
    resetForm() {
      this.$refs.lessonForm.resetFields()
      this.lessonForm.original_content = ''
      this.optimizedLesson = null
      this.dialogVisible = false
      this.saveSuccessDialog = false
    },
    
    resetFormAndClose() {
      this.resetForm()
      this.saveSuccessDialog = false
    },
    
    closeDialog() {
      this.dialogVisible = false
    },
    
    async copyOptimizedContent() {
      if (!this.optimizedLesson) return
      const content = this.optimizedLesson.optimized_content
      navigator.clipboard.writeText(content).then(() => {
        this.$message({
          type: 'success',
          message: '优化教案内容已复制到剪贴板',
          duration: 1500
        })
      }).catch(err => {
        console.error('复制失败:', err)
        this.$message({
          type: 'error',
          message: '复制失败，请手动选择内容',
          duration: 2000
        })
      })
    }
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
.smart-prep-upload {
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

.upload-card {
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

.optimized-dialog {
  min-height: 500px;
}

.optimized-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.optimized-content {
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

.optimized-content h1, .optimized-content h2, .optimized-content h3 {
  margin: 15px 0 10px;
  color: #303133;
}

.optimized-content p {
  margin: 10px 0;
}

.optimized-content code {
  background: #e6e6e6;
  padding: 2px 4px;
  border-radius: 4px;
  font-family: monospace;
}

.optimization-notes {
  margin-top: 20px;
  padding: 15px;
  background: #f0f7ff;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}

.optimization-notes h4 {
  margin: 0 0 8px;
  color: #303133;
}

.optimization-meta {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
  color: #909399;
  font-size: 14px;
  text-align: right;
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
  .smart-prep-upload {
    padding: 10px;
  }
  
  .upload-card {
    padding: 15px;
  }
  
  .optimized-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-end;
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