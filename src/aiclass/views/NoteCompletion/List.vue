<template>
  <div class="note-list">
    <h1 class="page-title">笔记列表</h1>
    
    <el-card class="list-card">
      <div class="card-header">
        <h2>笔记管理</h2>
        <div class="button-group">
          <el-button type="primary" @click="goToUpload">创建新笔记</el-button>
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
            :disabled="selectedNotes.length === 0"
            :loading="loading"
          >
            批量删除
          </el-button>
        </div>
      </div>


      
      <el-table 
        :data="notes" 
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <!-- 选择列：放在最前面 -->
        <el-table-column type="selection" width="55"> </el-table-column>


        <!-- 假设你的 note 对象包含 display_id, title, content 字段 -->
        <el-table-column prop="display_id" label="显示ID" width="100"></el-table-column>
        <el-table-column prop="title" label="标题" width="200"></el-table-column>
        <el-table-column prop="content" label="内容摘要" width="300">
           <template slot-scope="scope">
            {{ scope.row.content ? scope.row.content.substring(0, 50) + '...' : '' }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="updated_at" label="更新时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.updated_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <!-- 修改这里：传递 display_id -->
            <el-button 
              size="mini" 
              @click="viewNote(scope.row.display_id)"
            >查看</el-button>
          </template>
        </el-table-column>


      </el-table>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'NoteListPage',
  computed: {
    ...mapState('noteCompletion', ['notes', 'loading', 'error'])
  },
  data() {
    return {
      selectedNotes: []// 用于存储选中的笔记
    }
  },
  methods: {
    ...mapActions('noteCompletion', ['fetchList', 'deleteAllNotes', 'bulkDeleteNotes']),
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    goToUpload() {
      this.$router.push('/NoteCompletion/upload')
    },
    // 修改这里：参数名改为 displayId
    viewNote(displayId) {
      // 修改这里：路由路径中使用 displayId
      this.$router.push(`/NoteCompletion/detail/${displayId}`)
    },


    // 全删除方法
    async delAll() {
      try {
        await this.$confirm('此操作将永久删除所有教案, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.deleteAllNotes()
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
      this.selectedNotes = selection
    },

    // 批量删除方法
    async bulkDel() {
      if (this.selectedNotes.length === 0) {
        this.$message.warning('请先选择要删除的教案')
        return
      }

      try {
        await this.$confirm(`此操作将永久删除选中的 ${this.selectedNotes.length} 个教案, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const displayIds = this.selectedNotes.map(note => note.display_id)
        await this.bulkDeleteNotes(displayIds)
        this.$message.success('批量删除成功')
        this.fetchList()
        // this.selectedNotes = [] // 这行可以去掉，因为表格会自动更新
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
.note-list {
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