<template>
  <div class="outline-create">
    <h1 class="page-title">大纲管理系统</h1>

    <el-card class="create-card">
      <h2>创建新大纲</h2>

      <el-form
        :model="outlineForm"
        :rules="rules"
        ref="outlineForm"
        label-width="120px"
        :disabled="loading"
      >
        <el-form-item prop="title">
          <label for="outline-title" class="el-form-item__label">大纲标题</label>
          <div class="el-form-item__content">
            <el-input
              id="outline-title"
              v-model="outlineForm.title"
              placeholder="请输入大纲标题，例如：九年级数学上册大纲"
              clearable
            ></el-input>
          </div>
        </el-form-item>

        <el-form-item prop="subject">
          <label for="outline-subject" class="el-form-item__label">学科</label>
          <div class="el-form-item__content">
            <el-select
              id="outline-subject"
              v-model="outlineForm.subject"
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
          <label for="outline-grade" class="el-form-item__label">年级</label>
          <div class="el-form-item__content">
            <el-input
              id="outline-grade"
              v-model="outlineForm.grade"
              placeholder="例如：九年级"
              clearable
            ></el-input>
          </div>
        </el-form-item>

        <el-form-item prop="total_periods">
          <label for="outline-periods" class="el-form-item__label">总课时数</label>
          <div class="el-form-item__content">
            <el-input-number
              id="outline-periods"
              v-model="outlineForm.total_periods"
              :min="2"
              :step="2"
              placeholder="请输入总课时数，必须为偶数"
              style="width: 100%"
            ></el-input-number>
          </div>
        </el-form-item>

        <el-form-item prop="course_display_id">
          <label for="outline-course-id" class="el-form-item__label">所属课程ID</label>
          <div class="el-form-item__content">
            <el-input
              id="outline-course-id"
              v-model.number="outlineForm.course_display_id"
              placeholder="请输入关联课程的显示ID (可选)"
              clearable
              type="number"
            ></el-input>
            <!-- 修改点：根据路由参数决定是否显示备注 -->
            <div class="content-hint">
              <small v-if="$route.query.course_display_id">
                <!-- 如果有从路由传入的 ID，则显示默认值提示 -->
                默认值来自来源课程页面 (ID: {{ $route.query.course_display_id }})，可修改。
              </small>
              <small v-else>
                <!-- 如果没有从路由传入 ID，则显示普通提示 -->
                如果要将大纲关联到现有课程，请输入课程的显示ID
              </small>
            </div>
          </div>
        </el-form-item>

        <el-form-item prop="original_content">
          <label for="outline-content" class="el-form-item__label">大纲内容</label>
          <div class="el-form-item__content">
            <el-input
              id="outline-content"
              type="textarea"
              v-model="outlineForm.original_content"
              :rows="15"
              placeholder="请输入大纲内容"
              :autosize="{ minRows: 5, maxRows: 15 }"
            ></el-input>
            <div class="content-hint">
              <small>支持Markdown格式，可使用#标题、**加粗**、*斜体*等语法</small>
            </div>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm"
            :loading="loading"
            :disabled="loading"
          >
            <span v-if="!loading">创建大纲</span>
            <span v-else>正在创建中...</span>
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
            <span>大纲正在创建中，请耐心等待...</span>
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
      <p>大纲 "{{ createdOutlineTitle }}" 已成功创建！</p>
      <div class="save-options">
        <router-link :to="{ name: 'OutlineList' }">
          <el-button type="primary">查看大纲列表</el-button>
        </router-link>
        <el-button @click="resetFormAndClose">继续创建新大纲</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {
  name: 'OutlineCreatePage',
  data() {
    return {
      outlineForm: {
        title: '',
        subject: '',
        grade: '',
        total_periods: 2, // 默认值
        course_display_id: null, // 初始设为 null，从路由参数填充
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
      createSuccessDialog: false,
      processing: false,
      createdOutlineTitle: '' // 用于在成功对话框中显示大纲名
    }
  },
  computed: {
    ...mapState('smartPrep', { // 如果模块名仍为 'smartPrep'
      loading: state => state.loading,
      error: state => state.error
    }),
    rules() {
      return {
        title: [
          { required: true, message: '请输入大纲标题', trigger: 'blur' },
          { min: 2, message: '大纲标题至少需要2个字符', trigger: 'blur' },
          { max: 255, message: '大纲标题不能超过255个字符', trigger: 'blur' }
        ],
        subject: [
          { required: true, message: '请选择学科', trigger: 'change' }
        ],
        original_content: [
          { required: true, message: '请输入大纲内容', trigger: 'blur' },
          { min: 10, message: '大纲内容至少需要10个字符', trigger: 'blur' }
        ],
        total_periods: [
          { required: true, message: '请输入总课时数', trigger: 'blur' },
          { type: 'number', min: 2, message: '总课时数必须是大于等于2的数字', trigger: 'blur' },
          { validator: (rule, value, callback) => {
              if (value % 2 !== 0) {
                callback(new Error('总课时数必须是偶数'));
              } else {
                callback();
              }
            }, trigger: 'blur' }
        ],
        // 添加 course_display_id 的校验规则（可选）
        course_display_id: [
          { type: 'number', min: 1, message: '课程ID必须是大于0的数字', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    ...mapActions('smartPrep', ['createOutline']), // 如果模块名仍为 'smartPrep'

    async submitForm() {
      this.$refs.outlineForm.validate(async valid => {
        if (valid) {
          this.processing = true;

          try {
            const outlineData = {
              title: this.outlineForm.title,
              subject: this.outlineForm.subject,
              grade: this.outlineForm.grade,
              total_periods: this.outlineForm.total_periods, // <--- 这里是正确的
              original_content: this.outlineForm.original_content,
              // 如果 course_display_id 为空或无效，则不发送该字段
              ...(this.outlineForm.course_display_id && this.outlineForm.course_display_id > 0 && { course_display_id: this.outlineForm.course_display_id })
            }

            console.log('提交大纲数据:', outlineData) // <--- Log 也显示了 total_periods

            // ... rest of the code ...

            // 显示加载提示
            const loading = this.$loading({
              lock: true,
              text: '正在创建大纲...',
              spinner: 'el-icon-loading',
              background: 'rgba(0, 0, 0, 0.7)'
            })

            // 调用创建大纲的 action
            const response = await this.createOutline(outlineData)
            console.log('大纲创建成功:', response)

            // 获取并保存大纲名用于提示
            this.createdOutlineTitle = response.data?.title || this.outlineForm.title

            this.createSuccessDialog = true; // 显示成功对话框

          } catch (error) {
            console.error('大纲创建失败:', error)
            this.$message({
              type: 'error',
              message: error.message || '大纲创建失败',
              duration: 3000
            })
          } finally {
            this.processing = false;
            // 确保无论成功还是失败都关闭加载提示
            if (this.$loading) {
              try { this.$loading().close(); } catch(e) { /* ignore */ }
            }
          }
        }
      })
    },

    resetForm() {
      this.$refs.outlineForm.resetFields()
      // 注意：resetFields 可能不会重置 number 类型的字段到 null，手动重置
      this.outlineForm.course_display_id = null;
      this.outlineForm.total_periods = 2;
      this.outlineForm.original_content = '';
      this.createdOutlineTitle = '';
      this.createSuccessDialog = false;
    },

    resetFormAndClose() {
      this.resetForm()
      this.createSuccessDialog = false
    },
  },
  created() {
    // 在组件创建时，从路由查询参数中获取 course_display_id 并设置为表单初始值
    const passedCourseDisplayId = this.$route.query.course_display_id;
    if (passedCourseDisplayId) {
      // 尝试转换为数字，如果转换失败则保持原值
      const numId = Number(passedCourseDisplayId);
      if (!isNaN(numId) && numId > 0) {
        this.outlineForm.course_display_id = numId;
        console.log(`从路由参数获取并设置默认课程ID: ${numId}`);
      } else {
        console.warn(`从路由参数获取的 course_display_id 不是有效的正数: ${passedCourseDisplayId}`);
        // 可以选择在此处显示一个提示信息给用户
        // this.$message.warning("从来源页面传递的课程ID无效，请手动输入。");
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
.outline-create { /* 重命名最外层类名 */
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

.create-card { /* 重命名卡片类名 */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
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

/* 添加处理状态样式 */
.processing-info {
  margin-top: 20px;
}

.estimated-time {
  color: #606266;
  font-size: 13px;
  margin-left: 10px;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .outline-create {
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