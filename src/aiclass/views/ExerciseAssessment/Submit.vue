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
            <!-- 修正：根据题型正确使用 radio 或 checkbox -->
            <el-radio 
              v-if="currentExercise.question_type === 'MCQ'" 
              v-model="answerForm.answer" 
              :label="index"
              :key="'radio-'+index"
            >
              {{ String.fromCharCode(65 + index) }}. {{ option }}
            </el-radio>
            <el-checkbox 
              v-else-if="currentExercise.question_type === 'MAQ'" 
              v-model="answerForm.answer" 
              :label="index"
              :key="'checkbox-'+index"
            >
              {{ String.fromCharCode(65 + index) }}. {{ option }}
            </el-checkbox>
          </div>
        </div>
        
        <h3 v-if="!isMultipleChoice">答案</h3>
        <div v-if="!isMultipleChoice" class="answer-input">
          <el-input 
            v-model="answerForm.answer" 
            type="textarea"
            :rows="4"
            placeholder="请输入答案"
          ></el-input>
        </div>
        
        <div class="submit-actions">
          <el-button type="primary" @click="handleSubmitAnswer">提交答案</el-button>
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
      <el-button type="primary" @click="loadExercise">重试</el-button>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ExerciseSubmitPage',
  data() {
    return {
      // 移除 exerciseId 的初始化，改用 computed 属性
      answerForm: {
        answer: [] // 对于多选题，答案应该是数组
      }
    }
  },
  computed: {
    ...mapState('exercise', ['currentExercise', 'loading', 'error']),
    // 从路由参数中获取 displayId
    displayId() {
      return this.$route.params.displayId
    },
    isMultipleChoice() {
      return ['MCQ', 'MAQ'].includes(this.currentExercise?.question_type)
    }
  },
  methods: {
    ...mapActions('exercise', ['fetchDetail', 'submitAnswer']),
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
    // 重命名方法以避免与 Vuex action 冲突
    async handleSubmitAnswer() {
      try {
        // 处理答案格式
        let answerToSend = this.answerForm.answer;
        if (this.currentExercise?.question_type === 'MAQ' && Array.isArray(this.answerForm.answer)) {
          // 多选题答案转换为逗号分隔的字符串
          answerToSend = this.answerForm.answer.join(',');
        }
        
        await this.submitAnswer({
          exercise_id: this.displayId, // 使用 displayId
          answer: answerToSend
        })
        
        this.$message({
          type: 'success',
          message: '答案提交成功！'
        })
        
        // 提交成功后跳转到合适的页面
        this.$router.push('/ExerciseAssessment/list') // 或其他合适的路径
      } catch (error) {
        this.$message({
          type: 'error',
          message: error.message || '答案提交失败'
        })
      }
    },
    cancel() {
      this.$router.go(-1)
    },
    // 重新加载习题数据的方法
    async loadExercise() {
      if (this.displayId) {
        await this.fetchDetail(this.displayId)
      }
    }
  },
  // 在组件创建时加载数据
  async created() {
    await this.loadExercise()
  },
  // 监听路由参数变化
  watch: {
    '$route.params.displayId': {
      handler(newId, oldId) {
        if (newId && newId !== oldId) {
          this.loadExercise()
          // 重置表单
          this.answerForm.answer = this.currentExercise?.question_type === 'MAQ' ? [] : ''
        }
      },
      immediate: true
    }
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
  gap: 10px;
}
</style>