<template>
  <div class="class-plan-detail">
    <h1 class="page-title">教学计划详情</h1>

    <!-- 加载成功并有数据时显示详情 -->
    <el-card class="detail-card" v-if="currentClassPlan && !loading">
      <div class="detail-header">
        <div class="header-main">
          <h2 class="plan-title">{{ currentClassPlan.course_name }} - 教学计划</h2>
          <div class="plan-meta">
            <el-tag size="small" type="info">ID: {{ currentClassPlan.display_id }}</el-tag>
            <el-tag size="small" :type="currentClassPlan.is_active ? 'success' : 'info'">
              {{ currentClassPlan.is_active ? '已激活' : '未激活' }}
            </el-tag>
            <el-tag size="small" type="warning">版本: {{ currentClassPlan.plan_version }}</el-tag>
          </div>
        </div>
      </div>

      <div class="detail-content">
        <el-tabs v-model="activeTab" type="border-card" class="detail-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">课程名:</span>
                <span class="value">{{ currentClassPlan.course_name }}</span>
              </div>
              <div class="info-item">
                <span class="label">大纲标题:</span>
                <span class="value">{{ currentClassPlan.outline_title || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">关联知识列表ID:</span>
                <span class="value">{{ currentClassPlan.knowledge_list_display_id }}</span>
              </div>
              <div class="info-item">
                <span class="label">关联大纲ID:</span>
                <span class="value">{{ currentClassPlan.outline_display_id || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">是否激活:</span>
                <span class="value">
                  <el-tag :type="currentClassPlan.is_active ? 'success' : 'info'">
                    {{ currentClassPlan.is_active ? '是' : '否' }}
                  </el-tag>
                </span>
              </div>
              <div class="info-item">
                <span class="label">计划版本:</span>
                <span class="value">{{ currentClassPlan.plan_version }}</span>
              </div>
              <div class="info-item full-width">
                <span class="label">创建时间:</span>
                <span class="value">{{ formatDate(currentClassPlan.created_at) }}</span>
              </div>
              <div class="info-item full-width">
                <span class="label">更新时间:</span>
                <span class="value">{{ formatDate(currentClassPlan.updated_at) }}</span>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="详细内容" name="content">
            <div class="content-section">
              <h3 class="content-title">教学计划内容</h3>
              <div class="plan-content">{{ currentClassPlan.plan_content }}</div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <div class="detail-footer">
        <p>更新时间: {{ formatDate(currentClassPlan.updated_at) }}</p>
      </div>
    </el-card>

    <!-- 加载中状态 -->
    <el-card class="loading-card" v-else-if="loading">
      <div class="loading-content">
        <i class="el-icon-loading" style="font-size: 24px;"></i>
        <p>正在加载教学计划详情...</p>
      </div>
    </el-card>

    <!-- 错误或无数据状态 -->
    <el-card class="error-card" v-else>
      <p v-if="error">{{ error }}</p>
      <p v-else>未找到指定的教学计划。</p>
      <div class="error-actions">
        <el-button type="primary" @click="retryFetchDetail" icon="el-icon-refresh">重试</el-button>
        <el-button @click="goToList" icon="el-icon-arrow-left">返回列表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
// 注意：这里假设 Vuex store 已经更新为 'classPlan' 模块
// 如果没有，请确保 Vuex 中有对应的 actions 和 state
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ClassPlanDetailPage', // 重命名组件
  data() {
    return {
      classPlanDisplayId: this.$route.params.displayId,
      activeTab: 'basic', // 默认激活的 Tab
    }
  },
  computed: {
    ...mapState('smartPrep', ['currentClassPlan', 'loading', 'error']) // 如果模块名仍为 'smartPrep'
  },
  methods: {
    ...mapActions('smartPrep', ['fetchClassPlanDetail']), // 如果模块名仍为 'smartPrep'

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },

    async retryFetchDetail() {
      if (this.classPlanDisplayId) {
        await this.fetchClassPlanDetail(this.classPlanDisplayId);
      }
    },

    goToList() {
      this.$router.push({ name: 'ClassPlanList' }); // 路由改为教学计划列表
    }
  },
  created() {
    if (this.classPlanDisplayId) {
      this.fetchClassPlanDetail(this.classPlanDisplayId);
    } else {
      console.error("路由中未找到 displayId 参数");
    }
  },
  watch: {
    '$route.params.displayId': {
      handler(newDisplayId) {
        this.classPlanDisplayId = newDisplayId;
        if (newDisplayId) {
          this.fetchClassPlanDetail(newDisplayId);
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.class-plan-detail {
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

.plan-title {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 500;
}

.plan-meta {
  display: flex;
  gap: 10px;
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

/* Content Section 样式 */
.content-section {
  line-height: 1.6;
}
.content-title {
  margin-top: 0;
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  font-size: 18px;
}

/* Plan Content 样式 */
.plan-content {
  white-space: pre-wrap;
  padding: 20px;
  background: #fafafa;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  font-family: 'Consolas', 'Monaco', monospace;
  line-height: 1.5;
  max-height: 500px;
  overflow-y: auto;
  color: #303133;
  font-size: 14px;
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
  .class-plan-detail {
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

  .plan-meta {
    justify-content: center;
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