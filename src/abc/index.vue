c<template>
  <div class="container-fluid">
    <div class="row">
      <!-- 左侧边栏：查询工具 -->
      <div class="col-md-3 sidebar">
        <h3 class="mb-4">计算机专业知识图谱</h3>
        
        <!-- 查询框 -->
        <div class="query-box">
          <div class="input-group mb-3">
            <input 
              type="text" 
              id="query-input" 
              class="form-control" 
              placeholder="输入查询语句..."
              v-model="queryText"
              @keypress.enter="executeQuery"
            >
            <button class="btn btn-primary" @click="executeQuery">查询</button>
          </div>
          <div class="form-text mb-2">支持自然语言查询，例如："查找与算法相关的知识点"</div>
        </div>
        
        <!-- 预设查询按钮组 -->
        <div class="card">
          <div class="card-header">
            常用查询
          </div>
          <div class="card-body">
            <button 
              v-for="(query, index) in presetQueries" 
              :key="index"
              :class="query.query ? 'btn btn-outline-secondary preset-query' : 'btn btn-light preset-query disabled'"
              :disabled="!query.query"
              @click="selectPresetQuery(query)"
            >
              {{ query.label }}
            </button>
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
      
      <!-- 右侧主要内容：图谱可视化 -->
      <div class="col-md-9 main-content">
        <div id="graph-container" ref="graphContainer"></div>
        <div class="controls-panel">
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
            稳定布局
          </button>
          <button 
            id="reset-btn" 
            class="btn btn-sm btn-outline-danger"
            @click="resetLayout"
          >
            重置
          </button>
          <div id="node-limit-control">
            <label for="node-limit-slider" class="form-label">
              节点限制: <span id="node-limit-value">{{ nodeLimit }}</span>
            </label>
            <div class="slider-container">
              <input 
                type="range" 
                class="form-range" 
                id="node-limit-slider" 
                min="10" 
                max="2000" 
                v-model="nodeLimit"
              >
            </div>
          </div>
          <div class="form-check form-switch mt-2">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="show-labels-switch" 
              v-model="showLabels"
            >
            <label class="form-check-label" for="show-labels-switch">显示实体标签</label>
          </div>
          <div class="form-check form-switch">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="show-relation-labels-switch" 
              v-model="showRelationLabels"
            >
            <label class="form-check-label" for="show-relation-labels-switch">显示关系标签</label>
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
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">课程名称 *</label>
                      <input type="text" class="form-control" v-model="newNode.name" required>
                    </div>
                    <div class="col-md-6 mb-3">
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
                  <div class="row">
                    <div class="col-md-6 mb-3">
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
                    <div class="col-md-6 mb-3">
                      <label class="form-label">学分</label>
                      <input type="number" class="form-control" v-model="newNode.credits" min="0" max="10" step="0.5">
                    </div>
                  </div>
                </div>

                <!-- 知识点节点创建界面 -->
                <div v-else-if="newNode.label === 'KnowledgePoint'">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">知识点名称 *</label>
                      <input type="text" class="form-control" v-model="newNode.name" required>
                    </div>
                    <div class="col-md-6 mb-3">
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
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">难度等级</label>
                      <select class="form-select" v-model="newNode.difficulty">
                        <option value="">选择难度</option>
                        <option value="简单">简单</option>
                        <option value="中等">中等</option>
                        <option value="困难">困难</option>
                        <option value="非常困难">非常困难</option>
                      </select>
                    </div>
                    <div class="col-md-6 mb-3">
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
                更新{{ updateNodeData.label === 'Course' ? '课程' : '知识点' }}节点
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" @click="hideModal('updateNodeModal')"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updateNode">
                <!-- 课程节点编辑界面 -->
                <div v-if="updateNodeData.label === 'Course'">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">课程名称 *</label>
                      <input type="text" class="form-control" v-model="updateNodeData.name" required>
                    </div>
                    <div class="col-md-6 mb-3">
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
                  <div class="row">
                    <div class="col-md-6 mb-3">
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
                    <div class="col-md-6 mb-3">
                      <label class="form-label">学分</label>
                      <input type="number" class="form-control" v-model="updateNodeData.credits" min="0" max="10" step="0.5">
                    </div>
                  </div>
                </div>

                <!-- 知识点节点编辑界面 -->
                <div v-else-if="updateNodeData.label === 'KnowledgePoint'">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">知识点名称 *</label>
                      <input type="text" class="form-control" v-model="updateNodeData.name" required>
                    </div>
                    <div class="col-md-6 mb-3">
                      <label class="form-label">所属课程 *</label>
                      <select class="form-select" v-model="updateNodeData.courseName" required>
                        <option value="">选择课程</option>
                        <option v-for="course in courseList" :key="course.name" :value="course.name">
                          {{ course.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">知识点描述</label>
                    <textarea class="form-control" v-model="updateNodeData.description" rows="3" placeholder="请输入知识点描述"></textarea>
                  </div>
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label class="form-label">难度等级</label>
                      <select class="form-select" v-model="updateNodeData.difficulty">
                        <option value="">选择难度</option>
                        <option value="简单">简单</option>
                        <option value="中等">中等</option>
                        <option value="困难">困难</option>
                        <option value="非常困难">非常困难</option>
                      </select>
                    </div>
                    <div class="col-md-6 mb-3">
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
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">关系属性 (JSON格式)</label>
                  <textarea class="form-control" v-model="newRelationship.propertiesJson" rows="2" placeholder='{"weight": 1}'></textarea>
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
                    <option value="RELATED_TO">相关于</option>
                    <option value="CONTAINS">包含</option>
                    <option value="PREREQUISITE">先修于</option>
                    <option value="SIMILAR_TO">相似于</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label class="form-label">更新属性 (JSON格式)</label>
                  <textarea class="form-control" v-model="updateRelationshipForm.propertiesJson" rows="2" placeholder='{"weight": 2}'></textarea>
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
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">所属课程</label>
                    <input type="text" class="form-control" v-model="quickCreateKnowledgePointData.courseName" readonly>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label class="form-label">知识点名称 *</label>
                    <input type="text" class="form-control" v-model="quickCreateKnowledgePointData.knowledgePointName" required placeholder="输入知识点名称">
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label">知识点描述</label>
                  <textarea class="form-control" v-model="quickCreateKnowledgePointData.description" rows="3" placeholder="请输入知识点描述"></textarea>
                </div>
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label class="form-label">难度等级</label>
                    <select class="form-select" v-model="quickCreateKnowledgePointData.difficulty">
                      <option value="">选择难度</option>
                      <option value="简单">简单</option>
                      <option value="中等">中等</option>
                      <option value="困难">困难</option>
                      <option value="非常困难">非常困难</option>
                    </select>
                  </div>
                  <div class="col-md-6 mb-3">
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
                <div class="mb-3">
                  <label class="form-label">关系类型</label>
                  <select class="form-select" v-model="quickCreateKnowledgePointData.relationType">
                    <option value="CONTAINS">包含</option>
                    <option value="BELONGS_TO">属于</option>
                    <option value="RELATED_TO">相关于</option>
                    <option value="PREREQUISITE">先修于</option>
                    <option value="SIMILAR_TO">相似于</option>
                  </select>
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

      <!-- 右键菜单 -->
      <div v-if="contextMenu.show" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" v-show="contextMenu.show">
        <div class="context-menu-item" v-if="contextMenu.type === 'node'" @click="handleContextMenuAction('createKnowledgePoint')" :class="{ disabled: contextMenu.target.label !== 'Course' }">
          <i class="bi bi-plus-circle"></i> 创建知识点
        </div>
        <div class="context-menu-item" v-if="contextMenu.type === 'node'" @click="handleContextMenuAction('createRelationship')">
          <i class="bi bi-link"></i> 创建关系
        </div>
        <div class="context-menu-item" @click="handleContextMenuAction('update' + (contextMenu.type === 'node' ? 'Node' : 'Relationship'))">
          <i class="bi bi-pencil"></i> 编辑{{ contextMenu.type === 'node' ? '节点' : '关系' }}
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
      baseUrl:'api/Graphapps/',
      queryText: '',
      presetQueries: [
        { label: '显示整个知识图谱', query: '显示整个知识图谱' },
        { label: '显示所有知识点', query: '显示所有知识点' },
        { label: '显示所有课程', query: '显示所有课程' },
        { label: '使用说明：直接输入实体名称即可搜索', query: '' },
        { label: '例如：算法、数据结构、人工智能等', query: '' }
      ],
      // 右击操作状态管理
      isContextMenuOperation: false,
      
      // 提示消息状态管理
      showSuccessMessage: false,
      showErrorMessage: false,
      successMessage: '',
      errorMessage: '',
      
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
      nodeLimit: 500,
      showLabels: true,
      showRelationLabels: true,
      zoom: null,
      isLoading: false,
      selectedNode: null,
      // 关系类型映射表
      relationTypeMap: {
        "RELATED_TO": "相关于",
        "PART_OF": "属于",
        "PREREQUISITE": "先决条件",
        "INCLUDES": "包含",
        "FOLLOWS": "跟随",
        "SIMILAR_TO": "类似于",
        "DEPENDS_ON": "依赖于",
        "APPLIES_TO": "应用于",
        "USED_IN": "用于",
        "SUBSET_OF": "子集",
        "INSTANCE_OF": "实例",
        "DEFINED_BY": "定义",
        "IMPLEMENTED_IN": "实现于",
        "CONTAINS": "包含"
      },
      // 实体类型颜色映射
      colors: {
        "KnowledgePoint": "#1f77b4",  // 蓝色
        "Course": "#ff7f0e",          // 橙色
        "DEFAULT": "#999999"          // 默认灰色
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
        relation_type: 'RELATED_TO',
        propertiesJson: ''
      },
      updateRelationshipData: {
        source: '',
        target: '',
        old_relation_type: '',
        new_relation_type: 'RELATED_TO',
        propertiesJson: ''
      },
      updateRelationshipForm: {
        source: '',
        target: '',
        old_relation_type: '',
        new_relation_type: 'RELATED_TO',
        propertiesJson: ''
      },
      deleteRelationshipForm: {
        source: '',
        target: '',
        old_relation_type: '',
        new_relation_type: '',
        propertiesJson: ''
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
      quickCreateKnowledgePointData: {
        courseName: '',
        knowledgePointName: '',
        description: '',
        difficulty: '',
        importance: '',
        relationType: 'CONTAINS'
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
      lastProcessedTime: 0
    }
  },

  watch: {
    nodeLimit(newVal) {
      if (this.originalData && !this.hasUrlParams()) {
        // 只有在没有URL参数（即正常浏览模式）下才重新应用节点限制
        // 如果是从URL参数跳转进来的，保持当前的查询结果
        console.log('[NODE LIMIT] 节点限制变化，重新应用到原始数据');
        this.updateGraph(this.originalData, true, true, true);
      } else if (this.originalData && this.hasUrlParams()) {
        console.log('[NODE LIMIT] 有URL参数，跳过节点限制重新应用');
      }
    },
    showLabels(newVal) {
      if (this.nodeLabels) {
        this.nodeLabels.style("display", newVal ? null : "none");
      }
    },
    showRelationLabels(newVal) {
      if (this.linkLabels) {
        this.linkLabels.selectAll("text, rect").style("display", newVal ? null : "none");
      }
    }
  },
  computed: {
    // 过滤和翻译属性
    filteredProperties() {
      if (!this.selectedNode || !this.selectedNode.properties) {
        return [];
      }

      const properties = this.selectedNode.properties;
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
    this.initSvg();
    this.loadStatistics();

    // 检查URL参数，看是否是从管理页面跳转过来的
    this.checkUrlParameters();

    // 只有在没有URL参数的情况下才加载初始图谱
    // 如果有URL参数，checkUrlParameters会处理自动查询
    if (!this.hasUrlParams()) {
      this.loadInitialGraph();
      
      // 检查是否有新生成的课程需要自动搜索
      this.checkForNewGeneratedCourse();
    }

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('click', this.handleBackgroundClick);

    // 添加课程生成完成监听器
    this.setupCourseGenerationListeners();

    // 添加视图变化监听器
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
  },
  beforeDestroy() {
    if (this.simulation) {
      this.simulation.stop();
    }
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('click', this.handleBackgroundClick);

    // 清理课程生成监听器
    this.cleanupCourseGenerationListeners();

    // 清理自动刷新定时器
    if (this.autoRefreshTimer) {
      clearInterval(this.autoRefreshTimer);
      this.autoRefreshTimer = null;
    }
  },

  methods: {
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
      
      // 创建新SVG
      this.svg = d3.select("#graph-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // 创建缩放行为
      this.zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          this.g.attr("transform", event.transform);
        });

      // 应用缩放
      this.svg.call(this.zoom);

      this.g = this.svg.append("g");
      
      // 如果需要保持变换状态且之前有保存的变换，恢复它
      if (preserveTransform && currentTransform) {
        console.log('[DEBUG] 恢复视图变换状态:', currentTransform);
        this.svg.call(this.zoom.transform, currentTransform);
      }
      
      // 添加箭头标记定义
      this.svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25)
        .attr("refY", 0)
        .attr("markerWidth", 5)
        .attr("markerHeight", 5)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#666");
      
      return this.g;
    },
    
    // 限制显示的节点数量
    limitNodes(data, limit) {
      if (!data || !data.nodes || data.nodes.length <= limit) {
        return data;
      }

      const limitedData = {
        nodes: [],
        relationships: []
      };

      // 优先保留课程节点，然后是知识点节点
      const courseNodes = data.nodes.filter(node => node.label === 'Course');
      const knowledgeNodes = data.nodes.filter(node => node.label === 'KnowledgePoint');

      // 确保至少显示所有课程节点
      limitedData.nodes = [...courseNodes];

      // 计算剩余可显示的知识点数量
      const remainingLimit = Math.max(0, limit - courseNodes.length);
      limitedData.nodes.push(...knowledgeNodes.slice(0, remainingLimit));

      // 创建节点ID集合以便快速查找
      const nodeIds = new Set(limitedData.nodes.map(node => node.id));

      // 只保留连接已保留节点的关系
      limitedData.relationships = data.relationships.filter(rel =>
        nodeIds.has(rel.source) && nodeIds.has(rel.target)
      );

      return limitedData;
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
      const normalizedLinks = limitedData.relationships.map(link => ({
        ...link,
        source: typeof link.source === 'object' ? link.source.name : link.source,
        target: typeof link.target === 'object' ? link.target.name : link.target
      }));
      
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
      
      // 创建新的模拟
      this.simulation = d3.forceSimulation(this.nodes)
        .force("link", d3.forceLink(this.links).id(d => d.name)
          .distance(d => {
            if (d.source.label === 'Course' || d.target.label === 'Course') {
              return 180;
            }
            return 150;
          })
        )
        .force("charge", d3.forceManyBody()
          .strength(d => {
            if (d.label === 'Course') {
              return -1000;
            }
            return -800;
          })
        )
        .force("center", d3.forceCenter(0, 0))
        .force("x", d3.forceX(0).strength(0.02))
        .force("y", d3.forceY(0).strength(0.02))
        .force("collide", d3.forceCollide()
          .radius(d => {
            if (d.label === 'Course') {
              return 80;
            }
            return 60;
          })
          .strength(0.7)
          .iterations(3)
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
        .attr("class", d => "link" + (this.isLinkSelected(d) ? " selected" : ""))
        .attr("stroke", "#999")
        .attr("stroke-width", d => this.isLinkSelected(d) ? 3 : 2)
        .attr("marker-end", "url(#arrowhead)")
        .style("cursor", "pointer")
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
          console.log('关系点击事件触发:', d);
          event.stopPropagation();
          this.selectLink(d);
        })
        .on("contextmenu", (event, d) => {
          console.log('关系右键事件触发:', d);
          event.preventDefault();
          this.$nextTick(() => {
            this.showContextMenu(event, 'link', d);
          });
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
        .attr("class", d => "node" + (d.label === "Course" ? " course-node" : "") + (this.isNodeSelected(d) ? " selected" : "") + (preservePositions ? " fixed-position" : ""))
        .attr("r", d => d.label === "Course" ? 18 : 12)
        .attr("fill", d => this.getEntityColor(d.label))
        .attr("stroke", d => this.isNodeSelected(d) ? "#ff6b6b" : "#fff")
        .attr("stroke-width", d => this.isNodeSelected(d) ? 4 : 2)
        .call(d3.drag()
          .on("start", this.dragStarted)
          .on("drag", this.dragged)
          .on("end", this.dragEnded)
        )
        .on("click", (event, d) => {
          event.stopPropagation();
          this.selectNode(d);
        })
        .on("dblclick", (event, d) => this.fixNode(d))
        .on("contextmenu", (event, d) => {
          console.log('节点右键事件触发:', d);
          event.preventDefault();
          this.$nextTick(() => {
            this.showContextMenu(event, 'node', d);
          });
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
      
      // 设置标签属性
      this.nodeLabels = nodeLabelSelection.merge(newNodeLabels)
        .attr("class", "node-label")
        .attr("dx", 15)
        .attr("dy", ".35em")
        .style("display", this.showLabels ? null : "none")
        .text(d => d.name);
      
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
      
      // 更新所有标签组的背景矩形属性
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
      
      // 更新所有标签组的文本属性
      this.linkLabels.select("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("display", this.showRelationLabels ? null : "none")
        .text(d => d.type);
      
      // 更新仿真
      this.simulation.on("tick", () => {
        const containerWidth = this.$refs.graphContainer.clientWidth;
        const containerHeight = this.$refs.graphContainer.clientHeight;

        // 大幅扩大布局区域，减少边界限制
        const extendedWidth = containerWidth * 3;
        const extendedHeight = containerHeight * 3;

        // 减少边界填充，让节点能够分布在更大范围内
        const padding = 20;

        // 如果不是保持位置的操作，才限制节点位置范围
        if (!preservePositions) {
          this.nodes.forEach(d => {
            // 扩大边界范围，允许节点分布得更广
            d.x = Math.max(-extendedWidth/2 + padding, Math.min(extendedWidth/2 - padding, d.x));
            d.y = Math.max(-extendedHeight/2 + padding, Math.min(extendedHeight/2 - padding, d.y));
          });
        } else {
          // 如果保持位置，只固定有原位置的节点
          this.nodes.forEach(d => {
            if (nodePositions[d.name]) {
              // 只固定有历史位置的节点
              d.fx = d.x;
              d.fy = d.y;
            }
          });
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
          .attr("x", d => d.x)
          .attr("y", d => d.y);
        
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
      
      // 模拟结束时自动缩放以适应视图（根据skipAutoFit参数决定是否跳过）
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

        // 直接根据传入的skipAutoFit参数决定是否跳过自动缩放，不依赖全局状态
        if (focusNodeName && !skipAutoFit) {
          console.log('[DEBUG] Focusing on node:', focusNodeName);
          this.focusOnNode(focusNodeName);
        } else if (!skipAutoFit) {
          console.log('[DEBUG] Calling fitGraphToView');
          this.fitGraphToView();

          // 记录视图变化后的状态
          setTimeout(() => {
            try {
              const afterTransform = this.zoom && this.svg ? d3.zoomTransform(this.svg.node()) : null;
              console.log('[DEBUG] 视图变换后状态:', afterTransform);
            } catch (error) {
              console.warn('[DEBUG] 获取视图变换后状态失败:', error);
            }
          }, 800);
        } else {
          console.log('[DEBUG] Skipping fitGraphToView due to skipAutoFit=true');

          // 确保视图变换保持不变
          if (savedTransform) {
            setTimeout(() => {
              if (this.svg && this.zoom) {
                this.svg.call(this.zoom.transform, savedTransform);
                console.log('[DEBUG] 恢复保存的视图变换:', savedTransform);
              }
            }, 100);
          }

          // 即使跳过了 fitGraphToView，也记录一下当前视图状态
          setTimeout(() => {
            try {
              const currentTransform = this.zoom && this.svg ? d3.zoomTransform(this.svg.node()) : null;
              console.log('[DEBUG] 跳过变换后的视图状态:', currentTransform);
            } catch (error) {
              console.warn('[DEBUG] 获取跳过变换后的视图状态失败:', error);
            }
          }, 800);
        }
      });
      
      // 修复模拟器重启逻辑，确保关系线正确更新
      if (preservePositions) {
        // 保持位置模式：需要足够的能量让连接线正确渲染，但避免节点移动过多
        console.log('[DEBUG] 保持位置模式：设置优化的模拟器参数');
        this.simulation.alpha(0.8).alphaDecay(0.05).restart(); // 增加初始能量
        
        // 渐进式降低能量，确保连接线渲染后稳定
        setTimeout(() => {
          if (this.simulation) {
            this.simulation.alpha(0.3).alphaDecay(0.1);
          }
        }, 100);
        
        setTimeout(() => {
          if (this.simulation) {
            this.simulation.alpha(0.05).alphaDecay(0.2);
          }
        }, 300);
        
        // 最终完全停止以保持位置
        setTimeout(() => {
          if (this.simulation) {
            this.simulation.alpha(0).stop();
          }
        }, 500);
      } else {
        // 正常模式：完整的模拟
        this.simulation.alpha(1).alphaDecay(0.02).restart();
      }
      
      if (this.isPaused) {
        this.simulation.stop();
      }
      
      // 隐藏加载中
      this.isLoading = false;
    },
    
    // 自动缩放以适应视图
    fitGraphToView() {
      console.log('[DEBUG] fitGraphToView 被调用！这会导致页面跳转');
      if (!this.nodes.length) return;

      // 计算图形边界
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      this.nodes.forEach(d => {
        minX = Math.min(minX, d.x);
        minY = Math.min(minY, d.y);
        maxX = Math.max(maxX, d.x);
        maxY = Math.max(maxY, d.y);
      });

      // 添加填充
      const padding = 50;
      minX -= padding;
      minY -= padding;
      maxX += padding;
      maxY += padding;

      // 计算图形尺寸
      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;

      // 获取容器尺寸
      const containerWidth = this.$refs.graphContainer.clientWidth;
      const containerHeight = this.$refs.graphContainer.clientHeight;

      // 计算缩放比例
      const scaleX = containerWidth / graphWidth;
      const scaleY = containerHeight / graphHeight;
      const scale = Math.min(scaleX, scaleY, 1);

      // 计算平移量以使图形居中
      const translateX = (containerWidth - graphWidth * scale) / 2 - minX * scale;
      const translateY = (containerHeight - graphHeight * scale) / 2 - minY * scale;

      // 应用变换
      if (this.zoom) {
        console.log('[DEBUG] 应用缩放变换:', { scale, translateX, translateY });
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
      this.selectedNode = node;
      this.highlightNode(node.name);

      // 自动加载学习资料
      this.refreshMaterials();
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
      if (this.zoom) {
        const containerWidth = this.$refs.graphContainer.clientWidth;
        const containerHeight = this.$refs.graphContainer.clientHeight;

        // 计算缩放比例和位置
        const scale = 1.5; // 稍微放大一点
        const translateX = containerWidth / 2 - targetNode.x * scale;
        const translateY = containerHeight / 2 - targetNode.y * scale;

        this.svg.transition()
          .duration(1000)
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
    
    // 选择预设查询
    selectPresetQuery(query) {
      // 如果是使用说明，不执行查询
      if (!query.query) {
        return;
      }
      this.queryText = query.query;
      this.executeQuery();
    },
    
    // 稳定布局
    stabilizeLayout() {
      if (!this.simulation) return;
      
      // 先暂停模拟
      this.simulation.stop();
      
      // 对所有节点进行固定
      this.nodes.forEach(node => {
        node.fx = node.x;
        node.fy = node.y;
      });
      
      // 更新节点样式
      this.nodeElements.classed("fixed", true);
      
      // 恢复模拟并快速冷却
      this.simulation.alpha(0.1).restart();
      setTimeout(() => {
        this.simulation.stop();
        // 不自动调用 fitGraphToView，让用户保持当前视图
      }, 300);
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
    
    // 本地添加节点到图谱
    addNodeLocally(nodeData) {
      console.log('[DEBUG] 本地添加节点:', nodeData);
      
      if (!this.originalData) {
        console.warn('原始数据不存在，无法本地添加节点');
        return;
      }
      
      // 检查节点是否已存在
      const existingNode = this.originalData.nodes.find(n => n.name === nodeData.name);
      if (existingNode) {
        console.log('节点已存在，跳过添加');
        return;
      }
      
      // 添加节点到原始数据
      const newNode = {
        id: nodeData.id || Date.now(),
        name: nodeData.name,
        label: nodeData.label,
        properties: nodeData.properties || {}
      };
      
      this.originalData.nodes.push(newNode);
      
      // 重新渲染图谱，保持当前视图
      this.updateGraph(this.originalData, true, true, true, null);
    },

    // 本地更新节点
    updateNodeLocally(nodeName, updatedData) {
      console.log('[DEBUG] 本地更新节点:', nodeName, updatedData);
      
      if (!this.originalData) {
        console.warn('原始数据不存在，无法本地更新节点');
        return;
      }
      
      // 查找并更新节点
      const nodeIndex = this.originalData.nodes.findIndex(n => n.name === nodeName);
      if (nodeIndex === -1) {
        console.warn('未找到要更新的节点:', nodeName);
        return;
      }
      
      // 更新节点数据
      this.originalData.nodes[nodeIndex] = {
        ...this.originalData.nodes[nodeIndex],
        ...updatedData
      };
      
      // 重新渲染图谱，保持当前视图
      this.updateGraph(this.originalData, true, true, true, null);
    },

    // 本地删除节点
    deleteNodeLocally(nodeName) {
      console.log('[DEBUG] 本地删除节点:', nodeName);
      
      if (!this.originalData) {
        console.warn('原始数据不存在，无法本地删除节点');
        return;
      }
      
      // 统计删除前的数据
      const beforeNodes = this.originalData.nodes.length;
      const beforeRelationships = this.originalData.relationships.length;
      
      // 删除节点
      this.originalData.nodes = this.originalData.nodes.filter(n => n.name !== nodeName);
      
      // 删除与该节点相关的所有关系
      const deletedRelationships = this.originalData.relationships.filter(r => 
        r.source === nodeName || r.target === nodeName
      );
      this.originalData.relationships = this.originalData.relationships.filter(r => 
        r.source !== nodeName && r.target !== nodeName
      );
      
      console.log('[DEBUG] 删除结果: 节点', beforeNodes, '->', this.originalData.nodes.length, 
                  '关系', beforeRelationships, '->', this.originalData.relationships.length);
      console.log('[DEBUG] 删除的关系:', deletedRelationships);
      
      // 重新渲染图谱，保持当前视图
      this.updateGraph(this.originalData, true, true, true, null);
      if (this.simulation) {
        this.simulation.tick();
        console.log('[DEBUG] 手动tick完成');
      }
    },

    // 本地添加关系
    addRelationshipLocally(relationshipData) {
      console.log('[DEBUG] 本地添加关系:', relationshipData);
      
      if (!this.originalData) {
        console.warn('原始数据不存在，无法本地添加关系');
        return;
      }
      
      // 检查关系是否已存在
      const existingRelationship = this.originalData.relationships.find(r => 
        r.source === relationshipData.source && 
        r.target === relationshipData.target && 
        r.type === relationshipData.relation_type
      );
      
      if (existingRelationship) {
        console.log('关系已存在，跳过添加');
        return;
      }
      
      // 添加关系到原始数据
      const newRelationship = {
        id: relationshipData.id || Date.now(),
        source: relationshipData.source,
        target: relationshipData.target,
        type: relationshipData.relation_type,
        properties: relationshipData.properties || {}
      };
      
      this.originalData.relationships.push(newRelationship);
      
      // 重新渲染图谱，保持当前视图
      this.updateGraph(this.originalData, true, true, true, null);
    },

    // 本地更新关系
    updateRelationshipLocally(source, target, oldType, newType, properties) {
      console.log('[DEBUG] 本地更新关系:', source, target, oldType, '->', newType);
      
      if (!this.originalData) {
        console.warn('原始数据不存在，无法本地更新关系');
        return;
      }
      
      // 查找并更新关系
      const relationshipIndex = this.originalData.relationships.findIndex(r => 
        r.source === source && r.target === target && r.type === oldType
      );
      
      if (relationshipIndex === -1) {
        console.warn('[DEBUG] 未找到要更新的关系:', source, '->', target, '类型:', oldType);
        console.log('[DEBUG] 现有关系:', this.originalData.relationships.map(r => 
          `${r.source}->${r.target} (${r.type})`));
        return;
      }
      
      console.log('[DEBUG] 找到要更新的关系，索引:', relationshipIndex);
      
      // 更新关系数据
      this.originalData.relationships[relationshipIndex] = {
        ...this.originalData.relationships[relationshipIndex],
        type: newType,
        properties: properties || {}
      };
      
      console.log('[DEBUG] 关系更新完成:', this.originalData.relationships[relationshipIndex]);
      
      // 重新渲染图谱，保持当前视图
      this.updateGraph(this.originalData, true, true, true, null);
      if (this.simulation) {
        this.simulation.tick();
        console.log('[DEBUG] 手动tick完成');
      }
    },

    // 本地删除关系
    deleteRelationshipLocally(source, target, relationType) {
      console.log('[DEBUG] 本地删除关系:', source, target, relationType);
      
      if (!this.originalData) {
        console.warn('原始数据不存在，无法本地删除关系');
        return;
      }
      
      // 统计删除前的关系数量
      const beforeCount = this.originalData.relationships.length;
      
      // 查找要删除的关系
      const toDelete = this.originalData.relationships.find(r => 
        r.source === source && r.target === target && r.type === relationType
      );
      
      if (!toDelete) {
        console.warn('[DEBUG] 未找到要删除的关系:', source, '->', target, '类型:', relationType);
        console.log('[DEBUG] 现有关系:', this.originalData.relationships.map(r => 
          `${r.source}->${r.target} (${r.type})`));
        return;
      }
      
      console.log('[DEBUG] 找到要删除的关系:', toDelete);
      
      // 删除关系
      this.originalData.relationships = this.originalData.relationships.filter(r => 
        !(r.source === source && r.target === target && r.type === relationType)
      );
      
      console.log('[DEBUG] 关系删除完成: 数量', beforeCount, '->', this.originalData.relationships.length);
      
      // 重新渲染图谱，保持当前视图
      this.updateGraph(this.originalData, true, true, true, null);
      if (this.simulation) {
        this.simulation.tick();
        console.log('[DEBUG] 手动tick完成');
      }
    },

    // 获取合并的连接标签
    getMergedLinkLabels(links) {
      const nodeRelations = new Map();
      
      links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.name : link.source;
        const targetId = typeof link.target === 'object' ? link.target.name : link.target;
        
        const key = sourceId < targetId ? 
          `${sourceId}|${targetId}` : 
          `${targetId}|${sourceId}`;
        
        if (!nodeRelations.has(key)) {
          nodeRelations.set(key, {
            source: link.source,
            target: link.target,
            types: [link.type],
            count: 1
          });
        } else {
          const rel = nodeRelations.get(key);
          if (!rel.types.includes(link.type)) {
            rel.types.push(link.type);
          }
          rel.count++;
        }
      });
      
      const mergedLinks = Array.from(nodeRelations.values()).map((rel, index) => {
        const baseOffset = 10;
        let offsetY = 0;
        
        if (rel.count > 1) {
          const relationText = rel.types.join('/');
          rel.type = relationText;
          offsetY = baseOffset * (rel.count > 2 ? 2 : 1);
        } else {
          rel.type = rel.types[0];
        }
        
        rel.type = this.translateRelationType(rel.type);
        rel.offsetY = offsetY;
        return rel;
      });
      
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
      // 创建反向映射
      const reverseMap = {
        "相关于": "RELATED_TO",
        "属于": "PART_OF",
        "先决条件": "PREREQUISITE",
        "包含": "CONTAINS",
        "跟随": "FOLLOWS",
        "类似于": "SIMILAR_TO",
        "依赖于": "DEPENDS_ON",
        "应用于": "APPLIES_TO",
        "用于": "USED_IN",
        "子集": "SUBSET_OF",
        "实例": "INSTANCE_OF",
        "定义": "DEFINED_BY",
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

      if (this.linkElements) {
        this.linkElements
          .attr("stroke", d => this.isLinkSelected(d) ? "#ff6b6b" : "#999")
          .attr("stroke-width", d => this.isLinkSelected(d) ? 3 : 2);
      }
    },

    // 显示右键菜单
    showContextMenu(event, type, target) {
      console.log('显示右键菜单:', type, target);
      console.log('事件对象:', event);
      console.log('鼠标位置:', event.clientX, event.clientY);

      this.$set(this.contextMenu, 'show', true);
      this.$set(this.contextMenu, 'x', event.clientX);
      this.$set(this.contextMenu, 'y', event.clientY);
      this.$set(this.contextMenu, 'type', type);
      this.$set(this.contextMenu, 'target', target);

      console.log('右键菜单状态:', this.contextMenu);

      // 设置选中状态
      if (type === 'node') {
        this.selectNode(target);
      } else {
        this.selectLink(target);
      }
    },

    // 隐藏右键菜单
    hideContextMenu() {
      console.log('隐藏右键菜单');
      this.$set(this.contextMenu, 'show', false);
    },

    // 背景点击事件
    handleBackgroundClick(event) {
      // 检查是否点击在图谱容器内
      const container = this.$refs.graphContainer;
      if (container && container.contains(event.target)) {
        this.selectedNode = null;
        this.selectedLink = null;
        this.hideContextMenu();
        this.updateSelectionVisuals();
        this.closePropertiesPanel();
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

    // 快捷创建知识点（从课程节点）
    showQuickCreateKnowledgePointModal() {
      if (!this.selectedNode || this.selectedNode.label !== 'Course') {
        alert('请先选择一个课程节点');
        return;
      }

      this.quickCreateKnowledgePointData = {
        courseName: this.selectedNode.name,
        knowledgePointName: '',
        description: '',
        difficulty: '',
        importance: '',
        relationType: 'CONTAINS'
      };

      this.showModal('quickCreateKnowledgePointModal');
    },

    // 获取课程列表
    loadCourseList() {
      // 从当前图谱数据中获取所有课程节点
      this.courseList = this.nodes.filter(node => node.label === 'Course') || [];
      console.log('[DEBUG] 加载课程列表:', this.courseList.length, '个课程');
    },

    // 显示更新节点模态框
    showUpdateNodeModal() {
      if (!this.selectedNode) {
        alert('请先选择一个节点');
        return;
      }

      // 获取课程列表（用于知识点节点选择所属课程）
      this.loadCourseList();

      // 初始化更新数据
      const properties = this.selectedNode.properties || {};
      this.updateNodeData = {
        name: this.selectedNode.name,
        label: this.selectedNode.label,
        description: properties.description || '',
        semester: properties.semester || '',
        category: properties.category || '',
        credits: properties.credits || null,
        courseName: properties.course || '', // 知识点所属课程
        difficulty: properties.difficulty || '',
        importance: properties.importance || '',
        propertiesJson: JSON.stringify(properties, null, 2)
      };
      this.showModal('updateNodeModal');
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
        case 'createKnowledgePoint':
          this.showQuickCreateKnowledgePointModal();
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
      }
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
        relation_type: 'RELATED_TO',
        propertiesJson: ''
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

      // 获取最新的关系类型（从服务器数据获取）
      const latestLink = this.links.find(l =>
        ((l.source.name === link.source.name && l.target.name === link.target.name) ||
         (l.source.name === link.target.name && l.target.name === link.source.name))
      );

      const currentRelationType = latestLink ? latestLink.type : link.type;
      console.log('[DEBUG] 当前关系类型:', currentRelationType);

      this.updateRelationshipForm = {
        source: link.source.name,
        target: link.target.name,
        old_relation_type: currentRelationType,
        new_relation_type: currentRelationType,
        propertiesJson: JSON.stringify((latestLink ? latestLink.properties : link.properties) || {}, null, 2)
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

      // 获取最新的关系类型（从服务器数据获取）
      const latestLink = this.links.find(l =>
        ((l.source.name === link.source.name && l.target.name === link.target.name) ||
         (l.source.name === link.target.name && l.target.name === link.source.name))
      );

      const currentRelationType = latestLink ? latestLink.type : link.type;
      console.log('[DEBUG] 删除关系 - 当前关系类型:', currentRelationType);

      this.deleteRelationshipForm = {
        source: link.source.name,
        target: link.target.name,
        old_relation_type: currentRelationType,
        new_relation_type: '',
        propertiesJson: ''
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
        // 构建属性对象
        let properties = {};

        if (this.updateNodeData.label === 'Course') {
          // 课程节点的属性
          if (this.updateNodeData.description) properties.description = this.updateNodeData.description;
          if (this.updateNodeData.category) properties.category = this.updateNodeData.category;
          if (this.updateNodeData.semester) properties.semester = this.updateNodeData.semester;
          if (this.updateNodeData.credits !== null && this.updateNodeData.credits !== undefined) {
            properties.credits = parseFloat(this.updateNodeData.credits);
          }
        } else if (this.updateNodeData.label === 'KnowledgePoint') {
          // 知识点节点的属性
          if (this.updateNodeData.description) properties.description = this.updateNodeData.description;
          if (this.updateNodeData.courseName) properties.course = this.updateNodeData.courseName;
          if (this.updateNodeData.difficulty) properties.difficulty = this.updateNodeData.difficulty;
          if (this.updateNodeData.importance) properties.importance = this.updateNodeData.importance;
        }

        // 如果有额外的JSON属性，则合并
        if (this.updateNodeData.propertiesJson) {
          try {
            const jsonProps = JSON.parse(this.updateNodeData.propertiesJson);
            properties = { ...properties, ...jsonProps };
          } catch (e) {
            alert('属性JSON格式错误');
            return;
          }
        }

        console.log('发送更新节点请求:', {
          name: this.updateNodeData.name,
          label: this.updateNodeData.label,
          properties: properties
        });

        const response = await fetch(`${this.baseUrl}update_node/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            name: this.updateNodeData.name,
            label: this.updateNodeData.label,
            properties: properties
          })
        });

        const result = await response.json();
        console.log('更新节点响应:', result);

        if (result.success) {
          console.log('[DATABASE] 节点已成功更新到Neo4j数据库，现在进行本地更新');
          this.showSuccess(result.message);
          this.hideModal('updateNodeModal');
          
          // 只有数据库操作成功后才进行本地更新
          const updatedData = {
            name: this.updateNodeData.name,
            label: this.updateNodeData.label,
            properties: properties
          };
          this.updateNodeLocally(this.selectedNode.name, updatedData);
        } else {
          console.error('[DATABASE ERROR] 节点更新到Neo4j数据库失败:', result.error);
          this.showError('更新节点失败: ' + result.error + '（数据库操作未成功）');
          // 数据库操作失败时不进行本地更新，保持数据一致性
        }
      } catch (error) {
        console.error('更新节点失败:', error);
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
        let properties = {};
        if (this.newRelationship.propertiesJson) {
          try {
            properties = JSON.parse(this.newRelationship.propertiesJson);
          } catch (e) {
            alert('属性JSON格式错误');
            return;
          }
        }

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

          // 如果源节点或目标节点不在当前显示的节点列表中，需要先刷新图谱
          if (!sourceNodeExists || !targetNodeExists) {
            console.log('[RELATIONSHIP] 节点不在当前显示列表中，先刷新图谱');

            // 临时增加节点限制以确保包含这些节点
            const originalLimit = this.nodeLimit;
            const neededNodes = [this.newRelationship.source, this.newRelationship.target];
            const missingNodes = neededNodes.filter(name =>
              !this.originalData.nodes.find(node => node.name === name)
            );

            if (missingNodes.length > 0) {
              console.log('[RELATIONSHIP] 节点不存在于原始数据中:', missingNodes);
              // 如果节点根本不存在于原始数据中，需要先刷新整个图谱
              await this.refreshGraph(false);
            } else {
              // 节点存在但被节点限制过滤掉了，临时增加限制
              const currentNodeCount = this.nodes.length;
              const requiredCount = this.originalData.nodes.filter(node =>
                node.name === this.newRelationship.source ||
                node.name === this.newRelationship.target ||
                this.nodes.find(n => n.name === node.name)
              ).length;

              if (requiredCount > currentNodeCount) {
                console.log('[RELATIONSHIP] 临时增加节点限制从', originalLimit, '到', Math.max(originalLimit, requiredCount + 10));
                this.nodeLimit = Math.max(originalLimit, requiredCount + 10);
                this.updateGraph(this.originalData, true, true, true, null);

                // 恢复原始限制
                setTimeout(() => {
                  this.nodeLimit = originalLimit;
                }, 100);
              }
            }

            // 等待图谱更新完成
            await new Promise(resolve => setTimeout(resolve, 500));
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

          // 更新统计信息
          await this.loadStatistics();

          // 检查知识点节点是否在当前显示的节点列表中
          const knowledgePointExists = this.nodes.find(node => node.name === savedKnowledgePointName);
          if (!knowledgePointExists) {
            console.log('[QUICK CREATE] 知识点节点不在当前显示列表中，刷新图谱');
            setTimeout(() => {
              this.refreshGraph(true, savedKnowledgePointName);
            }, 300);
          }

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

        let properties = {};
        if (this.updateRelationshipForm.propertiesJson) {
          try {
            properties = JSON.parse(this.updateRelationshipForm.propertiesJson);
          } catch (e) {
            alert('属性JSON格式错误');
            return;
          }
        }

        // 将中文关系类型转换为英文
        const englishOldRelationType = this.reverseTranslateRelationType(this.updateRelationshipForm.old_relation_type);
        const englishNewRelationType = this.reverseTranslateRelationType(this.updateRelationshipForm.new_relation_type);

        console.log('[DEBUG] 关系类型转换结果:', {
          old_chinese: this.updateRelationshipForm.old_relation_type,
          old_english: englishOldRelationType,
          new_chinese: this.updateRelationshipForm.new_relation_type,
          new_english: englishNewRelationType
        });

        console.log('发送更新关系请求:', {
          source: this.updateRelationshipForm.source,
          target: this.updateRelationshipForm.target,
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
        // 将中文关系类型转换为英文
        const englishRelationType = this.reverseTranslateRelationType(this.deleteRelationshipForm.old_relation_type);

        console.log('发送删除关系请求:', {
          source: this.deleteRelationshipForm.source,
          target: this.deleteRelationshipForm.target,
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

    // 快速创建知识点
    async quickCreateKnowledgePoint() {
      try {
        // 验证输入
        if (!this.quickCreateKnowledgePointData.knowledgePointName.trim()) {
          this.showError('请输入知识点名称');
          return;
        }

        if (!this.quickCreateKnowledgePointData.courseName.trim()) {
          this.showError('课程名称不能为空');
          return;
        }

        // 创建知识点节点
        console.log('开始创建知识点...');

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
              created_from: 'quick_create',
              course: this.quickCreateKnowledgePointData.courseName
            }
          })
        });

        const knowledgePointResult = await knowledgePointResponse.json();
        console.log('创建知识点响应:', knowledgePointResult);

        if (!knowledgePointResult.success) {
          console.error('[DATABASE ERROR] 知识点创建到Neo4j数据库失败:', knowledgePointResult.error);
          this.showError('创建知识点失败: ' + knowledgePointResult.error + '（数据库操作未成功）');
          return;
        }

        // 2. 创建关系
        console.log('开始创建关系...');
        const relationshipResponse = await fetch(`${this.baseUrl}create_relationship/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': this.getCsrfToken()
          },
          body: JSON.stringify({
            source: this.quickCreateKnowledgePointData.courseName,
            target: this.quickCreateKnowledgePointData.knowledgePointName,
            relation_type: this.quickCreateKnowledgePointData.relationType,
            properties: {
              created_from: 'quick_create'
            }
          })
        });

        const relationshipResult = await relationshipResponse.json();
        console.log('创建关系响应:', relationshipResult);

        if (relationshipResult.success) {
          console.log('[DATABASE] 知识点和关系都已成功保存到Neo4j数据库，现在进行本地更新');
          this.showSuccess('知识点创建成功！');
          this.hideModal('quickCreateKnowledgePointModal');

          // 保存新创建的知识点名称，用于后续处理
          const savedKnowledgePointName = this.quickCreateKnowledgePointData.knowledgePointName;
          const savedCourseName = this.quickCreateKnowledgePointData.courseName;
          const savedRelationType = this.quickCreateKnowledgePointData.relationType;
          const savedDescription = this.quickCreateKnowledgePointData.description || '';
          const savedDifficulty = this.quickCreateKnowledgePointData.difficulty || '';
          const savedImportance = this.quickCreateKnowledgePointData.importance || '';

          // 重置表单
          this.quickCreateKnowledgePointData = {
            courseName: '',
            knowledgePointName: '',
            description: '',
            difficulty: '',
            importance: '',
            relationType: 'CONTAINS'
          };

          // 只有数据库操作都成功后才进行本地更新
          console.log('[DATABASE] 开始本地同步更新');
          
          // 1. 添加知识点节点
          const knowledgePointData = {
            id: knowledgePointResult.node_id || Date.now(),
            name: savedKnowledgePointName,
            label: 'KnowledgePoint',
            properties: {
              description: savedDescription,
              difficulty: savedDifficulty,
              importance: savedImportance,
              created_from: 'quick_create',
              course: savedCourseName
            }
          };
          this.addNodeLocally(knowledgePointData);
          
          // 2. 添加关系
          const relationshipData = {
            id: relationshipResult.relationship_id || Date.now() + 1,
            source: savedCourseName,
            target: savedKnowledgePointName,
            relation_type: savedRelationType,
            properties: { created_from: 'quick_create' }
          };
          this.addRelationshipLocally(relationshipData);

          // 更新统计信息
          await this.loadStatistics();

          // 延迟聚焦到新创建的知识点，确保图谱已更新完成
          setTimeout(() => {
            console.log('[FOCUS] 聚焦到新创建的知识点:', savedKnowledgePointName);
            this.focusOnNode(savedKnowledgePointName);
          }, 800); // 等待800ms确保图谱渲染完成

          // 重置操作来源标志
          this.operationSource.isFromContextMenu = false;
          this.operationSource.nodeName = '';
          this.contextMenuLock = false;
          this.isContextMenuOperation = false;
        } else {
          console.error('[DATABASE ERROR] 关系创建到Neo4j数据库失败:', relationshipResult.error);
          this.showError('创建关系失败: ' + relationshipResult.error + '（关系未保存到数据库）');
          
          // 关系创建失败时，只添加节点（因为节点创建成功了）
          console.log('[DATABASE] 节点创建成功但关系创建失败，只进行节点的本地同步');
          const knowledgePointData = {
            id: knowledgePointResult.node_id || Date.now(),
            name: this.quickCreateKnowledgePointData.knowledgePointName,
            label: 'KnowledgePoint',
            properties: {
              description: this.quickCreateKnowledgePointData.description || '',
              difficulty: this.quickCreateKnowledgePointData.difficulty || '',
              importance: this.quickCreateKnowledgePointData.importance || '',
              created_from: 'quick_create',
              course: this.quickCreateKnowledgePointData.courseName
            }
          };
          this.addNodeLocally(knowledgePointData);

          // 检查知识点节点是否在当前显示的节点列表中
          const knowledgePointExists = this.nodes.find(node => node.name === this.quickCreateKnowledgePointData.knowledgePointName);
          if (!knowledgePointExists) {
            console.log('[QUICK CREATE] 知识点节点不在当前显示列表中（关系创建失败），刷新图谱');
            setTimeout(() => {
              this.refreshGraph(true, this.quickCreateKnowledgePointData.knowledgePointName);
            }, 300);
          }

          // 延迟聚焦到新创建的知识点（即使关系创建失败，节点还是成功的）
          setTimeout(() => {
            console.log('[FOCUS] 聚焦到新创建的知识点（关系创建失败）:', this.quickCreateKnowledgePointData.knowledgePointName);
            this.focusOnNode(this.quickCreateKnowledgePointData.knowledgePointName);
          }, 800);

          // 重置操作来源标志
          this.operationSource.isFromContextMenu = false;
          this.operationSource.nodeName = '';
        }
      } catch (error) {
        console.error('快速创建知识点失败:', error);
        this.showError('创建知识点失败: ' + error.message);

        // 重置操作来源标志
        this.operationSource.isFromContextMenu = false;
        this.operationSource.nodeName = '';
        this.contextMenuLock = false;
        this.isContextMenuOperation = false;
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
        console.log('🚀 尝试打开PDF文件:', fullUrl);

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
        console.log('🚀 尝试打开文件:', fullUrl);

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

        // 强制从数据库刷新数据
        console.log('[GENERATION COMPLETE] 从数据库刷新图谱数据');
        await this.refreshGraph(false); // 完全刷新，不保持视图状态

        // 刷新统计信息
        console.log('[GENERATION COMPLETE] 刷新统计信息');
        this.loadStatistics();

        // 等待数据加载完成
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 自动搜索新生成的课程
        console.log(`[GENERATION COMPLETE] 自动搜索课程: ${courseName}`);
        const searchSuccess = await this.performCourseSearch(courseName);

        if (searchSuccess) {
          console.log(`[GENERATION COMPLETE] 课程《${courseName}》自动加载成功`);
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
    }
  }
};
</script>

<style scoped>
body {
  font-family: "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #f8f9fa;
}
.container-fluid {
  padding: 0;
}
.row{
  display: flex; /* 启用 Flexbox */
  justify-content: space-between; /* 左右分布 */
  width: 100%; /* 确保容器宽度足够 */
}
.sidebar {
  background-color: #f0f0f0;
  width: 25%; /* 1/4 宽度 */
  padding: 15px;
  height: 100vh;
  overflow-y: auto;
}
.main-content {
  width: 75%; /* 1/4 宽度 */
  padding: 0;
  height: 100vh;
  position: relative;
}
#graph-container {
  width: 100%;
  height: 100%;
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
}
.node {
  stroke: #fff;
  stroke-width: 1.5px;
  cursor: pointer;
}
.link {
  stroke: #999;
  stroke-opacity: 0.6;
  stroke-width: 1px;
}
.node-label {
  font-size: 12px;
  pointer-events: none;
}
.link-label {
  font-size: 12px;
  pointer-events: none;
  fill: #333;
  font-weight: 500;
}
.link-label-bg {
  fill: rgba(255, 255, 255, 0.9);
  rx: 4;
  ry: 4;
  stroke: #ddd;
  stroke-width: 0.5;
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

.form-control{
  width: 90%;
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
.controls-panel {
  position: absolute;
  top: 10px;
  left: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  z-index: 100;
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
#node-limit-control {
  margin-top: 10px;
}
.slider-container {
  margin-top: 5px;
}

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
  stroke-width: 4px !important;
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
  }

  /* 平板响应式样式 */
  @media (max-width: 768px) and (min-width: 577px) {
    .material-actions {
      gap: 4px;
    }

    .btn-view, .btn-download, .btn-delete {
      min-width: 70px;
    }
  }
}
</style>