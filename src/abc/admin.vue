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
            <h4>知识图谱生成管理</h4>
          </div>
          <div class="card-body">
            <!-- 生成进度卡片 -->
            <div class="collection-card">
              <div class="d-flex justify-content-between align-items-center contect_up">
                <h5>当前生成进度</h5>
                <div>
                  <span class="badge bg-secondary me-2">自动刷新: {{ autoRefreshEnabled ? '启用' : '禁用' }}</span>
                  <span v-if="currentStatus === 'running' && collectionType === 'single_course'" class="badge bg-info">
                    🔄 正在生成《{{ currentCourseName }}》知识图谱
                  </span>
                  <span v-if="currentStatus === 'completed' && collectionType === 'single_course'" class="badge bg-success">
                    ✅ 《{{ currentCourseName }}》生成完成
                  </span>
                  <span v-if="currentStatus === 'running' && collectionType === 'reset'" class="badge bg-warning">
                    🔄 正在重新生成知识图谱...
                  </span>
                  <span v-if="currentStatus === 'completed' && collectionType === 'reset'" class="badge bg-success">
                    ✅ 重新生成完成
                  </span>
                  <span v-if="currentStatus === 'running' && collectionType === 'continue'" class="badge bg-info">
                    🔄 正在继续生成知识图谱...
                  </span>
                  <span v-if="currentStatus === 'completed' && collectionType === 'continue'" class="badge bg-success">
                    ✅ 继续生成完成
                  </span>
                </div>
              </div>

              <!-- 状态标识 -->
              <div :class="['status-badge', statusClass]">{{ statusText }}</div>
              
              <div class="row contect_down">
                <div class="col-md-6 contect_down_l">
                  <!-- 单课程生成状态 -->
                  <div v-if="collectionType === 'single_course'">
                    <p><strong>生成课程:</strong> 《{{ currentCourseName }}》</p>
                    <p><strong>当前阶段:</strong> {{ currentStage || '准备中' }}</p>
                    <p><strong>上次更新时间:</strong> {{ lastUpdated }}</p>
                  </div>

                  <!-- 重置生成状态 -->
                  <div v-else-if="collectionType === 'reset'">
                    <p><strong>操作类型:</strong> 重新生成知识图谱</p>
                    <p><strong>当前阶段:</strong> {{ getFormattedStage(currentStage) || '初始化中' }}</p>
                    <p><strong>上次更新时间:</strong> {{ lastUpdated }}</p>
                    <div class="alert alert-warning small mt-2">
                      <i class="bi bi-exclamation-triangle"></i>
                      正在从头重新构建所有知识图谱数据...
                    </div>
                  </div>

                  <!-- 继续生成状态 -->
                  <div v-else-if="collectionType === 'continue'">
                    <p><strong>操作类型:</strong> 开始生成知识图谱</p>
                    <p><strong>当前阶段:</strong> {{ getFormattedStage(currentStage) || '初始化中' }}</p>
                    <p><strong>上次更新时间:</strong> {{ lastUpdated }}</p>
                    <div class="alert alert-info small mt-2">
                      <i class="bi bi-plus-circle"></i>
                      正在生成计算机专业知识图谱...
                    </div>
                  </div>

                  <!-- 默认状态 -->
                  <div v-else>
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
                </div>
                
                <div class="col-md-6  contect_down_r">
                  <p><strong>生成进度:</strong></p>
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
              <h5>生成操作</h5>
              <div class="row">

                <!-- 数据库为空时显示开始生成 -->
                <div v-if="!databaseStatus.hasData" class="col-12">
                  <div class="card">
                    <div class="card-body text-center">
                      <h6 class="card-title">
                        <i class="bi bi-play-circle-fill text-success"></i>
                        开始生成
                      </h6>
                      <p class="card-text">初始化计算机专业知识图谱，生成基础的课程体系和知识点。</p>
                      <div class="alert alert-success small">
                        <i class="bi bi-lightbulb"></i>
                        这是您第一次生成知识图谱，将创建完整的计算机专业知识体系
                      </div>
                      <button
                        @click="runCollection('start')"
                        :disabled="isRunning"
                        class="btn btn-success btn-lg"
                      >
                        <i class="bi bi-play-fill"></i>
                        开始生成知识图谱
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 数据库不为空时显示重新生成 -->
                <div v-else class="col-12">
                  <div class="card">
                    <div class="card-body text-center">
                      <h6 class="card-title">
                        <i class="bi bi-arrow-clockwise text-danger"></i>
                        重新生成
                      </h6>
                      <p class="card-text">清除所有现有数据，从头开始重新构建完整的计算机专业知识图谱。</p>
                      <div class="alert alert-warning small">
                        <i class="bi bi-exclamation-triangle"></i>
                        注意：此操作将删除所有现有知识图谱数据，包括 {{ databaseStatus.nodeCount }} 个节点和 {{ databaseStatus.relationCount }} 个关系
                      </div>
                      <button
                        @click="confirmReset"
                        :disabled="isRunning"
                        class="btn btn-danger btn-lg"
                      >
                        <i class="bi bi-arrow-clockwise"></i>
                        重新生成知识图谱
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 单课程知识图谱生成 -->
            <div class="single-course-section mt-4">
              <h5>单课程知识图谱生成</h5>
              <div class="card">
                <div class="card-body">
                  <h6 class="card-title">快速生成单个课程的知识图谱</h6>
                  <p class="card-text">输入课程名称，系统将自动为该课程生成知识点和关系网络。</p>
                  <div class="input-group mb-3">
                    <input
                      type="text"
                      class="form-control"
                      placeholder="请输入课程名称，如：数据结构、操作系统、计算机网络等"
                      v-model="courseName"
                      :disabled="isRunning"
                      @keyup.enter="generateSingleCourse"
                      ref="courseInput"
                    >
                    <button
                      class="btn btn-success"
                      type="button"
                      @click="generateSingleCourse"
                      :disabled="isRunning || !courseName.trim()"
                    >
                      <span v-if="isRunning" class="spinner-border spinner-border-sm me-2" role="status"></span>
                      {{ isRunning ? '生成中...' : '生成知识图谱' }}
                    </button>
                    <button
                      v-if="courseName.trim()"
                      class="btn btn-outline-secondary"
                      type="button"
                      @click="clearCourseInput"
                      :disabled="isRunning"
                    >
                      清空
                    </button>
                  </div>
                  <div class="text-muted small">
                    <strong>支持的课程示例：</strong>
                    <span class="badge bg-secondary me-1" v-for="course in sampleCourses" :key="course" @click="courseName = course" style="cursor: pointer;">
                      {{ course }}
                    </span>
                  </div>

                  <!-- 生成历史记录 -->
                  <div v-if="generationHistory.length > 0" class="mt-3">
                    <h6>📋 最近生成记录</h6>
                    <div class="generation-history">
                      <div v-for="record in generationHistory.slice(0, 3)" :key="record.timestamp" class="history-item">
                        <small class="text-muted">
                          <strong>{{ record.courseName }}</strong>
                          - {{ record.timestamp }}
                          <span class="badge bg-success ms-2">{{ record.knowledgePointsCount }}个知识点</span>
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 提示信息 -->
            <div v-if="successMessage" class="alert alert-success mt-3">
              {{ successMessage }}
              <!-- 如果是单课程生成完成，显示操作按钮 -->
              <div v-if="pendingGeneration.isActive && successMessage.includes('知识图谱生成完成')" class="mt-2">
                <div class="d-flex align-items-center">
                  <button @click="viewKnowledgeGraph" class="btn btn-sm btn-primary me-2">
                    <i class="bi bi-eye"></i> 查看知识图谱
                  </button>
                  <button @click="openNeo4jVerify" class="btn btn-sm btn-outline-success me-2">
                    验证Neo4j数据
                  </button>
                  <button @click="viewGeneratedFile" class="btn btn-sm btn-outline-info me-2">
                    查看生成文件
                  </button>
                  <small class="text-muted">
                    <i class="bi bi-info-circle"></i> 
                    手动切换到知识图谱页面时将自动搜索该课程
                  </small>
                </div>
              </div>
            </div>
            <div v-if="errorMessage" class="alert alert-danger mt-3">{{ errorMessage }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: function() {
    return {
      baseUrl: '',  // 将在mounted中动态设置
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
      isRunning: false,
      courseName: '',  // 单课程名称
      currentCourseName: '', // 当前正在生成或已生成的课程名
      collectionType: '', // 当前生成类型
      currentStage: '', // 当前生成阶段
      generationHistory: [], // 生成历史记录
      sampleCourses: ['数据结构', '操作系统', '计算机网络', '数据库系统', '软件工程', '人工智能', '编译原理', '计算机组成原理'],  // 示例课程
      isInitialLoad: true, // 是否为页面首次加载
      lastCompletedCourse: '', // 最后完成的课程名称
      urlParams: { // URL参数
        course: '',
        refresh: '',
        fromAdmin: false
      },
      pendingGeneration: { // 待完成的生成任务
        courseName: '',
        isActive: false
      },
      databaseStatus: { // 数据库状态
        hasData: false, // 是否有数据
        nodeCount: 0,   // 节点数量
        relationCount: 0, // 关系数量
        lastChecked: null // 最后检查时间
      }
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
    console.log('当前window.location:', window.location)
    
    // 初始化baseUrl
    this.baseUrl = this.getBaseUrl()
    console.log('当前baseUrl:', this.baseUrl)
    console.log('当前origin:', window.location.origin)

    // 检测URL参数
    this.checkUrlParams()

    // 加载生成历史记录
    this.loadGenerationHistory()

    // 测试API连接
    this.testApiConnection()

    this.checkDatabaseStatus()
    this.fetchProgressInfo()
    this.startAutoRefresh()

    console.log('初始化完成')
  },
  beforeDestroy: function() {
    this.stopAutoRefresh()
  },
  methods: {
    // 获取API基础URL
    getBaseUrl: function() {
      // 检查当前域名是否为内网穿透域名
      const currentHost = window.location.host;
      const currentProtocol = window.location.protocol;
      const currentPort = window.location.port;
      
      console.log('当前访问域名:', currentHost);
      console.log('当前协议:', currentProtocol);
      console.log('当前端口:', currentPort);
      
      // 如果是内网穿透域名，使用绝对路径
      if (currentHost.includes('vicp.fun') || currentHost.includes('ngrok') || currentHost.includes('tunnel')) {
        const baseUrl = currentProtocol + '//' + currentHost + '/api/Graphapps';
        console.log('检测到内网穿透环境，使用绝对路径:', baseUrl);
        return baseUrl;
      }
      
      // 检测nginx代理环境（端口8081或其他非8000端口）
      if (currentPort === '8081' || (currentPort && currentPort !== '8000')) {
        const baseUrl = currentProtocol + '//' + currentHost + '/api/Graphapps';
        console.log('检测到nginx代理环境，使用相对路径:', baseUrl);
        return baseUrl;
      }
      
      // 本地开发环境，直接访问Django服务器
      const backendHost = 'http://127.0.0.1:8000';
      const baseUrl = backendHost + '/api/Graphapps';
      console.log('本地开发环境，使用后端服务器路径:', baseUrl);
      return baseUrl;
    },

    // 检查数据库状态
    checkDatabaseStatus: function() {
      console.log('[DATABASE] 检查数据库状态...')
      console.log('[DATABASE] 请求URL:', this.baseUrl + '/statistics/')
      fetch(this.baseUrl + '/statistics/')
        .then(response => {
          console.log('[DATABASE] 响应状态:', response.status)
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`)
          }
          return response.json()
        })
        .then(data => {
          console.log('[DATABASE] 响应数据:', data)
          if (data.success) {
            this.databaseStatus.nodeCount = data.entity_count || 0
            this.databaseStatus.relationCount = data.relation_count || 0
            this.databaseStatus.hasData = (data.entity_count > 0) || (data.relation_count > 0)
            this.databaseStatus.lastChecked = new Date().toLocaleString('zh-CN')
            console.log(`[DATABASE] 数据库状态: ${this.databaseStatus.nodeCount}节点, ${this.databaseStatus.relationCount}关系, 有数据: ${this.databaseStatus.hasData}`)
          } else {
            console.warn('[DATABASE] 获取数据库状态失败:', data.error)
            // 如果获取失败，默认认为没有数据
            this.databaseStatus.hasData = false
            this.databaseStatus.nodeCount = 0
            this.databaseStatus.relationCount = 0
          }
        })
        .catch(error => {
          console.error('[DATABASE] 检查数据库状态出错:', error)
          // 显示详细错误信息
          if (error.message.includes('Failed to fetch')) {
            this.errorMessage = '无法连接到后端服务器，请确保Django服务器正在运行'
          }
          // 如果出错，默认认为没有数据
          this.databaseStatus.hasData = false
          this.databaseStatus.nodeCount = 0
          this.databaseStatus.relationCount = 0
        })
    },

    // 检查URL参数
    checkUrlParams: function() {
      const urlParams = new URLSearchParams(window.location.search);
      const course = urlParams.get('course');
      const refresh = urlParams.get('refresh');
      const fromAdmin = urlParams.get('fromAdmin');

      if (course || refresh || fromAdmin) {
        this.urlParams.course = course || '';
        this.urlParams.refresh = refresh || '';
        this.urlParams.fromAdmin = fromAdmin === 'true' || false;

        console.log('[URL PARAMS] 检测到URL参数:', this.urlParams);
      }
    },

    testApiConnection: function() {
      console.log('测试API连接...')
      var testUrl = this.baseUrl + '/get_collection_progress/'
      console.log('测试URL:', testUrl)

      fetch(testUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(function(response) {
        console.log('测试响应状态:', response.status)
        console.log('测试响应头:', response.headers.get('content-type'))
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        return response.text()
      })
      .then(function(text) {
        console.log('测试响应内容前200字符:', text.substring(0, 200))
        try {
          var jsonData = JSON.parse(text)
          console.log('✅ API连接测试成功，响应为JSON格式')
        } catch (e) {
          console.log('❌ API连接测试失败，响应不是JSON格式')
          console.log('错误详情:', e)
        }
      })
      .catch(function(error) {
        console.error('❌ API连接测试失败:', error)
        if (error.message.includes('Failed to fetch')) {
          console.error('网络连接失败，请检查Django服务器是否运行在 http://127.0.0.1:8000')
        }
      })
    },

    startAutoRefresh: function() {
      this.stopAutoRefresh()
      if (this.autoRefreshEnabled) {
        var self = this
        // 如果正在运行，使用更频繁的刷新间隔
        var interval = this.currentStatus === 'running' ? 2000 : 5000
        this.refreshInterval = setInterval(function() {
          self.fetchProgressInfo()
        }, interval)
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
        var apiUrl = this.baseUrl + '/get_collection_progress/'
        console.log('正在请求进度信息:', apiUrl)

        fetch(apiUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          credentials: 'include'  // 包含cookies
        })
          .then(function(response) {
            console.log('进度请求响应:', response.status, response.statusText)
            if (response.ok) {
              return response.json()
            } else {
              throw new Error('HTTP ' + response.status + ': ' + response.statusText)
            }
          })
            .then(function(data) {
              console.log('进度数据:', data)
              if (data.success) {
                self.updateProgress(data.progress)
                self.clearMessages()
                // 标记首次加载完成（但不影响completed状态的重置逻辑）
                self.isInitialLoad = false
              } else {
                self.errorMessage = data.error || '获取进度信息失败'
                // 即使出错也标记首次加载完成
                self.isInitialLoad = false
              }
            })
          .catch(function(error) {
            console.error('获取进度失败:', error)
            
            // 检查是否是CORS错误
            if (error.message.includes('Failed to fetch')) {
              self.errorMessage = 'CORS跨域错误：无法获取进度信息。请确保Django服务器已重启并配置了正确的CORS设置。'
            } else if (error.message.includes('CORS')) {
              self.errorMessage = 'CORS跨域错误：' + error.message
            } else {
              self.errorMessage = '网络错误：无法获取进度信息 (' + error.message + ')'
            }
          })
      } catch (error) {
        console.error('获取进度失败:', error)
        this.errorMessage = '网络错误：无法获取进度信息 (' + error.message + ')'
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

      // 检查是否是单课程生成
      const isSingleCourse = progress.collection_type === 'single_course' && progress.course_name

      // 处理completed状态的重置逻辑
      if (progress.status === 'completed' && isSingleCourse) {
        // 单课程生成完成，显示成功信息
        console.log('单课程生成完成:', progress.course_name)
        this.successMessage = `课程《${progress.course_name}》知识图谱生成完成！`
        
        // 保存生成完成的课程信息，供用户手动查看时使用
        this.pendingGeneration.courseName = progress.course_name
        this.pendingGeneration.isActive = true
        this.pendingGeneration.completedAt = new Date().toISOString()
        
        // 将生成完成的课程信息保存到localStorage，供index页面使用
        try {
          const generatedCourseInfo = {
            courseName: progress.course_name,
            completedAt: new Date().toISOString(),
            timestamp: Date.now(),
            needsRefresh: true  // 标记需要刷新数据库数据
          }
          localStorage.setItem('lastGeneratedCourse', JSON.stringify(generatedCourseInfo))
          console.log('已保存生成完成的课程信息到localStorage:', generatedCourseInfo)
          
          // 触发自定义事件通知其他页面数据更新
          const event = new CustomEvent('courseGenerationComplete', {
            detail: {
              courseName: progress.course_name,
              timestamp: Date.now(),
              action: 'single_course_complete'
            }
          });
          window.dispatchEvent(event);
          console.log('已触发courseGenerationComplete事件')
          
          // 使用BroadcastChannel API通知其他标签页（如果支持）
          if (window.BroadcastChannel) {
            try {
              const channel = new BroadcastChannel('knowledge_graph_updates');
              channel.postMessage({
                type: 'course_generation_complete',
                courseName: progress.course_name,
                timestamp: Date.now(),
                needsRefresh: true
              });
              console.log('已通过BroadcastChannel通知其他标签页')
              channel.close();
            } catch (broadcastError) {
              console.warn('BroadcastChannel通知失败:', broadcastError)
            }
          }
        } catch (e) {
          console.warn('无法保存课程信息到localStorage:', e)
        }
        
        // 重置进度状态
        progress.status = 'idle'
        progress.collection_type = ''
        progress.course_name = ''
        progress.stage = 'idle'
        this.processedTopics = []
        this.progressValue = 0
      }

      // 更新采集类型和课程信息
      this.collectionType = progress.collection_type || ''
      this.currentCourseName = progress.course_name || ''
      this.currentStage = progress.stage || ''

      if (isSingleCourse && progress.status !== 'completed') {
        // 单课程生成的进度处理（非completed状态）
        if (progress.status === 'running') {
          // 根据当前阶段设置进度
          const stage = progress.stage || ''
          if (stage.includes('正在初始化AI生成器')) {
            this.progressValue = 20
            this.successMessage = `🚀 正在初始化AI生成器...`
          } else if (stage.includes('正在调用DeepSeek')) {
            this.progressValue = 40
            this.successMessage = `🤖 正在调用DeepSeek生成《${progress.course_name}》的知识点...`
          } else if (stage.includes('generating_relations') || stage.includes('生成关系')) {
            this.progressValue = 80
            this.successMessage = `🔗 正在生成《${progress.course_name}》的知识点关系...`
          } else if (stage.includes('saving_to_neo4j') || stage.includes('保存到Neo4j')) {
            this.progressValue = 90
            this.successMessage = `💾 正在保存《${progress.course_name}》到Neo4j数据库...`
          } else {
            this.progressValue = 50
            this.successMessage = `⚡ 正在处理《${progress.course_name}》的知识图谱...`
          }
        } else {
          this.progressValue = 0
        }
      } else {
        // 全量采集的进度处理
        if (progress.status === 'completed') {
          // 已完成状态，直接显示100%
          this.progressValue = 100
        } else if (progress.status === 'error') {
          // 错误状态，显示0%
          this.progressValue = 0
        } else if (progress.status === 'running') {
          // 运行中状态，根据阶段计算进度
          this.progressValue = this.calculateFullGraphProgress(progress.stage)
        } else {
          // 其他状态
          this.progressValue = progress.status === 'running' ? 10 : 0
        }
      }

      this.currentStatus = progress.status || 'idle'

      // 根据状态自动停止刷新
      if (this.currentStatus === 'completed' || this.currentStatus === 'error') {
        this.isRunning = false

        // 如果是单课程生成完成，停止自动刷新
        if (isSingleCourse && this.currentStatus === 'completed') {
          this.stopAutoRefresh()
        }

        // 生成完成或出错时，重新检查数据库状态
        if (this.currentStatus === 'completed') {
          console.log('[DATABASE] 生成完成，重新检查数据库状态')
          setTimeout(() => {
            this.checkDatabaseStatus()
            
            // 通知其他页面统计数据已更新
            this.notifyStatisticsUpdate()
          }, 2000) // 等待2秒确保数据写入完成
        }
      }

      console.log('进度更新完成:', {
        lastBatch: this.lastBatch,
        totalBatches: this.totalBatches,
        progressValue: this.progressValue,
        status: this.currentStatus,
        collectionType: this.collectionType,
        courseName: this.currentCourseName,
        stage: this.currentStage,
        processedTopicsCount: this.processedTopics.length
      })
    },

    runCollection: function(type) {
      var self = this
      this.isRunning = true
      this.clearMessages()

      // 将'start'类型映射为'reset'，因为开始生成实际上就是重置模式
      var actualType = type === 'start' ? 'reset' : type

      try {
        var apiUrl = this.baseUrl + '/run_collection/'
        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            collection_type: actualType
          })
        })
        .then(function(response) {
          return response.json()
        })
        .then(function(data) {
          if (data.success) {
            var actionName = type === 'start' ? '开始' : (type === 'reset' ? '重新' : '继续')
            self.successMessage = data.message || actionName + '采集任务已启动'
            self.currentStatus = 'running'

            setTimeout(function() {
              self.fetchProgressInfo()
              self.startAutoRefresh()
            }, 1000)
          } else {
            self.errorMessage = data.error || '启动采集任务失败'
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
      const hasData = this.databaseStatus.hasData

      let message = `⚠️ 重要警告：${hasData ? '重新生成' : '开始生成'}操作

此操作将：`

      if (hasData) {
        message += `
• 删除所有现有的知识图谱数据
• 清除Neo4j数据库中的节点和关系
• 从头开始重新收集和生成知识点
• 重置所有生成进度和统计信息`
      } else {
        message += `
• 初始化计算机专业知识图谱
• 生成基础的课程体系和知识点
• 创建完整的计算机专业知识网络`
      }

      message += `

${hasData ? '重新生成' : '开始生成'}大约需要5-10分钟，具体时间取决于网络状况和数据量。

确定要继续吗？
      `.trim()

      if (confirm(message)) {
        if (confirm(`最后确认：您真的要${hasData ? '删除所有现有数据并重新开始吗？此操作不可撤销！' : '开始生成知识图谱吗？'}`)) {
          this.runCollection(hasData ? 'reset' : 'start')
        }
      }
    },
    
    generateSingleCourse: function() {
      var self = this

      if (!this.courseName.trim()) {
        this.errorMessage = '请输入课程名称'
        return
      }

      this.isRunning = true
      this.clearMessages()

      try {
        var apiUrl = this.baseUrl + '/run_collection/'
        var csrfToken = this.getCsrfToken()
        console.log('正在生成单课程知识图谱:', apiUrl)
        console.log('课程名称:', this.courseName.trim())
        console.log('CSRF Token:', csrfToken ? '已获取' : '未获取')

        var requestData = {
          collection_type: 'single_course',
          course_name: this.courseName.trim()
        }
        console.log('请求数据:', requestData)

        // 设置待完成的生成任务
        this.pendingGeneration.courseName = this.courseName.trim()
        this.pendingGeneration.isActive = true

        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken || '',
            'Accept': 'application/json'
          },
          credentials: 'include',  // 包含cookies
          body: JSON.stringify(requestData)
        })
        .then(function(response) {
          console.log('生成请求响应:', response.status, response.statusText)
          console.log('响应头:', response.headers.get('content-type'))

          if (response.ok) {
            return response.json()
          } else {
            // 如果不是成功的响应，读取响应文本用于调试
            return response.text().then(function(text) {
              console.error('响应内容:', text.substring(0, 500))
              throw new Error('HTTP ' + response.status + ': ' + response.statusText)
            })
          }
        })
        .then(function(data) {
          console.log('生成响应数据:', data)
          if (data.success) {
            self.successMessage = data.message || '单课程知识图谱生成任务已启动'
            self.currentStatus = 'running'

            // 清空输入框
            self.courseName = ''

            // 延迟刷新进度
            setTimeout(function() {
              self.fetchProgressInfo()
              self.startAutoRefresh()
            }, 1000)
          } else {
            self.errorMessage = data.error || '启动生成任务失败'
          }
          self.isRunning = false
        })
        .catch(function(error) {
          console.error('启动生成任务失败:', error)
          
          // 检查是否是CORS错误
          if (error.message.includes('Failed to fetch')) {
            self.errorMessage = 'CORS跨域错误：前端(8080端口)无法访问后端(8000端口)。请确保Django服务器已重启并配置了正确的CORS设置。'
          } else if (error.message.includes('CORS')) {
            self.errorMessage = 'CORS跨域错误：' + error.message
          } else {
            self.errorMessage = '网络错误：' + error.message
          }
          
          self.isRunning = false
        })
      } catch (error) {
        console.error('启动生成任务失败:', error)
        this.errorMessage = '网络错误：' + error.message
        this.isRunning = false
      }
    },

    clearCourseInput: function() {
      this.courseName = ''
      this.clearMessages()
      // 聚焦到输入框
      if (this.$refs.courseInput) {
        this.$refs.courseInput.focus()
      }
    },

    // 辅助方法
    clearMessages: function() {
      this.successMessage = ''
      this.errorMessage = ''
    },

    clearErrorMessage: function() {
      this.errorMessage = ''
    },

    clearSuccessMessage: function() {
      this.successMessage = ''
    },

    // 格式化阶段显示
    getFormattedStage: function(stage) {
      if (!stage) return ''
      
      // 阶段映射表，将英文或技术术语转换为用户友好的中文描述
      const stageMap = {
        'idle': '空闲状态',
        'running': '运行中',
        'completed': '已完成',
        'error': '发生错误',
        'reset': '重新生成中',
        'continue': '继续生成中',
        'collecting_course_data': '正在收集课程数据',
        'collecting_knowledge_data': '正在收集知识点数据',
        'data_collection_complete': '数据收集完成',
        'processing_data': '正在处理数据',
        'data_cleanup_complete': '数据清理完成',
        'data_merge_complete': '数据合并完成',
        'relations_generated': '关系生成完成',
        'building_graph': '正在构建知识图谱',
        'graph_built': '知识图谱构建完成',
        'saving_to_database': '正在保存到数据库',
        'verification': '正在验证数据',
        'finalizing': '正在完成最后步骤'
      }
      
      // 如果是直接匹配的阶段
      if (stageMap[stage]) {
        return stageMap[stage]
      }
      
      // 如果包含特定关键词，进行模糊匹配
      const lowerStage = stage.toLowerCase()
      if (lowerStage.includes('collect') && lowerStage.includes('course')) {
        return '正在收集课程数据'
      } else if (lowerStage.includes('collect') && lowerStage.includes('knowledge')) {
        return '正在收集知识点数据'
      } else if (lowerStage.includes('process') && lowerStage.includes('data')) {
        return '正在处理数据'
      } else if (lowerStage.includes('build') && lowerStage.includes('graph')) {
        return '正在构建知识图谱'
      } else if (lowerStage.includes('save') || lowerStage.includes('database')) {
        return '正在保存到数据库'
      } else if (lowerStage.includes('verify') || lowerStage.includes('verification')) {
        return '正在验证数据'
      } else if (lowerStage.includes('relation')) {
        return '正在生成关系'
      } else if (lowerStage.includes('cleanup')) {
        return '正在清理数据'
      } else if (lowerStage.includes('merge')) {
        return '正在合并数据'
      } else if (lowerStage.includes('final')) {
        return '正在完成最后步骤'
      }
      
      // 如果都不匹配，返回原始值（但去掉可能的下划线，首字母大写）
      return stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    },

    // 计算完整知识图谱生成的进度
    calculateFullGraphProgress: function(stage) {
      if (!stage) return 10
      
      const lowerStage = stage.toLowerCase()
      
      // 根据不同阶段返回相应的进度百分比
      if (lowerStage.includes('idle') || lowerStage === '') {
        return 0
      } else if (lowerStage.includes('reset') || lowerStage.includes('初始化')) {
        return 5
      } else if (lowerStage.includes('collecting_course_data') || lowerStage.includes('收集课程数据')) {
        return 15
      } else if (lowerStage.includes('collecting_knowledge_data') || lowerStage.includes('收集知识点数据')) {
        return 30
      } else if (lowerStage.includes('data_collection_complete') || lowerStage.includes('数据收集完成')) {
        return 45
      } else if (lowerStage.includes('processing_data') || lowerStage.includes('处理数据')) {
        return 60
      } else if (lowerStage.includes('data_cleanup_complete') || lowerStage.includes('数据清理完成')) {
        return 70
      } else if (lowerStage.includes('data_merge_complete') || lowerStage.includes('数据合并完成')) {
        return 80
      } else if (lowerStage.includes('relations_generated') || lowerStage.includes('关系生成')) {
        return 85
      } else if (lowerStage.includes('building_graph') || lowerStage.includes('构建知识图谱')) {
        return 90
      } else if (lowerStage.includes('saving_to_database') || lowerStage.includes('保存到数据库')) {
        return 95
      } else if (lowerStage.includes('verification') || lowerStage.includes('验证数据')) {
        return 98
      } else if (lowerStage.includes('finalizing') || lowerStage.includes('完成最后步骤')) {
        return 99
      } else if (lowerStage.includes('completed') || lowerStage.includes('已完成')) {
        return 100
      }
      
      // 默认运行中状态
      return 50
    },

    // 通知其他页面统计数据已更新
    notifyStatisticsUpdate: function() {
      console.log('[STATISTICS] 通知其他页面统计数据已更新')
      
      // 触发自定义事件
      const event = new CustomEvent('statisticsUpdated', {
        detail: {
          timestamp: Date.now(),
          action: 'statistics_refresh'
        }
      });
      window.dispatchEvent(event);
      
      // 使用BroadcastChannel通知其他标签页
      if (window.BroadcastChannel) {
        try {
          const channel = new BroadcastChannel('knowledge_graph_updates');
          channel.postMessage({
            type: 'statistics_updated',
            timestamp: Date.now(),
            action: 'statistics_refresh'
          });
          console.log('[STATISTICS] 已通过BroadcastChannel通知其他标签页')
          channel.close();
        } catch (broadcastError) {
          console.warn('[STATISTICS] BroadcastChannel通知失败:', broadcastError)
        }
      }
    },

    // 查看知识图谱
    viewKnowledgeGraph: function() {
      if (this.pendingGeneration.isActive && this.pendingGeneration.courseName) {
        const courseName = this.pendingGeneration.courseName;
        // 添加时间戳和强制刷新参数，确保获取最新数据
        const timestamp = Date.now();
        const graphUrl = '/index1.html?course=' + encodeURIComponent(courseName) + 
                         '&refresh=' + timestamp + 
                         '&fromAdmin=true' + 
                         '&forceRefresh=true';
        console.log('手动跳转到知识图谱页面查看结果:', graphUrl);
        
        // 清理待完成任务状态
        this.pendingGeneration.isActive = false;
        this.pendingGeneration.courseName = '';
        
        // 在新标签页中打开，避免离开管理页面
        window.open(graphUrl, '_blank');
      } else {
        // 如果没有待完成任务，跳转到默认的知识图谱页面
        console.log('跳转到默认知识图谱页面');
        window.open('/index1.html', '_blank');
      }
    },

    // 添加生成历史记录
    addGenerationHistory: function(courseName, knowledgePointsCount) {
      const record = {
        courseName: courseName,
        knowledgePointsCount: knowledgePointsCount,
        timestamp: new Date().toLocaleString('zh-CN')
      }

      // 将新记录添加到开头
      this.generationHistory.unshift(record)

      // 限制历史记录数量，最多保存10条
      if (this.generationHistory.length > 10) {
        this.generationHistory = this.generationHistory.slice(0, 10)
      }

      // 保存到本地存储
      this.saveGenerationHistory()
    },

    // 保存生成历史到本地存储
    saveGenerationHistory: function() {
      try {
        localStorage.setItem('generationHistory', JSON.stringify(this.generationHistory))
      } catch (e) {
        console.warn('无法保存生成历史到本地存储:', e)
      }
    },

    // 从本地存储加载生成历史
    loadGenerationHistory: function() {
      try {
        const history = localStorage.getItem('generationHistory')
        if (history) {
          this.generationHistory = JSON.parse(history)
        }
      } catch (e) {
        console.warn('无法从本地存储加载生成历史:', e)
      }
    },

    // 安全获取数字值
    safeGetNumber: function(value, defaultValue) {
      if (typeof defaultValue === 'undefined') {
        defaultValue = 0
      }
      var num = parseInt(value)
      return isNaN(num) ? defaultValue : num
    },

    openNeo4jVerify: function() {
      // 提示用户如何验证Neo4j中的数据
      var message = '您可以通过以下方式验证知识图谱是否已保存到Neo4j：\n\n' +
                    '方法1：使用Neo4j Browser\n' +
                    '访问: http://localhost:7474/browser/\n' +
                    '执行查询: MATCH (c:Course)-[:CONTAINS]->(k:KnowledgePoint) RETURN c, k\n\n' +
                    '方法2：使用命令行工具\n' +
                    '运行: python Graphapps/neo4j_verify.py\n\n' +
                    '方法3：使用统计接口\n' +
                    '访问: http://localhost:8000/Graphapps/statistics/'
      
      alert(message)
      
      // 尝试打开Neo4j Browser（可能被浏览器阻止）
      try {
        window.open('http://localhost:7474/browser/', '_blank')
      } catch (e) {
        console.log('无法自动打开Neo4j Browser:', e)
      }
    },

    viewGeneratedFile: function() {
      // 显示生成文件的信息
      var message = '知识图谱已生成以下文件：\n\n' +
                    '1. Neo4j数据库（主要存储）\n' +
                    '   - 课程节点和知识点节点\n' +
                    '   - 包含关系和前置关系\n\n' +
                    '2. JSON备份文件\n' +
                    '   - 位置: Graphapps/data/[课程名]_knowledge_graph.json\n' +
                    '   - 包含完整的实体和关系数据\n\n' +
                    '3. 进度记录文件\n' +
                    '   - 位置: Graphapps/data/collection_progress.json\n' +
                    '   - 记录生成任务的执行状态'
      
      alert(message)
    },


    getCsrfToken: function() {
      // 从cookie中获取CSRF token
      var cookies = document.cookie.split(';')
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i]
        while (cookie.charAt(0) === ' ') {
          cookie = cookie.substring(1)
        }
        if (cookie.indexOf('csrftoken=') === 0) {
          var csrfToken = cookie.substring('csrftoken='.length, cookie.length)
          console.log('找到CSRF Token:', csrfToken ? '已获取' : '为空')
          return csrfToken
        }
      }
      console.log('未找到CSRF Token')
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

/* 单课程生成部分样式 */
.single-course-section {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e9ecef;
}

.single-course-section .card {
  border: 2px solid #28a745;
  transition: all 0.3s ease;
}

.single-course-section .card:hover {
  box-shadow: 0 6px 12px rgba(40, 167, 69, 0.15);
}

.single-course-section .input-group {
  max-width: 600px;
}

.single-course-section .badge {
  margin: 2px;
  transition: all 0.2s ease;
}

.single-course-section .badge:hover {
  transform: scale(1.1);
  background-color: #28a745 !important;
}


/* 进度动画 */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.status-badge.running {
  animation: pulse 2s infinite;
}

/* 完成通知样式增强 */
.notification-enter-active {
  animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* 生成历史记录样式 */
.generation-history {
  max-height: 120px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  padding: 8px;
  background-color: #f8f9fa;
}

.history-item {
  padding: 4px 8px;
  margin-bottom: 4px;
  background-color: white;
  border-radius: 3px;
  border-left: 3px solid #28a745;
  transition: all 0.2s ease;
}

.history-item:hover {
  background-color: #f8f9fa;
  transform: translateX(2px);
}

.history-item:last-child {
  margin-bottom: 0;
}

/* 输入框聚焦样式 */
.form-control:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.25);
}

/* 按钮动画 */
.btn-success:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

.btn-outline-secondary:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 加载动画 */
.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* 响应式设计改进 */
@media (max-width: 768px) {
  .input-group {
    flex-direction: column;
  }

  .input-group .btn {
    margin-top: 10px;
    width: 100%;
  }

  .generation-history {
    max-height: 100px;
  }
}
</style>