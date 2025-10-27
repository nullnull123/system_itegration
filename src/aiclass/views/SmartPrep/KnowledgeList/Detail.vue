<template>
  <div class="knowledge-list-detail">
    <h1 class="page-title">知识列表详情</h1>

    <!-- 加载成功并有数据时显示详情 -->
    <el-card class="detail-card" v-if="currentKnowledgeList && !loading">
      <div class="detail-header">
        <div class="header-main">
          <h2>{{ currentKnowledgeList.course_name }} - 知识列表</h2>
          <div class="knowledge-list-id-tag">
            <el-tag size="small" type="info">ID: {{ currentKnowledgeList.display_id }}</el-tag>
          </div>
        </div>
        <div class="header-actions">
          <!-- 知识列表详情通常不包含编辑功能，因为它由大纲生成 -->
          <!-- <el-button 
            type="warning" 
            @click="startEditing"
          >
            修改知识列表
          </el-button> -->
        </div>
      </div>

      <div class="detail-content">
        <div class="info-section">
          <h3 class="section-title">基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">显示ID:</span>
              <span class="value">{{ currentKnowledgeList.display_id }}</span>
            </div>
            <div class="info-item">
              <span class="label">关联课程ID:</span>
              <span class="value">{{ currentKnowledgeList.course_display_id }}</span>
            </div>
            <div class="info-item">
              <span class="label">关联课程名:</span>
              <span class="value">{{ currentKnowledgeList.course_name }}</span>
            </div>
            <div class="info-item">
              <span class="label">知识点总数:</span>
              <span class="value">{{ currentKnowledgeList.points_count || 0 }}</span>
            </div>
            <div class="info-item">
              <span class="label">重点数量:</span>
              <span class="value">{{ currentKnowledgeList.key_points_count || 0 }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">创建时间:</span>
              <span class="value">{{ formatDate(currentKnowledgeList.created_at) }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">更新时间:</span>
              <span class="value">{{ formatDate(currentKnowledgeList.updated_at) }}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3 class="section-title">知识点列表</h3>
          <el-table
            :data="currentKnowledgeList.points"
            style="width: 100%"
            border
            stripe
            size="mini"
            max-height="500"
          >
            <el-table-column prop="display_id" label="知识点ID" width="100" sortable></el-table-column>
            <el-table-column prop="content" label="内容" min-width="300"></el-table-column>
            <el-table-column prop="duration" label="时长(分钟)" width="100" sortable></el-table-column>
            <el-table-column prop="is_key_point" label="是否重点" width="100" sortable>
              <template slot-scope="scope">
                <el-tag :type="scope.row.is_key_point ? 'danger' : 'info'">
                  {{ scope.row.is_key_point ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="has_blackboard" label="有板书" width="80" sortable>
              <template slot-scope="scope">
                <el-tag :type="scope.row.has_blackboard ? 'success' : 'info'">
                  {{ scope.row.has_blackboard ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="blackboard_count" label="板书数" width="80" sortable></el-table-column>
            <el-table-column prop="has_interaction" label="有互动" width="80" sortable>
              <template slot-scope="scope">
                <el-tag :type="scope.row.has_interaction ? 'success' : 'info'">
                  {{ scope.row.has_interaction ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="interaction_count" label="互动数" width="80" sortable></el-table-column>
            <el-table-column prop="taught_in_lesson_number" label="第几次课讲授" width="130" sortable></el-table-column>
            <el-table-column prop="order_index" label="排序" width="80" sortable></el-table-column>
          </el-table>
        </div>
      </div>

      <div class="detail-footer">
        <p>更新时间: {{ formatDate(currentKnowledgeList.updated_at) }}</p>
      </div>
    </el-card>

    <!-- 加载中状态 -->
    <el-card class="loading-card" v-else-if="loading">
      <div class="loading-content">
        <i class="el-icon-loading" style="font-size: 24px;"></i>
        <p>正在加载知识列表详情...</p>
      </div>
    </el-card>

    <!-- 错误或无数据状态 -->
    <el-card class="error-card" v-else>
      <p v-if="error">{{ error }}</p>
      <p v-else>未找到指定的知识列表。</p>
      <div class="error-actions">
        <el-button type="primary" @click="retryFetchDetail" icon="el-icon-refresh">重试</el-button>
        <el-button @click="goToList" icon="el-icon-arrow-left">返回列表</el-button>
      </div>
    </el-card>

    <!-- 编辑知识列表弹窗 (可选，通常不提供) -->
    <!-- <el-dialog
      title="编辑知识列表"
      :visible.sync="showEditDialog"
      width="60%"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="edit-dialog"
    >
      <p>知识列表通常由大纲生成，不支持直接编辑。</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditDialog = false">关闭</el-button>
      </span>
    </el-dialog> -->
  </div>
</template>

<script>
// 注意：这里假设 Vuex store 已经更新为 'knowledge' 模块
// 如果没有，请确保 Vuex 中有对应的 actions 和 state
import { mapState, mapActions } from 'vuex'

export default {
  name: 'KnowledgeListDetailPage', // 重命名组件
  data() {
    return {
      knowledgeListDisplayId: this.$route.params.displayId,
      // showEditDialog: false, // 添加编辑弹窗状态 (通常不提供)
    }
  },
  computed: {
    ...mapState('smartPrep', ['currentKnowledgeList', 'loading', 'error']) // 如果模块名仍为 'smartPrep'
  },
  methods: {
    ...mapActions('smartPrep', ['fetchKnowledgeListDetail']), // 如果模块名仍为 'smartPrep'

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },

    // // 开始编辑知识列表 (通常不提供)
    // startEditing() {
    //   if (!this.currentKnowledgeList) {
    //     this.$message.warning("没有可编辑的知识列表");
    //     return;
    //   }
    //   // 知识列表通常由大纲生成，不直接编辑
    //   this.$message.info("知识列表通常由大纲生成，不支持直接编辑。");
    //   // this.showEditDialog = true;
    // },

    async retryFetchDetail() {
      if (this.knowledgeListDisplayId) {
        await this.fetchKnowledgeListDetail(this.knowledgeListDisplayId);
      }
    },

    goToList() {
      this.$router.push({ name: 'KnowledgeList' }); // 路由改为知识列表列表
    }
  },
  created() {
    if (this.knowledgeListDisplayId) {
      this.fetchKnowledgeListDetail(this.knowledgeListDisplayId);
    } else {
      console.error("路由中未找到 displayId 参数");
    }
  },
  watch: {
    '$route.params.displayId': {
      handler(newDisplayId) {
        this.knowledgeListDisplayId = newDisplayId;
        if (newDisplayId) {
          this.fetchKnowledgeListDetail(newDisplayId);
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.knowledge-list-detail { /* 重命名最外层类名 */
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: #f5f7fa; /* 添加背景色 */
}

.page-title {
  font-size: 28px; /* 稍大一点的标题 */
  margin-bottom: 25px;
  color: #2c3e50; /* 更深的标题色 */
  display: flex;
  align-items: center;
  font-weight: 600; /* 加粗 */
}

.page-title::before {
  content: "";
  display: inline-block;
  width: 5px; /* 稍宽一点 */
  height: 28px;
  background: linear-gradient(to bottom, #409EFF, #1a56db); /* 渐变色条 */
  margin-right: 12px;
  border-radius: 2px;
}

.detail-card {
  padding: 25px; /* 增加内边距 */
  border-radius: 12px; /* 更圆润的角 */
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08); /* 更柔和的阴影 */
  margin-bottom: 25px;
  background-color: #fff; /* 卡片背景色 */
  border: 1px solid #e4e7ed; /* 添加边框 */
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start; /* 顶部对齐 */
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.header-main {
  flex: 1;
  display: flex;
  flex-direction: column; /* 垂直排列 */
  gap: 8px; /* 添加间距 */
}

.header-main h2 {
  margin: 0;
  color: #303133;
}

.knowledge-list-id-tag {
  align-self: flex-start; /* ID 标签靠左对齐 */
}

.header-actions {
  display: flex;
  gap: 10px; /* 按钮间距 */
  align-self: flex-start; /* 按钮靠上对齐 */
}

.detail-content {
  line-height: 1.6;
}

.info-section {
  margin-bottom: 30px; /* 增加区块间距 */
  padding: 20px;
  background-color: #fafafa; /* 区块背景色 */
  border-radius: 8px;
  border-left: 5px solid #409EFF; /* 左侧强调色 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02); /* 微弱阴影 */
}

.section-title {
  margin-bottom: 15px; /* 增加标题与内容的间距 */
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
  font-size: 18px; /* 标题字体大小 */
  font-weight: 500;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* 响应式网格 */
  gap: 20px; /* 增加网格间距 */
}

.info-item {
  display: flex;
  flex-direction: column; /* 垂直排列 label 和 value */
}

.info-item.full-width {
  grid-column: 1 / -1; /* 横跨所有列 */
}

.label {
  font-weight: 600; /* 加粗标签 */
  color: #606266;
  margin-bottom: 6px; /* 增加标签与值的间距 */
  font-size: 14px;
}

.value {
  color: #303133;
  font-size: 15px; /* 稍大的值字体 */
  word-break: break-all; /* 长内容换行 */
}

.detail-footer {
  margin-top: 25px; /* 增加顶部间距 */
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  color: #909399;
  font-size: 14px;
  text-align: right;
}

.loading-card, .error-card {
  text-align: center;
  padding: 50px 25px; /* 增加内边距 */
  background-color: #fff; /* 卡片背景色 */
  border-radius: 12px; /* 圆角 */
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.08); /* 阴影 */
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
  gap: 15px; /* 增加按钮间距 */
}

/* 编辑弹窗样式 (如果启用) */
/* .edit-dialog .el-form-item {
  margin-bottom: 20px;
} */

/* 响应式设计 */
@media (max-width: 768px) {
  .knowledge-list-detail {
    padding: 15px; /* 减少移动端内边距 */
  }

  .page-title {
    font-size: 24px; /* 移动端标题大小 */
    margin-bottom: 20px;
  }

  .detail-card {
    padding: 20px; /* 减少移动端卡片内边距 */
  }

  .detail-header {
    flex-direction: column;
    align-items: stretch;
    gap: 20px; /* 增加主内容与按钮区域的间距 */
  }

  .header-main {
    align-items: center;
  }

  .knowledge-list-id-tag {
    align-self: center; /* 移动端 ID 标签居中 */
  }

  .header-actions {
    justify-content: center;
    gap: 10px; /* 移动端按钮间距 */
  }

  .info-grid {
    grid-template-columns: 1fr; /* 小屏幕下变为单列 */
    gap: 15px; /* 减少网格间距 */
  }

  .info-item.full-width {
    grid-column: auto; /* 取消横跨 */
  }

  .error-actions {
    flex-direction: column;
    gap: 10px; /* 移动端按钮间距 */
  }

  .error-actions button {
    width: 100%; /* 按钮占满宽度 */
  }
}
</style>