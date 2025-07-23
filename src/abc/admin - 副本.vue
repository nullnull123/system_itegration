<template>
  <div class="knowledge-graph-admin">
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div class="container-fluid">
        <!-- <a class="navbar-brand" href="/RelationExtraction" >计算机专业知识图谱</a> -->
        <router-link to="/RelationExtraction" class="navbar-brand">计算机专业知识图谱</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse head" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link to="/RelationExtraction" class="nav-link">知识图谱</router-link>
              <!-- <a class="nav-link" href="/RelationExtraction">知识图谱</a> -->
            </li>
            <li class="nav-item head">
              <router-link to="/DataAcquisition" class="nav-link" active-class="active">管理面板</router-link>
              <!-- <a class="nav-link active" href="/admin">管理面板</a> -->
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <div class="container div_contenct">
      <div class="row">
        <div class="col-md-12">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h4><i class="fas fa-brain me-2"></i>知识图谱采集管理</h4>
            </div>
            <div class="card-body">
              <!-- 采集进度卡片 -->
              <div class="collection-card">

                <div class="d-flex justify-content-between align-items-center contect_up">
                  <h5>当前采集进度</h5>
                  <span id="refresh-indicator" class="badge bg-secondary">自动刷新: {{ autoRefreshEnabled? '启用':'禁用' }}</span>
                </div>
                
                <!-- 状态标识 -->
                <div id="status-badge" class="status-badge" :class="statusClass">
                  {{ statusText }}
                </div>
                
                <div class="row  contect_down">
                  <div class="col-md-6 contect_down_l">
                    <p><strong>已完成批次:</strong> <span id="last-batch">{{ progress.last_batch }}</span> / <span id="total-batches">{{ progress.total_batches }}</span></p>
                    <p><strong>上次更新时间:</strong> <span id="last-updated">{{ progress.last_updated }}</span></p>
                    <p><strong>已处理主题数:</strong> <span id="topic-count">{{ progress.processed_topics.length }}</span></p>
                    
                    <div class="mt-3">
                      <p><strong>已处理主题:</strong></p>
                      <div class="processed-topics" id="topic-list">
                        <ul v-if="progress.processed_topics.length">
                          <li v-for="(topic, index) in progress.processed_topics" :key="index">{{ topic }}</li>
                        </ul>
                        <p v-else class="text-muted">暂无处理记录</p>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6 contect_down_r">
                    <p><strong>采集进度:</strong></p>
                    <div class="progress">
                      <div id="progress-bar" class="progress-bar progress-bar-striped progress-bar-animated"
                          role="progressbar"
                          :style="progressBarStyle">
                      </div>
                    </div>
                    <p class="text-end mt-1"><span id="progress-value">{{ progressValue }}</span>%</p>
                    
                    <div class="form-check form-switch mt-4">
                      <input class="form-check-input" type="checkbox" id="auto-refresh" v-model="autoRefreshEnabled">
                      <label class="form-check-label" for="auto-refresh">自动刷新进度 (每10秒)</label>
                    </div>
                    <button id="refresh-now" class="btn btn-sm btn-outline-secondary mt-2" @click="fetchProgressInfo">
                      <i class="fas fa-sync me-1"></i>立即刷新
                    </button>
                  </div>
                </div>
              </div>

              <!-- 操作按钮区域 -->
              <h5>采集操作</h5>
              <div class="action-buttons ">
                <div class="row collect">
                  <div class="col-md-6 collect_left">
                    <div class="card h-100">
                      <div class="card-body d-flex flex-column">
                        <h6 class="card-title"><i class="fas fa-play-circle me-2"></i>继续采集</h6>
                        <p class="card-text">从上次停止的地方继续采集知识点，自动创建新批次。</p>
                        <div class="mt-auto">
                          <button id="continue-collection" class="btn btn-primary" @click="runCollection('continue')">
                            <i class="fas fa-play me-1"></i>继续采集
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6 collect_right">
                    <div class="card h-100">
                      <div class="card-body d-flex flex-column">
                        <h6 class="card-title"><i class="fas fa-redo-alt me-2"></i>重新采集</h6>
                        <p class="card-text">重置所有进度，从头开始采集知识点。</p>
                        <div class="mt-auto">
                          <button id="reset-collection" class="btn btn-danger" @click="confirmReset">
                            <i class="fas fa-sync-alt me-1"></i>重新采集
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 提示信息 -->
              <div class="alert alert-success" id="success-alert" role="alert" v-if="showSuccessAlert">{{ successMessage }}</div>
              <div class="alert alert-danger" id="error-alert" role="alert" v-if="showErrorAlert">{{ errorMessage }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KnowledgeGraphAdmin',
  data() {
    return {
      autoRefreshEnabled: true,
      refreshInterval: null,
      progress: {
        last_batch: 0,
        total_batches: 0,
        last_updated: ' ',
        processed_topics: [
           
        ],
        status: 'running' // idle, running, completed, error
      },
      showSuccessAlert: false,
      successMessage: '',
      showErrorAlert: false,
      errorMessage: ''
    };
  },
  computed: {
    progressValue() {
      if (this.progress.total_batches > 0) {
        return ((this.progress.last_batch / this.progress.total_batches) * 100).toFixed(1);
      }
      return 0;
    },
    progressBarStyle() {
      return {
        width: `${this.progressValue}%`
      };
    },
    statusClass() {
      return {
        'status-running': this.progress.status === 'running',
        'status-completed': this.progress.status === 'completed',
        'status-idle': this.progress.status === 'idle',
        'status-error': this.progress.status === 'error'
      };
    },
    statusText() {
      switch (this.progress.status) {
        case 'running': return '采集中';
        case 'completed': return '已完成';
        case 'error': return '出错';
        default: return '空闲';
      }
    }
  },
  mounted() {
    this.startAutoRefresh();
    // 模拟初始化数据获取
    this.fetchProgressInfo();
  },
  beforeDestroy() {
    this.stopAutoRefresh();
  },
  watch: {
    autoRefreshEnabled(newVal) {
      if (newVal) {
        this.startAutoRefresh();
      } else {
        this.stopAutoRefresh();
      }
    }
  },
  methods: {
    startAutoRefresh() {
      this.stopAutoRefresh();
      this.refreshInterval = setInterval(() => {
        this.fetchProgressInfo();
      }, 10000);
    },
    stopAutoRefresh() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
      }
    },
    fetchProgressInfo() {
      // 模拟API请求
      console.log('Fetching progress info...');
      
      // 在实际应用中，这里应该是一个API调用
      // 例如：axios.get('/get_collection_progress').then(response => {...})
      
      // 模拟数据变化
      if (this.progress.status === 'running') {
        const newProgress = {...this.progress};
        if (newProgress.last_batch < newProgress.total_batches) {
          newProgress.last_batch += 1;
          
          // 模拟添加新主题
          const topics = [
            '计算机组成原理', '编译原理', '分布式系统',
            '机器学习', '计算机图形学', '网络安全'
          ];
          if (newProgress.last_batch <= topics.length) {
            newProgress.processed_topics.push(topics[newProgress.last_batch - 4]);
          }
          
          // 随机更新时间
          const now = new Date();
          newProgress.last_updated = now.toLocaleString();
          
          // 随机状态变化
          if (newProgress.last_batch === newProgress.total_batches) {
            newProgress.status = 'completed';
          } else if (Math.random() > 0.9) {
            newProgress.status = 'error';
          }
          
          this.progress = newProgress;
        }
      }
    },
    runCollection(type) {
      console.log(`Running collection: ${type}`);
      
      // 在实际应用中，这里应该是API调用
      // 例如：axios.post('/run_collection', { collection_type: type })
      
      // 更新状态
      if (type === 'continue') {
        this.progress.status = 'running';
        this.showAlert('success', '采集任务已启动，正在继续采集...');
      } else if (type === 'reset') {
        this.progress = {
          last_batch: 0,
          total_batches: 10,
          last_updated: new Date().toLocaleString(),
          processed_topics: [],
          status: 'running'
        };
        this.showAlert('success', '采集进度已重置，开始重新采集...');
      }
      
      // 模拟进度更新
      setTimeout(() => {
        this.fetchProgressInfo();
      }, 1000);
    },
    confirmReset() {
      if (confirm('确定要重置所有进度并重新开始采集吗？这将删除当前的采集进度。')) {
        this.runCollection('reset');
      }
    },
    showAlert(type, message) {
      if (type === 'success') {
        this.successMessage = message;
        this.showSuccessAlert = true;
        setTimeout(() => {
          this.showSuccessAlert = false;
        }, 5000);
      } else {
        this.errorMessage = message;
        this.showErrorAlert = true;
        setTimeout(() => {
          this.showErrorAlert = false;
        }, 5000);
      }
    }
  }
};
</script>

<style scoped>
.knowledge-graph-admin {
  padding: 20px;
  background-color: #f5f5f5;
  min-height: 100vh;
  width: 100%;
}

.container {
  max-width: 1200px;
}

.card {
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border-radius: 10px;
  border: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

.card-header {
  border-radius: 10px 10px 0 0 !important;
  padding: 15px 20px;
  font-weight: 600;
  font-size: 1.2rem;
}

.collection-card {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  padding: 25px;
  border-radius: 8px;
  margin-bottom: 25px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);
}

.progress {
  height: 28px;
  font-size: 14px;
  font-weight: bold;
  margin: 20px 0;
  border-radius: 14px;
  background-color: #e9ecef;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
}

.progress-bar {
  transition: width 0.6s ease;
}

.action-buttons {
  margin-top: 30px;
}

.action-buttons .card {
  height: 100%;
}

.action-buttons .card-body {
  display: flex;
  flex-direction: column;
}

.action-buttons .btn {
  transition: all 0.3s ease;
}

.action-buttons .btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.alert {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  min-width: 300px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  opacity: 0.95;
  animation: fadeIn 0.5s, fadeOut 0.5s 4.5s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 0.95; transform: translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 0.95; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-20px); }
}

.status-badge {
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: bold;
  display: inline-block;
  margin-bottom: 15px;
  font-size: 0.9rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-running {
  background: linear-gradient(135deg, #28a745, #1e7e34);
  color: white;
}

.status-completed {
  background: linear-gradient(135deg, #007bff, #0062cc);
  color: white;
}

.status-idle {
  background: linear-gradient(135deg, #6c757d, #5a6268);
  color: white;
}

.status-error {
  background: linear-gradient(135deg, #dc3545, #bd2130);
  color: white;
}

.processed-topics {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
}

.processed-topics ul {
  padding-left: 20px;
  margin-bottom: 0;
}

.processed-topics li {
  padding: 5px 0;
  border-bottom: 1px solid #eee;
}

.processed-topics li:last-child {
  border-bottom: none;
}

.badge {
  font-weight: 500;
  letter-spacing: 0.5px;
}

.btn-outline-secondary {
  border-width: 2px;
  font-weight: 500;
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

.div_contenct{
    width: 100%;
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

@media (max-width: 768px) {
  .collection-card .row > div {
    margin-bottom: 20px;
  }
  
  .action-buttons .row > div {
    margin-bottom: 20px;
  }
}
</style>