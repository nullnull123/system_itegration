<template>
  <div class="exercise-detail">
    <h1 class="page-title">习题详情</h1>

    <el-card class="detail-card" v-if="currentExercise && !loading" shadow="never">
      <div class="detail-header">
        <h2>{{ currentExercise.title }}</h2>
        <div class="header-info">
          <el-tag size="small" type="primary">{{ getSubjectLabel(currentExercise.subject) }}</el-tag>
          <el-tag size="small" type="success">{{ getGradeLabel(currentExercise.grade) }}</el-tag>
          <el-tag size="small" type="warning">{{ getQuestionTypeLabel(currentExercise.question_type) }}</el-tag>
          <el-tag size="small" type="danger">{{ getDifficultyLabel(currentExercise.difficulty) }}</el-tag>
        </div>
      </div>

      <div class="detail-content">
        <h3>问题描述</h3>
        <div class="question-content" v-html="formattedQuestion"></div>

        <div v-if="isMultipleChoiceType" class="options-section">
          <h3>选项</h3>
          <el-radio-group v-model="selectedOption" v-if="currentExercise.question_type === 'MCQ'" class="options-list">
            <el-radio
              v-for="(option, index) in parsedOptions"
              :key="index"
              :label="index"
              class="option-item"
            >
              <span class="option-letter">{{ String.fromCharCode(65 + index) }}.</span>
              <span class="option-text">{{ option }}</span>
            </el-radio>
          </el-radio-group>

          <el-checkbox-group v-model="selectedOptions" v-else-if="currentExercise.question_type === 'MAQ'" class="options-list">
            <el-checkbox
              v-for="(option, index) in parsedOptions"
              :key="index"
              :label="index"
              class="option-item"
            >
              <span class="option-letter">{{ String.fromCharCode(65 + index) }}.</span>
              <span class="option-text">{{ option }}</span>
            </el-checkbox>
          </el-checkbox-group>

          <div v-else-if="currentExercise.question_type === 'TF'" class="options-list">
            <el-radio-group v-model="selectedTFOption">
              <el-radio :label="true">正确</el-radio>
              <el-radio :label="false">错误</el-radio>
            </el-radio-group>
          </div>
        </div>

        <div v-else class="input-section">
          <h3>请输入答案</h3>
          <el-input
            v-model="userInputAnswer"
            type="textarea"
            :rows="4"
            placeholder="请输入你的答案..."
            class="answer-input"
          ></el-input>
        </div>

        <div class="action-section">
          <el-button
            type="primary"
            @click="goToSubmit"
            :disabled="!canSubmit"
            size="large"
          >
            提交答案
          </el-button>
        </div>

        <div v-if="submissionResult" class="ai-feedback-section">
          <h3>AI 教师评价</h3>
          <el-card class="feedback-card" shadow="never">
            <div class="feedback-header">
              <div class="score-badge">
                得分：<strong>{{ submissionResult.score }}</strong> / 100
              </div>
              <el-tag :type="getScoreTagType(submissionResult.score)" size="medium">
                {{ getScoreLevel(submissionResult.score) }}
              </el-tag>
            </div>

            <div class="feedback-content">
              <h4>反馈意见</h4>
              <div class="feedback-text" v-html="formatFeedback(submissionResult.feedback)"></div>
            </div>

            <div class="feedback-meta">
              <p>提交时间：{{ formatDate(submissionResult.submitted_at) }}</p>
              <p>评分时间：{{ formatDate(submissionResult.graded_at) }}</p>
            </div>
          </el-card>
        </div>
      </div>

      <div class="detail-footer">
        <p>创建时间：{{ formatDate(currentExercise.created_at) }}</p>
      </div>
    </el-card>

    <el-card class="loading-card" v-else-if="loading" shadow="never">
      <div class="loading-content">
        <i class="el-icon-loading"></i>
        <p>正在加载习题详情...</p>
      </div>
    </el-card>

    <el-card class="error-card" v-else shadow="never">
      <p v-if="error">{{ error }}</p>
      <p v-else>未找到指定的习题。</p>
      <div class="error-actions">
        <el-button type="primary" @click="retryFetch" icon="el-icon-refresh">重试</el-button>
        <el-button @click="goToList" icon="el-icon-arrow-left">返回列表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ExerciseDetailPage',
  data() {
    return {
      selectedOption: null,
      selectedOptions: [],
      selectedTFOption: null,
      userInputAnswer: '',
      parsedOptionsCache: null,
      submissionResult: null
    }
  },
  computed: {
    ...mapState('exercise', ['currentExercise', 'loading', 'error']),

    formattedQuestion() {
      if (!this.currentExercise) return ''
      return this.currentExercise.question ? this.currentExercise.question.replace(/\n/g, '<br>') : ''
    },

    isMultipleChoiceType() {
      if (!this.currentExercise) return false
      return ['MCQ', 'MAQ', 'TF'].includes(this.currentExercise.question_type)
    },

    parsedOptions() {
      if (!this.currentExercise) return []
      let options = []
      try {
        if (typeof this.currentExercise.options === 'string') {
          try {
            const parsed = JSON.parse(this.currentExercise.options)
            if (Array.isArray(parsed)) options = parsed
            else throw new Error('不是数组')
          } catch {
            options = this.currentExercise.options.split(',').map(opt => opt.trim()).filter(opt => opt)
          }
        } else if (Array.isArray(this.currentExercise.options)) {
          options = this.currentExercise.options
        }
        options = options.map(opt => String(opt).trim()).filter(opt => opt !== '')
        return options
      } catch (e) {
        console.error("解析选项失败:", e)
        return []
      }
    },

    canSubmit() {
      if (!this.currentExercise) return false
      const type = this.currentExercise.question_type
      if (type === 'MCQ') return this.selectedOption !== null
      if (type === 'MAQ') return this.selectedOptions.length > 0
      if (type === 'TF') return this.selectedTFOption !== null
      return true
    }
  },
  methods: {
    ...mapActions('exercise', ['fetchDetail', 'submitAnswer']),

    getSubjectLabel(subjectKey) {
      const subjects = { 'math': '数学', 'chinese': '语文', 'english': '英语', 'physics': '物理', 'chemistry': '化学', 'biology': '生物', 'history': '历史', 'geography': '地理', 'politics': '政治' }
      return subjects[subjectKey] || subjectKey
    },

    getGradeLabel(gradeKey) {
      return gradeKey || '未指定'
    },

    getQuestionTypeLabel(typeKey) {
      const types = { 'MCQ': '单选题', 'MAQ': '多选题', 'TF': '判断题', 'FILL': '填空题', 'SHORT': '简答题' }
      return types[typeKey] || typeKey
    },

    getDifficultyLabel(difficultyValue) {
      const labels = ['简单', '中等', '困难']
      const index = parseInt(difficultyValue, 10) - 1
      return labels[index] || `难度${difficultyValue}`
    },

    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString()
    },

    getScoreLevel(score) {
      if (score >= 80) return '优秀'
      if (score >= 60) return '良好'
      return '需改进'
    },

    getScoreTagType(score) {
      if (score >= 80) return 'success'
      if (score >= 60) return 'warning'
      return 'danger'
    },

    formatFeedback(feedback) {
      if (!feedback) return ''
      return feedback
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    },

    async goToSubmit() {
      if (!this.currentExercise || !this.currentExercise.display_id) {
        this.$message.error('题目数据不完整，无法提交');
        return;
      }

      let answerToSubmit = '';
      const type = this.currentExercise.question_type;

      if (type === 'MCQ') {
        if (this.selectedOption === null || this.selectedOption >= this.parsedOptions.length) {
          this.$message.error('请选择有效答案');
          return;
        }
        answerToSubmit = String(this.parsedOptions[this.selectedOption]).trim();
      } else if (type === 'MAQ') {
        if (this.selectedOptions.length === 0) {
          this.$message.error('请至少选择一个答案');
          return;
        }
        answerToSubmit = this.selectedOptions
          .filter(i => i >= 0 && i < this.parsedOptions.length)
          .map(i => String(this.parsedOptions[i]).trim())
          .join(',');
      } else if (type === 'TF') {
        if (this.selectedTFOption !== true && this.selectedTFOption !== false) {
          this.$message.error('请选择正确或错误');
          return;
        }
        answerToSubmit = this.selectedTFOption ? '正确' : '错误';
      } else {
        answerToSubmit = this.userInputAnswer.trim();
      }

      try {
        const result = await this.submitAnswer({
          display_id: this.currentExercise.display_id,
          data: { answer: answerToSubmit }
        });

        this.submissionResult = result;

        if (result.status === 'success') {
          this.$message.success(result.message || '提交成功');
        } else {
          this.$message.warning(result.message || '提交完成');
        }
      } catch (error) {
        console.error('提交失败:', error);
        const errorMsg = error.response?.data?.message || error.message || '提交失败，请重试';
        this.$message.error(errorMsg);
      }
    },

    retryFetch() {
      const displayId = this.$route.params.display_id
      if (displayId) this.fetchDetail(displayId)
    },

    goToList() {
      this.$router.push({ name: 'ExerciseList' })
    },

    clearSelections() {
      this.selectedOption = null
      this.selectedOptions = []
      this.selectedTFOption = null
      this.userInputAnswer = ''
      this.parsedOptionsCache = null
      this.submissionResult = null
    }
  },
  created() {
    const displayId = this.$route.params.display_id
    if (displayId) this.fetchDetail(displayId)
  },
  watch: {
    '$route.params.display_id': {
      handler(newDisplayId) {
        if (newDisplayId) {
          this.clearSelections()
          this.fetchDetail(newDisplayId)
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.exercise-detail {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
  background-color: #f8fafc;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
}

.page-title::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 24px;
  background: linear-gradient(to bottom, #3b82f6, #1d4ed8);
  margin-right: 12px;
  border-radius: 2px;
}

.detail-card {
  border-radius: 12px;
  background: #ffffff;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.detail-header h2 {
  font-size: 22px;
  color: #1e293b;
  margin: 0 0 16px 0;
  font-weight: 600;
}

.header-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-content {
  line-height: 1.6;
  color: #334155;
}

.question-content {
  white-space: pre-wrap;
  margin: 16px 0 24px;
  padding: 16px;
  background: #f1f5f9;
  border-radius: 8px;
  font-size: 15px;
  border-left: 3px solid #3b82f6;
}

.options-section,
.input-section {
  margin-bottom: 24px;
}

.options-section h3,
.input-section h3 {
  font-size: 18px;
  margin: 0 0 16px;
  color: #334155;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: 10px 14px;
  border-radius: 8px;
  transition: background-color 0.2s;
  background: #f8fafc;
}

.option-item:hover {
  background-color: #edf2ff;
}

.option-letter {
  font-weight: bold;
  margin-right: 10px;
  min-width: 24px;
  color: #1e40af;
}

.answer-input ::v-deep .el-textarea__inner {
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  padding: 12px;
  font-size: 15px;
}

.action-section {
  margin: 28px 0;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.ai-feedback-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px dashed #cbd5e1;
}

.ai-feedback-section h3 {
  color: #1d4ed8;
  margin-bottom: 18px;
  font-size: 20px;
}

.feedback-card {
  background: #f0f9ff;
  border-radius: 10px;
  padding: 20px;
  border: 1px solid #bae6fd;
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  flex-wrap: wrap;
  gap: 10px;
}

.score-badge {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.feedback-content h4 {
  margin: 0 0 12px 0;
  color: #334155;
  font-size: 16px;
}

.feedback-text {
  line-height: 1.7;
  white-space: pre-wrap;
  background: #ffffff;
  padding: 14px;
  border-radius: 8px;
  border-left: 4px solid #0ea5e9;
  font-size: 15px;
  color: #334155;
}

.feedback-meta {
  margin-top: 18px;
  padding-top: 14px;
  border-top: 1px solid #bae6fd;
  color: #64748b;
  font-size: 14px;
}

.feedback-meta p {
  margin: 4px 0;
}

.detail-footer {
  margin-top: 28px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 14px;
}

.loading-card,
.error-card {
  text-align: center;
  padding: 40px 20px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e2e8f0;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #64748b;
}

.error-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 响应式 */
@media (max-width: 768px) {
  .exercise-detail {
    padding: 16px;
  }

  .detail-card {
    padding: 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .question-content,
  .feedback-text {
    font-size: 14px;
  }

  .error-actions {
    flex-direction: column;
    gap: 10px;
  }

  .error-actions .el-button {
    width: 100%;
  }
}
</style>