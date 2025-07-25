<template>
  <!-- 保持原有模板结构不变 -->
  <div class="container-fluid">
    <div class="row">
      <!-- 左侧边栏 -->
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
              @keyup.enter="executeQuery"
            >
            <button class="btn btn-primary" @click="executeQuery">查询</button>
          </div>
          <div class="form-text mb-2">支持自然语言查询，例如："查找与算法相关的知识点"</div>
        </div>

        <!-- 预设查询 -->
        <div class="card">
          <div class="card-header">常用查询</div>
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
          <div class="card-header">知识图谱统计</div>
          <div class="card-body">
            <div id="statistics-content">
              <p>实体数量：<span id="entity-count">{{ statistics.entityCount }}</span></p>
              <p>关系数量：<span id="relation-count">{{ statistics.relationCount }}</span></p>
            </div>
          </div>
        </div>

        <!-- 管理面板 -->
        <div class="card">
          <div class="card-header">管理选项</div>
          <div class="card-body">
            <router-link to="/DataAcquisition" class="btn btn-primary">进入管理面板</router-link>
          </div>
        </div>

        <!-- 实体类型 -->
        <div class="card">
          <div class="card-header">实体类型</div>
          <div class="card-body">
            <div id="entity-types" class="text">
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
          <div class="card-header">关系类型</div>
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

      <!-- 右侧主内容 -->
      <div class="col-md-9 main-content">
        <div id="graph-container" ref="graphContainer"></div>
        
        <!-- 控制面板 -->
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

        <!-- 加载状态 -->
        <div id="loading" class="loading" v-if="isLoading">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">加载中...</span>
          </div>
          <p class="mt-2">加载中...</p>
        </div>

        <!-- 属性面板 -->
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
      baseUrl: 'https://617315e9-57e5-48d3-a6fa-9afa611495d7.mock.pstmn.io/',
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
      colors: {
        "KnowledgePoint": "#1f77b4",
        "Course": "#ff7f0e",
        "DEFAULT": "#999999"
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
    initSvg() {
      const container = this.$refs.graphContainer;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      d3.select("#graph-container svg").remove();
      
      this.svg = d3.select("#graph-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      this.zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
          this.g.attr("transform", event.transform);
        });

      this.svg.call(this.zoom);

      this.g = this.svg.append("g");
      
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

    limitNodes(data, limit) {
      if (!data || !data.nodes || data.nodes.length <= limit) return data;
      
      const limitedData = { nodes: [], relationships: [] };
      const courseNodes = data.nodes.filter(node => node.label === 'Course');
      const otherNodes = data.nodes.filter(node => node.label !== 'Course');
      
      const otherNodeLimit = Math.max(0, limit - courseNodes.length);
      
      limitedData.nodes = [
        ...courseNodes,
        ...otherNodes.slice(0, otherNodeLimit)
      ];
      
      const nodeIds = new Set(limitedData.nodes.map(node => node.id));
      
      limitedData.relationships = data.relationships.filter(rel => 
        nodeIds.has(rel.source) && nodeIds.has(rel.target)
      );
      
      return limitedData;
    },

    updateGraph(data, preservePositions = false) {
      this.isLoading = true;
      this.originalData = data;
      const limitedData = this.limitNodes(data, this.nodeLimit);
      
      if (!this.g) {
        this.g = this.initSvg();
      } else if (!preservePositions) {
        this.g = this.initSvg();
      }
      
      this.nodes = limitedData.nodes;
      this.links = limitedData.relationships;
      
      const nodePositions = {};
      if (preservePositions && this.nodeElements) {
        this.nodeElements.each(function(d) {
          nodePositions[d.id] = { x: d.x, y: d.y, fx: d.fx, fy: d.fy };
        });
      }
      
      if (preservePositions) {
        this.nodes.forEach(node => {
          if (nodePositions[node.id]) {
            Object.assign(node, nodePositions[node.id]);
          }
        });
      }
      
      if (this.simulation) this.simulation.stop();
      
      const containerWidth = this.$refs.graphContainer.clientWidth;
      const containerHeight = this.$refs.graphContainer.clientHeight;
      const layoutWidth = Math.max(containerWidth, containerWidth * 1.5);
      const layoutHeight = Math.max(containerHeight, containerHeight * 1.5);
      
      this.simulation = d3.forceSimulation(this.nodes)
        .force("link", d3.forceLink(this.links)
          .id(d => d.id)
          .distance(d => (d.source.label === 'Course' || d.target.label === 'Course') ? 180 : 150)
        )
        .force("charge", d3.forceManyBody()
          .strength(d => (d.label === 'Course' ? -1000 : -800))
        )
        .force("center", d3.forceCenter(layoutWidth / 2, layoutHeight / 2))
        .force("x", d3.forceX(layoutWidth / 2).strength(0.05))
        .force("y", d3.forceY(layoutHeight / 2).strength(0.05))
        .force("collide", d3.forceCollide()
          .radius(d => (d.label === 'Course' ? 50 : 40))
          .strength(0.8)
          .iterations(2)
        );
      
      this.g.selectAll('.links').remove();
      this.g.selectAll('.nodes').remove();
      this.g.selectAll('.node-labels').remove();
      this.g.selectAll('.link-labels').remove();
      
      console.log("g",this.g)
      this.linkElements = this.g.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(this.links)
        .enter().append("line")
        .attr("class", "link")
        .attr("marker-end", "url(#arrowhead)");
      
      this.nodeElements = this.g.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(this.nodes)
        .enter().append("circle")
        .attr("class", d => "node" + (d.label === "Course" ? " course-node" : ""))
        .attr("r", d => (d.label === "Course" ? 18 : 12))
        .attr("fill", d => this.getEntityColor(d.label))
        .call(d3.drag()
          .on("start", this.dragStarted)
          .on("drag", this.dragged)
          .on("end", this.dragEnded)
        )
        .on("click", (event, d) => this.showProperties(d))
        .on("dblclick", (event, d) => this.fixNode(d));
      
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
      
      const filteredLinks = this.getMergedLinkLabels(this.links).filter(d => {
        if (d.type === "包含" || d.type === "CONTAINS") {
          const sourceNode = typeof d.source === 'object' ? d.source : this.nodes.find(n => n.id === d.source);
          const targetNode = typeof d.target === 'object' ? d.target : this.nodes.find(n => n.id === d.target);
          return !(sourceNode && targetNode && sourceNode.label === "Course" && targetNode.label === "Course");
        }
        return true;
      });
      
      this.linkLabels = this.g.append("g")
        .attr("class", "link-labels")
        .selectAll("g")
        .data(filteredLinks)
        .enter().append("g")
        .attr("class", "link-label-group");
      
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
      
      this.linkLabels.append("text")
        .attr("class", "link-label")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .style("display", this.showRelationLabels ? null : "none")
        .text(d => d.type);
      
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
      
      this.simulation.on("end", () => {
        this.fitGraphToView();
      });
      
      this.simulation.alpha(1).alphaDecay(0.02);
      
      if (this.isPaused) this.simulation.stop();
      
      this.isLoading = false;
    },

    fitGraphToView() {
      if (!this.nodes.length) return;
      
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      this.nodes.forEach(d => {
        minX = Math.min(minX, d.x);
        minY = Math.min(minY, d.y);
        maxX = Math.max(maxX, d.x);
        maxY = Math.max(maxY, d.y);
      });
      
      const padding = 50;
      minX -= padding;
      minY -= padding;
      maxX += padding;
      maxY += padding;
      
      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;
      
      const containerWidth = this.$refs.graphContainer.clientWidth;
      const containerHeight = this.$refs.graphContainer.clientHeight;
      
      const scaleX = containerWidth / graphWidth;
      const scaleY = containerHeight / graphHeight;
      const scale = Math.min(scaleX, scaleY, 1);
      
      const translateX = (containerWidth - graphWidth * scale) / 2 - minX * scale;
      const translateY = (containerHeight - graphHeight * scale) / 2 - minY * scale;
      
      if (this.zoom) {
        this.svg.transition()
          .duration(750)
          .call(this.zoom.transform, d3.zoomIdentity
            .translate(translateX, translateY)
            .scale(scale));
      }
    },

    fixNode(node) {
      if (node.fx === null) {
        node.fx = node.x;
        node.fy = node.y;
        this.nodeElements.filter(d => d.id === node.id).classed("fixed", true);
      } else {
        node.fx = null;
        node.fy = null;
        this.nodeElements.filter(d => d.id === node.id).classed("fixed", false);
      }
    },

    highlightNode(nodeId) {
      if (!this.nodeElements || !this.linkElements || !this.nodeLabels) return;
      
      this.nodeElements.classed("highlighted", false);
      this.nodeLabels.classed("highlighted", false);
      
      if (!nodeId) return;
      
      this.nodeElements.filter(d => d.id === nodeId).classed("highlighted", true);
      this.nodeLabels.filter(d => d.id === nodeId).classed("highlighted", true);
      
      const relatedLinks = this.links.filter(link => 
        link.source.id === nodeId || link.target.id === nodeId
      );
      
      const relatedNodeIds = new Set();
      relatedLinks.forEach(link => {
        relatedNodeIds.add(link.source.id === nodeId ? link.target.id : link.source.id);
      });
      
      this.nodeElements.filter(d => relatedNodeIds.has(d.id)).classed("highlighted", true);
      this.nodeLabels.filter(d => relatedNodeIds.has(d.id)).classed("highlighted", true);
    },

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

    showProperties(node) {
      this.selectedNode = node;
      this.highlightNode(node.id);
    },

    closePropertiesPanel() {
      this.selectedNode = null;
      this.highlightNode(null);
    },

    executeQuery() {
      if (!this.queryText.trim()) return;
      
      this.isLoading = true;
      
      fetch(`${this.baseUrl}query`, {
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
        }
        this.isLoading = false;
      })
      .catch(error => {
        console.error('查询错误:', error);
        alert('查询失败: ' + error.message);
        this.isLoading = false;
      });
    },

    selectPresetQuery(query) {
      this.queryText = query.query;
      this.executeQuery();
    },

    stabilizeLayout() {
      if (!this.simulation) return;
      
      this.simulation.stop();
      
      this.nodes.forEach(node => {
        node.fx = node.x;
        node.fy = node.y;
      });
      
      this.nodeElements.classed("fixed", true);
      
      this.simulation.alpha(0.1).restart();
      setTimeout(() => {
        this.simulation.stop();
        this.fitGraphToView();
      }, 300);
    },

    resetLayout() {
      if (!this.simulation) return;
      
      this.nodes.forEach(node => {
        node.fx = null;
        node.fy = null;
      });
      
      this.nodeElements.classed("fixed", false);
      
      this.simulation.alpha(1).alphaDecay(0.02).restart();
      this.isPaused = false;
      
      setTimeout(this.fitGraphToView, 2000);
    },

    toggleSimulation() {
      if (!this.simulation) return;
      
      if (this.isPaused) {
        this.simulation.restart();
      } else {
        this.simulation.stop();
      }
      this.isPaused = !this.isPaused;
    },

    handleResize() {
      if (this.simulation) {
        const containerWidth = this.$refs.graphContainer.clientWidth;
        const containerHeight = this.$refs.graphContainer.clientHeight;
        
        this.svg.attr("width", containerWidth)
          .attr("height", containerHeight);
          
        this.simulation.force("center", d3.forceCenter(containerWidth / 2, containerHeight / 2))
          .alpha(0.3).restart();
          
        setTimeout(this.fitGraphToView, 500);
      }
    },

    loadStatistics() {
      fetch(`${this.baseUrl}statistics`)
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            this.statistics = {
              entityCount: data.entity_count,
              relationCount: data.relation_count,
              entityTypes: data.entity_types,
              relationTypes: data.relation_types
            };
          }
        })
        .catch(error => {
          console.error('统计信息加载失败:', error);
        });
    },

    loadInitialGraph() {
      this.isLoading = true;
      
      fetch(`${this.baseUrl}get_graph_data`)
        .then(response => response.json())
        .then(data => {
          this.updateGraph(data);
          this.isLoading = false;
        })
        .catch(error => {
          console.error('初始图谱加载失败:', error);
          this.isLoading = false;
        });
    },

    getMergedLinkLabels(links) {
      const nodeRelations = new Map();
      
      links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        const key = sourceId < targetId ? `${sourceId}|${targetId}` : `${targetId}|${sourceId}`;
        
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
      
      return Array.from(nodeRelations.values()).map(rel => {
        const offsetY = rel.count > 1 ? 10 * (rel.count > 2 ? 2 : 1) : 0;
        return {
          ...rel,
          type: this.translateRelationType(rel.types.join('/')),
          offsetY: offsetY
        };
      });
    },

    translateRelationType(type) {
      return type.split('/').map(t => this.relationTypeMap[t] || t).join('/');
    },

    getEntityColor(type) {
      return this.colors[type] || this.colors.DEFAULT;
    }
  }
};
</script>

<style scoped>
/* 保持原有样式不变 */
.container-fluid {
  padding: 0;
}
.row {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.sidebar {
  background-color: #f0f0f0;
  width: 25%;
  padding: 15px;
  height: 100vh;
  overflow-y: auto;
}
.main-content {
  width: 75%;
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
.preset-query {
  margin-bottom: 5px;
  text-align: left;
  padding: 8px;
  width: 100%;
}
.text {
  padding: 8px;
}
</style>