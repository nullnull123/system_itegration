<template>
  <div class="outline-list">
    <h1 class="page-title">大纲列表</h1>

    <el-card class="list-card">
      <div class="card-header">
        <h2>大纲管理</h2>
        <div class="button-group">
          <el-button type="primary" @click="goToCreate">创建新大纲</el-button>
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
            :disabled="selectedOutlines.length === 0"
            :loading="loading"
          >
            批量删除
          </el-button>
        </div>
      </div>

      <!-- 表格容器 -->
      <div class="table-wrapper">
        <el-table
          :data="outlines"
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
          <el-table-column prop="title" label="标题" min-width="200"></el-table-column>
          <el-table-column prop="subject" label="学科" width="100"></el-table-column>
          <el-table-column prop="grade" label="年级" width="100"></el-table-column>
          <el-table-column prop="course_name" label="所属课程" width="150"></el-table-column>
          <el-table-column prop="total_periods" label="总课时数" width="110"></el-table-column>
          <el-table-column prop="has_knowledge_list" label="有知识列表" width="120">
            <template slot-scope="scope">
              <el-tag :type="scope.row.has_knowledge_list ? 'success' : 'info'">
                {{ scope.row.has_knowledge_list ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="knowledge_points_count" label="知识点数" width="100"></el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template slot-scope="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                @click="viewOutline(scope.row.display_id)"
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
// 注意：这里假设 Vuex store 已经更新为 'outline' 模块或 'smartPrep' 模块中包含了大纲相关的 actions
// 如果没有，请确保 Vuex 中有对应的 actions 和 state
import { mapState, mapActions } from 'vuex'

export default {
  name: 'OutlineListPage', // 重命名组件
  computed: {
    ...mapState('smartPrep', ['outlines', 'loading', 'error']) // 如果模块名仍为 'smartPrep' 并且包含了 outlines
  },
  data() {
    return {
      selectedOutlines: [], // 重命名变量以匹配大纲
      // 分页相关数据
      currentPage: 1,
      pageSize: 10,
      total: 0,
      tableHeight: 500
    }
  },
  methods: {
    ...mapActions('smartPrep', ['fetchOutlineList', 'deleteAllOutlines', 'bulkDeleteOutlines']), // 如果模块名仍为 'smartPrep'
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    goToCreate() {
      this.$router.push('/outline/upload') // 路由改为 /outline/upload
    },
    viewOutline(displayId) {
      console.log("点击查看按钮，displayId:", displayId);
      this.$router.push({ 
            name: 'OutlineDetail', 
            params: { displayId: displayId } // 关键：将 displayId 作为参数传递
        })
    },

    async delAll() {
      try {
        await this.$confirm('此操作将永久删除所有大纲及其相关数据(知识点、教学计划等), 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.deleteAllOutlines()
        this.$message.success('全部删除成功')
        this.fetchOutlineList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },

    handleSelectionChange(selection) {
      this.selectedOutlines = selection
    },

    async bulkDel() {
      if (this.selectedOutlines.length === 0) {
        this.$message.warning('请先选择要删除的大纲')
        return
      }

      try {
        await this.$confirm(`此操作将永久删除选中的 ${this.selectedOutlines.length} 个大纲及其相关数据, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        const displayIds = this.selectedOutlines.map(outline => outline.display_id)
        await this.bulkDeleteOutlines(displayIds)
        this.$message.success('批量删除成功')
        this.fetchOutlineList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量删除失败')
        }
      }
    },

    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchOutlineList({ page: this.currentPage, size: this.pageSize })
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchOutlineList({ page: this.currentPage, size: this.pageSize })
    }
  },

  mounted() {
    this.$nextTick(() => {
      const windowHeight = window.innerHeight
      this.tableHeight = windowHeight - 300
    })
  },

  created() {
    this.fetchOutlineList()
  }
}
</script>

<style scoped>
.outline-list { /* 重命名最外层类名 */
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