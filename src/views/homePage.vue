<template>
  <div class="home-page">
    <div class="main-content">
      <div class="content-header">
        <h2>主要知识图谱展示</h2>
        <div class="graph-switcher">
          <el-select 
            v-model="selectedGraph" 
            placeholder="选择知识图谱"
            size="default"
            style="width: 150px"
            @change="handleGraphChange"
            :disabled="loading"
          >
            <el-option
              v-for="graph in availableGraphs"
              :key="graph.value"
              :label="graph.label"
              :value="graph.value"
            />
          </el-select>
        </div>
      </div>
      <div class="graph-visual" v-loading="loading">
        <svg ref="graphContainer"></svg>

        <div class="legend-box">
          <h4>节点与关系图例</h4>
          <!-- 节点类型图例 -->
          <div class="legend-item">
            <span class="shape-swatch" style="background-color: #ff6b6b"></span>
            患者节点(Patient)
          </div>
          <div class="legend-item">
            <span class="shape-swatch" style="background-color: #4ecdc4"></span>
            文本节点(Text)
          </div>
          <div class="legend-item">
            <span class="shape-swatch" style="background-color: #45b7d1"></span>
            图像节点(Image)
          </div>
          <div class="legend-item">
            <span class="shape-swatch" style="background-color: #95a5a6"></span>
            机构节点(Institution)
          </div>
          
          <!-- 关系类型图例 -->
          <div class="legend-item">
            <span class="color-swatch" style="background-color: #ff6b6b"></span>
            文本相似度(TEXT_SIMILAR)
          </div>
          <div class="legend-item">
            <span class="color-swatch" style="background-color: #e88b00"></span>
            图像相似度(IMAGE_SIMILAR)
          </div>
          <div class="legend-item">
            <span class="color-swatch" style="background-color: #45b7d1"></span>
            跨模态相似度(CROSS_MODAL_SIMILAR)
          </div>
          <div class="legend-item">
            <span class="color-swatch" style="background-color: #cab6bd"></span>
            关联到图像(RELATED_TO_IMAGE)
          </div>
          <div class="legend-item">
            <span class="color-swatch" style="background-color: #000000"></span>
            归属于(BELONGS_TO)
          </div>
        </div>
      </div>
    </div>

    <div class="sidebar">
      <h3>节点详情</h3>
      <div class="node-details" v-if="selectedNode">
        <div class="detail-item">
          <span class="label">节点ID：</span>
          <span class="value">{{ selectedNode.id }}</span>
        </div>
        <div class="detail-item">
          <span class="label">节点名称：</span>
          <span class="value">{{ selectedNode.name }}</span>
        </div>
        <div class="detail-item">
          <span class="label">节点类型：</span>
          <span class="value">{{ getNodeTypeName(selectedNode.type) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">详细信息：</span>
          <span class="value">{{ getNodeDetail(selectedNode) }}</span>
        </div>

        <div class="connections" v-if="selectedNode.connections.length">
          <h4>关联节点</h4>
          <div
            class="connection-item"
            v-for="(conn, index) in selectedNode.connections"
            :key="index"
          >
            <span
              class="conn-type"
              :style="{ backgroundColor: getConnectionColor(conn.type) }"
            ></span>
            <span class="conn-target">{{ conn.target }}</span>
          </div>
        </div>
      </div>
      <div class="no-selection" v-else>
        <p>请点击图谱中的节点查看详情</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as d3 from "d3";
import { getHomePageData } from "@/api/homePage";
import { ElMessage } from 'element-plus';

const graphContainer = ref(null);
const selectedNode = ref(null);
const loading = ref(false);

// 可用的知识图谱列表
const availableGraphs = ref([
  { value: 'graph1', label: '知识图谱 #1' },
  { value: 'graph2', label: '知识图谱 #2' }
]);

// 选中的图谱
const selectedGraph = ref('graph1');

// 处理图谱切换
const handleGraphChange = async (value) => {
  loading.value = true;
  try {
    // 这里添加切换图谱的API调用
    // const response = await fetch(`/api/graphs/${value}`);
    // const data = await response.json();
    
    // 模拟切换
    await new Promise(resolve => setTimeout(resolve, 500));
    ElMessage.success(`已切换到${availableGraphs.value.find(g => g.value === value)?.label}`);
    
    // 重新初始化图谱
    initGraph();
  } catch (error) {
    console.error('切换图谱失败:', error);
    ElMessage.error('切换图谱失败');
  } finally {
    loading.value = false;
  }
};

const getNodeTypeName = (type) => {
  const typeMap = {
    diamond: "患者数据节点",
    square: "表单数据节点",
    triangle: "图像数据节点",
    trapezoid: "机构数据节点",
    circle: "属性数据节点",
  };
  return typeMap[type] || type;
};

const getConnectionColor = (type) => {
  const colorMap = {
    red: "#ff0000",
    orange: "#ffa500",
    purple: "#800080",
    blue: "#0000ff",
    gray: "#808080",
  };
  return colorMap[type] || type;
};

const getNodeDetail = (node) => {
  if (!node.nodeDetail || Object.keys(node.nodeDetail).length === 0) return "無";
  
  const parts = [];
  if (node.nodeDetail.textFile) parts.push(`文本名稱：${node.nodeDetail.textFile}`);
  if (node.nodeDetail.imageFile) parts.push(`圖像名稱：${node.nodeDetail.imageFile}`);
  return parts.join('，');
};

const initGraph = () => {
  // 清除舊的 SVG 內容
  d3.select(graphContainer.value).selectAll("*").remove();

  const width = graphContainer.value.clientWidth;
  const height = graphContainer.value.clientHeight;

  // 创建 SVG
  const svg = d3
    .select(graphContainer.value)
    .attr("width", width)
    .attr("height", height)
    .call(
      d3
        .zoom()
        .scaleExtent([0.1, 8])
        .on("zoom", (event) => {
          const container = d3.select(".graph-container");
          if (container.empty()) {
            svg
              .append("g")
              .attr("class", "graph-container")
              .attr("transform", event.transform);
          } else {
            container.attr("transform", event.transform);
          }
        })
    );

  // 創建容器組
  const container = svg.append("g").attr("class", "graph-container");

  // 创建力导向图
  const simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3
        .forceLink()
        .id((d) => d.id)
        .distance(70)
    )
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // 示例数据
  const graphData = {
    "nodes": [
      { "id": "pacs01CT201702170412", "type": "Patient", "nodeDetail": {} },
      { "id": "pacs01CT201702170413", "type": "Patient", "nodeDetail": {} },
      { "id": "pacs01CT201702170415", "type": "Patient", "nodeDetail": {} },
      { "id": "pacs01CT201702170416", "type": "Patient", "nodeDetail": {} },
      { "id": "诊断记录表", "type": "Institution", "nodeDetail": {} },
      { "id": "dcm影像记录", "type": "Institution", "nodeDetail": {} },
      { "id": "pacs01CT201702170412_z_t", "type": "Text", "nodeDetail": { "textFile": "pacs01CT201702170412_z_t.npy", "imageFile": null } },
      { "id": "pacs01CT201702170413_z_t", "type": "Text", "nodeDetail": { "textFile": "pacs01CT201702170413_z_t.npy", "imageFile": null } },
      { "id": "pacs01CT201702170415_z_t", "type": "Text", "nodeDetail": { "textFile": "pacs01CT201702170415_z_t.npy", "imageFile": null } },
      { "id": "pacs01CT201702170416_z_t", "type": "Text", "nodeDetail": { "textFile": "pacs01CT201702170416_z_t.npy", "imageFile": null } },
      { "id": "pacs01CT201702170412_z_i", "type": "Image", "nodeDetail": { "textFile": null, "imageFile": "pacs01CT201702170412_z_i.npy" } },
      { "id": "pacs01CT201702170413_z_i", "type": "Image", "nodeDetail": { "textFile": null, "imageFile": "pacs01CT201702170413_z_i.npy" } },
      { "id": "pacs01CT201702170415_z_i", "type": "Image", "nodeDetail": { "textFile": null, "imageFile": "pacs01CT201702170415_z_i.npy" } },
      { "id": "pacs01CT201702170416_z_i", "type": "Image", "nodeDetail": { "textFile": null, "imageFile": "pacs01CT201702170416_z_i.npy" } }
    ],
    "edges": [
      { "source": "pacs01CT201702170412_z_t", "target": "pacs01CT201702170413_z_t", "relations": [{ "relation": "TEXT_SIMILAR", "weight": 0.82 }] },
      { "source": "pacs01CT201702170415_z_t", "target": "pacs01CT201702170416_z_t", "relations": [{ "relation": "TEXT_SIMILAR", "weight": 0.76 }] },
      { "source": "pacs01CT201702170412_z_i", "target": "pacs01CT201702170413_z_i", "relations": [{ "relation": "IMAGE_SIMILAR", "weight": 0.79 }] },
      { "source": "pacs01CT201702170415_z_i", "target": "pacs01CT201702170416_z_i", "relations": [{ "relation": "IMAGE_SIMILAR", "weight": 0.73 }] },
      { "source": "pacs01CT201702170412_z_t", "target": "pacs01CT201702170412_z_i", "relations": [{ "relation": "RELATED_TO_IMAGE", "weight": null }] },
      { "source": "pacs01CT201702170413_z_t", "target": "pacs01CT201702170413_z_i", "relations": [{ "relation": "RELATED_TO_IMAGE", "weight": null }] },
      { "source": "pacs01CT201702170415_z_t", "target": "pacs01CT201702170415_z_i", "relations": [{ "relation": "RELATED_TO_IMAGE", "weight": null }] },
      { "source": "pacs01CT201702170416_z_t", "target": "pacs01CT201702170416_z_i", "relations": [{ "relation": "RELATED_TO_IMAGE", "weight": null }] },
      { "source": "pacs01CT201702170412_z_t", "target": "pacs01CT201702170412", "relations": [{ "relation": "BELONGS_TO", "weight": null }] },
      { "source": "pacs01CT201702170412_z_i", "target": "pacs01CT201702170412", "relations": [{ "relation": "BELONGS_TO", "weight": null }] },
      { "source": "pacs01CT201702170413_z_t", "target": "pacs01CT201702170413", "relations": [{ "relation": "BELONGS_TO", "weight": null }] },
      { "source": "pacs01CT201702170413_z_i", "target": "pacs01CT201702170413", "relations": [{ "relation": "BELONGS_TO", "weight": null }] },
      { "source": "pacs01CT201702170415_z_t", "target": "pacs01CT201702170415", "relations": [{ "relation": "BELONGS_TO", "weight": null }] },
      { "source": "pacs01CT201702170415_z_i", "target": "pacs01CT201702170415", "relations": [{ "relation": "BELONGS_TO", "weight": null }] },
      { "source": "pacs01CT201702170416_z_t", "target": "pacs01CT201702170416", "relations": [{ "relation": "BELONGS_TO", "weight": null }] },
      { "source": "pacs01CT201702170416_z_i", "target": "pacs01CT201702170416", "relations": [{ "relation": "BELONGS_TO", "weight": null }] },
      { "source": "pacs01CT201702170412_z_t", "target": "诊断记录表", "relations": [{ "relation": "FROM", "weight": null }] },
      { "source": "pacs01CT201702170413_z_t", "target": "诊断记录表", "relations": [{ "relation": "FROM", "weight": null }] },
      { "source": "pacs01CT201702170415_z_t", "target": "诊断记录表", "relations": [{ "relation": "FROM", "weight": null }] },
      { "source": "pacs01CT201702170416_z_t", "target": "诊断记录表", "relations": [{ "relation": "FROM", "weight": null }] },
      { "source": "pacs01CT201702170412_z_i", "target": "dcm影像记录", "relations": [{ "relation": "FROM", "weight": null }] },
      { "source": "pacs01CT201702170413_z_i", "target": "dcm影像记录", "relations": [{ "relation": "FROM", "weight": null }] },
      { "source": "pacs01CT201702170415_z_i", "target": "dcm影像记录", "relations": [{ "relation": "FROM", "weight": null }] },
      { "source": "pacs01CT201702170416_z_i", "target": "dcm影像记录", "relations": [{ "relation": "FROM", "weight": null }] },
      { "source": "pacs01CT201702170412_z_t", "target": "pacs01CT201702170415_z_i", "relations": [{ "relation": "CROSS_MODAL_SIMILAR", "weight": 0.73 }] },
      { "source": "pacs01CT201702170412_z_t", "target": "pacs01CT201702170416_z_i", "relations": [{ "relation": "CROSS_MODAL_SIMILAR", "weight": 0.75 }] },
      { "source": "pacs01CT201702170413_z_t", "target": "pacs01CT201702170415_z_i", "relations": [{ "relation": "CROSS_MODAL_SIMILAR", "weight": 0.78 }] },
      { "source": "pacs01CT201702170413_z_t", "target": "pacs01CT201702170416_z_i", "relations": [{ "relation": "CROSS_MODAL_SIMILAR", "weight": 0.76 }] },
      { "source": "pacs01CT201702170415_z_t", "target": "pacs01CT201702170412_z_i", "relations": [{ "relation": "CROSS_MODAL_SIMILAR", "weight": 0.72 }] },
      { "source": "pacs01CT201702170415_z_t", "target": "pacs01CT201702170413_z_i", "relations": [{ "relation": "CROSS_MODAL_SIMILAR", "weight": 0.74 }] },
      { "source": "pacs01CT201702170416_z_t", "target": "pacs01CT201702170412_z_i", "relations": [{ "relation": "CROSS_MODAL_SIMILAR", "weight": 0.79 }] },
      { "source": "pacs01CT201702170416_z_t", "target": "pacs01CT201702170413_z_i", "relations": [{ "relation": "CROSS_MODAL_SIMILAR", "weight": 0.77 }] },
      { "source": "pacs01CT201702170416_z_t", "target": "pacs01CT201702170416_z_i", "relations": [{ "relation": "CROSS_MODAL_SIMILAR", "weight": 0.81 }] }
    ]
  }

  // 创建连线
  const link = container
    .append("g")
    .attr("class", "edges")
    .selectAll("line")
    .data(graphData.edges)
    .enter()
    .append("line")
    .attr("stroke", (d) => {
      const relationType = d.relations[0].relation;
      const colorMap = {
        TEXT_SIMILAR: "#ff6b6b",
        IMAGE_SIMILAR: "#e88b00",
        CROSS_MODAL_SIMILAR: "#45b7d1",
        RELATED_TO_IMAGE: "#cab6bd",
        BELONGS_TO: "#000000"
      };
      return colorMap[relationType] || "#999";
    })
    .attr("stroke-opacity", 0.5)
    .attr("stroke-width", 2);

  // 创建节点组
  const node = container
    .append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(graphData.nodes)
    .enter()
    .append("g")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    )
    .on("click", (event, d) => {
      selectedNode.value = {
        id: d.id,
        name: d.id,
        type: d.type,
        nodeDetail: d.nodeDetail,
        connections: graphData.edges
          .filter((link) => link.source.id === d.id || link.target.id === d.id)
          .map((link) => ({
            target: link.source.id === d.id ? link.target.id : link.source.id,
            type: link.relations[0].relation,
            weight: link.relations[0].weight
          })),
      };
    });

  // 创建圆形节点
  node.append("circle")
    .attr("r", d => {
      const sizeMap = {
        Patient: 15,
        Text: 12,
        Image: 12
      };
      return sizeMap[d.type] || 10;
    })
    .attr("fill", d => {
      const colorMap = {
        Patient: "#ff6b6b",
        Text: "#4ecdc4",
        Image: "#45b7d1",
        Institution: "#95a5a6"
      };
      return colorMap[d.type] || "#999";
    })
    .attr("stroke", "#000")
    .attr("stroke-width", 1);

  // 创建文本
  const text = node.append('text')
    .attr('font-size', d => {
      const sizeMap = {
        Patient: 10,
        Text: 8,
        Image: 8
      };
      return sizeMap[d.type] || 8;
    })
    .attr('fill', '#000')
    .text(d => d.id)
    .attr('text-anchor', 'middle')
    .attr('dy', d => {
      const sizeMap = {
        Patient: 25,
        Text: 20,
        Image: 20
      };
      return sizeMap[d.type] || 15;
    });

  // 更新位置
  simulation.nodes(graphData.nodes).on("tick", ticked);
  simulation.force("link").links(graphData.edges);

  function ticked() {
    link
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    node.attr("transform", (d) => `translate(${d.x},${d.y})`);
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.01).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0.001);
    d.fx = null;
    d.fy = null;
  }
};

onMounted(() => {
  // 只初始化一次圖譜
  initGraph();
});
</script>

<style lang="scss" scoped>
.home-page {
  display: flex;
  height: 90vh;
  width: 100%;
  gap: 1rem;
  padding: 1rem;
  box-sizing: border-box;
  overflow: hidden;
}

.main-content {
  flex: 1;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;

  .content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;

    h2 {
      font-size: 1rem;
      margin: 0;
      color: #007bff;
    }

    .graph-switcher {
      display: flex;
      align-items: center;
    }
  }
}

.graph-visual {
  border: 1px dashed #ccc;
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
  min-height: 0; // 防止flex子元素溢出

  svg {
    width: 100%;
    height: 100%;
  }
}

.legend-box {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: #fafafa;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #333;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  z-index: 10;

  h4 {
    margin-bottom: 0.3rem;
    color: #007bff;
  }
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0.3rem 0;
}

.color-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: inline-block;
  margin-right: 0.4rem;
}

.shape-swatch {
  width: 16px;
  height: 16px;
  display: inline-block;
  margin-right: 0.4rem;
  margin-top: 2px;

  &.diamond {
    transform: rotate(45deg);
  }

  &.circle {
    border-radius: 50%;
  }
}

.triangle {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-bottom: 14px solid #000;
  margin-right: 0.4rem;
  margin-top: 1px;
}

.trapezoid {
  width: 0;
  height: 0;
  border-bottom: 16px solid #000;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  margin-right: 0.4rem;
  margin-top: 1px;
}

.sidebar {
  width: 300px;
  height: 100%;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  overflow-y: auto;
}
h3 {
    color: #007bff;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

.node-details {


  .detail-item {
    margin-bottom: 0.8rem;

    .label {
      font-weight: bold;
      color: #666;
      margin-right: 0.5rem;
    }

    .value {
      color: #333;
    }
  }
}

.connections {
  margin-top: 1.5rem;

  h4 {
    color: #007bff;
    margin-bottom: 0.8rem;
    font-size: 1rem;
  }

  .connection-item {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;

    .conn-type {
      width: 12px;
      height: 12px;
      border-radius: 2px;
      margin-right: 0.5rem;
    }

    .conn-target {
      color: #333;
    }
  }
}

.no-selection {
  color: #999;
  text-align: center;
  padding: 2rem 0;
}
</style>
