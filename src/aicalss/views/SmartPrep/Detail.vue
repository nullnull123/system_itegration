<template>
  <div class="smart-prep-detail">
    <h1 class="page-title">教案详情</h1>
    
    <el-card class="detail-card" v-if="currentLesson">
      <div class="detail-header">
        <h2>{{ currentLesson.title }} ({{ currentLesson.subject }})</h2>
        <div class="header-actions">
          <el-button type="primary" @click="generateOptimizedLesson">生成优化教案</el-button>
        </div>
      </div>
      
      <div class="detail-content">
        <h3>原始教案</h3>
        <div class="original-content" v-html="formattedOriginalContent"></div>
        
        <h3 v-if="currentLesson.optimized_content">优化教案</h3>
        <div class="optimized-content" v-html="formattedOptimizedContent" v-if="currentLesson.optimized_content"></div>
        
        <div v-if="currentLesson.optimization_notes" class="optimization-notes">
          <h3>优化说明</h3>
          <p>{{ currentLesson.optimization_notes }}</p>
        </div>
      </div>
      
      <div class="detail-footer">
        <p>创建时间: {{ formatDate(currentLesson.created_at) }}</p>
        <p v-if="currentLesson.optimization_time">优化时间: {{ formatDate(currentLesson.optimization_time) }}</p>
      </div>
    </el-card>
    
    <el-card class="loading-card" v-else-if="loading">
      <el-spin></el-spin>
      <p>加载中...</p>
    </el-card>
    
    <el-card class="error-card" v-else>
      <p>教案加载失败，请重试。</p>
      <el-button type="primary" @click="fetchLessonDetail">重试</el-button>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'SmartPrepDetailPage',
  data() {
    return {
      lessonId: this.$route.params.id
    }
  },
  computed: {
    ...mapState('smartPrep', ['currentLesson', 'loading', 'error']),
    formattedOriginalContent() {
      if (!this.currentLesson) return ''
      return this.currentLesson.original_content.replace(/\n/g, '<br>')
    },
    formattedOptimizedContent() {
      if (!this.currentLesson || !this.currentLesson.optimized_content) return ''
      return this.currentLesson.optimized_content.replace(/\n/g, '<br>')
    }
  },
  methods: {
    ...mapActions('smartPrep', ['fetchLessonPlanDetail', 'generateOptimizedLesson']),
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    }
  },
  created() {
    this.fetchLessonDetail()
  },
  watch: {
    '$route.params.id'(newId) {
      this.lessonId = newId
      this.fetchLessonDetail()
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
</style>