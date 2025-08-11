<template>
  <div class="exercise-list">
    <h1 class="page-title">习题列表</h1>
    
    <el-card class="list-card">
      <div class="card-header">
        <h2>习题管理</h2>
        <el-button type="primary" @click="goToCreate">创建新习题</el-button>
      </div>
      
      <el-table 
        :data="exercises" 
        v-loading="loading"
        style="width: 100%"
      >
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
            <el-button 
              size="mini" 
              @click="viewExercise(scope.row.id)"
            >查看</el-button>
            <el-button 
              size="mini" 
              type="primary" 
              @click="submitAnswer(scope.row)"
            >提交</el-button>
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
  methods: {
    ...mapActions('exercise', ['fetchExercises']),
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
    viewExercise(id) {
      this.$router.push(`/ExerciseAssessment/detail/${id}`)
    },
    submitAnswer(exercise) {
      this.$router.push({
        path: '/ExerciseAssessment/submit',
        query: { exerciseId: exercise.id }
      })
    }
  },
  created() {
    this.fetchExercises()
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