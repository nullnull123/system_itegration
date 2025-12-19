<template>
  <div class="exercise-list">
    <h1 class="page-title">习题列表</h1>
    
    <el-card class="list-card">
      <div class="card-header">
        <h2>习题管理</h2>
        <div class="button-group">
          <!-- 只有教师显示创建按钮 -->
          <el-button 
            v-if="userRole === 'teacher'" 
            type="primary" 
            @click="goToCreate"
          >
            创建新习题
          </el-button>

          <!-- 提交记录按钮 -->
          <el-button
            v-if="userRole === 'teacher'"
            size="mini"
            type="primary"
            @click="goSubmissions"
          >
            查看提交记录
          </el-button>

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

      <!-- 表格容器 -->
      <div class="table-wrapper">
        <!-- 使用计算属性 filteredAndSortedExercises 作为表格的数据源 -->
        <el-table 
          :data="filteredAndSortedExercises" 
          v-loading="loading"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          :height="tableHeight"
          max-height="600"
          border
        >
          <!-- 选择列：放在最前面 -->
          <el-table-column type="selection" width="55"></el-table-column>

          <!-- 添加显示 Display ID 的列 -->
          <el-table-column prop="display_id" label="显示ID" width="80"></el-table-column>
          
          <!-- 添加课程显示ID列 -->
          <el-table-column prop="course_display_id" label="课程ID" width="100"></el-table-column>
          
          <el-table-column prop="title" label="标题" min-width="200"></el-table-column>
          <el-table-column prop="subject" label="学科" width="100"></el-table-column>
          <el-table-column prop="grade" label="年级" width="100"></el-table-column>
          <el-table-column prop="question_type" label="题型" width="100">
            <template #default="scope">
              {{ getQuestionTypeLabel(scope.row.question_type) }}
            </template>
          </el-table-column>
          <el-table-column prop="difficulty" label="难度" width="100">
            <template #default="scope">
              {{ getDifficultyLabel(scope.row.difficulty) }}
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="创建时间" width="180">
            <template #default="scope">
              {{ formatDate(scope.row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="scope">
              <!-- 修改：传递 display_id -->
              <el-button 
                size="mini" 
                type="primary" 
                @click="viewExercise(scope.row.display_id)"
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
  name: 'ExerciseListPage',
  computed: {
    ...mapState('exercise', ['exercises', 'loading', 'error']),
    // 新增一个计算属性来处理排序和过滤逻辑
    filteredAndSortedExercises() {
      if (!this.exercises || this.exercises.length === 0) {
        return [];
      }

      let filteredExercises = [];
      console.log(this.userRole);
      if (this.userRole === 'student') {
        // 学生只看当前课程的习题
        filteredExercises = this.exercises.filter(exercise => 
          exercise.course_display_id === parseInt(this.courseDisplayId)
        );
      } else {
        // 教师看所有习题
        filteredExercises = [...this.exercises];
      }

      // 按照 course_display_id 从小到大排序
      filteredExercises.sort((a, b) => a.course_display_id - b.course_display_id);

      // 将与传入的coursedisplayId相同的习题移到最前面
      const targetCourseExercises = filteredExercises.filter(exercise => 
        exercise.course_display_id === parseInt(this.courseDisplayId)
      );
      const otherExercises = filteredExercises.filter(exercise => 
        exercise.course_display_id !== parseInt(this.courseDisplayId)
      );

      // 合并数组：先放目标课程的习题，再放其他课程的习题
      return [...targetCourseExercises, ...otherExercises];
    }
  },
  data() {
    return {
      selectedExercises: [],// 用于存储选中的习题
      currentPage: 1,
      pageSize: 10,
      total: 0,  // 添加这行 - 你已经在用了但没声明
      // 添加表格高度相关数据
      tableHeight: 500,
      courseDisplayId: null, // 存储从路由获取的课程ID
      userRole: null // 存储用户角色
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
      this.$router.push({
          name: 'ExerciseCreate',
          query: { coursedisplayId: this.courseDisplayId }
        });
    },
    goSubmissions() {
      this.$router.push({
          name: 'ExerciseSubmissions'
        });
    },
    // 修改：参数名改为 displayId 以明确其含义
    viewExercise(displayId) {
      // 修改：将 displayId 作为 params 传递，并保留 role 作为 query 参数
      this.$router.push({
        name: 'ExerciseDetail',
        params: { display_id: displayId }, // 使用 params 传递路径参数
        query: { role: this.userRole }         // 保留 query 传递用户角色
      });
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
    // 从路由参数中获取课程ID和用户角色
    this.courseDisplayId = this.$route.query.coursedisplayId;
    this.userRole = this.$route.query.role;
    
    // 获取习题列表
    this.fetchList();
  },
  // 移除了 watch 部分，逻辑已移至计算属性
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

/* 添加或修改表格包装器样式 */
.table-wrapper {
  margin-bottom: 20px;
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

/* 高亮目标课程习题的样式 (如果需要，可以使用行的类名) */
/* 例如，如果想给特定行加样式，可以使用 :row-class-name */
/* .table-wrapper .el-table >>> .target-course-row { background-color: #f0f9ff !important; } */

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