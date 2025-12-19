<template>
  <div class="container-fluid">
    <div class="row">
      <!-- 左侧边栏：查询工具 -->
      <div class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
        <!-- 侧边栏折叠/展开按钮 -->
        <button 
          class="sidebar-toggle-btn" 
          @click="toggleSidebar"
          :title="sidebarCollapsed ? '展开功能栏' : '折叠功能栏'"
        >
          <i :class="sidebarCollapsed ? 'bi bi-chevron-right' : 'bi bi-chevron-left'"></i>
        </button>
        
        <div class="sidebar-content" v-show="!sidebarCollapsed">
        <h3 class="mb-4">计算机专业知识图谱</h3>
        
        <!-- 课程选择 -->
        <div class="query-box">
          <div class="mb-3">
            <label class="form-label">请选择课程</label>
            <!-- 美化的课程选择下拉框 -->
            <div class="custom-select-wrapper" :class="{ 'active': courseDropdownOpen }">
              <div class="custom-select-trigger" @click="toggleCourseDropdown">
                <span class="selected-text">{{ selectedCourse || '请选择课程' }}</span>
                <i class="bi" :class="courseDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </div>
              <div class="custom-select-dropdown" v-show="courseDropdownOpen">
                <div class="search-box">
                  <i class="bi bi-search search-icon"></i>
                  <input 
                    type="text" 
                    class="search-input" 
                    placeholder="搜索课程..."
                    v-model="courseSearchKeyword"
                    @input="filterCourseList"
                    @click.stop
                  >
                </div>
                <div class="options-list">
                  <div 
                    class="option-item" 
                    :class="{ 'selected': selectedCourse === '' }"
                    @click="selectCourse('')"
                  >
                    <i class="bi bi-circle option-icon"></i>
                    <span>-- 请选择课程 --</span>
                    <i class="bi bi-check-circle-fill check-icon" v-if="selectedCourse === ''"></i>
                  </div>
                  <div 
                    v-for="course in filteredCourseList" 
                    :key="course.name"
                    class="option-item"
                    :class="{ 'selected': selectedCourse === course.name }"
                    @click="selectCourse(course.name)"
                  >
                    <i class="bi bi-book option-icon"></i>
                    <span>{{ course.name }}</span>
                    <i class="bi bi-check-circle-fill check-icon" v-if="selectedCourse === course.name"></i>
                  </div>
                  <div v-if="filteredCourseList.length === 0" class="no-results">
                    <i class="bi bi-search"></i>
                    <span>未找到匹配的课程</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 章节选择 -->
          <div class="mb-3" v-if="selectedCourse">
            <label class="form-label">
              <i class="bi bi-bookmark-star"></i> 选择章节
              <span class="label-hint">（点击聚焦，再次点击查看详情）</span>
            </label>
            <!-- 美化的章节选择下拉框 -->
            <div class="custom-select-wrapper" :class="{ 'active': chapterDropdownOpen }">
              <div class="custom-select-trigger" @click="toggleChapterDropdown">
                <span class="selected-text">{{ selectedChapter || '全部章节' }}</span>
                <i class="bi" :class="chapterDropdownOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </div>
              <div class="custom-select-dropdown" v-show="chapterDropdownOpen">
                <div class="search-box">
                  <i class="bi bi-search search-icon"></i>
                  <input 
                    type="text" 
                    class="search-input" 
                    placeholder="搜索章节..."
                    v-model="chapterSearchKeyword"
                    @input="filterChapterList"
                    @click.stop
                  >
                </div>
                <div class="options-list">
                  <div 
                    class="option-item" 
                    :class="{ 'selected': selectedChapter === '' }"
                    @click="selectChapter('')"
                  >
                    <i class="bi bi-circle option-icon"></i>
                    <span>-- 全部章节 --</span>
                    <i class="bi bi-check-circle-fill check-icon" v-if="selectedChapter === ''"></i>
                  </div>
                  <div 
                    v-for="chapter in filteredChapterList" 
                    :key="chapter.name"
                    class="option-item chapter-option"
                    :class="{ 
                      'selected': selectedChapter === chapter.name,
                      'first-click-ready': lastClickedChapter === chapter.name
                    }"
                    @click="selectChapter(chapter.name)"
                    :title="getChapterClickHint(chapter.name)"
                  >
                    <i class="bi bi-bookmark option-icon"></i>
                    <span class="chapter-name">{{ chapter.name }}</span>
                    <span v-if="lastClickedChapter === chapter.name" class="click-hint">
                      <i class="bi bi-cursor-fill"></i> 再次点击查看详情
                    </span>
                    <i class="bi bi-check-circle-fill check-icon" v-if="selectedChapter === chapter.name"></i>
                  </div>
                  <div v-if="filteredChapterList.length === 0" class="no-results">
                    <i class="bi bi-search"></i>
                    <span>未找到匹配的章节</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 搜索框 -->
          <div class="input-group mb-3">
            <input 
              type="text" 
              class="form-control" 
              placeholder="搜索知识点..."
              v-model="searchKeyword"
            >
            <button class="btn btn-primary" @click="executeSearch">
              <i class="bi bi-search"></i> 搜索
            </button>
          </div>
        </div>
        
        <!-- 使用说明 -->
        <div class="card">
          <div class="card-header">
            使用说明
          </div>
          <div class="card-body">
            <p class="small mb-2">1. 选择课程查看完整知识图谱</p>
            <p class="small mb-2">2. 可进一步选择章节查看详细内容</p>
            <p class="small mb-0">3. 使用搜索框查找特定知识点</p>
          </div>
        </div>
        
        <!-- 统计信息 -->
        <div class="card statistics">
          <div class="card-header">
            知识图谱统计
          </div>
          <div class="card-body">
            <div id="statistics-content">
              <p>实体数量：<span id="entity-count">{{ statistics.entityCount }}</span></p>
              <p>关系数量：<span id="relation-count">{{ statistics.relationCount }}</span></p>
            </div>
          </div>
        </div>
        
        
        <!-- 添加管理面板按钮 -->
        <div class="card">
          <div class="card-header">
            管理选项
          </div>
          <div class="card-body">
            <router-link to="/DataAcquisition" class="btn btn-primary">进入管理面板</router-link>
            <!-- <a href="/admin" class="btn btn-primary">进入管理面板</a> -->
          </div>
        </div>

        <!-- 新建节点按钮 -->
        <div class="card">
          <div class="card-header">
            新建节点
          </div>
          <div class="card-body">
            <button class="btn btn-success mb-2 w-100" @click="showCreateCourseModal">
              <i class="bi bi-plus-circle"></i> 新建课程
            </button>
            <button class="btn btn-info w-100" @click="showCreateKnowledgePointModal">
              <i class="bi bi-plus-circle"></i> 新建知识点
            </button>
          </div>
        </div>

        <!-- 分类信息 -->
        <div class="card">
          <div class="card-header">
            实体类型
          </div>
          <div class="card-body">
            <div id="entity-types" class = "text">
              <span 
                v-for="(count, type) in statistics.entityTypes" 
                :key="type"
                class="badge rounded-pill"
                :style="{ backgroundColor: getEntityColor(type), margin: '2px', padding: '5px 10px' }"
              >
                {{ type }}: {{ count }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- 关系类型 -->
        <div class="card">
          <div class="card-header">
            关系类型
          </div>
          <div class="card-body">
            <div id="relation-types">
              <span 
                v-for="(count, type) in statistics.relationTypes" 
                :key="type"
                class="badge rounded-pill bg-secondary"
                style="margin: 2px; padding: 5px 10px;"
              >
                {{ translateRelationType(type) }}: {{ count }}
              </span>
            </div>
          </div>
        </div>
        </div>
      </div>
      
      <!-- 右侧主要内容：图谱可视化 -->
      <div class="main-content" :class="{ 'expanded': sidebarCollapsed }">
        <div id="graph-container" ref="graphContainer"></div>

        <!-- 可折叠的控制面板 -->
        <div class="controls-panel" :class="{ 'collapsed': controlsCollapsed }">
          <!-- 折叠/展开按钮 -->
          <button 
            class="controls-toggle-btn" 
            @click="toggleControls"
            :title="controlsCollapsed ? '展开控制面板' : '折叠控制面板'"
          >
            <i :class="controlsCollapsed ? 'bi bi-chevron-down' : 'bi bi-chevron-up'"></i>
          </button>
          
          <!-- 控制面板内容 -->
          <div class="controls-content" v-show="!controlsCollapsed">
            <div class="controls-row">
              <button 
                id="pause-btn" 
                class="btn btn-sm btn-outline-primary"
                @click="toggleSimulation"
              >
                {{ isPaused ? '恢复' : '暂停' }}
              </button>
              <button 
                id="stabilize-btn" 
                class="btn btn-sm btn-outline-secondary"
                @click="stabilizeLayout"
              >
                稳定
              </button>
              <button 
                id="reset-btn" 
                class="btn btn-sm btn-outline-danger"
                @click="resetLayout"
              >
                重置
              </button>
            </div>
            
            <div class="node-limit-control">
              <label for="node-limit-slider" class="form-label-sm">
                节点限制: <span class="node-limit-value">{{ nodeLimit }}</span>
              </label>
              <input 
                type="range" 
                class="form-range form-range-sm" 
                id="node-limit-slider" 
                min="10" 
                max="2000" 
                v-model="nodeLimit"
              >
            </div>
            
            <div class="display-controls">
              <div class="form-check form-switch form-check-sm">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="show-labels-switch" 
                  v-model="showLabels"
                >
                <label class="form-check-label form-check-label-sm" for="show-labels-switch">节点标签</label>
              </div>
              <div class="form-check form-switch form-check-sm">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  id="show-relation-labels-switch" 
                  v-model="showRelationLabels"
                >
                <label class="form-check-label form-check-label-sm" for="show-relation-labels-switch">关系标签</label>
              </div>
            </div>
          </div>
        </div>

        <div id="loading" class="loading" v-if="isLoading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">加载中...</span>
          </div>
          <p class="mt-2">加载中...</p>
        </div>
        
        <!-- 操作成功提示 -->
        <div v-if="showSuccessMessage" class="success-message">
          <div class="alert alert-success alert-dismissible fade show" role="alert">
            <i class="bi bi-check-circle"></i>
            {{ successMessage }}
            <button type="button" class="btn-close" @click="hideSuccessMessage" aria-label="Close"></button>
          </div>
        </div>
        
        <!-- 操作失败提示 -->
        <div v-if="showErrorMessage" class="error-message">
          <div class="alert alert-danger alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle"></i>
            {{ errorMessage }}
            <button type="button" class="btn-close" @click="hideErrorMessage" aria-label="Close"></button>
          </div>
        </div>
        
        <!-- 操作警告提示 -->
        <div v-if="showWarningMessage" class="warning-message">
          <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <i class="bi bi-exclamation-triangle-fill"></i>
            {{ warningMessage }}
            <button type="button" class="btn-close" @click="hideWarningMessage" aria-label="Close"></button>
          </div>
        </div>
        <div id="properties-panel" class="properties-panel" v-if="selectedNode">
          <h5 id="properties-title">{{ selectedNode.name }} [{{ selectedNode.label }}]</h5>
          <button
            type="button"
            class="btn-close position-absolute top-0 end-0 m-2"
            aria-label="Close"
            @click="closePropertiesPanel"
          ></button>

          <!-- 标签页导航 -->
          <ul class="nav nav-tabs mt-3" id="propertiesTabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button class="nav-link active" id="properties-tab" data-bs-toggle="tab" data-bs-target="#properties" type="button" role="tab" aria-controls="properties" aria-selected="true">属性信息</button>
            </li>
            <li class="nav-item" role="presentation">
              <button class="nav-link" id="materials-tab" data-bs-toggle="tab" data-bs-target="#materials" type="button" role="tab" aria-controls="materials" aria-selected="false">学习资料</button>
            </li>
          </ul>

          <!-- 标签页内容 -->
          <div class="tab-content mt-3" id="propertiesTabsContent">
            <!-- 属性信息标签页 -->
            <div class="tab-pane fade show active" id="properties" role="tabpanel" aria-labelledby="properties-tab">
              <div id="properties-content">
                <table v-if="selectedNode.properties && filteredProperties.length > 0" class="table table-sm table-hover">
                  <tbody>
                    <tr v-for="(item, index) in filteredProperties" :key="item.key">
                      <td class="fw-bold">{{ item.chineseKey }}</td>
                      <td>
                        <ul v-if="Array.isArray(item.value) && item.value.length" class="mb-0 ps-3">
                          <li v-for="(subItem, subIndex) in item.value" :key="subIndex">{{ subItem }}</li>
                        </ul>
                        <span v-else>{{ item.value || '无' }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <p v-else-if="selectedNode.properties">没有可用的属性信息</p>
                <p v-else>没有可用的属性信息</p>
              </div>
            </div>

            <!-- 学习资料标签页 -->
            <div class="tab-pane fade" id="materials" role="tabpanel" aria-labelledby="materials-tab">
              <div class="materials-content">
                <!-- 上传区域 -->
                <div class="upload-section mb-3">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="mb-0">上传学习资料</h6>
                    <button class="btn btn-sm btn-outline-primary" @click="refreshMaterials">
                      <i class="bi bi-arrow-clockwise"></i> 刷新
                    </button>
                  </div>

                  <form @submit.prevent="uploadMaterial" enctype="multipart/form-data">
                    <div class="mb-2">
                      <input type="file" class="form-control form-control-sm" @change="handleFileSelect" required>
                    </div>
                    <div class="mb-2">
                      <input type="text" class="form-control form-control-sm" v-model="newMaterial.title" placeholder="资料标题" required>
                    </div>
                    <div class="mb-2">
                      <textarea class="form-control form-control-sm" v-model="newMaterial.description" rows="2" placeholder="资料描述"></textarea>
                    </div>
                    <div class="mb-2">
                      <select class="form-select form-select-sm" v-model="newMaterial.material_type">
                        <option value="document">文档资料</option>
                        <option value="video">教学视频</option>
                        <option value="presentation">PPT演示</option>
                        <option value="code">代码示例</option>
                        <option value="exercise">练习题</option>
                        <option value="reference">参考资料</option>
                        <option value="other">其他</option>
                      </select>
                    </div>
                    <button type="submit" class="btn btn-sm btn-success w-100" :disabled="!selectedFile">
                      <i class="bi bi-cloud-upload"></i> 上传资料
                    </button>
                  </form>
                </div>

                <!-- 资料列表 -->
                <div class="materials-list">
                  <h6>已上传资料 ({{ learningMaterials.length }})</h6>
                  <div v-if="materialsLoading" class="text-center">
                    <div class="spinner-border spinner-border-sm" role="status">
                      <span class="visually-hidden">加载中...</span>
                    </div>
                  </div>
                  <div v-else-if="learningMaterials.length === 0" class="text-muted">
                    暂无学习资料
                  </div>
                  <div v-else class="materials-grid">
                    <div v-for="material in learningMaterials" :key="material.id" class="material-item card mb-2">
                      <div class="card-body p-2">
                        <div class="d-flex justify-content-between align-items-start">
                          <div class="flex-grow-1">
                            <h6 class="card-title mb-1">{{ material.title }}</h6>
                            <p class="card-text small text-muted mb-1" v-if="material.description">{{ material.description }}</p>
                            <div class="material-meta small">
                              <span class="badge bg-secondary me-1">{{ material.material_type_display }}</span>
                              <span class="text-muted">{{ material.file_size_display }}</span>
                              <span class="text-muted ms-2">上传者: {{ material.uploaded_by }}</span>
                              <span class="text-muted ms-2">{{ material.created_at }}</span>
                              <!-- 文件预览提示 -->
                              <div v-if="material.file_mime_type === 'application/pdf'" class="preview-hint small text-info mt-1">
                                <i class="bi bi-info-circle"></i> PDF文件将在新标签页中预览
                              </div>
                              <div v-else-if="isFilePreviewable(material.file_mime_type)" class="preview-hint small text-success mt-1">
                                <i class="bi bi-check-circle"></i> 此文件支持直接预览
                              </div>
                            </div>
                            <div class="material-stats small text-muted mt-2">
                              <div class="stats-row">
                                <div class="stat-item">
                                  <i class="bi bi-eye-fill text-info"></i>
                                  <span class="stat-text">{{ material.view_count }} 次查看</span>
                                </div>
                                <div class="stat-item">
                                  <i class="bi bi-download-fill text-success"></i>
                                  <span class="stat-text">{{ material.download_count }} 次下载</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <!-- 操作按钮区域 -->
                          <div class="material-actions mt-2">
                            <button class="btn btn-view btn-sm" @click="viewMaterial(material)">
                              <i class="bi bi-eye"></i>
                              <span class="btn-text">查看</span>
                            </button>
                            <button class="btn btn-download btn-sm" @click="downloadMaterial(material)">
                              <i class="bi bi-download"></i>
                              <span class="btn-text">下载</span>
                            </button>
                            <button class="btn btn-delete btn-sm" @click="deleteMaterial(material)">
                              <i class="bi bi-trash"></i>
                              <span class="btn-text">删除</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 增删改模态框 -->
      <!-- 创建节点模态框 -->
      <div class="modal fade" id="createNodeModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                创建{{ newNode.label === 'Course' ? '课程' : newNode.label === 'KnowledgePoint' ? '知识点' : '实体' }}节点
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="hideModal('createNodeModal')"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="createNode">
                <!-- 课程节点创建界面 -->
                <div v-if="newNode.label === 'Course'">
                  <div class="form-row-inline mb-3">
                    <div class="form-col-half">
                      <label class="form-label">课程名称 *</label>
                      <input type="text" class="form-control" v-model="newNode.name" required>
                    </div>
                    <div class="form-col-half">
                      <label class="form-label">课程类别</label>
                      <select class="form-select" v-model="newNode.category">
                        <option value="">选择类别</option>
                        <option value="专业基础课">专业基础课</option>
                        <option value="专业核心课">专业核心课</option>
                        <option value="专业选修课">专业选修课</option>
                        <option value="实践课程">实践课程</option>
                        <option value="通识课程">通识课程</option>
                      </select>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">课程描述</label>
                    <textarea class="form-control" v-model="newNode.description" rows="3" placeholder="请输入课程描述"></textarea>
                  </div>
                  <div class="form-row-inline">
                    <div class="form-col-half">
                      <label class="form-label">开课学期</label>
                      <select class="form-select" v-model="newNode.semester">
                        <option value="">选择学期</option>
                        <option value="大一上">大一上</option>
                        <option value="大一下">大一下</option>
                        <option value="大二上">大二上</option>
                        <option value="大二下">大二下</option>
                        <option value="大三上">大三上</option>
                        <option value="大三下">大三下</option>
                        <option value="大四上">大四上</option>
                        <option value="大四下">大四下</option>
                      </select>
                    </div>
                    <div class="form-col-half">
                      <label class="form-label">学分</label>
                      <input type="number" class="form-control" v-model="updateNodeData.credits" min="0" max="10" step="0.5">
                    </div>
                  </div>
                </div>

                <!-- 知识点节点创建界面 -->
                <div v-else-if="newNode.label === 'KnowledgePoint'">
                  <div class="form-row-inline mb-3">
                    <div class="form-col-half">
                      <label class="form-label">知识点名称 *</label>
                      <input type="text" class="form-control" v-model="newNode.name" required>
                    </div>
                    <div class="form-col-half">
                      <label class="form-label">所属课程 *</label>
                      <select class="form-select" v-model="newNode.courseName" required>
                        <option value="">选择课程</option>
                        <option v-for="course in courseList" :key="course.name" :value="course.name">
                          {{ course.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">知识点描述</label>
                    <textarea class="form-control" v-model="newNode.description" rows="3" placeholder="请输入知识点描述"></textarea>
                  </div>
                  <div class="form-row-inline">
                    <div class="form-col-half">
                      <label class="form-label">难度等级</label>
                      <select class="form-select" v-model="newNode.difficulty">
                        <option value="">选择难度</option>
                        <option value="简单">简单</option>
                        <option value="中等">中等</option>
                        <option value="困难">困难</option>
                        <option value="非常困难">非常困难</option>
                      </select>
                    </div>
                    <div class="form-col-half">
                      <label class="form-label">重要性</label>
                      <select class="form-select" v-model="newNode.importance">
                        <option value="">选择重要性</option>
                        <option value="基础">基础</option>
                        <option value="重要">重要</option>
                        <option value="核心">核心</option>
                        <option value="关键">关键</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- 普通实体节点创建界面 -->
                <div v-else>
                  <div class="mb-3">
                    <label class="form-label">节点名称 *</label>
                    <input type="text" class="form-control" v-model="newNode.name" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">节点类型</label>
                    <select class="form-select" v-model="newNode.label">
                      <option value="KnowledgePoint">知识点</option>
                      <option value="Course">课程</option>
                      <option value="Entity">实体</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">描述</label>
                    <textarea class="form-control" v-model="newNode.description" rows="2"></textarea>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">其他属性 (JSON格式)</label>
                    <textarea class="form-control" v-model="newNode.propertiesJson" rows="3" placeholder='{"key": "value"}'></textarea>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="hideModal('createNodeModal')">取消</button>
              <button type="button" class="btn btn-primary" @click="createNode">创建</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 更新节点模态框 -->
      <div class="modal fade" id="updateNodeModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">
                更新{{ 
                  updateNodeData.label === 'Course' ? '课程' : 
                  updateNodeData.label === 'Chapter' ? '章' : 
                  updateNodeData.label === 'Section' ? '节' : 
                  '知识点' 
                }}节点
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="hideModal('updateNodeModal')"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updateNode">
                <!-- 课程节点编辑界面 -->
                <div v-if="updateNodeData.label === 'Course'">
                  <div class="form-row-inline mb-3">
                    <div class="form-col-half">
                      <label class="form-label">课程名称 *</label>
                      <input type="text" class="form-control" v-model="updateNodeData.name" required>
                    </div>
                    <div class="form-col-half">
                      <label class="form-label">课程类别</label>
                      <select class="form-select" v-model="updateNodeData.category">
                        <option value="">选择类别</option>
                        <option value="专业基础课">专业基础课</option>
                        <option value="专业核心课">专业核心课</option>
                        <option value="专业选修课">专业选修课</option>
                        <option value="实践课程">实践课程</option>
                        <option value="通识课程">通识课程</option>
                      </select>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">课程描述</label>
                    <textarea class="form-control" v-model="updateNodeData.description" rows="3" placeholder="请输入课程描述"></textarea>
                  </div>
                  <div class="form-row-inline">
                    <div class="form-col-half">
                      <label class="form-label">开课学期</label>
                      <select class="form-select" v-model="updateNodeData.semester">
                        <option value="">选择学期</option>
                        <option value="大一上">大一上</option>
                        <option value="大一下">大一下</option>
                        <option value="大二上">大二上</option>
                        <option value="大二下">大二下</option>
                        <option value="大三上">大三上</option>
                        <option value="大三下">大三下</option>
                        <option value="大四上">大四上</option>
                        <option value="大四下">大四下</option>
                      </select>
                    </div>
                    <div class="form-col-half">
                      <label class="form-label">学分</label>
                      <input type="number" class="form-control" v-model="updateNodeData.credits" min="0" max="10" step="0.5">
                    </div>
                  </div>
                </div>

                <!-- 章节点编辑界面 -->
                <div v-else-if="updateNodeData.label === 'Chapter'">
                  <div class="mb-3">
                    <label class="form-label">章名称 *</label>
                    <input type="text" class="form-control" v-model="updateNodeData.name" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">章描述</label>
                    <textarea class="form-control" v-model="updateNodeData.description" rows="3" placeholder="请输入章描述"></textarea>
                  </div>
                </div>

                <!-- 节节点编辑界面 -->
                <div v-else-if="updateNodeData.label === 'Section'">
                  <div class="mb-3">
                    <label class="form-label">节名称 *</label>
                    <input type="text" class="form-control" v-model="updateNodeData.name" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">节描述</label>
                    <textarea class="form-control" v-model="updateNodeData.description" rows="3" placeholder="请输入节描述"></textarea>
                  </div>
                </div>

                <!-- 知识点节点编辑界面 -->
                <div v-else-if="updateNodeData.label === 'KnowledgePoint'">
                  <div class="mb-3">
                    <label class="form-label">知识点名称 *</label>
                    <input type="text" class="form-control" v-model="updateNodeData.name" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">知识点描述</label>
                    <textarea class="form-control" v-model="updateNodeData.description" rows="3" placeholder="请输入知识点描述"></textarea>
                  </div>
                  <div class="form-row-inline">
                    <div class="form-col-half">
                      <label class="form-label">难度等级</label>
                      <select class="form-select" v-model="updateNodeData.difficulty">
                        <option value="">选择难度</option>
                        <option value="简单">简单</option>
                        <option value="中等">中等</option>
                        <option value="困难">困难</option>
                        <option value="非常困难">非常困难</option>
                      </select>
                    </div>
                    <div class="form-col-half">
                      <label class="form-label">重要性</label>
                      <select class="form-select" v-model="updateNodeData.importance">
                        <option value="">选择重要性</option>
                        <option value="基础">基础</option>
                        <option value="重要">重要</option>
                        <option value="核心">核心</option>
                        <option value="关键">关键</option>
                      </select>
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="hideModal('updateNodeModal')">取消</button>
              <button type="button" class="btn btn-primary" @click="updateNode">更新</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 删除节点模态框 -->
      <div class="modal fade" id="deleteNodeModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">删除节点</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="hideModal('deleteNodeModal')"></button>
            </div>
            <div class="modal-body">
              <p>确定要删除节点 "<strong>{{ selectedNode ? selectedNode.name : '' }}</strong>" 吗？</p>
              <p class="text-danger">注意：删除节点将同时删除所有与之相关的关系！</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="hideModal('deleteNodeModal')">取消</button>
              <button type="button" class="btn btn-danger" @click="deleteNode">删除</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 创建关系模态框 -->
      <div class="modal fade" id="createRelationshipModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">创建新关系</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="hideModal('createRelationshipModal')"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="createRelationship">
                <div class="mb-3">
                  <label class="form-label">源节点</label>
                  <input type="text" class="form-control" v-model="newRelationship.source" readonly>
                </div>
                <div class="mb-3">
                  <label class="form-label">目标节点 *</label>
                  <input type="text" class="form-control" v-model="newRelationship.target" placeholder="输入目标节点名称" required>
                </div>
                <div class="mb-3">
                  <label class="form-label">关系类型</label>
                  <select class="form-select" v-model="newRelationship.relation_type">
                    <option value="CONTAINS">包含</option>
                    <option value="BELONGS_TO">属于</option>
                    <option value="RELATED_TO">相关于</option>
                    <option value="PREREQUISITE">先修于</option>
                    <option value="SIMILAR_TO">相似于</option>
                    <option value="PARALLEL">并行</option>
                    <option value="APPLICATION">应用</option>
                    <option value="EXTENSION">扩展</option>
                    <option value="DEPENDENCY">依赖</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="hideModal('createRelationshipModal')">取消</button>
              <button type="button" class="btn btn-primary" @click="createRelationship">创建</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 更新关系模态框 -->
      <div class="modal fade" id="updateRelationshipModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">更新关系</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="hideModal('updateRelationshipModal')"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updateRelationship">
                <div class="mb-3">
                  <label class="form-label">源节点</label>
                  <input type="text" class="form-control" v-model="updateRelationshipForm.source" readonly>
                </div>
                <div class="mb-3">
                  <label class="form-label">目标节点</label>
                  <input type="text" class="form-control" v-model="updateRelationshipForm.target" readonly>
                </div>
                <div class="mb-3">
                  <label class="form-label">原关系类型</label>
                  <input type="text" class="form-control" v-model="updateRelationshipForm.old_relation_type" readonly>
                </div>
                <div class="mb-3">
                  <label class="form-label">新关系类型</label>
                  <select class="form-select" v-model="updateRelationshipForm.new_relation_type">
                    <option value="CONTAINS">包含</option>
                    <option value="BELONGS_TO">属于</option>
                    <option value="RELATED_TO">相关于</option>
                    <option value="PREREQUISITE">先修于</option>
                    <option value="SIMILAR_TO">相似于</option>
                    <option value="PARALLEL">并行</option>
                    <option value="APPLICATION">应用</option>
                    <option value="EXTENSION">扩展</option>
                    <option value="DEPENDENCY">依赖</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="hideModal('updateRelationshipModal')">取消</button>
              <button type="button" class="btn btn-primary" @click="handleUpdateRelationship">更新</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 删除关系模态框 -->
      <div class="modal fade" id="deleteRelationshipModal" tabindex="-1">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">删除关系</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="hideModal('deleteRelationshipModal')"></button>
            </div>
            <div class="modal-body">
              <p>确定要删除关系吗？</p>
              <p>源节点: <strong>{{ deleteRelationshipForm.source }}</strong></p>
              <p>目标节点: <strong>{{ deleteRelationshipForm.target }}</strong></p>
              <p>关系类型: <strong>{{ deleteRelationshipForm.old_relation_type }}</strong></p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="hideModal('deleteRelationshipModal')">取消</button>
              <button type="button" class="btn btn-danger" @click="handleDeleteRelationship">删除</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷创建章模态框 -->
      <div class="modal fade" id="quickCreateChapterModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">快速创建章</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="hideModal('quickCreateChapterModal')"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="quickCreateChapter">
                <div class="form-row-inline mb-3">
                  <div class="form-col-half">
                    <label class="form-label">所属课程</label>
                    <input type="text" class="form-control" v-model="quickCreateChapterData.courseName" readonly>
                  </div>
                  <div class="form-col-half">
                    <label class="form-label">章名称 *</label>
                    <input type="text" class="form-control" v-model="quickCreateChapterData.chapterName" required placeholder="输入章名称">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">章描述</label>
                  <textarea class="form-control" v-model="quickCreateChapterData.description" rows="3" placeholder="请输入章描述"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="hideModal('quickCreateChapterModal')">取消</button>
              <button type="button" class="btn btn-primary" @click="quickCreateChapter">创建章</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷创建节模态框 -->
      <div class="modal fade" id="quickCreateSectionModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">快速创建节</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="hideModal('quickCreateSectionModal')"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="quickCreateSection">
                <div class="form-row-inline mb-3">
                  <div class="form-col-half">
                    <label class="form-label">所属章</label>
                    <input type="text" class="form-control" v-model="quickCreateSectionData.chapterName" readonly>
                  </div>
                  <div class="form-col-half">
                    <label class="form-label">节名称 *</label>
                    <input type="text" class="form-control" v-model="quickCreateSectionData.sectionName" required placeholder="输入节名称">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">节描述</label>
                  <textarea class="form-control" v-model="quickCreateSectionData.description" rows="3" placeholder="请输入节描述"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="hideModal('quickCreateSectionModal')">取消</button>
              <button type="button" class="btn btn-primary" @click="quickCreateSection">创建节</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷创建知识点模态框 -->
      <div class="modal fade" id="quickCreateKnowledgePointModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">快速创建知识点</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="hideModal('quickCreateKnowledgePointModal')"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="quickCreateKnowledgePoint">
                <div class="form-row-inline mb-3">
                  <div class="form-col-half">
                    <label class="form-label">所属节</label>
                    <input type="text" class="form-control" v-model="quickCreateKnowledgePointData.sectionName" readonly>
                  </div>
                  <div class="form-col-half">
                    <label class="form-label">知识点名称 *</label>
                    <input type="text" class="form-control" v-model="quickCreateKnowledgePointData.knowledgePointName" required placeholder="输入知识点名称">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">知识点描述</label>
                  <textarea class="form-control" v-model="quickCreateKnowledgePointData.description" rows="3" placeholder="请输入知识点描述"></textarea>
                </div>
                <div class="form-row-inline">
                  <div class="form-col-half">
                    <label class="form-label">难度等级</label>
                    <select class="form-select" v-model="quickCreateKnowledgePointData.difficulty">
                      <option value="">选择难度</option>
                      <option value="简单">简单</option>
                      <option value="中等">中等</option>
                      <option value="困难">困难</option>
                      <option value="非常困难">非常困难</option>
                    </select>
                  </div>
                  <div class="form-col-half">
                    <label class="form-label">重要性</label>
                    <select class="form-select" v-model="quickCreateKnowledgePointData.importance">
                      <option value="">选择重要性</option>
                      <option value="基础">基础</option>
                      <option value="重要">重要</option>
                      <option value="核心">核心</option>
                      <option value="关键">关键</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="hideModal('quickCreateKnowledgePointModal')">取消</button>
              <button type="button" class="btn btn-primary" @click="quickCreateKnowledgePoint">创建知识点</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷创建相关知识点模态框 -->
      <div class="modal fade" id="quickCreateRelatedKnowledgePointModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">快速创建相关知识点</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="hideModal('quickCreateRelatedKnowledgePointModal')"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="quickCreateRelatedKnowledgePoint">
                <div class="form-row-inline mb-3">
                  <div class="form-col-half">
                    <label class="form-label">源知识点</label>
                    <input type="text" class="form-control" v-model="quickCreateRelatedKnowledgePointData.sourceKnowledgePoint" readonly>
                  </div>
                  <div class="form-col-half">
                    <label class="form-label">新知识点名称 *</label>
                    <input type="text" class="form-control" v-model="quickCreateRelatedKnowledgePointData.knowledgePointName" required placeholder="输入知识点名称">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">知识点描述</label>
                  <textarea class="form-control" v-model="quickCreateRelatedKnowledgePointData.description" rows="3" placeholder="请输入知识点描述"></textarea>
                </div>
                <div class="form-row-inline mb-3">
                  <div class="form-col-half">
                    <label class="form-label">难度等级</label>
                    <select class="form-select" v-model="quickCreateRelatedKnowledgePointData.difficulty">
                      <option value="">选择难度</option>
                      <option value="简单">简单</option>
                      <option value="中等">中等</option>
                      <option value="困难">困难</option>
                      <option value="非常困难">非常困难</option>
                    </select>
                  </div>
                  <div class="form-col-half">
                    <label class="form-label">重要性</label>
                    <select class="form-select" v-model="quickCreateRelatedKnowledgePointData.importance">
                      <option value="">选择重要性</option>
                      <option value="基础">基础</option>
                      <option value="重要">重要</option>
                      <option value="核心">核心</option>
                      <option value="关键">关键</option>
                    </select>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">关系类型</label>
                  <select class="form-select" v-model="quickCreateRelatedKnowledgePointData.relationType">
                    <option value="RELATED_TO">相关于</option>
                    <option value="PREREQUISITE">先修于</option>
                    <option value="SIMILAR_TO">相似于</option>
                    <option value="EXTENSION">扩展</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="hideModal('quickCreateRelatedKnowledgePointModal')">取消</button>
              <button type="button" class="btn btn-primary" @click="quickCreateRelatedKnowledgePoint">创建知识点</button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右键菜单 -->
      <div v-if="contextMenu.show" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" v-show="contextMenu.show">
        <!-- 课程节点：创建章 -->
        <div class="context-menu-item" v-if="contextMenu.type === 'node' && contextMenu.target.label === 'Course'" @click="handleContextMenuAction('createChapter')">
          <i class="bi bi-plus-circle"></i> 创建章
        </div>
        <!-- 章节点：创建节 -->
        <div class="context-menu-item" v-if="contextMenu.type === 'node' && contextMenu.target.label === 'Chapter'" @click="handleContextMenuAction('createSection')">
          <i class="bi bi-plus-circle"></i> 创建节
        </div>
        <!-- 节节点：创建知识点 -->
        <div class="context-menu-item" v-if="contextMenu.type === 'node' && contextMenu.target.label === 'Section'" @click="handleContextMenuAction('createKnowledgePoint')">
          <i class="bi bi-plus-circle"></i> 创建知识点
        </div>
        <!-- 知识点节点：创建相关知识点 -->
        <div class="context-menu-item" v-if="contextMenu.type === 'node' && contextMenu.target.label === 'KnowledgePoint'" @click="handleContextMenuAction('createRelatedKnowledgePoint')">
          <i class="bi bi-plus-circle"></i> 创建相关知识点
        </div>
        <div class="context-menu-item" v-if="contextMenu.type === 'node'" @click="handleContextMenuAction('createRelationship')">
          <i class="bi bi-link"></i> 创建关系
        </div>
        <div class="context-menu-item" @click="handleContextMenuAction('update' + (contextMenu.type === 'node' ? 'Node' : 'Relationship'))">
          <i class="bi bi-pencil"></i> 编辑{{ contextMenu.type === 'node' ? '节点' : '关系' }}
        </div>
        <!-- 分隔线 -->
        <div class="context-menu-divider" v-if="contextMenu.type === 'node' && contextMenu.target.label === 'Course'"></div>
        <!-- 课程节点：删除整个课程知识图谱 -->
        <div class="context-menu-item delete-course" v-if="contextMenu.type === 'node' && contextMenu.target.label === 'Course'" @click="handleContextMenuAction('deleteCourseGraph')">
          <i class="bi bi-exclamation-triangle"></i> 删除该课程知识图谱
        </div>
        <div class="context-menu-item delete" @click="handleContextMenuAction('delete' + (contextMenu.type === 'node' ? 'Node' : 'Relationship'))">
          <i class="bi bi-trash"></i> 删除{{ contextMenu.type === 'node' ? '节点' : '关系' }}
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';
// import request from '../job/api/request'

// 导入Bootstrap（如果全局可用）
let bootstrap = null;

// 延迟检查Bootstrap，确保它已经加载
function checkBootstrap() {
  if (typeof window !== 'undefined' && window.bootstrap) {
    bootstrap = window.bootstrap;
    return true;
  }
  return false;
}

// 立即检查一次
checkBootstrap();

// 如果还没加载，等待一段时间后再检查
if (!bootstrap) {
  setTimeout(() => {
    if (!checkBootstrap()) {
      console.warn('Bootstrap仍未加载，将使用回退方案');
    }
  }, 1000);
}
export default {
  name: 'KnowledgeGraph',
  data() {
    return {
      baseUrl: this.getBaseUrl(),
      selectedCourse: '',
      selectedChapter: '',
      lastClickedChapter: '', // 上次点击的章节，用于实现两次点击逻辑
      searchKeyword: '',
      courseSearchKeyword: '',
      chapterSearchKeyword: '',
      chapterList: [],
      filteredCourseList: [],
      filteredChapterList: [],
      // 下拉框状态
      courseDropdownOpen: false,
      chapterDropdownOpen: false,
      // 布局模式标志
      currentLayoutMode: 'circular', // 'circular' 或 'star'
      // 左侧功能栏折叠状态
      sidebarCollapsed: false,
      // 右击操作状态管理
      isContextMenuOperation: false,
      
      // 提示消息状态管理
      showSuccessMessage: false,
      showErrorMessage: false,
      showWarningMessage: false,
      successMessage: '',
      errorMessage: '',
      warningMessage: '',
      
      statistics: {
        entityCount: 0,
        relationCount: 0,
        entityTypes: {},
        relationTypes: {}
      },
      simulation: null,
      svg: null,
      g: null,
      nodes: [],
      links: [],
      nodeElements: null,
      linkElements: null,
      nodeLabels: null,
      linkLabels: null,
      originalData: null,
      isPaused: false,
      nodeLimit: 500, // 从500增加到2000，避免大型课程被截断
      showLabels: true,
      showRelationLabels: true,
      zoom: null,
      isLoading: false,
      selectedNode: null,
      // 关系类型映射表（包含四层结构支持）
      relationTypeMap: {
        // 四层结构层次关系 - 统一显示为"包含"和"属于"
        "CONTAINS_CHAPTER": "包含",
        "BELONGS_TO_CHAPTER": "属于",
        "CONTAINS_SECTION": "包含",
        "BELONGS_TO_SECTION": "属于",
        "CONTAINS": "包含",
        "BELONGS_TO": "属于",
        
        // 学习顺序关系
        "PREREQUISITE": "先修于",
        "PREREQUISITE_FOR": "后续",
        
        // 并行和相关关系
        "PARALLEL": "并行",
        "RELATED_TO": "相关",
        "SIMILAR_TO": "相似",
        
        // 应用和扩展关系
        "APPLICATION": "应用",
        "EXTENSION": "扩展",
        "DEPENDENCY": "依赖",
        
        // 实现和定义关系
        "IMPLEMENTS": "实现",
        "DEFINES": "定义",
        
        // 其他关系
        "PART_OF": "部分",
        "INCLUDES": "包括",
        "FOLLOWS": "跟随",
        "DEPENDS_ON": "依赖于",
        "APPLIES_TO": "应用于",
        "USED_IN": "用于",
        "SUBSET_OF": "子集",
        "INSTANCE_OF": "实例",
        "DEFINED_BY": "定义于",
        "IMPLEMENTED_IN": "实现于"
        
      },
      // 实体类型颜色映射 - 四层结构
      colors: {
        "KnowledgePoint": "#1f77b4",  // 蓝色 - 知识点
        "Course": "#ff7f0e",          // 橙色 - 课程
        "Chapter": "#2ca02c",         // 绿色 - 章节
        "Section": "#9467bd",         // 紫色 - 节段（新增）
        "DEFAULT": "#999999"          // 默认灰色
      },
      
      // 性能优化相关
      _rafUpdateId: null,           // requestAnimationFrame ID
      _updateDebounceTimer: null,   // 防抖定时器
      _lastUpdateTime: 0,           // 上次更新时间
      
      // 增强模式相关数据 - 现在作为默认模式，使用四层结构
      enhancedMode: {
        enabled: true,  // 默认启用增强模式
        structureType: 'four_layer',  // 改为四层结构
        authorityLevel: 'high',
        showHierarchy: true,
        showEnhancedRelations: true,
        hierarchyDisplay: {
          showCourses: true,
          showChapters: true,
          showSections: true,  // 新增节段层
          showKnowledgePoints: true
        },
        hierarchyLayout: {
          courseLevel: 1,
          chapterLevel: 2,
          sectionLevel: 3,  // 新增节段层级
          knowledgePointLevel: 4,  // 知识点层级调整为第4层
          levelSpacing: 150,  // 减小层级间距以适应四层结构
          nodeSpacing: 120
        },
        relationTypeFilter: {
          // 层次关系 - 支持四层结构
          'CONTAINS_CHAPTER': true,
          'BELONGS_TO_CHAPTER': true,
          'CONTAINS_SECTION': true,    // 新增：章节包含节段
          'BELONGS_TO_SECTION': true,  // 新增：知识点属于节段
          'CONTAINS': true,
          
          // 学习顺序关系
          'PREREQUISITE': true,
          'PREREQUISITE_FOR': true,
          
          // 并行和相关关系
          'PARALLEL': true,
          'RELATED_TO': true,
          'SIMILAR_TO': true,
          
          // 应用和扩展关系
          'APPLICATION': true,
          'EXTENSION': true,
          'DEPENDENCY': true,
          
          // 实现和定义关系
          'IMPLEMENTS': true,
          'DEFINES': true
        },
        relationStrengthFilter: {
          strong: true,
          medium: true,
          weak: true
        },
        activeFilterTab: 'hierarchy'
      },
      
      // 增强关系类型映射 - 完整的关系类型支持（四层结构）- 全部中文化
      enhancedRelationTypeMap: {
        // 层次关系 - 支持四层结构（统一翻译）
        "CONTAINS_CHAPTER": "包含",        // 课程包含章节
        "BELONGS_TO_CHAPTER": "属于",
        "CONTAINS_SECTION": "包含",        // 章节包含节段
        "BELONGS_TO_SECTION": "属于",      // 知识点属于节段
        "CONTAINS": "包含",
        
        // 学习顺序关系
        "PREREQUISITE": "先修于",
        "PREREQUISITE_FOR": "后续",
        
        // 并行和相关关系
        "PARALLEL": "并行",
        "RELATED_TO": "相关",
        "SIMILAR_TO": "相似",
        
        // 应用和扩展关系
        "APPLICATION": "应用",
        "EXTENSION": "扩展",
        "DEPENDENCY": "依赖",
        
        // 实现和定义关系
        "IMPLEMENTS": "实现",
        "DEFINES": "定义",
        
        // 其他关系
        "USED_IN": "用于",
        "PART_OF": "属于",
        "INSTANCE_OF": "实例",
        "SUBSET_OF": "子集",
        "FOLLOWS": "跟随",
        "DEPENDS_ON": "依赖于",
        "APPLIES_TO": "应用于",
        "IMPLEMENTED_IN": "实现于",
        "DEFINED_BY": "定义于",
        "BELONGS_TO": "属于"
      },
      
      // 增强关系类型视觉样式 - 支持关系强度和置信度（四层结构）- 描述中文化
      relationStyles: {
        // 层次关系 - 支持四层结构
        "CONTAINS_CHAPTER": { 
          color: "#2c3e50", 
          style: "solid", 
          width: 4, 
          opacity: 1.0,
          strength: "strong",
          description: "课程包含章节"
        },
        "BELONGS_TO_CHAPTER": { 
          color: "#34495e", 
          style: "solid", 
          width: 3, 
          opacity: 0.9,
          strength: "strong",
          description: "章属于课程"
        },
        "CONTAINS_SECTION": { 
          color: "#8e44ad", 
          style: "solid", 
          width: 3, 
          opacity: 0.9,
          strength: "strong",
          description: "章包含小节"
        },
        "BELONGS_TO_SECTION": { 
          color: "#9b59b6", 
          style: "solid", 
          width: 2, 
          opacity: 0.8,
          strength: "strong",
          description: "知识点属于小节"
        },
        "CONTAINS": { 
          color: "#7f8c8d", 
          style: "solid", 
          width: 3, 
          opacity: 0.8,
          strength: "strong",
          description: "包含关系"
        },
        
        // 学习顺序关系
        "PREREQUISITE": { 
          color: "#e74c3c", 
          style: "solid", 
          width: 3, 
          opacity: 0.9,
          strength: "strong",
          description: "先修于",
          arrow: "large"
        },
        "PREREQUISITE_FOR": { 
          color: "#c0392b", 
          style: "solid", 
          width: 2, 
          opacity: 0.8,
          strength: "medium",
          description: "后续"
        },
        
        // 并行和相关关系
        "PARALLEL": { 
          color: "#1abc9c", 
          style: "dashed", 
          width: 2, 
          opacity: 0.7,
          strength: "medium",
          description: "并行"
        },
        "RELATED_TO": { 
          color: "#95a5a6", 
          style: "dotted", 
          width: 1, 
          opacity: 0.6,
          strength: "weak",
          description: "相关"
        },
        "SIMILAR_TO": { 
          color: "#9b59b6", 
          style: "dashed", 
          width: 2, 
          opacity: 0.7,
          strength: "medium",
          description: "相似"
        },
        
        // 应用和扩展关系
        "APPLICATION": { 
          color: "#3498db", 
          style: "dotted", 
          width: 2, 
          opacity: 0.8,
          strength: "medium",
          description: "应用"
        },
        "EXTENSION": { 
          color: "#2ecc71", 
          style: "solid", 
          width: 2, 
          opacity: 0.8,
          strength: "medium",
          description: "扩展"
        },
        "DEPENDENCY": { 
          color: "#f39c12", 
          style: "solid", 
          width: 2, 
          opacity: 0.9,
          strength: "strong",
          description: "依赖"
        },
        
        // 实现和定义关系
        "IMPLEMENTS": { 
          color: "#e67e22", 
          style: "solid", 
          width: 2, 
          opacity: 0.8,
          strength: "medium",
          description: "实现"
        },
        "DEFINES": { 
          color: "#8e44ad", 
          style: "solid", 
          width: 2, 
          opacity: 0.8,
          strength: "medium",
          description: "定义"
        },
        
        // 默认样式
        "DEFAULT": { 
          color: "#bdc3c7", 
          style: "solid", 
          width: 3, 
          opacity: 0.9,
          strength: "strong",  // 改为强
          description: "自定义关系"  // 改为更友好的描述
        }
      },

      // 关系类型分类 - 支持四层结构
      relationTypeCategories: {
        hierarchy: ['CONTAINS_CHAPTER', 'BELONGS_TO_CHAPTER', 'CONTAINS_SECTION', 'BELONGS_TO_SECTION', 'CONTAINS'],
        sequence: ['PREREQUISITE', 'PREREQUISITE_FOR', 'DEPENDENCY'],
        semantic: ['PARALLEL', 'RELATED_TO', 'SIMILAR_TO', 'APPLICATION', 'EXTENSION', 'IMPLEMENTS', 'DEFINES']
      },

      // 增删改相关数据
      newNode: {
        name: '',
        label: 'KnowledgePoint',
        description: '',
        semester: '',
        category: '',
        credits: null,
        courseName: '', // 用于知识点节点选择所属课程
        difficulty: '',
        importance: '',
        properties: {
          description: ''
        },
        propertiesJson: ''
      },
      updateNodeData: {
        name: '',
        label: '',
        description: '',
        semester: '',
        category: '',
        credits: null,
        courseName: '', // 用于知识点节点选择所属课程
        difficulty: '',
        importance: '',
        propertiesJson: ''
      },
      courseList: [], // 课程列表，用于知识点节点选择所属课程
      newRelationship: {
        source: '',
        target: '',
        relation_type: 'RELATED_TO'
      },
      updateRelationshipData: {
        source: '',
        target: '',
        old_relation_type: '',
        new_relation_type: 'RELATED_TO'
      },
      updateRelationshipForm: {
        source: '',
        target: '',
        old_relation_type: '',
        new_relation_type: 'RELATED_TO'
      },
      deleteRelationshipForm: {
        source: '',
        target: '',
        old_relation_type: '',
        new_relation_type: ''
      },

      // 选中状态管理
      selectedLink: null,
      contextMenu: {
        show: false,
        x: 0,
        y: 0,
        type: 'node', // 'node' or 'link'
        target: null
      },

      // 快捷操作数据
      quickCreateChapterData: {
        courseName: '',
        chapterName: '',
        description: ''
      },
      quickCreateSectionData: {
        chapterName: '',
        sectionName: '',
        description: ''
      },
      quickCreateKnowledgePointData: {
        sectionName: '',
        knowledgePointName: '',
        description: '',
        difficulty: '',
        importance: ''
      },
      quickCreateRelatedKnowledgePointData: {
        sourceKnowledgePoint: '',
        knowledgePointName: '',
        description: '',
        difficulty: '',
        importance: '',
        relationType: 'RELATED_TO'
      },

      // 操作来源标志
      operationSource: {
        isFromContextMenu: false, // 是否来自右击菜单
        nodeName: '' // 操作的节点名称，用于后续处理
      },

      // 右击操作状态锁（防止异步回调时的状态竞争）
      contextMenuLock: false,

      // 调试标志
      debugMode: true,

      // 强制调试标志（确保调试信息总是输出）
      forceDebug: true,

      // 学习资料相关数据
      learningMaterials: [],
      materialsLoading: false,
      selectedFile: null,
      newMaterial: {
        title: '',
        description: '',
        material_type: 'document'
      },

      // URL参数相关数据
      urlParams: {
        course: '',
        refresh: '',
        fromAdmin: false
      },

      // 自动刷新相关数据
      autoRefreshTimer: null,
      refreshInterval: 10000, // 10秒检查一次
      lastDataTimestamp: null,
      
      // 课程生成监听相关
      broadcastChannel: null,
      generationCompleteListener: null,
      lastProcessedCourse: null,
      lastProcessedTime: 0,
      
      // 防抖定时器
      nodeLimitUpdateTimer: null,
      
      // 控制面板折叠状态
      controlsCollapsed: false
    }
  },

  watch: {
    nodeLimit: {
      handler(newVal, oldVal) {
        // 防止初始化时触发和无限循环
        if (oldVal === undefined || newVal === oldVal) return;
        
        // 使用防抖避免频繁更新
        if (this.nodeLimitUpdateTimer) {
          clearTimeout(this.nodeLimitUpdateTimer);
        }
        
        this.nodeLimitUpdateTimer = setTimeout(() => {
          if (this.originalData && !this.hasUrlParams()) {
            console.log('[NODE LIMIT] 节点限制变化，重新应用到原始数据');
            this.updateGraph(this.originalData, true, true, true);
          }
        }, 300);
      },
      immediate: false
    },
    showLabels: {
      handler(newVal) {
        if (this.nodeLabels) {
          this.nodeLabels.style("display", newVal ? null : "none");
        }
      },
      immediate: false
    },
    showRelationLabels: {
      handler(newVal) {
        if (this.linkLabels) {
          this.linkLabels.selectAll("text, rect").style("display", newVal ? null : "none");
        }
      },
      immediate: false
    }
  },
  computed: {
    // 过滤和翻译属性
    filteredProperties() {
      if (!this.selectedNode || !this.selectedNode.properties) {
        return [];
      }

      const properties = this.selectedNode.properties;
      console.log('[PROPERTIES] 当前选中节点属性:', properties);
      const filtered = [];

      // 定义需要过滤掉的属性
      const excludedKeys = ['id', 'timestamp', 'source', 'confidence'];

      // 定义属性中英对照表
      const propertyTranslations = {
        'name': '名称',
        'label': '类型',
        'description': '描述',
        'type': '类别',
        'created_at': '创建时间',
        'updated_at': '更新时间',
        'properties': '属性',
        'weight': '权重',
        'level': '级别',
        'difficulty': '难度',
        'importance': '重要性',
        'prerequisites': '先修条件',
        'objectives': '学习目标',
        'content': '内容',
        'duration': '时长',
        'credits': '学分',
        'semester': '学期',
        'department': '院系',
        'instructor': '授课教师',
        'prerequisite': '先修课程',
        'related_courses': '相关课程',
        'knowledge_points': '知识点',
        'chapters': '章节',
        'topics': '主题',
        'subtopics': '子主题',
        'examples': '示例',
        'exercises': '练习',
        'references': '参考资料',
        'resources': '资源',
        'tags': '标签',
        'keywords': '关键词',
        'summary': '摘要',
        'overview': '概述',
        'introduction': '简介',
        'conclusion': '结论',
        'notes': '备注',
        'comments': '评论',
        'status': '状态',
        'version': '版本',
        'author': '作者',
        'publisher': '发布者',
        'date': '日期',
        'url': '链接',
        'email': '邮箱',
        'phone': '电话',
        'address': '地址',
        'organization': '组织',
        'position': '职位',
        'experience': '经验',
        'education': '教育背景',
        'certifications': '证书',
        'skills': '技能',
        'interests': '兴趣',
        'achievements': '成就',
        'publications': '发表作品',
        'projects': '项目',
        'awards': '奖项',
        'memberships': '会员资格'
      };

      // 遍历所有属性
      for (const [key, value] of Object.entries(properties)) {
        // 过滤掉不需要的属性
        if (!excludedKeys.includes(key.toLowerCase())) {
          // 获取中文翻译，如果没有翻译则使用原英文
          const chineseKey = propertyTranslations[key] || key;

          filtered.push({
            key: key,
            chineseKey: chineseKey,
            value: value
          });
        }
      }

      return filtered;
    }
  },
  mounted() {
    // 初始化基本组件
    this.initSvg();
    
    // 初始化控制面板状态
    this.initControlsState();
    
    // 初始化侧边栏状态
    this.initSidebarState();
    
    // 测试后端连接并加载数据
    this.testBackendConnection().then(() => {
      console.log('[INIT] 后端连接成功，开始加载数据');
      this.loadStatistics();

      // 初始化增强模式设置
      this.initializeEnhancedMode();
      
      // 加载课程列表
      this.loadCourseList();

      // 检查URL参数，看是否是从管理页面跳转过来的
      this.checkUrlParameters();

      // 只有在没有URL参数的情况下才加载初始图谱
      // 如果有URL参数，checkUrlParameters会处理自动查询
      if (!this.hasUrlParams()) {
        // 不再自动加载完整图谱，等待用户选择课程
        // this.loadInitialGraph();
        
        // 检查是否有新生成的课程需要自动搜索
        this.checkForNewGeneratedCourse();
      }
    }).catch(error => {
      console.error('[INIT] 后端连接失败:', error);
      this.showError('无法连接到后端服务器，请确保Django服务器正在运行在 http://127.0.0.1:8000');
      
      // 即使后端连接失败，也要初始化基本功能
      console.log('[INIT] 继续初始化基本功能');
    });

    // 这些事件监听器不依赖后端，可以直接设置
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('click', this.handleBackgroundClick);
    
    // 添加点击外部关闭下拉框的监听器
    document.addEventListener('click', this.handleClickOutside);

    // 添加课程生成完成监听器
    this.setupCourseGenerationListeners();

    // 添加视图变化监听器（延迟执行，确保zoom已初始化）
    this.$nextTick(() => {
      if (this.zoom) {
        this.zoom.on('zoom.viewTracker', () => {
          try {
            const currentTransform = d3.zoomTransform(this.svg.node());
            console.log('[VIEW TRACKER] 检测到视图变化，当前变换:', currentTransform);
          } catch (error) {
            console.warn('[VIEW TRACKER] 获取变换失败:', error);
          }
        });
      }
    });
  },
  beforeDestroy() {
    console.log('[CLEANUP] 开始清理组件资源');
    
    // 清理性能优化相关的定时器和动画帧
    if (this._rafUpdateId) {
      cancelAnimationFrame(this._rafUpdateId);
      this._rafUpdateId = null;
    }
    
    if (this._updateDebounceTimer) {
      clearTimeout(this._updateDebounceTimer);
      this._updateDebounceTimer = null;
    }
    
    // 清理D3模拟器
    if (this.simulation) {
      // 移除所有事件监听器
      this.simulation.on('tick', null);
      this.simulation.on('tick.stability', null);
      this.simulation.stop();
      this.simulation = null;
    }
    
    // 清理SVG和D3元素
    if (this.svg) {
      this.svg.selectAll("*").remove();
      this.svg.on('.zoom', null); // 清理zoom事件
      this.svg = null;
    }
    
    // 清理事件监听器
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('click', this.handleBackgroundClick);
    document.removeEventListener('click', this.handleClickOutside);
    
    // 清理定时器
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
    
    if (this.nodeLimitUpdateTimer) {
      clearTimeout(this.nodeLimitUpdateTimer);
      this.nodeLimitUpdateTimer = null;
    }

    // 清理课程生成监听器
    this.cleanupCourseGenerationListeners();
    
    // 清理数据引用
    this.nodes = [];
    this.links = [];
    this.originalData = null;
    this.nodeElements = null;
    this.linkElements = null;
    this.nodeLabels = null;
    this.linkLabels = null;
    
    console.log('[CLEANUP] 组件资源清理完成');
  },

  methods: {
    // 性能优化：防抖函数
    debounce(func, wait = 100) {
      return (...args) => {
        clearTimeout(this._updateDebounceTimer);
        this._updateDebounceTimer = setTimeout(() => {
          func.apply(this, args);
        }, wait);
      };
    },
    
    // 性能优化：节流函数
    throttle(func, limit = 16) {
      return (...args) => {
        const now = Date.now();
        if (now - this._lastUpdateTime >= limit) {
          this._lastUpdateTime = now;
          func.apply(this, args);
        }
      };
    },
    
    // 动态获取API基础URL
    getBaseUrl() {
      // 检查当前域名是否为内网穿透域名
      const currentHost = window.location.host;
      const currentProtocol = window.location.protocol;
      const currentPort = window.location.port;
      
      console.log('当前访问域名:', currentHost);
      console.log('当前协议:', currentProtocol);
      console.log('当前端口:', currentPort);
      
      // 如果是内网穿透域名，使用绝对路径
      if (currentHost.includes('vicp.fun') || currentHost.includes('ngrok') || currentHost.includes('tunnel')) {
        const baseUrl = currentProtocol + '//' + currentHost + '/api/Graphapps/';
        console.log('检测到内网穿透环境，使用绝对路径:', baseUrl);
        return baseUrl;
      }
      
      // 检测nginx代理环境（端口8081或其他非8000端口）
      if (currentPort === '8081' || (currentPort && currentPort !== '8000')) {
        const baseUrl = currentProtocol + '//' + currentHost + '/api/Graphapps/';
        console.log('检测到nginx代理环境，使用相对路径:', baseUrl);
        return baseUrl;
      }
      
      // 本地开发环境，直接访问Django服务器
      const backendHost = 'http://127.0.0.1:8000';
      const baseUrl = backendHost + '/api/Graphapps/';
      console.log('本地���发环境，使用后端服务器路径:', baseUrl);
      return baseUrl;
    },

    // 测试后端连接
    async testBackendConnection() {
      console.log('[CONNECTION TEST] 测试后端连接...');
      try {
        // 创建一个兼容的超时控制器
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(`${this.baseUrl}statistics/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log('[CONNECTION TEST] ✅ 后端连接成功');
          return true;
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error('[CONNECTION TEST] ❌ 后端连接失败:', error);
        
        // 提供详细的错误信息
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          throw new Error('网络连接失败：无法访问后端服务器。请检查：\n1. Django服务器是否在 http://127.0.0.1:8000 运行\n2. CORS配置是否正确\n3. 防火墙设置');
        } else if (error.name === 'AbortError') {
          throw new Error('连接超时：后端服务器响应时间过长');
        } else {
          throw error;
        }
      }
    },

    // 初始化SVG
    initSvg(preserveTransform = false) {
      const container = this.$refs.graphContainer;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      // 保存当前视图变换状态
      let currentTransform = null;
      if (preserveTransform && this.svg && this.zoom) {
        try {
          currentTransform = d3.zoomTransform(this.svg.node());
          console.log('[DEBUG] 保存当前视图变换状态:', currentTransform);
        } catch (error) {
          console.warn('[DEBUG] 无法获取当前视图变换状态:', error);
        }
      }
      
      // 清空现有SVG
      d3.select("#graph-container svg").remove();
      
      // 创建新SVG - 大幅扩大viewBox以支持更大范围的节点显示
      const viewBoxSize = Math.max(width, height) * 3; // 从 2 倍增加到 3 倍
      this.svg = d3.select("#graph-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `${-viewBoxSize/2} ${-viewBoxSize/2} ${viewBoxSize} ${viewBoxSize}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

      // 创建缩放行为 - 扩大缩放范围
      this.zoom = d3.zoom()
        .scaleExtent([0.03, 10]) // 进一步扩大缩放范围（从 0.05-8 改为 0.03-10）
        .on("zoom", (event) => {
          this.g.attr("transform", event.transform);
        });

      // 应用缩放
      this.svg.call(this.zoom);

      this.g = this.svg.append("g");
      
      // 添加SVG背景点击事件，用于取消选中
      this.svg.on("click", (event) => {
        // 只有点击SVG背景时才取消选中（不是节点或连接线）
        if (event.target.tagName === 'svg') {
          this.selectedNode = null;
          this.selectedLink = null;
          this.hideContextMenu();
          this.updateSelectionVisuals();
          this.closePropertiesPanel();
        }
      });
      
      // 如果需要保持变换状态且之前有保存的变换，恢复它
      if (preserveTransform && currentTransform) {
        console.log('[DEBUG] 恢复视图变换状态:', currentTransform);
        this.svg.call(this.zoom.transform, currentTransform);
      }
      
      // 添加多种箭头标记定义（支持不同颜色和大小）
      const defs = this.svg.append("defs");
      
      // 修复：增大 refX 值，使箭头显示在节点外部
      // 默认箭头（灰色）
      defs.append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 60)  // 从 35 增加到 60，确保箭头在节点外部
        .attr("refY", 0)
        .attr("markerWidth", 8)  // 从 6 增加到 8，使箭头更明显
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#999");
      
      // 为不同关系类型定义不同颜色的箭头
      const arrowColors = {
        'prerequisite': '#e74c3c',      // 前置关系 - 红色
        'parallel': '#1abc9c',          // 并行关系 - 青色
        'application': '#3498db',       // 应用关系 - 蓝色
        'extension': '#2ecc71',         // 扩展关系 - 绿色
        'dependency': '#f39c12',        // 依赖关系 - 橙色
        'contains': '#2c3e50',          // 包含关系 - 深灰色
        'belongs': '#34495e',           // 属于关系 - 灰色
        'selected': '#ff6b6b'           // 选中状态 - 粉红色
      };
      
      Object.entries(arrowColors).forEach(([type, color]) => {
        defs.append("marker")
          .attr("id", `arrowhead-${type}`)
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 60)  // 从 35 增加到 60，确保箭头在节点外部
          .attr("refY", 0)
          .attr("markerWidth", 8)  // 从 6 增加到 8
          .attr("markerHeight", 8)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M0,-5L10,0L0,5")
          .attr("fill", color);
      });
      
      console.log('[SVG INIT] SVG初始化完成，viewBox大小:', viewBoxSize);
      
      return this.g;
    },
    
    // 限制显示的节点数量 - 支持四层结构
    limitNodes(data, limit) {
      if (!data || !data.nodes || data.nodes.length <= limit) {
        return data;
      }

      const limitedData = {
        nodes: [],
        relationships: []
      };

      // 按层次优先级保留节点：课程 > 章节 > 节段 > 知识点
      const courseNodes = data.nodes.filter(node => node.label === 'Course');
      const chapterNodes = data.nodes.filter(node => node.label === 'Chapter');
      const sectionNodes = data.nodes.filter(node => node.label === 'Section');
      const knowledgeNodes = data.nodes.filter(node => node.label === 'KnowledgePoint');

      // 确保至少显示所有课程节点
      limitedData.nodes = [...courseNodes];
      let remainingLimit = Math.max(0, limit - courseNodes.length);

      // 添加章节节点
      if (remainingLimit > 0) {
        const chaptersToAdd = chapterNodes.slice(0, remainingLimit);
        limitedData.nodes.push(...chaptersToAdd);
        remainingLimit = Math.max(0, remainingLimit - chaptersToAdd.length);
      }

      // 添加节段节点
      if (remainingLimit > 0) {
        const sectionsToAdd = sectionNodes.slice(0, remainingLimit);
        limitedData.nodes.push(...sectionsToAdd);
        remainingLimit = Math.max(0, remainingLimit - sectionsToAdd.length);
      }

      // 添加知识点节点
      if (remainingLimit > 0) {
        const knowledgeToAdd = knowledgeNodes.slice(0, remainingLimit);
        limitedData.nodes.push(...knowledgeToAdd);
      }

      // 创建节点ID集合以便快速查找
      const nodeIds = new Set(limitedData.nodes.map(node => node.id || node.name));

      // 只保留连接已保留节点的关系
      limitedData.relationships = data.relationships.filter(rel =>
        nodeIds.has(rel.source) && nodeIds.has(rel.target)
      );

      return limitedData;
    },
    
    // 应用扇形分区的环形布局 - 每个章节占据一个扇形区域
    applyCircularLayout(nodes) {
      if (!nodes || nodes.length === 0) return;
      
      const containerWidth = this.$refs.graphContainer.clientWidth || 800;
      const containerHeight = this.$refs.graphContainer.clientHeight || 600;
      const containerSize = Math.min(containerWidth, containerHeight);
      
      // 识别主课程和关联课程
      // 主课程：有章节子节点的课程
      // 关联课程：没有章节子节点的课程
      const mainCourses = [];
      const relatedCourses = [];
      
      const courseNodes = nodes.filter(n => n.label === 'Course');
      const chapterNodes = nodes.filter(n => n.label === 'Chapter');
      
      // 构建课程-章节映射
      const courseChapterMap = new Map();
      if (this.links) {
        this.links.forEach(link => {
          const sourceNode = typeof link.source === 'object' ? link.source : nodes.find(n => n.name === link.source);
          const targetNode = typeof link.target === 'object' ? link.target : nodes.find(n => n.name === link.target);
          const relationType = link.relation_type || link.type;
          
          if (sourceNode && targetNode && 
              sourceNode.label === 'Course' && 
              targetNode.label === 'Chapter' &&
              (relationType === 'CONTAINS_CHAPTER' || relationType === 'CONTAINS')) {
            if (!courseChapterMap.has(sourceNode.name)) {
              courseChapterMap.set(sourceNode.name, []);
            }
            courseChapterMap.get(sourceNode.name).push(targetNode.name);
          }
        });
      }
      
      // 分类课程
      courseNodes.forEach(course => {
        if (courseChapterMap.has(course.name) && courseChapterMap.get(course.name).length > 0) {
          mainCourses.push(course);
        } else {
          relatedCourses.push(course);
        }
      });
      
      console.log('[CIRCULAR LAYOUT] 课程分类:', {
        mainCourses: mainCourses.map(c => c.name),
        relatedCourses: relatedCourses.map(c => c.name)
      });
      
      // 按层级分组节点
      const nodesByLevel = {
        course: mainCourses,                                      // 主课程
        chapter: chapterNodes,                                    // 章节
        section: nodes.filter(n => n.label === 'Section'),       // 节段
        knowledgePoint: nodes.filter(n => n.label === 'KnowledgePoint'), // 知识点
        relatedCourse: relatedCourses                             // 关联课程（最外层）
      };
      
      // 定义每层的半径 - 关联课程放在最外层
      const levelRadius = {
        course: containerSize * 0.5,         // 第1层：主课程（最内圈）
        chapter: containerSize * 1.4,        // 第2层：章节（中内圈）
        section: containerSize * 2.5,        // 第3层：节段（中外圈）
        knowledgePoint: containerSize * 3.8, // 第4层：知识点（外圈）
        relatedCourse: containerSize * 4.8   // 第5层：关联课程（最外圈）
      };
      
      // 构建章节-节段-知识点的层次关系
      const chapterGroups = this.buildChapterGroups(nodes);
      
      // 为每个章节分配扇形区域
      const totalChapters = nodesByLevel.chapter.length;
      if (totalChapters === 0) {
        // 如果没有章节，使用原有的均匀分布
        this.applyUniformCircularLayout(nodes, levelRadius);
        return;
      }
      
      const anglePerChapter = (2 * Math.PI) / totalChapters;
      
      // 为每个章节及其子节点分配位置
      nodesByLevel.chapter.forEach((chapter, chapterIndex) => {
        // 计算该章节的扇形范围
        const startAngle = chapterIndex * anglePerChapter - Math.PI / 2; // 从顶部开始
        const endAngle = (chapterIndex + 1) * anglePerChapter - Math.PI / 2;
        const centerAngle = (startAngle + endAngle) / 2;
        
        // 放置章节节点在扇形中心
        chapter.x = levelRadius.chapter * Math.cos(centerAngle);
        chapter.y = levelRadius.chapter * Math.sin(centerAngle);
        
        // 获取该章节的所有子节点（节段和知识点）
        const chapterGroup = chapterGroups.get(chapter.name);
        if (!chapterGroup) return;
        
        // 在扇形范围内分布节段
        const sections = chapterGroup.sections;
        if (sections.length > 0) {
          const sectionAngleStep = (endAngle - startAngle) / Math.max(sections.length, 1);
          sections.forEach((section, sectionIndex) => {
            const sectionAngle = startAngle + (sectionIndex + 0.5) * sectionAngleStep;
            section.x = levelRadius.section * Math.cos(sectionAngle);
            section.y = levelRadius.section * Math.sin(sectionAngle);
            
            // 在节段的扇形子区域内分布知识点
            const knowledgePoints = chapterGroup.knowledgePointsBySection.get(section.name) || [];
            if (knowledgePoints.length > 0) {
              const subStartAngle = startAngle + sectionIndex * sectionAngleStep;
              const subEndAngle = startAngle + (sectionIndex + 1) * sectionAngleStep;
              const kpAngleStep = (subEndAngle - subStartAngle) / Math.max(knowledgePoints.length, 1);
              
              knowledgePoints.forEach((kp, kpIndex) => {
                const kpAngle = subStartAngle + (kpIndex + 0.5) * kpAngleStep;
                kp.x = levelRadius.knowledgePoint * Math.cos(kpAngle);
                kp.y = levelRadius.knowledgePoint * Math.sin(kpAngle);
              });
            }
          });
        }
        
        // 直接属于章节的知识点（没有节段）
        const directKnowledgePoints = chapterGroup.directKnowledgePoints;
        if (directKnowledgePoints.length > 0) {
          const kpAngleStep = (endAngle - startAngle) / Math.max(directKnowledgePoints.length, 1);
          directKnowledgePoints.forEach((kp, kpIndex) => {
            const kpAngle = startAngle + (kpIndex + 0.5) * kpAngleStep;
            kp.x = levelRadius.knowledgePoint * Math.cos(kpAngle);
            kp.y = levelRadius.knowledgePoint * Math.sin(kpAngle);
          });
        }
      });
      
      // 放置主课程节点在中心
      nodesByLevel.course.forEach((course, index) => {
        const angle = (index * 2 * Math.PI / Math.max(nodesByLevel.course.length, 1)) - Math.PI / 2;
        course.x = levelRadius.course * Math.cos(angle);
        course.y = levelRadius.course * Math.sin(angle);
      });
      
      // 放置关联课程节点在最外层（均匀分布）
      nodesByLevel.relatedCourse.forEach((course, index) => {
        const angle = (index * 2 * Math.PI / Math.max(nodesByLevel.relatedCourse.length, 1)) - Math.PI / 2;
        course.x = levelRadius.relatedCourse * Math.cos(angle);
        course.y = levelRadius.relatedCourse * Math.sin(angle);
      });
      
      console.log('[CIRCULAR LAYOUT] 扇形分区环形布局初始化完成:', {
        mainCourse: nodesByLevel.course.length,
        chapter: nodesByLevel.chapter.length,
        section: nodesByLevel.section.length,
        knowledgePoint: nodesByLevel.knowledgePoint.length,
        relatedCourse: nodesByLevel.relatedCourse.length,
        chapterGroups: chapterGroups.size,
        containerSize: containerSize
      });
    },
    
    // 构建章节分组（章节-节段-知识点的层次关系）
    buildChapterGroups(nodes) {
      const chapterGroups = new Map();
      
      // 找出所有章节
      const chapters = nodes.filter(n => n.label === 'Chapter');
      
      chapters.forEach(chapter => {
        const group = {
          chapter: chapter,
          sections: [],
          directKnowledgePoints: [],
          knowledgePointsBySection: new Map()
        };
        
        // 通过关系找出属于该章节的节段
        if (this.links) {
          this.links.forEach(link => {
            const sourceNode = typeof link.source === 'object' ? link.source : nodes.find(n => n.name === link.source);
            const targetNode = typeof link.target === 'object' ? link.target : nodes.find(n => n.name === link.target);
            const relationType = link.relation_type || link.type;
            
            // 章节包含节段
            if (sourceNode && targetNode && 
                sourceNode.name === chapter.name && 
                targetNode.label === 'Section' &&
                (relationType === 'CONTAINS_SECTION' || relationType === 'CONTAINS')) {
              if (!group.sections.find(s => s.name === targetNode.name)) {
                group.sections.push(targetNode);
              }
            }
            
            // 章节直接包含知识点（没有节段）
            if (sourceNode && targetNode && 
                sourceNode.name === chapter.name && 
                targetNode.label === 'KnowledgePoint' &&
                (relationType === 'CONTAINS' || relationType === 'RELATED_TO')) {
              if (!group.directKnowledgePoints.find(kp => kp.name === targetNode.name)) {
                group.directKnowledgePoints.push(targetNode);
              }
            }
          });
          
          // 修复：为每个节段找出其包含的知识点（处理反转后的关系）
          group.sections.forEach(section => {
            const knowledgePoints = [];
            this.links.forEach(link => {
              const sourceNode = typeof link.source === 'object' ? link.source : nodes.find(n => n.name === link.source);
              const targetNode = typeof link.target === 'object' ? link.target : nodes.find(n => n.name === link.target);
              const relationType = link.relation_type || link.type;
              
              // 修复：处理反转后的 BELONGS_TO_SECTION 关系
              // 反转后：source是知识点，target是节段
              if (sourceNode && targetNode && 
                  targetNode.name === section.name && 
                  sourceNode.label === 'KnowledgePoint' &&
                  (relationType === 'BELONGS_TO_SECTION' || relationType === 'BELONGS_TO')) {
                if (!knowledgePoints.find(kp => kp.name === sourceNode.name)) {
                  knowledgePoints.push(sourceNode);
                }
              }
              
              // 保留原有的 CONTAINS 关系处理（如果存在）
              if (sourceNode && targetNode && 
                  sourceNode.name === section.name && 
                  targetNode.label === 'KnowledgePoint' &&
                  relationType === 'CONTAINS') {
                if (!knowledgePoints.find(kp => kp.name === targetNode.name)) {
                  knowledgePoints.push(targetNode);
                }
              }
            });
            group.knowledgePointsBySection.set(section.name, knowledgePoints);
          });
        }
        
        chapterGroups.set(chapter.name, group);
      });
      
      return chapterGroups;
    },
    
    // 均匀分布的环形布局（备用方案）
    applyUniformCircularLayout(nodes, levelRadius) {
      // 识别主课程和关联课程
      const mainCourses = [];
      const relatedCourses = [];
      
      const courseNodes = nodes.filter(n => n.label === 'Course');
      const chapterNodes = nodes.filter(n => n.label === 'Chapter');
      
      // 构建课程-章节映射
      const courseChapterMap = new Map();
      if (this.links) {
        this.links.forEach(link => {
          const sourceNode = typeof link.source === 'object' ? link.source : nodes.find(n => n.name === link.source);
          const targetNode = typeof link.target === 'object' ? link.target : nodes.find(n => n.name === link.target);
          const relationType = link.relation_type || link.type;
          
          if (sourceNode && targetNode && 
              sourceNode.label === 'Course' && 
              targetNode.label === 'Chapter' &&
              (relationType === 'CONTAINS_CHAPTER' || relationType === 'CONTAINS')) {
            if (!courseChapterMap.has(sourceNode.name)) {
              courseChapterMap.set(sourceNode.name, []);
            }
            courseChapterMap.get(sourceNode.name).push(targetNode.name);
          }
        });
      }
      
      // 分类课程
      courseNodes.forEach(course => {
        if (courseChapterMap.has(course.name) && courseChapterMap.get(course.name).length > 0) {
          mainCourses.push(course);
        } else {
          relatedCourses.push(course);
        }
      });
      
      const nodesByLevel = {
        course: mainCourses,
        chapter: chapterNodes,
        section: nodes.filter(n => n.label === 'Section'),
        knowledgePoint: nodes.filter(n => n.label === 'KnowledgePoint'),
        relatedCourse: relatedCourses
      };
      
      Object.keys(nodesByLevel).forEach(level => {
        const levelNodes = nodesByLevel[level];
        if (levelNodes.length === 0 || !levelRadius[level]) return;
        
        const radius = levelRadius[level];
        const angleStep = (2 * Math.PI) / Math.max(levelNodes.length, 1);
        
        levelNodes.forEach((node, index) => {
          const angle = index * angleStep - Math.PI / 2;
          node.x = radius * Math.cos(angle);
          node.y = radius * Math.sin(angle);
        });
      });
    },
    
    // 创建角度约束力 - 保持节点在其所属的扇形区域内
    createAngularForce() {
      const force = (alpha) => {
        if (!this.nodes || !this.links) return;
        
        // 构建章节分组
        const chapterGroups = this.buildChapterGroups(this.nodes);
        if (chapterGroups.size === 0) return;
        
        const totalChapters = Array.from(chapterGroups.keys()).length;
        const anglePerChapter = (2 * Math.PI) / totalChapters;
        
        // 为每个节点应用角度约束
        this.nodes.forEach(node => {
          if (node.label === 'Course') return; // 课程节点不需要角度约束
          
          // 找到节点所属的章节
          let belongsToChapter = null;
          let chapterIndex = -1;
          
          chapterGroups.forEach((group, chapterName) => {
            const chapterIdx = Array.from(chapterGroups.keys()).indexOf(chapterName);
            
            // 检查是否是该章节的节段
            if (group.sections.find(s => s.name === node.name)) {
              belongsToChapter = chapterName;
              chapterIndex = chapterIdx;
              return;
            }
            
            // 检查是否是该章节的知识点
            if (group.directKnowledgePoints.find(kp => kp.name === node.name)) {
              belongsToChapter = chapterName;
              chapterIndex = chapterIdx;
              return;
            }
            
            // 检查是否是节段下的知识点
            group.knowledgePointsBySection.forEach(kps => {
              if (kps.find(kp => kp.name === node.name)) {
                belongsToChapter = chapterName;
                chapterIndex = chapterIdx;
              }
            });
          });
          
          if (chapterIndex === -1) return;
          
          // 计算该章节的扇形范围
          const startAngle = chapterIndex * anglePerChapter - Math.PI / 2;
          const endAngle = (chapterIndex + 1) * anglePerChapter - Math.PI / 2;
          const centerAngle = (startAngle + endAngle) / 2;
          
          // 计算节点当前的角度
          const currentAngle = Math.atan2(node.y, node.x);
          
          // 如果节点超出扇形范围，施加约束力
          let targetAngle = currentAngle;
          
          // 标准化角度到 [-π, π] 范围
          const normalizeAngle = (angle) => {
            while (angle > Math.PI) angle -= 2 * Math.PI;
            while (angle < -Math.PI) angle += 2 * Math.PI;
            return angle;
          };
          
          const normCurrentAngle = normalizeAngle(currentAngle);
          const normStartAngle = normalizeAngle(startAngle);
          const normEndAngle = normalizeAngle(endAngle);
          
          // 检查是否在扇形范围内
          let inRange = false;
          if (normStartAngle <= normEndAngle) {
            inRange = normCurrentAngle >= normStartAngle && normCurrentAngle <= normEndAngle;
          } else {
            inRange = normCurrentAngle >= normStartAngle || normCurrentAngle <= normEndAngle;
          }
          
          if (!inRange) {
            // 计算到边界的距离，选择最近的边界
            const distToStart = Math.abs(normalizeAngle(normCurrentAngle - normStartAngle));
            const distToEnd = Math.abs(normalizeAngle(normCurrentAngle - normEndAngle));
            
            targetAngle = distToStart < distToEnd ? startAngle : endAngle;
            
            // 应用约束力
            const radius = Math.sqrt(node.x * node.x + node.y * node.y);
            const targetX = radius * Math.cos(targetAngle);
            const targetY = radius * Math.sin(targetAngle);
            
            // 修复：增强约束力强度，确保节点保持在扇形范围内
            const strength = 0.3 * alpha;  // 从 0.1 增加到 0.3
            node.vx += (targetX - node.x) * strength;
            node.vy += (targetY - node.y) * strength;
          }
        });
      };
      
      return force;
    },
    
    // 更新图谱
    updateGraph(data, preservePositions = false, skipAutoFit = false, isFromContextMenuOp = false, focusNodeName = null) {
      console.log('[DEBUG] updateGraph 被调用, preservePositions:', preservePositions, 'skipAutoFit:', skipAutoFit, 'focusNodeName:', focusNodeName);
      // 显示加载中
      this.isLoading = true;

      // 保存原始数据
      this.originalData = data;
      
      // 限制节点数量
      const limitedData = this.limitNodes(data, this.nodeLimit);
      
      // 保存当前视图变换状态（在可能重新初始化SVG之前）
      let savedTransform = null;
      if (preservePositions && this.svg && this.zoom) {
        try {
          savedTransform = d3.zoomTransform(this.svg.node());
          console.log('[DEBUG] 保存视图变换状态（外层）:', savedTransform);
        } catch (error) {
          console.warn('[DEBUG] 无法保存视图变换状态:', error);
        }
      }

      // 初始化SVG - 保持位置时避免重新初始化SVG，如果必须重新初始化则保持视图变换
      if (!this.g) {
        this.g = this.initSvg(false);
      } else if (!preservePositions) {
        // 即使重新初始化SVG，也要保持视图变换状态
        this.g = this.initSvg(skipAutoFit);
      }

      // 如果保持位置且有保存的变换状态，强制恢复它
      if (preservePositions && savedTransform && this.svg && this.zoom) {
        console.log('[DEBUG] 强制恢复视图变换状态（外层）:', savedTransform);
        this.svg.call(this.zoom.transform, savedTransform);
      }
      
      // 标准化连接线数据格式，确保source和target始终是字符串
      // 修复：反转 BELONGS_TO_SECTION 关系的方向，使箭头从知识点指向节段
      const normalizedLinks = limitedData.relationships.map(link => {
        const relationType = link.relation_type || link.type;
        const source = typeof link.source === 'object' ? link.source.name : link.source;
        const target = typeof link.target === 'object' ? link.target.name : link.target;
        
        // 如果是 BELONGS_TO_SECTION 关系，反转方向
        if (relationType === 'BELONGS_TO_SECTION' || relationType === 'BELONGS_TO') {
          return {
            ...link,
            source: target,  // 反转：原target变为source
            target: source,  // 反转：原source变为target
            relation_type: relationType,
            type: relationType
          };
        }
        
        return {
          ...link,
          source: source,
          target: target
        };
      });
      
      // 更新数据
      this.nodes = limitedData.nodes;
      this.links = normalizedLinks;
      
      // 如果保持位置，保存节点当前位置
      const nodePositions = {};
      if (preservePositions && this.nodeElements) {
        this.nodeElements.each(function(d) {
          nodePositions[d.name] = { x: d.x, y: d.y, fx: d.fx, fy: d.fy };
        });
        console.log('[DEBUG] 保存节点位置，数量:', Object.keys(nodePositions).length);
      }
      
      // 停止之前的模拟
      if (this.simulation) {
        console.log('[DEBUG] 停止之前的模拟器');
        this.simulation.stop();
      }
      
      // 如果要保持位置，恢复节点的位置
      if (preservePositions) {
        this.nodes.forEach(node => {
          if (nodePositions[node.name]) {
            // 恢复已有节点的位置（使用name而不是id）
            node.x = nodePositions[node.name].x;
            node.y = nodePositions[node.name].y;
            node.fx = nodePositions[node.name].fx;
            node.fy = nodePositions[node.name].fy;
          } else if (node.x === undefined || node.y === undefined) {
            // 为新节点设置随机位置，避免聚集在原点
            const containerWidth = this.$refs.graphContainer.clientWidth;
            const containerHeight = this.$refs.graphContainer.clientHeight;
            node.x = (Math.random() - 0.5) * containerWidth * 0.8;
            node.y = (Math.random() - 0.5) * containerHeight * 0.8;
          }
        });
      }
      
      // 获取容器尺寸，创建更大的初始布局区域
      const containerWidth = this.$refs.graphContainer.clientWidth;
      const containerHeight = this.$refs.graphContainer.clientHeight;

      // 大幅扩大布局区域，让节点有更多空间分布
      const layoutWidth = Math.max(containerWidth, containerWidth * 4);
      const layoutHeight = Math.max(containerHeight, containerHeight * 4);
      
      // 应用环形布局初始位置
      this.applyCircularLayout(this.nodes);
      
      // 创建新的模拟 - 优化为扇形分区的环形布局
      this.simulation = d3.forceSimulation(this.nodes)
        .force("link", d3.forceLink(this.links).id(d => d.name)
          .distance(d => {
            // 根据关系类型和层级设置连接距离
            const sourceLabel = d.source.label || d.source;
            const targetLabel = d.target.label || d.target;
            const relationType = d.relation_type || d.type;
            
            // 层次关系使用较短距离，保持紧密
            if (relationType === 'CONTAINS' || relationType === 'CONTAINS_CHAPTER' || 
                relationType === 'CONTAINS_SECTION' || relationType === 'BELONGS_TO' ||
                relationType === 'BELONGS_TO_CHAPTER' || relationType === 'BELONGS_TO_SECTION') {
              return 300;
            }
            
            // 跨层连接使用更大的距离
            if (sourceLabel === 'Course' || targetLabel === 'Course') {
              return 600;
            } else if (sourceLabel === 'Chapter' || targetLabel === 'Chapter') {
              return 550;
            } else if (sourceLabel === 'Section' || targetLabel === 'Section') {
              return 500;
            }
            return 450;
          })
          .strength(d => {
            //修复：降低连较接力强度，让径向力和角度约束力主导布局
            const relationType = d.relation_type || d.type;
            if (relationType === 'CONTAINS' || relationType === 'CONTAINS_CHAPTER' || 
                relationType === 'CONTAINS_SECTION' || relationType === 'BELONGS_TO' ||
                relationType === 'BELONGS_TO_CHAPTER' || relationType === 'BELONGS_TO_SECTION') {
              return 0.1;  // 从 0.3 降低到 0.1
            }
            return 0.05;  // 从 0.1 降低到 0.05
          })
        )
        .force("charge", d3.forceManyBody()
          .strength(d => {
            // 优化：减少斥力强度，加快收敛速度
            if (d.label === 'Course') {
              return -1200; // 从 -1800 减少
            } else if (d.label === 'Chapter') {
              return -1000; // 从 -1600 减少
            } else if (d.label === 'Section') {
              return -800;  // 从 -1400 减少
            }
            return -600;    // 从 -1200 减少
          })
          .distanceMax(800) // 限制斥力作用范围，提升性能
        )
        .force("center", d3.forceCenter(0, 0).strength(0.02))
        .force("radial", d3.forceRadial(d => {
          // 径向力：保持节点在各自的环形层上
          const containerSize = Math.min(
            this.$refs.graphContainer.clientWidth,
            this.$refs.graphContainer.clientHeight
          );
          
          // 判断是否为关联课程（没有章节子节点的课程）
          if (d.label === 'Course') {
            // 检查是否有章节子节点
            let hasChapters = false;
            if (this.links) {
              hasChapters = this.links.some(link => {
                const sourceNode = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.name === link.source);
                const targetNode = typeof link.target === 'object' ? link.target : this.nodes.find(n => n.name === link.target);
                const relationType = link.relation_type || link.type;
                
                return sourceNode && targetNode &&
                       sourceNode.name === d.name &&
                       targetNode.label === 'Chapter' &&
                       (relationType === 'CONTAINS_CHAPTER' || relationType === 'CONTAINS');
              });
            }
            
            // 关联课程放在最外层，主课程在中心
            return hasChapters ? containerSize * 0.4 : containerSize * 4.3;
          } else if (d.label === 'Chapter') {
            return containerSize * 1.2;
          } else if (d.label === 'Section') {
            return containerSize * 2.2;
          } else if (d.label === 'KnowledgePoint') {
            return containerSize * 3.4;
          }
          return containerSize * 1.5;
        }, 0, 0).strength(0.9)) // 修复：增强径向力从 0.8 到 0.9，更强地保持环形结构
        .force("angular", this.createAngularForce()) // 角度约束力，保持扇形分区
        .force("collide", d3.forceCollide()
          .radius(d => {
            if (d.label === 'Course') {
              return 120;
            } else if (d.label === 'Chapter') {
              return 110;
            } else if (d.label === 'Section') {
              return 105;
            }
            return 100;
          })
          .strength(1.0)
          .iterations(8)
        );

      // 如果需要保持位置，只禁用会导致节点移动的力，保留基本的连线力
      if (preservePositions) {
        this.simulation.force("center", null);
        this.simulation.force("x", null);
        this.simulation.force("y", null);
        // 保留连线力和碰撞检测，但降低强度
        this.simulation.force("charge", d3.forceManyBody().strength(-50));
      }
      
      // 使用D3数据绑定机制更新元素，而不是每次都删除重建
      console.log('[DEBUG] 更新DOM元素，nodes数量:', this.nodes.length, 'links数量:', this.links.length);
      
      // 更新模拟器数据
      console.log('[DEBUG] 同步模拟器数据');
      this.simulation.nodes(this.nodes);
      this.simulation.force("link").links(this.links);

      // 更新连接线 - 使用数据绑定
      let linksGroup = this.g.select('.links');
      if (linksGroup.empty()) {
        linksGroup = this.g.append("g").attr("class", "links");
      }
      
      // 使用统一的key函数
      const linkSelection = linksGroup.selectAll("line")
        .data(this.links, d => `${d.source}-${d.target}-${d.type}`);
      
      // 移除不需要的连接线
      linkSelection.exit().remove();
      
      // 添加新的连接线
      const newLinks = linkSelection.enter().append("line");
      
      // 设置新连接线和更新现有连接线的属性
      this.linkElements = linkSelection.merge(newLinks)
        .attr("class", d => {
          let classes = "link";
          
          // 增强模式：根据关系类型添加样式类
          if (this.enhancedMode.enabled) {
            const relType = d.type || d.relation_type;
            if (relType === 'PREREQUISITE') classes += " prerequisite-relation";
            else if (relType === 'PARALLEL') classes += " parallel-relation";
            else if (relType === 'APPLICATION') classes += " application-relation";
            else if (relType === 'EXTENSION') classes += " extension-relation";
            else if (relType === 'DEPENDENCY') classes += " dependency-relation";
            else if (relType === 'CONTAINS_CHAPTER') classes += " contains-chapter-relation";
            else if (relType === 'BELONGS_TO_CHAPTER') classes += " belongs-to-chapter-relation";
          }
          
          if (this.isLinkSelected(d)) {
            classes += " selected";
          }
          
          return classes;
        })
        .attr("stroke", d => {
          // 根据节点类型获取样式（而不是关系类型）
          if (this.enhancedMode.enabled) {
            const style = this.getStyleByNodeTypes(d);
            return style.color;
          }
          return "#999";
        })
        .attr("stroke-width", d => {
          if (this.isLinkSelected(d)) return 3;
          
          // 根据节点类型获取样式（而不是关系类型）
          if (this.enhancedMode.enabled) {
            const style = this.getStyleByNodeTypes(d);
            return style.width;
          }
          return 2;
        })
        .attr("stroke-dasharray", d => {
          // 根据节点类型获取样式（而不是关系类型）
          if (this.enhancedMode.enabled) {
            const style = this.getStyleByNodeTypes(d);
            if (style.style === 'dashed') return "5,5";
            if (style.style === 'dotted') return "2,3";
          }
          return null;
        })
        .attr("stroke-opacity", d => {
          // 根据节点类型获取样式（而不是关系类型）
          if (this.enhancedMode.enabled) {
            const style = this.getStyleByNodeTypes(d);
            return style.opacity;
          }
          return 1.0;
        })
        .attr("marker-end", d => {
          // 根据关系类型和选中状态使用不同的箭头
          if (this.isLinkSelected(d)) {
            return "url(#arrowhead-selected)";
          }
          
          const relType = d.type || d.relation_type;
          
          // 映射关系类型到箭头类型
          if (relType === 'PREREQUISITE' || relType === 'PREREQUISITE_FOR') {
            return "url(#arrowhead-prerequisite)";
          } else if (relType === 'PARALLEL') {
            return "url(#arrowhead-parallel)";
          } else if (relType === 'APPLICATION') {
            return "url(#arrowhead-application)";
          } else if (relType === 'EXTENSION') {
            return "url(#arrowhead-extension)";
          } else if (relType === 'DEPENDENCY') {
            return "url(#arrowhead-dependency)";
          } else if (relType === 'CONTAINS' || relType === 'CONTAINS_CHAPTER' || relType === 'CONTAINS_SECTION') {
            return "url(#arrowhead-contains)";
          } else if (relType === 'BELONGS_TO' || relType === 'BELONGS_TO_CHAPTER' || relType === 'BELONGS_TO_SECTION') {
            return "url(#arrowhead-belongs)";
          }
          
          return "url(#arrowhead)";
        })
        .style("cursor", "pointer");
      
      // 清理之前的事件监听器，避免重复绑定
      this.linkElements
        .on("mouseenter", null)
        .on("mouseleave", null)
        .on("click", null)
        .on("contextmenu", null);
      
      // 重新绑定完整的事件监听器
      this.linkElements
        .on("mouseenter", (event, d) => {
          // 增强模式：鼠标悬停时显示关系信息
          const element = d3.select(event.target);
          element.attr("stroke-width", 4).attr("stroke-opacity", 1.0);
          
          if (this.enhancedMode.enabled) {
            // 根据节点类型获取样式
            const style = this.getStyleByNodeTypes(d);
            
            // 获取关系类型的中文翻译
            const relType = d.type || d.relation_type;
            const translatedType = this.translateRelationType(relType);
            
            // 创建关系信息提示
            this.showRelationTooltip(event, {
              type: translatedType,
              strength: style.strength === 'strong' ? '强' : style.strength === 'medium' ? '中' : '弱',
              description: style.description || '未知关系',
              source: d.source,
              target: d.target
            });
          }
        })
        .on("mouseleave", (event, d) => {
          const isSelected = this.isLinkSelected(d);
          const element = d3.select(event.target);
          
          // 恢复原始样式
          if (this.enhancedMode.enabled) {
            // 根据节点类型获取样式
            const style = this.getStyleByNodeTypes(d);
            const originalWidth = isSelected ? 3 : style.width;
            const originalOpacity = style.opacity;
            
            element
              .attr("stroke-width", originalWidth)
              .attr("stroke-opacity", originalOpacity);
          } else {
            element
              .attr("stroke-width", isSelected ? 3 : 2)
              .attr("stroke-opacity", 1);
          }
          
          // 隐藏关系信息提示
          this.hideRelationTooltip();
        })
        .on("click", (event, d) => {
          event.stopPropagation();
          event.preventDefault();
          console.log('关系点击事件触发:', d);
          this.selectLink(d);
        })
        .on("contextmenu", (event, d) => {
          event.stopPropagation();
          event.preventDefault();
          console.log('关系右键事件触发:', d);
          this.showContextMenu(event, 'link', d);
        });
      
      // 更新节点 - 使用数据绑定
      let nodesGroup = this.g.select('.nodes');
      if (nodesGroup.empty()) {
        nodesGroup = this.g.append("g").attr("class", "nodes");
      }
      
      const nodeSelection = nodesGroup.selectAll("circle")
        .data(this.nodes, d => d.name);
      
      // 移除不需要的节点
      nodeSelection.exit().remove();
      
      // 添加新的节点
      const newNodes = nodeSelection.enter().append("circle");
      
      // 设置新节点和更新现有节点的属性
      this.nodeElements = nodeSelection.merge(newNodes)
        .attr("class", d => {
          let classes = "node";
          
          // 增强模式：根据节点类型添加层次化样式类 - 支持四层结构
          if (this.enhancedMode.enabled) {
            if (d.label === "Course") {
              classes += " course-node";
            } else if (d.label === "Chapter") {
              classes += " chapter-node";
            } else if (d.label === "Section") {
              classes += " section-node";  // 新增节段样式类
            } else if (d.label === "KnowledgePoint") {
              classes += " knowledge-point-node";
            }
          } else {
            // 标准模式
            if (d.label === "Course") {
              classes += " course-node";
            }
          }
          
          if (this.isNodeSelected(d)) {
            classes += " selected";
          }
          
          if (preservePositions) {
            classes += " fixed-position";
          }
          
          return classes;
        })
        .attr("r", d => {
          // 超大幅放大节点，确保可以显示至少10个字
          if (this.enhancedMode.enabled) {
            if (this.enhancedMode.structureType === 'four_layer') {
              if (d.label === "Course") return 70;        // 从 45 增加到 70
              if (d.label === "Chapter") return 60;       // 从 38 增加到 60
              if (d.label === "Section") return 55;       // 从 32 增加到 55
              if (d.label === "KnowledgePoint") return 50; // 从 28 增加到 50
            } else if (this.enhancedMode.structureType === 'three_layer') {
              if (d.label === "Course") return 65;  // 从 42 增加到 65
              if (d.label === "Chapter") return 58; // 从 35 增加到 58
              if (d.label === "KnowledgePoint") return 50; // 从 28 增加到 50
            }
          }
          // 标准模式
          return d.label === "Course" ? 60 : 50; // 从 40/30 增加到 60/50
        })
        .attr("fill", d => this.getEntityColor(d.label))
        .attr("stroke", d => this.isNodeSelected(d) ? "#ff6b6b" : "#fff")
        .attr("stroke-width", d => this.isNodeSelected(d) ? 4 : 2)
        .call(d3.drag()
          .on("start", this.dragStarted)
          .on("drag", this.dragged)
          .on("end", this.dragEnded)
        );
      
      // 清理之前的事件监听器，避免重复绑定
      this.nodeElements
        .on("click", null)
        .on("dblclick", null)
        .on("contextmenu", null);
      
      // 重新绑定完整的事件监听器
      this.nodeElements
        .on("click", (event, d) => {
          event.stopPropagation();
          event.preventDefault();
          this.selectNode(d);
        })
        .on("dblclick", (event, d) => {
          event.stopPropagation();
          event.preventDefault();
          this.fixNode(d);
        })
        .on("contextmenu", (event, d) => {
          event.stopPropagation();
          event.preventDefault();
          console.log('节点右键事件触发:', d);
          this.showContextMenu(event, 'node', d);
        });
      
      // 更新节点标签 - 使用数据绑定
      let nodeLabelsGroup = this.g.select('.node-labels');
      if (nodeLabelsGroup.empty()) {
        nodeLabelsGroup = this.g.append("g").attr("class", "node-labels");
      }
      
      const nodeLabelSelection = nodeLabelsGroup.selectAll("text")
        .data(this.nodes, d => d.name);
      
      // 移除不需要的标签
      nodeLabelSelection.exit().remove();
      
      // 添加新的标签
      const newNodeLabels = nodeLabelSelection.enter().append("text");
      
      // 修复：清除旧的标签组，使用foreignObject实现多行文本
      nodeLabelsGroup.selectAll("foreignObject").remove();
      
      const nodeLabelForeignSelection = nodeLabelsGroup.selectAll("foreignObject")
        .data(this.nodes, d => d.name);
      
      // 移除不需要的标签
      nodeLabelForeignSelection.exit().remove();
      
      // 添加新的foreignObject标签
      const newNodeLabelForeign = nodeLabelForeignSelection.enter().append("foreignObject");
      
      // 设置foreignObject属性 - 支持多行文本显示
      this.nodeLabels = nodeLabelForeignSelection.merge(newNodeLabelForeign)
        .attr("class", "node-label-foreign")
        .attr("width", d => {
          // 根据节点大小设置宽度
          if (d.label === "Course") return 140;
          if (d.label === "Chapter") return 120;
          if (d.label === "Section") return 110;
          return 100;
        })
        .attr("height", d => {
          // 根据节点大小设置高度
          if (d.label === "Course") return 140;
          if (d.label === "Chapter") return 120;
          if (d.label === "Section") return 110;
          return 100;
        })
        .style("display", this.showLabels ? null : "none")
        .style("pointer-events", "none")
        .html(d => {
          // 使用HTML div实现多行文本，完整显示名称
          const fontSize = d.label === "Course" ? "15px" : 
                          d.label === "Chapter" ? "14px" : 
                          d.label === "Section" ? "13px" : "12px";
          const fontWeight = d.label === "Course" ? "bold" : "700";
          const color = this.isNodeSelected(d) ? "#ff6b6b" : "#ffffff";
          
          return `
            <div xmlns="http://www.w3.org/1999/xhtml" style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              font-size: ${fontSize};
              font-weight: ${fontWeight};
              color: ${color};
              line-height: 1.3;
              padding: 5px;
              word-wrap: break-word;
              overflow-wrap: break-word;
              text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5), 0 0 2px rgba(0, 0, 0, 0.3);
            ">
              ${d.name}
            </div>
          `;
        });
      
      // 更新连接线标签 - 使用数据绑定
      let linkLabelsGroup = this.g.select('.link-labels');
      if (linkLabelsGroup.empty()) {
        linkLabelsGroup = this.g.append("g").attr("class", "link-labels");
      }
      
      // 过滤连接线标签数据
      const linkLabelData = this.getMergedLinkLabels(this.links).filter(d => {
        // 过滤掉在课程节点上错误显示的"contains"关系
        if (d.type === "包含" || d.type === "CONTAINS") {
          const sourceNode = typeof d.source === 'object' ? d.source : this.nodes.find(n => n.name === d.source);
          const targetNode = typeof d.target === 'object' ? d.target : this.nodes.find(n => n.name === d.target);
          
          // 如果源节点和目标节点都是课程，则不显示"contains"关系
          if (sourceNode && targetNode && 
              sourceNode.label === "Course" && targetNode.label === "Course") {
            return false;
          }
        }
        return true;
      });
      
      const linkLabelSelection = linkLabelsGroup.selectAll("g")
        .data(linkLabelData, d => `${d.source.name || d.source}-${d.target.name || d.target}-${d.type}`);
      
      // 移除不需要的标签组
      linkLabelSelection.exit().remove();
      
      // 添加新的标签组
      const newLinkLabels = linkLabelSelection.enter().append("g")
        .attr("class", "link-label-group");
      
      // 合并现有和新标签组
      this.linkLabels = linkLabelSelection.merge(newLinkLabels);
      
      // 为新标签组添加背景矩形和文本
      newLinkLabels.append("rect")
        .attr("class", "link-label-bg");
      
      newLinkLabels.append("text")
        .attr("class", "link-label");
      
      // 更新所有标签组的背景矩形属性 - 增加背景和间距
      this.linkLabels.select("rect")
        .attr("class", "link-label-bg")
        .attr("x", -20)  // 从 -12 增加到 -20
        .attr("y", -12)  // 从 -8 增加到 -12
        .attr("width", 40)  // 从 24 增加到 40
        .attr("height", 24) // 从 16 增加到 24
        .attr("stroke", "#999")  // 从 #D3D3D3 改为 #999，更明显
        .attr("stroke-width", "1.5px") // 从 1px 增加到 1.5px
        .attr("fill", "rgba(255, 255, 255, 0.95)") // 从 none 改为白色半透明背景
        .attr("rx", 6)  // 从 4 增加到 6
        .style("display", this.showRelationLabels ? null : "none");
      
      // 更新所有标签组的文本属性 - 增加字体大小
      this.linkLabels.select("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("display", this.showRelationLabels ? null : "none")
        .style("font-size", "12px")  // 增加字体大小
        .style("font-weight", "500")  // 增加字重
        .style("fill", "#333")  // 设置文字颜色
        .text(d => this.translateRelationType(d.type));
      
      // 更新连接线标签位置
      this.linkLabels
        .attr("transform", d => {
          const midX = (d.source.x + d.target.x) / 2;
          const midY = (d.source.y + d.target.y) / 2;
          
          const dx = d.target.x - d.source.x;
          const dy = d.target.y - d.source.y;
          const angle = Math.atan2(dy, dx);
          
          const offset = d.offsetY || 0;
          const perpX = -Math.sin(angle) * offset;
          const perpY = Math.cos(angle) * offset;
          
          return `translate(${midX + perpX}, ${midY + perpY})`;
        });
      
      // 更新连接线标签背景的大小 - 增加内边距
      this.linkLabels.selectAll(".link-label-bg")
        .attr("width", function() {
          const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
          return textWidth + 24; // 从 16 增加到 24
        })
        .attr("x", function() {
          const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
          return -textWidth / 2 - 12; // 从 -8 增加到 -12
        })
        .attr("y", -14)  // 从 -10 增加到 -14
        .attr("height", 28); // 从 20 增加到 28
      
      // 更新仿真 - 取消边界限制，采用环形布局
      // 优化：使用节点尺寸缓存，避免重复计算
      const nodeSizeCache = new Map();
      const getNodeSize = (label) => {
        if (!nodeSizeCache.has(label)) {
          const size = label === "Course" ? 140 : 
                      label === "Chapter" ? 120 : 
                      label === "Section" ? 110 : 100;
          nodeSizeCache.set(label, size);
        }
        return nodeSizeCache.get(label);
      };
      
      // 优化：使用 requestAnimationFrame 批量更新，提升渲染性能
      let rafId = null;
      let needsUpdate = false;
      
      this.simulation.on("tick", () => {
        // 如果保持位置，只固定有原位置的节点
        if (preservePositions) {
          this.nodes.forEach(d => {
            if (nodePositions[d.name]) {
              d.fx = d.x;
              d.fy = d.y;
            }
          });
        }
        
        // 标记需要更新
        needsUpdate = true;
        
        // 如果已经有待处理的更新，跳过
        if (rafId) return;
        
        // 使用 requestAnimationFrame 批量更新 DOM
        rafId = requestAnimationFrame(() => {
          if (!needsUpdate) {
            rafId = null;
            return;
          }
          
          // 更新连接线
          this.linkElements
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
          
          // 更新节点
          this.nodeElements
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
          
          // 更新节点标签（使用缓存的尺寸）
          this.nodeLabels
            .attr("x", d => {
              const width = getNodeSize(d.label);
              return d.x - width / 2;
            })
            .attr("y", d => {
              const height = getNodeSize(d.label);
              return d.y - height / 2;
            });
          
          // 更新连接线标签
          this.linkLabels
            .attr("transform", d => {
              const midX = (d.source.x + d.target.x) / 2;
              const midY = (d.source.y + d.target.y) / 2;
              
              const dx = d.target.x - d.source.x;
              const dy = d.target.y - d.source.y;
              const angle = Math.atan2(dy, dx);
              
              const offset = d.offsetY || 0;
              const perpX = -Math.sin(angle) * offset;
              const perpY = Math.cos(angle) * offset;
              
              return `translate(${midX + perpX}, ${midY + perpY})`;
            });
          
          // 更新连接线标签背景（仅在必要时）
          if (this.simulation.alpha() > 0.1) {
            this.linkLabels.selectAll(".link-label-bg")
              .attr("width", function() {
                const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
                return textWidth + 16;
              })
              .attr("x", function() {
                const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
                return -textWidth / 2 - 8;
              })
              .attr("y", -10)
              .attr("height", 20);
          }
          
          needsUpdate = false;
          rafId = null;
        });
      });
      
      // 模拟结束时不自动缩放，保持用户当前视图
      this.simulation.on("end", () => {
        console.log('[DEBUG] Simulation ended, skipAutoFit:', skipAutoFit, 'preservePositions:', preservePositions, 'focusNodeName:', focusNodeName);

        // 如果是保持位置模式，强制恢复保存的视图变换
        if (preservePositions && savedTransform) {
          console.log('[DEBUG] 保持位置模式，强制恢复视图变换:', savedTransform);
          setTimeout(() => {
            if (this.svg && this.zoom) {
              this.svg.call(this.zoom.transform, savedTransform);
            }
          }, 100);
          return;
        }

        // 只在有明确的focusNodeName时才聚焦，否则保持当前视图
        if (focusNodeName && !skipAutoFit) {
          console.log('[DEBUG] Focusing on node:', focusNodeName);
          this.focusOnNode(focusNodeName);
        } else {
          console.log('[DEBUG] 保持当前视图，不自动缩放');
          
          // 确保视图变换保持不变
          if (savedTransform) {
            setTimeout(() => {
              if (this.svg && this.zoom) {
                this.svg.call(this.zoom.transform, savedTransform);
                console.log('[DEBUG] 恢复保存的视图变换:', savedTransform);
              }
            }, 100);
          }
        }
      });
      
      // 优化模拟器运行参数 - 快速稳定模式
      if (preservePositions) {
        // 保持位置模式：快速稳定，避免节点移动
        console.log('[DEBUG] 保持位置模式：快速稳定参数');
        this.simulation.alpha(0.3).alphaDecay(0.3).restart();
        
        // 快速停止并固定
        setTimeout(() => {
          if (this.simulation) {
            this.simulation.alpha(0).stop();
            this.fixAllNodesPosition(); // 固定所有节点位置
          }
        }, 200); // 从300ms减少到200ms
      } else {
        // 环形布局模式：快速收敛到稳定状态
        console.log('[DEBUG] 环形布局模式：快速稳定参数');
        this.simulation
          .alpha(1)
          .alphaDecay(0.1)    // 从0.015大幅增加到0.1，极快收敛
          .alphaMin(0.05)     // 从0.001增加到0.05，很早停止
          .velocityDecay(0.8) // 从0.4增加到0.8，极快减速
          .restart();
        
        // 设置自动稳定机制
        this.setupAutoStabilization();
      }
      
      if (this.isPaused) {
        this.simulation.stop();
      }
      
      // 隐藏加载中
      this.isLoading = false;
    },
    
    // 自动缩放以适应视图 - 优化为极致扩大的环形布局
    fitGraphToView() {
      console.log('[DEBUG] fitGraphToView 被调用（极致扩大环形布局版本）');
      if (!this.nodes.length) return;

      // 环形布局：计算最大半径
      let maxRadius = 0;
      this.nodes.forEach(d => {
        const radius = Math.sqrt(d.x * d.x + d.y * d.y);
        maxRadius = Math.max(maxRadius, radius);
      });

      // 添加更大的填充（考虑节点大小和标签）
      const padding = 150; // 从 100 增加到 150
      const graphRadius = maxRadius + padding;

      // 获取容器尺寸
      const containerWidth = this.$refs.graphContainer.clientWidth;
      const containerHeight = this.$refs.graphContainer.clientHeight;
      const containerSize = Math.min(containerWidth, containerHeight);

      // 计算缩放比例（确保整个圆形图谱可见，使用更小的初始缩放）
      const scale = Math.min(containerSize / (graphRadius * 2), 0.8); // 从 1.2 降低到 0.8

      // 计算平移量以使图形居中（环形布局中心在(0,0)）
      const translateX = containerWidth / 2;
      const translateY = containerHeight / 2;

      // 应用变换
      if (this.zoom) {
        console.log('[DEBUG] 应用极致扩大环形布局缩放变换:', { 
          scale, 
          translateX, 
          translateY,
          maxRadius,
          graphRadius,
          containerSize 
        });
        this.svg.transition()
          .duration(750)
          .call(this.zoom.transform, d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(scale));
      }
    },
    
    // 固定节点位置
    fixNode(node) {
      if (node.fx === null) {
        // 固定节点位置
        node.fx = node.x;
        node.fy = node.y;
        this.nodeElements.filter(d => d.id === node.id).classed("fixed", true);
      } else {
        // 释放节点位置
        node.fx = null;
        node.fy = null;
        this.nodeElements.filter(d => d.id === node.id).classed("fixed", false);
      }
    },
    
    // 高亮显示节点及其连接
    highlightNode(nodeName) {
      if (!this.nodeElements || !this.linkElements || !this.nodeLabels) return;
      
      // 重置所有元素
      this.nodeElements.classed("highlighted", false).interrupt().attr("stroke-width", 0);
      this.nodeLabels.classed("highlighted", false).interrupt().style("fill", "black");
      
      if (!nodeName) return;
      
      // 高亮目标节点
      this.nodeElements.filter(d => d.name === nodeName).classed("highlighted", true).attr("stroke-width", 2).style("stroke", "red");
      this.nodeLabels.filter(d => d.name === nodeName).classed("highlighted", true).style("fill", "red");
      
      // 高亮相关连接
      const relatedLinks = this.links.filter(link => 
        link.source.name === nodeName || link.target.name === nodeName
      );
      
      // 获取相关节点名称
      const relatedNodeNames = new Set();
      relatedLinks.forEach(link => {
        if (link.source.name === nodeName) {
          relatedNodeNames.add(link.target.name);
        } else {
          relatedNodeNames.add(link.source.name);
        }
      });
      
      // 高亮相关节点
      this.nodeElements.filter(d => relatedNodeNames.has(d.name)).classed("highlighted", true).attr("stroke-width", 2).style("stroke", "red");
      this.nodeLabels.filter(d => relatedNodeNames.has(d.name)).classed("highlighted", true).style("fill", "red");
    },
    
    // 拖拽事件处理
    dragStarted(event, d) {
      if (!event.active) this.simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    },
    
    dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    },
    
    dragEnded(event, d) {
      if (!event.active) this.simulation.alphaTarget(0);
    },
    
    // 显示属性面板
    showProperties(node) {
      console.log('[PROPERTIES] 显示属性面板，节点数据:', node);
      this.selectedNode = node;
      this.highlightNode(node.name);

      // 自动加载学习资料
      this.refreshMaterials();
      
      // 强制Vue重新渲染属性面板
      this.$nextTick(() => {
        console.log('[PROPERTIES] 属性面板已更新，当前选中节点:', this.selectedNode);
      });
    },
    
    // 关闭属性面板
    closePropertiesPanel() {
      this.selectedNode = null;
      this.highlightNode(null);
    },
    
    // 搜索特定节点
    async searchNode(nodeName) {
      if (!nodeName || !nodeName.trim()) return;

      this.isLoading = true;
      const queryToSend = 'search ' + nodeName.trim();

      console.log('搜索节点:', queryToSend);

      try {
        const response = await fetch(`${this.baseUrl}query/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({ query: queryToSend })
        });

        const data = await response.json();

        if (data.success) {
          await this.updateGraph(data, false, false, false);

          // 延迟一段时间后聚焦到新节点
          setTimeout(() => {
            this.focusOnNode(nodeName);
          }, 500);

          console.log('节点搜索和聚焦完成');
        } else {
          console.error('搜索节点失败:', data.error);
          // 不显示错误提示，因为这是自动操作
        }
      } catch (error) {
        console.error('搜索节点失败:', error);
        // 不显示错误提示，因为这是自动操作
      }

      this.isLoading = false;
    },

    // 聚焦到特定节点
    focusOnNode(nodeName) {
      if (!this.nodes || !nodeName) return;

      // 查找目标节点
      const targetNode = this.nodes.find(node => node.name === nodeName);
      if (!targetNode) {
        console.log('未找到节点:', nodeName);
        return;
      }

      // 选中该节点
      this.selectNode(targetNode);

      // 自动缩放到该节点
      if (this.zoom && this.svg) {
        // 获取SVG元素的实际可视区域尺寸
        const svgElement = this.svg.node();
        const svgRect = svgElement.getBoundingClientRect();
        const containerWidth = svgRect.width;
        const containerHeight = svgRect.height;

        // 放大倍数
        const scale = 2.5;
        
        // 关键修复：大幅调整视觉中心位置
        // 如果节点显示在右下角，说明需要向左上方大幅偏移
        // 测试用：先使用极大的偏移量来验证方向
        const offsetX = -1200;  // 向左偏移300px（负值 = 向左）
        const offsetY = -800;  // 向上偏移200px（负值 = 向上）
        
        // 计算视觉中心（从几何中心偏移）
        const visualCenterX = containerWidth / 2 + offsetX;
        const visualCenterY = containerHeight / 2 + offsetY;
        
        // 计算平移量：让节点的缩放后位置对齐到视觉中心
        const translateX = visualCenterX - targetNode.x * scale;
        const translateY = visualCenterY - targetNode.y * scale;

        console.log('[FOCUS NODE] 聚焦参数（大偏移测试）:', {
          nodeName: nodeName,
          nodePosition: { x: targetNode.x, y: targetNode.y },
          svgSize: { width: containerWidth, height: containerHeight },
          scale: scale,
          geometricCenter: { 
            x: containerWidth / 2, 
            y: containerHeight / 2 
          },
          offset: {
            x: offsetX,
            y: offsetY,
            description: '负值=向左上，正值=向右下'
          },
          visualCenter: { 
            x: visualCenterX, 
            y: visualCenterY 
          },
          scaledNodePosition: { 
            x: targetNode.x * scale, 
            y: targetNode.y * scale 
          },
          finalTranslate: { 
            x: translateX, 
            y: translateY 
          }
        });

        // 应用变换
        this.svg.transition()
          .duration(1000)
          .ease(d3.easeCubicInOut)
          .call(this.zoom.transform, d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(scale));
      }

      console.log('已聚焦到节点:', nodeName);
    },

    // 执行查询
    executeQuery() {
      if (!this.queryText.trim()) return;

      this.isLoading = true;

      // 智能识别查询类型
      let queryToSend = this.queryText.trim();

      // 如果不是预设查询命令，则当作实体名称搜索
      const presetCommands = [
        '显示所有知识点',
        '显示所有课程',
        '显示整个知识图谱'
      ];

      if (!presetCommands.includes(queryToSend)) {
        // 如果不是预设命令，当作实体名称搜索
        queryToSend = 'search ' + queryToSend;
      }

      console.log('发送查询:', queryToSend);

      // 真实的API请求
      fetch(`${this.baseUrl}query/`, {
          method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCsrfToken()
        },
        body: JSON.stringify({ query: queryToSend })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            // 查询结果时允许自动适应视图，因为这是用户主动的查询操作
            this.updateGraph(data, false, false, false);
          } else {
            this.showError('查询错误: ' + data.error);
          }
        this.isLoading = false;
        })
        .catch(error => {
        console.error('查询失败:', error);
        alert('查询失败，请检查网络连接');
                    this.isLoading = false;
                });
        // const mockData = {
        //   nodes: [
        //     { id: 1, name: '算法', label: 'KnowledgePoint', properties: { description: '解决问题的步骤和方法' } },
        //     { id: 2, name: '数据结构', label: 'KnowledgePoint', properties: { description: '数据的组织方式' } },
        //     { id: 3, name: '计算机网络', label: 'KnowledgePoint' },
        //     { id: 4, name: '操作系统', label: 'KnowledgePoint' },
        //     { id: 5, name: '计算机科学导论', label: 'Course' },
        //     { id: 6, name: '人工智能', label: 'KnowledgePoint' }
        //   ],
        //   relationships: [
        //     { id: 1, type: 'PREREQUISITE', source: 2, target: 1 },
        //     { id: 2, type: 'RELATED_TO', source: 1, target: 6 },
        //     { id: 3, type: 'CONTAINS', source: 5, target: 1 },
        //     { id: 4, type: 'CONTAINS', source: 5, target: 2 },
        //     { id: 5, type: 'RELATED_TO', source: 3, target: 4 }
        //   ],
        //   success: true
        // };
        
        // this.updateGraph(mockData);
    },
    
    // 切换课程下拉框
    toggleCourseDropdown() {
      this.courseDropdownOpen = !this.courseDropdownOpen;
      if (this.courseDropdownOpen) {
        this.chapterDropdownOpen = false;
      }
    },
    
    // 切换章节下拉框
    toggleChapterDropdown() {
      this.chapterDropdownOpen = !this.chapterDropdownOpen;
      if (this.chapterDropdownOpen) {
        this.courseDropdownOpen = false;
      }
    },
    
    // 选择课程
    async selectCourse(courseName) {
      this.selectedCourse = courseName;
      this.courseDropdownOpen = false;
      await this.onCourseChange();
    },
    
    // 选择章节
    async selectChapter(chapterName) {
      console.log('[SELECT CHAPTER] 点击章节:', chapterName, '上次点击:', this.lastClickedChapter);
      
      // 如果点击的是"显示全部"
      if (!chapterName) {
        this.selectedChapter = '';
        this.lastClickedChapter = '';
        this.chapterDropdownOpen = false;
        await this.onChapterChange();
        return;
      }
      
      // 检查是否是第二次点击同一个章节
      if (this.lastClickedChapter === chapterName) {
        // 第二次点击：跳转到独立的章节视图
        console.log('[SELECT CHAPTER] 第二次点击，跳转到独立章节视图');
        this.chapterDropdownOpen = false;
        this.selectedChapter = chapterName;
        this.showSuccess(`🎯 正在加载章节《${chapterName}》的详细内容...`);
        
        // 修复：在加载章节视图前，重置视图状态到原始位置
        console.log('[SELECT CHAPTER] 重置视图状态到原始位置');
        if (this.svg && this.zoom) {
          try {
            // 重置缩放和平移到初始状态
            this.svg.transition()
              .duration(300)
              .call(this.zoom.transform, d3.zoomIdentity);
          } catch (error) {
            console.warn('[SELECT CHAPTER] 重置视图状态失败:', error);
          }
        }
        
        // 等待视图重置完成后再加载章节数据
        await new Promise(resolve => setTimeout(resolve, 350));
        await this.onChapterChange();
        this.lastClickedChapter = ''; // 重置状态
      } else {
        // 第一次点击：在当前课程图谱中聚焦并高亮该章节
        console.log('[SELECT CHAPTER] 第一次点击，聚焦并高亮章节');
        
        // 修复：第一次点击时就更新 selectedChapter，让查询框显示选中的章节
        this.selectedChapter = chapterName;
        
        // 先检查当前是否有图谱数据
        if (!this.nodes || this.nodes.length === 0) {
          this.showWarning(`⚠️ 请先选择课程以加载知识图谱`);
          this.chapterDropdownOpen = false;
          return;
        }
        
        // 在当前图谱中查找并聚焦该章节节点
        const chapterNode = this.nodes.find(node => 
          node.name === chapterName && node.label === 'Chapter'
        );
        
        if (chapterNode) {
          // 记录点击状态（但不关闭下拉框，让用户看到提示）
          this.lastClickedChapter = chapterName;
          
          // 延迟关闭下拉框，让用户看到状态变化
          setTimeout(() => {
            this.chapterDropdownOpen = false;
          }, 300);
          
          // 聚焦到该节点
          this.focusOnNode(chapterName);
          
          // 显示友好的提示
          this.showSuccess(`📍 已定位到章节《${chapterName}》\n💡 提示：再次点击该章节可查看详细内容`);
        } else {
          // 如果当前图谱中没有该章节，直接跳转到章节视图
          console.log('[SELECT CHAPTER] 当前图谱中未找到章节，直接加载章节视图');
          this.chapterDropdownOpen = false;
          this.lastClickedChapter = '';
          this.showSuccess(`🎯 正在加载章节《${chapterName}》...`);
          await this.onChapterChange();
        }
      }
    },
    
    // 课程选择变化
    async onCourseChange() {
      console.log('[COURSE CHANGE] 课程选择变化:', this.selectedCourse);
      
      // 重置章节点击状态
      this.lastClickedChapter = '';
      
      if (!this.selectedCourse) {
        this.chapterList = [];
        this.selectedChapter = '';
        return;
      }
      
      // 加载该课程的章节列表
      await this.loadChapterList(this.selectedCourse);
      
      // 自动查询该课程的知识图谱
      await this.queryCourse(this.selectedCourse);
    },
    
    // 章节选择变化
    async onChapterChange() {
      console.log('[CHAPTER CHANGE] 章节选择变化:', this.selectedChapter);
      
      if (!this.selectedChapter) {
        // 如果取消选择章节，显示整个课程
        await this.queryCourse(this.selectedCourse);
      } else {
        // 查询特定章节（使用星型放射布局）
        await this.queryChapterWithStarLayout(this.selectedChapter);
      }
    },
    
    // 执行搜索
    async executeSearch() {
      if (!this.searchKeyword.trim()) {
        this.showWarning('请输入搜索关键词');
        return;
      }
      
      this.isLoading = true;
      const searchKeyword = this.searchKeyword.trim();
      const queryToSend = 'search ' + searchKeyword;
      
      try {
        const response = await fetch(`${this.baseUrl}query/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({ query: queryToSend })
        });
        
        const data = await response.json();
        
        if (data.success && data.nodes && data.nodes.length > 0) {
          // 过滤搜索结果，只保留知识点节点及其直接相关的节点
          const filteredData = this.filterSearchResults(data);
          
          if (filteredData.nodes.length > 0) {
            // 设置布局模式为紧凑搜索模式
            this.currentLayoutMode = 'compact_search';
            
            // 应用紧凑布局
            this.applyCompactSearchLayout(filteredData, searchKeyword);
            
            // 使用紧凑布局更新图谱
            await this.updateGraphWithCompactLayout(filteredData, searchKeyword);
            
            const knowledgePointCount = filteredData.nodes.filter(n => n.label === 'KnowledgePoint').length;
            this.showSuccess(`找到 ${knowledgePointCount} 个知识点及其相关节点`);
          } else {
            this.showWarning('未找到匹配的知识点');
          }
        } else {
          this.showWarning('未找到匹配的知识点');
        }
      } catch (error) {
        console.error('[SEARCH] 搜索失败:', error);
        this.showError('搜索失败: ' + error.message);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 过滤搜索结果，只保留知识点及其相关节点
    filterSearchResults(data) {
      console.log('[FILTER SEARCH] 开始过滤搜索结果');
      
      if (!data || !data.nodes) {
        return { nodes: [], relationships: [] };
      }
      
      // 1. 找出所有知识点节点
      const knowledgePointNodes = data.nodes.filter(node => node.label === 'KnowledgePoint');
      
      if (knowledgePointNodes.length === 0) {
        console.log('[FILTER SEARCH] 未找到知识点节点');
        return { nodes: [], relationships: [] };
      }
      
      // 2. 创建知识点节点ID集合
      const knowledgePointIds = new Set(knowledgePointNodes.map(n => n.id || n.name));
      
      // 3. 找出与知识点直接相关的节点（通过关系连接）
      const relatedNodeIds = new Set(knowledgePointIds);
      const relationships = data.relationships || data.relations || [];
      
      relationships.forEach(rel => {
        const sourceId = typeof rel.source === 'object' ? (rel.source.id || rel.source.name) : rel.source;
        const targetId = typeof rel.target === 'object' ? (rel.target.id || rel.target.name) : rel.target;
        
        // 如果关系的一端是知识点，将另一端也加入
        if (knowledgePointIds.has(sourceId)) {
          relatedNodeIds.add(targetId);
        }
        if (knowledgePointIds.has(targetId)) {
          relatedNodeIds.add(sourceId);
        }
      });
      
      // 4. 过滤节点：只保留知识点和与知识点直接相关的节点
      const filteredNodes = data.nodes.filter(node => {
        const nodeId = node.id || node.name;
        return relatedNodeIds.has(nodeId);
      });
      
      // 5. 进一步过滤：排除课程、章、节节点（除非它们与知识点有直接关系）
      const finalNodes = filteredNodes.filter(node => {
        // 保留所有知识点
        if (node.label === 'KnowledgePoint') {
          return true;
        }
        
        // 对于非知识点节点，检查是否与知识点有直接关系
        const nodeId = node.id || node.name;
        let hasDirectRelationWithKP = false;
        
        relationships.forEach(rel => {
          const sourceId = typeof rel.source === 'object' ? (rel.source.id || rel.source.name) : rel.source;
          const targetId = typeof rel.target === 'object' ? (rel.target.id || rel.target.name) : rel.target;
          
          if ((sourceId === nodeId && knowledgePointIds.has(targetId)) ||
              (targetId === nodeId && knowledgePointIds.has(sourceId))) {
            hasDirectRelationWithKP = true;
          }
        });
        
        // 只保留与知识点有直接关系的非知识点节点
        // 但排除课程、章、节节点（它们通常是层次结构，不是知识点的直接相关内容）
        if (node.label === 'Course' || node.label === 'Chapter' || node.label === 'Section') {
          return false;
        }
        
        return hasDirectRelationWithKP;
      });
      
      // 6. 创建最终节点ID集合
      const finalNodeIds = new Set(finalNodes.map(n => n.id || n.name));
      
      // 7. 过滤关系：只保留两端都在最终节点集合中的关系
      const filteredRelationships = relationships.filter(rel => {
        const sourceId = typeof rel.source === 'object' ? (rel.source.id || rel.source.name) : rel.source;
        const targetId = typeof rel.target === 'object' ? (rel.target.id || rel.target.name) : rel.target;
        return finalNodeIds.has(sourceId) && finalNodeIds.has(targetId);
      });
      
      console.log('[FILTER SEARCH] 过滤完成:', {
        原始节点数: data.nodes.length,
        知识点数: knowledgePointNodes.length,
        最终节点数: finalNodes.length,
        最终关系数: filteredRelationships.length
      });
      
      return {
        nodes: finalNodes,
        relationships: filteredRelationships,
        relations: filteredRelationships, // 兼容性字段
        success: true
      };
    },
    
    // 应用紧凑搜索布局
    applyCompactSearchLayout(data, searchKeyword) {
      console.log('[COMPACT LAYOUT] 应用紧凑搜索布局，搜索关键词:', searchKeyword);
      
      if (!data || !data.nodes || data.nodes.length === 0) {
        return;
      }
      
      // 找到匹配搜索关键词的主要节点
      const mainNodes = data.nodes.filter(node => 
        node.name && node.name.toLowerCase().includes(searchKeyword.toLowerCase())
      );
      
      // 如果没有直接匹配的节点，使用第一个知识点作为主节点
      const primaryNode = mainNodes.length > 0 ? mainNodes[0] : data.nodes.find(n => n.label === 'KnowledgePoint');
      
      if (!primaryNode) {
        console.warn('[COMPACT LAYOUT] 未找到主节点');
        return;
      }
      
      // 获取容器尺寸（使用较小的尺寸以实现紧凑布局）
      const containerWidth = this.$refs.graphContainer ? this.$refs.graphContainer.clientWidth : 800;
      const containerHeight = this.$refs.graphContainer ? this.$refs.graphContainer.clientHeight : 600;
      const compactSize = Math.min(containerWidth, containerHeight) * 0.4; // 紧凑系数 0.4
      
      // 主节点位于中心
      primaryNode.x = 0;
      primaryNode.y = 0;
      primaryNode.fx = 0;
      primaryNode.fy = 0;
      primaryNode._isPrimary = true; // 标记为主节点
      
      // 其他节点
      const otherNodes = data.nodes.filter(node => node !== primaryNode);
      
      if (otherNodes.length === 0) {
        return;
      }
      
      // 根据节点数量决定布局半径
      const baseRadius = compactSize * 0.6;
      const nodeCount = otherNodes.length;
      
      // 如果节点较多，使用多层圆环布局
      if (nodeCount > 8) {
        const innerRing = otherNodes.slice(0, 8);
        const outerRing = otherNodes.slice(8);
        
        // 内圈
        const innerAngleStep = (2 * Math.PI) / innerRing.length;
        innerRing.forEach((node, index) => {
          const angle = index * innerAngleStep - Math.PI / 2;
          node.x = baseRadius * Math.cos(angle);
          node.y = baseRadius * Math.sin(angle);
        });
        
        // 外圈
        if (outerRing.length > 0) {
          const outerAngleStep = (2 * Math.PI) / outerRing.length;
          outerRing.forEach((node, index) => {
            const angle = index * outerAngleStep - Math.PI / 2;
            node.x = baseRadius * 1.6 * Math.cos(angle);
            node.y = baseRadius * 1.6 * Math.sin(angle);
          });
        }
      } else {
        // 单层圆环布局
        const angleStep = (2 * Math.PI) / nodeCount;
        otherNodes.forEach((node, index) => {
          const angle = index * angleStep - Math.PI / 2;
          node.x = baseRadius * Math.cos(angle);
          node.y = baseRadius * Math.sin(angle);
        });
      }
      
      console.log('[COMPACT LAYOUT] 紧凑布局应用完成:', {
        主节点: primaryNode.name,
        其他节点数: otherNodes.length,
        紧凑半径: baseRadius
      });
    },
    
    // 使用紧凑布局更新图谱
    async updateGraphWithCompactLayout(data, searchKeyword) {
      console.log('[COMPACT UPDATE] 使用紧凑布局更新图谱');
      
      this.isLoading = true;
      this.originalData = data;
      
      const limitedData = this.limitNodes(data, this.nodeLimit);
      
      if (!this.g) {
        this.g = this.initSvg(false);
      }
      
      // 标准化连接线数据
      const normalizedLinks = limitedData.relationships.map(link => {
        const relationType = link.relation_type || link.type;
        const source = typeof link.source === 'object' ? link.source.name : link.source;
        const target = typeof link.target === 'object' ? link.target.name : link.target;
        
        if (relationType === 'BELONGS_TO_SECTION' || relationType === 'BELONGS_TO') {
          return { ...link, source: target, target: source, relation_type: relationType, type: relationType };
        }
        
        return { ...link, source: source, target: target };
      });
      
      this.nodes = limitedData.nodes;
      this.links = normalizedLinks;
      
      if (this.simulation) {
        this.simulation.stop();
      }
      
      const containerWidth = this.$refs.graphContainer.clientWidth;
      const containerHeight = this.$refs.graphContainer.clientHeight;
      
      // 创建紧凑布局的模拟器
      this.simulation = d3.forceSimulation(this.nodes)
        .force("link", d3.forceLink(this.links).id(d => d.name)
          .distance(d => {
            // 紧凑布局：较短的连接距离
            if (d.source._isPrimary || d.target._isPrimary) {
              return 150; // 主节点连接距离
            }
            return 100; // 其他连接距离
          })
          .strength(0.5) // 较强的连接力
        )
        .force("charge", d3.forceManyBody()
          .strength(d => {
            if (d._isPrimary) return -1000; // 从 -1500 减少，加快收敛
            return -300; // 从 -400 减少
          })
          .distanceMax(600) // 限制斥力作用范围，提升性能
        )
        .force("center", d3.forceCenter(0, 0).strength(0.1))
        .force("collide", d3.forceCollide()
          .radius(d => d.label === 'KnowledgePoint' ? 60 : 50)
          .strength(0.8) // 从 0.9 减少到 0.8
          .iterations(3) // 从 5 减少到 3，提升性能
        );

      // 更新DOM元素（复用之前的代码）
      this.updateGraphElements();
      
      // 模拟器tick事件
      this.simulation.on("tick", () => {
        this.updateElementPositions();
      });
      
      // 启动模拟器 - 快速稳定模式
      this.simulation
        .alpha(1)
        .alphaDecay(0.08) // 从 0.03 增加到 0.08，更快收敛
        .alphaMin(0.02)   // 更早停止
        .velocityDecay(0.7) // 更快减速
        .restart();
      
      // 设置自动稳定机制
      this.setupAutoStabilization();
      
      if (this.isPaused) {
        this.simulation.stop();
      }
      
      this.isLoading = false;
      console.log('[COMPACT UPDATE] 紧凑布局更新完成');
    },
    
    // 更新图谱元素（复用方法）
    updateGraphElements() {
      // 更新连接线
      let linksGroup = this.g.select('.links');
      if (linksGroup.empty()) {
        linksGroup = this.g.append("g").attr("class", "links");
      }
      
      const linkSelection = linksGroup.selectAll("line")
        .data(this.links, d => `${d.source}-${d.target}-${d.type}`);
      
      linkSelection.exit().remove();
      const newLinks = linkSelection.enter().append("line");
      
      this.linkElements = linkSelection.merge(newLinks)
        .attr("class", "link")
        .attr("stroke", "#999")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrowhead)")
        .style("cursor", "pointer")
        .on("click", (event, d) => {
          event.stopPropagation();
          this.selectLink(d);
        });
      
      // 更新连接线标签（修复：正确处理标签显示）
      let linkLabelsGroup = this.g.select('.link-labels');
      if (linkLabelsGroup.empty()) {
        linkLabelsGroup = this.g.append("g").attr("class", "link-labels");
      }
      
      // 清除所有旧标签
      linkLabelsGroup.selectAll("g").remove();
      
      // 获取合并的连接标签数据
      const linkLabelData = this.getMergedLinkLabels(this.links);
      
      const linkLabelSelection = linkLabelsGroup.selectAll("g")
        .data(linkLabelData, d => `${d.source.name || d.source}-${d.target.name || d.target}-${d.type}`);
      
      linkLabelSelection.exit().remove();
      const newLinkLabels = linkLabelSelection.enter().append("g").attr("class", "link-label-group");
      this.linkLabels = linkLabelSelection.merge(newLinkLabels);
      
      newLinkLabels.append("rect").attr("class", "link-label-bg");
      newLinkLabels.append("text").attr("class", "link-label");
      
      this.linkLabels.select("rect")
        .attr("class", "link-label-bg")
        .attr("x", -12).attr("y", -8).attr("width", 24).attr("height", 16)
        .attr("stroke", "#D3D3D3").attr("stroke-width", "1px")
        .attr("fill", "none").attr("rx", 4)
        .style("display", this.showRelationLabels ? null : "none");
      
      this.linkLabels.select("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle").attr("dy", ".35em")
        .style("display", this.showRelationLabels ? null : "none")
        .text(d => this.translateRelationType(d.type));
      
      this.linkLabels.selectAll(".link-label-bg")
        .attr("width", function() {
          const text = this.parentNode.querySelector("text");
          return text ? text.getComputedTextLength() + 16 : 24;
        })
        .attr("x", function() {
          const text = this.parentNode.querySelector("text");
          const textWidth = text ? text.getComputedTextLength() : 0;
          return -textWidth / 2 - 8;
        })
        .attr("y", -10).attr("height", 20);
      
      // 更新节点
      let nodesGroup = this.g.select('.nodes');
      if (nodesGroup.empty()) {
        nodesGroup = this.g.append("g").attr("class", "nodes");
      }
      
      const nodeSelection = nodesGroup.selectAll("circle")
        .data(this.nodes, d => d.name);
      
      nodeSelection.exit().remove();
      const newNodes = nodeSelection.enter().append("circle");
      
      this.nodeElements = nodeSelection.merge(newNodes)
        .attr("class", d => {
          let classes = "node knowledge-point-node";
          if (this.isNodeSelected(d)) classes += " selected";
          return classes;
        })
        .attr("r", 50)
        .attr("fill", d => this.getEntityColor(d.label))
        .attr("stroke", d => this.isNodeSelected(d) ? "#ff6b6b" : "#fff")
        .attr("stroke-width", d => this.isNodeSelected(d) ? 4 : 2)
        .style("cursor", "pointer")
        .call(d3.drag()
          .on("start", this.dragStarted)
          .on("drag", this.dragged)
          .on("end", this.dragEnded)
        )
        .on("click", (event, d) => {
          event.stopPropagation();
          this.selectNode(d);
        })
        .on("contextmenu", (event, d) => {
          event.stopPropagation();
          event.preventDefault();
          this.showContextMenu(event, 'node', d);
        });
      
      // 更新节点标签
      let nodeLabelsGroup = this.g.select('.node-labels');
      if (nodeLabelsGroup.empty()) {
        nodeLabelsGroup = this.g.append("g").attr("class", "node-labels");
      }
      
      nodeLabelsGroup.selectAll("text").remove();
      
      const nodeLabelSelection = nodeLabelsGroup.selectAll("foreignObject")
        .data(this.nodes, d => d.name);
      
      nodeLabelSelection.exit().remove();
      const newNodeLabels = nodeLabelSelection.enter().append("foreignObject");
      
      this.nodeLabels = nodeLabelSelection.merge(newNodeLabels)
        .attr("class", "node-label-foreign")
        .attr("width", 100)
        .attr("height", 100)
        .style("display", this.showLabels ? null : "none")
        .style("pointer-events", "none")
        .html(d => {
          const fontSize = "13px";
          const fontWeight = "600";
          const color = this.isNodeSelected(d) ? "#ff6b6b" : "#ffffff";
          
          return `
            <div xmlns="http://www.w3.org/1999/xhtml" style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              font-size: ${fontSize};
              font-weight: ${fontWeight};
              color: ${color};
              line-height: 1.3;
              padding: 5px;
              word-wrap: break-word;
              overflow-wrap: break-word;
              text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5), 0 0 2px rgba(0, 0, 0, 0.3);
            ">
              ${d.name}
            </div>
          `;
        });
    },
    
    // 更新元素位置
    // 优化：使用 requestAnimationFrame 批量更新元素位置
    updateElementPositions() {
      // 如果已经有待处理的更新，跳过
      if (this._rafUpdateId) return;
      
      this._rafUpdateId = requestAnimationFrame(() => {
        if (this.linkElements) {
          this.linkElements
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        }
        
        if (this.nodeElements) {
          this.nodeElements
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
        }
        
        if (this.nodeLabels) {
          this.nodeLabels
            .attr("x", d => d.x - 50)
            .attr("y", d => d.y - 50);
        }
        
        // 更新连接线标签位置
        if (this.linkLabels) {
          this.linkLabels
            .attr("transform", d => {
              const midX = (d.source.x + d.target.x) / 2;
              const midY = (d.source.y + d.target.y) / 2;
              const dx = d.target.x - d.source.x;
              const dy = d.target.y - d.source.y;
              const angle = Math.atan2(dy, dx);
              const offset = d.offsetY || 0;
              const perpX = -Math.sin(angle) * offset;
              const perpY = Math.cos(angle) * offset;
              return `translate(${midX + perpX}, ${midY + perpY})`;
            });
          
          // 优化：仅在模拟器活跃时更新标签背景
          if (this.simulation && this.simulation.alpha() > 0.1) {
            this.linkLabels.selectAll(".link-label-bg")
              .attr("width", function() {
                const text = this.parentNode.querySelector("text");
                return text ? text.getComputedTextLength() + 16 : 24;
              })
              .attr("x", function() {
                const text = this.parentNode.querySelector("text");
                const textWidth = text ? text.getComputedTextLength() : 0;
                return -textWidth / 2 - 8;
              })
              .attr("y", -10).attr("height", 20);
          }
        }
        
        this._rafUpdateId = null;
      });
    },
    
    // 过滤课程列表
    filterCourseList() {
      if (!this.courseSearchKeyword.trim()) {
        this.filteredCourseList = this.courseList;
      } else {
        const keyword = this.courseSearchKeyword.toLowerCase();
        this.filteredCourseList = this.courseList.filter(course => 
          course.name.toLowerCase().includes(keyword)
        );
      }
    },
    
    // 过滤章节列表
    filterChapterList() {
      if (!this.chapterSearchKeyword.trim()) {
        this.filteredChapterList = this.chapterList;
      } else {
        const keyword = this.chapterSearchKeyword.toLowerCase();
        this.filteredChapterList = this.chapterList.filter(chapter => 
          chapter.name.toLowerCase().includes(keyword)
        );
      }
    },
    
    // 获取章节点击提示
    getChapterClickHint(chapterName) {
      if (this.lastClickedChapter === chapterName) {
        return '再次点击查看该章节的详细内容';
      } else {
        return '点击在当前图谱中聚焦定位该章节';
      }
    },
    
    // 加载章节列表
    async loadChapterList(courseName) {
      console.log('[LOAD CHAPTERS] 加载课程章节:', courseName);
      
      try {
        const response = await fetch(`${this.baseUrl}get_course_chapters/?course=${encodeURIComponent(courseName)}`);
        const data = await response.json();
        
        if (data.success && data.chapters) {
          this.chapterList = data.chapters;
          this.filteredChapterList = data.chapters;
          this.chapterSearchKeyword = '';
          console.log('[LOAD CHAPTERS] 章节列表:', this.chapterList);
        } else {
          this.chapterList = [];
          this.filteredChapterList = [];
          console.warn('[LOAD CHAPTERS] 未找到章节');
        }
      } catch (error) {
        console.error('[LOAD CHAPTERS] 加载章节失败:', error);
        this.chapterList = [];
        this.filteredChapterList = [];
      }
    },
    
    // 查询课程
    async queryCourse(courseName) {
      console.log('[QUERY COURSE] 查询课程:', courseName);
      this.isLoading = true;
      
      try {
        // 重置布局模式为环形
        this.currentLayoutMode = 'circular';
        
        const queryToSend = 'search ' + courseName;
        console.log('[QUERY COURSE] 发送查询:', queryToSend);
        
        const response = await fetch(`${this.baseUrl}query/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({ query: queryToSend })
        });
        
        const data = await response.json();
        console.log('[QUERY COURSE] 收到响应:', {
          success: data.success,
          nodeCount: data.nodes ? data.nodes.length : 0,
          relationshipCount: data.relationships ? data.relationships.length : 0,
          error: data.error
        });
        
        if (data.success && data.nodes && data.nodes.length > 0) {
          console.log('[QUERY COURSE] 节点类型分布:', 
            data.nodes.reduce((acc, node) => {
              acc[node.label] = (acc[node.label] || 0) + 1;
              return acc;
            }, {})
          );
          
          // 检查节点限制
          if (data.nodes.length > this.nodeLimit) {
            console.warn(`[QUERY COURSE] 节点数量(${data.nodes.length})超过限制(${this.nodeLimit})，将被截断`);
          }
          
          await this.updateGraph(data, false, false, false);
          this.showSuccess(`已加载课程《${courseName}》的知识图谱（${data.nodes.length}个节点）`);
        } else {
          console.warn('[QUERY COURSE] 未找到课程数据或数据为空');
          this.showWarning('未找到课程数据');
        }
      } catch (error) {
        console.error('[QUERY COURSE] 查询失败:', error);
        this.showError('查询失败: ' + error.message);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 查询章节
    async queryChapter(chapterName) {
      console.log('[QUERY CHAPTER] 查询章节:', chapterName);
      this.isLoading = true;
      
      try {
        const queryToSend = 'search ' + chapterName;
        const response = await fetch(`${this.baseUrl}query/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({ query: queryToSend })
        });
        
        const data = await response.json();
        
        if (data.success && data.nodes && data.nodes.length > 0) {
          await this.updateGraph(data, false, false, false);
          this.showSuccess(`已加载章节《${chapterName}》的知识图谱`);
        } else {
          this.showWarning('未找到章节数据');
        }
      } catch (error) {
        console.error('[QUERY CHAPTER] 查询失败:', error);
        this.showError('查询失败: ' + error.message);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 查询章节（使用星型放射布局）
    async queryChapterWithStarLayout(chapterName) {
      console.log('[QUERY CHAPTER STAR] 查询章节:', chapterName);
      this.isLoading = true;
      
      try {
        const queryToSend = 'search ' + chapterName;
        const response = await fetch(`${this.baseUrl}query/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({ query: queryToSend })
        });
        
        const data = await response.json();
        
        if (data.success && data.nodes && data.nodes.length > 0) {
          // 设置布局模式为星型
          this.currentLayoutMode = 'star';
          // 应用星型放射布局
          this.applyStarLayout(data, chapterName);
          // 使用星型布局模式更新图谱（不自动聚焦，让布局自然展示）
          await this.updateGraphWithStarLayout(data, chapterName);
          this.showSuccess(`已加载章节《${chapterName}》的知识图谱`);
        } else {
          this.showWarning('未找到章节数据');
        }
      } catch (error) {
        console.error('[QUERY CHAPTER STAR] 查询失败:', error);
        this.showError('查询失败: ' + error.message);
      } finally {
        this.isLoading = false;
      }
    },
    
    // 使用星型布局更新图谱
    async updateGraphWithStarLayout(data, centerNodeName) {
      console.log('[STAR UPDATE] 使用星型布局更新图谱');
      
      // 显示加载中
      this.isLoading = true;

      // 保存原始数据
      this.originalData = data;
      
      // 限制节点数量
      const limitedData = this.limitNodes(data, this.nodeLimit);
      
      // 初始化SVG（不保持变换）
      if (!this.g) {
        this.g = this.initSvg(false);
      }
      
      // 标准化连接线数据格式
      const normalizedLinks = limitedData.relationships.map(link => {
        const relationType = link.relation_type || link.type;
        const source = typeof link.source === 'object' ? link.source.name : link.source;
        const target = typeof link.target === 'object' ? link.target.name : link.target;
        
        if (relationType === 'BELONGS_TO_SECTION' || relationType === 'BELONGS_TO') {
          return {
            ...link,
            source: target,
            target: source,
            relation_type: relationType,
            type: relationType
          };
        }
        
        return {
          ...link,
          source: source,
          target: target
        };
      });
      
      // 更新数据
      this.nodes = limitedData.nodes;
      this.links = normalizedLinks;
      
      // 停止之前的模拟
      if (this.simulation) {
        this.simulation.stop();
      }
      
      // 获取容器尺寸
      const containerWidth = this.$refs.graphContainer.clientWidth;
      const containerHeight = this.$refs.graphContainer.clientHeight;
      const layoutWidth = Math.max(containerWidth, containerWidth * 4);
      const layoutHeight = Math.max(containerHeight, containerHeight * 4);
      
      // 找到中心节点
      const centerNode = this.nodes.find(n => n.name === centerNodeName);
      
      // 构建节段-知识点映射（用于角度约束）
      const sectionNodes = this.nodes.filter(n => n.label === 'Section');
      const knowledgePointNodes = this.nodes.filter(n => n.label === 'KnowledgePoint');
      const sectionKnowledgeMap = new Map();
      
      sectionNodes.forEach(section => {
        sectionKnowledgeMap.set(section.name, []);
      });
      
      // 通过关系建立映射
      this.links.forEach(link => {
        const relType = link.relation_type || link.type;
        if (relType === 'BELONGS_TO_SECTION' || relType === 'BELONGS_TO') {
          const sourceName = typeof link.source === 'object' ? link.source.name : link.source;
          const targetName = typeof link.target === 'object' ? link.target.name : link.target;
          
          const kpNode = knowledgePointNodes.find(n => n.name === sourceName || n.name === targetName);
          const sectionNode = sectionNodes.find(n => n.name === sourceName || n.name === targetName);
          
          if (kpNode && sectionNode && kpNode !== sectionNode) {
            if (!sectionKnowledgeMap.has(sectionNode.name)) {
              sectionKnowledgeMap.set(sectionNode.name, []);
            }
            sectionKnowledgeMap.get(sectionNode.name).push(kpNode);
          }
        }
      });
      
      // 创建星型布局的模拟器
      this.simulation = d3.forceSimulation(this.nodes)
        .force("link", d3.forceLink(this.links).id(d => d.name)
          .distance(d => {
            // 星型布局：从中心向外的距离
            const sourceLabel = d.source.label || d.source;
            const targetLabel = d.target.label || d.target;
            
            // 如果连接到中心节点，使用较大的距离
            if (d.source.name === centerNodeName || d.target.name === centerNodeName) {
              if (targetLabel === 'Course' || sourceLabel === 'Course') return 400;
              if (targetLabel === 'Section' || sourceLabel === 'Section') return 600;
              if (targetLabel === 'KnowledgePoint' || sourceLabel === 'KnowledgePoint') return 800;
            }
            
            return 300;
          })
          .strength(0.2) // 降低连接力强度
        )
        .force("charge", d3.forceManyBody()
          .strength(d => {
            // 优化：减少力的强度，加快收敛
            if (d.name === centerNodeName) return -2000; // 从 -3000 减少
            return -400; // 从 -600 减少
          })
          .distanceMax(1000) // 限制斥力作用范围，提升性能
        )
        .force("center", d3.forceCenter(0, 0).strength(0.03))
        .force("radial", d3.forceRadial(d => {
          // 星型布局：根据节点类型设置径向距离
          if (d.name === centerNodeName) return 0; // 中心节点
          
          const containerSize = Math.min(containerWidth, containerHeight);
          if (d.label === 'Course') return containerSize * 0.35;
          if (d.label === 'Section') return containerSize * 0.65;
          if (d.label === 'KnowledgePoint') return containerSize * 1.1;
          return containerSize * 0.8;
        }, 0, 0).strength(0.95)) // 更强的径向力
        .force("angular", alpha => {
          // 角度约束力：保持知识点在各自节段的扇形区域内
          if (sectionNodes.length === 0) return;
          
          const totalSections = sectionNodes.length;
          const sectionAngleRange = (2 * Math.PI) / totalSections;
          
          knowledgePointNodes.forEach(kp => {
            // 找到该知识点所属的节段
            let belongsToSection = null;
            for (const [sectionName, kps] of sectionKnowledgeMap.entries()) {
              if (kps.includes(kp)) {
                belongsToSection = sectionNodes.find(s => s.name === sectionName);
                break;
              }
            }
            
            if (belongsToSection && belongsToSection._starAngle !== undefined) {
              // 计算知识点当前的角度
              const currentAngle = Math.atan2(kp.y, kp.x);
              const sectionCenterAngle = belongsToSection._starAngle;
              
              // 计算扇形范围
              const startAngle = sectionCenterAngle - sectionAngleRange / 2;
              const endAngle = sectionCenterAngle + sectionAngleRange / 2;
              
              // 标准化角度到 [-π, π]
              const normalizeAngle = (angle) => {
                while (angle > Math.PI) angle -= 2 * Math.PI;
                while (angle < -Math.PI) angle += 2 * Math.PI;
                return angle;
              };
              
              const normCurrentAngle = normalizeAngle(currentAngle);
              const normStartAngle = normalizeAngle(startAngle);
              const normEndAngle = normalizeAngle(endAngle);
              
              // 检查是否在扇形范围内
              let inRange = false;
              if (normStartAngle <= normEndAngle) {
                inRange = normCurrentAngle >= normStartAngle && normCurrentAngle <= normEndAngle;
              } else {
                inRange = normCurrentAngle >= normStartAngle || normCurrentAngle <= normEndAngle;
              }
              
              // 如果超出范围，施加约束力
              if (!inRange) {
                const distToStart = Math.abs(normalizeAngle(normCurrentAngle - normStartAngle));
                const distToEnd = Math.abs(normalizeAngle(normCurrentAngle - normEndAngle));
                const targetAngle = distToStart < distToEnd ? startAngle : endAngle;
                
                const radius = Math.sqrt(kp.x * kp.x + kp.y * kp.y);
                const targetX = radius * Math.cos(targetAngle);
                const targetY = radius * Math.sin(targetAngle);
                
                const strength = 0.5 * alpha; // 强约束力
                kp.vx += (targetX - kp.x) * strength;
                kp.vy += (targetY - kp.y) * strength;
              }
            }
          });
        })
        .force("collide", d3.forceCollide()
          .radius(d => {
            if (d.label === 'Course') return 120;
            if (d.label === 'Chapter') return 110;
            if (d.label === 'Section') return 105;
            return 100;
          })
          .strength(0.8) // 从 1.0 减少到 0.8
          .iterations(4) // 从 8 减少到 4，提升性能
        );

      // 使用D3数据绑定机制更新元素
      console.log('[STAR UPDATE] 更新DOM元素，nodes数量:', this.nodes.length, 'links数量:', this.links.length);
      
      // 更新模拟器数据
      this.simulation.nodes(this.nodes);
      this.simulation.force("link").links(this.links);

      // 更新连接线
      let linksGroup = this.g.select('.links');
      if (linksGroup.empty()) {
        linksGroup = this.g.append("g").attr("class", "links");
      }
      
      const linkSelection = linksGroup.selectAll("line")
        .data(this.links, d => `${d.source}-${d.target}-${d.type}`);
      
      linkSelection.exit().remove();
      const newLinks = linkSelection.enter().append("line");
      
      this.linkElements = linkSelection.merge(newLinks)
        .attr("class", d => {
          let classes = "link";
          const relType = d.type || d.relation_type;
          if (relType === 'PREREQUISITE') classes += " prerequisite-relation";
          else if (relType === 'PARALLEL') classes += " parallel-relation";
          else if (relType === 'APPLICATION') classes += " application-relation";
          else if (relType === 'EXTENSION') classes += " extension-relation";
          else if (relType === 'DEPENDENCY') classes += " dependency-relation";
          else if (relType === 'CONTAINS_CHAPTER') classes += " contains-chapter-relation";
          else if (relType === 'BELONGS_TO_CHAPTER') classes += " belongs-to-chapter-relation";
          if (this.isLinkSelected(d)) classes += " selected";
          return classes;
        })
        .attr("stroke", d => {
          const style = this.getStyleByNodeTypes(d);
          return style.color;
        })
        .attr("stroke-width", d => {
          if (this.isLinkSelected(d)) return 3;
          const style = this.getStyleByNodeTypes(d);
          return style.width;
        })
        .attr("stroke-dasharray", d => {
          const style = this.getStyleByNodeTypes(d);
          if (style.style === 'dashed') return "5,5";
          if (style.style === 'dotted') return "2,3";
          return null;
        })
        .attr("marker-end", d => {
          if (this.isLinkSelected(d)) return "url(#arrowhead-selected)";
          const relType = d.type || d.relation_type;
          if (relType === 'PREREQUISITE' || relType === 'PREREQUISITE_FOR') return "url(#arrowhead-prerequisite)";
          else if (relType === 'PARALLEL') return "url(#arrowhead-parallel)";
          else if (relType === 'APPLICATION') return "url(#arrowhead-application)";
          else if (relType === 'EXTENSION') return "url(#arrowhead-extension)";
          else if (relType === 'DEPENDENCY') return "url(#arrowhead-dependency)";
          else if (relType === 'CONTAINS' || relType === 'CONTAINS_CHAPTER' || relType === 'CONTAINS_SECTION') return "url(#arrowhead-contains)";
          else if (relType === 'BELONGS_TO' || relType === 'BELONGS_TO_CHAPTER' || relType === 'BELONGS_TO_SECTION') return "url(#arrowhead-belongs)";
          return "url(#arrowhead)";
        })
        .style("cursor", "pointer");
      
      // 绑定连接线事件
      this.linkElements
        .on("mouseenter", null).on("mouseleave", null).on("click", null).on("contextmenu", null)
        .on("mouseenter", function(event, d) {
          d3.select(this).attr("stroke-width", 4).attr("stroke-opacity", 0.8);
        })
        .on("mouseleave", (event, d) => {
          const isSelected = this.isLinkSelected(d);
          d3.select(event.target).attr("stroke-width", isSelected ? 3 : 2).attr("stroke-opacity", 1);
        })
        .on("click", (event, d) => {
          event.stopPropagation();
          event.preventDefault();
          this.selectLink(d);
        })
        .on("contextmenu", (event, d) => {
          event.stopPropagation();
          event.preventDefault();
          this.showContextMenu(event, 'link', d);
        });

      // 更新节点
      let nodesGroup = this.g.select('.nodes');
      if (nodesGroup.empty()) {
        nodesGroup = this.g.append("g").attr("class", "nodes");
      }
      
      const nodeSelection = nodesGroup.selectAll("circle")
        .data(this.nodes, d => d.name);
      
      nodeSelection.exit().remove();
      const newNodes = nodeSelection.enter().append("circle");
      
      this.nodeElements = nodeSelection.merge(newNodes)
        .attr("class", d => {
          let classes = "node";
          if (d.label === "Course") classes += " course-node";
          else if (d.label === "Chapter") classes += " chapter-node";
          else if (d.label === "Section") classes += " section-node";
          else if (d.label === "KnowledgePoint") classes += " knowledge-point-node";
          if (this.isNodeSelected(d)) classes += " selected";
          return classes;
        })
        .attr("r", d => {
          if (d.label === "Course") return 70;
          if (d.label === "Chapter") return 60;
          if (d.label === "Section") return 55;
          if (d.label === "KnowledgePoint") return 50;
          return 50;
        })
        .attr("fill", d => this.getEntityColor(d.label))
        .attr("stroke", d => this.isNodeSelected(d) ? "#ff6b6b" : "#fff")
        .attr("stroke-width", d => this.isNodeSelected(d) ? 4 : 2)
        .style("cursor", "pointer")
        .call(d3.drag()
          .on("start", this.dragStarted)
          .on("drag", this.dragged)
          .on("end", this.dragEnded)
        );

      // 绑定节点事件
      this.nodeElements
        .on("click", null).on("dblclick", null).on("contextmenu", null)
        .on("click", (event, d) => {
          event.stopPropagation();
          event.preventDefault();
          this.selectNode(d);
        })
        .on("dblclick", (event, d) => {
          event.stopPropagation();
          event.preventDefault();
          this.fixNode(d);
        })
        .on("contextmenu", (event, d) => {
          event.stopPropagation();
          event.preventDefault();
          this.showContextMenu(event, 'node', d);
        });

      // 更新节点标签
      let nodeLabelsGroup = this.g.select('.node-labels');
      if (nodeLabelsGroup.empty()) {
        nodeLabelsGroup = this.g.append("g").attr("class", "node-labels");
      }
      
      nodeLabelsGroup.selectAll("text").remove();
      
      const nodeLabelSelection = nodeLabelsGroup.selectAll("foreignObject")
        .data(this.nodes, d => d.name);
      
      nodeLabelSelection.exit().remove();
      const newNodeLabels = nodeLabelSelection.enter().append("foreignObject");
      
      this.nodeLabels = nodeLabelSelection.merge(newNodeLabels)
        .attr("class", "node-label-foreign")
        .attr("width", d => {
          if (d.label === "Course") return 140;
          if (d.label === "Chapter") return 120;
          if (d.label === "Section") return 110;
          return 100;
        })
        .attr("height", d => {
          if (d.label === "Course") return 140;
          if (d.label === "Chapter") return 120;
          if (d.label === "Section") return 110;
          return 100;
        })
        .style("display", this.showLabels ? null : "none")
        .style("pointer-events", "none")
        .html(d => {
          const fontSize = d.label === "Course" ? "15px" : 
                          d.label === "Chapter" ? "14px" : 
                          d.label === "Section" ? "13px" : "12px";
          const fontWeight = d.label === "Course" ? "bold" : "700";
          const color = this.isNodeSelected(d) ? "#ff6b6b" : "#ffffff";
          
          return `
            <div xmlns="http://www.w3.org/1999/xhtml" style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              font-size: ${fontSize};
              font-weight: ${fontWeight};
              color: ${color};
              line-height: 1.3;
              padding: 5px;
              word-wrap: break-word;
              overflow-wrap: break-word;
              text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5), 0 0 2px rgba(0, 0, 0, 0.3);
            ">
              ${d.name}
            </div>
          `;
        });

      // 更新连接线标签
      let linkLabelsGroup = this.g.select('.link-labels');
      if (linkLabelsGroup.empty()) {
        linkLabelsGroup = this.g.append("g").attr("class", "link-labels");
      }
      
      const linkLabelData = this.getMergedLinkLabels(normalizedLinks).filter(d => {
        if (d.type === "包含" || d.type === "CONTAINS") {
          const sourceNode = typeof d.source === 'object' ? d.source : this.nodes.find(n => n.name === d.source);
          const targetNode = typeof d.target === 'object' ? d.target : this.nodes.find(n => n.name === d.target);
          if (sourceNode && targetNode && sourceNode.label === "Course" && targetNode.label === "Course") {
            return false;
          }
        }
        return true;
      });
      
      const linkLabelSelection = linkLabelsGroup.selectAll("g")
        .data(linkLabelData, d => `${d.source.name || d.source}-${d.target.name || d.target}-${d.type}`);
      
      linkLabelSelection.exit().remove();
      const newLinkLabels = linkLabelSelection.enter().append("g").attr("class", "link-label-group");
      this.linkLabels = linkLabelSelection.merge(newLinkLabels);
      
      newLinkLabels.append("rect").attr("class", "link-label-bg");
      newLinkLabels.append("text").attr("class", "link-label");
      
      this.linkLabels.select("rect")
        .attr("class", "link-label-bg")
        .attr("x", -12).attr("y", -8).attr("width", 24).attr("height", 16)
        .attr("stroke", "#D3D3D3").attr("stroke-width", "1px")
        .attr("fill", "none").attr("rx", 4)
        .style("display", this.showRelationLabels ? null : "none");
      
      this.linkLabels.select("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle").attr("dy", ".35em")
        .style("display", this.showRelationLabels ? null : "none")
        .text(d => this.translateRelationType(d.type));
      
      this.linkLabels.selectAll(".link-label-bg")
        .attr("width", function() {
          const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
          return textWidth + 16;
        })
        .attr("x", function() {
          const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
          return -textWidth / 2 - 8;
        })
        .attr("y", -10).attr("height", 20);

      // 优化：星型布局的tick事件，使用 requestAnimationFrame
      const nodeSizeCache = new Map();
      const getNodeSize = (label) => {
        if (!nodeSizeCache.has(label)) {
          const size = label === "Course" ? 140 : 
                      label === "Chapter" ? 120 : 
                      label === "Section" ? 110 : 100;
          nodeSizeCache.set(label, size);
        }
        return nodeSizeCache.get(label);
      };
      
      let rafId = null;
      let needsUpdate = false;
      
      this.simulation.on("tick", () => {
        needsUpdate = true;
        if (rafId) return;
        
        rafId = requestAnimationFrame(() => {
          if (!needsUpdate) {
            rafId = null;
            return;
          }
          
          this.linkElements
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
          
          this.nodeElements
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
          
          this.nodeLabels
            .attr("x", d => {
              const width = getNodeSize(d.label);
              return d.x - width / 2;
            })
            .attr("y", d => {
              const height = getNodeSize(d.label);
              return d.y - height / 2;
            });
          
          this.linkLabels
            .attr("transform", d => {
              const midX = (d.source.x + d.target.x) / 2;
              const midY = (d.source.y + d.target.y) / 2;
              const dx = d.target.x - d.source.x;
              const dy = d.target.y - d.source.y;
              const angle = Math.atan2(dy, dx);
              const offset = d.offsetY || 0;
              const perpX = -Math.sin(angle) * offset;
              const perpY = Math.cos(angle) * offset;
              return `translate(${midX + perpX}, ${midY + perpY})`;
            });
          
          // 优化：仅在模拟器活跃时更新标签背景
          if (this.simulation.alpha() > 0.1) {
            this.linkLabels.selectAll(".link-label-bg")
              .attr("width", function() {
                const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
                return textWidth + 16;
              })
              .attr("x", function() {
                const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
                return -textWidth / 2 - 8;
              })
              .attr("y", -10)
              .attr("height", 20);
          }
          
          needsUpdate = false;
          rafId = null;
        });
      });
      
      // 启动模拟器 - 快速稳定模式
      this.simulation
        .alpha(1)
        .alphaDecay(0.15)   // 从0.02大幅增加到0.15，极快收敛
        .alphaMin(0.05)     // 从0.001增加到0.05，很早停止
        .velocityDecay(0.8) // 从0.4增加到0.8，极快减速
        .restart();
      
      // 设置星型布局的自动稳定
      this.setupAutoStabilization();
      
      if (this.isPaused) {
        this.simulation.stop();
      }
      
      // 隐藏加载中
      this.isLoading = false;
      
      console.log('[STAR UPDATE] 星型布局图谱更新完成，已启用快速稳定模式');
    },
    
    // 应用星型放射布局
    applyStarLayout(data, centerNodeName) {
      console.log('[STAR LAYOUT] 应用星型放射布局，中心节点:', centerNodeName);
      
      if (!data || !data.nodes || data.nodes.length === 0) {
        return;
      }
      
      // 找到中心节点（章节点）
      const centerNode = data.nodes.find(node => node.name === centerNodeName);
      if (!centerNode) {
        console.warn('[STAR LAYOUT] 未找到中心节点');
        return;
      }
      
      // 获取容器尺寸
      const containerWidth = this.$refs.graphContainer ? this.$refs.graphContainer.clientWidth : 800;
      const containerHeight = this.$refs.graphContainer ? this.$refs.graphContainer.clientHeight : 600;
      const containerSize = Math.min(containerWidth, containerHeight);
      
      // 中心节点位置（视图中心）
      centerNode.x = 0;
      centerNode.y = 0;
      centerNode.fx = 0;
      centerNode.fy = 0;
      
      // 获取所有非中心节点
      const otherNodes = data.nodes.filter(node => node.name !== centerNodeName);
      
      // 按节点类型分组
      const courseNodes = otherNodes.filter(n => n.label === 'Course');
      const sectionNodes = otherNodes.filter(n => n.label === 'Section');
      const knowledgePointNodes = otherNodes.filter(n => n.label === 'KnowledgePoint');
      
      // 定义半径
      const courseRadius = containerSize * 0.35;
      const sectionRadius = containerSize * 0.65;
      const knowledgePointRadius = containerSize * 1.1;
      
      // 1. 均匀分布课程节点（内圈）
      if (courseNodes.length > 0) {
        const courseAngleStep = (2 * Math.PI) / courseNodes.length;
        courseNodes.forEach((node, index) => {
          const angle = index * courseAngleStep - Math.PI / 2;
          node.x = courseRadius * Math.cos(angle);
          node.y = courseRadius * Math.sin(angle);
        });
      }
      
      // 2. 均匀分布节段节点（中圈）
      if (sectionNodes.length > 0) {
        const sectionAngleStep = (2 * Math.PI) / sectionNodes.length;
        sectionNodes.forEach((node, index) => {
          const angle = index * sectionAngleStep - Math.PI / 2;
          node.x = sectionRadius * Math.cos(angle);
          node.y = sectionRadius * Math.sin(angle);
          // 保存节段的角度信息，用于知识点分布
          node._starAngle = angle;
          node._starIndex = index;
        });
      }
      
      // 3. 构建节段-知识点映射关系
      const sectionKnowledgeMap = new Map();
      sectionNodes.forEach(section => {
        sectionKnowledgeMap.set(section.name, []);
      });
      
      // 通过关系找出每个节段包含的知识点
      if (data.relationships) {
        data.relationships.forEach(rel => {
          const relType = rel.relation_type || rel.type;
          // BELONGS_TO_SECTION 关系：知识点属于节段
          if (relType === 'BELONGS_TO_SECTION' || relType === 'BELONGS_TO') {
            const sourceName = typeof rel.source === 'object' ? rel.source.name : rel.source;
            const targetName = typeof rel.target === 'object' ? rel.target.name : rel.target;
            
            // 找到知识点和节段节点
            const kpNode = knowledgePointNodes.find(n => n.name === sourceName || n.name === targetName);
            const sectionNode = sectionNodes.find(n => n.name === sourceName || n.name === targetName);
            
            if (kpNode && sectionNode && kpNode !== sectionNode) {
              if (!sectionKnowledgeMap.has(sectionNode.name)) {
                sectionKnowledgeMap.set(sectionNode.name, []);
              }
              sectionKnowledgeMap.get(sectionNode.name).push(kpNode);
            }
          }
        });
      }
      
      // 4. 在每个节段的扇形区域内分布知识点
      if (sectionNodes.length > 0) {
        const totalSections = sectionNodes.length;
        const sectionAngleRange = (2 * Math.PI) / totalSections; // 每个节段的扇形角度范围
        
        sectionNodes.forEach((section, sectionIndex) => {
          const knowledgePoints = sectionKnowledgeMap.get(section.name) || [];
          
          if (knowledgePoints.length > 0) {
            // 计算该节段的扇形范围
            const centerAngle = section._starAngle;
            const startAngle = centerAngle - sectionAngleRange / 2;
            const endAngle = centerAngle + sectionAngleRange / 2;
            
            // 在扇形范围内均匀分布知识点
            const kpAngleStep = sectionAngleRange / (knowledgePoints.length + 1);
            
            knowledgePoints.forEach((kp, kpIndex) => {
              const angle = startAngle + (kpIndex + 1) * kpAngleStep;
              kp.x = knowledgePointRadius * Math.cos(angle);
              kp.y = knowledgePointRadius * Math.sin(angle);
            });
          }
        });
      }
      
      // 5. 处理没有关联到任何节段的知识点（均匀分布在外圈）
      const unassignedKnowledgePoints = knowledgePointNodes.filter(kp => {
        return !Array.from(sectionKnowledgeMap.values()).some(kps => kps.includes(kp));
      });
      
      if (unassignedKnowledgePoints.length > 0) {
        const unassignedAngleStep = (2 * Math.PI) / unassignedKnowledgePoints.length;
        unassignedKnowledgePoints.forEach((kp, index) => {
          const angle = index * unassignedAngleStep - Math.PI / 2;
          kp.x = knowledgePointRadius * Math.cos(angle);
          kp.y = knowledgePointRadius * Math.sin(angle);
        });
      }
      
      console.log('[STAR LAYOUT] 星型布局应用完成:', {
        centerNode: centerNode.name,
        courseNodes: courseNodes.length,
        sectionNodes: sectionNodes.length,
        knowledgePointNodes: knowledgePointNodes.length,
        sectionKnowledgeMap: Array.from(sectionKnowledgeMap.entries()).map(([section, kps]) => ({
          section,
          knowledgePointCount: kps.length
        })),
        unassignedKnowledgePoints: unassignedKnowledgePoints.length
      });
    },
    
    // 稳定布局
    stabilizeLayout() {
      if (!this.simulation) return;
      
      // 先暂停模拟
      this.simulation.stop();
      
      // 对所有节点进行固定
      this.fixAllNodesPosition();
      
      // 更新节点样式
      if (this.nodeElements) {
        this.nodeElements.classed("fixed", true);
      }
      
      console.log('[STABILIZE] 布局已稳定，所有节点已固定');
    },
    
    // 固定所有节点位置
    fixAllNodesPosition() {
      if (!this.nodes) return;
      
      this.nodes.forEach(node => {
        node.fx = node.x;
        node.fy = node.y;
      });
      
      console.log('[FIX NODES] 已固定', this.nodes.length, '个节点的位置');
    },
    
    // 设置自动稳定机制 - 优化为更快检测和固定
    setupAutoStabilization() {
      if (!this.simulation) return;
      
      let stableCheckCount = 0;
      const maxStableChecks = 2; // 从5减少到2，更快触发
      const stabilityThreshold = 0.05; // 从0.02增加到0.05，更早触发
      
      // 监听模拟器的 tick 事件
      const checkStability = () => {
        const currentAlpha = this.simulation.alpha();
        
        if (currentAlpha < stabilityThreshold) {
          stableCheckCount++;
          console.log(`[AUTO STABILIZE] 稳定性检查 ${stableCheckCount}/${maxStableChecks}, alpha: ${currentAlpha.toFixed(4)}`);
          
          if (stableCheckCount >= maxStableChecks) {
            // 连续检查都稳定，立即固定节点
            console.log('[AUTO STABILIZE] 图谱已稳定，立即固定所有节点');
            this.simulation.stop();
            this.fixAllNodesPosition();
            
            // 移除监听器
            this.simulation.on('tick.stability', null);
          }
        } else {
          stableCheckCount = 0; // 重置计数器
        }
      };
      
      // 添加稳定性检查监听器
      this.simulation.on('tick.stability', checkStability);
      
      // 设置最大运行时间（防止无限运行）- 从5秒减少到2秒
      setTimeout(() => {
        if (this.simulation && this.simulation.alpha() > 0) {
          console.log('[AUTO STABILIZE] 达到最大运行时间，强制稳定');
          this.simulation.stop();
          this.fixAllNodesPosition();
          this.simulation.on('tick.stability', null);
        }
      }, 2000); // 从5000ms减少到2000ms
    },
    
    // 重置布局
    resetLayout() {
      if (!this.simulation) return;
      
      // 释放所有固定节点
      this.nodes.forEach(node => {
        node.fx = null;
        node.fy = null;
      });
      
      // 更新节点样式
      this.nodeElements.classed("fixed", false);
      
      // 重启模拟
      this.simulation.alpha(1).alphaDecay(0.02).restart();
      this.isPaused = false;
      
      // 用户主动重置布局时才自动适应视图
      setTimeout(this.fitGraphToView, 2000);
    },
    
    // 暂停/恢复模拟
    toggleSimulation() {
      if (!this.simulation) return;
      
      if (this.isPaused) {
        // 恢复模拟
        this.simulation.restart();
        this.isPaused = false;
      } else {
        // 暂停模拟
        this.simulation.stop();
        this.isPaused = true;
      }
    },
    
    // 处理窗口大小变化
    handleResize() {
      if (this.simulation) {
        const containerWidth = this.$refs.graphContainer.clientWidth;
        const containerHeight = this.$refs.graphContainer.clientHeight;
        
        // 更新SVG尺寸
        this.svg.attr("width", containerWidth)
          .attr("height", containerHeight);
          
        // 更新力模型的中心
        this.simulation.force("center", d3.forceCenter(containerWidth / 2, containerHeight / 2))
          .alpha(0.3).restart();
          
        // 窗口大小变化时不自动适应视图，保持用户当前的视图状态
      }
    },
    
    // 获取统计信息
    loadStatistics() {
      // 真实的API请求
      fetch(`${this.baseUrl}statistics/`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            this.statistics.entityCount = data.entity_count;
            this.statistics.relationCount = data.relation_count;
            this.statistics.entityTypes = data.entity_types;
            this.statistics.relationTypes = data.relation_types;
          }
        })
        .catch(error => {
                    console.error('获取统计信息失败:', error);
                    // 设置默认统计信息，避免页面显示错误
                    this.statistics = {
                      entityCount: 0,
                      relationCount: 0,
                      entityTypes: {},
                      relationTypes: {}
                    };
                });
        // this.statistics = {
        //   entityCount: 156,
        //   relationCount: 278,
        //   entityTypes: {
        //     KnowledgePoint: 132,
        //     Course: 24
        //   },
        //   relationTypes: {
        //     RELATED_TO: 85,
        //     PART_OF: 42,
        //     PREREQUISITE: 36,
        //     INCLUDES: 75,
        //     FOLLOWS: 40
        //   }
        // };
    },

    // 增强模式相关方法
    toggleEnhancedMode() {
      console.log('切换增强模式:', this.enhancedMode.enabled);
      
      // 保存设置
      this.saveEnhancedModeSettings();
      
      if (this.enhancedMode.enabled) {
        // 启用增强模式时，重新加载数据以支持层次结构
        this.loadEnhancedGraphData();
      } else {
        // 禁用增强模式时，恢复标准显示
        this.loadStandardGraphData();
      }
    },

    onStructureTypeChange() {
      console.log('结构类型变化:', this.enhancedMode.structureType);
      
      // 保存设置
      this.saveEnhancedModeSettings();
      
      if (this.enhancedMode.enabled) {
        this.updateVisualization();
      }
    },

    updateHierarchyDisplay() {
      console.log('层次显示设置变化:', this.enhancedMode.hierarchyDisplay);
      
      // 保存设置
      this.saveEnhancedModeSettings();
      
      if (this.enhancedMode.enabled && (this.enhancedMode.structureType === 'four_layer' || this.enhancedMode.structureType === 'three_layer')) {
        this.applyHierarchyFilter();
      }
    },

    applyHierarchyFilter() {
      if (!this.originalData) return;

      const filteredData = {
        nodes: [],
        relationships: []
      };

      // 根据层次显示设置过滤节点 - 支持四层结构
      for (const node of this.originalData.nodes) {
        let shouldShow = false;
        
        if (node.label === 'Course' && this.enhancedMode.hierarchyDisplay.showCourses) {
          shouldShow = true;
        } else if (node.label === 'Chapter' && this.enhancedMode.hierarchyDisplay.showChapters) {
          shouldShow = true;
        } else if (node.label === 'Section' && this.enhancedMode.hierarchyDisplay.showSections) {
          shouldShow = true;  // 新增节段层过滤
        } else if (node.label === 'KnowledgePoint' && this.enhancedMode.hierarchyDisplay.showKnowledgePoints) {
          shouldShow = true;
        }

        if (shouldShow) {
          filteredData.nodes.push(node);
        }
      }

      // 过滤关系 - 只保留两端节点都显示的关系
      const visibleNodeIds = new Set(filteredData.nodes.map(n => n.id || n.name));
      for (const rel of this.originalData.relationships) {
        if (visibleNodeIds.has(rel.source) && visibleNodeIds.has(rel.target)) {
          filteredData.relationships.push(rel);
        }
      }

      // 应用层次布局
      this.applyHierarchicalLayout(filteredData);
      
      // 更新图谱显示
      this.updateGraph(filteredData, false, false, true);
    },

    applyHierarchicalLayout(data) {
      if (this.enhancedMode.structureType !== 'four_layer' && this.enhancedMode.structureType !== 'three_layer') return;

      const layout = this.enhancedMode.hierarchyLayout;
      const containerWidth = (this.$refs.graphContainer && this.$refs.graphContainer.clientWidth) || 800;
      const containerHeight = (this.$refs.graphContainer && this.$refs.graphContainer.clientHeight) || 600;

      // 按层级分组节点 - 支持四层结构
      const nodesByLevel = {
        course: data.nodes.filter(n => n.label === 'Course'),
        chapter: data.nodes.filter(n => n.label === 'Chapter'),
        section: data.nodes.filter(n => n.label === 'Section'),  // 新增节段层
        knowledgePoint: data.nodes.filter(n => n.label === 'KnowledgePoint')
      };

      // 计算每层的Y坐标 - 根据结构类型调整
      let levelY;
      if (this.enhancedMode.structureType === 'four_layer') {
        // 四层结构布局
        levelY = {
          course: containerHeight * 0.15,      // 课程层
          chapter: containerHeight * 0.35,     // 章节层
          section: containerHeight * 0.55,     // 节段层
          knowledgePoint: containerHeight * 0.75  // 知识点层
        };
      } else {
        // 三层结构布局（保持兼容）
        levelY = {
          course: containerHeight * 0.2,
          chapter: containerHeight * 0.5,
          knowledgePoint: containerHeight * 0.8
        };
      }

      // 为每层节点设置位置
      Object.keys(nodesByLevel).forEach(level => {
        const nodes = nodesByLevel[level];
        if (nodes.length === 0 || !levelY[level]) return;
        
        const y = levelY[level];
        
        nodes.forEach((node, index) => {
          const totalWidth = Math.max(0, (nodes.length - 1) * layout.nodeSpacing);
          const startX = (containerWidth - totalWidth) / 2;
          
          node.x = startX + index * layout.nodeSpacing;
          node.y = y;
          
          // 固定位置
          node.fx = node.x;
          node.fy = node.y;
        });
      });
    },

    async loadEnhancedGraphData() {
      console.log('加载增强模式图谱数据（四层结构）...');
      this.isLoading = true;

      try {
        // 优先尝试四层结构API
        const response = await fetch(`${this.baseUrl}get_four_layer_graph_data/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log('四层结构数据加载成功:', data);
            this.originalData = data;
            this.applyHierarchyFilter();
            return;
          } else {
            console.warn('四层结构数据加载失败，尝试标准增强模式API');
          }
        } else {
          console.warn('四层结构API不可用，尝试标准增强模式API');
        }

        // 回退到标准增强模式API
        const fallbackResponse = await fetch(`${this.baseUrl}get_enhanced_graph_data/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          if (fallbackData.success) {
            console.log('标准增强模式数据加载成功:', fallbackData);
            this.originalData = fallbackData;
            this.applyHierarchyFilter();
          } else {
            console.warn('标准增强模式数据加载失败，使用基础数据');
            this.loadStandardGraphData();
          }
        } else {
          console.warn('增强模式API不可用，使用基础数据');
          this.loadStandardGraphData();
        }
      } catch (error) {
        console.error('加载增强模式数据失败:', error);
        this.loadStandardGraphData();
      } finally {
        this.isLoading = false;
      }
    },

    async loadStandardGraphData() {
      console.log('加载标准图谱数据...');
      this.isLoading = true;

      try {
        const response = await fetch(`${this.baseUrl}get_graph_data/`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            console.log('标准数据加载成功');
            this.originalData = data;
            this.updateGraph(data, false, false, true);
          }
        }
      } catch (error) {
        console.error('加载标准数据失败:', error);
      } finally {
        this.isLoading = false;
      }
    },

    updateVisualization() {
      console.log('更新可视化显示');
      if (this.enhancedMode.enabled) {
        this.applyHierarchyFilter();
      }
    },

    filterRelationsByType() {
      console.log('关系类型过滤变化:', this.enhancedMode.relationTypeFilter);
      if (this.enhancedMode.enabled && this.originalData) {
        this.applyRelationTypeFilter();
      }
    },

    applyRelationTypeFilter() {
      if (!this.originalData) return;

      const filteredData = {
        nodes: [...this.originalData.nodes],
        relationships: []
      };

      // 根据关系类型过滤器和强度过滤器过滤关系
      for (const rel of this.originalData.relationships) {
        const relType = rel.type || rel.relation_type;
        
        // 检查关系类型过滤器
        if (!this.enhancedMode.relationTypeFilter[relType]) {
          continue;
        }
        
        // 检查关系强度过滤器
        const style = this.relationStyles[relType] || this.relationStyles.DEFAULT;
        const strength = style.strength;
        
        let strengthAllowed = false;
        if (strength === 'strong' && this.enhancedMode.relationStrengthFilter.strong) {
          strengthAllowed = true;
        } else if (strength === 'medium' && this.enhancedMode.relationStrengthFilter.medium) {
          strengthAllowed = true;
        } else if (strength === 'weak' && this.enhancedMode.relationStrengthFilter.weak) {
          strengthAllowed = true;
        }
        
        if (strengthAllowed) {
          filteredData.relationships.push(rel);
        }
      }

      // 如果是层次结构，还要应用层次过滤
      if (this.enhancedMode.structureType === 'four_layer' || this.enhancedMode.structureType === 'three_layer') {
        this.applyHierarchicalLayout(filteredData);
      }

      this.updateGraph(filteredData, false, false, true);
    },

    // 增强模式操作方法
    async generateHierarchicalCourse() {
      console.log('生成层次化课程');
      this.isLoading = true;

      try {
        // 这里可以调用后端API生成层次化课程
        this.showSuccessMessage = true;
        this.successMessage = '层次化课程生成功能开发中...';
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      } catch (error) {
        console.error('生成层次化课程失败:', error);
        this.showErrorMessage = true;
        this.errorMessage = '生成层次化课程失败: ' + error.message;
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 3000);
      } finally {
        this.isLoading = false;
      }
    },

    async analyzeRelations() {
      console.log('分析关系');
      this.isLoading = true;

      try {
        // 这里可以调用后端API分析关系
        this.showSuccessMessage = true;
        this.successMessage = '关系分析功能开发中...';
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      } catch (error) {
        console.error('分析关系失败:', error);
        this.showErrorMessage = true;
        this.errorMessage = '分析关系失败: ' + error.message;
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 3000);
      } finally {
        this.isLoading = false;
      }
    },

    async generateLearningPath() {
      console.log('生成学习路径');
      this.isLoading = true;

      try {
        // 基于当前图谱数据生成学习路径
        if (this.originalData && this.originalData.nodes && this.originalData.relationships) {
          const learningPath = this.calculateOptimalLearningPath();
          
          if (learningPath && learningPath.length > 0) {
            // 高亮显示学习路径
            this.highlightLearningPath(learningPath);
            
            this.showSuccessMessage = true;
            this.successMessage = `已生成包含 ${learningPath.length} 个节点的学习路径`;
          } else {
            this.showWarningMessage = true;
            this.warningMessage = '无法生成有效的学习路径，请确保图谱中有足够的前置关系';
          }
        } else {
          this.showWarningMessage = true;
          this.warningMessage = '请先加载知识图谱数据';
        }
        
        setTimeout(() => {
          this.showSuccessMessage = false;
          this.showWarningMessage = false;
        }, 5000);
      } catch (error) {
        console.error('生成学习路径失败:', error);
        this.showErrorMessage = true;
        this.errorMessage = '生成学习路径失败: ' + error.message;
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 3000);
      } finally {
        this.isLoading = false;
      }
    },

    // 计算最优学习路径
    calculateOptimalLearningPath() {
      if (!this.originalData || !this.originalData.nodes || !this.originalData.relationships) {
        return [];
      }

      // 构建前置关系图
      const prerequisiteGraph = new Map();
      const inDegree = new Map();
      
      // 初始化所有节点
      for (const node of this.originalData.nodes) {
        prerequisiteGraph.set(node.name, []);
        inDegree.set(node.name, 0);
      }
      
      // 构建前置关系
      for (const rel of this.originalData.relationships) {
        const relType = rel.type || rel.relation_type;
        if (relType === 'PREREQUISITE' || relType === 'DEPENDENCY') {
          const source = rel.source;
          const target = rel.target;
          
          if (prerequisiteGraph.has(source) && prerequisiteGraph.has(target)) {
            prerequisiteGraph.get(source).push(target);
            inDegree.set(target, inDegree.get(target) + 1);
          }
        }
      }
      
      // 拓扑排序生成学习路径
      const learningPath = [];
      const queue = [];
      
      // 找到所有入度为0的节点（起始节点）
      for (const [node, degree] of inDegree) {
        if (degree === 0) {
          queue.push(node);
        }
      }
      
      while (queue.length > 0) {
        const current = queue.shift();
        learningPath.push(current);
        
        // 处理当前节点的所有后续节点
        for (const next of prerequisiteGraph.get(current)) {
          inDegree.set(next, inDegree.get(next) - 1);
          if (inDegree.get(next) === 0) {
            queue.push(next);
          }
        }
      }
      
      return learningPath;
    },

    // 高亮显示学习路径
    highlightLearningPath(learningPath) {
      if (!this.nodeElements || !this.linkElements) return;
      
      // 清除之前的高亮
      this.clearLearningPathHighlight();
      
      // 高亮路径中的节点
      this.nodeElements
        .classed('learning-path-node', d => learningPath.includes(d.name))
        .filter(d => learningPath.includes(d.name))
        .attr('stroke', '#ff6b6b')
        .attr('stroke-width', 4);
      
      // 高亮路径中的连接线
      this.linkElements
        .classed('learning-path-link', d => {
          const relType = d.type || d.relation_type;
          return (relType === 'PREREQUISITE' || relType === 'DEPENDENCY') &&
                 learningPath.includes(d.source) && learningPath.includes(d.target);
        })
        .filter('.learning-path-link')
        .attr('stroke', '#ff6b6b')
        .attr('stroke-width', 4)
        .attr('stroke-opacity', 1.0);
      
      // 为路径节点添加序号标签
      this.addLearningPathLabels(learningPath);
    },

    // 添加学习路径序号标签
    addLearningPathLabels(learningPath) {
      // 移除现有的路径标签
      this.g.selectAll('.learning-path-label').remove();
      
      // 为每个路径节点添加序号
      const pathLabels = this.g.selectAll('.learning-path-label')
        .data(learningPath.map((nodeName, index) => {
          const node = this.nodes.find(n => n.name === nodeName);
          return { node, index: index + 1, name: nodeName };
        }))
        .enter()
        .append('text')
        .attr('class', 'learning-path-label')
        .attr('x', d => d.node ? d.node.x : 0)
        .attr('y', d => d.node ? d.node.y - 25 : 0)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#ff6b6b')
        .style('stroke', 'white')
        .style('stroke-width', '2px')
        .style('paint-order', 'stroke')
        .text(d => d.index);
      
      // 更新标签位置（如果节点位置发生变化）
      if (this.simulation) {
        this.simulation.on('tick.pathLabels', () => {
          pathLabels
            .attr('x', d => d.node ? d.node.x : 0)
            .attr('y', d => d.node ? d.node.y - 25 : 0);
        });
      }
    },

    // 清除学习路径高亮
    clearLearningPathHighlight() {
      if (this.nodeElements) {
        this.nodeElements
          .classed('learning-path-node', false)
          .attr('stroke', d => this.isNodeSelected(d) ? "#ff6b6b" : "#fff")
          .attr('stroke-width', d => this.isNodeSelected(d) ? 4 : 2);
      }
      
      if (this.linkElements) {
        this.linkElements
          .classed('learning-path-link', false)
          .attr('stroke', d => {
            if (this.enhancedMode.enabled) {
              const style = this.getStyleByNodeTypes(d);
              return style.color;
            }
            return "#999";
          })
          .attr('stroke-width', d => {
            if (this.isLinkSelected(d)) return 3;
            if (this.enhancedMode.enabled) {
              const style = this.getStyleByNodeTypes(d);
              return style.width;
            }
            return 2;
          })
          .attr('stroke-opacity', d => {
            if (this.enhancedMode.enabled) {
              const style = this.getStyleByNodeTypes(d);
              return style.opacity;
            }
            return 1.0;
          });
      }
      
      // 移除路径标签
      if (this.g) {
        this.g.selectAll('.learning-path-label').remove();
      }
      
      // 移除路径标签的tick监听器
      if (this.simulation) {
        this.simulation.on('tick.pathLabels', null);
      }
    },

    async validateCompleteness() {
      console.log('验证完整性');
      this.isLoading = true;

      try {
        // 这里可以调用后端API验证完整性
        this.showSuccessMessage = true;
        this.successMessage = '完整性验证功能开发中...';
        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      } catch (error) {
        console.error('验证完整性失败:', error);
        this.showErrorMessage = true;
        this.errorMessage = '验证完整性失败: ' + error.message;
        setTimeout(() => {
          this.showErrorMessage = false;
        }, 3000);
      } finally {
        this.isLoading = false;
      }
    },

    // 根据节点类型获取关系样式（新方法）
    getStyleByNodeTypes(link) {
      // 获取源节点和目标节点的类型
      const sourceLabel = (typeof link.source === 'object' && link.source.label) ? link.source.label : null;
      const targetLabel = (typeof link.target === 'object' && link.target.label) ? link.target.label : null;
      
      if (!sourceLabel || !targetLabel) {
        // 如果无法获取节点类型，使用关系类型来获取样式
        const relationType = link.relation_type || link.type;
        return this.relationStyles[relationType] || this.relationStyles.DEFAULT;
      }
      
      // 定义基于节点类型的样式映射
      const nodeTypeStyleMap = {
        // 课程 -> 章节
        'Course-Chapter': {
          color: "#2c3e50",
          style: "solid",
          width: 4,
          opacity: 1.0,
          strength: "strong",
          description: "包含"
        },
        // 章节 -> 课程
        'Chapter-Course': {
          color: "#34495e",
          style: "solid",
          width: 3,
          opacity: 0.9,
          strength: "strong",
          description: "属于"
        },
        // 章节 -> 节段
        'Chapter-Section': {
          color: "#8e44ad",
          style: "solid",
          width: 3,
          opacity: 0.9,
          strength: "strong",
          description: "包含"
        },
        // 节段 -> 章节
        'Section-Chapter': {
          color: "#9b59b6",
          style: "solid",
          width: 2,
          opacity: 0.8,
          strength: "strong",
          description: "属于"
        },
        // 节段 -> 知识点
        'Section-KnowledgePoint': {
          color: "#7f8c8d",
          style: "solid",
          width: 3,
          opacity: 0.8,
          strength: "strong",
          description: "包含"
        },
        // 知识点 -> 节段
        'KnowledgePoint-Section': {
          color: "#95a5a6",
          style: "solid",
          width: 2,
          opacity: 0.8,
          strength: "strong",
          description: "属于"
        },
        // 同级关系 - 课程之间
        'Course-Course': {
          color: "#e74c3c",
          style: "dashed",
          width: 2,
          opacity: 0.7,
          strength: "medium",
          description: "相关"
        },
        // 同级关系 - 章节之间
        'Chapter-Chapter': {
          color: "#3498db",
          style: "dashed",
          width: 2,
          opacity: 0.7,
          strength: "medium",
          description: "相关"
        },
        // 同级关系 - 节段之间
        'Section-Section': {
          color: "#2ecc71",
          style: "dashed",
          width: 2,
          opacity: 0.7,
          strength: "medium",
          description: "相关"
        },
        // 同级关系 - 知识点之间
        'KnowledgePoint-KnowledgePoint': {
          color: "#f39c12",
          style: "dotted",
          width: 2,
          opacity: 0.8,
          strength: "medium",
          description: "相关"
        }
      };
      
      // 构建节点类型键
      const key = `${sourceLabel}-${targetLabel}`;
      
      // 返回对应的样式，如果没有则返回默认样式
      return nodeTypeStyleMap[key] || this.relationStyles.DEFAULT;
    },
    
    // 获取关系颜色
    getRelationColor(relationType) {
      const style = this.relationStyles[relationType];
      return style ? style.color : '#999999';
    },

    // 获取关系样式
    getRelationStyle(relationType) {
      const style = this.relationStyles[relationType];
      return style ? style.style : 'solid';
    },

    // 翻译增强关系类型
    translateEnhancedRelationType(relationType) {
      return this.enhancedRelationTypeMap[relationType] || relationType;
    },

    // 关系提示框方法
    showRelationTooltip(event, relationInfo) {
      // 移除现有的提示框
      this.hideRelationTooltip();
      
      // 创建提示框
      const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'relation-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '1000')
        .style('opacity', 0);
      
      // 设置提示框内容
      tooltip.html(`
        <div><strong>${relationInfo.type}</strong></div>
        <div>强度: <span class="strength-${relationInfo.strength.toLowerCase()}">${relationInfo.strength}</span></div>
        <div>${relationInfo.description}</div>
        <div class="text-muted">${relationInfo.source} → ${relationInfo.target}</div>
      `);
      
      // 设置位置并显示
      tooltip
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .transition()
        .duration(200)
        .style('opacity', 1);
    },

    hideRelationTooltip() {
      d3.selectAll('.relation-tooltip').remove();
    },

    // 初始化增强模式
    initializeEnhancedMode() {
      console.log('初始化增强模式设置');
      
      // 从localStorage恢复增强模式设置
      try {
        const savedSettings = localStorage.getItem('enhancedModeSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          // 合并设置，但保持enabled为true（默认启用）
          this.enhancedMode = { 
            ...this.enhancedMode, 
            ...settings,
            enabled: true  // 强制启用增强模式作为默认
          };
          console.log('恢复增强模式设置:', this.enhancedMode);
        }
      } catch (error) {
        console.warn('恢复增强模式设置失败:', error);
      }
      
      // 确保增强模式默认启用
      if (!this.enhancedMode.enabled) {
        this.enhancedMode.enabled = true;
        this.saveEnhancedModeSettings();
      }
    },

    // 保存增强模式设置
    saveEnhancedModeSettings() {
      try {
        localStorage.setItem('enhancedModeSettings', JSON.stringify(this.enhancedMode));
        console.log('保存增强模式设置成功');
      } catch (error) {
        console.warn('保存增强模式设置失败:', error);
      }
    },

    // 关系强度筛选方法
    filterRelationsByStrength() {
      console.log('关系强度筛选变化:', this.enhancedMode.relationStrengthFilter);
      
      // 保存设置
      this.saveEnhancedModeSettings();
      
      if (this.enhancedMode.enabled && this.originalData) {
        this.applyRelationStrengthFilter();
      }
    },

    applyRelationStrengthFilter() {
      if (!this.originalData) return;

      const filteredData = {
        nodes: [...this.originalData.nodes],
        relationships: []
      };

      // 根据关系强度过滤器过滤关系
      for (const rel of this.originalData.relationships) {
        const relType = rel.type || rel.relation_type;
        const style = this.relationStyles[relType] || this.relationStyles.DEFAULT;
        const strength = style.strength;

        let shouldShow = false;
        if (strength === 'strong' && this.enhancedMode.relationStrengthFilter.strong) {
          shouldShow = true;
        } else if (strength === 'medium' && this.enhancedMode.relationStrengthFilter.medium) {
          shouldShow = true;
        } else if (strength === 'weak' && this.enhancedMode.relationStrengthFilter.weak) {
          shouldShow = true;
        }

        // 同时检查关系类型过滤器
        if (shouldShow && this.enhancedMode.relationTypeFilter[relType]) {
          filteredData.relationships.push(rel);
        }
      }

      // 如果是三层结构，还要应用层次过滤
      if (this.enhancedMode.structureType === 'three_layer') {
        this.applyHierarchicalLayout(filteredData);
      }

      this.updateGraph(filteredData, false, false, true);
    },

    // 关系分类标签方法
    setActiveFilterTab(tab) {
      this.enhancedMode.activeFilterTab = tab;
      this.saveEnhancedModeSettings();
    },

    getFilteredRelationTypes() {
      const activeTab = this.enhancedMode.activeFilterTab;
      const categoryTypes = this.relationTypeCategories[activeTab] || [];
      
      const filtered = {};
      for (const relType of categoryTypes) {
        if (this.enhancedMode.relationTypeFilter.hasOwnProperty(relType)) {
          filtered[relType] = this.enhancedMode.relationTypeFilter[relType];
        }
      }
      
      return filtered;
    },

    // 关系样式辅助方法
    getRelationOpacity(relationType) {
      const style = this.relationStyles[relationType] || this.relationStyles.DEFAULT;
      return style.opacity || 1.0;
    },

    getRelationStrengthClass(relationType) {
      const style = this.relationStyles[relationType] || this.relationStyles.DEFAULT;
      const strength = style.strength || 'weak';
      return `strength-${strength}`;
    },

    getRelationStrengthText(relationType) {
      const style = this.relationStyles[relationType] || this.relationStyles.DEFAULT;
      const strength = style.strength || 'weak';
      
      const strengthMap = {
        strong: '强',
        medium: '中',
        weak: '弱'
      };
      
      return strengthMap[strength] || '弱';
    },
    
    // 加载初始图谱数据
    loadInitialGraph() {
      this.isLoading = true;
      
      // 真实的API请求
      fetch(`${this.baseUrl}get_graph_data/`)
        .then(response => response.json())
      .then(data => {
        if (data.success && data.nodes && data.nodes.length > 0) {
                  this.updateGraph(data, false, false, false);
              } else {
                  console.warn('没有可用的图谱数据');
              }
        this.isLoading = false;
        })
        .catch(error => {
                    console.error('加载图谱数据失败:', error);
        alert('加载图谱数据失败: ' + error.message);
                    this.isLoading = false;
                });
        
        // 模拟初始图谱数据
        // const mockData = {
        //   nodes: [
        //     { id: 1, name: '计算机科学', label: 'KnowledgePoint' },
        //     { id: 2, name: '数据结构', label: 'KnowledgePoint' },
        //     { id: 3, name: '算法', label: 'KnowledgePoint' },
        //     { id: 4, name: '计算机网络', label: 'KnowledgePoint' },
        //     { id: 5, name: '操作系统', label: 'KnowledgePoint' },
        //     { id: 6, name: '数据库系统', label: 'KnowledgePoint' },
        //     { id: 7, name: '软件工程', label: 'KnowledgePoint' },
        //     { id: 8, name: '人工智能', label: 'KnowledgePoint' },
        //     { id: 9, name: '计算机科学导论', label: 'Course' },
        //     { id: 10, name: '数据结构与算法', label: 'Course' },
        //     { id: 11, name: '计算机网络基础', label: 'Course' },
        //     { id: 12, name: '操作系统原理', label: 'Course' }
        //   ],
        //   relationships: [
        //     { id: 1, type: 'CONTAINS', source: 1, target: 2 },
        //     { id: 2, type: 'CONTAINS', source: 1, target: 3 },
        //     { id: 3, type: 'CONTAINS', source: 1, target: 4 },
        //     { id: 4, type: 'CONTAINS', source: 1, target: 5 },
        //     { id: 5, type: 'CONTAINS', source: 1, target: 6 },
        //     { id: 6, type: 'CONTAINS', source: 1, target: 7 },
        //     { id: 7, type: 'CONTAINS', source: 1, target: 8 },
        //     { id: 8, type: 'PREREQUISITE', source: 2, target: 3 },
        //     { id: 9, type: 'RELATED_TO', source: 4, target: 5 },
        //     { id: 10, type: 'RELATED_TO', source: 5, target: 6 },
        //     { id: 11, type: 'CONTAINS', source: 9, target: 1 },
        //     { id: 12, type: 'CONTAINS', source: 10, target: 2 },
        //     { id: 13, type: 'CONTAINS', source: 10, target: 3 },
        //     { id: 14, type: 'CONTAINS', source: 11, target: 4 },
        //     { id: 15, type: 'CONTAINS', source: 12, target: 5 }
        //   ]
        // };
        
        // this.updateGraph(mockData);
    },

    // 刷新图谱
    async refreshGraph(skipAutoFit = false, focusNodeName = null) {
      this.isLoading = true;
      console.log('[DEBUG] refreshGraph 被调用, skipAutoFit =', skipAutoFit, 'focusNodeName =', focusNodeName);
      
      // 保存当前视图状态
      let currentViewTransform = null;
      if (skipAutoFit && this.svg && this.zoom) {
        try {
          currentViewTransform = d3.zoomTransform(this.svg.node());
          console.log('[DEBUG] refreshGraph 保存当前视图状态:', currentViewTransform);
        } catch (error) {
          console.warn('[DEBUG] refreshGraph 无法保存视图状态:', error);
        }
      }
      
      try {
        console.log('[DEBUG] 开始刷新图谱数据');
        const response = await fetch(`${this.baseUrl}get_graph_data/`);
        const data = await response.json();
        console.log('[DEBUG] 获取图谱数据响应:', data ? '成功' : '失败');

        if (data.success) {
          // 直接使用传入的参数，不依赖全局状态
          console.log('[DEBUG] 调用 updateGraph, skipAutoFit:', skipAutoFit, 'focusNodeName:', focusNodeName, 'preservePositions:', skipAutoFit);
          await this.updateGraph(data, skipAutoFit, skipAutoFit, skipAutoFit, focusNodeName);
          
          // 如果需要保持视图状态，在更新完成后立即恢复
          if (skipAutoFit && currentViewTransform && this.svg && this.zoom) {
            console.log('[DEBUG] refreshGraph 恢复视图状态:', currentViewTransform);
            setTimeout(() => {
              this.svg.call(this.zoom.transform, currentViewTransform);
            }, 200);
          }
          
          console.log('[DEBUG] 图谱刷新成功');
        } else {
          console.error('刷新图谱失败:', data.error);
          this.showError('刷新图谱失败: ' + data.error);
        }
      } catch (error) {
        console.error('刷新图谱失败:', error);
        this.showError('刷新图谱失败: ' + error.message);
      }
      this.isLoading = false;
    },
    


    // 本地更新节点
    updateNodeLocally(originalNodeName, updatedData) {
      console.log('[LOCAL UPDATE] 本地更新节点:', originalNodeName, updatedData);
      
      if (!this.originalData) {
        console.warn('[LOCAL UPDATE] 原始数据不存在，无法本地更新节点');
        return;
      }
      
      const newNodeName = updatedData.name;
      const nameChanged = newNodeName && newNodeName !== originalNodeName;
      
      // 查找并更新节点
      const nodeIndex = this.originalData.nodes.findIndex(n => n.name === originalNodeName);
      if (nodeIndex === -1) {
        console.warn('[LOCAL UPDATE] 未找到要更新的节点:', originalNodeName);
        return;
      }
      
      // 修复：深度合并节点数据，确保所有属性都被正确更新
      const originalNode = this.originalData.nodes[nodeIndex];
      this.originalData.nodes[nodeIndex] = {
        ...originalNode,
        name: updatedData.name || originalNode.name,
        label: updatedData.label || originalNode.label,
        properties: {
          ...originalNode.properties,
          ...updatedData.properties
        }
      };
      
      console.log('[LOCAL UPDATE] 原始数据节点已更新:', this.originalData.nodes[nodeIndex]);
      
      // 同时更新当前显示的nodes数组中的节点
      const currentNodeIndex = this.nodes.findIndex(n => n.name === originalNodeName);
      if (currentNodeIndex !== -1) {
        const currentNode = this.nodes[currentNodeIndex];
        
        // 修复：保留节点的位置信息（x, y, vx, vy, fx, fy）
        this.nodes[currentNodeIndex] = {
          ...currentNode,
          name: updatedData.name || currentNode.name,
          label: updatedData.label || currentNode.label,
          properties: {
            ...currentNode.properties,
            ...updatedData.properties
          },
          // 保留位置和速度信息
          x: currentNode.x,
          y: currentNode.y,
          vx: currentNode.vx,
          vy: currentNode.vy,
          fx: currentNode.fx,
          fy: currentNode.fy
        };
        console.log('[LOCAL UPDATE] 当前显示节点已更新:', this.nodes[currentNodeIndex]);
      }
      
      // 如果节点名称发生了变化，需要更新所有相关关系中的节点引用
      if (nameChanged) {
        console.log('[LOCAL UPDATE] 节点名称发生变化，更新关系引用:', originalNodeName, '->', newNodeName);
        
        // 更新 relationships 数组中的引用
        if (this.originalData.relationships) {
          this.originalData.relationships.forEach(rel => {
            if (rel.source === originalNodeName) {
              rel.source = newNodeName;
            }
            if (rel.target === originalNodeName) {
              rel.target = newNodeName;
            }
          });
        }
        
        // 更新 relations 数组中的引用
        if (this.originalData.relations) {
          this.originalData.relations.forEach(rel => {
            if (rel.source === originalNodeName) {
              rel.source = newNodeName;
            }
            if (rel.target === originalNodeName) {
              rel.target = newNodeName;
            }
          });
        }
        
        // 更新当前显示的 links 数组中的引用
        this.links.forEach(link => {
          const linkSource = typeof link.source === 'object' ? link.source.name : link.source;
          const linkTarget = typeof link.target === 'object' ? link.target.name : link.target;
          
          if (linkSource === originalNodeName) {
            if (typeof link.source === 'object') {
              link.source.name = newNodeName;
              // 修复：同时更新对象的其他属性
              if (updatedData.properties) {
                link.source.properties = { ...link.source.properties, ...updatedData.properties };
              }
              if (updatedData.label) {
                link.source.label = updatedData.label;
              }
            } else {
              link.source = newNodeName;
            }
          }
          if (linkTarget === originalNodeName) {
            if (typeof link.target === 'object') {
              link.target.name = newNodeName;
              // 修复：同时更新对象的其他属性
              if (updatedData.properties) {
                link.target.properties = { ...link.target.properties, ...updatedData.properties };
              }
              if (updatedData.label) {
                link.target.label = updatedData.label;
              }
            } else {
              link.target = newNodeName;
            }
          }
        });
        
        // 修复：更新选中节点的引用，确保属性面板显示最新数据
        if (this.selectedNode && this.selectedNode.name === originalNodeName) {
          this.selectedNode = {
            ...this.selectedNode,
            name: newNodeName,
            label: updatedData.label || this.selectedNode.label,
            properties: {
              ...this.selectedNode.properties,
              ...updatedData.properties
            }
          };
          console.log('[LOCAL UPDATE] 选中节点引用已更新:', this.selectedNode);
        }
      } else {
        // 修复：即使名称没有变化，也要更新选中节点的属性
        if (this.selectedNode && this.selectedNode.name === originalNodeName) {
          this.selectedNode = {
            ...this.selectedNode,
            label: updatedData.label || this.selectedNode.label,
            properties: {
              ...this.selectedNode.properties,
              ...updatedData.properties
            }
          };
          console.log('[LOCAL UPDATE] 选中节点属性已更新:', this.selectedNode);
        }
      }
      
      // 修复：使用更可靠的增量更新方法
      this.incrementalUpdateDisplayWithLabelFix();
      
      // 如果更新的是当前选中的节点，强制刷新属性面板
      if (this.selectedNode && (this.selectedNode.name === originalNodeName || this.selectedNode.name === newNodeName)) {
        setTimeout(() => {
          this.forceRefreshPropertiesPanel();
        }, 200);
      }
      
      console.log('[LOCAL UPDATE] 节点更新完成，图谱已刷新');
    },

    // 本地删除节点
    deleteNodeLocally(nodeName) {
      console.log('[LOCAL UPDATE] 本地删除节点:', nodeName);
      
      if (!this.originalData) {
        console.warn('[LOCAL UPDATE] 原始数据不存在，无法本地删除节点');
        return;
      }
      
      // 统计删除前的数据
      const beforeNodes = this.originalData.nodes.length;
      const beforeRelationships = this.originalData.relationships ? this.originalData.relationships.length : 0;
      const beforeRelations = this.originalData.relations ? this.originalData.relations.length : 0;
      
      // 删除节点
      this.originalData.nodes = this.originalData.nodes.filter(n => n.name !== nodeName);
      
      // 从当前显示的nodes数组中删除节点
      this.nodes = this.nodes.filter(n => n.name !== nodeName);
      
      // 删除与该节点相关的所有关系（relationships字段）
      let deletedRelationships = [];
      if (this.originalData.relationships) {
        deletedRelationships = this.originalData.relationships.filter(r => 
          r.source === nodeName || r.target === nodeName
        );
        this.originalData.relationships = this.originalData.relationships.filter(r => 
          r.source !== nodeName && r.target !== nodeName
        );
      }
      
      // 删除与该节点相关的所有关系（relations字段）
      let deletedRelations = [];
      if (this.originalData.relations) {
        deletedRelations = this.originalData.relations.filter(r => 
          r.source === nodeName || r.target === nodeName
        );
        this.originalData.relations = this.originalData.relations.filter(r => 
          r.source !== nodeName && r.target !== nodeName
        );
      }
      
      // 从当前显示的links数组中删除相关关系
      this.links = this.links.filter(link => {
        const linkSource = typeof link.source === 'string' ? link.source : link.source.name;
        const linkTarget = typeof link.target === 'string' ? link.target : link.target.name;
        return linkSource !== nodeName && linkTarget !== nodeName;
      });
      
      console.log('[LOCAL UPDATE] 删除结果: 节点', beforeNodes, '->', this.originalData.nodes.length);
      console.log('[LOCAL UPDATE] 删除结果: relationships', beforeRelationships, '->', (this.originalData.relationships ? this.originalData.relationships.length : 0));
      console.log('[LOCAL UPDATE] 删除结果: relations', beforeRelations, '->', (this.originalData.relations ? this.originalData.relations.length : 0));
      console.log('[LOCAL UPDATE] 删除的relationships:', deletedRelationships);
      console.log('[LOCAL UPDATE] 删除的relations:', deletedRelations);
      
      // 清理选中状态
      if (this.selectedNode && this.selectedNode.name === nodeName) {
        this.selectedNode = null;
      }
      
      // 修复：使用带标签修复的增量更新
      this.incrementalUpdateDisplayWithLabelFix();
      
      console.log('[LOCAL UPDATE] 节点删除完成，图谱已刷新');
    },







    // 获取合并的连接标签
    getMergedLinkLabels(links) {
      console.log('[MERGE LABELS] 开始合并连接标签，输入links数量:', links.length);
      
      const nodeRelations = new Map();
      
      links.forEach((link, index) => {
        // 确保获取正确的节点名称
        const sourceId = typeof link.source === 'object' ? link.source.name : link.source;
        const targetId = typeof link.target === 'object' ? link.target.name : link.target;
        
        // 统一获取关系类型，优先使用relation_type
        const relationType = link.relation_type || link.type;
        
        if (!sourceId || !targetId || !relationType) {
          console.warn('[MERGE LABELS] 跳过无效链接:', { sourceId, targetId, relationType, link });
          return;
        }
        
        // 创建唯一键，保持方向性
        const key = `${sourceId}-${targetId}-${relationType}`;
        
        if (!nodeRelations.has(key)) {
          // 确保source和target是节点对象
          const sourceNode = typeof link.source === 'object' ? link.source : this.nodes.find(n => n.name === sourceId);
          const targetNode = typeof link.target === 'object' ? link.target : this.nodes.find(n => n.name === targetId);
          
          if (!sourceNode || !targetNode) {
            console.warn('[MERGE LABELS] 找不到对应的节点对象:', { sourceId, targetId });
            return;
          }
          
          nodeRelations.set(key, {
            source: sourceNode,
            target: targetNode,
            type: relationType,
            types: [relationType],
            count: 1,
            offsetY: 0
          });
        } else {
          const rel = nodeRelations.get(key);
          if (!rel.types.includes(relationType)) {
            rel.types.push(relationType);
            rel.type = rel.types.join('/');
          }
          rel.count++;
        }
      });
      
      const mergedLinks = Array.from(nodeRelations.values()).map((rel, index) => {
        const baseOffset = 10;
        let offsetY = 0;
        
        if (rel.count > 1) {
          offsetY = baseOffset * Math.min(rel.count - 1, 2);
        }
        
        rel.offsetY = offsetY;
        return rel;
      });
      
      console.log('[MERGE LABELS] 合并完成，输出标签数量:', mergedLinks.length);
      console.log('[MERGE LABELS] 标签详情:', mergedLinks.map(l => `${l.source.name}->${l.target.name}(${l.type})`));
      
      return mergedLinks;
    },
    
    // 翻译关系类型
    translateRelationType(type) {
      if (type.includes('/')) {
        const types = type.split('/');
        return types.map(t => this.relationTypeMap[t] || t).join('/');
      }
      return this.relationTypeMap[type] || type;
    },

    // 反向翻译关系类型（中文到英文）
    reverseTranslateRelationType(chineseType) {
      // 创建反向映射（完整支持四层结构） - 与 relationTypeMap 保持一致
      const reverseMap = {
        // 四层结构层次关系 - 使用唯一的中文名称
        "包含章节": "CONTAINS_CHAPTER",
        "属于课程": "BELONGS_TO_CHAPTER",
        "包含节段": "CONTAINS_SECTION",
        "属于节段": "BELONGS_TO_SECTION",
        "包含": "CONTAINS",
        "属于": "BELONGS_TO",
        
        // 学习顺序关系
        "先修于": "PREREQUISITE",
        "后续": "PREREQUISITE_FOR",
        
        // 并行和相关关系
        "并行": "PARALLEL",
        "相关": "RELATED_TO",
        "相似": "SIMILAR_TO",
        
        // 应用和扩展关系
        "应用": "APPLICATION",
        "扩展": "EXTENSION",
        "依赖": "DEPENDENCY",
        
        // 实现和定义关系
        "实现": "IMPLEMENTS",
        "定义": "DEFINES",
        
        // 其他关系
        "部分": "PART_OF",
        "包括": "INCLUDES",
        "跟随": "FOLLOWS",
        "依赖于": "DEPENDS_ON",
        "应用于": "APPLIES_TO",
        "用于": "USED_IN",
        "子集": "SUBSET_OF",
        "实例": "INSTANCE_OF",
        "定义于": "DEFINED_BY",
        "实现于": "IMPLEMENTED_IN"
      };

      if (chineseType.includes('/')) {
        const types = chineseType.split('/');
        return types.map(t => reverseMap[t] || t).join('/');
      }
      return reverseMap[chineseType] || chineseType;
    },
    
    // 获取实体颜色
    getEntityColor(type) {
      return this.colors[type] || this.colors.DEFAULT;
    },

    // 获取CSRF Token
    getCsrfToken() {
      // 尝试从meta标签获取
      let token = document.querySelector('meta[name="csrf-token"]');
      if (token) {
        return token.getAttribute('content');
      }

      // 尝试从input字段获取
      token = document.querySelector('[name=csrfmiddlewaretoken]');
      if (token) {
        return token.value;
      }

      // 尝试从cookie获取
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrftoken') {
          return decodeURIComponent(value);
        }
      }

      return '';
    },

    // 隐藏模态框
    hideModal(modalId) {
      console.log('隐藏模态框:', modalId);
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        // 重新检查Bootstrap是否已加载
        if (!bootstrap) {
          checkBootstrap();
        }

        if (bootstrap && bootstrap.Modal) {
          const modal = bootstrap.Modal.getInstance(modalElement);
          if (modal) {
            modal.hide();
          } else {
            // 尝试创建新的模态框实例并隐藏
            const newModal = new bootstrap.Modal(modalElement);
            newModal.hide();
          }
        } else {
          console.warn('Bootstrap未加载，使用回退方案隐藏模态框');
          // 回退方案：直接隐藏元素
          modalElement.style.display = 'none';
          modalElement.classList.remove('show');
          modalElement.style.position = '';
          modalElement.style.top = '';
          modalElement.style.left = '';
          modalElement.style.transform = '';
          modalElement.style.zIndex = '';
        }
      }
    },

    // 显示模态框
    showModal(modalId) {
      console.log('显示模态框:', modalId);
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        // 重新检查Bootstrap是否已加载
        if (!bootstrap) {
          checkBootstrap();
        }

        if (bootstrap && bootstrap.Modal) {
          const modal = new bootstrap.Modal(modalElement);
          modal.show();
        } else {
          console.warn('Bootstrap未加载，使用回退方案显示模态框');
          // 回退方案：直接显示元素
          modalElement.style.display = 'block';
          modalElement.classList.add('show');
          modalElement.style.position = 'fixed';
          modalElement.style.top = '50%';
          modalElement.style.left = '50%';
          modalElement.style.transform = 'translate(-50%, -50%)';
          modalElement.style.zIndex = '1050';
        }
      } else {
        console.error('找不到模态框元素:', modalId);
      }
    },

    // 重置表单
    resetForm(formData) {
      for (let key in formData) {
        if (typeof formData[key] === 'string') {
          formData[key] = '';
        } else if (typeof formData[key] === 'object') {
          formData[key] = {};
        }
      }
    },

    // ===== 选中和交互方法 =====

    // 选中节点
    selectNode(node) {
      this.selectedNode = node;
      this.selectedLink = null;
      this.updateSelectionVisuals();
      this.showProperties(node);
      
      // 修复：为选中节点的标签添加 selected 类
      if (this.nodeLabels) {
        this.nodeLabels
          .classed('selected', d => this.isNodeSelected(d));
      }
      
      // 增强：为选中的节点添加脉冲动画效果，使其更加醒目
      if (this.nodeElements) {
        this.nodeElements
          .filter(d => this.isNodeSelected(d))
          .transition()
          .duration(300)
          .attr('r', d => {
            const baseRadius = d.label === "Course" ? 70 : 
                              d.label === "Chapter" ? 60 : 
                              d.label === "Section" ? 55 : 50;
            return baseRadius * 1.1; // 放大10%
          })
          .transition()
          .duration(300)
          .attr('r', d => {
            return d.label === "Course" ? 70 : 
                   d.label === "Chapter" ? 60 : 
                   d.label === "Section" ? 55 : 50;
          });
      }
    },

    // 选中关系
    selectLink(link) {
      this.selectedLink = link;
      this.selectedNode = null;
      this.updateSelectionVisuals();
    },

    // 判断节点是否被选中
    isNodeSelected(node) {
      return this.selectedNode && this.selectedNode.id === node.id;
    },

    // 判断关系是否被选中
    isLinkSelected(link) {
      return this.selectedLink &&
             this.selectedLink.source.name === link.source.name &&
             this.selectedLink.target.name === link.target.name;
    },

    // 更新选中状态的视觉效果
    updateSelectionVisuals() {
      if (this.nodeElements) {
        this.nodeElements
          .attr("stroke", d => this.isNodeSelected(d) ? "#ff6b6b" : "#fff")
          .attr("stroke-width", d => this.isNodeSelected(d) ? 4 : 2);
      }

      // 修复：更新foreignObject标签的颜色
      if (this.nodeLabels) {
        this.nodeLabels.html(d => {
          const fontSize = d.label === "Course" ? "15px" : 
                          d.label === "Chapter" ? "14px" : 
                          d.label === "Section" ? "13px" : "12px";
          const fontWeight = d.label === "Course" ? "bold" : "700";
          const color = this.isNodeSelected(d) ? "#ff6b6b" : "#ffffff";
          
          return `
            <div xmlns="http://www.w3.org/1999/xhtml" style="
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              text-align: center;
              font-size: ${fontSize};
              font-weight: ${fontWeight};
              color: ${color};
              line-height: 1.3;
              padding: 5px;
              word-wrap: break-word;
              overflow-wrap: break-word;
              text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5), 0 0 2px rgba(0, 0, 0, 0.3);
            ">
              ${d.name}
            </div>
          `;
        });
      }

      if (this.linkElements) {
        this.linkElements
          .attr("stroke", d => {
            if (this.isLinkSelected(d)) return "#ff6b6b";
            // 使用基于节点类型的样式
            const style = this.getStyleByNodeTypes(d);
            return style.color;
          })
          .attr("stroke-width", d => {
            if (this.isLinkSelected(d)) return 3;
            // 使用基于节点类型的样式
            const style = this.getStyleByNodeTypes(d);
            return style.width;
          })
          .attr("marker-end", d => {
            // 修复：保持箭头显示
            if (this.isLinkSelected(d)) {
              return "url(#arrowhead-selected)";
            }
            
            const relType = d.type || d.relation_type;
            
            if (relType === 'PREREQUISITE' || relType === 'PREREQUISITE_FOR') {
              return "url(#arrowhead-prerequisite)";
            } else if (relType === 'PARALLEL') {
              return "url(#arrowhead-parallel)";
            } else if (relType === 'APPLICATION') {
              return "url(#arrowhead-application)";
            } else if (relType === 'EXTENSION') {
              return "url(#arrowhead-extension)";
            } else if (relType === 'DEPENDENCY') {
              return "url(#arrowhead-dependency)";
            } else if (relType === 'CONTAINS' || relType === 'CONTAINS_CHAPTER' || relType === 'CONTAINS_SECTION') {
              return "url(#arrowhead-contains)";
            } else if (relType === 'BELONGS_TO' || relType === 'BELONGS_TO_CHAPTER' || relType === 'BELONGS_TO_SECTION') {
              return "url(#arrowhead-belongs)";
            }
            
            return "url(#arrowhead)";
          });
      }
    },

    // 显示右键菜单
    showContextMenu(event, type, target) {
      // 防止在错误的时机显示菜单
      if (!event || !type || !target) {
        console.warn('右键菜单参数不完整，跳过显示');
        return;
      }
      
      console.log('显示右键菜单:', type, target);
      
      // 先隐藏之前的菜单
      this.hideContextMenu();
      
      // 使用nextTick确保DOM更新完成
      this.$nextTick(() => {
        this.contextMenu.show = true;
        this.contextMenu.x = event.clientX;
        this.contextMenu.y = event.clientY;
        this.contextMenu.type = type;
        this.contextMenu.target = target;

        // 设置选中状态
        if (type === 'node') {
          this.selectNode(target);
        } else if (type === 'link') {
          this.selectLink(target);
        }
        
        // 添加点击外部关闭菜单的监听器
        setTimeout(() => {
          document.addEventListener('click', this.handleContextMenuOutsideClick, { once: true });
        }, 100);
      });
    },

    // 隐藏右键菜单
    hideContextMenu() {
      console.log('隐藏右键菜单');
      this.contextMenu.show = false;
    },
    
    // 处理右键菜单外部点击
    handleContextMenuOutsideClick(event) {
      const contextMenuElement = event.target.closest('.context-menu');
      if (!contextMenuElement) {
        this.hideContextMenu();
      }
    },

    // 背景点击事件
    handleBackgroundClick(event) {
      // 检查是否点击在图谱容器内，但排除SVG元素和模态框
      const container = this.$refs.graphContainer;
      const isModal = event.target.closest('.modal');
      const isContextMenu = event.target.closest('.context-menu');
      const isPropertiesPanel = event.target.closest('.properties-panel');
      const isSidebar = event.target.closest('.sidebar');
      const isSvgElement = event.target.tagName === 'svg' || event.target.tagName === 'circle' || event.target.tagName === 'line';
      
      // 点击图谱容器空白处取消选中
      if (container && container.contains(event.target) && !isModal && !isContextMenu && !isPropertiesPanel && !isSidebar && !isSvgElement) {
        this.selectedNode = null;
        this.selectedLink = null;
        this.hideContextMenu();
        this.updateSelectionVisuals();
        this.closePropertiesPanel();
      }
    },
    
    // 点击外部关闭下拉框
    handleClickOutside(event) {
      const courseDropdown = event.target.closest('.custom-select-wrapper');
      if (!courseDropdown) {
        this.courseDropdownOpen = false;
        this.chapterDropdownOpen = false;
      }
    },
    
    // 切换左侧功能栏显示/隐藏
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed;
      
      // 保存用户偏好到localStorage
      try {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(this.sidebarCollapsed));
      } catch (error) {
        console.warn('保存侧边栏状态失败:', error);
      }
      
      // 延迟调整SVG大小，确保CSS过渡完成
      setTimeout(() => {
        this.adjustSvgSize();
      }, 350); // 稍微大于CSS过渡时间(0.3s)
    },
    
    // 调整SVG大小以适应容器
    adjustSvgSize() {
      if (!this.svg || !this.$refs.graphContainer) return;
      
      const container = this.$refs.graphContainer;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      console.log('[SVG RESIZE] 调整SVG大小:', { width, height });
      
      // 更新SVG尺寸
      this.svg
        .attr("width", width)
        .attr("height", height);
      
      // 如果有模拟器，轻微重启以重新计算布局
      if (this.simulation) {
        this.simulation.alpha(0.1).restart();
        setTimeout(() => {
          if (this.simulation) {
            this.simulation.stop();
          }
        }, 200);
      }
    },
    
    // 初始化侧边栏状态
    initSidebarState() {
      try {
        const savedState = localStorage.getItem('sidebarCollapsed');
        if (savedState !== null) {
          this.sidebarCollapsed = JSON.parse(savedState);
        }
      } catch (error) {
        console.warn('恢复侧边栏状态失败:', error);
        this.sidebarCollapsed = false;
      }
    },

    // ===== 增删改功能方法 =====

    // 显示创建节点模态框
    showCreateCourseModal() {
      // 获取课程列表（用于可能的引用）
      this.loadCourseList();

      this.newNode = {
        name: '',
        label: 'Course',
        description: '',
        semester: '',
        category: '',
        credits: null,
        courseName: '',
        difficulty: '',
        importance: '',
        properties: { description: '' },
        propertiesJson: ''
      };
      this.showModal('createNodeModal');
    },

    showCreateKnowledgePointModal() {
      // 获取课程列表
      this.loadCourseList();

      this.newNode = {
        name: '',
        label: 'KnowledgePoint',
        description: '',
        semester: '',
        category: '',
        credits: null,
        courseName: '',
        difficulty: '',
        importance: '',
        properties: { description: '' },
        propertiesJson: ''
      };
      this.showModal('createNodeModal');
    },

    showCreateNodeModal() {
      this.newNode = {
        name: '',
        label: 'KnowledgePoint',
        properties: { description: '' },
        propertiesJson: ''
      };
      this.showModal('createNodeModal');
    },

    // 快捷创建章（从课程节点）
    showQuickCreateChapterModal() {
      if (!this.selectedNode || this.selectedNode.label !== 'Course') {
        alert('请先选择一个课程节点');
        return;
      }

      this.quickCreateChapterData = {
        courseName: this.selectedNode.name,
        chapterName: '',
        description: ''
      };

      this.showModal('quickCreateChapterModal');
    },

    // 快捷创建节（从章节点）
    showQuickCreateSectionModal() {
      if (!this.selectedNode || this.selectedNode.label !== 'Chapter') {
        alert('请先选择一个章节点');
        return;
      }

      this.quickCreateSectionData = {
        chapterName: this.selectedNode.name,
        sectionName: '',
        description: ''
      };

      this.showModal('quickCreateSectionModal');
    },

    // 快捷创建知识点（从节节点）
    showQuickCreateKnowledgePointModal() {
      if (!this.selectedNode || this.selectedNode.label !== 'Section') {
        alert('请先选择一个节节点');
        return;
      }

      this.quickCreateKnowledgePointData = {
        sectionName: this.selectedNode.name,
        knowledgePointName: '',
        description: '',
        difficulty: '',
        importance: ''
      };

      this.showModal('quickCreateKnowledgePointModal');
    },

    // 快捷创建相关知识点（从知识点节点）
    showQuickCreateRelatedKnowledgePointModal() {
      if (!this.selectedNode || this.selectedNode.label !== 'KnowledgePoint') {
        alert('请先选择一个知识点节点');
        return;
      }

      this.quickCreateRelatedKnowledgePointData = {
        sourceKnowledgePoint: this.selectedNode.name,
        knowledgePointName: '',
        description: '',
        difficulty: '',
        importance: '',
        relationType: 'RELATED_TO'
      };

      this.showModal('quickCreateRelatedKnowledgePointModal');
    },

    // 获取课程列表
    async loadCourseList() {
      console.log('[LOAD COURSES] 开始加载课程列表');
      
      try {
        // 先强制从Neo4j重新加载数据，确保获取最新的完整数据
        console.log('[LOAD COURSES] 正在从Neo4j重新加载数据...');
        try {
          const reloadResponse = await fetch(`${this.baseUrl}reload_from_neo4j/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': this.getCsrfToken()
            }
          });
          
          const reloadData = await reloadResponse.json();
          if (reloadData.success) {
            console.log('[LOAD COURSES] Neo4j数据重新加载成功:', reloadData.data_count);
          } else {
            console.warn('[LOAD COURSES] Neo4j数据重新加载失败，继续使用现有数据');
          }
        } catch (reloadError) {
          console.warn('[LOAD COURSES] 重新加载数据时出错，继续使用现有数据:', reloadError);
        }
        
        // 查询所有课程
        const response = await fetch(`${this.baseUrl}query/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({ query: '显示所有课程' })
        });
        
        const data = await response.json();
        
        if (data.success && data.nodes) {
          this.courseList = data.nodes.filter(node => node.label === 'Course');
          this.filteredCourseList = this.courseList;
          this.courseSearchKeyword = '';
          console.log('[LOAD COURSES] 课程列表加载成功:', this.courseList.length, '个课程');
          console.log('[LOAD COURSES] 课程列表:', this.courseList.map(c => c.name));
        } else {
          console.warn('[LOAD COURSES] 未找到课程数据');
          this.courseList = [];
          this.filteredCourseList = [];
        }
      } catch (error) {
        console.error('[LOAD COURSES] 加载课程列表失败:', error);
        this.courseList = [];
        this.filteredCourseList = [];
      }
    },

    // 显示更新节点模态框
    showUpdateNodeModal() {
      if (!this.selectedNode) {
        alert('请先选择一个节点');
        return;
      }

      const properties = this.selectedNode.properties || {};
      
      // 根据节点类型初始化不同的数据
      this.updateNodeData = {
        name: this.selectedNode.name || '',
        label: this.selectedNode.label || 'Entity',
        description: properties.description || '',
        semester: properties.semester || '',
        category: properties.category || '',
        credits: properties.credits !== undefined && properties.credits !== null ? properties.credits : null,
        courseName: properties.course || '',
        difficulty: properties.difficulty || '',
        importance: properties.importance || '',
        propertiesJson: JSON.stringify(properties, null, 2)
      };
      
      this.$nextTick(() => {
        console.log('[UPDATE MODAL] 初始化更新数据:', this.updateNodeData);
        this.showModal('updateNodeModal');
      });
    },

    // 显示删除节点模态框
    showDeleteNodeModal() {
      if (!this.selectedNode) {
        alert('请先选择一个节点');
        return;
      }
      this.showModal('deleteNodeModal');
    },

    // 处理右键菜单操作
    handleContextMenuAction(action) {
      console.log('右键菜单操作:', action, '当前选中节点:', this.selectedNode ? this.selectedNode.name : '无');
      console.log('[DEBUG] 操作开始前视图状态检查');
      if (this.zoom && this.svg) {
        try {
          const initialTransform = d3.zoomTransform(this.svg.node());
          console.log('[DEBUG] 操作开始前视图状态:', initialTransform);
        } catch (error) {
          console.warn('[DEBUG] 获取视图状态失败:', error);
        }
      }

      this.hideContextMenu();

      // 设置右击操作状态
      this.isContextMenuOperation = true;
      
      // 设置操作来源标志和锁
      this.operationSource.isFromContextMenu = true;
      this.operationSource.nodeName = this.selectedNode ? this.selectedNode.name : '';
      this.contextMenuLock = true;
      console.log('[DEBUG] 设置操作来源标志和锁: isFromContextMenu =', this.operationSource.isFromContextMenu, 'isContextMenuOperation =', this.isContextMenuOperation, 'lock =', this.contextMenuLock);

      switch (action) {
        case 'createNode':
          this.showCreateNodeModal();
          break;
        case 'createChapter':
          this.showQuickCreateChapterModal();
          break;
        case 'createSection':
          this.showQuickCreateSectionModal();
          break;
        case 'createKnowledgePoint':
          this.showQuickCreateKnowledgePointModal();
          break;
        case 'createRelatedKnowledgePoint':
          this.showQuickCreateRelatedKnowledgePointModal();
          break;
        case 'createRelationship':
          this.showCreateRelationshipModal();
          break;
        case 'updateNode':
          this.showUpdateNodeModal();
          break;
        case 'updateRelationship':
          this.showUpdateRelationshipModal();
          break;
        case 'deleteNode':
          this.showDeleteNodeModal();
          break;
        case 'deleteRelationship':
          this.showDeleteRelationshipModal();
          break;
        case 'deleteCourseGraph':
          this.showDeleteCourseGraphModal();
          break;
      }
    },
    
    // 显示删除课程知识图谱模态框
    showDeleteCourseGraphModal() {
      if (!this.selectedNode || this.selectedNode.label !== 'Course') {
        alert('请先选择一个课程节点');
        return;
      }
      
      const courseName = this.selectedNode.name;
      
      // 第一次确认
      const confirmMsg = `⚠️ 警告：您即将删除课程《${courseName}》的整个知识图谱！\n\n` +
                        `此操作将删除：\n` +
                        `• 课程节点\n` +
                        `• 所有章节\n` +
                        `• 所有节段\n` +
                        `• 所有知识点\n` +
                        `• 所有相关关系\n\n` +
                        `此操作不可撤销！\n\n` +
                        `确定要继续吗？`;
      
      if (!confirm(confirmMsg)) {
        console.log('[DELETE COURSE] 用户取消删除操作');
        return;
      }
      
      // 第二次确认
      const finalConfirm = `最后确认：\n\n` +
                          `您真的要删除课程《${courseName}》的整个知识图谱吗？\n\n` +
                          `请输入课程名称以确认删除：`;
      
      const userInput = prompt(finalConfirm);
      
      if (userInput !== courseName) {
        if (userInput !== null) {
          alert('课程名称不匹配，删除操作已取消');
        }
        console.log('[DELETE COURSE] 用户取消删除操作或名称不匹配');
        return;
      }
      
      // 执行删除
      this.deleteCourseGraph(courseName);
    },
    
    // 删除课程知识图谱
    deleteCourseGraph(courseName) {
      console.log('[DELETE COURSE] 开始删除课程知识图谱:', courseName);
      
      const self = this;
      
      fetch(this.baseUrl + '/delete_course_graph/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCsrfToken()
        },
        body: JSON.stringify({
          course_name: courseName
        })
      })
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        if (data.success) {
          console.log('[DELETE COURSE] 删除成功:', data);
          self.showSuccess(`课程《${courseName}》的知识图谱已删除（${data.statistics.nodes_deleted}个节点，${data.statistics.relationships_deleted}个关系）`);
          
          // 清除选中状态
          self.selectedNode = null;
          self.selectedLink = null;
          
          // 重新加载课程列表
          self.loadCourseList();
          
          // 清空当前图谱显示
          self.nodes = [];
          self.links = [];
          self.originalData = null;
          
          // 重新渲染空图谱
          if (self.simulation) {
            self.simulation.nodes([]);
            self.simulation.force('link').links([]);
            self.simulation.alpha(1).restart();
          }
          
          console.log('[DELETE COURSE] 图谱数据已清空，等待用户选择新课程');
        } else {
          console.error('[DELETE COURSE] 删除失败:', data.error);
          self.showError('删除失败: ' + data.error);
        }
      })
      .catch(function(error) {
        console.error('[DELETE COURSE] 删除错误:', error);
        self.showError('删除失败: ' + error.message);
      });
    },

    // 显示创建关系模态框
    showCreateRelationshipModal() {
      if (!this.selectedNode) {
        alert('请先选择一个节点作为源节点');
        return;
      }
      this.newRelationship = {
        source: this.selectedNode.name,
        target: '',
        relation_type: 'RELATED_TO'
      };
      this.showModal('createRelationshipModal');
    },

    // 显示更新关系模态框
    showUpdateRelationshipModal() {
      console.log('[DEBUG] showUpdateRelationshipModal 被调用');
      console.log('[DEBUG] selectedLink:', this.selectedLink);
      console.log('[DEBUG] selectedNode:', this.selectedNode);

      let link = this.selectedLink;

      // 如果没有直接选中的关系，尝试从选中的节点查找
      if (!link && this.selectedNode) {
        const relatedLinks = this.links.filter(l =>
          l.source.name === this.selectedNode.name || l.target.name === this.selectedNode.name
        );
        console.log('[DEBUG] relatedLinks:', relatedLinks);
        if (relatedLinks.length === 0) {
          alert('该节点没有相关关系');
          return;
        }
        link = relatedLinks[0];
      }

      if (!link) {
        alert('请先选择一个关系');
        return;
      }

      console.log('[DEBUG] 选中的关系:', link);
      console.log('[DEBUG] link.source:', link.source);
      console.log('[DEBUG] link.target:', link.target);
      console.log('[DEBUG] link.relation_type:', link.relation_type);
      console.log('[DEBUG] link.type:', link.type);

      // 获取源节点和目标节点的名称和标签
      let sourceName, targetName, sourceLabel, targetLabel;
      
      if (typeof link.source === 'object' && link.source !== null) {
        sourceName = link.source.name || link.source.id;
        sourceLabel = link.source.label;
      } else {
        sourceName = link.source;
        // 尝试从 nodes 数组中查找节点标签
        const sourceNode = this.nodes.find(n => n.name === sourceName || n.id === sourceName);
        sourceLabel = sourceNode ? sourceNode.label : null;
      }
      
      if (typeof link.target === 'object' && link.target !== null) {
        targetName = link.target.name || link.target.id;
        targetLabel = link.target.label;
      } else {
        targetName = link.target;
        // 尝试从 nodes 数组中查找节点标签
        const targetNode = this.nodes.find(n => n.name === targetName || n.id === targetName);
        targetLabel = targetNode ? targetNode.label : null;
      }
      
      console.log('[DEBUG] sourceName:', sourceName, 'sourceLabel:', sourceLabel);
      console.log('[DEBUG] targetName:', targetName, 'targetLabel:', targetLabel);
      
      // 直接使用当前 link 的关系类型，不再查找
      const currentRelationType = link.relation_type || link.type;
      console.log('[DEBUG] 当前关系类型:', currentRelationType);
      console.log('[DEBUG] 关系方向:', sourceName, '->', targetName);

      // 确保在模态框中显示中文关系类型
      const chineseRelationType = this.translateRelationType(currentRelationType);
      console.log('[DEBUG] 翻译后的关系类型:', chineseRelationType);

      this.updateRelationshipForm = {
        source: sourceName,
        target: targetName,
        source_label: sourceLabel,
        target_label: targetLabel,
        old_relation_type: chineseRelationType, // 显示中文
        old_relation_type_english: currentRelationType, // 保存原始英文类型
        new_relation_type: currentRelationType  // 默认选择当前的英文类型
      };
      this.showModal('updateRelationshipModal');
    },

    // 显示删除关系模态框
    showDeleteRelationshipModal() {
      let link = this.selectedLink;

      // 如果没有直接选中的关系，尝试从选中的节点查找
      if (!link && this.selectedNode) {
        const relatedLinks = this.links.filter(l =>
          l.source.name === this.selectedNode.name || l.target.name === this.selectedNode.name
        );
        if (relatedLinks.length === 0) {
          alert('该节点没有相关关系');
          return;
        }
        link = relatedLinks[0];
      }

      if (!link) {
        alert('请先选择一个关系');
        return;
      }

      console.log('[DEBUG] 删除关系 - 选中的关系:', link);
      console.log('[DEBUG] 删除关系 - link.source:', link.source);
      console.log('[DEBUG] 删除关系 - link.target:', link.target);
      console.log('[DEBUG] 删除关系 - link.relation_type:', link.relation_type);
      console.log('[DEBUG] 删除关系 - link.type:', link.type);

      // 获取源节点和目标节点的名称和标签
      let sourceName, targetName, sourceLabel, targetLabel;
      
      if (typeof link.source === 'object' && link.source !== null) {
        sourceName = link.source.name || link.source.id;
        sourceLabel = link.source.label;
      } else {
        sourceName = link.source;
        // 尝试从 nodes 数组中查找节点标签
        const sourceNode = this.nodes.find(n => n.name === sourceName || n.id === sourceName);
        sourceLabel = sourceNode ? sourceNode.label : null;
      }
      
      if (typeof link.target === 'object' && link.target !== null) {
        targetName = link.target.name || link.target.id;
        targetLabel = link.target.label;
      } else {
        targetName = link.target;
        // 尝试从 nodes 数组中查找节点标签
        const targetNode = this.nodes.find(n => n.name === targetName || n.id === targetName);
        targetLabel = targetNode ? targetNode.label : null;
      }
      
      console.log('[DEBUG] 删除关系 - sourceName:', sourceName, 'sourceLabel:', sourceLabel);
      console.log('[DEBUG] 删除关系 - targetName:', targetName, 'targetLabel:', targetLabel);
      
      // 直接使用当前 link 的关系类型，不再查找
      const currentRelationType = link.relation_type || link.type;
      console.log('[DEBUG] 删除关系 - 当前关系类型:', currentRelationType);
      console.log('[DEBUG] 删除关系 - 关系方向:', sourceName, '->', targetName);

      // 确保在模态框中显示中文关系类型
      const chineseRelationType = this.translateRelationType(currentRelationType);
      console.log('[DEBUG] 删除关系 - 翻译后的关系类型:', chineseRelationType);

      this.deleteRelationshipForm = {
        source: sourceName,
        target: targetName,
        source_label: sourceLabel,
        target_label: targetLabel,
        old_relation_type: chineseRelationType, // 显示中文
        old_relation_type_english: currentRelationType, // 保存原始英文类型
        new_relation_type: ''
      };
      this.showModal('deleteRelationshipModal');
    },


    // 创建节点
    async createNode() {
      try {
        // 构建属性对象
        let properties = {};

        if (this.newNode.label === 'Course') {
          // 课程节点的属性
          if (this.newNode.description) properties.description = this.newNode.description;
          if (this.newNode.category) properties.category = this.newNode.category;
          if (this.newNode.semester) properties.semester = this.newNode.semester;
          if (this.newNode.credits !== null && this.newNode.credits !== undefined) {
            properties.credits = parseFloat(this.newNode.credits);
          }
        } else if (this.newNode.label === 'KnowledgePoint') {
          // 知识点节点的属性
          if (this.newNode.description) properties.description = this.newNode.description;
          if (this.newNode.courseName) properties.course = this.newNode.courseName;
          if (this.newNode.difficulty) properties.difficulty = this.newNode.difficulty;
          if (this.newNode.importance) properties.importance = this.newNode.importance;
        } else {
          // 普通实体节点的属性
          if (this.newNode.description) properties.description = this.newNode.description;
        }

        // 合并JSON属性（如果有）
        if (this.newNode.propertiesJson) {
          try {
            const jsonProps = JSON.parse(this.newNode.propertiesJson);
            properties = { ...properties, ...jsonProps };
          } catch (e) {
            alert('属性JSON格式错误');
            return;
          }
        }

        console.log('发送创建节点请求:', {
          name: this.newNode.name,
          label: this.newNode.label,
          properties: properties
        });

        const response = await fetch(`${this.baseUrl}create_node/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            name: this.newNode.name,
            label: this.newNode.label,
            properties: properties
          })
        });

        const result = await response.json();
        console.log('创建节点响应:', result);

        if (result.success) {
          console.log('[DATABASE] 节点已成功保存到Neo4j数据库，现在进行本地更新');
          this.showSuccess(result.message);
          this.hideModal('createNodeModal');

          // 只有数据库操作成功后才进行本地更新
          const nodeData = {
            id: result.node_id || Date.now(),
            name: this.newNode.name,
            label: this.newNode.label,
            properties: properties
          };
          this.addNodeLocally(nodeData);

          // 更新统计信息
          await this.loadStatistics();

          // addNodeLocally已经包含了增量更新，不需要再次刷新
          
          // 延迟聚焦到新创建的节点，确保图谱已更新完成
          setTimeout(() => {
            console.log('[FOCUS] 聚焦到新创建的节点:', this.newNode.name);
            this.focusOnNode(this.newNode.name);
          }, 800); // 等待800ms确保图谱渲染完成

          // 重置操作来源标志
          this.operationSource.isFromContextMenu = false;
          this.operationSource.nodeName = '';
          this.contextMenuLock = false;
          this.isContextMenuOperation = false;
        } else {
          console.error('[DATABASE ERROR] 节点保存到Neo4j数据库失败:', result.error);
          this.showError('创建节点失败: ' + result.error + '（数据库操作未成功）');
          // 数据库操作失败时不进行本地更新，保持数据一致性
          
          // 重置操作来源标志
          this.operationSource.isFromContextMenu = false;
          this.operationSource.nodeName = '';
          this.contextMenuLock = false;
          this.isContextMenuOperation = false;
        }
      } catch (error) {
        console.error('创建节点失败:', error);
        this.showError('创建节点失败: ' + error.message);

        // 重置操作来源标志
        this.operationSource.isFromContextMenu = false;
        this.operationSource.nodeName = '';
        this.contextMenuLock = false;
        this.isContextMenuOperation = false;
      }
    },

    // 更新节点
    async updateNode() {
      try {
        console.log('[UPDATE NODE] 开始更新节点，当前数据:', this.updateNodeData);
        
        let properties = {};

        if (this.updateNodeData.label === 'Course') {
          // 课程节点的属性
          properties.description = this.updateNodeData.description || '';
          properties.category = this.updateNodeData.category || '';
          properties.semester = this.updateNodeData.semester || '';
          
          if (this.updateNodeData.credits === null || this.updateNodeData.credits === undefined || this.updateNodeData.credits === '') {
            properties.credits = null;
          } else {
            const creditsValue = parseFloat(this.updateNodeData.credits);
            properties.credits = isNaN(creditsValue) ? null : creditsValue;
          }
        } else if (this.updateNodeData.label === 'Chapter') {
          // 章节点的属性
          properties.description = this.updateNodeData.description || '';
        } else if (this.updateNodeData.label === 'Section') {
          // 节节点的属性
          properties.description = this.updateNodeData.description || '';
        } else if (this.updateNodeData.label === 'KnowledgePoint') {
          // 知识点节点的属性
          properties.description = this.updateNodeData.description || '';
          properties.difficulty = this.updateNodeData.difficulty || '';
          properties.importance = this.updateNodeData.importance || '';
        } else {
          // 通用实体节点的属性
          properties.description = this.updateNodeData.description || '';
        }

        if (this.updateNodeData.propertiesJson && this.updateNodeData.propertiesJson.trim()) {
          try {
            const jsonProps = JSON.parse(this.updateNodeData.propertiesJson);
            properties = { ...jsonProps, ...properties };
          } catch (e) {
            console.error('[UPDATE NODE] JSON属性解析失败:', e);
            this.showError('属性JSON格式错误: ' + e.message);
            return;
          }
        }

        console.log('[UPDATE NODE] 构建的属性对象:', properties);

        const requestData = {
          original_name: this.selectedNode.name,
          name: this.updateNodeData.name,
          label: this.updateNodeData.label,
          properties: properties
        };

        console.log('[UPDATE NODE] 发送更新请求:', requestData);

        const response = await fetch(`${this.baseUrl}update_node/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify(requestData)
        });

        const result = await response.json();
        console.log('[UPDATE NODE] 服务器响应:', result);

        if (result.success) {
          console.log('[DATABASE] 节点已成功更新到Neo4j数据库，现在进行本地更新');
          this.showSuccess(result.message);
          this.hideModal('updateNodeModal');
          
          const updatedData = {
            name: this.updateNodeData.name,
            label: this.updateNodeData.label,
            properties: properties
          };
          
          console.log('[UPDATE NODE] 本地更新数据:', updatedData);
          this.updateNodeLocally(this.selectedNode.name, updatedData);
          
          if (this.selectedNode && this.selectedNode.name === this.selectedNode.name) {
            this.selectedNode = {
              ...this.selectedNode,
              name: this.updateNodeData.name,
              label: this.updateNodeData.label,
              properties: properties
            };
            console.log('[UPDATE NODE] 已更新选中节点引用:', this.selectedNode);
            
            setTimeout(() => {
              this.forceRefreshPropertiesPanel();
            }, 100);
          }
          
        } else {
          console.error('[DATABASE ERROR] 节点更新到Neo4j数据库失败:', result.error);
          this.showError('更新节点失败: ' + result.error + '（数据库操作未成功）');
        }
      } catch (error) {
        console.error('[UPDATE NODE] 更新节点异常:', error);
        this.showError('更新节点失败: ' + error.message);
      }
    },

    // 删除节点
    async deleteNode() {
      try {
        console.log('发送删除节点请求:', {
          name: this.selectedNode.name
        });

        const response = await fetch(`${this.baseUrl}delete_node/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            name: this.selectedNode.name
          })
        });

        const result = await response.json();
        console.log('删除节点响应:', result);

        if (result.success) {
          console.log('[DATABASE] 节点已成功从Neo4j数据库删除，现在进行本地更新');
          this.showSuccess(result.message);
          this.hideModal('deleteNodeModal');
          const deletedNodeName = this.selectedNode.name;
          this.selectedNode = null;
          
          // 只有数据库操作成功后才进行本地删除
          this.deleteNodeLocally(deletedNodeName);
          
          // deleteNodeLocally已经包含了增量更新，不需要再次刷新
          
          // 更新统计信息
          await this.loadStatistics();

          // 操作完成后检查视图状态
          setTimeout(() => {
            console.log('[DEBUG] 操作完成后检查视图状态');
            if (this.zoom && this.svg) {
              try {
                const finalTransform = d3.zoomTransform(this.svg.node());
                console.log('[DEBUG] 最终视图状态:', finalTransform);
              } catch (error) {
                console.warn('[DEBUG] 获取最终视图状态失败:', error);
              }
            }
          }, 1500);

          // 重置操作来源标志
          this.operationSource.isFromContextMenu = false;
          this.operationSource.nodeName = '';
          this.contextMenuLock = false;
          this.isContextMenuOperation = false;
        } else {
          this.showError('删除失败: ' + result.error);
          // 重置操作来源标志
          if (this.debugMode) {
            console.log('重置操作来源标志: isFromContextMenu = false');
          }
          this.operationSource.isFromContextMenu = false;
          this.operationSource.nodeName = '';
        }
      } catch (error) {
        console.error('删除节点失败:', error);
        this.showError('删除节点失败: ' + error.message);

        // 重置操作来源标志
        this.operationSource.isFromContextMenu = false;
        this.operationSource.nodeName = '';
        this.contextMenuLock = false;
        this.isContextMenuOperation = false;
      }
    },

    // 创建关系
    async createRelationship() {
      try {
        // 使用空的属性对象，不再从JSON输入获取
        let properties = {};

        console.log('发送创建关系请求:', {
          source: this.newRelationship.source,
          target: this.newRelationship.target,
          relation_type: this.newRelationship.relation_type,
          properties: properties
        });

        const response = await fetch(`${this.baseUrl}create_relationship/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            source: this.newRelationship.source,
            target: this.newRelationship.target,
            relation_type: this.newRelationship.relation_type,
            properties: properties
          })
        });

        const result = await response.json();
        console.log('创建关系响应:', result);

        if (result.success) {
          console.log('[DATABASE] 关系已成功保存到Neo4j数据库，现在进行本地更新');
          this.showSuccess(result.message);
          this.hideModal('createRelationshipModal');

          // 检查源节点和目标节点是否都在当前显示的节点列表中
          const sourceNodeExists = this.nodes.find(node => node.name === this.newRelationship.source);
          const targetNodeExists = this.nodes.find(node => node.name === this.newRelationship.target);

          console.log('[RELATIONSHIP] 检查节点存在性:', {
            source: this.newRelationship.source,
            sourceExists: !!sourceNodeExists,
            target: this.newRelationship.target,
            targetExists: !!targetNodeExists
          });

          // 如果源节点或目标节点不在当前显示的节点列表中，从服务器获取缺失的节点
          if (!sourceNodeExists || !targetNodeExists) {
            console.log('[RELATIONSHIP] 节点不在当前显示列表中，从服务器获取缺失节点');

            const missingNodeNames = [];
            if (!sourceNodeExists) missingNodeNames.push(this.newRelationship.source);
            if (!targetNodeExists) missingNodeNames.push(this.newRelationship.target);

            try {
              // 从服务器获取缺失的节点信息
              const nodeResponse = await fetch(`${this.baseUrl}get_nodes_by_names/`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': this.getCsrfToken()
                },
                body: JSON.stringify({
                  node_names: missingNodeNames
                })
              });

              const nodeResult = await nodeResponse.json();
              console.log('[RELATIONSHIP] 服务器返回的节点信息:', nodeResult);

              if (nodeResult.success && nodeResult.nodes && nodeResult.nodes.length > 0) {
                // 添加获取到的节点到当前显示列表
                nodeResult.nodes.forEach(node => {
                  if (!this.nodes.find(n => n.name === node.name)) {
                    // 为新节点设置随机位置，避免重叠
                    const newNode = {
                      ...node,
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 200 - 100
                    };
                    this.nodes.push(newNode);
                    console.log('[RELATIONSHIP] 添加节点到显示列表:', node.name);
                  }
                });

                // 同时更新 originalData，确保数据一致性
                if (this.originalData && this.originalData.nodes) {
                  nodeResult.nodes.forEach(node => {
                    if (!this.originalData.nodes.find(n => n.name === node.name)) {
                      this.originalData.nodes.push(node);
                      console.log('[RELATIONSHIP] 添加节点到原始数据:', node.name);
                    }
                  });
                }

                // 更新D3节点显示
                this.updateNodeElements();
                console.log('[RELATIONSHIP] 节点添加完成，当前节点数量:', this.nodes.length);
              } else {
                console.warn('[RELATIONSHIP] 服务器未返回有效的节点信息');
                // 即使获取不到节点信息，关系仍然创建成功，只是在当前视图中可能看不到
                this.showWarning('关系创建成功，但部分节点未在当前视图中显示。请刷新页面查看完整图谱。');
              }
            } catch (error) {
              console.error('[RELATIONSHIP] 获取缺失节点信息失败:', error);
              this.showWarning('关系创建成功，但获取节点信息失败。请刷新页面查看完整图谱。');
            }
          }

          // 只有数据库操作成功后才进行本地添加关系
          const relationshipData = {
            id: result.relationship_id || Date.now(),
            source: this.newRelationship.source,
            target: this.newRelationship.target,
            relation_type: this.newRelationship.relation_type,
            properties: properties
          };
          this.addRelationshipLocally(relationshipData);

          // addRelationshipLocally已经包含了增量更新，不需要再次刷新

          // 更新统计信息
          await this.loadStatistics();



          // 重置操作来源标志
          this.operationSource.isFromContextMenu = false;
          this.operationSource.nodeName = '';
          this.contextMenuLock = false;
          this.isContextMenuOperation = false;
        } else {
          console.error('[DATABASE ERROR] 关系保存到Neo4j数据库失败:', result.error);
          this.showError('创建关系失败: ' + result.error + '（数据库操作未成功）');
          // 数据库操作失败时不进行本地更新，保持数据一致性
          
          // 重置操作来源标志
          this.operationSource.isFromContextMenu = false;
          this.operationSource.nodeName = '';
          this.contextMenuLock = false;
          this.isContextMenuOperation = false;
        }
      } catch (error) {
        console.error('创建关系失败:', error);
        this.showError('创建关系失败: ' + error.message);

        // 重置操作来源标志
        this.operationSource.isFromContextMenu = false;
        this.operationSource.nodeName = '';
        this.contextMenuLock = false;
        this.isContextMenuOperation = false;
      }
    },

    // 更新关系
    async updateRelationship() {
      try {
        // 检查表单数据是否存在
        if (!this.updateRelationshipForm) {
          throw new Error('updateRelationshipForm 数据不存在');
        }

        console.log('[DEBUG] updateRelationshipForm:', this.updateRelationshipForm);

        // 使用空的属性对象，不再从JSON输入获取
        let properties = {};

        // 使用保存的原始英文类型，而不是通过中文反向转换
        const englishOldRelationType = this.updateRelationshipForm.old_relation_type_english;
        // new_relation_type 在模态框中选择的是英文值，直接使用
        const englishNewRelationType = this.updateRelationshipForm.new_relation_type;

        console.log('[DEBUG] 关系类型转换结果:', {
          old_chinese: this.updateRelationshipForm.old_relation_type,
          old_english: englishOldRelationType,
          new_chinese: this.updateRelationshipForm.new_relation_type,
          new_english: englishNewRelationType
        });

        console.log('发送更新关系请求:', {
          source: this.updateRelationshipForm.source,
          target: this.updateRelationshipForm.target,
          source_label: this.updateRelationshipForm.source_label,
          target_label: this.updateRelationshipForm.target_label,
          old_relation_type: englishOldRelationType,
          new_relation_type: englishNewRelationType,
          original_old_type: this.updateRelationshipForm.old_relation_type,
          original_new_type: this.updateRelationshipForm.new_relation_type,
          properties: properties
        });

        const response = await fetch(`${this.baseUrl}update_relationship/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            source: this.updateRelationshipForm.source,
            target: this.updateRelationshipForm.target,
            source_label: this.updateRelationshipForm.source_label,
            target_label: this.updateRelationshipForm.target_label,
            old_relation_type: englishOldRelationType,
            new_relation_type: englishNewRelationType,
            properties: properties
          })
        });

        const result = await response.json();
        console.log('更新关系响应:', result);

        if (result.success) {
          console.log('[DATABASE] 关系已成功更新到Neo4j数据库，现在进行本地更新');
          this.showSuccess(result.message);
          this.hideModal('updateRelationshipModal');
          
          // 只有数据库操作成功后才进行本地更新关系
          this.updateRelationshipLocally(
            this.updateRelationshipForm.source,
            this.updateRelationshipForm.target,
            englishOldRelationType,
            englishNewRelationType,
            properties
          );
          
          // updateRelationshipLocally已经包含了增量更新，不需要再次刷新
          
          // 更新统计信息
          await this.loadStatistics();
        } else {
          console.error('[DATABASE ERROR] 关系更新到Neo4j数据库失败:', result.error);
          this.showError('更新关系失败: ' + result.error + '（数据库操作未成功）');
          // 数据库操作失败时不进行本地更新，保持数据一致性
        }
      } catch (error) {
        console.error('更新关系失败:', error);
        this.showError('更新关系失败: ' + error.message);
      }
    },

    // 处理更新关系（包装器方法）
    handleUpdateRelationship() {
      console.log('[DEBUG] handleUpdateRelationship 被调用');
      try {
        // 直接调用方法，避免类型检查导致的问题
        this.updateRelationship();
      } catch (error) {
        console.error('[ERROR] 调用 updateRelationship 失败:', error);
        alert('更新关系功能暂时不可用，请刷新页面后重试');
      }
    },

    // 删除关系
    async deleteRelationship() {
      try {
        // 使用保存的原始英文类型，而不是通过中文反向转换
        const englishRelationType = this.deleteRelationshipForm.old_relation_type_english;

        console.log('发送删除关系请求:', {
          source: this.deleteRelationshipForm.source,
          target: this.deleteRelationshipForm.target,
          source_label: this.deleteRelationshipForm.source_label,
          target_label: this.deleteRelationshipForm.target_label,
          relation_type: englishRelationType,
          original_type: this.deleteRelationshipForm.old_relation_type
        });

        const response = await fetch(`${this.baseUrl}delete_relationship/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            source: this.deleteRelationshipForm.source,
            target: this.deleteRelationshipForm.target,
            source_label: this.deleteRelationshipForm.source_label,
            target_label: this.deleteRelationshipForm.target_label,
            relation_type: englishRelationType
          })
        });

        const result = await response.json();
        console.log('删除关系响应:', result);

        if (result.success) {
          console.log('[DATABASE] 关系已成功从Neo4j数据库删除，现在进行本地更新');
          this.showSuccess(result.message);
          this.hideModal('deleteRelationshipModal');
          
          // 只有数据库操作成功后才进行本地删除关系
          this.deleteRelationshipLocally(
            this.deleteRelationshipForm.source,
            this.deleteRelationshipForm.target,
            englishRelationType
          );
          
          // deleteRelationshipLocally已经包含了增量更新，不需要再次刷新
          
          // 更新统计信息
          await this.loadStatistics();
        } else {
          console.error('[DATABASE ERROR] 关系删除从Neo4j数据库失败:', result.error);
          this.showError('删除关系失败: ' + result.error + '（数据库操作未成功）');
          // 数据库操作失败时不进行本地删除，保持数据一致性
        }
      } catch (error) {
        console.error('删除关系失败:', error);
        this.showError('删除关系失败: ' + error.message);
      }
    },

    // ===== 本地数据更新方法 =====



    // 处理删除关系（包装器方法）
    handleDeleteRelationship() {
      console.log('[DEBUG] handleDeleteRelationship 被调用');
      try {
        // 直接调用方法，避免类型检查导致的问题
        this.deleteRelationship();
      } catch (error) {
        console.error('[ERROR] 调用 deleteRelationship 失败:', error);
        alert('删除关系功能暂时不可用，请刷新页面后重试');
      }
    },

    // 快速创建章
    async quickCreateChapter() {
      try {
        if (!this.quickCreateChapterData.chapterName.trim()) {
          this.showError('请输入章名称');
          return;
        }

        // 1. 创建章节点
        const chapterResponse = await fetch(`${this.baseUrl}create_node/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            name: this.quickCreateChapterData.chapterName,
            label: 'Chapter',
            properties: {
              description: this.quickCreateChapterData.description || '',
              created_from: 'quick_create'
            }
          })
        });

        const chapterResult = await chapterResponse.json();
        if (!chapterResult.success) {
          this.showError('创建章失败: ' + chapterResult.error);
          return;
        }

        // 2. 创建关系（课程包含章）
        const relationshipResponse = await fetch(`${this.baseUrl}create_relationship/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            source: this.quickCreateChapterData.courseName,
            target: this.quickCreateChapterData.chapterName,
            relation_type: 'CONTAINS_CHAPTER',
            properties: { created_from: 'quick_create' }
          })
        });

        const relationshipResult = await relationshipResponse.json();
        if (relationshipResult.success) {
          this.showSuccess('章创建成功！');
          this.hideModal('quickCreateChapterModal');

          const savedChapterName = this.quickCreateChapterData.chapterName;
          const savedCourseName = this.quickCreateChapterData.courseName;
          const savedDescription = this.quickCreateChapterData.description || '';

          this.quickCreateChapterData = { courseName: '', chapterName: '', description: '' };

          // 本地更新
          this.addNodeLocally({
            id: chapterResult.node_id || Date.now(),
            name: savedChapterName,
            label: 'Chapter',
            properties: { description: savedDescription, created_from: 'quick_create' }
          });

          this.addRelationshipLocally({
            id: relationshipResult.relationship_id || Date.now() + 1,
            source: savedCourseName,
            target: savedChapterName,
            relation_type: 'CONTAINS_CHAPTER',
            properties: { created_from: 'quick_create' }
          });

          await this.loadStatistics();
          setTimeout(() => this.focusOnNode(savedChapterName), 800);

          this.operationSource.isFromContextMenu = false;
          this.operationSource.nodeName = '';
          this.contextMenuLock = false;
          this.isContextMenuOperation = false;
        } else {
          this.showError('创建关系失败: ' + relationshipResult.error);
        }
      } catch (error) {
        console.error('快速创建章失败:', error);
        this.showError('创建章失败: ' + error.message);
      }
    },

    // 快速创建节
    async quickCreateSection() {
      try {
        if (!this.quickCreateSectionData.sectionName.trim()) {
          this.showError('请输入节名称');
          return;
        }

        // 1. 创建节节点
        const sectionResponse = await fetch(`${this.baseUrl}create_node/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            name: this.quickCreateSectionData.sectionName,
            label: 'Section',
            properties: {
              description: this.quickCreateSectionData.description || '',
              created_from: 'quick_create'
            }
          })
        });

        const sectionResult = await sectionResponse.json();
        if (!sectionResult.success) {
          this.showError('创建节失败: ' + sectionResult.error);
          return;
        }

        // 2. 创建关系（章包含节）
        const relationshipResponse = await fetch(`${this.baseUrl}create_relationship/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            source: this.quickCreateSectionData.chapterName,
            target: this.quickCreateSectionData.sectionName,
            relation_type: 'CONTAINS_SECTION',
            properties: { created_from: 'quick_create' }
          })
        });

        const relationshipResult = await relationshipResponse.json();
        if (relationshipResult.success) {
          this.showSuccess('节创建成功！');
          this.hideModal('quickCreateSectionModal');

          const savedSectionName = this.quickCreateSectionData.sectionName;
          const savedChapterName = this.quickCreateSectionData.chapterName;
          const savedDescription = this.quickCreateSectionData.description || '';

          this.quickCreateSectionData = { chapterName: '', sectionName: '', description: '' };

          // 本地更新
          this.addNodeLocally({
            id: sectionResult.node_id || Date.now(),
            name: savedSectionName,
            label: 'Section',
            properties: { description: savedDescription, created_from: 'quick_create' }
          });

          this.addRelationshipLocally({
            id: relationshipResult.relationship_id || Date.now() + 1,
            source: savedChapterName,
            target: savedSectionName,
            relation_type: 'CONTAINS_SECTION',
            properties: { created_from: 'quick_create' }
          });

          await this.loadStatistics();
          setTimeout(() => this.focusOnNode(savedSectionName), 800);

          this.operationSource.isFromContextMenu = false;
          this.operationSource.nodeName = '';
          this.contextMenuLock = false;
          this.isContextMenuOperation = false;
        } else {
          this.showError('创建关系失败: ' + relationshipResult.error);
        }
      } catch (error) {
        console.error('快速创建节失败:', error);
        this.showError('创建节失败: ' + error.message);
      }
    },

    // 快速创建知识点（从节节点）
    async quickCreateKnowledgePoint() {
      try {
        if (!this.quickCreateKnowledgePointData.knowledgePointName.trim()) {
          this.showError('请输入知识点名称');
          return;
        }

        // 1. 创建知识点节点
        const knowledgePointResponse = await fetch(`${this.baseUrl}create_node/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            name: this.quickCreateKnowledgePointData.knowledgePointName,
            label: 'KnowledgePoint',
            properties: {
              description: this.quickCreateKnowledgePointData.description || '',
              difficulty: this.quickCreateKnowledgePointData.difficulty || '',
              importance: this.quickCreateKnowledgePointData.importance || '',
              created_from: 'quick_create'
            }
          })
        });

        const knowledgePointResult = await knowledgePointResponse.json();
        if (!knowledgePointResult.success) {
          this.showError('创建知识点失败: ' + knowledgePointResult.error);
          return;
        }

        // 2. 创建关系（节包含知识点，使用BELONGS_TO_SECTION反向关系）
        const relationshipResponse = await fetch(`${this.baseUrl}create_relationship/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            source: this.quickCreateKnowledgePointData.knowledgePointName,
            target: this.quickCreateKnowledgePointData.sectionName,
            relation_type: 'BELONGS_TO_SECTION',
            properties: { created_from: 'quick_create' }
          })
        });

        const relationshipResult = await relationshipResponse.json();
        if (relationshipResult.success) {
          this.showSuccess('知识点创建成功！');
          this.hideModal('quickCreateKnowledgePointModal');

          const savedKnowledgePointName = this.quickCreateKnowledgePointData.knowledgePointName;
          const savedSectionName = this.quickCreateKnowledgePointData.sectionName;
          const savedDescription = this.quickCreateKnowledgePointData.description || '';
          const savedDifficulty = this.quickCreateKnowledgePointData.difficulty || '';
          const savedImportance = this.quickCreateKnowledgePointData.importance || '';

          this.quickCreateKnowledgePointData = {
            sectionName: '',
            knowledgePointName: '',
            description: '',
            difficulty: '',
            importance: ''
          };

          // 本地更新
          this.addNodeLocally({
            id: knowledgePointResult.node_id || Date.now(),
            name: savedKnowledgePointName,
            label: 'KnowledgePoint',
            properties: {
              description: savedDescription,
              difficulty: savedDifficulty,
              importance: savedImportance,
              created_from: 'quick_create'
            }
          });

          this.addRelationshipLocally({
            id: relationshipResult.relationship_id || Date.now() + 1,
            source: savedKnowledgePointName,
            target: savedSectionName,
            relation_type: 'BELONGS_TO_SECTION',
            properties: { created_from: 'quick_create' }
          });

          await this.loadStatistics();
          setTimeout(() => this.focusOnNode(savedKnowledgePointName), 800);

          this.operationSource.isFromContextMenu = false;
          this.operationSource.nodeName = '';
          this.contextMenuLock = false;
          this.isContextMenuOperation = false;
        } else {
          this.showError('创建关系失败: ' + relationshipResult.error);
        }
      } catch (error) {
        console.error('快速创建知识点失败:', error);
        this.showError('创建知识点失败: ' + error.message);
      }
    },

    // 快速创建相关知识点（从知识点节点）
    async quickCreateRelatedKnowledgePoint() {
      try {
        if (!this.quickCreateRelatedKnowledgePointData.knowledgePointName.trim()) {
          this.showError('请输入知识点名称');
          return;
        }

        // 1. 创建知识点节点
        const knowledgePointResponse = await fetch(`${this.baseUrl}create_node/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            name: this.quickCreateRelatedKnowledgePointData.knowledgePointName,
            label: 'KnowledgePoint',
            properties: {
              description: this.quickCreateRelatedKnowledgePointData.description || '',
              difficulty: this.quickCreateRelatedKnowledgePointData.difficulty || '',
              importance: this.quickCreateRelatedKnowledgePointData.importance || '',
              created_from: 'quick_create'
            }
          })
        });

        const knowledgePointResult = await knowledgePointResponse.json();
        if (!knowledgePointResult.success) {
          this.showError('创建知识点失败: ' + knowledgePointResult.error);
          return;
        }

        // 2. 创建关系
        const relationshipResponse = await fetch(`${this.baseUrl}create_relationship/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            source: this.quickCreateRelatedKnowledgePointData.sourceKnowledgePoint,
            target: this.quickCreateRelatedKnowledgePointData.knowledgePointName,
            relation_type: this.quickCreateRelatedKnowledgePointData.relationType,
            properties: { created_from: 'quick_create' }
          })
        });

        const relationshipResult = await relationshipResponse.json();
        if (relationshipResult.success) {
          this.showSuccess('相关知识点创建成功！');
          this.hideModal('quickCreateRelatedKnowledgePointModal');

          const savedKnowledgePointName = this.quickCreateRelatedKnowledgePointData.knowledgePointName;
          const savedSourceKnowledgePoint = this.quickCreateRelatedKnowledgePointData.sourceKnowledgePoint;
          const savedRelationType = this.quickCreateRelatedKnowledgePointData.relationType;
          const savedDescription = this.quickCreateRelatedKnowledgePointData.description || '';
          const savedDifficulty = this.quickCreateRelatedKnowledgePointData.difficulty || '';
          const savedImportance = this.quickCreateRelatedKnowledgePointData.importance || '';

          this.quickCreateRelatedKnowledgePointData = {
            sourceKnowledgePoint: '',
            knowledgePointName: '',
            description: '',
            difficulty: '',
            importance: '',
            relationType: 'RELATED_TO'
          };

          // 本地更新
          this.addNodeLocally({
            id: knowledgePointResult.node_id || Date.now(),
            name: savedKnowledgePointName,
            label: 'KnowledgePoint',
            properties: {
              description: savedDescription,
              difficulty: savedDifficulty,
              importance: savedImportance,
              created_from: 'quick_create'
            }
          });

          this.addRelationshipLocally({
            id: relationshipResult.relationship_id || Date.now() + 1,
            source: savedSourceKnowledgePoint,
            target: savedKnowledgePointName,
            relation_type: savedRelationType,
            properties: { created_from: 'quick_create' }
          });

          await this.loadStatistics();
          setTimeout(() => this.focusOnNode(savedKnowledgePointName), 800);

          this.operationSource.isFromContextMenu = false;
          this.operationSource.nodeName = '';
          this.contextMenuLock = false;
          this.isContextMenuOperation = false;
        } else {
          this.showError('创建关系失败: ' + relationshipResult.error);
        }
      } catch (error) {
        console.error('快速创建相关知识点失败:', error);
        this.showError('创建知识点失败: ' + error.message);
      }
    },

    // 导出图谱数据
    exportGraphData() {
      if (!this.originalData) {
        this.showError('没有可导出的数据');
        return;
      }

      const dataStr = JSON.stringify(this.originalData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `knowledge_graph_${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    },

    // 显示成功消息
    showSuccess(message) {
      this.successMessage = message;
      this.showSuccessMessage = true;
      this.showErrorMessage = false;
      
      // 3秒后自动隐藏
      setTimeout(() => {
        this.hideSuccessMessage();
      }, 3000);
    },

    // 显示错误消息
    showError(message) {
      this.errorMessage = message;
      this.showErrorMessage = true;
      this.showSuccessMessage = false;
      
      // 5秒后自动隐藏
      setTimeout(() => {
        this.hideErrorMessage();
      }, 5000);
    },

    // 隐藏成功消息
    hideSuccessMessage() {
      this.showSuccessMessage = false;
      this.successMessage = '';
    },

    // 隐藏错误消息
    hideErrorMessage() {
      this.showErrorMessage = false;
      this.errorMessage = '';
    },

    // 显示警告消息
    showWarning(message) {
      this.warningMessage = message;
      this.showWarningMessage = true;
      this.showSuccessMessage = false;
      this.showErrorMessage = false;
      
      // 4秒后自动隐藏
      setTimeout(() => {
        this.hideWarningMessage();
      }, 4000);
    },

    // 隐藏警告消息
    hideWarningMessage() {
      this.showWarningMessage = false;
      this.warningMessage = '';
    },

    // ===== 学习资料管理方法 =====

    // 选择文件
    handleFileSelect(event) {
      this.selectedFile = event.target.files[0];
      if (this.selectedFile && !this.newMaterial.title) {
        // 如果没有设置标题，使用文件名作为默认标题
        this.newMaterial.title = this.selectedFile.name;
      }
    },

    // 上传学习资料
    async uploadMaterial() {
      if (!this.selectedFile || !this.selectedNode) {
        this.showError('请选择文件和节点');
        return;
      }

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('entity_name', this.selectedNode.name);
      formData.append('entity_type', this.selectedNode.label);
      formData.append('title', this.newMaterial.title);
      formData.append('description', this.newMaterial.description);
      formData.append('material_type', this.newMaterial.material_type);
      formData.append('uploaded_by', 'anonymous'); // 可以从用户会话获取

      try {
        const response = await fetch(`${this.baseUrl}upload_learning_material/`, {
          method: 'POST',
          headers: {
            'X-CSRFToken': this.getCsrfToken()
          },
          body: formData
        });

        const result = await response.json();

        if (result.success) {
          this.showSuccess(result.message);

          // 重置表单
          this.selectedFile = null;
          this.newMaterial = {
            title: '',
            description: '',
            material_type: 'document'
          };

          // 清空文件输入框
          const fileInput = document.querySelector('input[type="file"]');
          if (fileInput) {
            fileInput.value = '';
          }

          // 刷新资料列表
          this.refreshMaterials();
        } else {
          this.showError(result.error);
        }
      } catch (error) {
        console.error('上传学习资料失败:', error);
        this.showError('上传失败: ' + error.message);
      }
    },

    // 刷新学习资料列表
    async refreshMaterials() {
      if (!this.selectedNode) return;

      this.materialsLoading = true;
      try {
        const response = await fetch(`${this.baseUrl}get_learning_materials/?entity_name=${encodeURIComponent(this.selectedNode.name)}&entity_type=${encodeURIComponent(this.selectedNode.label)}`);
        const result = await response.json();

        if (result.success) {
          this.learningMaterials = result.data;
        } else {
          console.error('获取学习资料失败:', result.error);
        }
      } catch (error) {
        console.error('获取学习资料失败:', error);
      } finally {
        this.materialsLoading = false;
      }
    },

    // 查看学习资料（增加查看次数）
    async viewMaterial(material) {
      try {
        // 检查文件类型，决定如何处理
        const mimeType = material.file_mime_type || '';
        const isPreviewable = this.isFilePreviewable(mimeType);

        console.log('📄 文件类型检查:', {
          mimeType: mimeType,
          isPreviewable: isPreviewable,
          materialId: material.id,
          title: material.title
        });

        if (isPreviewable) {
          // 先发送POST请求记录查看次数
          try {
            await fetch(`${this.baseUrl}view_learning_material/${material.id}/`, {
              method: 'POST',
              headers: {
                'X-CSRFToken': this.getCsrfToken()
              }
            });
            console.log('✅ 查看次数记录成功');
          } catch (postError) {
            console.warn('⚠️ 记录查看次数失败，但继续查看文件:', postError);
          }

          // 构造查看文件的完整URL（使用GET请求）
          const viewUrl = `${this.baseUrl}view_learning_material/${material.id}/`;

          console.log('🔗 查看文件URL:', viewUrl);

          // 特殊处理PDF文件
          if (mimeType === 'application/pdf') {
            this.viewPDFMaterial(material, viewUrl);
          } else {
            // 其他可预览的文件类型，直接打开
            this.viewOtherMaterial(material, viewUrl);
          }
        } else {
          // 不可预览的文件类型，提示用户下载
          console.log('⚠️ 文件类型不支持预览:', mimeType);
          if (confirm(`此文件类型 (${mimeType}) 无法在浏览器中预览，是否下载文件？`)) {
            this.downloadMaterial(material);
          }
        }

        // 增加本地查看次数
        material.view_count++;
      } catch (error) {
        console.error('查看文件失败:', error);
        this.showError('查看文件失败: ' + error.message);
      }
    },

    // 下载学习资料
    async downloadMaterial(material) {
      try {
        const response = await fetch(`${this.baseUrl}download_learning_material/${material.id}/`);
        if (response.ok) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = material.file_name;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          // 增加本地下载次数
          material.download_count++;
        } else {
          this.showError('下载失败');
        }
      } catch (error) {
        console.error('下载失败:', error);
        this.showError('下载失败: ' + error.message);
      }
    },

    // 删除学习资料
    async deleteMaterial(material) {
      if (!confirm(`确定要删除资料 "${material.title}" 吗？`)) {
        return;
      }

      try {
        const response = await fetch(`${this.baseUrl}delete_learning_material/${material.id}/`, {
          method: 'DELETE',
          headers: {
            'X-CSRFToken': this.getCsrfToken()
          }
        });

        const result = await response.json();

        if (result.success) {
          this.showSuccess(result.message);
          // 从列表中移除
          this.learningMaterials = this.learningMaterials.filter(m => m.id !== material.id);
        } else {
          this.showError(result.error);
        }
      } catch (error) {
        console.error('删除学习资料失败:', error);
        this.showError('删除失败: ' + error.message);
      }
    },

    // 检查文件是否可以在浏览器中预览
    isFilePreviewable(mimeType) {
      // 可在浏览器中预览的文件类型
      const previewableTypes = [
        // 图片
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',

        // 文本文件
        'text/plain',
        'text/html',
        'text/css',
        'text/javascript',
        'application/json',
        'application/xml',

        // PDF
        'application/pdf',

        // 其他
        'text/markdown'
      ];

      return previewableTypes.includes(mimeType.toLowerCase());
    },

    // 专门处理PDF文件的查看
    viewPDFMaterial(material, fullUrl) {
      console.log('📕 查看PDF文件:', fullUrl);
      console.log('📋 PDF文件信息:', {
        id: material.id,
        title: material.title,
        mimeType: material.file_mime_type,
        fileSize: material.file_size
      });

      try {
        console.log('尝试打开PDF文件:', fullUrl);

        // 直接尝试在新的标签页中打开PDF
        const pdfWindow = window.open(fullUrl, '_blank');

        if (pdfWindow) {
          console.log('✅ PDF窗口已打开');

          // 设置窗口标题，便于识别
          try {
            pdfWindow.document.title = `PDF预览: ${material.title}`;
          } catch (e) {
            console.log('无法设置窗口标题（跨域限制）');
          }

          // 添加页面加载监听 - 增加延迟时间
          let loadTimer = setTimeout(() => {
            try {
              if (pdfWindow.closed) {
                console.log('PDF窗口已被关闭');
                return;
              }

              // 检查页面内容
              if (pdfWindow.document) {
                const title = pdfWindow.document.title || '';
                const bodyContent = pdfWindow.document.body ? pdfWindow.document.body.innerHTML.trim() : '';

                console.log('🔍 PDF页面检查结果:', {
                  title: title,
                  hasBody: !!pdfWindow.document.body,
                  bodyLength: bodyContent.length,
                  isEmpty: bodyContent === '',
                  url: pdfWindow.location ? pdfWindow.location.href : 'unknown'
                });

                // 如果页面为空或显示错误，提示用户
                const hasError = bodyContent === '' ||
                    bodyContent.includes('Not Found') ||
                    bodyContent.includes('404') ||
                    bodyContent.includes('错误') ||
                    bodyContent.includes('File not found') ||
                    bodyContent.includes('Page not found') ||
                    title.includes('404') ||
                    title.includes('Not Found') ||
                    title.includes('Error');

                if (hasError) {
                  console.warn('⚠️ PDF页面显示为空白或错误');
                  console.log('页面内容预览:', bodyContent.substring(0, 200));
                  this.showError('PDF文件无法正常显示，可能文件不存在或服务器配置问题，建议下载后查看');

                  // 延迟关闭窗口，给用户时间看到错误信息
                  setTimeout(() => {
                    if (!pdfWindow.closed) {
                      pdfWindow.close();
                    }
                  }, 3000);
                } else {
                  console.log('✅ PDF页面加载成功');
                }
              } else {
                console.log('⚠️ 无法访问PDF页面文档对象（跨域限制）');
              }
            } catch (e) {
              console.log('❌ 无法检查PDF页面内容（跨域限制）- 这是正常现象');
              console.log('错误详情:', e.message);
            }
          }, 3000); // 增加到3秒，给PDF加载更多时间

          // 清理定时器
          pdfWindow.onbeforeunload = () => {
            clearTimeout(loadTimer);
          };

        } else {
          // 如果弹出窗口被浏览器阻止
          console.warn('🚫 PDF查看窗口被浏览器阻止');
          this.showError('弹出窗口被浏览器阻止，请允许弹出窗口后重试');

          // 提供下载选项
          if (confirm('无法直接查看PDF文件，是否下载？')) {
            this.downloadMaterial(material);
          }
        }

      } catch (error) {
        console.error('❌ PDF查看过程中出错:', error);
        this.showError('PDF查看失败: ' + error.message);

        // 提供下载选项
        if (confirm('查看失败，是否下载文件？')) {
          this.downloadMaterial(material);
        }
      }
    },

    // 处理其他可预览文件的查看
    viewOtherMaterial(material, fullUrl) {
      console.log('📄 查看其他文件:', fullUrl);
      console.log('📋 文件信息:', {
        id: material.id,
        title: material.title,
        mimeType: material.file_mime_type,
        fileSize: material.file_size
      });

      try {
        console.log('尝试打开文件:', fullUrl);

        // 直接在浏览器中打开文件
        const fileWindow = window.open(fullUrl, '_blank');

        if (fileWindow) {
          console.log('✅ 文件窗口已打开');

          // 设置窗口标题，便于识别
          try {
            const fileType = material.file_mime_type.split('/')[0];
            const typeLabel = {
              'image': '图片',
              'text': '文本',
              'application': '文档'
            }[fileType] || '文件';
            fileWindow.document.title = `${typeLabel}预览: ${material.title}`;
          } catch (e) {
            console.log('无法设置窗口标题（跨域限制）');
          }

          // 添加页面加载监听
          let loadTimer = setTimeout(() => {
            try {
              if (fileWindow.closed) {
                console.log('文件窗口已被关闭');
                return;
              }

              // 检查页面内容
              if (fileWindow.document) {
                const title = fileWindow.document.title || '';
                const bodyContent = fileWindow.document.body ? fileWindow.document.body.innerHTML.trim() : '';

                console.log('🔍 文件页面检查结果:', {
                  title: title,
                  hasBody: !!fileWindow.document.body,
                  bodyLength: bodyContent.length,
                  isEmpty: bodyContent === '',
                  url: fileWindow.location ? fileWindow.location.href : 'unknown'
                });

                // 如果页面为空或显示错误，提示用户
                const hasError = bodyContent === '' ||
                    bodyContent.includes('Not Found') ||
                    bodyContent.includes('404') ||
                    bodyContent.includes('错误') ||
                    bodyContent.includes('File not found') ||
                    bodyContent.includes('Page not found') ||
                    title.includes('404') ||
                    title.includes('Not Found') ||
                    title.includes('Error');

                if (hasError) {
                  console.warn('⚠️ 文件页面显示为空白或错误');
                  console.log('页面内容预览:', bodyContent.substring(0, 200));

                  // 根据文件类型给出不同提示
                  const mimeType = material.file_mime_type || '';
                  let errorMsg = '文件无法正常显示';
                  if (mimeType.startsWith('image/')) {
                    errorMsg = '图片无法正常显示';
                  } else if (mimeType.startsWith('text/')) {
                    errorMsg = '文本文件无法正常显示';
                  }

                  this.showError(`${errorMsg}，可能文件不存在或服务器配置问题，建议下载后查看`);

                  // 延迟关闭窗口，给用户时间看到错误信息
                  setTimeout(() => {
                    if (!fileWindow.closed) {
                      fileWindow.close();
                    }
                  }, 3000);
                } else {
                  console.log('✅ 文件页面加载成功');
                }
              } else {
                console.log('⚠️ 无法访问文件页面文档对象（跨域限制）');
              }
            } catch (e) {
              console.log('❌ 无法检查文件页面内容（跨域限制）- 这是正常现象');
              console.log('错误详情:', e.message);
            }
          }, 2000);

          // 清理定时器
          fileWindow.onbeforeunload = () => {
            clearTimeout(loadTimer);
          };

        } else {
          // 如果弹出窗口被浏览器阻止
          console.warn('🚫 文件查看窗口被浏览器阻止');
          this.showError('弹出窗口被浏览器阻止，请允许弹出窗口后重试');

          // 提供下载选项
          if (confirm('无法直接查看文件，是否下载？')) {
            this.downloadMaterial(material);
          }
        }

      } catch (error) {
        console.error('❌ 文件查看过程中出错:', error);
        this.showError('文件查看失败: ' + error.message);

        // 提供下载选项
        if (confirm('查看失败，是否下载文件？')) {
          this.downloadMaterial(material);
        }
      }
    },

    // 检查是否有URL参数
    hasUrlParams() {
      const urlParams = new URLSearchParams(window.location.search);
      const course = urlParams.get('course');
      const refresh = urlParams.get('refresh');
      const fromAdmin = urlParams.get('fromAdmin');
      const forceRefresh = urlParams.get('forceRefresh');
      return !!(course || refresh || fromAdmin || forceRefresh);
    },

    // 检查URL参数并执行相应操作
    checkUrlParameters() {
      const urlParams = new URLSearchParams(window.location.search);
      const course = urlParams.get('course');
      const refresh = urlParams.get('refresh');
      const forceRefresh = urlParams.get('forceRefresh');

      console.log('[URL PARAMS] 检测到URL参数:', { course, refresh, forceRefresh });

      if (course) {
        this.urlParams.course = course;
        this.urlParams.refresh = refresh;
        this.urlParams.fromAdmin = true;

        // 如果有forceRefresh参数，先强制刷新数据
        if (forceRefresh === 'true') {
          console.log(`[FORCE REFRESH] 强制刷新数据后搜索《${course}》知识图谱`);
          // 先强制刷新图谱数据，然后执行搜索
          this.forceRefreshAndSearch(course);
        } else {
          // 静默执行查询，不显示弹窗提示
          console.log(`[URL PARAMS] 检测到课程参数，自动搜索《${course}》知识图谱`);
          // 延迟执行查询，确保后端数据写入完成
          this.scheduleAutoQuery(course, 2000, 0);
        }
      }
    },

    // 强制刷新数据并搜索
    async forceRefreshAndSearch(courseName) {
      console.log(`[FORCE REFRESH] 开始强制刷新数据并搜索课程《${courseName}》`);
      
      try {
        this.isLoading = true;
        
        // 1. 强制刷新图谱数据，确保获取最新的Neo4j数据
        console.log('[FORCE REFRESH] 步骤1: 强制刷新图谱数据');
        await this.refreshGraph(false); // 不保持视图状态，完全刷新
        
        // 2. 等待数据加载完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 3. 执行课程搜索
        console.log(`[FORCE REFRESH] 步骤2: 搜索课程《${courseName}》`);
        await this.performCourseSearch(courseName);
        
        console.log('[FORCE REFRESH] 强制刷新和搜索完成');
        
      } catch (error) {
        console.error('[FORCE REFRESH] 强制刷新失败:', error);
        // 如果强制刷新失败，回退到普通的自动查询
        console.log('[FORCE REFRESH] 回退到普通自动查询');
        this.scheduleAutoQuery(courseName, 1000, 0);
      } finally {
        this.isLoading = false;
      }
    },

    // 执行课程搜索（独立方法，便于复用）
    async performCourseSearch(courseName) {
      console.log(`[COURSE SEARCH] 执行课程搜索: ${courseName}`);
      
      try {
        // 设置查询文本
        this.queryText = courseName;
        
        // 构造查询
        const queryToSend = 'search ' + courseName;
        
        const response = await fetch(`${this.baseUrl}query/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({ query: queryToSend })
        });
        
        const data = await response.json();
        
        if (data.success && data.nodes && data.nodes.length > 0) {
          console.log(`[COURSE SEARCH] 搜索成功，找到 ${data.nodes.length} 个节点`);
          await this.updateGraph(data, false, false, false);
          
          // 延迟聚焦到课程节点
          setTimeout(() => {
            this.focusOnNode(courseName);
          }, 800);
          
          return true;
        } else {
          console.warn(`[COURSE SEARCH] 搜索失败或无数据:`, data.error || '无节点数据');
          return false;
        }
        
      } catch (error) {
        console.error('[COURSE SEARCH] 搜索异常:', error);
        return false;
      }
    },

    // 调度自动查询，支持重试机制
    scheduleAutoQuery(courseName, delay, retryCount) {
      console.log(`[SCHEDULE] 计划在 ${delay}ms 后查询课程《${courseName}》，重试次数: ${retryCount}`);

      setTimeout(() => {
        this.autoQueryCourse(courseName, retryCount);
      }, delay);
    },

    // 自动查询指定课程
    async autoQueryCourse(courseName, retryCount = 0) {
      const maxRetries = 5; // 最大重试次数
      console.log(`[AUTO QUERY] 开始自动查询课程《${courseName}》，重试次数: ${retryCount}/${maxRetries}`);

      try {
        this.isLoading = true;

        // 设置查询文本
        this.queryText = courseName;

        // 构造查询（直接搜索课程名称）
        const queryToSend = 'search ' + courseName;

        console.log(`[AUTO QUERY] 发送查询: ${queryToSend}`);

        const response = await fetch(`${this.baseUrl}query/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({ query: queryToSend })
        });

        const data = await response.json();

        if (data.success && data.nodes && data.nodes.length > 0) {
          console.log(`[AUTO QUERY] 查询成功，找到 ${data.nodes.length} 个节点，更新图谱`);
          await this.updateGraph(data, false, false, false);

          // 延迟聚焦到课程节点
          setTimeout(() => {
            this.focusOnNode(courseName);
          }, 1000);

          // 静默完成，不显示弹窗提示
          console.log(`[AUTO QUERY] 《${courseName}》知识图谱加载完成`);

          // 查询成功后不启动自动刷新，避免重复加载完整图谱
          console.log('[AUTO QUERY] 查询成功，跳过自动刷新以避免重复加载');
        } else {
          console.warn(`[AUTO QUERY] 查询失败或无数据:`, data.error || '无节点数据');

          // 如果还有重试次数，安排重试
          if (retryCount < maxRetries) {
            const nextRetryDelay = Math.min(3000 * Math.pow(1.5, retryCount), 15000); // 指数退避，最多15秒
            console.log(`[AUTO QUERY] ${retryCount + 1}/${maxRetries} 次重试，${nextRetryDelay}ms 后重试`);
            this.scheduleAutoQuery(courseName, nextRetryDelay, retryCount + 1);
            return; // 不执行finally中的isLoading = false
          } else {
            console.error('[AUTO QUERY] 达到最大重试次数，显示错误信息');
            // 不再自动加载完整图谱，避免用户困惑
            this.showError(`无法自动查询课程《${courseName}》，请手动输入查询或刷新页面重试`);
            // 可以考虑显示一个提示，让用户知道可以手动查询
            console.log('[AUTO QUERY] 建议用户手动查询或刷新页面');
          }
        }
      } catch (error) {
        console.error('[AUTO QUERY] 查询异常:', error);

        // 如果还有重试次数，安排重试
        if (retryCount < maxRetries) {
          const nextRetryDelay = Math.min(3000 * Math.pow(1.5, retryCount), 15000);
          console.log(`[AUTO QUERY] 异常重试 ${retryCount + 1}/${maxRetries}，${nextRetryDelay}ms 后重试`);
          this.scheduleAutoQuery(courseName, nextRetryDelay, retryCount + 1);
          return; // 不执行finally中的isLoading = false
        } else {
          console.error('[AUTO QUERY] 异常重试达到最大次数');
          this.showError('自动查询异常，已达到最大重试次数');
        }
      } finally {
        this.isLoading = false;
      }
    },

    // 启动自动刷新机制
    startAutoRefresh() {
      console.log('[AUTO REFRESH] 启动自动刷新机制');

      // 清除之前的定时器
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer);
      }

      // 设置新的定时器
      this.autoRefreshTimer = setInterval(() => {
        this.checkForNewData();
      }, this.refreshInterval);
    },

    // 检查是否有新数据
    async checkForNewData() {
      try {
        // 只在从管理页面跳转过来的情况下才检查新数据
        if (!this.urlParams.fromAdmin) {
          console.log('[AUTO REFRESH] 非管理页面跳转，跳过自动刷新检查');
          return;
        }

        const response = await fetch(`${this.baseUrl}get_graph_data/`);
        const data = await response.json();

        if (data.success && data.nodes) {
          const currentNodeCount = data.nodes.length;
          const lastNodeCount = this.originalData ? this.originalData.nodes.length : 0;

          // 只有当节点数量显著增加（避免小幅波动）且是第一次检测到时才刷新
          const nodeDifference = currentNodeCount - lastNodeCount;

          // 检查是否是第一次加载（originalData为空）
          const isFirstLoad = !this.originalData;

          // 检查节点数量是否有显著变化（大于等于5个节点的变化）
          const hasSignificantChange = nodeDifference >= 5;

          if (isFirstLoad || hasSignificantChange) {
            console.log(`[AUTO REFRESH] 检测到数据变化: ${lastNodeCount} -> ${currentNodeCount} (差异: ${nodeDifference})`);

            if (isFirstLoad) {
              console.log('[AUTO REFRESH] 首次加载数据');
            } else {
              console.log('[AUTO REFRESH] 检测到显著数据变化，刷新图谱');
            }

            await this.updateGraph(data, true, true, false);

            // 更新最后的数据时间戳
            this.lastDataTimestamp = Date.now();

            // 如果是显著变化，停止自动刷新（避免无限循环）
            if (hasSignificantChange && !isFirstLoad) {
              console.log('[AUTO REFRESH] 检测到显著变化，停止自动刷新');
              this.stopAutoRefresh();
            }
          } else {
            console.log(`[AUTO REFRESH] 数据无显著变化: ${lastNodeCount} -> ${currentNodeCount}`);
          }
        }
      } catch (error) {
        console.warn('[AUTO REFRESH] 检查新数据失败:', error);
      }
    },





    // ===== 本地数据更新方法 =====
    
    // 本地添加关系
    addRelationshipLocally(relationshipData) {
      console.log('[LOCAL UPDATE] 开始本地添加关系:', relationshipData);
      
      try {
        // 查找源节点和目标节点
        const sourceNode = this.nodes.find(node => node.name === relationshipData.source);
        const targetNode = this.nodes.find(node => node.name === relationshipData.target);
        
        if (!sourceNode || !targetNode) {
          console.warn('[LOCAL UPDATE] 源节点或目标节点不存在，跳过本地更新');
          console.log('[LOCAL UPDATE] 当前节点列表:', this.nodes.map(n => n.name));
          return;
        }
        
        // 检查关系是否已存在
        const existingLink = this.links.find(link => {
          const linkSource = typeof link.source === 'string' ? link.source : link.source.name;
          const linkTarget = typeof link.target === 'string' ? link.target : link.target.name;
          const linkType = link.relation_type || link.type;
          
          return linkSource === relationshipData.source && 
                 linkTarget === relationshipData.target && 
                 linkType === relationshipData.relation_type;
        });
        
        if (existingLink) {
          console.warn('[LOCAL UPDATE] 关系已存在，跳过添加');
          return;
        }
        
        // 创建新的链接对象
        const newLink = {
          id: relationshipData.id || Date.now(),
          source: sourceNode,
          target: targetNode,
          relation_type: relationshipData.relation_type,
          type: relationshipData.relation_type, // 兼容性字段
          properties: relationshipData.properties || {}
        };
        
        // 添加到links数组
        this.links.push(newLink);
        console.log('[LOCAL UPDATE] 已添加到links数组，当前数量:', this.links.length);
        
        // 更新originalData
        if (this.originalData) {
          if (!this.originalData.relations) {
            this.originalData.relations = [];
          }
          
          const newRelation = {
            source: relationshipData.source,
            target: relationshipData.target,
            relation_type: relationshipData.relation_type,
            type: relationshipData.relation_type, // 兼容性字段
            properties: relationshipData.properties || {}
          };
          this.originalData.relations.push(newRelation);
          
          // 同时更新relationships字段（兼容性）
          if (!this.originalData.relationships) {
            this.originalData.relationships = [];
          }
          this.originalData.relationships.push({ ...newRelation });
          
          console.log('[LOCAL UPDATE] 已更新originalData');
        }
        
        // 使用增量更新而不是等待外部刷新
        this.incrementalUpdateDisplay();
        
        console.log('[LOCAL UPDATE] 关系添加完成，图谱已更新');
      } catch (error) {
        console.error('[LOCAL UPDATE] 本地添加关系失败:', error);
      }
    },
    
    // 本地更新关系
    updateRelationshipLocally(source, target, oldRelationType, newRelationType, properties) {
      console.log('[LOCAL UPDATE] 开始本地更新关系:', {
        source, target, oldRelationType, newRelationType, properties
      });
      
      try {
        let updated = false;
        
        // 标准化节点名称的函数
        const getNodeName = (node) => {
          if (typeof node === 'string') return node;
          if (typeof node === 'object' && node.name) return node.name;
          if (typeof node === 'object' && node.id) return node.id;
          return String(node);
        };
        
        // 创建关系类型匹配函数 - 支持中英文匹配
        const isRelationTypeMatch = (storedType, targetType) => {
          if (storedType === targetType) return true;
          
          // 创建中英文映射
          const typeMap = {
            "RELATED_TO": "相关于",
            "BELONGS_TO": "属于", 
            "PREREQUISITE": "先修于",
            "CONTAINS": "包含",
            "FOLLOWS": "跟随",
            "SIMILAR_TO": "相似于",
            "DEPENDS_ON": "依赖于",
            "APPLIES_TO": "应用于",
            "USED_IN": "用于",
            "SUBSET_OF": "子集",
            "INSTANCE_OF": "实例",
            "DEFINED_BY": "定义",
            "IMPLEMENTED_IN": "实现于"
          };
          
          // 反向映射
          const reverseMap = {};
          Object.keys(typeMap).forEach(key => {
            reverseMap[typeMap[key]] = key;
          });
          
          // 检查英文到中文的匹配
          if (typeMap[storedType] === targetType) return true;
          // 检查中文到英文的匹配
          if (reverseMap[storedType] === targetType) return true;
          
          return false;
        };
        
        // 先打印当前数据状态用于调试
        console.log('[LOCAL UPDATE] 当前links数据:', this.links.map(link => ({
          source: getNodeName(link.source),
          target: getNodeName(link.target),
          type: link.relation_type || link.type
        })));
        
        // 更新links数组中的关系 - 支持多种数据格式和类型匹配
        console.log('[LOCAL UPDATE] 当前links数量:', this.links.length);
        for (let i = 0; i < this.links.length; i++) {
          const link = this.links[i];
          const linkSource = getNodeName(link.source);
          const linkTarget = getNodeName(link.target);
          const linkType = link.relation_type || link.type;
          
          const sourceMatch = linkSource === source;
          const targetMatch = linkTarget === target;
          const typeMatch = isRelationTypeMatch(linkType, oldRelationType);
          
          if (sourceMatch && targetMatch && typeMatch) {
            // 更新关系类型和属性 - 确保存储英文类型，显示时翻译为中文
            if (link.relation_type !== undefined) {
              this.links[i].relation_type = newRelationType;
            }
            if (link.type !== undefined) {
              this.links[i].type = newRelationType;
            }
            this.links[i].properties = properties || {};
            
            // 确保关系类型字段统一使用英文存储
            this.links[i].relation_type = newRelationType;
            this.links[i].type = newRelationType;
            
            console.log('[LOCAL UPDATE] 已更新links数组中的关系:', {
              from: { source: linkSource, target: linkTarget, type: linkType },
              to: this.links[i]
            });
            updated = true;
            break;
          }
        }
        
        // 更新originalData中的关系
        if (this.originalData) {
          // 更新relations字段
          if (this.originalData.relations) {
            for (let i = 0; i < this.originalData.relations.length; i++) {
              const rel = this.originalData.relations[i];
              const sourceMatch = rel.source === source;
              const targetMatch = rel.target === target;
              const typeMatch = isRelationTypeMatch(rel.relation_type || rel.type, oldRelationType);
              
              if (sourceMatch && targetMatch && typeMatch) {
                if (rel.relation_type !== undefined) {
                  this.originalData.relations[i].relation_type = newRelationType;
                }
                if (rel.type !== undefined) {
                  this.originalData.relations[i].type = newRelationType;
                }
                this.originalData.relations[i].properties = properties || {};
                
                // 确保关系类型字段统一使用英文存储
                this.originalData.relations[i].relation_type = newRelationType;
                this.originalData.relations[i].type = newRelationType;
                console.log('[LOCAL UPDATE] 已更新relations中的关系');
                updated = true;
                break;
              }
            }
          }
          
          // 更新relationships字段（兼容性）
          if (this.originalData.relationships) {
            for (let i = 0; i < this.originalData.relationships.length; i++) {
              const rel = this.originalData.relationships[i];
              const sourceMatch = rel.source === source;
              const targetMatch = rel.target === target;
              const typeMatch = isRelationTypeMatch(rel.relation_type || rel.type, oldRelationType);
              
              if (sourceMatch && targetMatch && typeMatch) {
                if (rel.relation_type !== undefined) {
                  this.originalData.relationships[i].relation_type = newRelationType;
                }
                if (rel.type !== undefined) {
                  this.originalData.relationships[i].type = newRelationType;
                }
                this.originalData.relationships[i].properties = properties || {};
                
                // 确保关系类型字段统一使用英文存储
                this.originalData.relationships[i].relation_type = newRelationType;
                this.originalData.relationships[i].type = newRelationType;
                console.log('[LOCAL UPDATE] 已更新relationships中的关系');
                updated = true;
                break;
              }
            }
          }
        }
        
        if (updated) {
          // 使用增量更新刷新显示
          this.incrementalUpdateDisplay();
          console.log('[LOCAL UPDATE] 关系更新完成，图谱已刷新');
        } else {
          console.warn('[LOCAL UPDATE] 未找到要更新的关系:', source, '->', target, '类型:', oldRelationType);
          console.log('[LOCAL UPDATE] 可用的关系:', this.links.map(link => 
            `${getNodeName(link.source)} -> ${getNodeName(link.target)} (${link.relation_type || link.type})`
          ));
        }
        
      } catch (error) {
        console.error('[LOCAL UPDATE] 本地更新关系失败:', error);
      }
    },
    
    // 本地删除关系
    deleteRelationshipLocally(source, target, relationType) {
      console.log('[LOCAL UPDATE] 开始本地删除关系:', { source, target, relationType });
      
      try {
        let deleted = false;
        
        // 标准化节点名称的函数
        const getNodeName = (node) => {
          if (typeof node === 'string') return node;
          if (typeof node === 'object' && node.name) return node.name;
          if (typeof node === 'object' && node.id) return node.id;
          return String(node);
        };
        
        // 创建关系类型匹配函数 - 支持中英文匹配
        const isRelationTypeMatch = (storedType, targetType) => {
          if (storedType === targetType) return true;
          
          // 创建中英文映射
          const typeMap = {
            "RELATED_TO": "相关于",
            "BELONGS_TO": "属于", 
            "PREREQUISITE": "先修于",
            "CONTAINS": "包含",
            "FOLLOWS": "跟随",
            "SIMILAR_TO": "相似于",
            "DEPENDS_ON": "依赖于",
            "APPLIES_TO": "应用于",
            "USED_IN": "用于",
            "SUBSET_OF": "子集",
            "INSTANCE_OF": "实例",
            "DEFINED_BY": "定义",
            "IMPLEMENTED_IN": "实现于"
          };
          
          // 反向映射
          const reverseMap = {};
          Object.keys(typeMap).forEach(key => {
            reverseMap[typeMap[key]] = key;
          });
          
          // 检查英文到中文的匹配
          if (typeMap[storedType] === targetType) return true;
          // 检查中文到英文的匹配
          if (reverseMap[storedType] === targetType) return true;
          
          return false;
        };
        
        // 先打印当前数据状态用于调试
        console.log('[LOCAL UPDATE] 当前links数据:', this.links.map(link => ({
          source: getNodeName(link.source),
          target: getNodeName(link.target),
          type: link.relation_type || link.type
        })));
        
        // 从links数组中删除关系 - 支持多种数据格式和类型匹配
        const originalLinksLength = this.links.length;
        this.links = this.links.filter(link => {
          const linkSource = getNodeName(link.source);
          const linkTarget = getNodeName(link.target);
          const linkType = link.relation_type || link.type;
          
          const sourceMatch = linkSource === source;
          const targetMatch = linkTarget === target;
          const typeMatch = isRelationTypeMatch(linkType, relationType);
          
          const shouldDelete = sourceMatch && targetMatch && typeMatch;
          
          if (shouldDelete) {
            console.log('[LOCAL UPDATE] 删除links中的关系:', {
              source: linkSource,
              target: linkTarget,
              type: linkType,
              matchedWith: relationType
            });
            deleted = true;
          }
          
          return !shouldDelete;
        });
        
        const deletedLinksCount = originalLinksLength - this.links.length;
        console.log(`[LOCAL UPDATE] 从links数组中删除了 ${deletedLinksCount} 个关系`);
        
        // 从originalData中删除关系
        if (this.originalData) {
          // 删除relations字段中的关系
          if (this.originalData.relations) {
            const originalRelationsLength = this.originalData.relations.length;
            this.originalData.relations = this.originalData.relations.filter(rel => {
              const sourceMatch = rel.source === source;
              const targetMatch = rel.target === target;
              const typeMatch = isRelationTypeMatch(rel.relation_type || rel.type, relationType);
              
              const shouldDelete = sourceMatch && targetMatch && typeMatch;
              
              if (shouldDelete) {
                console.log('[LOCAL UPDATE] 删除relations中的关系:', rel);
                deleted = true;
              }
              return !shouldDelete;
            });
            
            const deletedRelationsCount = originalRelationsLength - this.originalData.relations.length;
            console.log(`[LOCAL UPDATE] 从relations中删除了 ${deletedRelationsCount} 个关系`);
          }
          
          // 删除relationships字段中的关系（兼容性）
          if (this.originalData.relationships) {
            const originalRelationshipsLength = this.originalData.relationships.length;
            this.originalData.relationships = this.originalData.relationships.filter(rel => {
              const sourceMatch = rel.source === source;
              const targetMatch = rel.target === target;
              const typeMatch = isRelationTypeMatch(rel.relation_type || rel.type, relationType);
              
              const shouldDelete = sourceMatch && targetMatch && typeMatch;
              
              if (shouldDelete) {
                console.log('[LOCAL UPDATE] 删除relationships中的关系:', rel);
                deleted = true;
              }
              return !shouldDelete;
            });
            
            const deletedRelationshipsCount = originalRelationshipsLength - this.originalData.relationships.length;
            console.log(`[LOCAL UPDATE] 从relationships中删除了 ${deletedRelationshipsCount} 个关系`);
          }
        }
        
        // 清理选中状态
        if (this.selectedLink) {
          const selectedSource = getNodeName(this.selectedLink.source);
          const selectedTarget = getNodeName(this.selectedLink.target);
          const selectedType = this.selectedLink.relation_type || this.selectedLink.type;
          
          const sourceMatch = selectedSource === source;
          const targetMatch = selectedTarget === target;
          const typeMatch = isRelationTypeMatch(selectedType, relationType);
          
          if (sourceMatch && targetMatch && typeMatch) {
            this.selectedLink = null;
            console.log('[LOCAL UPDATE] 清理了选中的关系状态');
          }
        }
        
        if (deleted) {
          // 使用增量更新刷新显示
          this.incrementalUpdateDisplay();
          console.log('[LOCAL UPDATE] 关系删除完成，图谱已刷新');
        } else {
          console.warn('[LOCAL UPDATE] 未找到要删除的关系:', source, '->', target, '类型:', relationType);
          console.log('[LOCAL UPDATE] 可用的关系:', this.links.map(link => 
            `${getNodeName(link.source)} -> ${getNodeName(link.target)} (${link.relation_type || link.type})`
          ));
        }
        
      } catch (error) {
        console.error('[LOCAL UPDATE] 本地删除关系失败:', error);
      }
    },
    
    // 本地添加节点
    addNodeLocally(nodeData) {
      console.log('[LOCAL UPDATE] 开始本地添加节点:', nodeData);
      
      try {
        // 检查节点是否已存在（在nodes数组中）
        const existingNode = this.nodes.find(node => node.name === nodeData.name);
        if (existingNode) {
          console.warn('[LOCAL UPDATE] 节点已存在于显示列表，跳过添加:', nodeData.name);
          return;
        }
        
        // 检查节点是否已存在（在originalData中）
        if (this.originalData && this.originalData.nodes) {
          const existingOriginalNode = this.originalData.nodes.find(node => node.name === nodeData.name);
          if (existingOriginalNode) {
            console.warn('[LOCAL UPDATE] 节点已存在于原始数据，跳过添加:', nodeData.name);
            return;
          }
        }
        
        // 修复：为新节点设置更合理的初始位置（靠近视图中心）
        const containerWidth = this.$refs.graphContainer ? this.$refs.graphContainer.clientWidth : 800;
        const containerHeight = this.$refs.graphContainer ? this.$refs.graphContainer.clientHeight : 600;
        
        // 创建新节点对象
        const newNode = {
          id: nodeData.id || Date.now(),
          name: nodeData.name,
          label: nodeData.label || 'KnowledgePoint',
          properties: nodeData.properties || {},
          x: (Math.random() - 0.5) * containerWidth * 0.3, // 在中心附近随机位置
          y: (Math.random() - 0.5) * containerHeight * 0.3,
          vx: 0, // 初始速度为0
          vy: 0
        };
        
        // 添加到nodes数组
        this.nodes.push(newNode);
        
        // 更新originalData
        if (this.originalData) {
          if (!this.originalData.nodes) {
            this.originalData.nodes = [];
          }
          
          const newOriginalNode = {
            name: nodeData.name,
            label: nodeData.label || 'KnowledgePoint',
            properties: nodeData.properties || {}
          };
          this.originalData.nodes.push(newOriginalNode);
        }
        
        // 修复：使用带标签修复的增量更新
        this.incrementalUpdateDisplayWithLabelFix();
        
        console.log('[LOCAL UPDATE] 节点添加完成，图谱已更新');
      } catch (error) {
        console.error('[LOCAL UPDATE] 本地添加节点失败:', error);
      }
    },

    // 检查是否有新生成的课程需要自动搜索
    checkForNewGeneratedCourse() {
      try {
        const lastGeneratedCourseStr = localStorage.getItem('lastGeneratedCourse');
        if (!lastGeneratedCourseStr) {
          console.log('[AUTO SEARCH] 没有找到新生成的课程信息');
          return;
        }

        const lastGeneratedCourse = JSON.parse(lastGeneratedCourseStr);
        const { courseName, completedAt, timestamp } = lastGeneratedCourse;

        console.log('[AUTO SEARCH] 找到新生成的课程信息:', lastGeneratedCourse);

        // 检查是否是最近5分钟内生成的课程（避免旧数据干扰）
        const now = Date.now();
        const fiveMinutesAgo = now - (5 * 60 * 1000);

        if (timestamp && timestamp > fiveMinutesAgo) {
          console.log(`[AUTO SEARCH] 课程《${courseName}》是最近生成的，准备自动搜索`);
          
          // 延迟执行自动搜索，确保图谱初始化完成
          setTimeout(() => {
            this.performAutoSearchForNewCourse(courseName);
          }, 2000);

          // 清理localStorage，避免重复搜索
          localStorage.removeItem('lastGeneratedCourse');
        } else {
          console.log('[AUTO SEARCH] 课程信息过期，跳过自动搜索');
          localStorage.removeItem('lastGeneratedCourse');
        }

      } catch (error) {
        console.warn('[AUTO SEARCH] 检查新生成课程信息失败:', error);
        // 清理可能损坏的数据
        localStorage.removeItem('lastGeneratedCourse');
      }
    },

    // 为新生成的课程执行自动搜索
    async performAutoSearchForNewCourse(courseName) {
      console.log(`[AUTO SEARCH] 开始为新生成的课程《${courseName}》执行自动搜索`);

      try {
        this.isLoading = true;

        // 先强制刷新图谱数据，确保获取包含新课程的最新数据
        console.log('[AUTO SEARCH] 步骤1: 刷新图谱数据');
        await this.refreshGraph(false);

        // 等待数据加载完成
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 执行课程搜索
        console.log(`[AUTO SEARCH] 步骤2: 搜索课程《${courseName}》`);
        const searchSuccess = await this.performCourseSearch(courseName);

        if (searchSuccess) {
          console.log(`[AUTO SEARCH] 课程《${courseName}》自动搜索成功`);
          // 显示成功提示
          this.showSuccess(`已自动搜索到新生成的课程《${courseName}》`);
        } else {
          console.warn(`[AUTO SEARCH] 课程《${courseName}》自动搜索失败`);
          // 显示提示信息，但不显示错误
          this.showSuccess(`课程《${courseName}》已生成完成，您可以手动搜索查看`);
        }

      } catch (error) {
        console.error('[AUTO SEARCH] 自动搜索过程中出错:', error);
        this.showSuccess(`课程《${courseName}》已生成完成，您可以手动搜索查看`);
      } finally {
        this.isLoading = false;
      }
    },

    // 设置课程生成完成监听器
    setupCourseGenerationListeners() {
      console.log('[LISTENERS] 设置课程生成完成监听器');

      // 1. 监听同一页面的课程生成完成事件
      this.generationCompleteListener = (event) => {
        console.log('[LISTENERS] 接收到课程生成完成事件:', event.detail);
        const { courseName, action } = event.detail;
        
        if (action === 'single_course_complete' && courseName) {
          console.log(`[LISTENERS] 处理单课程生成完成: ${courseName}`);
          this.handleCourseGenerationComplete(courseName);
        }
      };
      window.addEventListener('courseGenerationComplete', this.generationCompleteListener);

      // 监听统计数据更新事件
      this.statisticsUpdateListener = (event) => {
        console.log('[LISTENERS] 接收到统计数据更新事件:', event.detail);
        console.log(`[LISTENERS] 刷新统计数据`);
        this.loadStatistics();
      };
      window.addEventListener('statisticsUpdated', this.statisticsUpdateListener);

      // 2. 设置BroadcastChannel监听其他标签页的课程生成完成
      if (window.BroadcastChannel) {
        try {
          this.broadcastChannel = new BroadcastChannel('knowledge_graph_updates');
          this.broadcastChannel.addEventListener('message', (event) => {
            console.log('[LISTENERS] BroadcastChannel接收到消息:', event.data);
            
            if (event.data.type === 'course_generation_complete' && event.data.courseName) {
              console.log(`[LISTENERS] 处理来自其他标签页的单课程生成完成: ${event.data.courseName}`);
              this.handleCourseGenerationComplete(event.data.courseName);
            } else if (event.data.type === 'statistics_updated') {
              console.log(`[LISTENERS] 接收到统计数据更新通知`);
              this.loadStatistics();
            }
          });
          console.log('[LISTENERS] BroadcastChannel监听器已设置');
        } catch (error) {
          console.warn('[LISTENERS] BroadcastChannel设置失败:', error);
        }
      } else {
        console.log('[LISTENERS] BroadcastChannel不受支持');
      }

      // 3. 监听localStorage变化（作为备用方案）
      window.addEventListener('storage', (event) => {
        if (event.key === 'lastGeneratedCourse' && event.newValue) {
          try {
            const courseInfo = JSON.parse(event.newValue);
            console.log('[LISTENERS] localStorage变化检测到新课程生成:', courseInfo);
            
            if (courseInfo.needsRefresh && courseInfo.courseName) {
              this.handleCourseGenerationComplete(courseInfo.courseName);
            }
          } catch (error) {
            console.warn('[LISTENERS] localStorage数据解析失败:', error);
          }
        }
      });

      console.log('[LISTENERS] 所有课程生成监听器设置完成');
    },

    // 清理课程生成监听器
    cleanupCourseGenerationListeners() {
      console.log('[LISTENERS] 清理课程生成监听器');

      // 清理事件监听器
      if (this.generationCompleteListener) {
        window.removeEventListener('courseGenerationComplete', this.generationCompleteListener);
        this.generationCompleteListener = null;
      }

      if (this.statisticsUpdateListener) {
        window.removeEventListener('statisticsUpdated', this.statisticsUpdateListener);
        this.statisticsUpdateListener = null;
      }

      // 清理BroadcastChannel
      if (this.broadcastChannel) {
        try {
          this.broadcastChannel.close();
          this.broadcastChannel = null;
          console.log('[LISTENERS] BroadcastChannel已关闭');
        } catch (error) {
          console.warn('[LISTENERS] BroadcastChannel关闭失败:', error);
        }
      }

      console.log('[LISTENERS] 课程生成监听器清理完成');
    },

    // 处理课程生成完成事件
    async handleCourseGenerationComplete(courseName) {
      console.log(`[GENERATION COMPLETE] 处理课程生成完成: ${courseName}`);
      
      try {
        // 防止重复处理
        const now = Date.now();
        if (this.lastProcessedCourse === courseName && (now - this.lastProcessedTime) < 5000) {
          console.log(`[GENERATION COMPLETE] 跳过重复处理: ${courseName}`);
          return;
        }
        
        this.lastProcessedCourse = courseName;
        this.lastProcessedTime = now;

        // 显示处理提示
        this.showSuccess(`检测到课程《${courseName}》生成完成，正在自动加载最新数据...`);

        // 等待一段时间确保数据库写入完成
        console.log('[GENERATION COMPLETE] 等待数据库写入完成...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 1. 强制从Neo4j重新加载数据到后端缓存
        console.log('[GENERATION COMPLETE] 强制从Neo4j重新加载数据');
        try {
          const reloadResponse = await fetch(`${this.baseUrl}reload_from_neo4j/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': this.getCsrfToken()
            }
          });
          
          const reloadData = await reloadResponse.json();
          if (reloadData.success) {
            console.log('[GENERATION COMPLETE] Neo4j数据重新加载成功:', reloadData.data_count);
          } else {
            console.warn('[GENERATION COMPLETE] Neo4j数据重新加载失败');
          }
        } catch (reloadError) {
          console.error('[GENERATION COMPLETE] 重新加载数据失败:', reloadError);
        }

        // 2. 刷新课程列表
        console.log('[GENERATION COMPLETE] 刷新课程列表');
        await this.loadCourseList();

        // 3. 刷新图谱数据
        console.log('[GENERATION COMPLETE] 从数据库刷新图谱数据');
        await this.refreshGraph(false); // 完全刷新，不保持视图状态

        // 4. 刷新统计信息
        console.log('[GENERATION COMPLETE] 刷新统计信息');
        this.loadStatistics();

        // 等待数据加载完成
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 5. 自动搜索新生成的课程
        console.log(`[GENERATION COMPLETE] 自动搜索课程: ${courseName}`);
        const searchSuccess = await this.performCourseSearch(courseName);

        if (searchSuccess) {
          console.log(`[GENERATION COMPLETE] 课程《${courseName}》自动加载成功`);
          
          // 6. 加载章节列表
          console.log(`[GENERATION COMPLETE] 加载课程章节列表`);
          await this.loadChapterList(courseName);
          
          this.showSuccess(`课程《${courseName}》已自动加载完成！`);
        } else {
          console.warn(`[GENERATION COMPLETE] 课程《${courseName}》自动搜索失败，但数据已刷新`);
          this.showSuccess(`数据已更新，您可以手动搜索课程《${courseName}》查看`);
        }

        // 清理localStorage中的标记
        try {
          const courseInfo = localStorage.getItem('lastGeneratedCourse');
          if (courseInfo) {
            const parsedInfo = JSON.parse(courseInfo);
            if (parsedInfo.courseName === courseName) {
              parsedInfo.needsRefresh = false; // 标记为已处理
              localStorage.setItem('lastGeneratedCourse', JSON.stringify(parsedInfo));
              console.log('[GENERATION COMPLETE] 已清理localStorage标记');
            }
          }
        } catch (error) {
          console.warn('[GENERATION COMPLETE] 清理localStorage标记失败:', error);
        }

      } catch (error) {
        console.error('[GENERATION COMPLETE] 处理课程生成完成失败:', error);
        this.showError(`处理课程《${courseName}》生成完成时出错: ${error.message}`);
      }
    },

    // 更新D3可视化元素（实时更新，不重新布局）
    updateD3Elements() {
      console.log('[D3 UPDATE] 开始更新D3可视化元素');
      
      try {
        if (!this.g || !this.links) {
          console.warn('[D3 UPDATE] g或links不存在，跳过更新');
          return;
        }
        
        // 1. 更新连接线
        this.updateLinkElements();
        
        // 2. 更新关系标签 - 使用更安全的方式
        this.updateLinkLabelsCarefully();
        
        // 3. 更新模拟器
        if (this.simulation) {
          this.simulation.force('link').links(this.links);
          // 轻微重启模拟器以更新连接线位置
          this.simulation.alpha(0.1).restart();
          
          // 短暂运行后停止，避免节点移动
          setTimeout(() => {
            if (this.simulation) {
              this.simulation.stop();
            }
          }, 200);
        }
        
        console.log('[D3 UPDATE] D3可视化元素更新完成');
        
      } catch (error) {
        console.error('[D3 UPDATE] 更新D3元素失败:', error);
      }
    },

    // 更新连接线元素
    updateLinkElements() {
      console.log('[D3 UPDATE] 更新连接线元素');
      
      try {
        // 确保links组存在
        let linksGroup = this.g.select('.links');
        if (linksGroup.empty()) {
          linksGroup = this.g.append("g").attr("class", "links");
        }
        
        // 更新连接线的数据绑定
        const linkSelection = linksGroup.selectAll('line')
          .data(this.links, d => {
            const source = typeof d.source === 'object' ? d.source.name : d.source;
            const target = typeof d.target === 'object' ? d.target.name : d.target;
            const type = d.relation_type || d.type;
            return `${source}-${target}-${type}`;
          });
        
        // 移除不需要的连接线
        linkSelection.exit().remove();
        
        // 添加新的连接线
        const newLinks = linkSelection.enter().append('line');
        
        // 合并选择并更新属性
        this.linkElements = linkSelection.merge(newLinks)
          .attr('class', d => 'link' + (this.isLinkSelected(d) ? ' selected' : ''))
          .attr('stroke', '#999')
          .attr('stroke-width', d => this.isLinkSelected(d) ? 3 : 2)
          .attr('marker-end', 'url(#arrowhead)')
          .style('cursor', 'pointer');
        
        // 重新绑定事件监听器
        this.linkElements
          .on('mouseenter', function(event, d) {
            d3.select(this).attr('stroke-width', 4).attr('stroke-opacity', 0.8);
          })
          .on('mouseleave', (event, d) => {
            const isSelected = this.isLinkSelected(d);
            d3.select(event.target)
              .attr('stroke-width', isSelected ? 3 : 2)
              .attr('stroke-opacity', 1);
          })
          .on('click', (event, d) => {
            event.stopPropagation();
            event.preventDefault();
            console.log('关系点击事件触发:', d);
            this.selectLink(d);
          })
          .on('contextmenu', (event, d) => {
            event.stopPropagation();
            event.preventDefault();
            console.log('关系右键事件触发:', d);
            this.showLinkContextMenu(event, d);
          });
        
        console.log('[D3 UPDATE] 连接线元素更新完成');
        
      } catch (error) {
        console.error('[D3 UPDATE] 更新连接线元素失败:', error);
      }
    },

    // 更新关系标签（简化版本）
    updateLinkLabelsCarefully() {
      console.log('[CAREFUL LABELS] 更新关系标签');
      
      try {
        if (!this.g || !this.links) {
          console.warn('[CAREFUL LABELS] g或links不存在，跳过标签更新');
          return;
        }
        
        // 确保link-labels组存在
        let linkLabelsGroup = this.g.select('.link-labels');
        if (linkLabelsGroup.empty()) {
          linkLabelsGroup = this.g.append("g").attr("class", "link-labels");
        }
        
        // 使用getMergedLinkLabels获取合并的标签数据
        const linkLabelData = this.getMergedLinkLabels(this.links).filter(d => {
          // 过滤掉在课程节点上错误显示的"contains"关系
          if (d.type === "包含" || d.type === "CONTAINS") {
            const sourceNode = typeof d.source === 'object' ? d.source : this.nodes.find(n => n.name === d.source);
            const targetNode = typeof d.target === 'object' ? d.target : this.nodes.find(n => n.name === d.target);
            
            // 如果源节点和目标节点都是课程，则不显示"contains"关系
            if (sourceNode && targetNode && 
                sourceNode.label === "Course" && targetNode.label === "Course") {
              return false;
            }
          }
          return true;
        });
        
        console.log('[CAREFUL LABELS] 处理后的标签数据:', linkLabelData.length, '个标签');
        
        // 使用数据绑定更新标签组
        const linkLabelSelection = linkLabelsGroup.selectAll("g")
          .data(linkLabelData, d => `${d.source.name || d.source}-${d.target.name || d.target}-${d.type}`);
        
        // 移除不需要的标签组
        linkLabelSelection.exit().remove();
        
        // 添加新的标签组
        const newLinkLabels = linkLabelSelection.enter().append("g")
          .attr("class", "link-label-group");
        
        // 合并现有和新标签组
        this.linkLabels = linkLabelSelection.merge(newLinkLabels);
        
        // 为新标签组添加背景矩形和文本
        newLinkLabels.append("rect")
          .attr("class", "link-label-bg");
        
        newLinkLabels.append("text")
          .attr("class", "link-label");
        
        // 更新所有标签组的背景矩形属性（与原始方法保持完全一致）
        this.linkLabels.select("rect")
          .attr("class", "link-label-bg")
          .attr("x", -12)
          .attr("y", -8)
          .attr("width", 24)
          .attr("height", 16)
          .attr("stroke", "#D3D3D3")
          .attr("stroke-width", "1px")
          .attr("fill", "none")
          .attr("rx", 4)
          .style("display", this.showRelationLabels ? null : "none");
        
        // 更新所有标签组的文本属性（与原始方法保持完全一致）
        this.linkLabels.select("text")
          .attr("class", "link-label")
          .attr("text-anchor", "middle")
          .attr("dy", ".35em")
          .style("display", this.showRelationLabels ? null : "none")
          .text(d => this.translateRelationType(d.type));
        
        // 更新连接线标签背景的大小（与原始方法保持完全一致）
        this.linkLabels.selectAll(".link-label-bg")
          .attr("width", function() {
            const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
            return textWidth + 16;
          })
          .attr("x", function() {
            const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
            return -textWidth / 2 - 8;
          })
          .attr("y", -10)
          .attr("height", 20);
        
        console.log('[CAREFUL LABELS] 关系标签更新完成，创建了', this.linkLabels ? this.linkLabels.size() : 0, '个标签');
        
      } catch (error) {
        console.error('[CAREFUL LABELS] 更新关系标签失败:', error);
      }
    },

    // 更新完整的关系标签（别名方法）
    updateCompleteLinkLabels() {
      this.updateLinkLabelsCarefully();
    },

    // 增量更新关系标签（专门用于增删改操作后的更新）
    updateIncrementalLinkLabels() {
      console.log('[INCREMENTAL LABELS] 开始增量更新关系标签');
      
      try {
        if (!this.g || !this.links) {
          console.warn('[INCREMENTAL LABELS] g或links不存在，跳过标签更新');
          return;
        }
        
        // 确保link-labels组存在
        let linkLabelsGroup = this.g.select('.link-labels');
        if (linkLabelsGroup.empty()) {
          linkLabelsGroup = this.g.append("g").attr("class", "link-labels");
        }
        
        // 获取合并的连接标签数据
        const linkLabelData = this.getMergedLinkLabels(this.links).filter(d => {
          // 过滤掉在课程节点上错误显示的"contains"关系
          if (d.type === "包含" || d.type === "CONTAINS") {
            const sourceNode = typeof d.source === 'object' ? d.source : this.nodes.find(n => n.name === d.source);
            const targetNode = typeof d.target === 'object' ? d.target : this.nodes.find(n => n.name === d.target);
            
            // 如果源节点和目标节点都是课程，则不显示"contains"关系
            if (sourceNode && targetNode && 
                sourceNode.label === "Course" && targetNode.label === "Course") {
              return false;
            }
          }
          return true;
        });
        
        console.log('[INCREMENTAL LABELS] 处理后的标签数据:', linkLabelData.length, '个标签');
        
        // 使用数据绑定更新标签组
        const linkLabelSelection = linkLabelsGroup.selectAll("g")
          .data(linkLabelData, d => `${d.source.name || d.source}-${d.target.name || d.target}-${d.type}`);
        
        // 移除不需要的标签组
        linkLabelSelection.exit().remove();
        
        // 添加新的标签组
        const newLinkLabels = linkLabelSelection.enter().append("g")
          .attr("class", "link-label-group");
        
        // 合并现有和新标签组
        this.linkLabels = linkLabelSelection.merge(newLinkLabels);
        
        // 为新标签组添加背景矩形和文本
        newLinkLabels.append("rect")
          .attr("class", "link-label-bg");
        
        newLinkLabels.append("text")
          .attr("class", "link-label");
        
        // 更新所有标签组的背景矩形属性（与原始方法保持完全一致）
        this.linkLabels.select("rect")
          .attr("class", "link-label-bg")
          .attr("x", -12)
          .attr("y", -8)
          .attr("width", 24)
          .attr("height", 16)
          .attr("stroke", "#D3D3D3")
          .attr("stroke-width", "1px")
          .attr("fill", "none")
          .attr("rx", 4)
          .style("display", this.showRelationLabels ? null : "none");
        
        // 更新所有标签组的文本属性（与原始方法保持完全一致）
        this.linkLabels.select("text")
          .attr("class", "link-label")
          .attr("text-anchor", "middle")
          .attr("dy", ".35em")
          .style("display", this.showRelationLabels ? null : "none")
          .text(d => this.translateRelationType(d.type));
        
        // 更新连接线标签背景的大小（与原始方法保持完全一致）
        this.linkLabels.selectAll(".link-label-bg")
          .attr("width", function() {
            const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
            return textWidth + 16;
          })
          .attr("x", function() {
            const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
            return -textWidth / 2 - 8;
          })
          .attr("y", -10)
          .attr("height", 20);
        
        console.log('[INCREMENTAL LABELS] 增量关系标签更新完成，创建了', this.linkLabels ? this.linkLabels.size() : 0, '个标签');
        
      } catch (error) {
        console.error('[INCREMENTAL LABELS] 增量更新关系标签失败:', error);
        // 如果增量更新失败，回退到完整更新
        this.updateLinkLabelsCarefully();
      }
    },



    // 更新节点元素
    updateNodeElements() {
      console.log('[D3 UPDATE] 更新节点元素');
      
      try {
        if (!this.g || !this.nodes) {
          console.warn('[D3 UPDATE] g或nodes不存在，跳过节点更新');
          return;
        }
        
        // 确保nodes组存在
        let nodesGroup = this.g.select('.nodes');
        if (nodesGroup.empty()) {
          nodesGroup = this.g.append("g").attr("class", "nodes");
        }
        
        // 更新节点的数据绑定
        const nodeSelection = nodesGroup.selectAll('circle')
          .data(this.nodes, d => d.name);
        
        // 移除不需要的节点
        nodeSelection.exit().remove();
        
        // 添加新的节点
        const newNodes = nodeSelection.enter().append('circle');
        
        // 合并选择并更新属性
        this.nodeElements = nodeSelection.merge(newNodes)
          .attr('class', d => `node ${d.label.toLowerCase()}`)
          .attr('r', d => d.label === 'Course' ? 25 : 20)
          .attr('fill', d => {
            if (d.label === 'Course') return '#ff6b6b';
            if (d.label === 'KnowledgePoint') return '#4ecdc4';
            return '#95a5a6';
          })
          .style('cursor', 'pointer');
        
        // 重新绑定事件监听器
        this.nodeElements
          .on('mouseenter', (event, d) => {
            d3.select(event.target).attr('stroke', '#333').attr('stroke-width', 2);
          })
          .on('mouseleave', (event, d) => {
            if (!this.isNodeSelected(d)) {
              d3.select(event.target).attr('stroke', null).attr('stroke-width', null);
            }
          })
          .on('click', (event, d) => {
            event.stopPropagation();
            this.selectNode(d);
          })
          .on('contextmenu', (event, d) => {
            event.stopPropagation();
            event.preventDefault();
            this.showNodeContextMenu(event, d);
          });
        
        // 更新节点标签
        this.updateNodeLabels();
        
        // 如果模拟器存在，更新模拟器的节点数据
        if (this.simulation) {
          this.simulation.nodes(this.nodes);
          this.simulation.alpha(0.1).restart();
          
          setTimeout(() => {
            if (this.simulation) {
              this.simulation.stop();
            }
          }, 200);
        }
        
        console.log('[D3 UPDATE] 节点元素更新完成，节点数量:', this.nodes.length);
        
      } catch (error) {
        console.error('[D3 UPDATE] 更新节点元素失败:', error);
      }
    },

    // 更新节点标签
    updateNodeLabels() {
      console.log('[D3 UPDATE] 更新节点标签');
      
      try {
        // 确保node-labels组存在
        let nodeLabelsGroup = this.g.select('.node-labels');
        if (nodeLabelsGroup.empty()) {
          nodeLabelsGroup = this.g.append("g").attr("class", "node-labels");
        }
        
        // 修复：清除旧的text标签，使用foreignObject
        nodeLabelsGroup.selectAll('text').remove();
        
        // 更新foreignObject标签的数据绑定
        const labelSelection = nodeLabelsGroup.selectAll('foreignObject')
          .data(this.nodes, d => d.name);
        
        // 移除不需要的标签
        labelSelection.exit().remove();
        
        // 添加新的foreignObject标签
        const newLabels = labelSelection.enter().append('foreignObject');
        
        // 合并选择并更新属性 - 使用foreignObject支持多行文本
        this.nodeLabels = labelSelection.merge(newLabels)
          .attr('class', 'node-label-foreign')
          .attr('width', d => {
            if (d.label === "Course") return 140;
            if (d.label === "Chapter") return 120;
            if (d.label === "Section") return 110;
            return 100;
          })
          .attr('height', d => {
            if (d.label === "Course") return 140;
            if (d.label === "Chapter") return 120;
            if (d.label === "Section") return 110;
            return 100;
          })
          .style('display', this.showLabels ? null : 'none')
          .style('pointer-events', 'none')
          .html(d => {
            const fontSize = d.label === "Course" ? "15px" : 
                            d.label === "Chapter" ? "14px" : 
                            d.label === "Section" ? "13px" : "12px";
            const fontWeight = d.label === "Course" ? "bold" : "700";
            const color = this.isNodeSelected(d) ? "#ff6b6b" : "#ffffff";
            
            return `
              <div xmlns="http://www.w3.org/1999/xhtml" style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                font-size: ${fontSize};
                font-weight: ${fontWeight};
                color: ${color};
                line-height: 1.3;
                padding: 5px;
                word-wrap: break-word;
                overflow-wrap: break-word;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5), 0 0 2px rgba(0, 0, 0, 0.3);
              ">
                ${d.name}
              </div>
            `;
          });
        
        console.log('[D3 UPDATE] 节点标签更新完成');
        
      } catch (error) {
        console.error('[D3 UPDATE] 更新节点标签失败:', error);
      }
    },

    // 强制刷新图谱显示（保持视图状态）
    forceRefreshDisplay() {
      console.log('[FORCE REFRESH] 强制刷新图谱显示');
      
      try {
        if (!this.originalData) {
          console.warn('[FORCE REFRESH] 没有原始数据，跳过刷新');
          return;
        }

        // 保存当前视图变换状态
        let currentTransform = null;
        if (this.svg && this.zoom) {
          try {
            currentTransform = d3.zoomTransform(this.svg.node());
          } catch (error) {
            console.warn('[FORCE REFRESH] 无法获取当前视图变换状态:', error);
          }
        }

        // 使用Vue的响应式更新机制强制重新渲染
        this.$nextTick(() => {
          // 触发图谱重新渲染，但保持位置
          this.updateGraph(this.originalData, true, true, true, null);
          
          // 恢复视图变换状态
          if (currentTransform && this.svg && this.zoom) {
            setTimeout(() => {
              try {
                this.svg.call(this.zoom.transform, currentTransform);
              } catch (error) {
                console.warn('[FORCE REFRESH] 无法恢复视图变换状态:', error);
              }
            }, 100);
          }
        });

        console.log('[FORCE REFRESH] 图谱显示刷新完成');
        
      } catch (error) {
        console.error('[FORCE REFRESH] 强制刷新显示失败:', error);
      }
    },

    // 新增：强制刷新属性面板
    forceRefreshPropertiesPanel() {
      console.log('[PROPERTIES REFRESH] 强制刷新属性面板');
      
      if (!this.selectedNode) {
        console.log('[PROPERTIES REFRESH] 没有选中节点，跳过刷新');
        return;
      }
      
      // 查找最新的节点数据
      const updatedNode = this.nodes.find(node => node.name === this.selectedNode.name);
      if (updatedNode) {
        console.log('[PROPERTIES REFRESH] 找到更新的节点数据:', updatedNode);
        this.selectedNode = { ...updatedNode };
        
        // 强制Vue重新渲染属性面板
        this.$forceUpdate();
        
        this.$nextTick(() => {
          console.log('[PROPERTIES REFRESH] 属性面板已强制刷新');
        });
      } else {
        console.warn('[PROPERTIES REFRESH] 未找到对应的节点数据');
      }
    },

    // 立即刷新图谱显示（用于关系操作后的实时更新）
    immediateRefreshDisplay() {
      console.log('[IMMEDIATE REFRESH] 立即刷新图谱显示');
      
      try {
        if (!this.originalData) {
          console.warn('[IMMEDIATE REFRESH] 没有原始数据，跳过刷新');
          return;
        }

        // 保存当前视图变换状态
        let currentTransform = null;
        if (this.svg && this.zoom) {
          try {
            currentTransform = d3.zoomTransform(this.svg.node());
          } catch (error) {
            console.warn('[IMMEDIATE REFRESH] 无法获取当前视图变换状态:', error);
          }
        }

        // 立即更新图谱，保持当前视图状态
        this.updateGraph(this.originalData, true, true, true, null);
        
        // 立即恢复视图变换状态
        if (currentTransform && this.svg && this.zoom) {
          try {
            this.svg.call(this.zoom.transform, currentTransform);
          } catch (error) {
            console.warn('[IMMEDIATE REFRESH] 无法恢复视图变换状态:', error);
          }
        }

        console.log('[IMMEDIATE REFRESH] 图谱显示立即刷新完成');
        
      } catch (error) {
        console.error('[IMMEDIATE REFRESH] 立即刷新显示失败:', error);
      }
    },

    // 增量更新显示（带标签修复）
    incrementalUpdateDisplayWithLabelFix() {
      console.log('[INCREMENTAL UPDATE WITH LABEL FIX] 开始增量更新显示（带标签修复）');
      
      try {
        // 先执行标准的增量更新
        this.incrementalUpdateDisplay();
        
        // 额外的标签修复步骤
        setTimeout(() => {
          if (this.nodeLabels && this.nodes) {
            console.log('[LABEL FIX] 强制更新所有节点标签');
            
            // 强制重新绑定标签数据并更新内容
            this.nodeLabels
              .data(this.nodes, d => d.name)
              .html(d => {
                const fontSize = d.label === "Course" ? "15px" : 
                                d.label === "Chapter" ? "14px" : 
                                d.label === "Section" ? "13px" : "12px";
                const fontWeight = d.label === "Course" ? "bold" : "700";
                const color = this.isNodeSelected(d) ? "#ff6b6b" : "#ffffff";
                
                return `
                  <div xmlns="http://www.w3.org/1999/xhtml" style="
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    text-align: center;
                    font-size: ${fontSize};
                    font-weight: ${fontWeight};
                    color: ${color};
                    line-height: 1.3;
                    padding: 5px;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5), 0 0 2px rgba(0, 0, 0, 0.3);
                  ">
                    ${d.name}
                  </div>
                `;
              })
              .attr("x", d => {
                const width = d.label === "Course" ? 140 : 
                             d.label === "Chapter" ? 120 : 
                             d.label === "Section" ? 110 : 100;
                return d.x - width / 2;
              })
              .attr("y", d => {
                const height = d.label === "Course" ? 140 : 
                              d.label === "Chapter" ? 120 : 
                              d.label === "Section" ? 110 : 100;
                return d.y - height / 2;
              });
            
            console.log('[LABEL FIX] 标签更新完成');
          }
        }, 100);
        
      } catch (error) {
        console.error('[INCREMENTAL UPDATE WITH LABEL FIX] 更新失败:', error);
        // 如果失败，回退到标准增量更新
        this.incrementalUpdateDisplay();
      }
    },

    // 增量更新显示（仅更新新增的节点和关系，避免重复渲染）
    incrementalUpdateDisplay() {
      console.log('[INCREMENTAL UPDATE] 开始增量更新显示');
      
      try {
        if (!this.simulation) {
          console.warn('[INCREMENTAL UPDATE] 模拟器未初始化，使用完整刷新');
          this.immediateRefreshDisplay();
          return;
        }

        // 保存当前视图变换状态
        let currentTransform = null;
        if (this.svg && this.zoom) {
          try {
            currentTransform = d3.zoomTransform(this.svg.node());
          } catch (error) {
            console.warn('[INCREMENTAL UPDATE] 无法获取当前视图变换状态:', error);
          }
        }

        // 标准化连接线数据格式，确保source和target始终是字符串
        // 不反转方向，保持数据库中存储的原始方向
        const normalizedLinks = this.links.map(link => {
          const source = typeof link.source === 'object' ? link.source.name : link.source;
          const target = typeof link.target === 'object' ? link.target.name : link.target;
          
          return {
            ...link,
            source: source,
            target: target
          };
        });

        // 更新模拟器的数据
        this.simulation.nodes(this.nodes);
        this.simulation.force("link").links(normalizedLinks);

        // 使用D3数据绑定机制更新元素，确保不重复
        console.log('[INCREMENTAL UPDATE] 更新DOM元素，nodes数量:', this.nodes.length, 'links数量:', normalizedLinks.length);

        // 更新连接线 - 使用数据绑定避免重复
        let linksGroup = this.g.select('.links');
        if (linksGroup.empty()) {
          linksGroup = this.g.append("g").attr("class", "links");
        }

        const linkSelection = linksGroup.selectAll("line")
          .data(normalizedLinks, d => `${d.source}-${d.target}-${d.relation_type || d.type}`);

        // 移除不需要的连接线
        linkSelection.exit().remove();

        // 添加新的连接线
        const newLinks = linkSelection.enter().append("line");

        // 设置连接线属性并重新绑定所有事件监听器
        this.linkElements = linkSelection.merge(newLinks)
          .attr("class", d => {
            let classes = "link";
            const relType = d.type || d.relation_type;
            
            if (relType === 'PREREQUISITE') classes += " prerequisite-relation";
            else if (relType === 'PARALLEL') classes += " parallel-relation";
            else if (relType === 'APPLICATION') classes += " application-relation";
            else if (relType === 'EXTENSION') classes += " extension-relation";
            else if (relType === 'DEPENDENCY') classes += " dependency-relation";
            else if (relType === 'CONTAINS_CHAPTER') classes += " contains-chapter-relation";
            else if (relType === 'BELONGS_TO_CHAPTER') classes += " belongs-to-chapter-relation";
            
            if (this.isLinkSelected(d)) classes += " selected";
            
            return classes;
          })
          .attr("stroke", d => {
            // 使用基于节点类型的样式
            const style = this.getStyleByNodeTypes(d);
            return style.color;
          })
          .attr("stroke-width", d => {
            if (this.isLinkSelected(d)) return 3;
            // 使用基于节点类型的样式
            const style = this.getStyleByNodeTypes(d);
            return style.width;
          })
          .attr("stroke-dasharray", d => {
            // 使用基于节点类型的样式
            const style = this.getStyleByNodeTypes(d);
            if (style.style === 'dashed') return "5,5";
            if (style.style === 'dotted') return "2,3";
            return null;
          })
          .attr("marker-end", d => {
            // 根据关系类型和选中状态使用不同的箭头
            if (this.isLinkSelected(d)) {
              return "url(#arrowhead-selected)";
            }
            
            const relType = d.type || d.relation_type;
            
            if (relType === 'PREREQUISITE' || relType === 'PREREQUISITE_FOR') {
              return "url(#arrowhead-prerequisite)";
            } else if (relType === 'PARALLEL') {
              return "url(#arrowhead-parallel)";
            } else if (relType === 'APPLICATION') {
              return "url(#arrowhead-application)";
            } else if (relType === 'EXTENSION') {
              return "url(#arrowhead-extension)";
            } else if (relType === 'DEPENDENCY') {
              return "url(#arrowhead-dependency)";
            } else if (relType === 'CONTAINS' || relType === 'CONTAINS_CHAPTER' || relType === 'CONTAINS_SECTION') {
              return "url(#arrowhead-contains)";
            } else if (relType === 'BELONGS_TO' || relType === 'BELONGS_TO_CHAPTER' || relType === 'BELONGS_TO_SECTION') {
              return "url(#arrowhead-belongs)";
            }
            
            return "url(#arrowhead)";
          })
          .style("cursor", "pointer");

        // 清理之前的事件监听器，避免重复绑定
        this.linkElements
          .on("mouseenter", null)
          .on("mouseleave", null)
          .on("click", null)
          .on("contextmenu", null);

        // 重新绑定完整的连接线事件监听器
        this.linkElements
          .on("mouseenter", function(event, d) {
            d3.select(this).attr("stroke-width", 4).attr("stroke-opacity", 0.8);
          })
          .on("mouseleave", (event, d) => {
            const isSelected = this.isLinkSelected(d);
            d3.select(event.target)
              .attr("stroke-width", isSelected ? 3 : 2)
              .attr("stroke-opacity", 1);
          })
          .on("click", (event, d) => {
            event.stopPropagation();
            event.preventDefault();
            console.log('关系点击事件触发:', d);
            this.selectLink(d);
          })
          .on("contextmenu", (event, d) => {
            event.stopPropagation();
            event.preventDefault();
            console.log('关系右键事件触发:', d);
            this.showContextMenu(event, 'link', d);
          });

        // 更新节点 - 使用数据绑定避免重复
        let nodesGroup = this.g.select('.nodes');
        if (nodesGroup.empty()) {
          nodesGroup = this.g.append("g").attr("class", "nodes");
        }

        const nodeSelection = nodesGroup.selectAll("circle")
          .data(this.nodes, d => d.name);

        // 移除不需要的节点
        nodeSelection.exit().remove();

        // 添加新的节点
        const newNodes = nodeSelection.enter().append("circle");

        // 设置节点属性 - 支持四层结构（超大版本，可容纳10字）
        this.nodeElements = nodeSelection.merge(newNodes)
          .attr("class", d => {
            let classes = "node";
            if (d.label === "Course") classes += " course-node";
            else if (d.label === "Chapter") classes += " chapter-node";
            else if (d.label === "Section") classes += " section-node";
            else if (d.label === "KnowledgePoint") classes += " knowledge-point-node";
            
            if (this.isNodeSelected(d)) classes += " selected";
            return classes;
          })
          .attr("r", d => {
            // 四层结构节点大小（超大版本）
            if (this.enhancedMode.enabled && this.enhancedMode.structureType === 'four_layer') {
              if (d.label === "Course") return 70;
              if (d.label === "Chapter") return 60;
              if (d.label === "Section") return 55;
              if (d.label === "KnowledgePoint") return 50;
            }
            // 默认大小（超大版本）
            return d.label === "Course" ? 60 : 50;
          })
          .attr("fill", d => this.getEntityColor(d.label))
          .attr("stroke", d => this.isNodeSelected(d) ? "#ff6b6b" : "#fff")
          .attr("stroke-width", d => this.isNodeSelected(d) ? 4 : 2)
          .style("cursor", "pointer")
          .call(d3.drag()
            .on("start", this.dragStarted)
            .on("drag", this.dragged)
            .on("end", this.dragEnded)
          );

        // 清理之前的节点事件监听器
        this.nodeElements
          .on("click", null)
          .on("dblclick", null)
          .on("contextmenu", null);

        // 重新绑定完整的节点事件监听器
        this.nodeElements
          .on("click", (event, d) => {
            event.stopPropagation();
            event.preventDefault();
            this.selectNode(d);
          })
          .on("dblclick", (event, d) => {
            event.stopPropagation();
            event.preventDefault();
            this.fixNode(d);
          })
          .on("contextmenu", (event, d) => {
            event.stopPropagation();
            event.preventDefault();
            console.log('节点右键事件触发:', d);
            this.showContextMenu(event, 'node', d);
          });

        // 更新节点标签 - 使用foreignObject支持多行文本
        let nodeLabelsGroup = this.g.select('.node-labels');
        if (nodeLabelsGroup.empty()) {
          nodeLabelsGroup = this.g.append("g").attr("class", "node-labels");
        }

        // 清除旧的text标签（如果存在）
        nodeLabelsGroup.selectAll("text").remove();

        const nodeLabelSelection = nodeLabelsGroup.selectAll("foreignObject")
          .data(this.nodes, d => d.name);

        nodeLabelSelection.exit().remove();
        const newNodeLabels = nodeLabelSelection.enter().append("foreignObject");

        this.nodeLabels = nodeLabelSelection.merge(newNodeLabels)
          .attr("class", "node-label-foreign")
          .attr("width", d => {
            if (d.label === "Course") return 140;
            if (d.label === "Chapter") return 120;
            if (d.label === "Section") return 110;
            return 100;
          })
          .attr("height", d => {
            if (d.label === "Course") return 140;
            if (d.label === "Chapter") return 120;
            if (d.label === "Section") return 110;
            return 100;
          })
          .style("display", this.showLabels ? null : "none")
          .style("pointer-events", "none")
          .html(d => {
            const fontSize = d.label === "Course" ? "15px" : 
                            d.label === "Chapter" ? "14px" : 
                            d.label === "Section" ? "13px" : "12px";
            const fontWeight = d.label === "Course" ? "bold" : "700";
            const color = this.isNodeSelected(d) ? "#ff6b6b" : "#ffffff";
            
            return `
              <div xmlns="http://www.w3.org/1999/xhtml" style="
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
                font-size: ${fontSize};
                font-weight: ${fontWeight};
                color: ${color};
                line-height: 1.3;
                padding: 5px;
                word-wrap: break-word;
                overflow-wrap: break-word;
                text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5), 0 0 2px rgba(0, 0, 0, 0.3);
              ">
                ${d.name}
              </div>
            `;
          });

        // 更新连接线标签 - 使用数据绑定
        let linkLabelsGroup = this.g.select('.link-labels');
        if (linkLabelsGroup.empty()) {
          linkLabelsGroup = this.g.append("g").attr("class", "link-labels");
        }
        
        // 过滤连接线标签数据
        const linkLabelData = this.getMergedLinkLabels(normalizedLinks).filter(d => {
          // 过滤掉在课程节点上错误显示的"contains"关系
          if (d.type === "包含" || d.type === "CONTAINS") {
            const sourceNode = typeof d.source === 'object' ? d.source : this.nodes.find(n => n.name === d.source);
            const targetNode = typeof d.target === 'object' ? d.target : this.nodes.find(n => n.name === d.target);
            
            // 如果源节点和目标节点都是课程，则不显示"contains"关系
            if (sourceNode && targetNode && 
                sourceNode.label === "Course" && targetNode.label === "Course") {
              return false;
            }
          }
          return true;
        });
        
        const linkLabelSelection = linkLabelsGroup.selectAll("g")
          .data(linkLabelData, d => `${d.source.name || d.source}-${d.target.name || d.target}-${d.type}`);
        
        // 移除不需要的标签组
        linkLabelSelection.exit().remove();
        
        // 添加新的标签组
        const newLinkLabels = linkLabelSelection.enter().append("g")
          .attr("class", "link-label-group");
        
        // 合并现有和新标签组
        this.linkLabels = linkLabelSelection.merge(newLinkLabels);
        
        // 为新标签组添加背景矩形和文本
        newLinkLabels.append("rect")
          .attr("class", "link-label-bg");
        
        newLinkLabels.append("text")
          .attr("class", "link-label");
        
        // 更新所有标签组的背景矩形属性（与原始方法保持完全一致）
        this.linkLabels.select("rect")
          .attr("class", "link-label-bg")
          .attr("x", -12)
          .attr("y", -8)
          .attr("width", 24)
          .attr("height", 16)
          .attr("stroke", "#D3D3D3")
          .attr("stroke-width", "1px")
          .attr("fill", "none")
          .attr("rx", 4)
          .style("display", this.showRelationLabels ? null : "none");
        
        // 更新所有标签组的文本属性（与原始方法保持完全一致）
        this.linkLabels.select("text")
          .attr("class", "link-label")
          .attr("text-anchor", "middle")
          .attr("dy", ".35em")
          .style("display", this.showRelationLabels ? null : "none")
          .text(d => this.translateRelationType(d.type));
        
        // 更新连接线标签背景的大小（与原始方法保持完全一致）
        this.linkLabels.selectAll(".link-label-bg")
          .attr("width", function() {
            const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
            return textWidth + 16;
          })
          .attr("x", function() {
            const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
            return -textWidth / 2 - 8;
          })
          .attr("y", -10)
          .attr("height", 20);

        // 更新模拟器的tick事件，确保标签位置正确更新
        this.simulation.on("tick", () => {
          // 更新连接线位置
          this.linkElements
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
          
          // 更新节点位置
          this.nodeElements
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
          
          // 修复：更新foreignObject标签位置（居中对齐）
          this.nodeLabels
            .attr("x", d => {
              const width = d.label === "Course" ? 140 : 
                           d.label === "Chapter" ? 120 : 
                           d.label === "Section" ? 110 : 100;
              return d.x - width / 2;
            })
            .attr("y", d => {
              const height = d.label === "Course" ? 140 : 
                            d.label === "Chapter" ? 120 : 
                            d.label === "Section" ? 110 : 100;
              return d.y - height / 2;
            });
          
          // 更新连接线标签位置
          this.linkLabels
            .attr("transform", d => {
              const midX = (d.source.x + d.target.x) / 2;
              const midY = (d.source.y + d.target.y) / 2;
              
              const dx = d.target.x - d.source.x;
              const dy = d.target.y - d.source.y;
              const angle = Math.atan2(dy, dx);
              
              const offset = d.offsetY || 0;
              const perpX = -Math.sin(angle) * offset;
              const perpY = Math.cos(angle) * offset;
              
              return `translate(${midX + perpX}, ${midY + perpY})`;
            });
          
          // 更新连接线标签背景的大小
          this.linkLabels.selectAll(".link-label-bg")
            .attr("width", function() {
              const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
              return textWidth + 16;
            })
            .attr("x", function() {
              const textWidth = this.parentNode.querySelector("text").getComputedTextLength();
              return -textWidth / 2 - 8;
            })
            .attr("y", -10)
            .attr("height", 20);
        });

        // 轻微重启模拟器以处理新节点，但保持现有节点位置稳定
        this.simulation.alpha(0.15).alphaDecay(0.2).restart();
        
        // 快速稳定新节点
        setTimeout(() => {
          if (this.simulation) {
            this.simulation.alpha(0).stop();
            this.fixAllNodesPosition(); // 固定所有节点
          }
        }, 300); // 300ms后立即固定

        // 恢复视图变换状态
        if (currentTransform && this.svg && this.zoom) {
          setTimeout(() => {
            try {
              this.svg.call(this.zoom.transform, currentTransform);
            } catch (error) {
              console.warn('[INCREMENTAL UPDATE] 无法恢复视图变换状态:', error);
            }
          }, 100);
        }

        console.log('[INCREMENTAL UPDATE] 增量更新完成');
        
      } catch (error) {
        console.error('[INCREMENTAL UPDATE] 增量更新失败:', error);
        // 如果增量更新失败，回退到完整刷新
        this.immediateRefreshDisplay();
      }
    },

    // 停止自动刷新
    stopAutoRefresh() {
      console.log('[AUTO REFRESH] 停止自动刷新');
      if (this.autoRefreshTimer) {
        clearInterval(this.autoRefreshTimer);
        this.autoRefreshTimer = null;
      }
    },

    // 切换控制面板显示/隐藏
    toggleControls() {
      this.controlsCollapsed = !this.controlsCollapsed;
      
      // 保存用户偏好到localStorage
      try {
        localStorage.setItem('controlsCollapsed', JSON.stringify(this.controlsCollapsed));
      } catch (error) {
        console.warn('保存控制面板状态失败:', error);
      }
    },

    // 初始化控制面板状态
    initControlsState() {
      try {
        const savedState = localStorage.getItem('controlsCollapsed');
        if (savedState !== null) {
          this.controlsCollapsed = JSON.parse(savedState);
        }
      } catch (error) {
        console.warn('恢复控制面板状态失败:', error);
        this.controlsCollapsed = false;
      }
    }
  }
};
</script>

<style scoped>
/* 全局重置，覆盖Bootstrap样式 */
* {
  box-sizing: border-box;
}

body {
  font-family: "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
  overflow: hidden; /* 防止页面滚动 */
}
.container-fluid {
  padding: 0 !important;
  margin: 0 !important;
  height: 100vh; /* 确保容器高度充满视口 */
  width: 100vw; /* 确保容器宽度充满视口 */
  overflow: hidden; /* 防止滚动条 */
  max-width: none !important; /* 覆盖Bootstrap的max-width */
}
.row{
  display: flex !important; /* 启用 Flexbox，覆盖Bootstrap */
  width: 100%; /* 确保容器宽度足够 */
  height: 100vh; /* 确保容器高度充满视口 */
  margin: 0 !important; /* 移除默认margin，覆盖Bootstrap */
  padding: 0 !important; /* 移除默认padding */
  overflow: hidden; /* 防止滚动条 */
  flex-wrap: nowrap !important; /* 防止换行 */
}
.sidebar {
  background-color: #f0f0f0;
  width: 25%; /* 1/4 宽度 */
  min-width: 25%; /* 确保最小宽度 */
  max-width: 25%; /* 确保最大宽度 */
  padding: 15px;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  transition: width 0.3s ease, min-width 0.3s ease, max-width 0.3s ease, padding 0.3s ease;
  flex-shrink: 0; /* 防止被压缩 */
  flex-grow: 0; /* 防止扩展 */
  box-sizing: border-box; /* 包含padding在宽度内 */
}

.sidebar.collapsed {
  width: 50px;
  min-width: 50px;
  max-width: 50px;
  padding: 15px 5px;
  overflow: hidden;
}

.sidebar-toggle-btn {
  position: absolute;
  top: 15px;
  right: 10px;
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sidebar-toggle-btn:hover {
  background: #f8f9fa;
  transform: scale(1.1);
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
}

.sidebar-toggle-btn i {
  font-size: 14px;
  color: #495057;
}

.sidebar.collapsed .sidebar-toggle-btn {
  right: 10px;
}

.sidebar-content {
  padding-top: 10px;
}

.main-content {
  flex: 1 1 0; /* 使用0作为基础值，确保完全填充剩余空间 */
  padding: 0;
  margin: 0;
  height: 100vh;
  position: relative;
  transition: flex 0.3s ease;
  overflow: hidden; /* 防止内容溢出 */
  box-sizing: border-box; /* 包含padding在宽度内 */
  min-width: 0; /* 允许flex项目缩小到内容以下 */
  width: 0; /* 强制flex计算宽度 */
}

.main-content.expanded {
  /* 侧边栏折叠时，主内容区域自动扩展填充空间 */
  flex: 1 1 0;
}
#graph-container {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  /* 确保SVG容器完全填充父容器 */
  display: flex;
  flex-direction: column;
}

#graph-container svg {
  width: 100% !important;
  height: 100% !important;
  display: block;
}
.node {
  stroke: #fff;
  stroke-width: 1.5px;
}

/* 增强模式层次显示样式 */
.hierarchy-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hierarchy-controls .form-check {
  margin-bottom: 0;
}

.hierarchy-indicator {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}

.course-indicator {
  background-color: #ff7f0e;
  border: 2px solid #e6690a;
}

.chapter-indicator {
  background-color: #2ca02c;
  border: 2px solid #228b22;
}

.section-indicator {
  background-color: #9467bd;
  border: 2px solid #7b4397;
}

.knowledge-point-indicator {
  background-color: #1f77b4;
  border: 2px solid #1a5d8a;
}

.relation-filter-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  max-height: 200px;
  overflow-y: auto;
}

.relation-filter-grid .form-check {
  margin-bottom: 0;
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #f8f9fa;
}

.relation-filter-grid .form-check:hover {
  background-color: #e9ecef;
}

.relation-type-indicator {
  display: inline-block;
  width: 16px;
  height: 3px;
  margin-right: 6px;
  vertical-align: middle;
  border-radius: 1px;
}

/* 层次化节点样式 - 四层结构（超大版本，可容纳10字） */
.node.course-node {
  fill: #ff7f0e;
  stroke: #e6690a;
  stroke-width: 4px;
  r: 70;
  /* 添加阴影效果增强视觉层次 */
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
}

.node.chapter-node {
  fill: #2ca02c;
  stroke: #228b22;
  stroke-width: 3.5px;
  r: 60;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
}

.node.section-node {
  fill: #9467bd;
  stroke: #7b4397;
  stroke-width: 3px;
  r: 55;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
}

.node.knowledge-point-node {
  fill: #1f77b4;
  stroke: #1a5d8a;
  stroke-width: 2.5px;
  r: 50;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.25));
}

/* 增强关系样式 */
.link.prerequisite-relation {
  stroke: #e74c3c;
  stroke-width: 2px;
  stroke-dasharray: none;
}

.link.parallel-relation {
  stroke: #1abc9c;
  stroke-width: 2px;
  stroke-dasharray: 5,5;
}

.link.application-relation {
  stroke: #3498db;
  stroke-width: 2px;
  stroke-dasharray: 2,3;
}

.link.extension-relation {
  stroke: #2ecc71;
  stroke-width: 2px;
  stroke-dasharray: none;
}

.link.dependency-relation {
  stroke: #f39c12;
  stroke-width: 2px;
  stroke-dasharray: none;
}

.link.contains-chapter-relation {
  stroke: #2c3e50;
  stroke-width: 3px;
  stroke-dasharray: none;
}

.link.belongs-to-chapter-relation {
  stroke: #34495e;
  stroke-width: 2px;
  stroke-dasharray: none;
}

/* 关系强度指示器样式 */
.strength-indicator {
  display: inline-block;
  width: 20px;
  height: 4px;
  margin-right: 8px;
  vertical-align: middle;
  border-radius: 2px;
}

.strong-indicator {
  background-color: #e74c3c;
  box-shadow: 0 0 4px rgba(231, 76, 60, 0.5);
}

.medium-indicator {
  background-color: #f39c12;
  box-shadow: 0 0 3px rgba(243, 156, 18, 0.5);
}

.weak-indicator {
  background-color: #95a5a6;
  box-shadow: 0 0 2px rgba(149, 165, 166, 0.5);
}

/* 关系强度筛选面板样式 */
.relation-strength-filter {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.relation-strength-filter .form-check {
  margin-bottom: 0;
}

/* 关系分类标签样式 */
.filter-tabs {
  display: flex;
  margin-bottom: 12px;
  border-bottom: 1px solid #dee2e6;
}

.filter-tab {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background-color: transparent;
  color: #6c757d;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.filter-tab:hover {
  color: #495057;
  background-color: #f8f9fa;
}

.filter-tab.active {
  color: #007bff;
  border-bottom-color: #007bff;
  font-weight: 500;
}

/* 关系过滤项样式增强 */
.relation-filter-item {
  padding: 6px 10px;
  border-radius: 4px;
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.relation-filter-item:hover {
  background-color: #f8f9fa;
  border-color: #dee2e6;
}

.relation-filter-item .form-check-input:checked ~ .form-check-label {
  color: #007bff;
  font-weight: 500;
}

.relation-name {
  font-size: 0.875rem;
  margin-right: 6px;
}

.relation-strength-badge {
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}

.relation-strength-badge.strength-strong {
  background-color: #e74c3c;
  color: white;
}

.relation-strength-badge.strength-medium {
  background-color: #f39c12;
  color: white;
}

.relation-strength-badge.strength-weak {
  background-color: #95a5a6;
  color: white;
}

/* 关系提示框样式 */
.relation-tooltip {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.relation-tooltip .text-muted {
  color: #adb5bd !important;
  font-size: 11px;
  margin-top: 4px;
}

.relation-tooltip .strength-强 {
  color: #ff6b6b;
  font-weight: bold;
}

.relation-tooltip .strength-中 {
  color: #feca57;
  font-weight: bold;
}

.relation-tooltip .strength-弱 {
  color: #a4b0be;
  font-weight: bold;
}

/* 学习路径高亮样式 */
.node.learning-path-node {
  filter: drop-shadow(0 0 8px rgba(255, 107, 107, 0.6));
  animation: pathNodePulse 2s ease-in-out infinite;
}

.link.learning-path-link {
  filter: drop-shadow(0 0 4px rgba(255, 107, 107, 0.4));
  animation: pathLinkFlow 3s ease-in-out infinite;
}

.learning-path-label {
  filter: drop-shadow(0 0 4px rgba(255, 107, 107, 0.8));
  animation: pathLabelGlow 2s ease-in-out infinite;
}

@keyframes pathNodePulse {
  0%, 100% { 
    transform: scale(1); 
    opacity: 1; 
  }
  50% { 
    transform: scale(1.1); 
    opacity: 0.8; 
  }
}

@keyframes pathLinkFlow {
  0% { 
    stroke-dasharray: 0, 10; 
  }
  50% { 
    stroke-dasharray: 5, 5; 
  }
  100% { 
    stroke-dasharray: 10, 0; 
  }
}

@keyframes pathLabelGlow {
  0%, 100% { 
    opacity: 1; 
  }
  50% { 
    opacity: 0.7; 
  }
}

/* 箭头增强样式 */
.link {
  transition: stroke-width 0.2s ease, stroke-opacity 0.2s ease;
}

.link:hover {
  stroke-width: 4px !important;
  stroke-opacity: 1 !important;
}

/* 不同关系类型的连接线样式增强 */
.link.prerequisite-relation {
  stroke: #e74c3c;
  stroke-width: 2.5px;
  filter: drop-shadow(0 0 2px rgba(231, 76, 60, 0.3));
}

.link.parallel-relation {
  stroke: #1abc9c;
  stroke-width: 2px;
  stroke-dasharray: 5,5;
  filter: drop-shadow(0 0 2px rgba(26, 188, 156, 0.3));
}

.link.application-relation {
  stroke: #3498db;
  stroke-width: 2px;
  stroke-dasharray: 2,3;
  filter: drop-shadow(0 0 2px rgba(52, 152, 219, 0.3));
}

.link.extension-relation {
  stroke: #2ecc71;
  stroke-width: 2px;
  filter: drop-shadow(0 0 2px rgba(46, 204, 113, 0.3));
}

.link.dependency-relation {
  stroke: #f39c12;
  stroke-width: 2.5px;
  filter: drop-shadow(0 0 2px rgba(243, 156, 18, 0.3));
}

.link.contains-chapter-relation,
.link.belongs-to-chapter-relation {
  stroke: #2c3e50;
  stroke-width: 3px;
  filter: drop-shadow(0 0 2px rgba(44, 62, 80, 0.3));
}

/* 选中状态的连接线 */
.link.selected {
  stroke: #ff6b6b !important;
  stroke-width: 4px !important;
  filter: drop-shadow(0 0 4px rgba(255, 107, 107, 0.5));
  animation: selectedLinkPulse 1.5s ease-in-out infinite;
}

@keyframes selectedLinkPulse {
  0%, 100% { 
    stroke-opacity: 1; 
  }
  50% { 
    stroke-opacity: 0.7; 
  }
}
.link {
  stroke: #999;
  stroke-opacity: 0.6;
  stroke-width: 1px;
}
.node-label {
  font-size: 13px;
  pointer-events: none;
  /* 修复：默认白色文字，选中时通过JS动态改为红色 */
  fill: #ffffff !important;
  font-weight: 600;
  text-anchor: middle;
  dominant-baseline: middle;
  /* 添加阴影增强对比度和可读性 */
  text-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.5),
    0 0 2px rgba(0, 0, 0, 0.3);
  /* 优化文字渲染 */
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

/* 选中状态的标签样式 */
.node-label.selected {
  fill: #ff6b6b !important;
  text-shadow: 
    0 1px 3px rgba(255, 107, 107, 0.5),
    0 0 2px rgba(255, 107, 107, 0.3);
}
.link-label {
  font-size: 12px;
  pointer-events: none;
  fill: #333;
  font-weight: 600; /* 从 500 增加到 600 */
  /* 增加文字清晰度 */
  text-rendering: optimizeLegibility;
}
.link-label-bg {
  fill: rgba(255, 255, 255, 0.95); /* 从 none 改为白色半透明 */
  rx: 6; /* 从 4 增加到 6 */
  ry: 6;
  stroke: #999; /* 从 #D3D3D3 改为 #999 */
  stroke-width: 1.5px; /* 从 1px 增加到 1.5px */
  /* 添加阴影效果 */
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}
.search-box {
  margin-bottom: 15px;
}
.card {
  margin-bottom: 15px;
}
.loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255,255,255,0.8);
  padding: 20px;
  border-radius: 5px;
  text-align: center;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  z-index: 1000;
}
.properties-panel {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 300px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  z-index: 100;
  max-height: 80%;
  overflow-y: auto;
}
.query-box {
  margin-bottom: 15px;
}

.query-box .form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.query-box .form-label .label-hint {
  font-size: 12px;
  font-weight: 400;
  color: #6c757d;
  font-style: italic;
}

.query-box .form-select,
.query-box .form-control {
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #ced4da;
  padding: 0.5rem 0.75rem;
  font-size: 0.95rem;
}

.query-box .form-select:focus,
.query-box .form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.query-box .input-group .btn {
  border-radius: 0 0.375rem 0.375rem 0;
}

/* 美化的自定义选择框样式 */
.custom-select-wrapper {
  position: relative;
  width: 100%;
  user-select: none;
}

.custom-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.custom-select-trigger:hover {
  border-color: #007bff;
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.1);
}

.custom-select-wrapper.active .custom-select-trigger {
  border-color: #007bff;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
}

.selected-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #333;
  font-weight: 500;
}

.custom-select-trigger i {
  font-size: 16px;
  color: #666;
  transition: transform 0.3s ease;
  margin-left: 8px;
}

.custom-select-wrapper.active .custom-select-trigger i {
  transform: rotate(180deg);
  color: #007bff;
}

.custom-select-dropdown {
  position: absolute;
  top: calc(100% - 2px);
  left: 0;
  right: 0;
  background: white;
  border: 2px solid #007bff;
  border-top: none;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 8px 16px rgba(0, 123, 255, 0.15);
  z-index: 1000;
  max-height: 400px;
  overflow: hidden;
  animation: dropdownSlide 0.3s ease;
}

@keyframes dropdownSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-box {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  background: #fafafa;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-icon {
  color: #999;
  font-size: 16px;
}

.search-box .search-input {
  flex: 1;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
}

.search-box .search-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.options-list {
  max-height: 300px;
  overflow-y: auto;
  padding: 4px;
}

.options-list::-webkit-scrollbar {
  width: 6px;
}

.options-list::-webkit-scrollbar-track {
  background: #f5f5f5;
  border-radius: 3px;
}

.options-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.options-list::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  gap: 10px;
  margin: 2px 0;
}

.option-item:hover {
  background: #f0f7ff;
}

.option-item.selected {
  background: #e3f2fd;
  color: #007bff;
  font-weight: 500;
}

.option-icon {
  font-size: 16px;
  color: #666;
  flex-shrink: 0;
}

.option-item.selected .option-icon {
  color: #007bff;
}

.option-item span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.check-icon {
  font-size: 18px;
  color: #007bff;
  flex-shrink: 0;
  animation: checkPop 0.3s ease;
}

@keyframes checkPop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 章节选项特殊样式 */
.chapter-option {
  position: relative;
}

.chapter-option.first-click-ready {
  background: #fff3cd;
  border-left: 3px solid #ffc107;
  animation: pulseGlow 1.5s ease-in-out infinite;
}

.chapter-option.first-click-ready:hover {
  background: #ffe69c;
}

@keyframes pulseGlow {
  0%, 100% {
    box-shadow: 0 0 0 rgba(255, 193, 7, 0);
  }
  50% {
    box-shadow: 0 0 10px rgba(255, 193, 7, 0.3);
  }
}

.chapter-option .chapter-name {
  flex: 1;
}

.chapter-option .click-hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #ff9800;
  font-weight: 500;
  white-space: nowrap;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}



.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 20px;
  color: #999;
  gap: 8px;
}

.no-results i {
  font-size: 32px;
  opacity: 0.5;
}

.no-results span {
  font-size: 14px;
}

.preset-query {
  margin-bottom: 5px;
  text-align: left;
  padding: 8px;
  width: 100%;
}
.statistics {
  margin-top: 20px;
}
/* 优化后的控制面板样式 */
.controls-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  min-width: 200px;
}

.controls-panel.collapsed {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  overflow: hidden;
}

.controls-toggle-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(108, 117, 125, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 101;
}

.controls-toggle-btn:hover {
  background: rgba(108, 117, 125, 0.2);
  transform: scale(1.1);
}

.controls-toggle-btn i {
  font-size: 12px;
  color: #6c757d;
}

.controls-content {
  padding: 12px;
  padding-top: 36px;
}

.controls-row {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.controls-row .btn {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 4px;
  flex: 1;
  min-width: 50px;
}

.node-limit-control {
  margin-bottom: 12px;
}

.form-label-sm {
  font-size: 0.75rem;
  font-weight: 500;
  color: #495057;
  margin-bottom: 4px;
  display: block;
}

.node-limit-value {
  font-weight: 600;
  color: #007bff;
}

.form-range-sm {
  height: 1rem;
  margin-bottom: 0;
}

.display-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-check-sm {
  margin-bottom: 0;
}

.form-check-sm .form-check-input {
  width: 1rem;
  height: 1rem;
  margin-top: 0.125rem;
}

.form-check-label-sm {
  font-size: 0.75rem;
  color: #495057;
  margin-left: 0.25rem;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .controls-panel {
    top: 5px;
    left: 5px;
    min-width: 180px;
  }
  
  .controls-panel.collapsed {
    width: 36px;
    height: 36px;
    border-radius: 18px;
  }
  
  .controls-toggle-btn {
    width: 20px;
    height: 20px;
    top: 6px;
    right: 6px;
  }
  
  .controls-toggle-btn i {
    font-size: 10px;
  }
  
  .controls-content {
    padding: 10px;
    padding-top: 32px;
  }
  
  .controls-row {
    gap: 4px;
    margin-bottom: 10px;
  }
  
  .controls-row .btn {
    font-size: 0.7rem;
    padding: 3px 6px;
    min-width: 45px;
  }
}
.node.highlighted {
  stroke: #FF4500;
  stroke-width: 3px;
}
.node.fixed {
  stroke: #444;
  stroke-width: 2px;
}
.node-label.highlighted {
  font-weight: bold;
  fill: #FF4500;
}
/* 移除旧的节点限制控制样式，已在新的控制面板中定义 */

/* 调整预设查询按钮样式 */
.card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.text{
  padding: 8px;
}

/* 固定位置节点样式 */
.node.fixed-position {
  cursor: move;
}

/* 增删改功能样式 */
.crud-panel {
  border-left: 3px solid #007bff;
}

.crud-panel .btn {
  margin-bottom: 5px;
  font-size: 0.85rem;
}

.crud-panel .btn-group-sm .btn {
  margin-right: 2px;
  margin-bottom: 2px;
}

/* 模态框样式优化 */
.modal-dialog {
  max-width: 500px;
}

.modal-body .form-control {
  font-size: 0.9rem;
}

.modal-body .form-select {
  font-size: 0.9rem;
}

/* 增删改按钮悬停效果 */
.crud-panel .btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
}

/* 选中状态样式 */
.node.selected {
  stroke: #ff6b6b !important;
  stroke-width: 5px !important;
  filter: drop-shadow(0 0 12px rgba(255, 107, 107, 0.8)) !important;
  animation: selectedNodePulse 2s ease-in-out infinite;
}

@keyframes selectedNodePulse {
  0%, 100% { 
    filter: drop-shadow(0 0 12px rgba(255, 107, 107, 0.8));
  }
  50% { 
    filter: drop-shadow(0 0 20px rgba(255, 107, 107, 1));
  }
}

.link.selected {
  stroke-width: 3px !important;
  stroke: #ff6b6b !important;
}

/* 右键菜单样式 */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 10000;
  min-width: 160px;
  padding: 4px 0;
}

.context-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  transition: background-color 0.2s;
}

.context-menu-item:hover {
  background-color: #f8f9fa;
}

.context-menu-item.disabled {
  color: #6c757d;
  cursor: not-allowed;
}

.context-menu-item.disabled:hover {
  background-color: transparent;
}

.context-menu-item i {
  margin-right: 8px;
  width: 16px;
}

.context-menu-item.delete {
  color: #dc3545;
}

.context-menu-item.delete:hover {
  background-color: #f8d7da;
}

.context-menu-item.delete-course {
  color: #d63384;
  font-weight: 500;
}

.context-menu-item.delete-course:hover {
  background-color: #f7d6e6;
}

.context-menu-divider {
  height: 1px;
  background-color: #e9ecef;
  margin: 4px 0;
}

.context-menu hr {
  margin: 4px 0;
  border: none;
  border-top: 1px solid #e9ecef;
}

/* 提示消息样式 */
.success-message, .error-message {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  min-width: 300px;
  max-width: 500px;
}

.success-message .alert, .error-message .alert {
  margin-bottom: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border: none;
  border-radius: 8px;
}

.success-message .alert-success {
  background-color: #d4edda;
  color: #155724;
  border-left: 4px solid #28a745;
}

.error-message .alert-danger {
  background-color: #f8d7da;
  color: #721c24;
  border-left: 4px solid #dc3545;
}

.success-message .alert i, .error-message .alert i {
  margin-right: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .crud-panel .btn-group-sm {
    flex-direction: column;
  }

  .crud-panel .btn-group-sm .btn {
    margin-right: 0;
    margin-bottom: 5px;
  }

  .context-menu {
    min-width: 140px;
  }

  .context-menu-item {
    padding: 6px 12px;
    font-size: 13px;
  }

  .success-message, .error-message {
    top: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
  }

  /* 学习资料相关样式 */
  .materials-content {
    max-height: 400px;
    overflow-y: auto;
  }

  .upload-section {
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    padding: 10px;
    background-color: #f8f9fa;
  }

  .materials-grid {
    max-height: 250px;
    overflow-y: auto;
  }

  .material-item {
    border: 1px solid #e0e0e0;
    border-radius: 5px;
    transition: all 0.2s ease;
  }

  .material-item:hover {
    border-color: #007bff;
    box-shadow: 0 2px 8px rgba(0,123,255,0.1);
  }

  .material-item .card-body {
    padding: 12px;
  }

  .material-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
  }

  /* 统计信息样式 */
  .material-stats {
    border-top: 1px solid #f0f0f0;
    padding-top: 8px;
  }

  /* 文件预览提示样式 */
  .preview-hint {
    font-size: 0.75rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .preview-hint i {
    font-size: 0.8rem;
  }

  .stats-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .stat-item i {
    font-size: 1rem;
  }

  .stat-text {
    font-weight: 500;
    color: #6c757d;
  }

  /* 操作按钮样式 */
  .material-actions {
    border-top: 1px solid #f0f0f0;
    padding-top: 10px;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }

  /* 查看按钮 */
  .btn-view {
    background-color: #e3f2fd;
    border-color: #2196f3;
    color: #1976d2;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-view:hover {
    background-color: #bbdefb;
    border-color: #1976d2;
    color: #1565c0;
    transform: translateY(-1px);
  }

  .btn-view i {
    color: #1976d2;
  }

  /* 下载按钮 */
  .btn-download {
    background-color: #e8f5e8;
    border-color: #4caf50;
    color: #388e3c;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-download:hover {
    background-color: #c8e6c9;
    border-color: #388e3c;
    color: #2e7d32;
    transform: translateY(-1px);
  }

  .btn-download i {
    color: #388e3c;
  }

  /* 删除按钮 */
  .btn-delete {
    background-color: #ffebee;
    border-color: #f44336;
    color: #d32f2f;
    font-weight: 500;
    transition: all 0.2s ease;
  }

  .btn-delete:hover {
    background-color: #ffcdd2;
    border-color: #d32f2f;
    color: #c62828;
    transform: translateY(-1px);
  }

  .btn-delete i {
    color: #d32f2f;
  }

  /* 按钮文本 */
  .btn-text {
    margin-left: 4px;
  }

  .materials-list h6 {
    margin-bottom: 10px;
    color: #495057;
  }

  /* 移动设备响应式样式 */
  @media (max-width: 576px) {
    .material-actions {
      flex-direction: column;
      gap: 4px;
    }

    .btn-view, .btn-download, .btn-delete {
      width: 100%;
      justify-content: center;
      padding: 6px 12px;
    }

    .btn-text {
      margin-left: 8px;
    }

    .stats-row {
      flex-direction: column;
      gap: 4px;
      align-items: flex-start;
    }

    .stat-item {
      font-size: 0.85rem;
    }
    
    /* 移动端侧边栏优化 */
    .row {
      flex-direction: column;
    }
    
    .sidebar {
      width: 100%;
      height: auto;
      max-height: 40vh;
      flex-shrink: 0;
    }
    
    .sidebar.collapsed {
      width: 100%;
      height: 50px;
      max-height: 50px;
    }
    
    .main-content {
      width: 100%;
      height: 60vh;
      flex: 1;
    }
    
    .main-content.expanded {
      height: calc(100vh - 50px);
    }
  }

  /* 平板响应式样式 */
  @media (max-width: 768px) and (min-width: 577px) {
    .material-actions {
      gap: 4px;
    }

    .btn-view, .btn-download, .btn-delete {
      min-width: 70px;
    }
    
    .sidebar {
      width: 30%;
      flex-shrink: 0;
    }
    
    .sidebar.collapsed {
      width: 50px;
    }
    
    .main-content {
      flex: 1;
    }
  }
}
/*
 修复模态框中表单行的垂直间距问题 */
.modal-body .row {
  --bs-gutter-y: 0 !important;
  margin-bottom: 0 !important;
}

.modal-body .row.mb-3 {
  margin-bottom: 1rem !important;
}
</style>
