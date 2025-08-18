<template>
  <div class="note-completion-upload">
    <h1 class="page-title">笔记补全系统</h1>
    
    <el-card class="upload-card">
      <h2>上传笔记</h2>
      
      <el-form 
        :model="noteForm" 
        :rules="rules" 
        ref="noteForm" 
        label-width="120px"
        v-loading="loading"
      >
        <el-form-item label="笔记标题" prop="title">
          <el-input v-model="noteForm.title" placeholder="请输入笔记标题"></el-input>
        </el-form-item>
        
        <el-form-item label="学科" prop="subject">
          <el-select v-model="noteForm.subject" placeholder="请选择学科">
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
        
        <el-form-item label="笔记内容" prop="original_content">
          <el-input
            type="textarea"
            v-model="noteForm.original_content"
            :rows="15"
            placeholder="请输入笔记内容"
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-checkbox v-model="completeEnabled">
            同时生成补全版笔记（约需1-2分钟）
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="submitForm" 
            :loading="loading"
            :disabled="loading"
          >
            <span v-if="!loading">{{ completeEnabled ? '提交并补全笔记' : '仅提交笔记' }}</span>
            <span v-else>正在处理中...</span>
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>


      </el-form>
    </el-card>
    
    <el-dialog 
      title="补全后的笔记" 
      :visible.sync="dialogVisible" 
      width="80%"
      v-if="completedNote"
    >
      <div class="completed-content" v-html="formattedContent"></div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="saveNote">保存笔记</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'NoteCompletionUploadPage',
  data() {
    return {
      noteForm: {
        title: '',
        subject: '',
        grade: '',
        processing: false,
        original_content: ''
      },
      rules: {
        title: [
          { required: true, message: '请输入笔记标题', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: '请选择学科', trigger: 'change' }
        ],
        original_content: [
          { required: true, message: '请输入笔记内容', trigger: 'blur' }
        ]
      },
      dialogVisible: false,
      completeEnabled: true,
      completedNote: null
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
    formattedContent() {
    // 安全检查：确保 completedNote 和 completed_content 都存在
    const content = this.completedNote?.completed_content || this.completedNote?.data?.completed_content || ''
    
    // 确保 content 是字符串
    const safeContent = typeof content === 'string' ? content : ''
    
    return safeContent
      .replace(/# (.*)/g, '<h2>$1</h2>')
      .replace(/## (.*)/g, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
  },
  },
  methods: {
    ...mapActions('noteCompletion',
     ['uploadNote',
      'completeNote', 
      'setCurrentNote']),
    
    async submitForm() {
      this.$refs.noteForm.validate(async valid => {
        if (valid) {
          this.processing = true
          this.processingStartTime = Date.now()  // 添加：记录处理开始时间

          let loading = null
          
          try {
            const noteData = {
              title: this.noteForm.title,
              subject: this.noteForm.subject,
              grade: this.noteForm.grade,
              original_content: this.noteForm.original_content
            }
            
            console.log('提交笔记数据:', noteData)

            // 显示处理提示
            loading = this.$loading({
              lock: true,
              text: this.completeEnabled ? '正在上传并补全笔记...' : '正在上传笔记...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            })
            
            // 上传笔记
            const response = await this.uploadNote(noteData)
            console.log('笔记上传成功:', response)

            // 从响应中提取笔记ID
            const noteId = response.id || response.note_id || (response.data && response.data.id)
            
            if (!noteId) {
              console.error('无法从响应中获取笔记ID:', response)
              throw new Error('笔记上传成功但未获取到笔记ID')
            }
            
            console.log('获取到笔记ID:', noteId)

            // 手动设置当前笔记
             console.log('setCurrentNote 是否可用:', typeof this.setCurrentNote === 'function')
            
            await this.setCurrentNote({
              id: noteId,
              title: this.noteForm.title,
              subject: this.noteForm.subject,
              // 其他必要字段...
            })


            if (this.completeEnabled){// 更新加载提示
              loading.text = '正在补全笔记，请耐心等待...'
              
              // 补全笔记
              const completedResponse = await this.completeNote()
              console.log('笔记补全成功:', completedResponse)
              
              this.completedNote = completedResponse.data || completedResponse
              this.dialogVisible = true
              
              this.$message.success('笔记上传并补全成功')
            }else{
              this.$message.success('笔记已成功提交')
            }
          } catch (error) {
            console.error('笔记处理失败:', error)

            // 计算处理时间
            const processingTime = Date.now() - this.processingStartTime
            const minutes = Math.floor(processingTime / 60000)
            const seconds = ((processingTime % 60000) / 1000).toFixed(0)
            
            // 根据错误类型显示不同提示
            if (error.code === 'ECONNABORTED') {
              this.$message({
                type: 'warning',
                message: `请求超时（${minutes}分${seconds}秒）。请检查网络连接或联系管理员。`,
                duration: 5000
              })
            } else {
              this.$message({
                type: 'error',
                message: error.message || '笔记处理失败',
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
      this.$refs.noteForm.resetFields()
    },
    
    saveNote() {
      // 保存笔记到本地或数据库
      this.$message({
        type: 'success',
        message: '笔记已保存'
      })
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>
.note-completion-upload {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}
.upload-card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.completed-content {
  line-height: 1.6;
  font-size: 16px;
  white-space: pre-wrap;
}
</style>