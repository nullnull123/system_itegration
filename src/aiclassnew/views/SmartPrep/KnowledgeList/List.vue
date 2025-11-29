<template>
  <div class="knowledge-list">
    <h1 class="page-title">知识列表</h1>

    <el-card class="list-card">
      <div class="card-header">
        <h2>知识列表管理</h2>
        <div class="button-group">
          <!-- 知识列表通常不提供手动创建，因为它与课程关联，可能在创建大纲时自动生成 -->
          <!-- <el-button type="primary" @click="goToCreate">创建新知识列表</el-button> -->
          <!-- 知识列表的删除通常也不直接提供，而是随课程或大纲删除 -->
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
          :data="knowledgeLists"
          v-loading="loading"
          style="width: 100%"
          :height="tableHeight"
          max-height="600"
          border
        >
          <!-- 数据列 -->
          <el-table-column prop="display_id" label="显示ID" width="100"></el-table-column>
          <el-table-column prop="course_display_id" label="关联课程ID" width="120"></el-table-column>
          <el-table-column prop="course_name" label="关联课程名" min-width="150"></el-table-column>
          <el-table-column prop="points_count" label="知识点总数" width="120"></el-table-column>
          <el-table-column prop="key_points_count" label="重点数量" width="100"></el-table-column>
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
                @click="viewKnowledgeList(scope.row.display_id)"
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
// 注意：这里假设 Vuex store 已经更新为 'knowledge' 模块或 'smartPrep' 模块中包含了知识列表相关的 actions
// 如果没有，请确保 Vuex 中有对应的 actions 和 state
import { mapState, mapActions } from 'vuex'

export default {
  name: 'KnowledgeListPage', // 重命名组件
  computed: {
    ...mapState('smartPrep', ['knowledgeLists', 'loading', 'error']) // 如果模块名仍为 'smartPrep' 并且包含了 knowledgeLists
  },
  data() {
    return {
      // 知识列表通常不提供全选删除或批量删除
      // selectedKnowledgeLists: [],
      // 分页相关数据
      currentPage: 1,
      pageSize: 10,
      total: 0,
      tableHeight: 500
    }
  },
  methods: {
    ...mapActions('smartPrep', ['fetchKnowledgeList']), // 如果模块名仍为 'smartPrep'
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString()
    },
    // goToCreate() {
    //   // 知识列表通常不直接创建
    //   this.$router.push('/knowledge/upload') // 假设有个创建页面，但实际可能没有
    // },
    viewKnowledgeList(displayId) {
      console.log("点击查看按钮，displayId:", displayId);
      this.$router.push(`/knowledge/detail/${displayId}`) // 路由改为 /knowledge/detail/:displayId
    },

    // delAll() {
    //   // 知识列表通常不提供全删，因为它与课程关联
    //   this.$message.info("知识列表通常随课程或大纲一同管理，暂无全删功能。");
    // },

    // handleSelectionChange(selection) {
    //   this.selectedKnowledgeLists = selection
    // },

    // bulkDel() {
    //   // 知识列表通常不提供批量删除
    //   this.$message.info("知识列表通常随课程或大纲一同管理，暂无批量删除功能。");
    // },

    handleSizeChange(val) {
      this.pageSize = val
      this.currentPage = 1
      this.fetchKnowledgeList({ page: this.currentPage, size: this.pageSize })
    },

    handleCurrentChange(val) {
      this.currentPage = val
      this.fetchKnowledgeList({ page: this.currentPage, size: this.pageSize })
    }
  },

  mounted() {
    this.$nextTick(() => {
      const windowHeight = window.innerHeight
      this.tableHeight = windowHeight - 300
    })
  },

  created() {
    this.fetchKnowledgeList()
  }
}
</script>

<style scoped>
.knowledge-list { /* 重命名最外层类名 */
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