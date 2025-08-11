<template>
  <div class="exercise-submissions">
    <h1 class="page-title">提交记录</h1>
    
    <el-card class="submissions-card">
      <div class="card-header">
        <h2>我的提交记录</h2>
      </div>
      
      <el-table 
        :data="submissions" 
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="exercise_title" label="习题标题" width="200"></el-table-column>
        <el-table-column prop="exercise_subject" label="学科" width="100"></el-table-column>
        <el-table-column prop="exercise_grade" label="年级" width="100"></el-table-column>
        <el-table-column prop="submitted_at" label="提交时间" width="180">
          <template slot-scope="scope">
            {{ formatDate(scope.row.submitted_at) }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="分数" width="80"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template slot-scope="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusLabel(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100">
          <template slot-scope="scope">
            <el-button 
              size="mini" 
              @click="viewSubmission(scope.row.id)"
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
  name: 'ExerciseSubmissionsPage',
  computed: {
    ...mapState('exercise', ['submissions', 'loading', 'error'])
  },
  methods: {
    ...mapActions('exercise', ['fetchSubmissions']),
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    getStatusLabel(status) {
      const labels = {
        'pending': '待批改',
        'graded': '已批改',
        'submitted': '已提交'
      }
      return labels[status] || status
    },
    getStatusType(status) {
      const types = {
        'pending': 'info',
        'graded': 'success',
        'submitted': 'warning'
      }
      return types[status] || 'info'
    },
    viewSubmission(id) {
      this.$router.push(`/ExerciseAssessment/submissions/${id}`)
    }
  },
  created() {
    this.fetchSubmissions()
  }
}
</script>

<style scoped>
.exercise-submissions {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.page-title {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}
.submissions-card {
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