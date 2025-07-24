<template>
  <div class="container">
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div class="container-fluid">
        <!-- <a class="navbar-brand" href="/">计算机专业知识图谱</a> -->
        <router-link to="/RelationExtraction" class="navbar-brand">计算机专业知识图谱</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse head" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <!-- <a class="nav-link" href="/">知识图谱</a> -->
              <router-link to="/RelationExtraction" class="nav-link">知识图谱</router-link>
            </li>
            <li class="nav-item">
              <!-- <a class="nav-link active" href="/admin">管理面板</a> -->
              <router-link to="/DataAcquisition" class="nav-link" active-class="active">管理面板</router-link>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <div class="row">
      <div class="col-md-12">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h4>知识图谱采集管理</h4>
          </div>
          <div class="card-body">
            <!-- 采集进度卡片 -->
            <div class="collection-card">
              <div class="d-flex justify-content-between align-items-center contect_up">
                <h5>当前采集进度</h5>
                <span class="badge bg-secondary">自动刷新: {{ autoRefreshEnabled ? '启用' : '禁用' }}</span>
              </div>
              
              <!-- 状态标识 -->
              <div :class="['status-badge', statusClass]">{{ statusText }}</div>
              
              <div class="row contect_down">
                <div class="col-md-6 contect_down_l">
                  <p><strong>已完成批次:</strong> {{ lastBatch }} / {{ totalBatches }}</p>
                  <p><strong>上次更新时间:</strong> {{ lastUpdated }}</p>
                  <p><strong>已处理主题数:</strong> {{ processedTopics.length }}</p>
                  
                  <div class="mt-3">
                    <p><strong>已处理主题:</strong></p>
                    <div class="processed-topics">
                      <ul v-if="processedTopics.length" class="text-muted contect_show">
                        <li v-for="topic in processedTopics" :key="topic">{{ topic }}</li>
                      </ul>
                      <p v-else class="text-muted contect_show">暂无处理记录</p>
                    </div>
                  </div>
                </div>
                
                <div class="col-md-6  contect_down_r">
                  <p><strong>采集进度:</strong></p>
                  <div class="progress">
                    <div 
                      class="progress-bar progress-bar-striped progress-bar-animated"
                      role="progressbar"
                      :style="{ width: progressValue + '%' }"
                    ></div>
                  </div>
                  <p class="text-end mt-1">{{ progressValue }}%</p>
                  
                  <div class="form-check form-switch mt-4">
                    <input 
                      class="form-check-input" 
                      type="checkbox" 
                      id="auto-refresh" 
                      v-model="autoRefreshEnabled"
                    >
                    <label class="form-check-label" for="auto-refresh">自动刷新进度 (每10秒)</label>
                  </div>
                  <button @click="fetchProgressInfo" class="btn btn-sm btn-outline-secondary mt-2">立即刷新</button>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <h5>采集操作</h5>
              <div class="row collect">
                <div class="col-md-6 collect_left">
                  <div class="card">
                    <div class="card-body">
                      <h6 class="card-title">继续采集</h6>
                      <p class="card-text">从上次停止的地方继续采集知识点，自动创建新批次。</p>
                      <button 
                        @click="runCollection('continue')" 
                        :disabled="isRunning"
                        class="btn btn-primary"
                      >继续采集</button>
                    </div>
                  </div>
                </div>
                <div class="col-md-6 collect_right">
                  <div class="card">
                    <div class="card-body">
                      <h6 class="card-title">重新采集</h6>
                      <p class="card-text">重置所有进度，从头开始采集知识点。</p>
                      <button 
                        @click="confirmReset" 
                        :disabled="isRunning"
                        class="btn btn-danger"
                      >重新采集</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 提示信息 -->
            <div v-if="successMessage" class="alert alert-success mt-3">{{ successMessage }}</div>
            <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      baseUrl:'https://617315e9-57e5-48d3-a6fa-9afa611495d7.mock.pstmn.io/',
      autoRefreshEnabled: true,
      refreshInterval: null,
      lastBatch: 0,
      totalBatches: 100,
      lastUpdated: '未知',
      processedTopics: [],
      progressValue: 0,
      currentStatus: 'idle',
      successMessage: '',
      errorMessage: '',
      isRunning: false
    }
  },
  computed: {
    statusClass() {
      return {
        'status-running': this.currentStatus === 'running',
        'status-completed': this.currentStatus === 'completed',
        'status-error': this.currentStatus === 'error',
        'status-idle': this.currentStatus === 'idle'
      }
    },
    statusText() {
      const statusMap = {
        'running': '采集中',
        'completed': '已完成',
        'error': '出错',
        'idle': '空闲'
      }
      return statusMap[this.currentStatus] || '未知'
    }
  },
  mounted() {
    this.startAutoRefresh()
  },
  beforeDestroy() {
    this.stopAutoRefresh()
  },
  methods: {
    startAutoRefresh() {
      this.stopAutoRefresh()
      if (this.autoRefreshEnabled) {
        this.refreshInterval = setInterval(this.fetchProgressInfo, 10000)
      }
    },
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
        this.refreshInterval = null
      }
    },
    async fetchProgressInfo() {
      try {
        const response = await fetch('https://617315e9-57e5-48d3-a6fa-9afa611495d7.mock.pstmn.io//get_collection_progress')
        const data = await response.json()
        if (data.success) {
          this.updateProgress(data.progress)
        }
      } catch (error) {
        console.error('获取进度失败:', error)
        this.errorMessage = '获取进度信息失败'
      }
    },
    updateProgress(progress) {
      this.lastBatch = progress.last_batch || 0
      this.totalBatches = progress.total_batches || 100
      this.lastUpdated = progress.last_updated || '未知'
      this.processedTopics = progress.processed_topics || []
      this.progressValue = progress.total_batches > 0 
        ? ((progress.last_batch / progress.total_batches) * 100).toFixed(1)
        : 0
      this.currentStatus = progress.status || 'idle'
    },
    async runCollection(type) {
      this.isRunning = true
      try {
        const formData = new FormData()
        formData.append('collection_type', type)
        
        const response = await fetch('https://617315e9-57e5-48d3-a6fa-9afa611495d7.mock.pstmn.io//run_collection', {
          method: 'POST',
          body: formData
        })
        
        const data = await response.json()
        if (data.success) {
          this.successMessage = data.message
          this.currentStatus = 'running'
          setTimeout(this.fetchProgressInfo, 1000)
        } else {
          this.errorMessage = data.error
        }
      } catch (error) {
        this.errorMessage = '请求失败: ' + error.message
      } finally {
        this.isRunning = false
      }
    },
    confirmReset() {
      if (confirm('确定要重置所有进度并重新开始采集吗？这将删除当前的采集进度。')) {
        this.runCollection('reset')
      }
    }
  }
}
</script>

<style scoped>
/* 保持原有样式不变，添加scoped限制作用域 */
.card {
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.collection-card {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 5px;
  margin-bottom: 20px;
}
.progress {
  height: 25px;
  font-size: 14px;
  font-weight: bold;
  margin: 15px 0;
}
.action-buttons {
  margin-top: 20px;
}
.alert {
  margin-top: 20px;
}
.status-badge {
  padding: 5px 10px;
  border-radius: 15px;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 10px;
}
.status-running { background-color: #28a745; color: white; }
.status-completed { background-color: #007bff; color: white; }
.status-idle { background-color: #6c757d; color: white; }
.status-error { background-color: #dc3545; color: white; }
.processed-topics {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  background-color: #fff;

}
.container-fluid{
  display: flex; /* 启用 Flexbox */
  justify-content: space-between; /* 左右分布 */
  width: 30%; /* 确保容器宽度足够 */
}
.navbar-nav{
  display: flex; /* 启用 Flexbox */
  justify-content: space-between; /* 左右分布 */
  width: 100%; /* 确保容器宽度足够 */
}
.head{
    width: 50%;
}
.contect_up{
  display: flex; /* 启用 Flexbox */
  justify-content: space-between; /* 左右分布 */
  width: 100%; /* 确保容器宽度足够 */
}
.contect_down{
  display: flex; /* 启用 Flexbox */
  justify-content: space-between; /* 左右分布 */
  width: 100%; /* 确保容器宽度足够 */
}
.contect_down_l{
    width: 48%;
}

.contect_down_r{
    width: 48%;
}
.collect{
  display: flex;
  justify-content: space-between; /* 左右分布 */
  width: 100%;
}

.collect_left{
    width: 48%;
}

.collect_right{
    width: 48%;
    padding: 0;
}
.contect_show{
  height: 200px;
}
</style>