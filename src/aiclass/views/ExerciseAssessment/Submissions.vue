<template>
  <div class="submission-list">
    <h1 class="page-title">提交记录列表</h1>
    
    <el-card class="list-card">
      <div class="card-header">
        <h2>提交记录管理</h2>
        <!-- 移除创建按钮，保留删除相关按钮 -->
        <div class="button-group">
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
            :disabled="selectedSubmissions.length === 0"
            :loading="loading"
          >
            批量删除
          </el-button>
        </div>
      </div>

      <!-- 表格容器 -->
      <div class="table-wrapper">
        <el-table 
          :data="submissions" 
          v-loading="loading"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          :height="tableHeight"
          max-height="600"
          border
        >
          <!-- 选择列：放在最前面 -->
          <el-table-column type="selection" width="55"></el-table-column>

          <!-- 提交记录相关列 -->
          <el-table-column prop="display_id" label="显示ID" width="80"></el-table-column>
          <el-table-column prop="exercise_title" label="习题标题" min-width="200"></el-table-column>
          <el-table-column prop="student_name" label="学生姓名" width="120"></el-table-column>
          <el-table-column prop="score" label="得分" width="80"></el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getStatusTagType(scope.row.status)">
                {{ getStatusLabel(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="submitted_at" label="提交时间" width="180">
            <template slot-scope="scope">
              {{ formatDate(scope.row.submitted_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button 
                size="mini" 
                type="primary" 
                @click="viewSubmission(scope.row.display_id)"
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

      <!-- 提交记录详情弹窗 -->
      <el-dialog
        title="提交记录详情"
        :visible.sync="showDetailDialog"
        width="80%"
        :close-on-click-modal="false"
        v-if="currentSubmission"
      >
        <div class="submission-detail">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="显示ID">{{ currentSubmission.display_id }}</el-descriptions-item>
            <el-descriptions-item label="习题标题">{{ currentSubmission.exercise_title }}</el-descriptions-item>
            <el-descriptions-item label="学生姓名">{{ currentSubmission.student_name }}</el-descriptions-item>
            <el-descriptions-item label="得分">{{ currentSubmission.score }}</el-descriptions-item>
            <el-descriptions-item label="状态">{{ getStatusLabel(currentSubmission.status) }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ formatDate(currentSubmission.submitted_at) }}</el-descriptions-item>
          </el-descriptions>

          <div class="answer-section" v-if="currentSubmission.answer">
            <h3>学生答案</h3>
            <div class="answer-content" v-html="formatAnswerContent(currentSubmission.answer)"></div>
          </div>

          <div class="feedback-section" v-if="currentSubmission.feedback">
            <h3>教师反馈</h3>
            <div class="feedback-content" v-html="formatFeedbackContent(currentSubmission.feedback)"></div>
          </div>
        </div>

        <span slot="footer" class="dialog-footer">
          <el-button @click="showDetailDialog = false">关闭</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'SubmissionListPage',
  computed: {
    ...mapState('exercise', ['submissions', 'loading', 'error'])
  },
  data() {
    return {
      selectedSubmissions: [], // 用于存储选中的提交记录
      currentPage: 1,
      pageSize: 10,
      total: 0,  // 添加这行 - 你已经在用了但没声明
      tableHeight: 500,
      showDetailDialog: false,
      currentSubmission: null
    }
  },
  methods: {
    ...mapActions('exercise', ['fetchSubmissions', 'fetchSubmissionDetail', 'deleteAllSubmissions', 'bulkDeleteSubmissions']),
    
    getStatusLabel(status) {
      const labels = {
        'pending': '待批改',
        'graded': '已批改',
        'returned': '已返回'
      }
      return labels[status] || status
    },
    
    getStatusTagType(status) {
      const types = {
        'pending': 'warning',
        'graded': 'success',
        'returned': 'info'
      }
      return types[status] || 'info'
    },
    
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    
    formatAnswerContent(content) {
      if (!content) return ''
      return content.replace(/\n/g, '<br>')
    },
    
    formatFeedbackContent(content) {
      if (!content) return ''
      return content.replace(/\n/g, '<br>')
    },
    
    // 查看提交记录详情
    async viewSubmission(displayId) {
      try {
        const submission = await this.fetchSubmissionDetail(displayId)
        this.currentSubmission = submission
        this.showDetailDialog = true
      } catch (error) {
        this.$message.error('获取提交记录详情失败: ' + (error.message || '未知错误'))
      }
    },
    
    // 全删除方法
    async delAll() {
      try {
        await this.$confirm('此操作将永久删除所有提交记录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.deleteAllSubmissions()
        this.$message.success('全部删除成功')
        this.fetchSubmissions()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败: ' + (error.message || '未知错误'))
        }
      }
    },

    handleSelectionChange(selection) {
      this.selectedSubmissions = selection
    },

    // 批量删除方法
    async bulkDel() {
      if (this.selectedSubmissions.length === 0) {
        this.$message.warning('请先选择要删除的提交记录')
        return
      }

      try {
        await this.$confirm(`此操作将永久删除选中的 ${this.selectedSubmissions.length} 个提交记录, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const displayIds = this.selectedSubmissions.map(submission => submission.display_id)
        await this.bulkDeleteSubmissions(displayIds)
        this.$message.success('批量删除成功')
        this.fetchSubmissions()
        this.selectedSubmissions = []
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量删除失败: ' + (error.message || '未知错误'))
        }
      }
    },
    
    // 分页相关方法
    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchSubmissions({ page: this.currentPage, size: this.pageSize })
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchSubmissions({ page: this.currentPage, size: this.pageSize })
    }
  },
  mounted() {
    // 动态计算表格高度
    this.$nextTick(() => {
      const windowHeight = window.innerHeight
      this.tableHeight = windowHeight - 300
    })
  },
  created() {
    this.fetchSubmissions({ page: this.currentPage, size: this.pageSize })
  }
}
</script>

<style scoped>
.submission-list {
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

/* 表格包装器样式 */
.table-wrapper {
  margin-bottom: 20px;
}

/* 分页容器样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 提交记录详情样式 */
.submission-detail {
  line-height: 1.6;
}

.answer-section, .feedback-section {
  margin-top: 20px;
}

.answer-section h3, .feedback-section h3 {
  margin-bottom: 10px;
  color: #333;
}

.answer-content, .feedback-content {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
  white-space: pre-wrap;
  min-height: 100px;
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