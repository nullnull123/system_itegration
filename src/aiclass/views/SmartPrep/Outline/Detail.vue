<template>
  <div class="outline-detail">
    <h1 class="page-title">大纲详情</h1>

    <!-- 加载成功并有数据时显示详情 -->
    <el-card class="detail-card" v-if="currentOutline && !loading">
      <div class="detail-header">
        <div class="header-main">
          <h2 class="outline-title">{{ currentOutline.title }}</h2>
          <div class="outline-meta">
            <el-tag size="small" type="info">ID: {{ currentOutline.display_id }}</el-tag>
            <el-tag size="small" :type="getSubjectTagType(currentOutline.subject)">
              {{ getSubjectLabel(currentOutline.subject) }}
            </el-tag>
            <el-tag size="small" v-if="currentOutline.grade">{{ currentOutline.grade }}</el-tag>
          </div>
        </div>
        <div class="header-actions">
          <!-- *** 新增：查看教学计划按钮 *** -->
          <el-button
            v-if="currentOutline.class_plan"
            type="primary"
            size="small"
            icon="el-icon-date"
            @click="goToClassPlanDetail"
          >
            查看教学计划
          </el-button>
          <!-- *** 新增结束 *** -->

        </div>
      </div>

      <div class="detail-content">
        
        <el-tabs v-model="activeTab" type="border-card" class="detail-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">标题:</span>
                <span class="value">{{ currentOutline.title }}</span>
              </div>
              <div class="info-item">
                <span class="label">学科:</span>
                <span class="value">{{ getSubjectLabel(currentOutline.subject) }}</span>
              </div>
              <div class="info-item">
                <span class="label">年级:</span>
                <span class="value">{{ currentOutline.grade || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">总课时数:</span>
                <span class="value">{{ currentOutline.total_periods || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">所属课程:</span>
                <span class="value">{{ currentOutline.course_name || 'N/A' }}</span>
              </div>
              <div class="info-item full-width">
                <span class="label">创建时间:</span>
                <span class="value">{{ formatDate(currentOutline.created_at) }}</span>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="大纲内容" name="content">
            <div class="tab-content">
              <h3>原始内容</h3>
              <div class="content-display">{{ currentOutline.original_content }}</div>
              
              <div v-if="currentOutline.optimized_content" class="optimized-section">
                <h3>优化内容</h3>
                <div class="content-display">{{ currentOutline.optimized_content }}</div>
              </div>
              
              <div v-if="currentOutline.optimization_notes" class="notes-section">
                <h3>优化说明</h3>
                <p>{{ currentOutline.optimization_notes }}</p>
              </div>
            </div>
          </el-tab-pane>

        </el-tabs>
      </div>

      <div class="detail-footer">
        <p>创建时间: {{ formatDate(currentOutline.created_at) }}</p>
        <p v-if="currentOutline.updated_at">
          更新时间: {{ formatDate(currentOutline.updated_at) }}
        </p>
      </div>
    </el-card>

    <!-- 加载中状态 -->
    <el-card class="loading-card" v-else-if="loading">
      <div class="loading-content">
        <i class="el-icon-loading" style="font-size: 24px;"></i>
        <p>正在加载大纲详情...</p>
      </div>
    </el-card>

    <!-- 错误或无数据状态 -->
    <el-card class="error-card" v-else>
      <p v-if="error">{{ error }}</p>
      <p v-else>未找到指定的大纲。</p>
      <div class="error-actions">
        <el-button type="primary" @click="retryFetchDetail" icon="el-icon-refresh">重试</el-button>
        <el-button @click="goToList" icon="el-icon-arrow-left">返回列表</el-button>
      </div>
    </el-card>

  </div>
</template>

<script>
// 注意：这里假设 Vuex store 已经更新为 'outline' 模块
// 如果没有，请确保 Vuex 中有对应的 actions 和 state
import { mapState, mapActions } from 'vuex'

export default {
  name: 'OutlineDetailPage', // 重命名组件
  data() {
    return {
      outlineDisplayId: this.$route.params.displayId,
      activeTab: 'basic', // 默认激活的 Tab
    }
  },
  computed: {
    ...mapState('smartPrep', ['currentOutline', 'loading', 'error']), // 如果模块名仍为 'smartPrep'
  },
  methods: {
    ...mapActions('smartPrep', 
    ['fetchOutlineDetail', 
    'updateOutline']), // 如果模块名仍为 'smartPrep'

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

    async retryFetchDetail() {
      if (this.outlineDisplayId) {
        await this.fetchOutlineDetail(this.outlineDisplayId);
      }
    },

    goToList() {
      this.$router.push({ name: 'OutlineList' }); // 路由改为大纲列表
    },

        // *** 修正：跳转到教学计划详情 ***
    goToClassPlanDetail() {
      // 1. 确保 currentOutline 存在
      if (!this.currentOutline) {
        this.$message.warning("当前课程信息不完整");
        return;
      }

      // 3. 检查 class_plan 是否存在且非空对象
      const classPlan = this.currentOutline.class_plan;
      const hasClassPlan = classPlan && typeof classPlan === 'object' && Object.keys(classPlan).length > 0;

      if (hasClassPlan) {
        // 4. 尝试从 class_plan 对象中获取 display_id 或 id
        //    注意：根据您的后端 ClassPlanListSerializer，返回的字段可能是 display_id
        const classPlanDisplayId = classPlan.display_id || classPlan.id;

        if (classPlanDisplayId) {
          // 5. 使用 router.push 跳转到 ClassPlanDetail 页面
          //    确保 'ClassplanDetail' 是您在 router/index.js 中为 classplan/detail/:displayId 路由定义的 name
          this.$router.push({ 
            name: 'ClassplanDetail', // 确保这个 name 与路由配置一致
            params: { displayId: classPlanDisplayId } // 使用 params 传递 ID
          });
        } else {
          // 6. 如果 class_plan 对象中没有有效的 ID
          this.$message.warning("无法获取教学计划的显示ID，请稍后重试。");
          console.warn("ClassPlan 对象中缺少 display_id 或 id:", classPlan);
        }
      } else {
        // 7. 如果 class_plan 不存在或为空对象
        this.$message.info("当前课程尚未生成教学计划。");
        console.log("ClassPlan 不存在或为空对象:", classPlan);
      }
    }
    // *** 修正结束 ***
  },
  created() {
    if (this.outlineDisplayId) {
      this.fetchOutlineDetail(this.outlineDisplayId);
    } else {
      console.error("路由中未找到 displayId 参数");
    }
  },
  watch: {
    '$route.params.displayId': {
      handler(newDisplayId) {
        this.outlineDisplayId = newDisplayId;
        if (newDisplayId) {
          this.fetchOutlineDetail(newDisplayId);
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.outline-detail { /* 重命名最外层类名 */
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

.outline-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 500;
}

.outline-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-self: flex-start;
  flex-wrap: wrap; /* 允许按钮换行 */
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

/* Plan Content 样式 */
.plan-content {
  white-space: pre-wrap;
  margin-bottom: 15px;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.5;
}
.plan-update-time {
  text-align: right;
  color: #909399;
  font-size: 13px;
  font-style: italic;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .outline-detail {
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

  .outline-meta {
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