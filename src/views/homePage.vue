<template>
  <div class="home-page">
    <div class="main-content">
      <h2>主要知识图谱展示</h2>
      <div class="graph-visual">
        <svg ref="graphContainer"></svg>

        <div class="legend-box">
          <h4>关系与模态图例</h4>

          <div class="legend-item">
            <span class="color-swatch" style="background-color: red"></span>
            患者-疾病(红色线)
          </div>
          <div class="legend-item">
            <span class="color-swatch" style="background-color: orange"></span>
            疾病-影像(橙色线)
          </div>
          <div class="legend-item">
            <span class="color-swatch" style="background-color: purple"></span>
            患者-患者(同一对象)(紫色线)
          </div>
          <div class="legend-item">
            <span class="color-swatch" style="background-color: blue"></span>
            康复关联(蓝色线)
          </div>
          <div class="legend-item">
            <span class="color-swatch" style="background-color: gray"></span>
            医疗机构归属(灰色线)
          </div>

          <div class="legend-item">
            <span class="shape-swatch diamond"></span>
            患者数据节点(菱形)
          </div>
          <div class="legend-item">
            <span class="shape-swatch square"></span>
            表单数据节点(正方形)
          </div>
          <div class="legend-item">
            <span class="triangle"></span>
            图像数据节点(三角形)
          </div>
          <div class="legend-item">
            <span class="trapezoid"></span>
            机构数据节点(梯形)
          </div>
          <div class="legend-item">
            <span class="shape-swatch circle"></span>
            属性数据节点(圆形)
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
          <span class="value">{{ selectedNode.detail }}</span>
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

const graphContainer = ref(null);
const selectedNode = ref(null);

const getNodeTypeName = (type) => {
  const typeMap = {
    diamond: "患者數據節點",
    square: "表單數據節點",
    triangle: "圖像數據節點",
    trapezoid: "機構數據節點",
    circle: "屬性數據節點",
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

const initGraph = () => {
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
    nodes: [
      {
        id: 1,
        name: "患者A",
        group: 0,
        size: 30,
        detail: "基本信息",
        shape: "diamond",
      },
      {
        id: 2,
        name: "糖尿病",
        group: 1,
        size: 15,
        detail: "疾病信息",
        shape: "square",
      },
      {
        id: 3,
        name: "CT影像",
        group: 2,
        size: 15,
        detail: "影像数据",
        shape: "triangle",
      },
      {
        id: 4,
        name: "医院A",
        group: 3,
        size: 12,
        detail: "医疗机构",
        shape: "trapezoid",
      },
      {
        id: 5,
        name: "年龄",
        group: 4,
        size: 12,
        detail: "属性信息",
        shape: "circle",
      },
    ],
    links: [
      { source: 1, target: 2, type: "red" },
      { source: 1, target: 3, type: "orange" },
      { source: 1, target: 4, type: "gray" },
      { source: 1, target: 5, type: "blue" },
    ],
  };

  // 创建连线
  const link = container
    .append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graphData.links)
    .enter()
    .append("line")
    .attr("stroke", (d) => d.type)
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
        name:d.name,
        detail: d.detail,
        type: d.shape,
        connections: graphData.links
          .filter((link) => link.source.id === d.id || link.target.id === d.id)
          .map((link) => ({
            target: link.source.id === d.id ? link.target.id : link.source.id,
            type: link.type,
          })),
      };
    });

  // 根据节点类型创建不同形状
  node.each(function (d) {
    const g = d3.select(this);
    switch (d.shape) {
      case "diamond":
        g.append("rect")
          .attr("width", d.size)
          .attr("height", d.size)
          .attr("transform", "rotate(45)")
          .attr("fill", "#fff")
          .attr("stroke", "#000");
        break;
      case "square":
        g.append("rect")
          .attr("width", d.size)
          .attr("height", d.size)
          .attr("fill", "#fff")
          .attr("stroke", "#000");
        break;
      case "triangle":
        g.append("path")
          .attr("d", `M0,${d.size} L${d.size},${d.size} L${d.size / 2},0 Z`)
          .attr("fill", "#fff")
          .attr("stroke", "#000");
        break;
      case "trapezoid":
        g.append("path")
          .attr(
            "d",
            `M0,${d.size} L${d.size / 4},0 L${(3 * d.size) / 4},0 L${d.size},${
              d.size
            } Z`
          )
          .attr("fill", "#fff")
          .attr("stroke", "#000");
        break;
      case "circle":
        g.append("circle")
          .attr("r", d.size / 2)
          .attr("fill", "#fff")
          .attr("stroke", "#000");
        break;
    }
  });

  // 创建文本
  const text = node.append('text')
    .attr('font-size', d => d.size / 2 + 3)
    .attr('fill', '#000')
    .attr('name', d => d.id)
    .text(d => d.id)
    .attr('text-anchor', 'middle')
    .attr('dy', d => d.size + 5);

  // 更新位置
  simulation.nodes(graphData.nodes).on("tick", ticked);
  simulation.force("link").links(graphData.links);

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
  // getHomePageData().then((res) => {
  //   console.log(res);
  // });
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

  h2 {
    font-size: 1rem;
    margin-bottom: 0.8rem;
    color: #007bff;
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
  border: 2px solid #000;
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
