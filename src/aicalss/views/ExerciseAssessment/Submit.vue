<template>
  <div class="exercise-submit">
    <h1 class="page-title">提交答案</h1>
    
    <el-card class="submit-card" v-if="currentExercise">
      <div class="exercise-header">
        <h2>{{ currentExercise.title }} ({{ currentExercise.subject }})</h2>
        <div class="header-info">
          <span>年级: {{ currentExercise.grade }}</span>
          <span>题型: {{ getQuestionTypeLabel(currentExercise.question_type) }}</span>
          <span>难度: {{ getDifficultyLabel(currentExercise.difficulty) }}</span>
        </div>
      </div>
      
      <div class="exercise-content">
        <h3>问题</h3>
        <div class="question-content">{{ currentExercise.question }}</div>
        
        <h3 v-if="isMultipleChoice">选项</h3>
        <div v-if="isMultipleChoice" class="options">
          <div 
            v-for="(option, index) in currentExercise.options" 
            :key="index" 
            class="option-item"
          >
            <el-radio 
              v-if="!isMultipleChoice" 
              v-model="answerForm.answer" 
              :label="index"
            >
              {{ String.fromCharCode(65 + index) }}. {{ option }}
            </el-radio>
            <el-checkbox 
              v-else 
              v-model="answerForm.answer" 
              :label="index"
            >
              {{ String.fromCharCode(65 + index) }}. {{ option }}
            </el-checkbox>
          </div>
        </div>
        
        <h3 v-if="!isMultipleChoice">答案</h3>
        <div v-if="!isMultipleChoice" class="answer-input">
          <el-input 
            v-model="answerForm.answer" 
            placeholder="请输入答案"
          ></el-input>
        </div>
        
        <div class="submit-actions">
          <el-button type="primary" @click="submitAnswer">提交答案</el-button>
          <el-button @click="cancel">取消</el-button>
        </div>
      </div>
    </el-card>
    
    <el-card class="loading-card" v-else-if="loading">
      <el-spin></el-spin>
      <p>加载中...</p>
    </el-card>
    
    <el-card class="error-card" v-else>
      <p>习题加载失败，请重试。</p>
      <el-button type="primary" @click="fetchExercise">重试</el-button>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ExerciseSubmitPage',
  data() {
    return {
      exerciseId: this.$route.query.exerciseId,
      answerForm: {
        answer: ''
      }
    }
  },
  computed: {
    ...mapState('exercise', ['currentExercise', 'loading', 'error']),
    isMultipleChoice() {
      return ['MCQ', 'MAQ'].includes(this.currentExercise?.question_type)
    }
  },
  methods: {
    ...mapActions('exercise', ['fetchExercise', 'submitAnswer']),
    getQuestionTypeLabel(type) {
      const types = {
        'MCQ': '单选题',
        'MAQ': '多选题',
        'TF': '判断题',
        'FILL': '填空题',
        'SHORT': '简答题'
      }
      return types[type] || type
    },
    getDifficultyLabel(difficulty) {
      const labels = ['简单', '中等', '困难']
      return labels[difficulty - 1] || difficulty
    },
    async submitAnswer() {
      try {
        await this.submitAnswer({
          exercise_id: this.exerciseId,
          answer: this.answerForm.answer
        })
        
        this.$message({
          type: 'success',
          message: '答案提交成功！'
        })
        
        this.$router.push('/ExerciseAssessment/submissions')
      } catch (error) {
        this.$message({
          type: 'error',
          message: error.message || '答案提交失败'
        })
      }
    },
    cancel() {
      this.$router.go(-1)
    }
  },
  created() {
    this.fetchExercise(this.exerciseId)
  }
}
</script>

<style scoped>
.exercise-submit {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}
.submit-card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.exercise-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.header-info {
  display: flex;
  gap: 15px;
  margin-top: 10px;
  color: #666;
}
.exercise-content {
  line-height: 1.6;
}
.question-content {
  white-space: pre-wrap;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  margin-bottom: 20px;
}
.options {
  margin-bottom: 20px;
}
.option-item {
  margin: 8px 0;
}
.submit-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>