<template>
  <div class="lesson-plan-create">
    <h1 class="page-title">教案管理系统</h1>

    <el-card class="create-card">
      <h2>创建新教案</h2>

      <!-- 新增：显示关联课程信息 -->
      <div v-if="courseDisplayId" class="course-info">
        <el-alert
          type="success"
          :closable="false"
          show-icon
        >
          当前教案将关联到课程: <strong>{{ courseName || '加载中...' }}</strong> (ID: {{ courseDisplayId }})
        </el-alert>
      </div>

      <el-form
        :model="lessonForm"
        :rules="rules"
        ref="lessonForm"
        label-width="120px"
        :disabled="vuexLoading"
      >
        <el-form-item prop="title">
          <label for="lesson-title" class="el-form-item__label">教案标题</label>
          <div class="el-form-item__content">
            <el-input
              id="lesson-title"
              v-model="lessonForm.title"
              placeholder="请输入教案标题"
              clearable
            ></el-input>
          </div>
        </el-form-item>

        <el-form-item prop="subject">
          <label for="lesson-subject" class="el-form-item__label">学科</label>
          <div class="el-form-item__content">
            <el-select
              id="lesson-subject"
              v-model="lessonForm.subject"
              placeholder="请选择学科"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="subject in subjects"
                :key="subject.value"
                :label="subject.label"
                :value="subject.value">
              </el-option>
            </el-select>
          </div>
        </el-form-item>

        <el-form-item prop="grade">
          <label for="lesson-grade" class="el-form-item__label">年级</label>
          <div class="el-form-item__content">
            <el-input
              id="lesson-grade"
              v-model="lessonForm.grade"
              placeholder="例如：九年级"
              clearable
            ></el-input>
          </div>
        </el-form-item>

        <el-form-item prop="lesson_number">
          <label for="lesson-number" class="el-form-item__label">第几次课</label>
          <div class="el-form-item__content">
            <el-input-number
              id="lesson-number"
              v-model="lessonForm.lesson_number"
              :min="1"
              :max="100"
              placeholder="请输入这是第几次课"
            ></el-input-number>
          </div>
        </el-form-item>

        <el-form-item prop="duration">
          <label for="lesson-duration" class="el-form-item__label">时长(分钟)</label>
          <div class="el-form-item__content">
            <el-input-number
              id="lesson-duration"
              v-model="lessonForm.duration"
              :min="1"
              :max="240"
              placeholder="请输入教案时长，单位分钟"
            ></el-input-number>
          </div>
        </el-form-item>

        <!-- 隐藏课程ID输入，但保留用于提交 -->
        <input type="hidden" v-model.number="lessonForm.course_display_id">

        <el-form-item prop="original_content">
          <label for="lesson-content" class="el-form-item__label">教案内容</label>
          <div class="el-form-item__content">
            <el-input
              id="lesson-content"
              type="textarea"
              v-model="lessonForm.original_content"
              :rows="15"
              placeholder="请输入教案内容"
              :autosize="{ minRows: 5, maxRows: 15 }"
            ></el-input>
            <div class="content-hint">
              <small>支持Markdown格式，可使用#标题、**加粗**、*斜体*等语法</small>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="optimizeEnabled">
            创建后自动生成优化版教案（约需1-2分钟）并覆盖原始内容
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm"
            :loading="vuexLoading || processing || optimizing"
            :disabled="vuexLoading || processing || optimizing"
          >
            <span v-if="!vuexLoading && !processing && !optimizing">创建教案</span>
            <span v-else>处理中...</span>
          </el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 添加处理进度提示 -->
      <div v-if="processing" class="processing-info">
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <div>
            <span>教案正在创建中，请耐心等待...</span>
          </div>
        </el-alert>
      </div>

      <!-- 优化进度提示 -->
      <div v-if="optimizing" class="optimizing-info">
        <el-alert
          type="warning"
          :closable="false"
          show-icon
        >
          <div>
            <span>正在生成优化版教案并覆盖原始内容，请耐心等待...</span>
            <br>
            <span class="estimated-time">（预计需要1-2分钟）</span>
          </div>
        </el-alert>
      </div>

    </el-card>

    <!-- 保存成功提示对话框 -->
    <el-dialog
      title="创建成功"
      :visible.sync="createSuccessDialog"
      width="30%"
    >
      <p v-if="!optimizeEnabled || !optimizedLesson">
        教案 "{{ createdLessonTitle }}" 已成功创建！
      </p>
      <p v-else>
        教案 "{{ createdLessonTitle }}" 已成功创建并优化！原始内容已被优化内容覆盖。
      </p>
      <div class="save-options">
        <!-- 修正点：使用完整路径 -->
        <router-link :to="{ name: 'LessonplanList' }">
          <el-button type="primary">查看教案列表</el-button>
        </router-link>
        <el-button @click="resetFormAndClose">继续创建新教案</el-button>
      </div>
    </el-dialog>

    <!-- === 修正：提示词编辑对话框 === -->
    <el-dialog
      title="编辑优化提示词"
      :visible.sync="promptPreviewDialogVisible"
      width="70%"
      top="5vh"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div>
        <p>请检查并编辑优化提示词。此提示词将用于生成优化版教案：</p>
        <el-input
          type="textarea"
          v-model="promptContent"
          :rows="20"
          :autosize="{ minRows: 10, maxRows: 25 }"
          style="margin-bottom: 10px;"
        ></el-input>
        <div class="prompt-hint">
          <small>提示：您可以调整教学重点、修改知识点描述或添加特定要求</small>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="promptPreviewDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="OptimizedLesson"
          :loading="promptLoading"
        >
          确认并生成优化教案
        </el-button>
      </span>
    </el-dialog>

    <!-- === 修正：优化成功提示对话框 === -->
    <el-dialog
      title="优化成功"
      :visible.sync="optimizationSuccessDialog"
      width="30%"
    >
      <p>教案 "{{ optimizedLessonTitle }}" 已成功优化！原始内容已被覆盖。</p>
      <div class="save-options">
        <router-link :to="{ name: 'LessonplanList' }">
          <el-button type="primary">查看教案列表</el-button>
        </router-link>
        <el-button @click="showOptimizationResult">查看优化内容与建议</el-button>
      </div>
    </el-dialog>

    <!-- === 新增：展示优化结果对话框 === -->
    <el-dialog
      title="优化结果"
      :visible.sync="showOptimizationResultDialog"
      width="80%"
      top="5vh"
    >
      <div v-if="optimizationResult">
        <h3>优化后教案内容</h3>
        <el-input
          type="textarea"
          :value="optimizationResult.lesson_plan.original_content"
          :rows="15"
          :autosize="{ minRows: 10, maxRows: 20 }"
          readonly
        ></el-input>

        <h3 style="margin-top: 20px;">教学建议</h3>
        <div>
          <h4>讲授性部分</h4>
          <el-input
            type="textarea"
            :value="optimizationResult.teaching_suggestion.lecture_suggestions"
            :rows="6"
            readonly
          ></el-input>

          <h4 style="margin-top: 10px;">吸引学生兴趣部分</h4>
          <el-input
            type="textarea"
            :value="optimizationResult.teaching_suggestion.engagement_suggestions"
            :rows="6"
            readonly
          ></el-input>

          <h4 style="margin-top: 10px;">教师提升部分</h4>
          <el-input
            type="textarea"
            :value="optimizationResult.teaching_suggestion.teacher_resources"
            :rows="6"
            readonly
          ></el-input>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showOptimizationResultDialog = false">关闭</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'LessonplanUpload', // 与路由配置完全一致的名称

  data() {
    return {
      lessonForm: {
        title: '',
        subject: '',
        grade: '',
        lesson_number: 1,
        duration: 45,
        course_display_id: null,
        original_content: ''
      },
      subjects: [
        { value: 'math', label: '数学' },
        { value: 'chinese', label: '语文' },
        { value: 'english', label: '英语' },
        { value: 'physics', label: '物理' },
        { value: 'chemistry', label: '化学' },
        { value: 'biology', label: '生物' },
        { value: 'history', label: '历史' },
        { value: 'geography', label: '地理' },
        { value: 'politics', label: '政治' }
      ],
      optimizeEnabled: false,
      createSuccessDialog: false,
      processing: false,
      optimizing: false,
      createdLessonTitle: '',
      optimizedLesson: null,
      // 新增：用于控制优化内容对话框的显示与内容
      showOptimizedContentDialog: false,
      optimizedContentToShow: '',
      // 新增：课程ID和名称
      courseDisplayId: null,
      courseName: '',

      // === 修正：两步式优化流程相关状态 ===
      promptPreviewDialogVisible: false, // 控制提示词编辑对话框显示
      promptContent: '', // 存储可编辑的提示词内容
      promptLoading: false, // 提示词对话框中的加载状态
      optimizationSuccessDialog: false, // 优化成功提示对话框
      optimizedLessonTitle: '', // 用于显示成功消息的教案标题
      currentDisplayId: null, // 当前正在处理的教案display_id

      // === 新增：展示优化结果相关状态 ===
      showOptimizationResultDialog: false, // 控制优化结果对话框显示
      optimizationResult: null // 存储完整的优化结果数据
    }
  },
  computed: {
    ...mapState('smartPrep', {
      vuexLoading: state => state.loading, // 修正：使用别名避免冲突
      error: state => state.error,
    }),
    rules() {
      return {
        title: [
          { required: true, message: '请输入教案标题', trigger: 'blur' },
          { min: 2, message: '教案标题至少需要2个字符', trigger: 'blur' },
          { max: 255, message: '教案标题不能超过255个字符', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: '请选择学科', trigger: 'change' }
        ],
        lesson_number: [
          { required: true, message: '请输入第几次课', trigger: 'blur' },
          { type: 'number', min: 1, message: '第几次课必须是大于0的数字', trigger: 'blur' }
        ],
        original_content: [
          { required: true, message: '请输入教案内容', trigger: 'blur' },
          { min: 10, message: '教案内容至少需要10个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    ...mapActions('smartPrep', [
      'createLessonPlan',
      'fetchOptimizationPrompt',
      'applyOptimizedLesson' // Vuex action 需要能处理 POST 请求和 custom_prompt
    ]),

    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleString()
    },

    async submitForm() {
      this.$refs.lessonForm.validate(async valid => {
        if (valid) {
          this.processing = true;

          try {
            const lessonData = {
              title: this.lessonForm.title,
              subject: this.lessonForm.subject,
              grade: this.lessonForm.grade,
              lesson_number: this.lessonForm.lesson_number,
              duration: this.lessonForm.duration,
              original_content: this.lessonForm.original_content,
              // 仅当course_display_id存在且有效时才包含
              ...(this.lessonForm.course_display_id && this.lessonForm.course_display_id > 0 && {
                course_display_id: this.lessonForm.course_display_id
              })
            }

            // 显示处理提示
            const loading = this.$loading({
              lock: true,
              text: '正在创建教案...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            })

            // 创建教案
            const response = await this.createLessonPlan(lessonData)

            // 获取并保存教案名用于提示
            this.createdLessonTitle = response.title || response.data?.title || this.lessonForm.title

            // 如果用户选择生成优化版教案
            if (this.optimizeEnabled) {
              this.processing = false;
              loading.close();

              try {
                // 从响应中获取 display_id
                const responseData = response;
                let displayId = responseData?.display_id ||
                               responseData?.id ||
                               responseData?.data?.id;

                if (!displayId) {
                  console.error('API响应中未找到 display_id 或其他ID字段:', responseData);
                  throw new Error('无法从API响应中获取教案 display_id。响应结构: ' + JSON.stringify(responseData, null, 2));
                }

                this.currentDisplayId = displayId;

                // === 修正：使用POST方法获取提示词 ===
                const promptData = await this.fetchOptimizationPrompt({ display_id: displayId });

                // 修正：正确检查返回数据结构
                if (promptData && promptData.data && promptData.data.prompt) {
                  this.promptContent = promptData.data.prompt;
                  this.promptPreviewDialogVisible = true; // 显示编辑对话框
                } else {
                  throw new Error('获取的提示词格式不正确');
                }
              } catch (promptError) {
                // 即使提示词获取失败，也显示警告但不中断流程
                this.$message({
                  type: 'warning',
                  message: promptError.message || '教案优化提示词获取失败，但原始教案已保存',
                  duration: 5000
                });

                // 显示创建成功对话框
                this.createSuccessDialog = true;
              }
            } else {
              this.optimizedLesson = null;
              this.$message({
                type: 'success',
                message: '教案创建成功！',
                duration: 3000
              });
              this.createSuccessDialog = true;
            }

          } catch (error) {
            console.error('教案创建失败:', error)
            this.$message({
              type: 'error',
              message: error.message || '教案创建失败',
              duration: 3000
            })
          } finally {
            this.processing = false;
            // 确保关闭所有加载提示
            if (this.$loading) {
              try {
                this.$loading().close();
              } catch(e) { /* ignore */ }
            }
          }
        } else {
          this.$message.warning('请检查表单中的错误');
        }
      })
    },

    // === 修正：优化教案 (Vuex action 应处理 POST 和 custom_prompt) ===
    async OptimizedLesson() {
      if (!this.currentDisplayId || !this.promptContent) {
        this.$message.warning('缺少必要参数');
        return;
      }

      this.promptLoading = true;
      try {
        console.log('[Frontend] 调用 Vuex action applyOptimizedLesson...');
        // 调用API应用优化 - Vuex action 需要接收 display_id, custom_prompt, overwrite
        const resultFromAction = await this.applyOptimizedLesson({
          display_id: this.currentDisplayId,
          custom_prompt: this.promptContent
        });
        console.log('[Frontend] Vuex action 返回结果 (resultFromAction):', resultFromAction); // 添加日志

        // --- 添加防御性检查 ---
        if (!resultFromAction) {
          console.error('[Frontend] Vuex action applyOptimizedLesson 返回了 undefined 或 null');
          this.$message.error('教案优化失败：API 未返回有效数据');
          return;
        }

        // 保存完整结果
        this.optimizationResult = resultFromAction; // 使用 resultFromAction

        // 更新表单内容以显示优化后的内容 (可选)
        // this.lessonForm.original_content = resultFromAction.lesson_plan.original_content; // 如果需要
        this.optimizedLessonTitle = this.createdLessonTitle;

        // --- 添加防御性检查 ---
        if (!resultFromAction.lesson_plan) {
          console.error('[Frontend] 返回的数据中缺少 lesson_plan 字段:', resultFromAction);
          this.$message.error('教案优化失败：API 返回数据格式错误 (缺少 lesson_plan)');
          return;
        }

        this.optimizedLesson = resultFromAction.lesson_plan; // 从 resultFromAction 获取

        // 关闭提示词编辑对话框
        this.promptPreviewDialogVisible = false;

        // 显示优化成功提示
        this.optimizationSuccessDialog = true;

        this.$message({
          type: 'success',
          message: '教案优化成功！原始内容已被覆盖',
          duration: 3000
        });
      } catch (error) {
        console.error('[Frontend] 应用优化教案时捕获到错误:', error);
        this.$message({
          type: 'error',
          message: error.message || '教案优化失败',
          duration: 5000
        });
      } finally {
        this.promptLoading = false;
      }
    },

    // === 新增：显示优化结果 ===
    showOptimizationResult() {
      this.optimizationSuccessDialog = false; // 关闭优化成功提示
      this.showOptimizationResultDialog = true; // 显示优化结果
    },

    // 关闭优化成功对话框并重置状态
    closeOptimizationSuccess() {
      this.optimizationSuccessDialog = false;
      // 重置优化相关状态
      this.currentDisplayId = null;
      this.promptContent = '';
      this.createSuccessDialog = true;
    },

    resetForm() {
      this.$refs.lessonForm.resetFields()
      this.lessonForm.course_display_id = this.courseDisplayId; // 保留课程ID
      this.lessonForm.lesson_number = 1;
      this.lessonForm.duration = 45;
      this.lessonForm.original_content = '';
      this.optimizeEnabled = false;
      this.createdLessonTitle = '';
      this.optimizedLesson = null;
      this.createSuccessDialog = false;
      // 重置新增状态
      this.showOptimizedContentDialog = false;
      this.optimizedContentToShow = '';

      // 重置两步式优化相关状态
      this.promptPreviewDialogVisible = false;
      this.promptContent = '';
      this.promptLoading = false;
      this.optimizationSuccessDialog = false;
      this.optimizedLessonTitle = '';
      this.currentDisplayId = null;

      // 重置优化结果相关状态
      this.showOptimizationResultDialog = false;
      this.optimizationResult = null;
    },

    resetFormAndClose() {
      this.resetForm()
      this.createSuccessDialog = false
    },

    // 新增：复制优化内容的方法
    copyOptimizedContent() {
      if (this.optimizedContentToShow) {
        navigator.clipboard.writeText(this.optimizedContentToShow).then(() => {
          this.$message.success('内容已复制到剪贴板');
        }).catch(err => {
          console.error('复制失败: ', err);
          this.$message.error('复制失败，请手动选择文本');
        });
      }
    },

    // 新增：获取课程名称
    async fetchCourseName(courseId) {
      try {
        const response = await this.$store.dispatch('smartPrep/fetchCourseDetail', courseId);
        if (response?.name) {
          this.courseName = response.name;
        }
      } catch (error) {
        console.error('获取课程名称失败:', error);
        this.courseName = '未知课程';
      }
    }
  },
  created() {
    // 从路由参数获取课程ID
    const passedCourseDisplayId = this.$route.query.course_display_id;

    if (passedCourseDisplayId) {
      const numId = Number(passedCourseDisplayId);
      if (!isNaN(numId) && numId > 0) {
        this.courseDisplayId = numId;
        this.lessonForm.course_display_id = numId;
        console.log(`从路由参数获取并设置默认课程ID: ${numId}`);

        // 尝试获取课程名称
        this.fetchCourseName(numId);
      } else {
        console.warn(`从路由参数获取的 course_display_id 不是有效的正数: ${passedCourseDisplayId}`);
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
  }
}
</script>

<style scoped>
.lesson-plan-create {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
  display: flex;
  align-items: center;
}

.page-title::before {
  content: "";
  display: inline-block;
  width: 4px;
  height: 24px;
  background-color: #409EFF;
  margin-right: 10px;
  border-radius: 2px;
}

.create-card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

/* 新增：课程信息样式 */
.course-info {
  margin-bottom: 20px;
}

.content-hint {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
}

.save-options {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.processing-info {
  margin-top: 20px;
}

.optimizing-info {
  margin-top: 20px;
}

.estimated-time {
  color: #606266;
  font-size: 13px;
  margin-left: 10px;
  font-style: italic;
}

/* 新增：提示词编辑样式 */
.prompt-hint {
  margin-top: 8px;
  color: #909399;
  font-size: 13px;
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lesson-plan-create {
    padding: 10px;
  }

  .create-card {
    padding: 15px;
  }

  .save-options {
    flex-direction: column;
    gap: 10px;
  }

  .save-options button {
    width: 100%;
  }
}
</style>