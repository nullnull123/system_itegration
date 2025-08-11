<template>
  <div class="note-completion-detail">
    <h1 class="page-title">笔记详情</h1>
    
    <el-card class="detail-card" v-if="currentNote">
      <div class="detail-header">
        <h2>{{ currentNote.title }} ({{ currentNote.subject }})</h2>
        <div class="header-actions">
          <el-button type="primary" @click="completeNote">补全笔记</el-button>
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
    
    <el-card class="loading-card" v-else-if="loading">
      <el-spin></el-spin>
      <p>加载中...</p>
    </el-card>
    
    <el-card class="error-card" v-else>
      <p>笔记加载失败，请重试。</p>
      <el-button type="primary" @click="fetchNoteDetail">重试</el-button>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'NoteCompletionDetailPage',
  data() {
    return {
      noteId: this.$route.params.id
    }
  },
  computed: {
    ...mapState('noteCompletion', ['currentNote', 'loading', 'error']),
    formattedOriginalContent() {
      if (!this.currentNote) return ''
      return this.currentNote.original_content.replace(/\n/g, '<br>')
    },
    formattedCompletedContent() {
      if (!this.currentNote || !this.currentNote.completed_content) return ''
      return this.currentNote.completed_content.replace(/\n/g, '<br>')
    }
  },
  methods: {
    ...mapActions('noteCompletion', ['fetchNoteDetail', 'completeNote']),
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    }
  },
  created() {
    this.fetchNoteDetail()
  },
  watch: {
    '$route.params.id'(newId) {
      this.noteId = newId
      this.fetchNoteDetail()
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
</style>