<template>
  <div class="exercise-detail">
    <div class="page-header">
      <h1 class="page-title">{{ isTeacherMode ? '编辑习题' : '习题详情' }}</h1>
      <!-- 只有当用户角色为 teacher 时显示编辑按钮 -->
      <el-button
        v-if="userRole === 'teacher' && !isTeacherMode"
        type="primary"
        size="small"
        @click="setEditMode"
        class="edit-button"
      >
        编辑习题
      </el-button>
    </div>

    <el-card class="detail-card" v-if="currentExercise && !loading" shadow="never">
      <!-- 编辑模式：标题 -->
      <div class="detail-header" v-if="isTeacherMode">
        <el-input
          v-model="editForm.title"
          placeholder="请输入习题标题"
          size="large"
          class="editable-title"
        ></el-input>
        <div class="header-info">
          <el-select v-model="editForm.subject" size="small" class="info-select">
            <el-option label="数学" value="math"></el-option>
            <el-option label="语文" value="chinese"></el-option>
            <el-option label="英语" value="english"></el-option>
            <el-option label="物理" value="physics"></el-option>
            <el-option label="化学" value="chemistry"></el-option>
            <el-option label="生物" value="biology"></el-option>
            <el-option label="历史" value="history"></el-option>
            <el-option label="地理" value="geography"></el-option>
            <el-option label="政治" value="politics"></el-option>
          </el-select>
          <el-input
            v-model="editForm.grade"
            placeholder="年级"
            size="small"
            class="info-input"
          ></el-input>
          <!-- 关键修改：禁用 question_type 选择 -->
          <el-select v-model="editForm.question_type" size="small" class="info-select" :disabled="true">
            <el-option label="单选题" value="MCQ"></el-option>
            <el-option label="多选题" value="MAQ"></el-option>
            <el-option label="判断题" value="TF"></el-option>
            <el-option label="填空题" value="FILL"></el-option>
            <el-option label="简答题" value="SHORT"></el-option>
          </el-select>
          <el-select v-model="editForm.difficulty" size="small" class="info-select">
            <el-option label="简单" :value="1"></el-option>
            <el-option label="中等" :value="2"></el-option>
            <el-option label="困难" :value="3"></el-option>
          </el-select>
        </div>
      </div>

      <!-- 只读模式：标题 -->
      <div class="detail-header" v-else>
        <h2>{{ currentExercise.title }}</h2>
        <div class="header-info">
          <el-tag size="small" type="primary">{{ getSubjectLabel(currentExercise.subject) }}</el-tag>
          <el-tag size="small" type="success">{{ getGradeLabel(currentExercise.grade) }}</el-tag>
          <el-tag size="small" type="warning">{{ getQuestionTypeLabel(currentExercise.question_type) }}</el-tag>
          <el-tag size="small" type="danger">{{ getDifficultyLabel(currentExercise.difficulty) }}</el-tag>
        </div>
      </div>

      <div class="detail-content">
        <!-- 编辑模式：问题描述 -->
        <div v-if="isTeacherMode">
          <h3>问题描述</h3>
          <el-input
            v-model="editForm.question"
            type="textarea"
            :rows="4"
            placeholder="请输入问题描述..."
            class="question-content-edit"
          ></el-input>
        </div>
        <!-- 只读模式：问题描述 -->
        <div v-else>
          <h3>问题描述</h3>
          <div class="question-content" v-html="formattedQuestion"></div>
        </div>

        <!-- 编辑模式：选项 -->
        <div v-if="isMultipleChoiceType && isTeacherMode" class="options-section">
          <h3>选项</h3>
          <div class="options-actions">
            <el-button @click="addOption" size="mini" icon="el-icon-plus">添加选项</el-button>
          </div>
          <div
            v-for="(option, index) in editForm.options"
            :key="index"
            class="option-edit-row"
          >
            <span class="option-letter">{{ String.fromCharCode(65 + index) }}.</span>
            <el-input
              v-model="editForm.options[index]"
              placeholder="选项内容"
              class="option-input"
              @input="updateCorrectAnswerOptions"
            ></el-input>
            <el-button
              v-if="editForm.options.length > 1"
              @click="removeOption(index)"
              size="mini"
              type="danger"
              icon="el-icon-minus"
              circle
            ></el-button>
          </div>
        </div>

        <!-- 只读模式：选项 -->
        <div v-else-if="isMultipleChoiceType && !isTeacherMode" class="options-section">
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

        <!-- 编辑模式：答案 -->
        <div v-if="isTeacherMode">
          <h3>正确答案</h3>
          <div v-if="isMultipleChoiceType" class="answer-edit-section">
            <el-select
              v-if="editForm.question_type === 'MCQ' || editForm.question_type === 'TF'"
              v-model="editForm.correct_answer"
              placeholder="请选择正确答案"
              class="answer-select"
            >
              <el-option
                v-for="(option, index) in editForm.options"
                :key="index"
                :label="`${String.fromCharCode(65 + index)}. ${option}`"
                :value="option"
              ></el-option>
            </el-select>
            <el-select
              v-else-if="editForm.question_type === 'MAQ'"
              v-model="editForm.correct_answer"
              placeholder="请选择正确答案"
              multiple
              filterable
              class="answer-select"
            >
              <el-option
                v-for="(option, index) in editForm.options"
                :key="index"
                :label="`${String.fromCharCode(65 + index)}. ${option}`"
                :value="option"
              ></el-option>
            </el-select>
          </div>
          <el-input
            v-else
            v-model="editForm.correct_answer"
            type="textarea"
            :rows="2"
            placeholder="请输入正确答案..."
            class="answer-input-edit"
          ></el-input>
        </div>

        <!-- 只读模式：答案输入 -->
        <div v-else-if="!isMultipleChoiceType" class="input-section">
          <h3>请输入答案</h3>
          <el-input
            v-model="userInputAnswer"
            type="textarea"
            :rows="4"
            placeholder="请输入你的答案..."
            class="answer-input"
          ></el-input>
        </div>

        <!-- 编辑模式：保存按钮 -->
        <div class="action-section" v-if="isTeacherMode">
          <el-button
            type="primary"
            @click="saveExercise"
            :loading="saving"
            size="large"
          >
            保存习题
          </el-button>
          <el-button
            @click="goToDetailMode"
            size="large"
          >
            取消
          </el-button>
        </div>

        <!-- 只读模式：提交按钮 -->
        <div class="action-section" v-else>
          <el-button
            type="primary"
            @click="goToSubmit"
            :disabled="!canSubmit"
            size="large"
          >
            提交答案
          </el-button>
        </div>

        <!-- 只读模式：AI反馈 -->
        <div v-if="submissionResult && !isTeacherMode" class="ai-feedback-section">
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
      submissionResult: null,
      isTeacherMode: false,
      editForm: {
        title: '',
        subject: '',
        grade: '',
        question_type: '', // 题型
        difficulty: 1,
        question: '',
        options: [],
        correct_answer: ''
      },
      saving: false,
      userRole: null // 存储用户角色
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
      // 从 editForm 或 currentExercise 获取题型
      const type = this.isTeacherMode ? this.editForm.question_type : this.currentExercise.question_type
      return ['MCQ', 'MAQ', 'TF'].includes(type)
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
      return this.userInputAnswer.trim() !== ''
    }
  },
  methods: {
    ...mapActions('exercise', ['fetchDetail', 'submitAnswer', 'updateExercise']),

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

    // --- 学生模式方法 ---
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

    // --- 教师模式方法 ---
    setEditMode() {
        this.isTeacherMode = true;
        // 将当前习题数据映射到编辑表单，保留原始题型
        if (this.currentExercise) {
            this.editForm = {
                title: this.currentExercise.title || '',
                subject: this.currentExercise.subject || 'math',
                grade: this.currentExercise.grade || '',
                question_type: this.currentExercise.question_type, // 保留原始题型，不可编辑
                difficulty: this.currentExercise.difficulty || 2,
                question: this.currentExercise.question || '',
                // 使用深拷贝避免直接修改原对象的响应式数组
                options: Array.isArray(this.currentExercise.options) ? [...this.currentExercise.options] : [],
                correct_answer: this.currentExercise.correct_answer || ''
            };
        }
    },

    // 添加选项
    addOption() {
        this.editForm.options.push('');
        this.updateCorrectAnswerOptions();
    },

    // 删除选项
    removeOption(index) {
        if (this.editForm.options.length > 1) {
            // 从答案中移除被删除的选项
            if (this.editForm.question_type === 'MAQ' && Array.isArray(this.editForm.correct_answer)) {
                const optionToRemove = this.editForm.options[index];
                this.editForm.correct_answer = this.editForm.correct_answer.filter(ans => ans !== optionToRemove);
            } else if (this.editForm.question_type !== 'MAQ' && this.editForm.correct_answer === this.editForm.options[index]) {
                this.editForm.correct_answer = '';
            }
            
            this.editForm.options.splice(index, 1);
            this.updateCorrectAnswerOptions();
        } else {
            this.$message.warning('至少需要保留一个选项');
        }
    },

    // 更新正确答案选项（当选项内容改变时自动更新下拉框）
    updateCorrectAnswerOptions() {
        // 对于多选题，确保正确答案数组中的选项仍然存在于选项列表中
        if (this.editForm.question_type === 'MAQ' && Array.isArray(this.editForm.correct_answer)) {
            // 过滤掉不在当前选项列表中的答案
            this.editForm.correct_answer = this.editForm.correct_answer.filter(answer => 
                this.editForm.options.includes(answer)
            );
        } else if (this.editForm.question_type !== 'MAQ' && this.editForm.correct_answer) {
            // 对于单选题，确保正确答案在选项列表中
            if (!this.editForm.options.includes(this.editForm.correct_answer)) {
                this.editForm.correct_answer = '';
            }
        }
    },

    async saveExercise() {
        if (!this.currentExercise || !this.currentExercise.display_id) {
            this.$message.error('题目数据不完整，无法保存');
            return;
        }

        this.saving = true;
        try {
            // 处理答案格式
            let processedCorrectAnswer = this.editForm.correct_answer;
            if (this.editForm.question_type === 'MAQ' && Array.isArray(this.editForm.correct_answer)) {
                processedCorrectAnswer = this.editForm.correct_answer.filter(ans => ans.trim() !== '');
            }

            const updateData = {
                ...this.editForm,
                correct_answer: processedCorrectAnswer,
                options: this.editForm.options.filter(opt => opt.trim() !== '') // 过滤空选项
                // question_type 不包含在 updateData 中，因为它是只读的
            };

            await this.updateExercise({
                display_id: this.currentExercise.display_id,
                data: updateData
            });

            this.$message.success('习题更新成功！');
            // 更新完成后，重新获取详情以刷新 currentExercise
            await this.fetchDetail(this.currentExercise.display_id);
            // 退出编辑模式，回到只读模式
            this.isTeacherMode = false;
        } catch (error) {
            console.error('保存习题失败:', error);
            const errorMsg = error.response?.data?.message || error.message || '保存失败，请重试';
            this.$message.error(errorMsg);
        } finally {
            this.saving = false;
        }
    },

    // 退出编辑模式，回到详情模式
    goToDetailMode() {
        this.isTeacherMode = false;
        this.clearSelections();
    },

    // --- 通用方法 ---
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
      this.submissionResult = null
      // 重置编辑表单
      this.editForm = {
        title: '',
        subject: '',
        grade: '',
        question_type: '',
        difficulty: 1,
        question: '',
        options: [],
        correct_answer: ''
      };
    }
  },
  created() {
    // 获取用户角色
    this.userRole = this.$route.query.role;
    
    // 默认进入详情模式（不是编辑模式）
    this.isTeacherMode = false;

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
    },
    // 监听 currentExercise 的变化，如果进入编辑模式，则设置编辑表单
    currentExercise: {
      handler(newExercise) {
        if (newExercise && this.isTeacherMode) {
          this.setEditMode();
        }
      },
      immediate: true
    },
    // 监听路由参数变化
    '$route.query.role': {
      handler(newRole) {
        this.userRole = newRole;
        // 不再根据角色自动切换模式，保持当前模式不变
      }
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
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

.edit-button {
  margin-left: 16px;
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

.editable-title {
  margin-bottom: 16px;
}

.header-info {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.info-select, .info-input {
  min-width: 100px;
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

.question-content-edit {
  margin: 16px 0 24px;
}

.question-content-edit ::v-deep .el-textarea__inner {
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  padding: 12px;
  font-size: 15px;
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

/* 编辑模式选项样式 */
.options-actions {
  margin-bottom: 10px;
}

.option-edit-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.option-input {
  flex: 1;
}

.answer-edit-section {
  margin-bottom: 20px;
}

.answer-select {
  width: 100%;
  margin-bottom: 10px;
}

.answer-input-edit {
  margin-bottom: 20px;
}

.answer-input-edit ::v-deep .el-textarea__inner {
  border-radius: 8px;
  border: 1px solid #cbd5e1;
  padding: 12px;
  font-size: 15px;
}

.action-section {
  margin: 28px 0;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 12px;
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

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .edit-button {
    align-self: flex-end;
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

  .header-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-select, .info-input {
    width: 100%;
  }

  .action-section {
    flex-direction: column;
  }

  .action-section .el-button {
    width: 100%;
  }

  .option-edit-row {
    flex-direction: column;
    align-items: stretch;
  }

  .option-letter {
    align-self: flex-start;
  }
}
</style>