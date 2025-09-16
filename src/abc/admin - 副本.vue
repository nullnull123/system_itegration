<template>
  <div class="container">
    <!-- 导航栏 -->
    <nav class="navbar navbar-expand-lg navbar-light bg-light mb-4">
      <div class="container-fluid">
        <!-- <a class="navbar-brand" href="/">计算机专业知识图谱</a> -->
        <router-link to="/GeneticMapping" class="navbar-brand">计算机专业知识图谱</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse head" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <!-- <a class="nav-link" href="/">知识图谱</a> -->
              <router-link to="/GeneticMapping" class="nav-link">知识图谱</router-link>
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
import request from '@/api/request'
import {KL_URL} from '@/api/request'
export default {
  data: function() {
    return {
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
    statusClass: function() {
      return {
        'status-running': this.currentStatus === 'running',
        'status-completed': this.currentStatus === 'completed',
        'status-error': this.currentStatus === 'error',
        'status-idle': this.currentStatus === 'idle'
      }
    },
    statusText: function() {
      var statusMap = {
        'running': '采集中',
        'completed': '已完成',
        'error': '出错',
        'idle': '空闲'
      }
      return statusMap[this.currentStatus] || '未知'
    }
  },
  mounted: function() {
    console.log('组件已挂载，开始初始化...')
    console.log('当前baseUrl:', this.baseUrl)

    this.fetchProgressInfo()
    this.startAutoRefresh()

    console.log('初始化完成')
  },
  beforeDestroy: function() {
    this.stopAutoRefresh()
  },
  methods: {
    startAutoRefresh: function() {
      this.stopAutoRefresh()
      if (this.autoRefreshEnabled) {
        var self = this
        this.refreshInterval = setInterval(function() {
          self.fetchProgressInfo()
        }, 5000)
      }
    },
    stopAutoRefresh: function() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
        this.refreshInterval = null
      }
    },
    fetchProgressInfo: function() {
      var self = this
      try {
        request({
            url: KL_URL+'/get_collection_progress/',
            method: 'get',
          })
          .then(function(response) {
            if (response.data.success) {
              self.updateProgress(response.data.progress)
              self.clearMessages()
            } else {
              self.errorMessage = response.data.error || '获取进度信息失败'
            }
          })
          .catch(function(error) {
            console.error('获取进度失败:', error)
            self.errorMessage = '网络错误：无法获取进度信息'
          })
      } catch (error) {
        console.error('获取进度失败:', error)
        this.errorMessage = '网络错误：无法获取进度信息'
      }
    },
    updateProgress: function(progress) {
      // 添加调试信息
      console.log('更新进度数据:', progress)

      // 安全地提取数据，处理可能的数据格式问题
      this.lastBatch = this.safeGetNumber(progress.last_batch, 0)
      this.totalBatches = this.safeGetNumber(progress.total_batches, 20)
      this.lastUpdated = progress.last_updated || '未知'
      this.processedTopics = Array.isArray(progress.processed_topics) ? progress.processed_topics : []

      // 计算进度百分比
      if (this.totalBatches > 0) {
        this.progressValue = ((this.lastBatch / this.totalBatches) * 100).toFixed(1)
      } else {
        // 如果没有批次信息，根据状态设置进度
        this.progressValue = progress.status === 'completed' ? 100 : 0
      }

      this.currentStatus = progress.status || 'idle'

      // 根据状态自动停止刷新
      if (this.currentStatus === 'completed' || this.currentStatus === 'error') {
        this.isRunning = false
      }

      console.log('进度更新完成:', {
        lastBatch: this.lastBatch,
        totalBatches: this.totalBatches,
        progressValue: this.progressValue,
        status: this.currentStatus
      })
    },
    runCollection: function(type) {
      var self = this
      this.isRunning = true
      this.clearMessages()

      try {
        request.post(KL_URL+'/run_collection/', {collection_type: type},
         {headers: 
          {
        'Content-Type': 'application/json',
        'X-CSRFToken': this.getCsrfToken()
          }
        })
        .then(function(response) {
          if (response.data.success) {
            self.successMessage = response.data.message || (type === 'reset' ? '重新' : '继续') + '采集任务已启动'
            self.currentStatus = 'running'

            setTimeout(function() {
              self.fetchProgressInfo()
              self.startAutoRefresh()
            }, 1000)
          } else {
            self.errorMessage = response.data.error || '启动采集任务失败'
          }
          self.isRunning = false
        })
        .catch(function(error) {
          console.error('启动采集任务失败:', error)
          self.errorMessage = '网络错误：' + error.message
          self.isRunning = false
        })
      } catch (error) {
        console.error('启动采集任务失败:', error)
        this.errorMessage = '网络错误：' + error.message
        this.isRunning = false
      }
    },
    confirmReset: function() {
      if (confirm('确定要重置所有进度并重新开始采集吗？这将删除当前的采集进度。')) {
        this.runCollection('reset')
      }
    },

    // 辅助方法
    clearMessages: function() {
      this.successMessage = ''
      this.errorMessage = ''
    },

    // 安全获取数字值
    safeGetNumber: function(value, defaultValue) {
      if (typeof defaultValue === 'undefined') {
        defaultValue = 0
      }
      var num = parseInt(value)
      return isNaN(num) ? defaultValue : num
    },

    getCsrfToken: function() {
      // 从cookie中获取CSRF token
      var cookies = document.cookie.split(';')
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i]
        var parts = cookie.trim().split('=')
        var name = parts[0]
        var value = parts[1]
        if (name === 'csrftoken') {
          return value
        }
      }
      return ''
    }
  },

  watch: {
    // 监听自动刷新开关
    autoRefreshEnabled: function(newVal) {
      if (newVal) {
        this.startAutoRefresh()
      } else {
        this.stopAutoRefresh()
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
  border-radius: 10px;
  margin: 15px 0;
  background-color: #ddd; 
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