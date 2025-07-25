<template>
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
              class="btn btn-outline-secondary preset-query"
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
                max="500" 
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
        <div id="properties-panel" class="properties-panel" v-if="selectedNode">
          <h5 id="properties-title">{{ selectedNode.name }} [{{ selectedNode.label }}]</h5>
          <button 
            type="button" 
            class="btn-close position-absolute top-0 end-0 m-2" 
            aria-label="Close" 
            @click="closePropertiesPanel"
          ></button>
          <div id="properties-content">
            <table v-if="selectedNode.properties" class="table table-sm table-hover">
              <tbody>
                <tr v-for="(value, key) in selectedNode.properties" :key="key">
                  <td class="fw-bold">{{ key }}</td>
                  <td>
                    <ul v-if="Array.isArray(value) && value.length" class="mb-0 ps-3">
                      <li v-for="(item, index) in value" :key="index">{{ item }}</li>
                    </ul>
                    <span v-else>{{ value || '无' }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else>没有可用的属性信息</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'KnowledgeGraph',
  data() {
    return {
      baseUrl:'https://a0fde68b-25b1-429f-bad8-304d68c31660.mock.pstmn.io+',
      queryText: '',
      presetQueries: [
        { label: '显示所有知识点', query: '显示所有知识点' },
        { label: '显示所有课程', query: '显示所有课程' },
        { label: '显示整个知识图谱', query: '显示整个知识图谱' },
        { label: '搜索"算法"', query: 'search 算法' },
        { label: '搜索"人工智能"', query: 'search 人工智能' },
        { label: '搜索"数据结构"', query: 'search 数据结构' }
      ],
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
      nodeLimit: 100,
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
      }
    };
  },
  watch: {
    nodeLimit(newVal) {
      if (this.originalData) {
        this.updateGraph(this.originalData, true);
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
  mounted() {
    this.initSvg();
    this.loadStatistics();
    this.loadInitialGraph();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    if (this.simulation) {
      this.simulation.stop();
    }
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    // 初始化SVG
    initSvg() {
      const container = this.$refs.graphContainer;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
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
      
      // 添加箭头标记定义
      this.svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#999");
      
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
      
      // 优先保留课程节点
      const courseNodes = data.nodes.filter(node => node.label === 'Course');
      const otherNodes = data.nodes.filter(node => node.label !== 'Course');
      
      // 计算要保留的其他节点数量
      const otherNodeLimit = Math.max(0, limit - courseNodes.length);
      
      // 合并
      limitedData.nodes = [
        ...courseNodes,
        ...otherNodes.slice(0, otherNodeLimit)
      ];
      
      // 创建节点ID集合以便快速查找
      const nodeIds = new Set(limitedData.nodes.map(node => node.id));
      
      // 只保留连接已保留节点的关系
      limitedData.relationships = data.relationships.filter(rel => 
        nodeIds.has(rel.source) && nodeIds.has(rel.target)
      );
      
      return limitedData;
    },
    
    // 更新图谱
    updateGraph(data, preservePositions = false) {
      // 显示加载中
      this.isLoading = true;
      
      // 保存原始数据
      this.originalData = data;
      
      // 限制节点数量
      const limitedData = this.limitNodes(data, this.nodeLimit);
      
      // 初始化SVG
      if (!this.g) {
        this.g = this.initSvg();
      } else if (!preservePositions) {
        this.g = this.initSvg();
      }
      
      // 更新数据
      this.nodes = limitedData.nodes;
      this.links = limitedData.relationships;
      
      // 如果保持位置，保存节点当前位置
      const nodePositions = {};
      if (preservePositions && this.nodeElements) {
        this.nodeElements.each(function(d) {
          nodePositions[d.id] = { x: d.x, y: d.y, fx: d.fx, fy: d.fy };
        });
      }
      
      // 如果要保持位置，恢复节点的位置
      if (preservePositions) {
        this.nodes.forEach(node => {
          if (nodePositions[node.id]) {
            node.x = nodePositions[node.id].x;
            node.y = nodePositions[node.id].y;
            node.fx = nodePositions[node.id].fx;
            node.fy = nodePositions[node.id].fy;
          }
        });
      }
      
      // 停止之前的模拟
      if (this.simulation) {
        this.simulation.stop();
      }
      
      // 获取容器尺寸，创建更大的初始布局区域
      const containerWidth = this.$refs.graphContainer.clientWidth;
      const containerHeight = this.$refs.graphContainer.clientHeight;
      const layoutWidth = Math.max(containerWidth, containerWidth * 1.5);
      const layoutHeight = Math.max(containerHeight, containerHeight * 1.5);
      
      // 创建新的模拟
      // this.simulation = d3.forceSimulation(this.nodes)
      //   .force("link", d3.forceLink(this.links).id(d => d.id)
      //     .distance(d => {
      //       if (d.source.label === 'Course' || d.target.label === 'Course') {
      //         return 180;
      //       }
      //       return 150;
      //     })
      //   .force("charge", d3.forceManyBody()
      //     .strength(d => {
      //       if (d.label === 'Course') {
      //         return -1000;
      //       }
      //       return -800;
      //     })
      //   )
      //   .force("center", d3.forceCenter(layoutWidth / 2, layoutHeight / 2))
      //   .force("x", d3.forceX(layoutWidth / 2).strength(0.05))
      //   .force("y", d3.forceY(layoutHeight / 2).strength(0.05))
      //   .force("collide", d3.forceCollide()
      //     .radius(d => {
      //       if (d.label === 'Course') {
      //         return 50;
      //       }
      //       return 40;
      //     })
      //     .strength(0.8)
      //     .iterations(2)
      //   ));
      this.simulation = d3.forceSimulation(this.nodes)
        // 配置链接力
        .force("link", d3.forceLink(this.links)
          .id(d => d.id)
          .distance(d => {
            if (d.source.label === 'Course' || d.target.label === 'Course') {
              return 180;
            }
            return 150;
          })
        )
        // 配置电荷力（独立配置）
        .force("charge", d3.forceManyBody()
          .strength(d => {
            if (d.label === 'Course') {
              return -1000;
            }
            return -800;
          })
        )
        // 配置中心力
        .force("center", d3.forceCenter(layoutWidth / 2, layoutHeight / 2))
        // 配置X轴定位力
        .force("x", d3.forceX(layoutWidth / 2).strength(0.05))
        // 配置Y轴定位力
        .force("y", d3.forceY(layoutHeight / 2).strength(0.05))
        // 配置碰撞力
        .force("collide", d3.forceCollide()
          .radius(d => {
            if (d.label === 'Course') {
              return 50;
            }
            return 40;
          })
          .strength(0.8)
          .iterations(2)
        );
      
      // 清除现有元素
      this.g.selectAll('.links').remove();
      this.g.selectAll('.nodes').remove();
      this.g.selectAll('.node-labels').remove();
      this.g.selectAll('.link-labels').remove();
      
      // 创建连接线
      this.linkElements = this.g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(this.links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "#999") // 新增颜色设置
        .attr("marker-end", "url(#arrowhead)");
      
      // 创建节点
      this.nodeElements = this.g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(this.nodes)
        .enter().append("circle")
        .attr("class", d => "node" + (d.label === "Course" ? " course-node" : ""))
        .attr("r", d => d.label === "Course" ? 18 : 12)
        .attr("fill", d => this.getEntityColor(d.label))
        .attr("stroke-width", 2)
        .call(d3.drag()
          .on("start", this.dragStarted)
          .on("drag", this.dragged)
          .on("end", this.dragEnded)
        )
        .on("click", (event, d) => this.showProperties(d))
        .on("dblclick", (event, d) => this.fixNode(d));
      
      // 创建节点标签
      this.nodeLabels = this.g.append("g")
        .attr("class", "node-labels")
        .selectAll("text")
        .data(this.nodes)
        .enter().append("text")
        .attr("class", "node-label")
        .attr("dx", 15)
        .attr("dy", ".35em")
        .style("display", this.showLabels ? null : "none")
        .text(d => d.name);
      
      // // 创建连接线标签
      // const filteredLinks = this.getMergedLinkLabels(this.links).filter(d => {
      //   if (d.type === "包含" || d.type === "CONTAINS") {
      //     const sourceNode = typeof d.source === 'object' ? d.source : this.nodes.find(n => n.id === d.source);
      //     const targetNode = typeof d.target === 'object' ? d.target : this.nodes.find(n => n.id === d.target);
          
      //     if (sourceNode && targetNode && 
      //         sourceNode.label === "Course" && targetNode.label === "Course") {
      //       return false;
      //     }
      //   }
      //   return true;
      // });
      
      // this.linkLabels = this.g.append("g")
      //   .attr("class", "link-labels")
      //   .selectAll("g")
      //   .data(filteredLinks)
      //   .enter().append("g")
      //   .attr("class", "link-label-group");
      
      // 创建连接线标签，过滤掉错误的"contains"关系
      this.linkLabels = this.g.append("g")
        .attr("class", "link-labels")
        .selectAll("g")  // 使用g元素作为容器而不是text
        .data(this.getMergedLinkLabels(this.links).filter(d => {
            // 过滤掉在课程节点上错误显示的"contains"关系
            if (d.type === "包含" || d.type === "CONTAINS") {
                const sourceNode = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source);
                const targetNode = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target);
                
                // 如果源节点和目标节点都是课程，则不显示"contains"关系
                if (sourceNode && targetNode && 
                    sourceNode.label === "Course" && targetNode.label === "Course") {
                    return false;
                }
            }
            return true;
        }))  // 过滤关系数据
        .enter().append("g")
        .attr("class", "link-label-group");
      
      // 添加标签背景矩形
      this.linkLabels.append("rect")
        .attr("class", "link-label-bg")
        .attr("x", -12)
        .attr("y", -8)
        .attr("width", 24)
        .attr("height", 16)
        .attr("stroke", "#D3D3D3")       // 黑色边框
        .attr("stroke-width", "1px")  // 边框粗细
        .attr("fill", "none")     // 透明背景
        .attr("rx", 4) // 圆角
        .style("display", this.showRelationLabels ? null : "none");
      
      // 添加标签文本
      this.linkLabels.append("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("display", this.showRelationLabels ? null : "none")
        .text(d => d.type);
      
      // 更新仿真
      this.simulation.on("tick", () => {
        const containerWidth = this.$refs.graphContainer.clientWidth;
        const containerHeight = this.$refs.graphContainer.clientHeight;
        const extendedWidth = containerWidth * 1.5;
        const extendedHeight = containerHeight * 1.5;
        const padding = 50;
        
        this.nodes.forEach(d => {
          d.x = Math.max(padding, Math.min(extendedWidth - padding, d.x));
          d.y = Math.max(padding, Math.min(extendedHeight - padding, d.y));
        });
        
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
      
      // 模拟结束时自动缩放以适应视图
      this.simulation.on("end", () => {
        this.fitGraphToView();
      });
      
      // 设置较低的冷却速率使布局更稳定
      this.simulation.alpha(1).alphaDecay(0.02);
      
      if (this.isPaused) {
        this.simulation.stop();
      }
      
      // 隐藏加载中
      this.isLoading = false;
    },
    
    // 自动缩放以适应视图
    fitGraphToView() {
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
    highlightNode(nodeId) {
      if (!this.nodeElements || !this.linkElements || !this.nodeLabels) return;
      
      // 重置所有元素
      this.nodeElements.classed("highlighted", false).interrupt().attr("stroke-width", 0);
      this.nodeLabels.classed("highlighted", false).interrupt().style("fill", "black");
      
      if (!nodeId) return;
      
      // 高亮目标节点
      this.nodeElements.filter(d => d.id === nodeId).classed("highlighted", true).attr("stroke-width", 2).style("stroke", "red");
      this.nodeLabels.filter(d => d.id === nodeId).classed("highlighted", true).style("fill", "red");
      
      // 高亮相关连接
      const relatedLinks = this.links.filter(link => 
        link.source.id === nodeId || link.target.id === nodeId
      );
      
      // 获取相关节点ID
      const relatedNodeIds = new Set();
      relatedLinks.forEach(link => {
        if (link.source.id === nodeId) {
          relatedNodeIds.add(link.target.id);
        } else {
          relatedNodeIds.add(link.source.id);
        }
      });
      
      // 高亮相关节点
      this.nodeElements.filter(d => relatedNodeIds.has(d.id)).classed("highlighted", true).attr("stroke-width", 2).style("stroke", "red");
      this.nodeLabels.filter(d => relatedNodeIds.has(d.id)).classed("highlighted", true).style("fill", "red");
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
      this.highlightNode(node.id);
    },
    
    // 关闭属性面板
    closePropertiesPanel() {
      this.selectedNode = null;
      this.highlightNode(null);
    },
    
    // 执行查询
    executeQuery() {
      if (!this.queryText) return;
      
      this.isLoading = true;
      
      // 模拟API请求
      setTimeout(() => {
        // 在实际应用中，这里应该是真实的API请求
        fetch(this.baseUrl+'//query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: this.queryText })
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            this.updateGraph(data);
          } else {
            alert('查询错误: ' + data.error);
            this.isLoading = false;
          }
        })
        .catch(error => {
                    console.error('查询错误:', error);
                    alert('查询失败: ' + error);
                    this.isLoading = false;
                    console.log(123456)
                });
        
        // 模拟响应数据
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
        this.isLoading = false;
      }, 800);
    },
    
    // 选择预设查询
    selectPresetQuery(query) {
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
        this.fitGraphToView();
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
      
      // 添加延时自动缩放
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
          
        // 重新适应视图
        setTimeout(this.fitGraphToView, 500);
      }
    },
    
    // 获取统计信息
    loadStatistics() {
      // 模拟API请求
      setTimeout(() => {
        // 在实际应用中，这里应该是真实的API请求
        fetch(this.baseUrl+'//statistics')
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
                });
        // 模拟统计数据
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
      }, 500);
    },
    
    // 加载初始图谱数据
    loadInitialGraph() {
      this.isLoading = true;
      
      // 模拟API请求
      setTimeout(() => {
        // 在实际应用中，这里应该是真实的API请求
        fetch(this.baseUrl+'//get_graph_data')
        .then(response => response.json())
        .then(
          data => {
              // 如果有足够的数据，显示完整图谱，否则只显示部分
              if (data.nodes.length > 0) {
                  if (data.nodes.length > 50) {
                      // 如果节点数太多，只显示课程
                      this.executeQuery('显示所有课程');
                  } else {
                      this.updateGraph(data);
                  }
              } else {
                  alert('没有可用的图谱数据');
              }
        })
        .catch(error => {
                    console.error('加载图谱数据失败:', error);
                    alert('加载图谱数据失败: ' + error);
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
      }, 1000);
      this.isLoading = false;
    },
    
    // 获取合并的连接标签
    getMergedLinkLabels(links) {
      const nodeRelations = new Map();
      
      links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        
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
    
    // 获取实体颜色
    getEntityColor(type) {
      return this.colors[type] || this.colors.DEFAULT;
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
</style>