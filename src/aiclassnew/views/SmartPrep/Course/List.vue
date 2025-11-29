<template>
  <div class="course-list">
    <h1 class="page-title">课程列表</h1>

    <el-card class="list-card">
      <div class="card-header">
        <h2>课程管理</h2>
        <div class="button-group">
          <el-button type="primary" @click="goToCreate">创建新课程</el-button>
          <!-- 全删除按钮 -->
          <el-button
            size="mini"
            type="danger"
            @click="delAll"
            :loading="loading"
          >
            全部删除
          </el-button>

          <!-- 批量删除按钮 -->
          <el-button
            size="mini"
            type="warning"
            @click="bulkDel"
            :disabled="selectedCourses.length === 0"
            :loading="loading"
          >
            批量删除
          </el-button>
        </div>
      </div>

      <!-- 表格容器 -->
      <div class="table-wrapper">
        <el-table
          :data="courses"
          v-loading="loading"
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
          <el-table-column prop="name" label="课程名" min-width="200"></el-table-column>
          <el-table-column prop="has_outline" label="是否有大纲" width="120">
            <template slot-scope="scope">
              <el-tag :type="scope.row.has_outline ? 'success' : 'info'">
                {{ scope.row.has_outline ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="lesson_plan_count" label="教案数" width="100"></el-table-column>
          <el-table-column prop="knowledge_points_count" label="知识点数" width="120"></el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template slot-scope="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                @click="viewCourse(scope.row.display_id)"
              >查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页组件 -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background>
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
// 注意：这里假设 Vuex store 已经更新为 'course' 模块
// 如果没有，请确保 Vuex 中有对应的 actions 和 state
import { mapState, mapActions } from 'vuex'

export default {
  name: 'CourseListPage', // 重命名组件
  computed: {
    ...mapState('smartPrep', ['courses', 'loading', 'error']) // 如果模块名仍为 'smartPrep'
  },
  data() {
    return {
      selectedCourses: [], // 重命名变量以匹配课程
      // 分页相关数据
      currentPage: 1,
      pageSize: 10,
      total: 0,
      tableHeight: 500
    }
  },
  methods: {
    ...mapActions('smartPrep', ['fetchCourseList', 'deleteAllCourses', 'bulkDeleteCourses']), // 如果模块名仍为 'smartPrep'
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    goToCreate() {
      this.$router.push({ name: 'CourseUpload' })
    },
    viewCourse(displayId) {
      console.log("点击查看按钮，displayId:", displayId);
      this.$router.push({ 
            name: 'CourseDetail', // 确保 'CourseDetail' 是您在路由中为 'course/detail/:displayId' 定义的 name
            params: { displayId: displayId } // 关键：将 displayId 作为参数传递
        })
    },

    async delAll() {
      try {
        await this.$confirm('此操作将永久删除所有课程及其相关数据(大纲、教案、知识点等), 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.deleteAllCourses()
        this.$message.success('全部删除成功')
        this.fetchCourseList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    handleSelectionChange(selection) {
      this.selectedCourses = selection
    },

    async bulkDel() {
      if (this.selectedCourses.length === 0) {
        this.$message.warning('请先选择要删除的课程')
        return
      }

      try {
        await this.$confirm(`此操作将永久删除选中的 ${this.selectedCourses.length} 个课程及其相关数据, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const displayIds = this.selectedCourses.map(course => course.display_id)
        await this.bulkDeleteCourses(displayIds)
        this.$message.success('批量删除成功')
        this.fetchCourseList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量删除失败')
        }
      }
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchCourseList({ page: this.currentPage, size: this.pageSize })
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchCourseList({ page: this.currentPage, size: this.pageSize })
    }
  },

  mounted() {
    this.$nextTick(() => {
      const windowHeight = window.innerHeight
      this.tableHeight = windowHeight - 300
    })
  },

  created() {
    this.fetchCourseList()
  }
}
</script>

<style scoped>
.course-list { /* 重命名最外层类名 */
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
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

.button-group {
  display: flex;
  gap: 10px;
}

.table-wrapper {
  margin-bottom: 20px;
}

.table-wrapper .el-table {
  width: 100%;
}

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