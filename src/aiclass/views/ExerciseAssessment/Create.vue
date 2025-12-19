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
        
        <!-- 新增：通过课程知识点创建功能 -->
        <el-form-item label="生成方式">
          <el-checkbox v-model="useKnowledgePoints" @change="handleKnowledgePointsToggle">
            通过课程知识点创建
          </el-checkbox>
        </el-form-item>
        
        <!-- 知识点选择区域 -->
        <div v-if="useKnowledgePoints" class="knowledge-points-section">
          <div v-if="loadingKnowledgePoints" class="loading-knowledge">
            <i class="el-icon-loading"></i> 加载知识点...
          </div>
          <div v-else-if="knowledgePoints.length === 0" class="no-knowledge">
            暂无知识点，请先创建课程知识点
          </div>
          <div v-else>
            <p class="knowledge-tip">请选择最多3个知识点：</p>
            <el-checkbox-group 
              v-model="selectedKnowledgePoints" 
              :max="3"
              @change="handleKnowledgePointsSelection"
            >
              <el-checkbox 
                v-for="point in knowledgePoints" 
                :label="point" 
                :key="point.display_id"
                class="knowledge-point-item"
              >
                {{ point.content }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        
        <el-form-item 
          label="题目内容" 
          prop="ai_content"
          :class="{ 'highlighted': useKnowledgePoints && selectedKnowledgePoints.length > 0 }"
        >
          <el-input
            type="textarea"
            v-model="aiForm.ai_content"
            :rows="6"
            :placeholder="useKnowledgePoints ? '选中的知识点内容将自动填充到这里' : '请输入用于AI生成习题的题目要求，例如：《静夜思》是唐代诗人李白创作的一首五言绝句...'"
            :readonly="useKnowledgePoints && selectedKnowledgePoints.length > 0"
          ></el-input>
          <div v-if="useKnowledgePoints && selectedKnowledgePoints.length > 0" class="knowledge-hint">
            <i class="el-icon-info"></i> 
            选中的知识点内容已自动填充，您可在此基础上修改
          </div>
        </el-form-item>
        
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
      courseDisplayId: this.$route.query.coursedisplayId || null, // 从路由参数获取课程ID
      
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
      
      // 新增知识点相关状态
      useKnowledgePoints: false,
      knowledgePoints: [],
      selectedKnowledgePoints: [],
      loadingKnowledgePoints: false,
      
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
          { required: true, message: '请输入题目内容', trigger: 'blur' }
        ]
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
      'setCurrentExercise',
      'fetchCourseDetail'
    ]),
    
    toggleAI(useAI) {
      this.useAI = useAI
      this.generatedExercise = null
      
      // 重置知识点相关状态
      if (!useAI) {
        this.useKnowledgePoints = false
        this.selectedKnowledgePoints = []
        this.knowledgePoints = []
      }
    },
    
    // 处理知识点选择切换
    async handleKnowledgePointsToggle(checked) {
      if (checked && this.courseDisplayId) {
        this.loadingKnowledgePoints = true
        try {
          const courseData = await this.fetchCourseDetail(this.courseDisplayId)
          
          // 从课程详情中提取知识点
          let knowledgePoints = []
          
          if (courseData && courseData.knowledge_list && Array.isArray(courseData.knowledge_list.points)) {
            knowledgePoints = courseData.knowledge_list.points
          } else if (courseData && Array.isArray(courseData.knowledge_list)) {
            knowledgePoints = courseData.knowledge_list
          } else if (courseData && Array.isArray(courseData)) {
            knowledgePoints = courseData
          }
          
          // 过滤掉无效的知识点
          knowledgePoints = knowledgePoints.filter(point => point && point.content)
          
          // 保存知识点数据
          this.knowledgePoints = knowledgePoints
          
          if (this.knowledgePoints.length === 0) {
            this.$message.warning('该课程暂无知识点，请先创建知识点')
          }
        } catch (error) {
          this.$message.error('获取知识点失败，请重试或联系管理员')
          this.knowledgePoints = []
        } finally {
          this.loadingKnowledgePoints = false
        }
      } else {
        // 取消勾选时清空选择
        this.selectedKnowledgePoints = []
      }
    },
    
    // 处理知识点选择
    handleKnowledgePointsSelection(selected) {
      if (selected.length > 0) {
        // 合并选中的知识点内容
        const content = selected.map(point => point.content).join('\n\n')
        this.aiForm.ai_content = content
      } else {
        this.aiForm.ai_content = ''
      }
    },
    
    // 添加获取学科标签的方法
    getSubjectLabel(value) {
      const subject = this.subjects.find(s => s.value === value)
      return subject ? subject.label : value
    },
    
    // 添加获取题型标签的方法
    getQuestionTypeLabel(value) {
      const type = this.questionTypes.find(t => t.value === value)
      return type ? type.label : value
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
            // 处理正确答案格式
            let correctAnswer = this.exerciseForm.correct_answer
            
            if (Array.isArray(correctAnswer) && correctAnswer.length > 0) {
              if (typeof correctAnswer[0] === 'number') {
                correctAnswer = correctAnswer
                  .map(index => this.exerciseForm.options[index])
                  .filter(answer => answer !== undefined)
              } else {
                correctAnswer = correctAnswer.join(',') // 多选题用逗号分隔
              }
            } else if (typeof correctAnswer === 'number') {
              correctAnswer = this.exerciseForm.options[correctAnswer] || ''
            }
            
            // 如果是单选题且只有一个答案，取第一个
            if (Array.isArray(correctAnswer) && correctAnswer.length === 1) {
              correctAnswer = correctAnswer[0]
            }
            
            const formData = {
              ...this.exerciseForm,
              correct_answer: correctAnswer,
              course_display_id: this.courseDisplayId ? parseInt(this.courseDisplayId) : null
            }
            
            // 确保course_display_id是必填字段
            if (!formData.course_display_id) {
              this.$message.error('课程ID缺失，请从课程页面进入')
              return
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
            const questionTypeLabel = this.getQuestionTypeLabel(this.aiForm.question_type)
            const difficultyLabel = this.difficultyLabels[this.aiForm.difficulty - 1]
            const autoRequirements = `生成一道${questionTypeLabel}，难度为${this.aiForm.difficulty}（${difficultyLabel}）`
            
            const aiData = {
              use_ai_generation: true,
              ...this.aiForm,
              ai_requirements: autoRequirements,
              // 新增：标记是否使用知识点创建
              use_knowledge_points: this.useKnowledgePoints,
              selected_knowledge_points: this.selectedKnowledgePoints.map(p => p.display_id),
              course_display_id: this.courseDisplayId ? parseInt(this.courseDisplayId) : null
            }
            
            // 确保course_display_id是必填字段
            if (!aiData.course_display_id) {
              this.$message.error('课程ID缺失，请从课程页面进入')
              return
            }
            
            // 调用API生成习题
            const result = await this.createExercise(aiData)
            
            // 安全检查
            if (!result || (!result.data && !result)) {
              throw new Error('AI生成的习题数据无效')
            }
            
            // 保存生成的习题结果
            this.generatedExercise = result.data || result
            
            this.$message({
              type: 'success',
              message: 'AI习题生成成功！'
            })
            
          } catch (error) {
            this.$message({
              type: 'error',
              message: error.message || 'AI习题生成失败'
            })
          }
        } else {
          this.$message({
            type: 'warning',
            message: '请完善所有必填信息'
          })
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
      this.generatedExercise = null
      
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
      
      // 重置知识点相关状态
      this.useKnowledgePoints = false
      this.selectedKnowledgePoints = []
      this.knowledgePoints = []
      
      // 清空生成结果
      this.generatedExercise = null
      
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
    }
  },
  
  async mounted() {
    // 如果是从课程页面跳转且是AI模式，尝试自动加载知识点
    if (this.courseDisplayId && this.useAI) {
      this.$nextTick(async () => {
        await this.handleKnowledgePointsToggle(this.useKnowledgePoints)
      })
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

/* 知识点选择区域样式 */
.knowledge-points-section {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
}

.knowledge-tip {
  margin-bottom: 10px;
  color: #606266;
  font-size: 14px;
}

.knowledge-point-item {
  display: block;
  margin: 8px 0;
  padding: 10px;
  border-radius: 4px;
  background-color: #fff;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.knowledge-point-item:hover {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.loading-knowledge, .no-knowledge {
  text-align: center;
  padding: 15px;
  color: #909399;
  font-size: 14px;
}

/* 题目内容输入框高亮样式 */
.highlighted {
  animation: highlight 1s ease;
}

@keyframes highlight {
  0% { background-color: #fffbe6; }
  100% { background-color: #fff; }
}

.knowledge-hint {
  margin-top: 8px;
  color: #e6a23c;
  font-size: 13px;
  display: flex;
  align-items: center;
}

.knowledge-hint i {
  margin-right: 5px;
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