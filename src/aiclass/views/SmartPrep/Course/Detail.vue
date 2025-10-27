<template>
  <div class="course-detail">
    <h1 class="page-title">课程详情</h1>

    <!-- 加载成功并有数据时显示详情 -->
    <el-card class="detail-card" v-if="currentCourse && !loading">
      <div class="detail-header">
        <div class="header-main">
          <h2 class="course-title">{{ currentCourse.name }}</h2>
          <div class="course-id-tag">
            <el-tag size="small" type="info">ID: {{ currentCourse.display_id }}</el-tag>
          </div>
        </div>
        <div class="header-actions">
          <!-- 根据 has_outline 状态决定按钮文本和跳转 -->
          <el-button
            :type="currentCourse.has_outline ? 'info' : 'success'"
            size="small"
            icon="el-icon-document"
            @click="goToOutlineDetail"
          >
            {{ currentCourse.has_outline ? '查看大纲' : '创建大纲' }}
          </el-button>

          <!-- 修改：将"创建教案"按钮改为"教案列表" -->
          <el-button
            type="primary"
            size="small"
            icon="el-icon-document"
            @click="goToLessonPlanList"
          >
            教案列表
          </el-button>

          <!-- 新增：查看知识列表按钮 (如果存在) -->
          <el-button
            v-if="currentCourse.knowledge_list"
            type="warning"
            size="small"
            icon="el-icon-collection"
            @click="goToKnowledgeList"
          >
            查看知识列表
          </el-button>
        </div>
      </div>

      <div class="detail-content">
        <div class="info-section">
          <h3 class="section-title">基本信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">课程名:</span>
              <span class="value">{{ currentCourse.name }}</span>
            </div>
            <div class="info-item">
              <span class="label">是否有大纲:</span>
              <span class="value">
                <el-tag :type="currentCourse.has_outline ? 'success' : 'info'">
                  {{ currentCourse.has_outline ? '是' : '否' }}
                </el-tag>
              </span>
            </div>
            <div class="info-item">
              <span class="label">教案数量:</span>
              <span class="value">{{ currentCourse.lesson_plan_count || 0 }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">创建时间:</span>
              <span class="value">{{ formatDate(currentCourse.created_at) }}</span>
            </div>
          </div>
        </div>

        <!-- 如果后端 CourseDetailSerializer 返回 outline_title，可以显示 -->
        <div v-if="currentCourse.outline_title" class="info-section">
          <h3 class="section-title">大纲信息</h3>
          <div class="info-grid">
            <div class="info-item full-width">
              <span class="label">大纲标题:</span>
              <span class="value">{{ currentCourse.outline_title }}</span>
            </div>
          </div>
        </div>

        <!-- 如果后端 CourseDetailSerializer 返回 knowledge_list，可以显示 -->
        <div v-if="currentCourse.knowledge_list" class="info-section">
          <h3 class="section-title">知识列表</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">知识列表ID:</span>
              <span class="value">{{ currentCourse.knowledge_list.display_id }}</span>
            </div>
            <div class="info-item">
              <span class="label">知识点数量:</span>
              <span class="value">{{ currentCourse.knowledge_list.points_count || 0 }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-footer">
        <p>创建时间: {{ formatDate(currentCourse.created_at) }}</p>
      </div>
    </el-card>

    <!-- 加载中状态 -->
    <el-card class="loading-card" v-else-if="loading">
      <div class="loading-content">
        <i class="el-icon-loading" style="font-size: 24px;"></i>
        <p>正在加载课程详情...</p>
      </div>
    </el-card>

    <!-- 错误或无数据状态 -->
    <el-card class="error-card" v-else>
      <p v-if="error">{{ error }}</p>
      <p v-else>未找到指定的课程。</p>
      <div class="error-actions">
        <el-button type="primary" @click="retryFetchDetail" icon="el-icon-refresh">重试</el-button>
        <el-button @click="goToList" icon="el-icon-arrow-left">返回列表</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
// 注意：这里假设 Vuex store 已经更新为 'course' 模块
// 如果没有，请确保 Vuex 中有对应的 actions 和 state
import { mapState, mapActions } from 'vuex'

export default {
  name: 'CourseDetail', // 与路由配置完全一致的名称
  
  data() {
    return {
      courseDisplayId: this.$route.params.displayId
    }
  },
  computed: {
    ...mapState('smartPrep', ['currentCourse', 'loading', 'error']) // 如果模块名仍为 'smartPrep'
  },
  methods: {
    ...mapActions('smartPrep', ['fetchCourseDetail']), // 如果模块名仍为 'smartPrep'

    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },

    async retryFetchDetail() {
      if (this.courseDisplayId) {
        await this.fetchCourseDetail(this.courseDisplayId)
      }
    },

    goToList() {
      this.$router.push({ name: 'CourseList' }) // 路由改为课程列表
    },

    // 修改此方法：根据 has_outline 状态和 ORM 关联跳转
    goToOutlineDetail() {
      if (this.currentCourse.has_outline && this.currentCourse.related_outline) {
        // 如果已有大纲，跳转到大纲详情页
        // 使用通过 ORM 关联获取的 Outline 的 display_id
        const outlineDisplayId = this.currentCourse.related_outline.display_id
        if (outlineDisplayId) {
          this.$router.push({ 
            name: 'OutlineDetail', 
            params: { displayId: outlineDisplayId } 
          })
        } else {
          // 如果无法获取 outline_display_id，给出提示
          this.$message.warning('无法获取关联的大纲ID，请稍后重试。')
        }
      } else {
        // 如果没有大纲，跳转到大纲创建页
        this.$router.push({ 
          name: 'OutlineUpload', 
          query: { course_display_id: this.currentCourse.display_id }
        })
      }
    },

    // 新增：跳转到教案列表页面，并传递course_display_id
    goToLessonPlanList() {
      // 传递当前课程的 display_id 给教案列表页面
      this.$router.push({ 
        name: 'LessonplanList', 
        query: { course_display_id: this.currentCourse.display_id }
      })
    },

    // 新增：跳转到知识列表详情
    goToKnowledgeList() {
      // 修正：明确只使用 display_id 进行路由跳转
      // 假设 currentCourse.knowledge_list 对象包含 display_id 字段
      const knowledgeListDisplayId = this.currentCourse.knowledge_list?.display_id
      
      // 严格检查 display_id 是否存在且有效 (不为 null, undefined, 0, NaN, "")
      if (knowledgeListDisplayId != null && knowledgeListDisplayId !== '') { 
        // 确保 display_id 是数字或可以转换为数字
        const numId = Number(knowledgeListDisplayId)
        if (!isNaN(numId) && numId > 0) {
            this.$router.push({ 
              name: 'KnowledgelistDetail', // 确保这个 name 与路由配置一致
              params: { displayId: numId } 
            })
        } else {
             console.warn(`Invalid knowledgeListDisplayId (not a positive number): ${knowledgeListDisplayId}`)
             this.$message.warning('知识列表 ID 无效，请稍后重试。')
        }
      } else {
        console.warn('无法获取知识列表的 display_id。', this.currentCourse.knowledge_list)
        this.$message.warning('无法获取知识列表详情，请稍后重试。')
      }
    }
  },
  created() {
    if (this.courseDisplayId) {
      this.fetchCourseDetail(this.courseDisplayId)
    } else {
      console.error('路由中未找到 displayId 参数')
    }
  },
  watch: {
    '$route.params.displayId': {
      handler(newDisplayId) {
        this.courseDisplayId = newDisplayId
        if (newDisplayId) {
          this.fetchCourseDetail(newDisplayId)
        }
      },
      immediate: true
    }
  }
}
</script>

<style scoped>
.course-detail {
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
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1); /* 更柔和的阴影 */
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
  gap: 10px; /* 添加间距 */
}

.header-main h2 {
  margin: 0;
  color: #303133;
  font-size: 24px; /* 标题字体大小 */
  font-weight: 500;
}

.course-id-tag {
  align-self: flex-start; /* ID 标签靠左对齐 */
}

.header-actions {
  display: flex;
  gap: 12px; /* 增加按钮间距 */
  align-self: flex-start; /* 按钮靠上对齐 */
  flex-wrap: wrap; /* 允许按钮换行 */
}

.detail-content {
  line-height: 1.7; /* 增加行高 */
}

.info-section {
  margin-bottom: 30px; /* 增加区块间距 */
  padding: 20px;
  background-color: #fafafa; /* 更浅的区块背景色 */
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
  margin-top: 25px;
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
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1); /* 阴影 */
  border: 1px solid #e4e7ed;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* 增加间距 */
}

.loading-content i {
  font-size: 32px; /* 增大加载图标 */
  color: #409EFF;
}

.error-actions {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 15px; /* 增加按钮间距 */
}

/* 响应式设计 */
@media (max-width: 768px) {
  .course-detail {
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

  .header-actions {
    justify-content: center;
    gap: 10px; /* 移动端按钮间距 */
    flex-wrap: wrap; /* 小屏幕下按钮也换行 */
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