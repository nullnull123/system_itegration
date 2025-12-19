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
              
              <!-- 阶段进度可视化 -->
              <div v-if="currentStatus === 'running'" class="stage-progress-container mt-3">
                <!-- 单课程生成阶段 -->
                <div v-if="collectionType === 'single_course'" class="stage-visualization">
                  <h6 class="stage-title">
                    <i class="bi bi-diagram-3"></i>
                    《{{ currentCourseName }}》生成进度
                  </h6>
                  <div class="stage-steps">
                    <div :class="['stage-step', getStageClass('初始化')]">
                      <div class="stage-icon">
                        <i class="bi bi-gear-fill"></i>
                      </div>
                      <div class="stage-label">初始化</div>
                    </div>
                    <div class="stage-connector"></div>
                    <div :class="['stage-step', getStageClass('权威内容')]">
                      <div class="stage-icon">
                        <i class="bi bi-book-fill"></i>
                      </div>
                      <div class="stage-label">权威内容</div>
                    </div>
                    <div class="stage-connector"></div>
                    <div :class="['stage-step', getStageClass('层次化结构')]">
                      <div class="stage-icon">
                        <i class="bi bi-diagram-2-fill"></i>
                      </div>
                      <div class="stage-label">层次结构</div>
                    </div>
                    <div class="stage-connector"></div>
                    <div :class="['stage-step', getStageClass('关系分析')]">
                      <div class="stage-icon">
                        <i class="bi bi-link-45deg"></i>
                      </div>
                      <div class="stage-label">关系分析</div>
                    </div>
                    <div class="stage-connector"></div>
                    <div :class="['stage-step', getStageClass('完整性验证')]">
                      <div class="stage-icon">
                        <i class="bi bi-check-circle-fill"></i>
                      </div>
                      <div class="stage-label">完整性验证</div>
                    </div>
                    <div class="stage-connector"></div>
                    <div :class="['stage-step', getStageClass('保存')]">
                      <div class="stage-icon">
                        <i class="bi bi-save-fill"></i>
                      </div>
                      <div class="stage-label">保存数据</div>
                    </div>
                  </div>
                </div>

                <!-- 完整知识图谱生成阶段 -->
                <div v-else class="stage-visualization">
                  <h6 class="stage-title">
                    <i class="bi bi-globe"></i>
                    完整知识图谱生成进度
                  </h6>
                  <div class="stage-steps">
                    <div :class="['stage-step', getFullGraphStageClass('初始化')]">
                      <div class="stage-icon">
                        <i class="bi bi-gear-fill"></i>
                      </div>
                      <div class="stage-label">初始化</div>
                    </div>
                    <div class="stage-connector"></div>
                    <div :class="['stage-step', getFullGraphStageClass('课程数据')]">
                      <div class="stage-icon">
                        <i class="bi bi-collection-fill"></i>
                      </div>
                      <div class="stage-label">课程数据</div>
                    </div>
                    <div class="stage-connector"></div>
                    <div :class="['stage-step', getFullGraphStageClass('知识点数据')]">
                      <div class="stage-icon">
                        <i class="bi bi-lightbulb-fill"></i>
                      </div>
                      <div class="stage-label">知识点数据</div>
                    </div>
                    <div class="stage-connector"></div>
                    <div :class="['stage-step', getFullGraphStageClass('数据处理')]">
                      <div class="stage-icon">
                        <i class="bi bi-cpu-fill"></i>
                      </div>
                      <div class="stage-label">数据处理</div>
                    </div>
                    <div class="stage-connector"></div>
                    <div :class="['stage-step', getFullGraphStageClass('关系生成')]">
                      <div class="stage-icon">
                        <i class="bi bi-bezier2"></i>
                      </div>
                      <div class="stage-label">关系生成</div>
                    </div>
                    <div class="stage-connector"></div>
                    <div :class="['stage-step', getFullGraphStageClass('保存')]">
                      <div class="stage-icon">
                        <i class="bi bi-database-fill"></i>
                      </div>
                      <div class="stage-label">保存数据</div>
                    </div>
                  </div>
                </div>

                <!-- 当前阶段详细信息 -->
                <div class="stage-detail-info mt-3">
                  <div class="alert alert-info mb-0">
                    <div class="d-flex align-items-center justify-content-between">
                      <div>
                        <i class="bi bi-info-circle me-2"></i>
                        <strong>{{ getFormattedStage(currentStage) }}</strong>
                        <p class="mb-0 mt-1 small">{{ getStageDescription(currentStage) }}</p>
                      </div>
                      <button 
                        @click="cancelGeneration" 
                        class="btn btn-sm btn-outline-danger"
                        :disabled="isCancelling"
                      >
                        <span v-if="isCancelling" class="spinner-border spinner-border-sm me-1"></span>
                        <i v-else class="bi bi-x-circle me-1"></i>
                        {{ isCancelling ? '取消中...' : '取消生成' }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 更新时间和刷新控制 -->
                <div class="progress-controls mt-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">
                      <i class="bi bi-clock"></i>
                      上次更新: {{ lastUpdated }}
                    </small>
                    <div>
                      <div class="form-check form-switch d-inline-block me-3">
                        <input 
                          class="form-check-input" 
                          type="checkbox" 
                          id="auto-refresh" 
                          v-model="autoRefreshEnabled"
                        >
                        <label class="form-check-label small" for="auto-refresh">自动刷新</label>
                      </div>
                      <button @click="fetchProgressInfo" class="btn btn-sm btn-outline-secondary">
                        <i class="bi bi-arrow-clockwise"></i>
                        立即刷新
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 空闲状态显示 -->
              <div v-else class="idle-state-info mt-3">
                <div class="alert alert-secondary">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <i class="bi bi-pause-circle me-2"></i>
                      <strong>当前无生成任务运行</strong>
                      <p class="mb-0 mt-1 small">您可以开始新的知识图谱生成任务</p>
                    </div>
                    <button @click="fetchProgressInfo" class="btn btn-sm btn-outline-secondary">
                      <i class="bi bi-arrow-clockwise"></i>
                      刷新状态
                    </button>
                  </div>
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
                </div>
              </div>
            </div>

            <!-- 🔖 快照/备份管理 -->
            <div class="snapshot-management-section mt-4">
              <div class="card">
                <div class="card-header bg-light">
                  <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                      <i class="bi bi-archive"></i>
                      快照与备份管理
                    </h5>
                    <div>
                      <button 
                        @click="createSnapshot('full')" 
                        class="btn btn-sm btn-primary me-2"
                        :disabled="isCreatingSnapshot"
                      >
                        <span v-if="isCreatingSnapshot" class="spinner-border spinner-border-sm me-1"></span>
                        <i v-else class="bi bi-camera"></i>
                        创建完整图谱快照
                      </button>
                      <div class="btn-group me-2">
                        <button 
                          type="button" 
                          class="btn btn-sm btn-success dropdown-toggle" 
                          data-bs-toggle="dropdown" 
                          aria-expanded="false"
                          :disabled="isCreatingSnapshot || !availableCourses || availableCourses.length === 0"
                        >
                          <i class="bi bi-book"></i>
                          创建单课程快照
                        </button>
                        <ul class="dropdown-menu">
                          <li v-if="!availableCourses || availableCourses.length === 0">
                            <span class="dropdown-item text-muted">暂无可用课程</span>
                          </li>
                          <li v-for="course in availableCourses" :key="course">
                            <a class="dropdown-item" href="#" @click.prevent="createSnapshot('single_course', course)">
                              <i class="bi bi-book"></i> {{ course }}
                            </a>
                          </li>
                        </ul>
                      </div>
                      <button 
                        @click="refreshSnapshots" 
                        class="btn btn-sm btn-outline-secondary"
                      >
                        <i class="bi bi-arrow-clockwise"></i>
                        刷新
                      </button>
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <!-- 快照列表 -->
                  <div v-if="snapshots.length > 0" class="snapshot-list">
                    <div 
                      v-for="snapshot in snapshots" 
                      :key="snapshot.id" 
                      class="snapshot-item"
                    >
                      <div class="snapshot-header">
                        <div class="snapshot-info">
                          <div class="snapshot-icon">
                            <i v-if="snapshot.type === 'full'" class="bi bi-globe text-primary"></i>
                            <i v-else-if="snapshot.type === 'single_course'" class="bi bi-book text-success"></i>
                            <i v-else class="bi bi-archive text-secondary"></i>
                          </div>
                          <div class="snapshot-details">
                            <h6 class="mb-1">{{ snapshot.name }}</h6>
                            <p v-if="snapshot.description" class="text-muted small mb-1">{{ snapshot.description }}</p>
                            <div class="snapshot-meta">
                              <span class="badge bg-info me-1">
                                {{ snapshot.entity_count }} 实体
                              </span>
                              <span class="badge bg-success me-1">
                                {{ snapshot.relation_count }} 关系
                              </span>
                              <span v-if="snapshot.course_name" class="badge bg-warning me-1">
                                课程: {{ snapshot.course_name }}
                              </span>
                              <span class="badge bg-secondary me-1">
                                {{ snapshot.file_size }}
                              </span>
                              <span class="text-muted small">
                                <i class="bi bi-clock"></i>
                                {{ snapshot.created_at }}
                              </span>
                              <span v-if="snapshot.restored_count > 0" class="text-muted small ms-2">
                                <i class="bi bi-arrow-counterclockwise"></i>
                                已恢复 {{ snapshot.restored_count }} 次
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="snapshot-actions">
                          <button 
                            @click="restoreSnapshot(snapshot)" 
                            class="btn btn-sm btn-success me-1"
                            :disabled="isRestoringSnapshot"
                            title="恢复此快照"
                          >
                            <i class="bi bi-arrow-counterclockwise"></i>
                            恢复
                          </button>
                          <button 
                            @click="downloadSnapshot(snapshot)" 
                            class="btn btn-sm btn-info me-1"
                            title="下载快照文件"
                          >
                            <i class="bi bi-download"></i>
                            下载
                          </button>
                          <button 
                            @click="deleteSnapshot(snapshot)" 
                            class="btn btn-sm btn-danger"
                            title="删除快照"
                          >
                            <i class="bi bi-trash"></i>
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center text-muted py-4">
                    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                    <p class="mt-2">暂无快照记录</p>
                    <p class="small">创建快照可以保护您的知识图谱数据，防止误删或误更新</p>
                  </div>
                  
                  <!-- 快照说明 -->
                  <div class="alert alert-info mt-3 mb-0">
                    <h6><i class="bi bi-info-circle"></i> 快照功能说明</h6>
                    <ul class="mb-0 small">
                      <li><strong>完整图谱快照</strong>：备份整个计算机专业知识图谱的所有数据</li>
                      <li><strong>单课程快照</strong>：在生成单课程时自动创建，仅备份该课程的数据</li>
                      <li><strong>恢复快照</strong>：将知识图谱恢复到快照创建时的状态</li>
                      <li><strong>下载快照</strong>：将快照文件下载到本地，可用于离线备份或迁移</li>
                      <li>💡 建议在重要操作前创建快照，以便在出现问题时快速恢复</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- 生成历史记录 -->
            <div class="generation-history-section mt-4">
              <div class="card">
                <div class="card-header bg-light">
                  <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                      <i class="bi bi-clock-history"></i>
                      生成历史记录
                    </h5>
                    <button 
                      v-if="generationHistory.length > 0" 
                      @click="clearHistory" 
                      class="btn btn-sm btn-outline-danger"
                    >
                      <i class="bi bi-trash"></i>
                      清空历史
                    </button>
                  </div>
                </div>
                <div class="card-body">
                  <div v-if="generationHistory.length > 0" class="history-list">
                    <div 
                      v-for="(record, index) in generationHistory" 
                      :key="record.id" 
                      class="history-record"
                    >
                      <div class="history-record-header">
                        <div class="history-record-title">
                          <span class="history-index">#{{ generationHistory.length - index }}</span>
                          <strong>{{ record.courseName }}</strong>
                          <span :class="['badge', record.status === 'completed' ? 'bg-success' : record.status === 'cancelled' ? 'bg-warning' : 'bg-danger']">
                            {{ getStatusText(record.status) }}
                          </span>
                        </div>
                        <div class="history-record-actions">
                          <button 
                            v-if="record.status === 'completed'" 
                            @click="viewHistoryResult(record)" 
                            class="btn btn-sm btn-outline-primary"
                          >
                            <i class="bi bi-eye"></i>
                            查看
                          </button>
                          <button 
                            @click="regenerateCourse(record.courseName)" 
                            class="btn btn-sm btn-outline-success"
                            :disabled="isRunning"
                          >
                            <i class="bi bi-arrow-clockwise"></i>
                            重新生成
                          </button>
                          <button 
                            @click="deleteHistoryRecord(record.id)" 
                            class="btn btn-sm btn-outline-danger"
                          >
                            <i class="bi bi-trash"></i>
                            删除
                          </button>
                        </div>
                      </div>
                      <div class="history-record-details">
                        <small class="text-muted">
                          <i class="bi bi-calendar"></i>
                          {{ record.timestamp }}
                        </small>
                        <small v-if="record.knowledgePointsCount" class="text-muted ms-3">
                          <i class="bi bi-lightbulb"></i>
                          {{ record.knowledgePointsCount }} 个知识点
                        </small>
                        <small v-if="record.duration" class="text-muted ms-3">
                          <i class="bi bi-stopwatch"></i>
                          耗时 {{ record.duration }}
                        </small>
                      </div>
                      <div v-if="record.errorMessage" class="history-record-error mt-2">
                        <small class="text-danger">
                          <i class="bi bi-exclamation-triangle"></i>
                          {{ record.errorMessage }}
                        </small>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center text-muted py-4">
                    <i class="bi bi-inbox" style="font-size: 3rem;"></i>
                    <p class="mt-2">暂无生成历史记录</p>
                    <p class="small">开始生成知识图谱后，历史记录将显示在这里</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 提示信息 -->
            <div v-if="successMessage" class="alert alert-success mt-3">
              {{ successMessage }}
              <!-- 如果是单课程生成完成，显示操作按钮 -->
              <div v-if="pendingGeneration.isActive && successMessage.includes('知识图谱生成完成')" class="mt-2">
                <div class="d-flex align-items-center flex-wrap">
                  <button @click="viewKnowledgeGraph" class="btn btn-sm btn-primary me-2 mb-2">
                    <i class="bi bi-eye"></i> 查看知识图谱
                  </button>
                  <button @click="createSnapshot('single_course', pendingGeneration.courseName)" class="btn btn-sm btn-success me-2 mb-2">
                    <i class="bi bi-camera"></i> 创建快照备份
                  </button>
                  <button @click="openNeo4jVerify" class="btn btn-sm btn-outline-success me-2 mb-2">
                    验证Neo4j数据
                  </button>
                  <button @click="viewGeneratedFile" class="btn btn-sm btn-outline-info me-2 mb-2">
                    查看生成文件
                  </button>
                  <small class="text-muted mb-2">
                    <i class="bi bi-info-circle"></i> 
                    建议创建快照以保护数据
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
      // 平滑进度相关变量
      lastProgressUpdate: null,
      smoothProgressValue: 0,
      courseName: '',  // 单课程名称
      currentCourseName: '', // 当前正在生成或已生成的课程名
      collectionType: '', // 当前生成类型
      currentStage: '', // 当前生成阶段
      generationHistory: [], // 生成历史记录
      sampleCourses: ['数据结构', '操作系统', '计算机网络', '数据库系统', '软件工程', '人工智能', '编译原理', '计算机组成原理'],  // 示例课程
      isInitialLoad: true, // 是否为页面首次加载
      lastCompletedCourse: '', // 最后完成的课程名称
      isCancelling: false, // 是否正在取消生成
      currentGenerationId: null, // 当前生成任务ID
      generationStartTime: null, // 生成开始时间
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
      },
      // 快照管理相关
      snapshots: [],
      isCreatingSnapshot: false,
      isRestoringSnapshot: false,
      availableCourses: []  // 可用的课程列表
    }
  },
  computed: {
    statusClass: function() {
      return {
        'status-running': this.currentStatus === 'running',
        'status-completed': this.currentStatus === 'completed',
        'status-error': this.currentStatus === 'error',
        'status-cancelled': this.currentStatus === 'cancelled',
        'status-idle': this.currentStatus === 'idle'
      }
    },
    statusText: function() {
      var statusMap = {
        'running': '采集中',
        'completed': '已完成',
        'error': '出错',
        'cancelled': '已取消',
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

    // 加载快照列表
    this.refreshSnapshots()
    
    // 加载可用课程列表
    this.loadAvailableCourses()

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
        var interval = this.currentStatus === 'running' ? 1000 : 3000
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
                // 🔧 修复：如果是页面刷新后的首次加载，且状态是completed，检查是否已处理过
                if (self.isInitialLoad && data.progress && data.progress.status === 'completed') {
                  var courseName = data.progress.course_name
                  if (courseName) {
                    var completedKey = 'completed_' + courseName + '_' + (data.progress.timestamp || Date.now())
                    var alreadyProcessed = sessionStorage.getItem(completedKey)
                    if (alreadyProcessed) {
                      console.log('[FETCH PROGRESS] 页面刷新检测到已处理的completed状态，重置为idle')
                      data.progress.status = 'idle'
                      data.progress.stage = 'idle'
                    }
                  }
                }
                self.updateProgress(data.progress)
                self.clearMessages()
                // 标记首次加载完成
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
      console.log('[UPDATE PROGRESS] 更新进度数据:', progress)

      // 安全地提取数据，处理可能的数据格式问题
      this.lastBatch = this.safeGetNumber(progress.last_batch, 0)
      this.totalBatches = this.safeGetNumber(progress.total_batches, 20)
      this.lastUpdated = progress.last_updated || '未知'
      this.processedTopics = Array.isArray(progress.processed_topics) ? progress.processed_topics : []

      // 检查是否是单课程生成
      const isSingleCourse = progress.collection_type === 'single_course' && progress.course_name

      console.log('[UPDATE PROGRESS] 生成类型:', {
        collection_type: progress.collection_type,
        course_name: progress.course_name,
        isSingleCourse: isSingleCourse,
        status: progress.status,
        stage: progress.stage
      })

      // 🔧 修复：处理completed状态的重置逻辑，避免重复记录
      if (progress.status === 'completed' && isSingleCourse) {
        // 🔧 使用localStorage持久化标记，避免重启后端时重复记录
        // 使用课程名和时间戳作为唯一标识
        const completedKey = `completed_${progress.course_name}_${progress.timestamp || progress.last_updated || ''}`
        const alreadyProcessed = localStorage.getItem(completedKey)
        
        // 如果已经处理过这个completed状态，跳过
        if (alreadyProcessed) {
          console.log('[UPDATE PROGRESS] 跳过已处理的completed状态:', completedKey)
          // 重置状态为idle，避免继续显示completed
          progress.status = 'idle'
          progress.stage = 'idle'
          return
        }
        
        // 标记为已处理（使用localStorage，持久化保存）
        localStorage.setItem(completedKey, 'true')
        console.log('[UPDATE PROGRESS] 标记completed状态已处理:', completedKey)
        
        // 🔧 清理旧的completed标记（保留最近50个）
        try {
          const allKeys = Object.keys(localStorage)
          const completedKeys = allKeys.filter(key => key.startsWith('completed_'))
          if (completedKeys.length > 50) {
            // 按时间排序，删除最旧的
            completedKeys.sort().slice(0, completedKeys.length - 50).forEach(key => {
              localStorage.removeItem(key)
            })
            console.log('[UPDATE PROGRESS] 已清理旧的completed标记')
          }
        } catch (e) {
          console.warn('[UPDATE PROGRESS] 清理旧标记失败:', e)
        }
        
        // 单课程生成完成，显示成功信息
        console.log('[UPDATE PROGRESS] 单课程生成完成:', progress.course_name)
        this.successMessage = `课程《${progress.course_name}》知识图谱生成完成！`
        
        // 添加到生成历史（只记录一次）
        this.addGenerationHistory(
          progress.course_name,
          progress.knowledge_points_count || 0,
          'completed',
          ''
        )
        
        // 保存生成完成的课程信息，供用户手动查看时使用
        this.pendingGeneration.courseName = progress.course_name
        this.pendingGeneration.isActive = true
        this.pendingGeneration.completedAt = new Date().toISOString()
        
        // 将生成完成的课程信息保存到sessionStorage（关闭页面后自动清除）
        try {
          const generatedCourseInfo = {
            courseName: progress.course_name,
            completedAt: new Date().toISOString(),
            timestamp: Date.now(),
            needsRefresh: true
          }
          sessionStorage.setItem('lastGeneratedCourse', JSON.stringify(generatedCourseInfo))
          console.log('[UPDATE PROGRESS] 已保存生成完成的课程信息到sessionStorage:', generatedCourseInfo)
          
          // 触发自定义事件通知其他页面数据更新
          const event = new CustomEvent('courseGenerationComplete', {
            detail: {
              courseName: progress.course_name,
              timestamp: Date.now(),
              action: 'single_course_complete'
            }
          });
          window.dispatchEvent(event);
          console.log('[UPDATE PROGRESS] 已触发courseGenerationComplete事件')
          
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
              console.log('[UPDATE PROGRESS] 已通过BroadcastChannel通知其他标签页')
              channel.close();
            } catch (broadcastError) {
              console.warn('[UPDATE PROGRESS] BroadcastChannel通知失败:', broadcastError)
            }
          }
        } catch (e) {
          console.warn('[UPDATE PROGRESS] 无法保存课程信息到sessionStorage:', e)
        }
        
        // 🔧 修复：停止自动刷新，避免继续获取completed状态
        this.stopAutoRefresh()
        
        // 重置进度状态为idle，但保留课程名称用于显示
        progress.status = 'idle'
        progress.stage = 'idle'
        this.processedTopics = []
        this.progressValue = 100  // 完成时显示100%
      }

      // 更新采集类型和课程信息
      this.collectionType = progress.collection_type || ''
      this.currentCourseName = progress.course_name || ''
      this.currentStage = progress.stage || ''

      // 计算进度值 - 使用平滑进度算法
      console.log('[UPDATE PROGRESS] 开始计算进度值...')
      this.progressValue = this.calculateSmoothProgress(progress, isSingleCourse)
      console.log('[UPDATE PROGRESS] 进度值计算完成:', this.progressValue, '%')

      this.currentStatus = progress.status || 'idle'

      // 根据状态自动停止刷新和调整刷新间隔
      if (this.currentStatus === 'completed' || this.currentStatus === 'error' || this.currentStatus === 'cancelled') {
        this.isRunning = false

        // 如果是单课程生成完成，停止自动刷新
        if (isSingleCourse && this.currentStatus === 'completed') {
          this.stopAutoRefresh()
        }

        // 如果是取消状态，也停止自动刷新
        if (this.currentStatus === 'cancelled') {
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
      } else if (this.currentStatus === 'running') {
        // 如果状态变为运行中，重新启动自动刷新以使用更快的间隔
        this.startAutoRefresh()
      }

      console.log('[UPDATE PROGRESS] 进度更新完成:', {
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
      
      // 将'start'类型映射为'reset'，因为开始生成实际上就是重置模式
      var actualType = type === 'start' ? 'reset' : type
      
      // 记录生成开始时间
      this.generationStartTime = Date.now()
      
      this.isRunning = true
      this.clearMessages()

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

      // 容错确认对话框
      const courseName = this.courseName.trim()
      const confirmMessage = `确认生成《${courseName}》的知识图谱？\n\n` +
                            `生成过程大约需要 25-30 分钟，期间请勿关闭页面。\n` +
                            `如果该课程已存在，将会更新其数据。\n\n` +
                            `点击"确定"开始生成。`
      
      if (!confirm(confirmMessage)) {
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
        
        // 记录生成开始时间
        this.generationStartTime = Date.now()

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
        'finalizing': '正在完成最后步骤',
        // 🔧 新增：单课程生成的详细阶段（完整映射）
        '开始生成': '开始生成',
        '开始生成四层次结构': '开始生成',
        '增强模式初始化': '正在初始化',
        '正在初始化': '正在初始化',
        '正在初始化AI生成器': '正在初始化AI生成器',
        '正在生成四层次结构': '正在生成层次化结构',
        '正在生成层次化结构': '正在生成层次化结构',
        '权威内容提取完成': '权威内容提取完成',
        '正在提取权威内容': '正在提取权威内容',
        '层次化结构生成完成': '层次化结构生成完成',
        '关系分析完成': '关系分析完成',
        '正在进行关系分析': '正在进行关系分析',
        '完整性验证完成': '完整性验证完成',
        '正在进行完整性验证': '正在进行完整性验证',
        '正在调用DeepSeek生成知识点': '正在调用AI生成知识点',
        '知识点生成完成': '知识点生成完成',
        '正在保存到Neo4j': '正在保存到数据库',
        '保存完成': '保存完成',
        '增强模式构建完成': '生成完成',
        '生成完成': '生成完成',
        '生成失败': '生成失败'
      }
      
      // 如果是直接匹配的阶段
      if (stageMap[stage]) {
        return stageMap[stage]
      }
      
      // 如果包含特定关键词，进行模糊匹配
      const lowerStage = stage.toLowerCase()
      if (lowerStage.includes('权威内容') && lowerStage.includes('完成')) {
        return '权威内容提取完成'
      } else if (lowerStage.includes('权威内容') || lowerStage.includes('authoritative')) {
        return '正在提取权威内容'
      } else if (lowerStage.includes('层次化结构') && lowerStage.includes('完成')) {
        return '层次化结构生成完成'
      } else if (lowerStage.includes('层次化') || lowerStage.includes('hierarchical')) {
        return '正在生成层次化结构'
      } else if (lowerStage.includes('关系分析') && lowerStage.includes('完成')) {
        return '关系分析完成'
      } else if (lowerStage.includes('关系分析') || lowerStage.includes('analyzing')) {
        return '正在分析关系'
      } else if (lowerStage.includes('完整性验证') && lowerStage.includes('完成')) {
        return '完整性验证完成'
      } else if (lowerStage.includes('完整性') || lowerStage.includes('completeness')) {
        return '正在验证完整性'
      } else if (lowerStage.includes('collect') && lowerStage.includes('course')) {
        return '正在收集课程数据'
      } else if (lowerStage.includes('collect') && lowerStage.includes('knowledge')) {
        return '正在收集知识点数据'
      } else if (lowerStage.includes('process') && lowerStage.includes('data')) {
        return '正在处理数据'
      } else if (lowerStage.includes('build') && lowerStage.includes('graph')) {
        return '正在构建知识图谱'
      } else if (lowerStage.includes('save') || lowerStage.includes('database') || lowerStage.includes('neo4j')) {
        return '正在保存到数据库'
      } else if (lowerStage.includes('verify') || lowerStage.includes('verification') || lowerStage.includes('验证')) {
        return '正在验证数据'
      } else if (lowerStage.includes('relation')) {
        return '正在生成关系'
      } else if (lowerStage.includes('cleanup')) {
        return '正在清理数据'
      } else if (lowerStage.includes('merge')) {
        return '正在合并数据'
      } else if (lowerStage.includes('final')) {
        return '正在完成最后步骤'
      } else if (lowerStage.includes('初始化') || lowerStage.includes('initialize')) {
        return '正在初始化'
      } else if (lowerStage.includes('deepseek') || lowerStage.includes('ai')) {
        return '正在调用AI生成'
      }
      
      // 如果都不匹配，返回原始值（保持中文原样，英文首字母大写）
      if (/[\u4e00-\u9fa5]/.test(stage)) {
        // 包含中文，直接返回
        return stage
      } else {
        // 纯英文，格式化后返回
        return stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
    },

    // 统一计算进度值的方法
    calculateProgressValue: function(progress, isSingleCourse) {
      const status = progress.status || 'idle'
      const stage = progress.stage || ''
      
      // 如果是空闲状态，返回0
      if (status === 'idle') {
        return 0
      }
      
      // 如果是错误状态，返回0
      if (status === 'error') {
        return 0
      }
      
      // 如果是完成状态，返回100
      if (status === 'completed') {
        return 100
      }
      
      // 如果是运行状态，根据类型和阶段计算进度
      if (status === 'running') {
        if (isSingleCourse) {
          return this.calculateSingleCourseProgress(stage, progress.course_name)
        } else {
          return this.calculateFullGraphProgress(stage)
        }
      }
      
      // 默认返回0
      return 0
    },

    // 计算单课程生成进度
    calculateSingleCourseProgress: function(stage, courseName) {
      if (!stage) return 5
      
      const lowerStage = stage.toLowerCase()
      
      // 🔧 修复：增加更多阶段的进度映射，避免在"权威内容提取完成"后跳到100%
      if (lowerStage.includes('开始生成') || lowerStage.includes('start')) {
        this.successMessage = `🚀 开始生成《${courseName}》知识图谱...`
        return 5
      } else if (lowerStage.includes('初始化') || lowerStage.includes('initialize')) {
        this.successMessage = `🚀 正在初始化AI生成器...`
        return 10
      } else if (lowerStage.includes('增强模式初始化')) {
        this.successMessage = `🔧 正在初始化增强模式...`
        return 15
      } else if (lowerStage.includes('权威内容') || lowerStage.includes('提取权威') || lowerStage.includes('authoritative')) {
        this.successMessage = `📚 正在提取《${courseName}》的权威内容...`
        return 25
      } else if (lowerStage.includes('权威内容提取完成') || lowerStage.includes('权威内容完成')) {
        this.successMessage = `✅ 权威内容提取完成，开始生成层次化结构...`
        return 35
      } else if (lowerStage.includes('层次化结构') || lowerStage.includes('hierarchical') || lowerStage.includes('生成结构')) {
        this.successMessage = `🏗️ 正在生成《${courseName}》的层次化结构...`
        return 50
      } else if (lowerStage.includes('层次化结构生成完成') || lowerStage.includes('结构生成完成')) {
        this.successMessage = `✅ 层次化结构生成完成，开始关系分析...`
        return 60
      } else if (lowerStage.includes('关系分析') || lowerStage.includes('relation') || lowerStage.includes('analyzing')) {
        this.successMessage = `🔗 正在分析《${courseName}》的知识点关系...`
        return 70
      } else if (lowerStage.includes('关系分析完成') || lowerStage.includes('关系完成')) {
        this.successMessage = `✅ 关系分析完成，开始完整性验证...`
        return 75
      } else if (lowerStage.includes('完整性验证') || lowerStage.includes('validation') || lowerStage.includes('验证')) {
        this.successMessage = `🔍 正在验证《${courseName}》的数据完整性...`
        return 80
      } else if (lowerStage.includes('完整性验证完成') || lowerStage.includes('验证完成')) {
        this.successMessage = `✅ 完整性验证完成，开始保存到数据库...`
        return 85
      } else if (lowerStage.includes('保存') || lowerStage.includes('saving') || lowerStage.includes('neo4j')) {
        this.successMessage = `💾 正在保存《${courseName}》到Neo4j数据库...`
        return 90
      } else if (lowerStage.includes('deepseek') || lowerStage.includes('ai') || lowerStage.includes('生成知识点')) {
        this.successMessage = `🤖 正在调用AI生成《${courseName}》的知识点...`
        return 30
      } else if (lowerStage.includes('parsing') || lowerStage.includes('解析')) {
        this.successMessage = `📝 正在解析《${courseName}》的知识点数据...`
        return 40
      } else if (lowerStage.includes('生成完成') || lowerStage.includes('completed')) {
        this.successMessage = `✅ 《${courseName}》知识图谱生成完成！`
        return 100
      } else {
        // 默认情况：显示当前阶段信息
        this.successMessage = `⚡ 正在处理《${courseName}》的知识图谱... (${stage})`
        return 20
      }
    },

    // 计算完整知识图谱生成的进度
    calculateFullGraphProgress: function(stage) {
      if (!stage) return 5
      
      const lowerStage = stage.toLowerCase()
      
      // 根据不同阶段返回相应的进度百分比
      if (lowerStage.includes('idle') || lowerStage === '') {
        return 0
      } else if (lowerStage.includes('reset') || lowerStage.includes('初始化')) {
        return 10
      } else if (lowerStage.includes('collecting_course_data') || lowerStage.includes('收集课程数据')) {
        return 20
      } else if (lowerStage.includes('collecting_knowledge_data') || lowerStage.includes('收集知识点数据')) {
        return 35
      } else if (lowerStage.includes('data_collection_complete') || lowerStage.includes('数据收集完成')) {
        return 50
      } else if (lowerStage.includes('processing_data') || lowerStage.includes('处理数据')) {
        return 65
      } else if (lowerStage.includes('data_cleanup_complete') || lowerStage.includes('数据清理完成')) {
        return 75
      } else if (lowerStage.includes('data_merge_complete') || lowerStage.includes('数据合并完成')) {
        return 85
      } else if (lowerStage.includes('relations_generated') || lowerStage.includes('关系生成')) {
        return 90
      } else if (lowerStage.includes('building_graph') || lowerStage.includes('构建知识图谱')) {
        return 95
      } else if (lowerStage.includes('saving_to_database') || lowerStage.includes('保存到数据库')) {
        return 98
      } else if (lowerStage.includes('verification') || lowerStage.includes('验证数据')) {
        return 99
      } else if (lowerStage.includes('finalizing') || lowerStage.includes('完成最后步骤')) {
        return 99
      } else if (lowerStage.includes('completed') || lowerStage.includes('已完成')) {
        return 100
      }
      
      // 默认运行中状态
      return 15
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


    // 安全获取数字值
    safeGetNumber: function(value, defaultValue) {
      if (typeof defaultValue === 'undefined') {
        defaultValue = 0
      }
      if (typeof value === 'number' && !isNaN(value)) {
        return value
      }
      if (typeof value === 'string') {
        var parsed = parseFloat(value)
        return isNaN(parsed) ? defaultValue : parsed
      }
      return defaultValue
    },

    // 平滑进度计算算法
    calculateSmoothProgress: function(progress, isSingleCourse) {
      var targetProgress = 0
      var currentTime = Date.now()
      
      // 如果没有上次进度更新时间，初始化
      if (!this.lastProgressUpdate) {
        this.lastProgressUpdate = currentTime
        this.smoothProgressValue = this.progressValue || 0
      }
      
      // 根据不同状态和阶段计算目标进度
      if (progress.status === 'completed') {
        targetProgress = 100
      } else if (progress.status === 'running') {
        if (isSingleCourse) {
          // 单课程生成的进度映射
          targetProgress = this.calculateSingleCourseProgress(progress.stage || '', progress.course_name || '')
        } else {
          // 批量生成的进度映射
          targetProgress = this.calculateBatchProgress(progress)
        }
      } else if (progress.status === 'idle') {
        targetProgress = 0
      } else if (progress.status === 'error') {
        targetProgress = this.smoothProgressValue // 保持当前进度
      }
      
      console.log('[PROGRESS] 计算进度:', {
        status: progress.status,
        stage: progress.stage,
        isSingleCourse: isSingleCourse,
        targetProgress: targetProgress,
        currentProgress: this.smoothProgressValue
      })
      
      // 计算时间差（毫秒）
      var timeDiff = currentTime - this.lastProgressUpdate
      this.lastProgressUpdate = currentTime
      
      // 平滑过渡算法
      var smoothedProgress = this.applySmoothTransition(
        this.smoothProgressValue || 0, 
        targetProgress, 
        timeDiff
      )
      
      // 更新内部平滑进度值
      this.smoothProgressValue = smoothedProgress
      
      return Math.round(smoothedProgress * 10) / 10 // 保留一位小数
    },

    // 单课程生成进度计算
    calculateSingleCourseProgress: function(stage, courseName) {
      if (!stage) {
        console.log('[PROGRESS] 阶段为空，返回初始进度5%')
        return 5
      }
      
      var lowerStage = stage.toLowerCase()
      console.log('[PROGRESS] 计算单课程进度，阶段:', stage, '小写:', lowerStage)
      
      // 🔧 修复：添加完整的阶段进度映射，确保每个阶段都有对应的进度值
      var progressValue = 0
      
      // 1. 初始化阶段 (0-15%)
      if (lowerStage.includes('初始化') || lowerStage.includes('initialize') || lowerStage.includes('开始')) {
        progressValue = 10
        this.successMessage = `🚀 正在初始化AI生成器...`
      } 
      // 2. 权威内容阶段 (15-30%)
      else if (lowerStage.includes('权威内容') || lowerStage.includes('authoritative')) {
        if (lowerStage.includes('完成')) {
          progressValue = 30
          this.successMessage = `✅ 已完成权威教材和标准的内容提取，接下来将生成层次化结构...`
        } else {
          progressValue = 20
          this.successMessage = `📚 正在提取《${courseName}》的权威内容...`
        }
      }
      // 3. 层次化结构阶段 (30-55%)
      else if (lowerStage.includes('层次化') || lowerStage.includes('hierarchical') || lowerStage.includes('结构') || lowerStage.includes('structure')) {
        if (lowerStage.includes('完成')) {
          progressValue = 55
          this.successMessage = `✅ 层次化结构生成完成，接下来将进行关系分析...`
        } else {
          progressValue = 40
          this.successMessage = `🏗️ 正在生成《${courseName}》的层次化结构（课程->章->节->知识点）...`
        }
      }
      // 4. 关系分析阶段 (55-75%)
      else if (lowerStage.includes('关系') || lowerStage.includes('relation')) {
        if (lowerStage.includes('完成')) {
          progressValue = 75
          this.successMessage = `✅ 关系分析完成，接下来将进行完整性验证...`
        } else {
          progressValue = 65
          this.successMessage = `🔗 正在分析《${courseName}》的知识点关系...`
        }
      }
      // 5. 完整性验证阶段 (75-85%)
      else if (lowerStage.includes('完整性') || lowerStage.includes('验证') || lowerStage.includes('verify') || lowerStage.includes('validation') || lowerStage.includes('completeness')) {
        if (lowerStage.includes('完成')) {
          progressValue = 85
          this.successMessage = `✅ 完整性验证完成，接下来将保存到数据库...`
        } else {
          progressValue = 80
          this.successMessage = `🔍 正在验证《${courseName}》的数据完整性...`
        }
      }
      // 6. 保存阶段 (85-95%)
      else if (lowerStage.includes('neo4j') || lowerStage.includes('保存') || lowerStage.includes('saving') || lowerStage.includes('save') || lowerStage.includes('数据库')) {
        progressValue = 90
        this.successMessage = `💾 正在保存《${courseName}》到Neo4j数据库...`
      }
      // 7. DeepSeek相关（备用）
      else if (lowerStage.includes('deepseek') || lowerStage.includes('ai') || lowerStage.includes('生成知识点') || lowerStage.includes('calling')) {
        progressValue = 35
        this.successMessage = `🤖 正在调用AI生成《${courseName}》的知识点...`
      }
      // 8. 解析阶段（备用）
      else if (lowerStage.includes('parsing') || lowerStage.includes('解析') || lowerStage.includes('parse')) {
        progressValue = 50
        this.successMessage = `📝 正在解析《${courseName}》的知识点数据...`
      }
      // 9. 完成状态
      else if (lowerStage.includes('completed') || (lowerStage.includes('完成') && !lowerStage.includes('权威') && !lowerStage.includes('层次') && !lowerStage.includes('关系') && !lowerStage.includes('验证'))) {
        progressValue = 100
        this.successMessage = `✅ 《${courseName}》知识图谱生成完成！`
      }
      // 10. 默认运行中状态
      else {
        progressValue = 20
        this.successMessage = `⚡ 正在处理《${courseName}》的知识图谱...`
      }
      
      console.log('[PROGRESS] 单课程进度计算结果:', progressValue, '%')
      return progressValue
    },

    // 批量生成进度计算
    calculateBatchProgress: function(progress) {
      var lastBatch = this.safeGetNumber(progress.last_batch, 0)
      var totalBatches = this.safeGetNumber(progress.total_batches, 20)
      var processedCount = (progress.processed_topics || []).length
      var stage = (progress.stage || '').toLowerCase()
      
      console.log('[PROGRESS] 计算批量进度:', {
        lastBatch: lastBatch,
        totalBatches: totalBatches,
        processedCount: processedCount,
        stage: stage
      })
      
      // 基础批次进度
      var batchProgress = totalBatches > 0 ? (lastBatch / totalBatches) * 70 : 0
      
      // 根据阶段调整进度
      var stageBonus = 0
      if (stage.includes('generating_relations') || stage.includes('生成关系') || stage.includes('relation')) {
        stageBonus = 15
      } else if (stage.includes('saving') || stage.includes('保存') || stage.includes('save')) {
        stageBonus = 25
      } else if (stage.includes('collecting') || stage.includes('收集')) {
        stageBonus = 5
      } else if (stage.includes('processing') || stage.includes('处理')) {
        stageBonus = 10
      }
      
      // 根据处理的知识点数量微调
      var knowledgeBonus = Math.min(processedCount * 0.5, 10)
      
      var totalProgress = Math.min(batchProgress + stageBonus + knowledgeBonus, 95)
      console.log('[PROGRESS] 批量进度计算结果:', totalProgress, '%')
      
      return totalProgress
    },

    // 平滑过渡算法
    applySmoothTransition: function(currentProgress, targetProgress, timeDiff) {
      // 如果目标进度和当前进度相同，直接返回
      if (Math.abs(targetProgress - currentProgress) < 0.1) {
        return targetProgress
      }
      
      // 计算过渡速度（每秒的进度变化）
      var transitionSpeed = this.calculateTransitionSpeed(currentProgress, targetProgress)
      
      // 根据时间差计算进度变化量
      var progressChange = (transitionSpeed * timeDiff) / 1000
      
      // 应用变化
      var newProgress
      if (targetProgress > currentProgress) {
        newProgress = Math.min(currentProgress + progressChange, targetProgress)
      } else {
        newProgress = Math.max(currentProgress - progressChange, targetProgress)
      }
      
      return newProgress
    },

    // 计算过渡速度
    calculateTransitionSpeed: function(currentProgress, targetProgress) {
      var progressDiff = Math.abs(targetProgress - currentProgress)
      
      // 根据进度差异调整速度
      if (progressDiff > 50) {
        return 12 // 大幅跳跃时较快
      } else if (progressDiff > 20) {
        return 8 // 中等跳跃时中速
      } else if (progressDiff > 5) {
        return 4 // 小幅变化时较慢
      } else {
        return 1.5 // 微小变化时很慢
      }
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
    },

    // 🔧 新增：获取阶段的详细描述，帮助用户理解当前进度
    getStageDescription: function(stage) {
      if (!stage) return ''
      
      const lowerStage = stage.toLowerCase()
      
      // 🔧 修复：添加完整的阶段描述映射
      const descriptions = {
        '开始生成': '正在初始化生成流程，准备相关资源...',
        '增强模式初始化': '正在加载增强模式组件，包括权威内容提取器、层次化生成器等...',
        '正在初始化': '正在初始化系统组件和配置参数...',
        '正在初始化AI生成器': '正在连接DeepSeek AI服务，准备生成知识点...',
        '正在提取权威内容': '正在从权威教材和教学标准中提取课程内容...',
        '权威内容提取完成': '✅ 已完成权威教材和标准的内容提取，接下来将生成层次化结构...',
        '正在生成层次化结构': '正在生成课程的四层结构（课程→章→节→知识点）...',
        '层次化结构生成完成': '✅ 已完成课程-章-节-知识点的四层结构生成，接下来将分析知识点间关系...',
        '正在进行关系分析': '正在分析知识点之间的学习关系（前置、并行、应用等）...',
        '关系分析完成': '✅ 已完成知识点间的前置、并行、应用等关系分析，接下来将进行完整性验证...',
        '正在进行完整性验证': '正在验证知识图谱的完整性和质量，确保数据准确可靠...',
        '完整性验证完成': '✅ 已完成数据完整性和质量验证，接下来将保存到Neo4j数据库...',
        '正在保存到Neo4j': '正在将生成的知识图谱数据写入Neo4j数据库，建立节点和关系...',
        '生成完成': '🎉 知识图谱生成完成！您可以在知识图谱页面查看结果。'
      }
      
      // 直接匹配
      if (descriptions[stage]) {
        return descriptions[stage]
      }
      
      // 模糊匹配
      if (lowerStage.includes('权威内容') && !lowerStage.includes('完成')) {
        return '正在从权威教材和教学标准中提取课程内容，这可能需要1-2分钟...'
      } else if (lowerStage.includes('层次化') && !lowerStage.includes('完成')) {
        return '正在生成课程的层次化结构（课程→章→节→知识点），这是知识图谱的核心框架...'
      } else if (lowerStage.includes('关系分析') && !lowerStage.includes('完成')) {
        return '正在分析知识点之间的学习关系（前置、并行、应用等），构建学习路径...'
      } else if (lowerStage.includes('完整性') && !lowerStage.includes('完成')) {
        return '正在验证知识图谱的完整性和质量，确保数据准确可靠...'
      } else if (lowerStage.includes('保存') || lowerStage.includes('neo4j')) {
        return '正在将知识图谱数据保存到Neo4j图数据库，建立节点和关系...'
      } else if (lowerStage.includes('deepseek') || lowerStage.includes('ai')) {
        return '正在使用DeepSeek AI生成课程知识点...'
      } else if (lowerStage.includes('初始化')) {
        return '正在初始化系统组件和配置参数...'
      }
      
      // 默认描述
      return '系统正在处理中，请耐心等待...'
    },

    // 🔧 新增：获取阶段的CSS类，用于可视化进度
    getStageClass: function(stageName) {
      if (!this.currentStage) return 'pending'
      
      const lowerStage = this.currentStage.toLowerCase()
      const lowerStageName = stageName.toLowerCase()
      
      // 定义阶段顺序和关键词 - 🔧 扩展关键词以匹配更多情况
      const stageOrder = [
        { name: '初始化', keywords: ['初始化', 'initialize', '开始', '正在初始化', '创建课程'] },
        { name: '权威内容', keywords: ['权威内容', 'authoritative', '提取', '权威'] },
        { name: '层次化结构', keywords: ['层次化', 'hierarchical', '结构', 'structure', '章', '节', '知识点', '生成章', '生成节', '生成知识'] },
        { name: '关系分析', keywords: ['关系', 'relation', '分析', 'analysis'] },
        { name: '完整性验证', keywords: ['完整性', 'completeness', '验证', 'validation'] },
        { name: '保存', keywords: ['保存', 'save', 'saving', 'neo4j', '数据库'] }
      ]
      
      // 找到当前阶段的索引
      let currentIndex = -1
      for (let i = 0; i < stageOrder.length; i++) {
        const stage = stageOrder[i]
        if (stage.keywords.some(keyword => lowerStage.includes(keyword))) {
          currentIndex = i
          break
        }
      }
      
      // 找到目标阶段的索引
      let targetIndex = -1
      for (let i = 0; i < stageOrder.length; i++) {
        const stage = stageOrder[i]
        if (stage.name.toLowerCase() === lowerStageName || 
            stage.keywords.some(keyword => lowerStageName.includes(keyword))) {
          targetIndex = i
          break
        }
      }
      
      // 🔧 修复：如果无法确定当前阶段，默认返回pending而不是空
      if (targetIndex === -1) {
        return 'pending'
      }
      
      if (currentIndex === -1) {
        // 无法确定当前阶段，所有阶段都显示为pending
        return 'pending'
      }
      
      // 如果当前阶段包含"完成"，说明该阶段已完成
      if (lowerStage.includes('完成') && targetIndex <= currentIndex) {
        return 'completed'
      }
      
      if (targetIndex < currentIndex) {
        return 'completed'
      } else if (targetIndex === currentIndex) {
        return 'active'
      } else {
        return 'pending'
      }
    },

    // 获取完整知识图谱生成阶段的CSS类
    getFullGraphStageClass: function(stageName) {
      if (!this.currentStage) return ''
      
      const lowerStage = this.currentStage.toLowerCase()
      const lowerStageName = stageName.toLowerCase()
      
      // 定义完整图谱生成的阶段顺序
      const stageOrder = ['初始化', '课程数据', '知识点数据', '数据处理', '关系生成', '保存']
      const stageKeywords = {
        '初始化': ['初始化', 'initialize', 'reset'],
        '课程数据': ['课程数据', 'course', 'collecting_course'],
        '知识点数据': ['知识点数据', 'knowledge', 'collecting_knowledge'],
        '数据处理': ['数据处理', 'processing', 'cleanup', 'merge'],
        '关系生成': ['关系生成', 'relation', 'generating_relations'],
        '保存': ['保存', 'saving', 'database', 'neo4j']
      }
      
      // 找到当前阶段的索引
      let currentIndex = -1
      for (let i = 0; i < stageOrder.length; i++) {
        const keywords = stageKeywords[stageOrder[i]]
        if (keywords.some(keyword => lowerStage.includes(keyword))) {
          currentIndex = i
          break
        }
      }
      
      const targetIndex = stageOrder.findIndex(s => s.toLowerCase() === lowerStageName)
      
      if (currentIndex === -1) {
        return ''
      }
      
      if (targetIndex < currentIndex) {
        return 'completed'
      } else if (targetIndex === currentIndex) {
        return 'active'
      } else {
        return 'pending'
      }
    },

    // 取消生成任务
    cancelGeneration: function() {
      if (!confirm('确定要取消当前的生成任务吗？\n\n已生成的数据将被保留，但任务将立即停止。')) {
        return
      }

      var self = this
      this.isCancelling = true

      try {
        var apiUrl = this.baseUrl + '/cancel_generation/'
        console.log('[CANCEL] 取消生成任务:', apiUrl)

        fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          credentials: 'include'
        })
        .then(function(response) {
          console.log('[CANCEL] 取消响应:', response.status)
          if (!response.ok) {
            throw new Error('HTTP ' + response.status + ': ' + response.statusText)
          }
          return response.json()
        })
        .then(function(data) {
          console.log('[CANCEL] 取消结果:', data)
          if (data.success) {
            self.successMessage = data.message || '生成任务已取消'
            self.currentStatus = 'cancelled'
            
            // 记录取消的历史
            if (self.currentCourseName) {
              self.addGenerationHistory(
                self.currentCourseName,
                0,
                'cancelled',
                '用户手动取消'
              )
            }
            
            // 🔧 修复：清理可能的completed状态标记
            if (self.currentCourseName) {
              // 清理sessionStorage中的completed标记
              var keys = Object.keys(sessionStorage)
              keys.forEach(function(key) {
                if (key.includes('completed_' + self.currentCourseName)) {
                  sessionStorage.removeItem(key)
                  console.log('[CANCEL] 已清理completed标记:', key)
                }
              })
              // 清理lastGeneratedCourse信息
              sessionStorage.removeItem('lastGeneratedCourse')
              console.log('[CANCEL] 已清理lastGeneratedCourse信息')
            }
            
            // 清理pendingGeneration状态
            self.pendingGeneration.isActive = false
            self.pendingGeneration.courseName = ''
            
            // 停止自动刷新
            self.stopAutoRefresh()
            
            // 刷新进度信息以显示最终状态
            setTimeout(function() {
              self.fetchProgressInfo()
              // 3秒后清除成功消息并重置状态为idle
              setTimeout(function() {
                self.successMessage = ''
                self.currentStatus = 'idle'
                self.currentCourseName = ''
                self.currentStage = ''
              }, 3000)
            }, 1000)
          } else {
            self.errorMessage = data.error || '取消任务失败'
          }
        })
        .catch(function(error) {
          console.error('[CANCEL] 取消任务失败:', error)
          self.errorMessage = '取消任务失败: ' + error.message
        })
        .finally(function() {
          self.isCancelling = false
        })
      } catch (error) {
        console.error('[CANCEL] 取消任务出错:', error)
        this.errorMessage = '取消任务出错: ' + error.message
        this.isCancelling = false
      }
    },

    // 添加生成历史记录（增强版）
    addGenerationHistory: function(courseName, knowledgePointsCount, status, errorMessage) {
      status = status || 'completed'
      errorMessage = errorMessage || ''
      
      const duration = this.generationStartTime 
        ? this.formatDuration(Date.now() - this.generationStartTime)
        : null

      const record = {
        id: Date.now(),
        courseName: courseName,
        knowledgePointsCount: knowledgePointsCount,
        status: status,
        errorMessage: errorMessage,
        duration: duration,
        timestamp: new Date().toLocaleString('zh-CN')
      }

      // 将新记录添加到开头
      this.generationHistory.unshift(record)

      // 限制历史记录数量，最多保存20条
      if (this.generationHistory.length > 20) {
        this.generationHistory = this.generationHistory.slice(0, 20)
      }

      // 保存到本地存储
      this.saveGenerationHistory()
    },

    // 格式化持续时间
    formatDuration: function(milliseconds) {
      const seconds = Math.floor(milliseconds / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)
      
      if (hours > 0) {
        return hours + '小时' + (minutes % 60) + '分钟'
      } else if (minutes > 0) {
        return minutes + '分钟' + (seconds % 60) + '秒'
      } else {
        return seconds + '秒'
      }
    },

    // 获取状态文本
    getStatusText: function(status) {
      const statusMap = {
        'completed': '已完成',
        'cancelled': '已取消',
        'error': '失败'
      }
      return statusMap[status] || status
    },

    // 查看历史记录结果
    viewHistoryResult: function(record) {
      const timestamp = Date.now()
      const graphUrl = '/index1.html?course=' + encodeURIComponent(record.courseName) + 
                       '&refresh=' + timestamp + 
                       '&fromAdmin=true'
      console.log('[HISTORY] 查看历史记录:', graphUrl)
      window.open(graphUrl, '_blank')
    },

    // 重新生成课程
    regenerateCourse: function(courseName) {
      if (!confirm(`确定要重新生成《${courseName}》的知识图谱吗？\n\n这将覆盖该课程的现有数据。`)) {
        return
      }
      
      this.courseName = courseName
      this.generateSingleCourse()
    },

    // 删除历史记录
    deleteHistoryRecord: function(recordId) {
      if (!confirm('确定要删除这条历史记录吗？')) {
        return
      }
      
      this.generationHistory = this.generationHistory.filter(r => r.id !== recordId)
      this.saveGenerationHistory()
      this.successMessage = '历史记录已删除'
      setTimeout(() => {
        this.successMessage = ''
      }, 2000)
    },

    // 清空历史记录
    clearHistory: function() {
      if (!confirm('确定要清空所有历史记录吗？\n\n此操作不可撤销！')) {
        return
      }
      
      this.generationHistory = []
      this.saveGenerationHistory()
      this.successMessage = '历史记录已清空'
      setTimeout(() => {
        this.successMessage = ''
      }, 2000)
    },

    // ===== 快照管理方法 =====
    
    // 刷新快照列表
    refreshSnapshots: function() {
      var self = this
      var apiUrl = this.baseUrl + '/list_snapshots/'
      
      fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(function(response) {
        return response.json()
      })
      .then(function(data) {
        if (data.success) {
          self.snapshots = data.snapshots
          console.log('[SNAPSHOT] 已加载', data.total, '个快照')
        } else {
          console.error('[SNAPSHOT] 加载快照列表失败:', data.error)
        }
      })
      .catch(function(error) {
        console.error('[SNAPSHOT] 加载快照列表错误:', error)
      })
    },
    
    // 加载可用的课程列表
    loadAvailableCourses: function() {
      var self = this
      var apiUrl = this.baseUrl + '/courses/'
      
      console.log('[COURSES] 开始加载课程列表，API URL:', apiUrl)
      
      fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      .then(function(response) {
        console.log('[COURSES] API响应状态:', response.status)
        return response.json()
      })
      .then(function(data) {
        console.log('[COURSES] API响应数据:', data)
        
        if (data.success && data.courses) {
          self.availableCourses = data.courses.map(function(course) {
            return course.name
          })
          console.log('[COURSES] 已加载', self.availableCourses.length, '个课程:', self.availableCourses)
        } else {
          console.warn('[COURSES] 加载课程列表失败:', data.error || '未知错误')
          console.warn('[COURSES] 完整响应数据:', data)
          self.availableCourses = []
        }
      })
      .catch(function(error) {
        console.error('[COURSES] 加载课程列表错误:', error)
        self.availableCourses = []
      })
    },
    
    // 创建快照
    createSnapshot: function(type, courseName) {
      var self = this
      
      var snapshotName = ''
      var description = ''
      
      if (type === 'full') {
        snapshotName = prompt('请输入快照名称（可选）：', '完整图谱快照 - ' + new Date().toLocaleString('zh-CN'))
        if (snapshotName === null) return // 用户取消
        
        description = prompt('请输入快照描述（可选）：', '完整计算机专业知识图谱备份')
      } else if (type === 'single_course') {
        snapshotName = '《' + courseName + '》快照 - ' + new Date().toLocaleString('zh-CN')
        description = '单课程知识图谱备份'
      }
      
      if (!confirm('确定要创建快照吗？\n\n快照名称: ' + snapshotName + '\n\n创建快照可能需要几秒到几分钟，具体取决于数据量大小。')) {
        return
      }
      
      this.isCreatingSnapshot = true
      this.clearMessages()
      
      var apiUrl = this.baseUrl + '/create_snapshot/'
      
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCsrfToken()
        },
        body: JSON.stringify({
          snapshot_type: type,
          name: snapshotName,
          description: description,
          course_name: courseName || null
        })
      })
      .then(function(response) {
        return response.json()
      })
      .then(function(data) {
        if (data.success) {
          self.successMessage = '快照创建成功！'
          console.log('[SNAPSHOT] 快照创建成功:', data.snapshot)
          
          // 刷新快照列表
          self.refreshSnapshots()
          
          setTimeout(function() {
            self.successMessage = ''
          }, 3000)
        } else {
          self.errorMessage = '创建快照失败: ' + data.error
        }
      })
      .catch(function(error) {
        console.error('[SNAPSHOT] 创建快照错误:', error)
        self.errorMessage = '创建快照失败: ' + error.message
      })
      .finally(function() {
        self.isCreatingSnapshot = false
      })
    },
    
    // 恢复快照
    restoreSnapshot: function(snapshot) {
      var confirmMsg = '确定要恢复快照《' + snapshot.name + '》吗？\n\n'
      
      if (snapshot.type === 'single_course') {
        confirmMsg += '⚠️ 这将删除课程《' + snapshot.course_name + '》的当前数据，并恢复到快照创建时的状态。\n\n'
      } else {
        confirmMsg += '⚠️ 这将删除整个知识图谱的当前数据，并恢复到快照创建时的状态。\n\n'
      }
      
      confirmMsg += '快照信息:\n'
      confirmMsg += '- 实体数量: ' + snapshot.entity_count + '\n'
      confirmMsg += '- 关系数量: ' + snapshot.relation_count + '\n'
      confirmMsg += '- 创建时间: ' + snapshot.created_at + '\n\n'
      confirmMsg += '此操作不可撤销，请谨慎操作！'
      
      if (!confirm(confirmMsg)) {
        return
      }
      
      // 二次确认
      if (!confirm('最后确认：您真的要恢复此快照吗？\n\n当前数据将被覆盖！')) {
        return
      }
      
      var self = this
      this.isRestoringSnapshot = true
      this.clearMessages()
      
      var apiUrl = this.baseUrl + '/restore_snapshot/' + snapshot.id + '/'
      
      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCsrfToken()
        }
      })
      .then(function(response) {
        return response.json()
      })
      .then(function(data) {
        if (data.success) {
          self.successMessage = '快照恢复成功！已恢复 ' + data.statistics.nodes_restored + ' 个节点和 ' + data.statistics.relationships_restored + ' 个关系。'
          console.log('[SNAPSHOT] 快照恢复成功:', data)
          
          // 刷新快照列表（更新恢复次数）
          self.refreshSnapshots()
          
          // 刷新数据库状态
          self.checkDatabaseStatus()
          
          setTimeout(function() {
            self.successMessage = ''
          }, 5000)
        } else {
          self.errorMessage = '恢复快照失败: ' + data.error
        }
      })
      .catch(function(error) {
        console.error('[SNAPSHOT] 恢复快照错误:', error)
        self.errorMessage = '恢复快照失败: ' + error.message
      })
      .finally(function() {
        self.isRestoringSnapshot = false
      })
    },
    
    // 下载快照
    downloadSnapshot: function(snapshot) {
      var apiUrl = this.baseUrl + '/download_snapshot/' + snapshot.id + '/'
      
      // 创建隐藏的下载链接
      var link = document.createElement('a')
      link.href = apiUrl
      link.download = snapshot.snapshot_id + '.json'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('[SNAPSHOT] 开始下载快照:', snapshot.name)
    },
    
    // 删除快照
    deleteSnapshot: function(snapshot) {
      if (!confirm('确定要删除快照《' + snapshot.name + '》吗？\n\n此操作不可撤销！')) {
        return
      }
      
      var self = this
      var apiUrl = this.baseUrl + '/delete_snapshot/' + snapshot.id + '/'
      
      fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': this.getCsrfToken()
        }
      })
      .then(function(response) {
        return response.json()
      })
      .then(function(data) {
        if (data.success) {
          self.successMessage = '快照已删除'
          console.log('[SNAPSHOT] 快照已删除:', snapshot.name)
          
          // 刷新快照列表
          self.refreshSnapshots()
          
          setTimeout(function() {
            self.successMessage = ''
          }, 2000)
        } else {
          self.errorMessage = '删除快照失败: ' + data.error
        }
      })
      .catch(function(error) {
        console.error('[SNAPSHOT] 删除快照错误:', error)
        self.errorMessage = '删除快照失败: ' + error.message
      })
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
.status-cancelled { background-color: #ffc107; color: #212529; }
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

/* � 阶段监进度可视化样式 */
.stage-progress-container {
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #dee2e6;
}

.stage-visualization {
  margin-bottom: 1rem;
}

.stage-title {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stage-steps {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.stage-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 0 0 auto;
}

.stage-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  background-color: #e9ecef;
  color: #6c757d;
  border: 3px solid #e9ecef;
  transition: all 0.3s ease;
}

.stage-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #6c757d;
  text-align: center;
  white-space: nowrap;
  transition: all 0.3s ease;
  font-weight: 500;
}

.stage-connector {
  flex: 1;
  height: 3px;
  background-color: #e9ecef;
  margin: 0 0.5rem;
  position: relative;
  top: -15px;
  transition: all 0.3s ease;
}

/* 已完成的阶段 */
.stage-step.completed .stage-icon {
  background-color: #28a745;
  color: white;
  border-color: #28a745;
}

.stage-step.completed .stage-label {
  color: #28a745;
  font-weight: 600;
}

.stage-step.completed + .stage-connector {
  background-color: #28a745;
}

/* 当前活动的阶段 */
.stage-step.active .stage-icon {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
  animation: pulse-stage 2s infinite;
}

.stage-step.active .stage-label {
  color: #007bff;
  font-weight: 700;
}

/* 待处理的阶段 */
.stage-step.pending .stage-icon {
  background-color: #f8f9fa;
  color: #adb5bd;
  border-color: #dee2e6;
}

.stage-step.pending .stage-label {
  color: #adb5bd;
}

/* 脉冲动画 */
@keyframes pulse-stage {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
}

/* 阶段详细信息 */
.stage-detail-info .alert {
  border-left: 4px solid #17a2b8;
}

/* 进度控制 */
.progress-controls {
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

/* 空闲状态 */
.idle-state-info .alert {
  border-left: 4px solid #6c757d;
}

/* 生成历史记录样式 */
.generation-history-section .card-header {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.history-list {
  max-height: 500px;
  overflow-y: auto;
}

.history-record {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background-color: white;
  transition: all 0.2s ease;
}

.history-record:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.history-record-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.history-record-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.history-index {
  display: inline-block;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  background-color: #e9ecef;
  border-radius: 50%;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
}

.history-record-actions {
  display: flex;
  gap: 0.5rem;
}

.history-record-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding-left: 38px;
}

.history-record-error {
  padding: 0.5rem;
  background-color: #fff3cd;
  border-radius: 0.25rem;
  border-left: 3px solid #ffc107;
  margin-left: 38px;
}

/* 🔖 快照管理样式 */
.snapshot-management-section .card-header {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.snapshot-list {
  max-height: 600px;
  overflow-y: auto;
}

.snapshot-item {
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background-color: white;
  transition: all 0.2s ease;
}

.snapshot-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.snapshot-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.snapshot-info {
  display: flex;
  align-items: flex-start;
  flex: 1;
}

.snapshot-icon {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background-color: #f8f9fa;
  border-radius: 0.5rem;
  margin-right: 1rem;
}

.snapshot-details {
  flex: 1;
}

.snapshot-details h6 {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.25rem;
}

.snapshot-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.5rem;
}

.snapshot-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.snapshot-actions .btn {
  white-space: nowrap;
}

/* 响应式设计 - 快照管理 */
@media (max-width: 768px) {
  .snapshot-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .snapshot-actions {
    width: 100%;
    margin-top: 1rem;
    justify-content: flex-start;
  }
  
  .snapshot-icon {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }
}

/* 响应式设计 - 阶段进度 */
@media (max-width: 768px) {
  .stage-steps {
    flex-direction: column;
    gap: 1rem;
  }
  
  .stage-connector {
    display: none;
  }
  
  .stage-icon {
    width: 45px;
    height: 45px;
    font-size: 1rem;
  }
  
  .stage-label {
    font-size: 0.7rem;
  }
  
  .history-record-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .history-record-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .history-record-details {
    padding-left: 0;
  }
  
  .history-record-error {
    margin-left: 0;
  }
}
</style>