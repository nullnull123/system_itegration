<template>
  <div class="lesson-plan-list">
    <h1 class="page-title">教案列表</h1>
    
    <!-- 显示当前课程信息 -->
    <el-card class="course-info-card" v-if="courseDisplayId">
      <div class="course-info">
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          正在查看课程 (ID: {{ courseDisplayId }}) 的教案列表
          <div style="margin-top: 5px;">
            <el-button type="text" @click="goToAllLessonPlans">查看全部教案</el-button>
          </div>
        </el-alert>
      </div>
    </el-card>

    <el-card class="list-card">
      <div class="card-header">
        <h2>教案管理</h2>
        <div class="button-group">
          <el-button type="primary" @click="goToUpload">创建新教案</el-button>
          <!-- 全删除按钮 -->
          <el-button
            size="mini"
            type="danger"
            @click="delAll"
            :loading="vuexLoading"
          >
            全部删除
          </el-button>

          <!-- 批量删除按钮 -->
          <el-button
            size="mini"
            type="warning"
            @click="bulkDel"
            :disabled="selectedLessons.length === 0"
            :loading="vuexLoading"
          >
            批量删除
          </el-button>
        </div>
      </div>

      <!-- 表格容器 -->
      <div class="table-wrapper">
        <el-table
          :data="filteredLessonPlans"
          v-loading="vuexLoading"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          :height="tableHeight"
          max-height="600"
          border
        >
          <!-- 选择列：放在最前面 -->
          <el-table-column type="selection" width="55"></el-table-column>

          <!-- 数据列 -->
          <el-table-column prop="display_id" label="显示ID" width="100"></el-table-column>
          <el-table-column prop="title" label="标题" min-width="200"></el-table-column>
          <el-table-column prop="subject" label="学科" width="100"></el-table-column>
          <el-table-column prop="grade" label="年级" width="100"></el-table-column>
          <el-table-column prop="duration" label="时长(分钟)" width="110"></el-table-column>
          <el-table-column prop="lesson_number" label="第几次课" width="100"></el-table-column>
          <el-table-column prop="course_name" label="所属课程" width="150"></el-table-column>
          <el-table-column prop="is_optimized" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.is_optimized ? 'success' : 'info'">
                {{ scope.row.is_optimized ? '已优化' : '未优化' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template slot-scope="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                @click="viewLesson(scope.row.display_id)"
              >查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-container" v-if="filteredTotal > 0">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :total="filteredTotal"
          layout="total, sizes, prev, pager, next, jumper"
          background>
        </el-pagination>
      </div>
      
      <!-- 修正：空状态提示 -->
      <el-empty 
        v-if="!vuexLoading && filteredLessonPlans.length === 0" 
        description="该课程还没有创建教案，点击'创建新教案'开始">
      </el-empty>
    </el-card>
  </div>
</template>

<script>
// 注意：这里假设 Vuex store 已经更新为 'lessonPlan' 模块或 'smartPrep' 模块中包含了教案相关的 actions
// 如果没有，请确保 Vuex 中有对应的 actions 和 state
import { mapState, mapActions } from 'vuex'

export default {
  name: 'LessonplanList', // 关键修正：与路由配置完全一致的名称
  
  computed: {
    ...mapState('smartPrep', ['preps', 'loading', 'error', 'total']),
    // 修正1：使用别名避免与data中定义的loading冲突
    vuexLoading() {
      return this.loading;
    },
    // 修正2：改进过滤逻辑，确保类型匹配
    filteredLessonPlans() {
      if (!this.courseDisplayId) {
        return this.preps || []
      }
      
      // 关键修复：确保比较时类型一致
      const courseIdStr = String(this.courseDisplayId);
      
      return (this.preps || []).filter(lesson => {
        const lessonCourseIdStr = lesson.course_display_id !== undefined ? String(lesson.course_display_id) : '';
        return lessonCourseIdStr === courseIdStr;
      });
    },
    filteredTotal() {
      return this.filteredLessonPlans.length
    }
  },
  data() {
    return {
      selectedLessons: [],// 用于存储选中的教案
      // 分页相关数据
      currentPage: 1,
      pageSize: 10,
      // 添加表格高度相关数据
      tableHeight: 500,
      // 新增：存储课程ID和名称
      courseDisplayId: null,
      courseName: ''
    }
  },
  methods: {
    ...mapActions('smartPrep', ['fetchLessonPlanList', 'deleteAllLessonPlans', 'bulkDeleteLessonPlans']),
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    goToUpload() {
      const route = { name: 'LessonplanUpload' }
      // 如果有课程ID，传递给上传页面
      if (this.courseDisplayId) {
        route.query = { course_display_id: this.courseDisplayId }
      }
      this.$router.push(route)
    },
    viewLesson(displayId) {
      // 安全检查：确保 displayId 有效
      if (!displayId) {
        this.$message.error('教案ID无效，无法查看');
        console.error('无效的教案ID:', displayId);
        return;
      }
      
      console.log("点击查看按钮，displayId:", displayId); // 添加调试日志
      
      // 使用路由名称和参数进行导航
      this.$router.push({ 
        name: 'LessonplanDetail', 
        params: { 
          displayId: displayId 
        },
        query: { 
          // 传递当前课程ID，用于返回课程列表时保持上下文
          course_display_id: this.courseDisplayId 
        }
      })
    },

    // 全删除方法
    async delAll() {
      try {
        await this.$confirm('此操作将永久删除所有教案, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.deleteAllLessonPlans()
        this.$message.success('全部删除成功')
        // 删除成功后刷新列表
        this.fetchLessonPlanList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    handleSelectionChange(selection) {
      this.selectedLessons = selection
    },

    // 批量删除方法
    async bulkDel() {
      if (this.selectedLessons.length === 0) {
        this.$message.warning('请先选择要删除的教案')
        return
      }

      try {
        await this.$confirm(`此操作将永久删除选中的 ${this.selectedLessons.length} 个教案, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const displayIds = this.selectedLessons.map(lesson => lesson.display_id)
        await this.bulkDeleteLessonPlans(displayIds)
        this.$message.success('批量删除成功')
        this.fetchLessonPlanList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量删除失败')
        }
      }
    },

    // 分页相关方法
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
    },

    handleCurrentChange(val) {
      this.currentPage = val
    },
    
    // 新增：跳转到全部教案列表
    goToAllLessonPlans() {
      this.$router.push({ name: 'LessonplanList' })
    }
  },

  mounted() {
    // 动态计算表格高度
    this.$nextTick(() => {
      const windowHeight = window.innerHeight
      // 根据页面布局计算合适的表格高度
      this.tableHeight = windowHeight - 300 // 你可以根据实际布局调整这个值
    })
  },

  created() {
    // 从路由参数获取课程ID
    const passedCourseDisplayId = this.$route.query.course_display_id;
    
    if (passedCourseDisplayId) {
      const numId = Number(passedCourseDisplayId);
      if (!isNaN(numId) && numId > 0) {
        this.courseDisplayId = numId;
        console.log(`从路由参数获取课程ID: ${numId}`);
      } else {
        console.warn(`无效的 course_display_id: ${passedCourseDisplayId}`);
      }
    }
    
    // 加载教案列表
    this.fetchLessonPlanList();
  }
}
</script>

<style scoped>
.lesson-plan-list { /* 重命名最外层类名 */
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

/* 新增：课程信息卡片样式 */
.course-info-card {
  margin-bottom: 20px;
}

.list-card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

/* 添加或修改表格包装器样式 */
.table-wrapper {
  margin-bottom: 20px;
  /* 确保包装器本身有明确的高度或允许内容撑开 */
  /* 如果需要固定高度，可以设置 height */
  /* height: 500px; */
  /* 但通常让 el-table 的 height 属性控制滚动更合适 */
}

/* 确保表格填满容器 */
.table-wrapper .el-table {
  width: 100%;
  /* el-table 的 height 属性会使其内部滚动 */
}

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .button-group {
    width: 100%;
    justify-content: space-between;
  }
}
</style>