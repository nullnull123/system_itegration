<template>
  <div class="smart-prep-detail">
    <h1 class="page-title">教案详情</h1>

    <!-- 加载成功并有数据时显示详情 -->
    <el-card class="detail-card" v-if="currentPrep && !loading">
      <div class="detail-header">
        <h2>{{ currentPrep.title }} ({{ currentPrep.subject }})</h2>
        <div class="header-actions">
          <!-- 添加 loading 状态到按钮 -->
          <el-button 
            type="primary" 
            @click="handleGenerateOptimizedLesson"
            :loading="isGenerating"
          >
            {{ isGenerating ? '生成中...' : '生成优化教案' }}
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
      <!-- 显示具体的错误信息 -->
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
        <el-button type="primary" @click="saveOptimizedLesson">保存</el-button>
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
      isGenerating: false, // 用于跟踪优化教案的生成状态
      showOptimizedDialog: false,
      optimizedLesson: {}
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
    'generateOptimizedLesson', 
    'saveLessonToServer']
    ),
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
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

        const result = await this.generateOptimizedLesson();
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

    async saveOptimizedLesson() {
      try {
        await this.saveLessonToServer(this.optimizedLesson);
        this.$message.success("优化教案已保存");
        this.showOptimizedDialog = false;
        // 可选：刷新当前教案信息
        this.fetchDetail(this.lessonDisplayId);
      } catch (err) {
        console.error("保存失败:", err);
        this.$message.error("保存失败：" + (err.message || "未知错误"));
      }
    },

    copyOptimizedContent() {
      const content = this.optimizedLesson.optimized_content;
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
      this.$router.push({ name: 'SmartPrepList' });
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
</style>