<template>
  <div class="lesson-plan-detail">
    <h1 class="page-title">教案详情</h1>

    <!-- 加载成功并有数据时显示详情 -->
    <el-card class="detail-card" v-if="currentPrep && !loading">
      <div class="detail-header">
        <div class="header-main">
          <h2 class="lesson-plan-title">{{ currentPrep.title }}</h2>
          <div class="lesson-plan-meta">
            <el-tag size="small" type="info">ID: {{ currentPrep.display_id }}</el-tag>
            <el-tag size="small" :type="getSubjectTagType(currentPrep.subject)">
              {{ getSubjectLabel(currentPrep.subject) }}
            </el-tag>
            <el-tag size="small" v-if="currentPrep.grade">{{ currentPrep.grade }}</el-tag>
            <el-tag size="small" v-if="currentPrep.course_name" type="success">{{ currentPrep.course_name }}</el-tag>
          </div>
        </div>
        <div class="header-actions">
          <el-button 
            type="primary" 
            @click="handleGenerateOptimizedLesson"
            :loading="isGenerating"
            icon="el-icon-magic-stick"
          >
            {{ isGenerating ? '生成中...' : '生成优化教案' }}
          </el-button>
          <!-- 添加修改按钮 -->
          <el-button 
            type="warning" 
            @click="startEditing"
            icon="el-icon-edit"
          >
            修改教案
          </el-button>
        </div>
      </div>

      <div class="detail-content">
        <!-- 修复关键点：添加v-if="tabsReady"确保DOM完全渲染 -->
        <el-tabs v-model="activeTab" type="border-card" class="detail-tabs" v-if="tabsReady">
          <el-tab-pane label="基本信息" name="basic">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">标题:</span>
                <span class="value">{{ currentPrep.title }}</span>
              </div>
              <div class="info-item">
                <span class="label">学科:</span>
                <span class="value">{{ getSubjectLabel(currentPrep.subject) }}</span>
              </div>
              <div class="info-item">
                <span class="label">年级:</span>
                <span class="value">{{ currentPrep.grade || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">时长(分钟):</span>
                <span class="value">{{ currentPrep.duration }}</span>
              </div>
              <div class="info-item">
                <span class="label">第几次课:</span>
                <span class="value">{{ currentPrep.lesson_number }}</span>
              </div>
              <div class="info-item">
                <span class="label">所属课程:</span>
                <span class="value">{{ currentPrep.course_name || 'N/A' }}</span>
              </div>
              <div class="info-item full-width">
                <span class="label">创建时间:</span>
                <span class="value">{{ formatDate(currentPrep.created_at) }}</span>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="教案内容" name="content">
            <div class="tab-content">
              <h3>教案内容</h3>
              <div class="content-display">{{ currentPrep.original_content }}</div>
              
              <div v-if="currentPrep.optimized_content" class="optimized-section">
                <h3>优化内容</h3>
                <div class="content-display">{{ currentPrep.optimized_content }}</div>
              </div>
              
              <div v-if="currentPrep.optimization_notes" class="notes-section">
                <h3>优化说明</h3>
                <p>{{ currentPrep.optimization_notes }}</p>
              </div>
            </div>
          </el-tab-pane>

          <!-- 新增：教学建议标签页 -->
          <el-tab-pane label="教学建议" name="suggestion" v-if="currentTeachingSuggestion">
            <div class="suggestion-content">
              <div class="suggestion-section">
                <h3>讲授建议</h3>
                <div class="content-display">{{ currentTeachingSuggestion.lecture_suggestions }}</div>
              </div>
              
              <div class="suggestion-section">
                <h3>互动与兴趣激发</h3>
                <div class="content-display">{{ currentTeachingSuggestion.engagement_suggestions }}</div>
              </div>
              
              <div class="suggestion-section">
                <h3>教学资源推荐</h3>
                <div class="content-display">{{ currentTeachingSuggestion.teacher_resources }}</div>
              </div>
              
              <div class="suggestion-meta">
                <p>生成时间: {{ formatDate(currentTeachingSuggestion.generated_at) }}</p>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="detail-footer">
        <p>创建时间: {{ formatDate(currentPrep.created_at) }}</p>
        <p v-if="currentPrep.optimization_time">优化时间: {{ formatDate(currentPrep.optimization_time) }}</p>
        <p>更新时间: {{ formatDate(currentPrep.updated_at) }}</p>
      </div>
    </el-card>

    <!-- 加载中状态 -->
    <el-card class="loading-card" v-else-if="loading">
      <div class="loading-content">
        <i class="el-icon-loading" style="font-size: 24px;"></i>
        <p>正在加载教案详情...</p>
      </div>
    </el-card>

    <!-- 错误或无数据状态 -->
    <el-card class="error-card" v-else>
      <p v-if="error">{{ error }}</p>
      <p v-else>未找到指定的教案。</p>
      <div class="error-actions">
        <el-button type="primary" @click="retryFetchDetail" icon="el-icon-refresh">重试</el-button>
        <el-button @click="goToList" icon="el-icon-arrow-left">返回列表</el-button>
      </div>
    </el-card>

    <!-- 优化提示词编辑弹窗 -->
    <el-dialog
      title="编辑优化提示词"
      :visible.sync="showPromptDialog"
      width="60%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="prompt-dialog"
    >
      <div class="prompt-content">
        <h4>AI生成的优化提示词</h4>
        <p>您可以在此基础上进行修改，以获得更符合您需求的优化教案：</p>
        
        <el-input
          type="textarea"
          v-model="optimizationPrompt"
          :rows="12"
          placeholder="请输入优化提示词..."
        ></el-input>
        
        <div class="prompt-hint">
          <h5>提示：</h5>
          <ul>
            <li>您可以添加具体的教学要求、学生特点等信息</li>
            <li>可以指定希望强调的知识点或教学方法</li>
            <li>可以要求添加特定的案例或活动设计</li>
          </ul>
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showPromptDialog = false">取消</el-button>
        <el-button type="primary" @click="applyOptimizedLesson" :loading="isApplying">应用优化</el-button>
      </span>
    </el-dialog>

    <!-- 优化结果弹窗 -->
    <el-dialog
      title="优化后的教案"
      :visible.sync="showOptimizedDialog"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="optimized-dialog"
    >
      <div class="optimized-header">
        <h3>{{ optimizedLesson.title }} ({{ optimizedLesson.subject }})</h3>
        <div class="header-actions">
          <el-button 
            type="primary" 
            size="mini"
            icon="el-icon-document-copy"
            @click="copyOptimizedContent"
          >复制内容</el-button>
        </div>
      </div>

      <div class="optimized-content" v-html="formattedOptimizedDialogContent"></div>

      <div class="optimization-notes" v-if="optimizedLesson.optimization_notes">
        <h4>优化说明</h4>
        <p>{{ optimizedLesson.optimization_notes }}</p>
      </div>

      <div class="optimization-meta">
        <span>优化时间: {{ formatDate(optimizedLesson.optimization_time) }}</span>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showOptimizedDialog = false">关闭</el-button>
      </span>
    </el-dialog>

    <!-- 编辑教案弹窗 -->
    <el-dialog
      title="编辑教案"
      :visible.sync="showEditDialog"
      width="80%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="edit-dialog"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="教案标题">
          <el-input v-model="editForm.title"></el-input>
        </el-form-item>
        
        <el-form-item label="学科">
          <el-select v-model="editForm.subject" placeholder="请选择学科">
            <el-option
              v-for="subject in subjects"
              :key="subject.value"
              :label="subject.label"
              :value="subject.value">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="年级">
          <el-input v-model="editForm.grade" placeholder="例如：九年级"></el-input>
        </el-form-item>

        <el-form-item label="第几次课">
          <el-input-number v-model="editForm.lesson_number" :min="1" :max="100"></el-input-number>
        </el-form-item>
        
        <el-form-item label="时长(分钟)">
          <el-input-number v-model="editForm.duration" :min="1" :max="240"></el-input-number>
        </el-form-item>
        
        <el-form-item label="教案内容">
          <el-input
            type="textarea"
            v-model="editForm.original_content"
            :rows="10"
            placeholder="请输入教案内容"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="优化内容">
          <el-input
            type="textarea"
            v-model="editForm.optimized_content"
            :rows="15"
            placeholder="请输入优化后的教案内容"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="优化说明">
          <el-input
            type="textarea"
            v-model="editForm.optimization_notes"
            :rows="3"
            placeholder="请输入优化说明"
          ></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="saveEditedLesson" :loading="saving">保存修改</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'LessonPlanDetailPage',
  data() {
    return {
      lessonPlanDisplayId: this.$route.params.displayId,
      activeTab: 'basic', // 默认激活的 Tab
      isGenerating: false,
      isApplying: false,
      showPromptDialog: false,
      showOptimizedDialog: false,
      showEditDialog: false,
      optimizationPrompt: '',
      optimizedLesson: {},
      saving: false,
      // 新增：添加tabsReady状态控制Tabs渲染时机
      tabsReady: false,
      // 编辑表单数据
      editForm: {
        display_id: '',
        title: '',
        subject: '',
        grade: '',
        lesson_number: 1,
        duration: 45,
        original_content: '',
        optimized_content: '',
        optimization_notes: '',
        optimization_time: ''
      },
      // 学科选项
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
      ]
    }
  },
  computed: {
    ...mapState('smartPrep', ['currentPrep', 'loading', 'error', 'currentTeachingSuggestion']),
  
    
    // 添加这个计算属性用于模板中的条件判断
    hasTeachingSuggestion() {
      return this.currentTeachingSuggestion && 
             typeof this.currentTeachingSuggestion === 'object' &&
             (Object.keys(this.currentTeachingSuggestion).length > 0 ||
             this.currentTeachingSuggestion.lecture_suggestions || 
             this.currentTeachingSuggestion.engagement_suggestions);
    },
    
    formattedOptimizedDialogContent() {
      if (!this.optimizedLesson.optimized_content) return ''
      return this.optimizedLesson.optimized_content
        .replace(/# (.*)/g, '<h2>$1</h2>')
        .replace(/## (.*)/g, '<h3>$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>')
    }
  },
  methods: {
    ...mapActions('smartPrep', [
      'fetchLessonPlanDetail', 
      'fetchOptimizationPrompt',
      'applyOptimizedLesson',
      'updateLessonPlan',
      'fetchTeachingSuggestionDetail'
    ]),
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },

    getSubjectTagType(subject) {
      const typeMap = {
        'math': 'success',
        'chinese': 'warning',
        'english': 'primary',
        'physics': 'info',
        'chemistry': '',
        'biology': 'success',
        'history': 'warning',
        'geography': 'primary',
        'politics': 'info'
      };
      return typeMap[subject] || 'info';
    },
    getSubjectLabel(subjectValue) {
      const subjectMap = {
        'math': '数学',
        'chinese': '语文',
        'english': '英语',
        'physics': '物理',
        'chemistry': '化学',
        'biology': '生物',
        'history': '历史',
        'geography': '地理',
        'politics': '政治'
      };
      return subjectMap[subjectValue] || subjectValue;
    },

    startEditing() {
      if (!this.currentPrep) {
        this.$message.warning("没有可编辑的教案");
        return;
      }
      
      this.editForm = {
        display_id: this.currentPrep.display_id || this.currentPrep.id,
        title: this.currentPrep.title || '',
        subject: this.currentPrep.subject || '',
        grade: this.currentPrep.grade || '',
        lesson_number: this.currentPrep.lesson_number || 1,
        duration: this.currentPrep.duration || 45,
        original_content: this.currentPrep.original_content || '',
        optimized_content: this.currentPrep.optimized_content || '',
        optimization_notes: this.currentPrep.optimization_notes || '',
        optimization_time: this.currentPrep.optimization_time || new Date().toISOString()
      };
      
      this.showEditDialog = true;
    },

    async saveEditedLesson() {
      try {
        this.saving = true;
        
        const saveData = {
          display_id: this.editForm.display_id,
          title: this.editForm.title,
          subject: this.editForm.subject,
          grade: this.editForm.grade,
          lesson_number: this.editForm.lesson_number,
          duration: this.editForm.duration,
          original_content: this.editForm.original_content,
          optimized_content: this.editForm.optimized_content,
          optimization_notes: this.editForm.optimization_notes,
          optimization_time: this.editForm.optimization_time 
            ? new Date(this.editForm.optimization_time).toISOString().slice(0, 19).replace('T', ' ')
            : null
        };

        await this.updateLessonPlan(saveData);
        
        this.$message.success("教案修改已保存");
        this.showEditDialog = false;
        
        await this.fetchLessonPlanDetail(this.lessonPlanDisplayId);
        
      } catch (err) {
        console.error("保存失败:", err);
        
        let errorMessage = "保存失败";
        if (err.response) {
          if (err.response.status === 404) {
            errorMessage = "教案不存在，请刷新页面重试";
          } else if (err.response.status === 400) {
            errorMessage = "数据格式错误，请检查输入内容";
          } else if (err.response.data && err.response.data.message) {
            errorMessage = err.response.data.message;
          } else {
            errorMessage = `服务器错误: ${err.response.status}`;
          }
        } else if (err.request) {
          errorMessage = "网络连接失败，请检查网络";
        } else {
          errorMessage = err.message || "未知错误";
        }
        
        this.$message.error(errorMessage);
      } finally {
        this.saving = false;
      }
    },

    async handleGenerateOptimizedLesson() {
      if (!this.lessonPlanDisplayId) {
        this.$message.warning("当前教案信息不完整");
        return;
      }

      this.isGenerating = true;
      let loadingInstance = null;

      try {
        loadingInstance = this.$loading({
          lock: true,
          text: '正在获取优化提示词...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });

        // 1. 首先获取优化提示词
        const promptData = await this.fetchOptimizationPrompt({ display_id: this.lessonPlanDisplayId });
        // 2. 设置提示词并显示编辑对话框
        this.optimizationPrompt = promptData.data.prompt || '';
        this.showPromptDialog = true;
        
      } catch (err) {
        console.error("获取优化提示词失败:", err);
        const errorMsg = err?.response?.data?.message || err?.message || "获取优化提示词失败";
        this.$message.error(errorMsg);
      } finally {
        this.isGenerating = false;
        if (loadingInstance) {
          loadingInstance.close();
        }
      }
    },

    async applyOptimizedLesson() {
      if (!this.lessonPlanDisplayId || !this.optimizationPrompt) {
        this.$message.warning("缺少必要的参数");
        return;
      }

      this.isApplying = true;
      let loadingInstance = null;

      try {
        loadingInstance = this.$loading({
          lock: true,
          text: '正在应用优化教案...',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        });

        // 调用优化教案API
        const result = await this.$store.dispatch('smartPrep/applyOptimizedLesson', {
          display_id: this.lessonPlanDisplayId,
          custom_prompt: this.optimizationPrompt
        });

        // 更新当前教案
        this.optimizedLesson = result.lesson_plan;
        this.showOptimizedDialog = true;
        this.showPromptDialog = false;
        
        // 重新获取教学建议
        await this.fetchTeachingSuggestionDetail(this.lessonPlanDisplayId);
        
        this.$message.success("优化教案生成成功");
      } catch (err) {
        console.error("应用优化教案失败:", err);
        const errorMsg = err?.response?.data?.message || err?.message || "应用优化教案失败";
        this.$message.error(errorMsg);
      } finally {
        this.isApplying = false;
        if (loadingInstance) {
          loadingInstance.close();
        }
      }
    },

    copyOptimizedContent() {
      const content = this.optimizedLesson.optimized_content;
      if (!content) {
        this.$message.warning("没有可复制的内容");
        return;
      }
      
      navigator.clipboard.writeText(content).then(() => {
        this.$message.success("内容已复制到剪贴板");
      }).catch(() => {
        this.$message.error("复制失败，请手动选择内容");
      });
    },

    async retryFetchDetail() {
      if (this.lessonPlanDisplayId) {
        try {
          await this.fetchLessonPlanDetail(this.lessonPlanDisplayId);
          // 修复关键点：等待DOM更新后再设置tabsReady
          await this.$nextTick();
          this.tabsReady = true;
          
          // 尝试获取教学建议
          try {
            await this.fetchTeachingSuggestionDetail(this.lessonPlanDisplayId);
          } catch (error) {
            console.log("该教案可能还没有教学建议:", error);
          }
        } catch (error) {
          console.error("重试加载失败:", error);
          this.tabsReady = false; // 确保错误时重置状态
        }
      }
    },

    goToList() {
      this.$router.push({ name: 'LessonplanList' });
    }
  },
  async created() {
    if (this.lessonPlanDisplayId) {
      try {
        await this.fetchLessonPlanDetail(this.lessonPlanDisplayId);
        // 修复关键点：等待DOM更新后再设置tabsReady
        await this.$nextTick();
        this.tabsReady = true;
        
        // 尝试获取教学建议
        try {
          await this.fetchTeachingSuggestionDetail(this.lessonPlanDisplayId);
          console.log('[Detail] 成功获取教学建议:', this.currentTeachingSuggestion);
        } catch (error) {
          console.log("该教案可能还没有教学建议:", error);
        }
      } catch (error) {
        console.error("加载教案详情失败", error);
        this.tabsReady = false; // 确保错误时重置状态
      }
    } else {
      console.error("路由中未找到 displayId 参数");
    }
  },
  watch: {
    '$route.params.displayId': {
      async handler(newDisplayId) {
        this.lessonPlanDisplayId = newDisplayId;
        if (newDisplayId) {
          try {
            await this.fetchLessonPlanDetail(newDisplayId);
            // 修复关键点：等待DOM更新后再设置tabsReady
            await this.$nextTick();
            this.tabsReady = true;
            
            // 尝试获取教学建议
            try {
              await this.fetchTeachingSuggestionDetail(newDisplayId);
              console.log('[Detail] 路由变化后获取教学建议:', this.currentTeachingSuggestion);
            } catch (error) {
              console.log("该教案可能还没有教学建议:", error);
            }
          } catch (error) {
            console.error("路由变化加载失败:", error);
            this.tabsReady = false; // 确保错误时重置状态
          }
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.lesson-plan-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f5f7fa;
}

.page-title {
  font-size: 28px;
  margin-bottom: 20px;
  color: #2c3e50;
  display: flex;
  align-items: center;
  font-weight: 600;
}

.page-title::before {
  content: "";
  display: inline-block;
  width: 5px;
  height: 28px;
  background: linear-gradient(to bottom, #409EFF, #1a56db);
  margin-right: 12px;
  border-radius: 2px;
}

.detail-card {
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
  margin-bottom: 25px;
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.header-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lesson-plan-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 500;
}

.lesson-plan-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-self: flex-start;
  flex-wrap: wrap;
}

.detail-content {
  line-height: 1.6;
}

/* Tabs 样式 */
.detail-tabs {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.detail-tabs ::v-deep .el-tabs__header {
  margin: 0;
  background-color: #f8f9fa;
}
.detail-tabs ::v-deep .el-tabs__nav-scroll {
  padding-left: 20px;
}
.detail-tabs ::v-deep .el-tabs__item {
  height: 45px;
  line-height: 45px;
  font-weight: 500;
}
.detail-tabs ::v-deep .el-tabs__content {
  padding: 20px;
  background-color: #fff;
}

.tab-content {
  line-height: 1.6;
}
.tab-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}
.placeholder-message {
  text-align: center;
  color: #909399;
  font-style: italic;
  padding: 20px;
}

/* Info Grid 样式 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}
.info-item {
  display: flex;
  flex-direction: column;
}
.info-item.full-width {
  grid-column: 1 / -1;
}
.label {
  font-weight: 600;
  color: #606266;
  margin-bottom: 6px;
  font-size: 14px;
}
.value {
  color: #303133;
  font-size: 15px;
  word-break: break-all;
}

/* Content Display 样式 */
.content-display {
  white-space: pre-wrap;
  margin-bottom: 20px;
  padding: 15px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  font-family: 'Consolas', 'Monaco', monospace;
  line-height: 1.5;
  max-height: 400px;
  overflow-y: auto;
}

/* Optimized Section 样式 */
.optimized-section {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px dashed #dcdfe6;
}
.notes-section {
  margin-top: 20px;
  padding: 15px;
  background: #f0f7ff;
  border-radius: 6px;
  border-left: 4px solid #409EFF;
}
.notes-section h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}
.notes-section p {
  margin: 0;
  color: #606266;
}

/* Suggestion Section 样式 */
.suggestion-content {
  line-height: 1.6;
}
.suggestion-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}
.suggestion-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}
.suggestion-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}
.suggestion-meta {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 14px;
  text-align: right;
}

.detail-footer {
  margin-top: 25px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 14px;
  text-align: right;
}

.loading-card, .error-card {
  text-align: center;
  padding: 50px 25px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.error-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

/* Prompt Dialog 样式 */
.prompt-dialog .prompt-content {
  line-height: 1.6;
}
.prompt-dialog .prompt-content h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}
.prompt-dialog .prompt-content p {
  margin-bottom: 15px;
  color: #606266;
}
.prompt-dialog .prompt-hint {
  margin-top: 20px;
  padding: 15px;
  background: #f0f7ff;
  border-radius: 6px;
  border-left: 4px solid #409EFF;
}
.prompt-dialog .prompt-hint h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #333;
}
.prompt-dialog .prompt-hint ul {
  padding-left: 20px;
}
.prompt-dialog .prompt-hint li {
  margin-bottom: 8px;
  color: #606266;
}

/* Optimized Dialog 样式 */
.optimized-dialog .optimized-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}
.optimized-dialog .optimized-content {
  line-height: 1.6;
  font-size: 16px;
  white-space: pre-wrap;
  background: #f9f9f9;
  padding: 20px;
  border-radius: 4px;
  min-height: 300px;
  max-height: 500px;
  overflow-y: auto;
}
.optimized-dialog .optimization-notes {
  margin-top: 20px;
  padding: 15px;
  background: #f0f7ff;
  border-radius: 4px;
  border-left: 4px solid #409EFF;
}
.optimized-dialog .optimization-meta {
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
  color: #909399;
  font-size: 14px;
  text-align: right;
}

/* Edit Dialog 样式 */
.edit-dialog .el-form-item {
  margin-bottom: 20px;
}
.edit-dialog .el-textarea {
  width: 100%;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .lesson-plan-detail {
    padding: 15px;
  }

  .page-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .detail-card {
    padding: 20px;
  }

  .detail-header {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .header-main {
    align-items: center;
  }

  .lesson-plan-meta {
    justify-content: center;
  }

  .header-actions {
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .info-item.full-width {
    grid-column: auto;
  }

  .error-actions {
    flex-direction: column;
    gap: 10px;
  }

  .error-actions button {
    width: 100%;
  }
}
</style>