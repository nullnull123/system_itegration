<template>
  <div class="exercise-create">
    <h1 class="page-title">创建习题</h1>
    
    <el-card class="create-card">
      <h2>习题基本信息</h2>
      
      <el-form 
        :model="exerciseForm" 
        :rules="rules" 
        ref="exerciseForm" 
        label-width="120px"
        v-loading="loading"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="exerciseForm.title" placeholder="请输入习题标题"></el-input>
        </el-form-item>
        
        <el-form-item label="学科" prop="subject">
          <el-select v-model="exerciseForm.subject" placeholder="请选择学科">
            <el-option
              v-for="subject in subjects"
              :key="subject.value"
              :label="subject.label"
              :value="subject.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="年级" prop="grade">
          <el-input v-model="exerciseForm.grade" placeholder="例如：九年级"></el-input>
        </el-form-item>
        
        <el-form-item label="题型" prop="question_type">
          <el-select v-model="exerciseForm.question_type" placeholder="请选择题型">
            <el-option
              v-for="type in questionTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="难度" prop="difficulty">
          <el-rate v-model="exerciseForm.difficulty" :max="3" show-text :texts="difficultyLabels"></el-rate>
        </el-form-item>
        
        <el-form-item label="问题描述" prop="question">
          <el-input
            type="textarea"
            v-model="exerciseForm.question"
            :rows="5"
            placeholder="请输入问题描述"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="选项" prop="options" v-if="isMultipleChoice">
          <div v-for="(option, index) in exerciseForm.options" :key="index" class="option-item">
            <el-input 
              v-model="exerciseForm.options[index]" 
              placeholder="请输入选项"
              class="option-input"
            ></el-input>
            <el-button 
              type="danger" 
              icon="el-icon-delete" 
              circle 
              @click="removeOption(index)"
              v-if="exerciseForm.options.length > 2"
            ></el-button>
          </div>
          <el-button type="primary" icon="el-icon-plus" @click="addOption">添加选项</el-button>
        </el-form-item>
        
        <el-form-item label="正确答案" prop="correct_answer">
          <template v-if="isMultipleChoice">
            <el-checkbox-group v-model="exerciseForm.correct_answer">
              <el-checkbox 
                v-for="(option, index) in exerciseForm.options" 
                :label="index" 
                :key="index"
              >
                {{ String.fromCharCode(65 + index) }}. {{ option }}
              </el-checkbox>
            </el-checkbox-group>
          </template>
          <template v-else>
            <el-input 
              v-model="exerciseForm.correct_answer" 
              placeholder="请输入正确答案"
            ></el-input>
          </template>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm">创建习题</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'ExerciseCreatePage',
  data() {
    return {
      exerciseForm: {
        title: '',
        subject: '',
        grade: '',
        question_type: 'MCQ',
        difficulty: 2,
        question: '',
        options: ['', ''],
        correct_answer: []
      },
      rules: {
        title: [
          { required: true, message: '请输入习题标题', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: '请选择学科', trigger: 'change' }
        ],
        question_type: [
          { required: true, message: '请选择题型', trigger: 'change' }
        ],
        question: [
          { required: true, message: '请输入问题描述', trigger: 'blur' }
        ],
        correct_answer: [
          { required: true, message: '请输入正确答案', trigger: 'blur' }
        ]
      },
      difficultyLabels: ['简单', '中等', '困难']
    }
  },
  computed: {
    ...mapState('exercise', {
      loading: state => state.loading,
      error: state => state.error
    }),
    
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
    questionTypes() {
      return [
        { value: 'MCQ', label: '单选题' },
        { value: 'MAQ', label: '多选题' },
        { value: 'TF', label: '判断题' },
        { value: 'FILL', label: '填空题' },
        { value: 'SHORT', label: '简答题' }
      ]
    },
    isMultipleChoice() {
      return ['MCQ', 'MAQ'].includes(this.exerciseForm.question_type)
    }
  },
  methods: {
    ...mapActions('exercise', [
      'createExercise',
      'fetchExercises',
      'fetchExercise',
      'fetchSubmissions',
      'submitAnswer',
      'setCurrentExercise'
    ]),
    
    addOption() {
      this.exerciseForm.options.push('')
    },
    
    removeOption(index) {
      if (this.exerciseForm.options.length > 2) {
        this.exerciseForm.options.splice(index, 1)
        
        // 更新正确答案
        if (Array.isArray(this.exerciseForm.correct_answer)) {
          this.exerciseForm.correct_answer = this.exerciseForm.correct_answer
            .filter(answer => answer !== index)
            .map(answer => answer > index ? answer - 1 : answer)
        }
      }
    },
    
    async submitForm() {
      this.$refs.exerciseForm.validate(async valid => {
        if (valid) {
          try {
            // 处理正确答案格式
            let correctAnswer = this.exerciseForm.correct_answer
            if (Array.isArray(correctAnswer)) {
              // 将索引转换为字母
              correctAnswer = correctAnswer
                .sort()
                .map(index => String.fromCharCode(65 + index))
                .join('')
            }
            
            const formData = {
              ...this.exerciseForm,
              correct_answer: correctAnswer
            }
            
            await this.createExercise(formData)
            
            this.$message({
              type: 'success',
              message: '习题创建成功！'
            })
            
            // 重置表单
            this.resetForm()
          } catch (error) {
            this.$message({
              type: 'error',
              message: error.message || '习题创建失败'
            })
          }
        } else {
          return false
        }
      })
    },
    
    resetForm() {
      this.$refs.exerciseForm.resetFields()
      this.exerciseForm.options = ['', '']
      this.exerciseForm.correct_answer = []
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
.exercise-create {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}
.create-card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}
.option-input {
  flex: 1;
  margin-right: 10px;
}
</style>