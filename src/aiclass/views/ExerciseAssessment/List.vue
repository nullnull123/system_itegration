<template>
  <div class="exercise-list">
    <h1 class="page-title">习题列表</h1>
    
    <el-card class="list-card">
      <div class="card-header">
        <h2>习题管理</h2>
        <div class="button-group">

          <el-button type="primary" @click="goToCreate">创建新习题</el-button>

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
            :disabled="selectedExercises.length === 0"
            :loading="loading"
          >
            批量删除
          </el-button>
        </div>
      </div>


      
      <el-table 
        :data="exercises" 
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <!-- 选择列：放在最前面 -->
        <el-table-column type="selection" width="55"> </el-table-column>


        <!-- 添加显示 Display ID 的列 -->
        <el-table-column prop="display_id" label="显示ID" width="80"></el-table-column>
        <el-table-column prop="title" label="标题" width="200"></el-table-column>
        <el-table-column prop="subject" label="学科" width="100"></el-table-column>
        <el-table-column prop="grade" label="年级" width="100"></el-table-column>
        <el-table-column prop="question_type" label="题型" width="100">
          <template slot-scope="scope">
            {{ getQuestionTypeLabel(scope.row.question_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="100">
          <template slot-scope="scope">
            {{ getDifficultyLabel(scope.row.difficulty) }}
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template slot-scope="scope">
            <!-- 修改：传递 display_id -->
            <el-button 
              size="mini" 
              type="primary" 
              @click="viewExercise(scope.row.display_id)"
            >查看</el-button>
            <!-- 修改：传递 display_id -->
            
          </template>
        </el-table-column>


      </el-table>
    </el-card>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ExerciseListPage',
  computed: {
    ...mapState('exercise', ['exercises', 'loading', 'error'])
  },
  data() {
    return {
      selectedExercises: []// 用于存储选中的习题
    }
  },
  methods: {
    ...mapActions('exercise', ['fetchList', 'deleteAllExercises', 'bulkDeleteExercises']),
    getQuestionTypeLabel(type) {
      const types = {
        'MCQ': '单选题',
        'MAQ': '多选题',
        'TF': '判断题',
        'FILL': '填空题',
        'SHORT': '简答题'
      }
      return types[type] || type
    },
    getDifficultyLabel(difficulty) {
      const labels = ['简单', '中等', '困难']
      // 假设 difficulty 是数字 1, 2, 3
      return labels[difficulty - 1] || difficulty
    },
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    goToCreate() {
      this.$router.push('/ExerciseAssessment/create')
    },
    // 修改：参数名改为 displayId 以明确其含义
    viewExercise(displayId) {
      // 修改：路由路径中使用 displayId
      this.$router.push(`/ExerciseAssessment/detail/${displayId}`)
    },
    
    // 全删除方法
    async delAll() {
      try {
        await this.$confirm('此操作将永久删除所有教案, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.deleteAllExercises()
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
      this.selectedExercises = selection
    },

    // 批量删除方法
    async bulkDel() {
      if (this.selectedExercises.length === 0) {
        this.$message.warning('请先选择要删除的教案')
        return
      }

      try {
        await this.$confirm(`此操作将永久删除选中的 ${this.selectedExercises.length} 个教案, 是否继续?`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        
        const displayIds = this.selectedExercises.map(note => note.display_id)
        await this.bulkDeleteExercises(displayIds)
        this.$message.success('批量删除成功')
        this.fetchList()
        // this.selectedExercises = [] // 这行可以去掉，因为表格会自动更新
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
.exercise-list {
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