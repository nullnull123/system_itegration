<template>
  <div class="exercise-create">
    <h1 class="page-title">创建习题</h1>
    
    <!-- 切换按钮 -->
    <div class="toggle-buttons">
      <el-button 
        :type="!useAI ? 'primary' : 'default'" 
        @click="toggleAI(false)"
      >
        手动创建
      </el-button>
      <el-button 
        :type="useAI ? 'primary' : 'default'" 
        @click="toggleAI(true)"
      >
        AI生成
      </el-button>
    </div>
    
    <!-- 手动创建表单 -->
    <el-card class="create-card" v-if="!useAI">
      <h2>手动创建习题</h2>
      
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
          <el-button @click="resetManualForm">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 显示手动创建的习题结果 -->
      <div v-if="generatedExercise" class="generated-result">
        <el-divider>创建结果</el-divider>
        <el-card class="result-card">
          <h3>{{ generatedExercise.title }}</h3>
          <p><strong>学科：</strong>{{ getSubjectLabel(generatedExercise.subject) }}</p>
          <p><strong>年级：</strong>{{ generatedExercise.grade }}</p>
          <p><strong>题型：</strong>{{ getQuestionTypeLabel(generatedExercise.question_type) }}</p>
          <p><strong>难度：</strong>{{ difficultyLabels[generatedExercise.difficulty - 1] }}</p>
          <div class="question-content">
            <p><strong>题目：</strong></p>
            <div v-html="generatedExercise.question"></div>
          </div>
          <div v-if="generatedExercise.options && generatedExercise.options.length > 0" class="options-content">
            <p><strong>选项：</strong></p>
            <ul>
              <li v-for="(option, index) in generatedExercise.options" :key="index">
                {{ String.fromCharCode(65 + index) }}. {{ option }}
              </li>
            </ul>
          </div>
          <div class="answer-content">
            <p><strong>正确答案：</strong>{{ generatedExercise.correct_answer }}</p>
          </div>
          <div v-if="generatedExercise.explanation" class="explanation-content">
            <p><strong>解析：</strong>{{ generatedExercise.explanation }}</p>
          </div>
        </el-card>
      </div>

    </el-card>
    
    <!-- AI生成表单 -->


    <el-card class="create-card" v-else>
      <h2>AI生成习题</h2>
      
      <!-- 提示信息 -->
      <div class="ai-instructions">
        <el-alert
          title="AI生成说明"
          type="info"
          description="系统将根据您选择的学科、年级、题型和难度自动生成习题"
          show-icon
        >
        </el-alert>
      </div>
      
      <el-form 
        :model="aiForm" 
        :rules="aiRules" 
        ref="aiFormRef" 
        label-width="120px"
        v-loading="loading"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="aiForm.title" placeholder="请输入习题标题"></el-input>
        </el-form-item>
        
        <el-form-item label="学科" prop="subject">
          <el-select v-model="aiForm.subject" placeholder="请选择学科">
            <el-option
              v-for="subject in subjects"
              :key="subject.value"
              :label="subject.label"
              :value="subject.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="年级" prop="grade">
          <el-input v-model="aiForm.grade" placeholder="例如：小学一年级"></el-input>
        </el-form-item>
        
        <el-form-item label="题型" prop="question_type">
          <el-select v-model="aiForm.question_type" placeholder="请选择题型">
            <el-option
              v-for="type in questionTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="难度" prop="difficulty">
          <el-rate 
            v-model="aiForm.difficulty" 
            :max="3" 
            show-text 
            :texts="difficultyLabels"
          ></el-rate>
        </el-form-item>
        
        <el-form-item label="题目要求" prop="ai_content">
          <el-input
            type="textarea"
            v-model="aiForm.ai_content"
            :rows="6"
            placeholder="请输入用于AI生成习题的题目要求，例如：《静夜思》是唐代诗人李白创作的一首五言绝句..."
          ></el-input>
        </el-form-item>
        
        <!-- 删除原来的生成要求输入框 -->
        
        <el-form-item>
          <el-button 
            type="primary" 
            @click="submitAIForm"
          >
            AI生成习题
          </el-button>
          <el-button @click="resetAIForm">重置</el-button>
        </el-form-item>
      </el-form>
      
      <!-- 显示AI生成的习题结果 -->
      <div v-if="generatedExercise" class="generated-result">
        <el-divider>生成结果</el-divider>
        <el-card class="result-card">
          <h3>{{ generatedExercise.title }}</h3>
          <p><strong>学科：</strong>{{ getSubjectLabel(generatedExercise.subject) }}</p>
          <p><strong>年级：</strong>{{ generatedExercise.grade }}</p>
          <p><strong>题型：</strong>{{ getQuestionTypeLabel(generatedExercise.question_type) }}</p>
          <p><strong>难度：</strong>{{ difficultyLabels[generatedExercise.difficulty - 1] }}</p>
          <div class="question-content">
            <p><strong>题目：</strong></p>
            <div v-html="generatedExercise.question"></div>
          </div>
          <div v-if="generatedExercise.options && generatedExercise.options.length > 0" class="options-content">
            <p><strong>选项：</strong></p>
            <ul>
              <li v-for="(option, index) in generatedExercise.options" :key="index">
                {{ String.fromCharCode(65 + index) }}. {{ option }}
              </li>
            </ul>
          </div>
          <div class="answer-content">
            <p><strong>正确答案：</strong>{{ generatedExercise.correct_answer }}</p>
          </div>
          <div v-if="generatedExercise.explanation" class="explanation-content">
            <p><strong>解析：</strong>{{ generatedExercise.explanation }}</p>
          </div>
        </el-card>
      </div>
    </el-card>

  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'ExerciseCreatePage',
  data() {
    return {
      useAI: false, // false为手动创建，true为AI生成
      
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
      
      aiForm: {
        title: '',
        subject: '',
        grade: '',
        question_type: 'MCQ',
        difficulty: 2,
        ai_content: ''
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
      
      aiRules: {
        title: [
          { required: true, message: '请输入习题标题', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: '请选择学科', trigger: 'change' }
        ],
        grade: [
          { required: true, message: '请输入年级', trigger: 'blur' }
        ],
        question_type: [
          { required: true, message: '请选择题型', trigger: 'change' }
        ],
        ai_content: [
          { required: true, message: '请输入题目要求', trigger: 'blur' }
        ]
        // 删除ai_requirements的验证规则
      },

      // 添加用于存储生成结果的数据
      generatedExercise: null,
      
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
      'fetchList',
      'fetchDetail',
      'fetchSubmissions',
      'submitAnswer',
      'setCurrentExercise'
    ]),
    
    toggleAI(useAI) {
      this.useAI = useAI
      this.generatedExercise = null
    },
    
    // 添加获取学科标签的方法
    getSubjectLabel(value) {
      const subject = this.subjects.find(s => s.value === value);
      return subject ? subject.label : value;
    },
    
    // 添加获取题型标签的方法
    getQuestionTypeLabel(value) {
      const type = this.questionTypes.find(t => t.value === value);
      return type ? type.label : value;
    },
    
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
            // 处理正确答案格式 - 修正逻辑
            let correctAnswer = this.exerciseForm.correct_answer
            
            if (Array.isArray(correctAnswer) && correctAnswer.length > 0) {
              // 如果是数组索引，转换为实际的选项内容
              if (typeof correctAnswer[0] === 'number') {
                // 索引转换为实际选项内容
                correctAnswer = correctAnswer
                  .map(index => this.exerciseForm.options[index])
                  .filter(answer => answer !== undefined)
              } else {
                // 如果已经是选项内容，直接使用
                correctAnswer = correctAnswer.join(',') // 多选题用逗号分隔
              }
            } else if (typeof correctAnswer === 'number') {
              // 单个索引转换
              correctAnswer = this.exerciseForm.options[correctAnswer] || ''
            }
            
            // 如果是单选题且只有一个答案，取第一个
            if (Array.isArray(correctAnswer) && correctAnswer.length === 1) {
              correctAnswer = correctAnswer[0]
            }
            
            const formData = {
              ...this.exerciseForm,
              correct_answer: correctAnswer
            }
            
            await this.createExercise(formData)

            // 显示创建结果
            this.generatedExercise = {
              ...this.exerciseForm,
              correct_answer: correctAnswer
            }
            
            this.$message({
              type: 'success',
              message: '习题创建成功！'
            })
            
          } catch (error) {
            console.error('提交错误:', error)
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
    
    async submitAIForm() {
      this.$refs.aiFormRef.validate(async valid => {
        if (valid) {
          try {
            // 自动生成要求信息
            const questionTypeLabel = this.getQuestionTypeLabel(this.aiForm.question_type);
            const difficultyLabel = this.difficultyLabels[this.aiForm.difficulty - 1];
            const autoRequirements = `生成一道${questionTypeLabel}，难度为${this.aiForm.difficulty}（${difficultyLabel}）`;
            
            const aiData = {
              use_ai_generation: true,
              ...this.aiForm,
              ai_requirements: autoRequirements // 自动添加生成要求
            }
            
            console.log('=== AI生成数据 ===')
            console.log(aiData)
            
            // 调用API生成习题
            const result = await this.createExercise(aiData)
            
            // 保存生成的习题结果
            this.generatedExercise = result.data || result;
            
            this.$message({
              type: 'success',
              message: 'AI习题生成成功！'
            })
            
          } catch (error) {
            console.error('AI生成错误:', error)
            this.$message({
              type: 'error',
              message: error.message || 'AI习题生成失败'
            })
          }
        } else {
          this.$message({
            type: 'warning',
            message: '请完善所有必填信息'
          });
          return false
        }
      })
    },
    
    resetManualForm() {
      // 安全重置手动表单
      this.exerciseForm = {
        title: '',
        subject: '',
        grade: '',
        question_type: 'MCQ',
        difficulty: 2,
        question: '',
        options: ['', ''],
        correct_answer: []
      }

      // 清空生成结果
      this.generatedExercise = null;
      
      // 如果表单引用存在，则重置
      if (this.$refs.exerciseForm) {
        this.$nextTick(() => {
          this.$refs.exerciseForm.clearValidate()
        })
      }
    },
    
    resetAIForm() {
      // 安全重置AI表单
      this.aiForm = {
        title: '',
        subject: '',
        grade: '',
        question_type: 'MCQ',
        difficulty: 2,
        ai_content: ''
      }
      
      // 清空生成结果
      this.generatedExercise = null;
      
      // 如果表单引用存在，则重置
      if (this.$refs.aiFormRef) {
        this.$nextTick(() => {
          this.$refs.aiFormRef.clearValidate()
        })
      }
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
    },
    
    
  },
  
  mounted() {
    
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
.toggle-buttons {
  margin-bottom: 20px;
  text-align: center;
}
.toggle-buttons .el-button {
  margin: 0 10px;
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
.ai-instructions {
  margin-bottom: 20px;
}
.requirements-hint {
  margin-top: 5px;
  font-size: 12px;
}
/* 添加生成结果的样式 */
.generated-result {
  margin-top: 30px;
}

.result-card {
  background-color: #f9f9f9;
  border: 1px solid #ebeef5;
}

.result-card h3 {
  color: #333;
  margin-bottom: 15px;
}

.question-content,
.options-content,
.answer-content,
.explanation-content {
  margin: 15px 0;
}

.options-content ul {
  padding-left: 20px;
}

.options-content li {
  margin: 5px 0;
}
</style>