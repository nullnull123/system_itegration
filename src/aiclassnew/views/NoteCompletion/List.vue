<template>
  <div class="note-list-container">
    <div class="header-section">
      <h1 class="page-title">学生笔记管理</h1>
      <div class="header-actions">
        <el-button
          type="primary"
          size="large"
          @click="goToUpload"
          class="upload-btn"
        >
          <!-- 移除 Element Plus 图标，使用 Element UI 图标 -->
          <i class="el-icon-plus"></i>
          上传笔记
        </el-button>
        <el-button
          type="danger"
          size="large"
          @click="handleDeleteAll"
          class="delete-all-btn"
        >
          <i class="el-icon-delete"></i>
          删除所有
        </el-button>
      </div>
    </div>

    <el-card class="list-card">
      <div class="card-header">
        <h2>笔记列表</h2>
        <div class="button-group">
          <el-button
            size="mini"
            type="warning"
            @click="handleBulkDelete"
            :disabled="selectedNotes.length === 0"
            :loading="loading"
          >
            批量删除 ({{ selectedNotes.length }})
          </el-button>
        </div>
      </div>

      <div class="table-wrapper">
        <el-table
          :data="notes"
          v-loading="loading"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          height="500"
          border
        >
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="display_id" label="ID" width="80"></el-table-column>
          <el-table-column prop="title" label="标题" min-width="200"></el-table-column>
          <el-table-column prop="subject" label="学科" width="100"></el-table-column>
          <el-table-column prop="grade" label="年级" width="100"></el-table-column>
          <!-- 新增：显示课程编码 -->
          <el-table-column
            prop="course_display_id"
            label="课程编码"
            width="120"
            :formatter="formatCourseDisplayId"
          ></el-table-column>
          <el-table-column prop="is_completed" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.is_completed ? 'success' : 'info'">
                {{ scope.row.is_completed ? '已补全' : '未补全' }}
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
                type="primary"
                @click="viewNote(scope.row.display_id)"
              >
                查看
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          background
        >
        </el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
// 移除 Element Plus 图标导入
// import { Plus, Delete } from '@element-plus/icons-vue'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'NoteListPage',
  // 移除 components 定义
  // components: {
  //   Plus,
  //   Delete,
  // },
  data() {
    return {
      selectedNotes: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
    }
  },
  computed: {
    ...mapState('noteCompletion', ['notes', 'loading', 'error']),
  },
  methods: {
    ...mapActions('noteCompletion', ['fetchList', 'deleteAllNotes', 'bulkDeleteNotes']),
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    formatCourseDisplayId(row) {
      // 如果 course_display_id 为 null 或 undefined，显示 "未关联"
      return row.course_display_id || '未关联'
    },
    goToUpload() {
      this.$router.push('/NoteCompletion/upload')
    },
    viewNote(displayId) {
      this.$router.push(`/NoteCompletion/detail/${displayId}`)
    },
    async handleDeleteAll() {
      try {
        await this.$confirm('此操作将永久删除所有笔记, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        await this.deleteAllNotes()
        this.$message.success('全部删除成功')
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败')
        }
      }
    },
    handleSelectionChange(selection) {
      this.selectedNotes = selection
    },
    async handleBulkDelete() {
      if (this.selectedNotes.length === 0) {
        this.$message.warning('请先选择要删除的笔记')
        return
      }
      try {
        await this.$confirm(`此操作将永久删除选中的 ${this.selectedNotes.length} 个笔记, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
        const displayIds = this.selectedNotes.map(note => note.display_id)
        await this.bulkDeleteNotes(displayIds)
        this.$message.success('批量删除成功')
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量删除失败')
        }
      }
    },
    handleSizeChange(val) {
      this.pageSize = val
      this.fetchList({ page: this.currentPage, size: this.pageSize })
    },
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchList({ page: this.currentPage, size: this.pageSize })
    },
  },
  created() {
    this.fetchList()
  },
}
</script>

<style scoped>
.note-list-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  background-color: #f5f7fa;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.header-actions .el-button {
  margin-left: 10px;
}

.list-card {
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.card-header h2 {
  font-size: 20px;
  font-weight: 500;
  margin: 0;
  color: #303133;
}

.table-wrapper {
  margin: 20px 0;
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .header-actions {
    display: flex;
    gap: 10px;
  }

  .header-actions .el-button {
    flex: 1;
    margin-left: 0;
  }

  .card-header {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .button-group {
    align-self: flex-end;
  }
}
</style>