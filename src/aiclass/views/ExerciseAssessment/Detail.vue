<template>
  <div class="exercise-detail">
    <h1 class="page-title">习题详情</h1>

    <!-- 加载成功并有数据时显示详情 -->
    <el-card class="detail-card" v-if="currentExercise && !loading">
      <div class="detail-header">
        <h2>{{ currentExercise.title }}</h2>
        <div class="header-info">
          <el-tag type="primary">{{ getSubjectLabel(currentExercise.subject) }}</el-tag>
          <el-tag type="success">{{ getGradeLabel(currentExercise.grade) }}</el-tag>
          <el-tag type="warning">{{ getQuestionTypeLabel(currentExercise.question_type) }}</el-tag>
          <el-tag type="danger">{{ getDifficultyLabel(currentExercise.difficulty) }}</el-tag>
        </div>
      </div>

      <div class="detail-content">
        <h3>问题描述</h3>
        <div class="question-content" v-html="formattedQuestion"></div>

        <!-- 选项 (如果是选择题) -->
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

          <!-- 判断题 -->
          <div v-else-if="currentExercise.question_type === 'TF'" class="options-list">
             <el-radio-group v-model="selectedTFOption">
                <el-radio :label="true">正确</el-radio>
                <el-radio :label="false">错误</el-radio>
             </el-radio-group>
          </div>
        </div>

        <!-- 填空题/简答题输入框 -->
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

        <!-- 提交答案按钮 -->
        <div class="action-section">
          <el-button
            type="primary"
            @click="goToSubmit"
            :disabled="!canSubmit"
          >
            提交答案
          </el-button>
        </div>
      </div>

      <div class="detail-footer">
        <p>创建时间: {{ formatDate(currentExercise.created_at) }}</p>
      </div>
    </el-card>

    <!-- 加载中状态 -->
    <el-card class="loading-card" v-else-if="loading">
      <div class="loading-content">
        <p>正在加载习题详情...</p>
      </div>
    </el-card>

    <!-- 错误或无数据状态 -->
    <el-card class="error-card" v-else>
      <p v-if="error">{{ error }}</p>
      <p v-else>未找到指定的习题。</p>
      <el-button type="primary" @click="retryFetch" icon="el-icon-refresh">重试</el-button>
      <el-button @click="goToList" icon="el-icon-arrow-left">返回列表</el-button>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ExerciseDetailPage',
  data() {
    return {
      selectedOption: null,       // 单选题选中项索引
      selectedOptions: [],        // 多选题选中项索引数组
      selectedTFOption: null,     // 判断题选中项 (true/false)
      userInputAnswer: '',        // 填空题/简答题答案
      parsedOptionsCache: null
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
      if (!this.currentExercise) {
        console.log('currentExercise 为空，返回空数组')
        return []
      }

      // 每次都重新计算，避免缓存问题
      console.log('重新解析选项，原始数据:', this.currentExercise.options)
      
      let options = []
      try {
        if (typeof this.currentExercise.options === 'string') {
          // 尝试解析JSON
          try {
            const parsed = JSON.parse(this.currentExercise.options)
            if (Array.isArray(parsed)) {
              options = parsed
              console.log('JSON解析成功:', options)
            } else {
              throw new Error('不是数组格式')
            }
          } catch (jsonError) {
            // 如果JSON解析失败，按逗号分割
            console.log('JSON解析失败，按逗号分割')
            options = this.currentExercise.options.split(',').map(opt => opt.trim()).filter(opt => opt)
          }
        } else if (Array.isArray(this.currentExercise.options)) {
          options = this.currentExercise.options
          console.log('已经是数组格式:', options)
        } else {
          console.warn('选项格式不支持:', typeof this.currentExercise.options)
          options = []
        }
        
        // 确保所有选项都是字符串且不为空
        options = options
          .map((opt, index) => {
            const strOpt = String(opt).trim()
            console.log(`选项[${index}]: "${opt}" -> "${strOpt}"`)
            return strOpt
          })
          .filter(opt => opt !== '')
          
        console.log('最终解析的选项:', options)
        return options
      } catch (e) {
        console.error("解析选项失败:", e)
        return []
      }
    },

    canSubmit() {
      if (!this.currentExercise) return false
      const type = this.currentExercise.question_type
      console.log('检查是否可以提交，类型:', type)
      
      if (type === 'MCQ') {
        const can = this.selectedOption !== null
        console.log('单选题是否可以提交:', can, '选中索引:', this.selectedOption)
        return can
      } else if (type === 'MAQ') {
        const can = this.selectedOptions.length > 0
        console.log('多选题是否可以提交:', can, '选中索引:', this.selectedOptions)
        return can
      } else if (type === 'TF') {
        const can = this.selectedTFOption !== null
        console.log('判断题是否可以提交:', can, '选中值:', this.selectedTFOption)
        return can
      } else {
        // 填空、简答等类型，允许提交（后端验证）
        console.log('填空/简答题，允许提交')
        return true
      }
    }
  },
  methods: {
    ...mapActions('exercise', ['fetchDetail', 'submitAnswer']),

    getSubjectLabel(subjectKey) {
      const subjects = {
        'math': '数学',
        'chinese': '语文',
        'english': '英语',
        'physics': '物理',
        'chemistry': '化学',
        'biology': '生物',
        'history': '历史',
        'geography': '地理',
        'politics': '政治'
      }
      return subjects[subjectKey] || subjectKey
    },

    getGradeLabel(gradeKey) {
      return gradeKey || '未指定'
    },

    getQuestionTypeLabel(typeKey) {
      const types = {
        'MCQ': '单选题',
        'MAQ': '多选题',
        'TF': '判断题',
        'FILL': '填空题',
        'SHORT': '简答题'
      }
      return types[typeKey] || typeKey
    },

    getDifficultyLabel(difficultyValue) {
      const labels = ['简单', '中等', '困难']
      const index = parseInt(difficultyValue, 10) - 1
      return labels[index] || `难度${difficultyValue}`
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },

    async goToSubmit() {
      console.log('=== 开始执行 goToSubmit ===')
      console.log('currentExercise:', JSON.parse(JSON.stringify(this.currentExercise)))
      
      if (!this.currentExercise) {
        console.error('currentExercise 为空')
        this.$message.error('题目数据不完整')
        return
      }
      
      console.log('display_id:', this.currentExercise.display_id)
      if (!this.currentExercise.display_id) {
        console.error('display_id 为空或未定义')
        this.$message.error('题目ID不存在，无法提交')
        return
      }

      // 构造要提交的答案 - 使用具体的值而不是索引
      let answerToSubmit = ''
      console.log('题目类型:', this.currentExercise.question_type)
      console.log('解析后的选项:', this.parsedOptions)
      
      if (this.currentExercise.question_type === 'MCQ') {
        console.log('处理单选题...')
        console.log('选中索引:', this.selectedOption)
        console.log('所有选项:', this.parsedOptions)
        
        if (this.selectedOption === null || this.selectedOption === undefined) {
          console.error('未选择选项')
          this.$message.error('请选择答案')
          return
        }
        
        if (this.selectedOption < 0 || this.selectedOption >= this.parsedOptions.length) {
          console.error('选项索引超出范围:', this.selectedOption, '选项总数:', this.parsedOptions.length)
          this.$message.error('选项索引无效')
          return
        }
        
        const selectedValue = this.parsedOptions[this.selectedOption]
        console.log('选中选项的值:', selectedValue, '类型:', typeof selectedValue)
        
        if (selectedValue === undefined || selectedValue === null || String(selectedValue).trim() === '') {
          console.error('选中的选项值为空或无效')
          this.$message.error('选中的选项无效')
          return
        }
        
        answerToSubmit = String(selectedValue).trim()
        console.log('单选题最终答案:', answerToSubmit, '类型:', typeof answerToSubmit)
        
      } else if (this.currentExercise.question_type === 'MAQ') {
        console.log('处理多选题...')
        console.log('选中索引数组:', this.selectedOptions)
        
        if (!Array.isArray(this.selectedOptions) || this.selectedOptions.length === 0) {
          console.error('未选择任何选项')
          this.$message.error('请至少选择一个答案')
          return
        }
        
        const validOptions = this.selectedOptions
          .filter(index => index >= 0 && index < this.parsedOptions.length)
          .sort((a, b) => a - b)
        
        if (validOptions.length === 0) {
          console.error('没有有效的选项被选中')
          this.$message.error('选择的选项无效')
          return
        }
        
        const selectedValues = validOptions.map(index => {
          const value = this.parsedOptions[index]
          console.log(`索引 ${index} 对应的选项值:`, value)
          return value
        })
        
        answerToSubmit = selectedValues
          .filter(value => value !== undefined && value !== null && String(value).trim() !== '')
          .map(value => String(value).trim())
          .join(',')
          
        console.log('多选题最终答案:', answerToSubmit)
        
        if (answerToSubmit === '') {
          console.error('多选题答案为空')
          this.$message.error('选择的选项无效')
          return
        }
        
      } else if (this.currentExercise.question_type === 'TF') {
        console.log('处理判断题...')
        console.log('判断选项:', this.selectedTFOption, '类型:', typeof this.selectedTFOption)
        
        if (this.selectedTFOption !== true && this.selectedTFOption !== false) {
          console.error('未选择判断选项或选项无效:', this.selectedTFOption)
          this.$message.error('请选择正确或错误')
          return
        }
        
        answerToSubmit = this.selectedTFOption === true ? '正确' : '错误'
        console.log('判断题最终答案:', answerToSubmit)
        
      } else {
        console.log('处理填空/简答题...')
        console.log('用户输入:', this.userInputAnswer)
        
        answerToSubmit = this.userInputAnswer ? String(this.userInputAnswer).trim() : ''
        console.log('填空/简答题最终答案:', answerToSubmit)
        
        // 注意：这里不强制要求必须填写，让后端验证
      }

      console.log('构造的最终答案:', answerToSubmit, '类型:', typeof answerToSubmit)

      // 构造提交的数据对象
      const submitData = {
        answer: answerToSubmit,
        display_id: this.currentExercise.display_id,
        question_type: this.currentExercise.question_type
      }

      console.log('准备提交的数据:', submitData)

      // 最终验证
      if (submitData.answer === undefined || submitData.answer === null) {
        console.error('提交的答案为undefined或null')
        this.$message.error('答案格式错误')
        return
      }

      try {
        console.log('开始提交答案...')
        const result = await this.submitAnswer(submitData)

        if (result.feedback == "回答正确！"){
          this.$message.success('回答正确！')
        }
        else{
          this.$message.error('回答错误！')
        }

        console.log('提交结果:', result)
      } catch (error) {
        console.error('提交失败:', error)
        this.$message.error('答案提交失败：' + (error.message || '请重试'))
      }
    },

    retryFetch() {
      const displayId = this.$route.params.display_id
      if (displayId) {
        console.log('重试获取习题详情，ID:', displayId)
        this.fetchDetail(displayId)
      }
    },

    goToList() {
      console.log('返回习题列表')
      this.$router.push('/ExerciseAssessment')
    },

    clearSelections() {
      console.log('清除选择状态')
      this.selectedOption = null
      this.selectedOptions = []
      this.selectedTFOption = null
      this.userInputAnswer = ''
      this.parsedOptionsCache = null
    }
  },
  created() {
    const displayId = this.$route.params.display_id
    console.log('组件创建，路由参数 display_id:', displayId)
    if (displayId) {
      this.fetchDetail(displayId)
    } else {
      console.error("路由中未找到 displayId 参数")
    }
  },
  watch: {
    '$route.params.display_id': {
      handler(newDisplayId) {
        console.log('路由参数变化，新的 display_id:', newDisplayId)
        if (newDisplayId) {
          this.clearSelections()
          this.fetchDetail(newDisplayId)
        }
      },
      immediate: true
    },
    currentExercise(newVal, oldVal) {
      console.log('currentExercise 变化:', oldVal, '->', newVal)
      if (newVal && newVal.display_id !== (oldVal ? oldVal.display_id : null)) {
        this.parsedOptionsCache = null
        this.clearSelections()
      }
    }
  }
}
</script>

<style scoped>
.exercise-detail {
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
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.detail-header h2 {
  margin: 0 0 10px 0;
}
.header-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.detail-content {
  line-height: 1.6;
}
.question-content {
  white-space: pre-wrap;
  margin-bottom: 20px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}
.options-section, .input-section {
  margin-bottom: 20px;
}
.options-section h3, .input-section h3 {
  margin-top: 0;
}
.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.option-item {
  display: flex;
  align-items: flex-start;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.2s;
}
.option-item:hover {
  background-color: #f0f0f0;
}
.option-letter {
  font-weight: bold;
  margin-right: 8px;
  min-width: 20px;
}
.option-text {
  flex: 1;
}
.answer-input {
  margin-top: 10px;
}
.action-section {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #eee;
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
</style>