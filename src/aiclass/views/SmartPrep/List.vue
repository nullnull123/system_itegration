<template>
  <div class="smart-prep-list">
    <h1 class="page-title">智能备课列表</h1>

    <el-card class="list-card">
      <div class="card-header">
        <h2>备课管理</h2>
        <div class="button-group">
          <el-button type="primary" @click="goToUpload">创建新备课</el-button>
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
            :disabled="selectedLessons.length === 0"
            :loading="loading"
          >
            批量删除
          </el-button>
        </div>
      </div>

      
      <!-- 表格容器 -->
      <div class="table-wrapper">
        <el-table 
          :data="preps" 
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
          <el-table-column prop="is_optimized" label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.is_optimized ? 'success' : 'info'">
                {{ scope.row.is_optimized ? '已补全' : '未补全' }}
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
                @click="viewPrep(scope.row.display_id)"
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
import { mapState, mapActions } from 'vuex'

export default {
  name: 'SmartPrepListPage',
  computed: {
    ...mapState('smartPrep', ['preps', 'loading', 'error'])
  },
  data() {
    return {
      selectedLessons: [],// 用于存储选中的教案
      // 分页相关数据
      currentPage: 1,
      pageSize: 10,
      total: 0,  // 添加这行 - 你已经在用了但没声明
      // 添加表格高度相关数据
      tableHeight: 500
    }
  },
  methods: {
    ...mapActions('smartPrep', ['fetchList', 'deleteAllLessons', 'bulkDeleteLessons']),
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    goToUpload() {
      this.$router.push('/SmartPrep/upload')
    },
    // 修改这里：参数名改为 displayId
    viewPrep(displayId) {
      // 修改这里：路由路径中使用 displayId
      console.log("点击查看按钮，displayId:", displayId); // 添加调试日志
      this.$router.push(`/SmartPrep/detail/${displayId}`)
    },


    // 全删除方法
    async delAll() {
      try {
        await this.$confirm('此操作将永久删除所有教案, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.deleteAllLessons()
        this.$message.success('全部删除成功')
        // 删除成功后刷新列表
        this.fetchList()
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
        await this.bulkDeleteLessons(displayIds)
        this.$message.success('批量删除成功')
        this.fetchList()
        // this.selectedLessons = [] // 这行可以去掉，因为表格会自动更新
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
      this.fetchList({ page: this.currentPage, size: this.pageSize })
    },
    
    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchList({ page: this.currentPage, size: this.pageSize })
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
    this.fetchList()
  }
}
</script>

<style scoped>
.smart-prep-list {
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