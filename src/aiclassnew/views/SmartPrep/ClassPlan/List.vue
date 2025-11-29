<template>
  <div class="class-plan-list">
    <h1 class="page-title">教学计划列表</h1>

    <el-card class="list-card">
      <div class="card-header">
        <h2>教学计划管理</h2>
        <div class="button-group">
          <!-- 教学计划通常不提供手动创建，因为它与知识列表关联，可能在创建知识列表时自动生成 -->
          <!-- <el-button type="primary" @click="goToCreate">创建新教学计划</el-button> -->
          <!-- 教学计划的删除通常也不直接提供，而是随课程或大纲删除 -->
          <!-- <el-button
            size="mini"
            type="danger"
            @click="delAll"
            :loading="loading"
          >
            全部删除
          </el-button> -->
        </div>
      </div>

      <!-- 表格容器 -->
      <div class="table-wrapper">
        <el-table
          :data="classPlans"
          v-loading="loading"
          style="width: 100%"
          :height="tableHeight"
          max-height="600"
          border
        >
          <!-- 数据列 -->
          <el-table-column prop="display_id" label="显示ID" width="100"></el-table-column>
          <el-table-column prop="course_name" label="课程名" min-width="150"></el-table-column>
          <el-table-column prop="outline_title" label="大纲标题" min-width="150"></el-table-column>
          <el-table-column prop="knowledge_list_display_id" label="关联知识列表ID" width="150"></el-table-column>
          <el-table-column prop="outline_display_id" label="关联大纲ID" width="120"></el-table-column>
          <el-table-column prop="is_active" label="是否激活" width="100">
            <template slot-scope="scope">
              <el-tag :type="scope.row.is_active ? 'success' : 'info'">
                {{ scope.row.is_active ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="plan_version" label="版本" width="80"></el-table-column>
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
          <el-table-column label="操作" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                @click="viewClassPlan(scope.row.display_id)"
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
// 注意：这里假设 Vuex store 已经更新为 'classPlan' 模块或 'smartPrep' 模块中包含了教学计划相关的 actions
// 如果没有，请确保 Vuex 中有对应的 actions 和 state
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ClassPlanListPage', // 重命名组件
  computed: {
    ...mapState('smartPrep', ['classPlans', 'loading', 'error']) // 如果模块名仍为 'smartPrep' 并且包含了 classPlans
  },
  data() {
    return {
      // 教学计划通常不提供全选删除或批量删除
      // selectedClassPlans: [],
      // 分页相关数据
      currentPage: 1,
      pageSize: 10,
      total: 0,
      tableHeight: 500
    }
  },
  methods: {
    ...mapActions('smartPrep', ['fetchClassPlanList']), // 如果模块名仍为 'smartPrep'
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    // goToCreate() {
    //   // 教学计划通常不直接创建
    //   this.$router.push('/classplan/upload') // 假设有个创建页面，但实际可能没有
    // },
    viewClassPlan(displayId) {
      console.log("点击查看按钮，displayId:", displayId);
      this.$router.push(`/classplan/detail/${displayId}`) // 路由改为 /classplan/detail/:displayId
    },

    // delAll() {
    //   // 教学计划通常不提供全删，因为它与知识列表/大纲关联
    //   this.$message.info("教学计划通常随知识列表或大纲一同管理，暂无全删功能。");
    // },

    // handleSelectionChange(selection) {
    //   this.selectedClassPlans = selection
    // },

    // bulkDel() {
    //   // 教学计划通常不提供批量删除
    //   this.$message.info("教学计划通常随知识列表或大纲一同管理，暂无批量删除功能。");
    // },

    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchClassPlanList({ page: this.currentPage, size: this.pageSize })
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchClassPlanList({ page: this.currentPage, size: this.pageSize })
    }
  },

  mounted() {
    this.$nextTick(() => {
      const windowHeight = window.innerHeight
      this.tableHeight = windowHeight - 300
    })
  },

  created() {
    this.fetchClassPlanList()
  }
}
</script>

<style scoped>
.class-plan-list { /* 重命名最外层类名 */
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