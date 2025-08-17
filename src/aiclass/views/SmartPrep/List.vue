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

      <!-- 表格 -->
      <el-table
        :data="preps"
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <!-- 选择列：放在最前面 -->
        <el-table-column type="selection" width="55"> </el-table-column>

        <!-- 数据列 -->
        <el-table-column prop="display_id" label="显示ID" width="100"></el-table-column>
        <el-table-column prop="title" label="标题" width="200"></el-table-column>
        <el-table-column prop="subject" label="学科" width="100"></el-table-column>
        <el-table-column prop="grade" label="年级" width="100"></el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <!-- 查看按钮 -->
            <el-button size="mini" @click="viewPrep(scope.row.display_id)">
              查看
            </el-button>
          </template>
        </el-table-column>

        
      </el-table>
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
      selectedLessons: []// 用于存储选中的教案
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
    }


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
</style>