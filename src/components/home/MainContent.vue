<template>
  <div class="main-content">
    <h2>主要知识图谱展示</h2>
    <div class="graph-visual">
      <svg ref="graphContainer"></svg>

      <div class="legend-box">
        <h4>关系与模态图例</h4>

        <div class="legend-item">
          <span class="color-swatch" style="background-color:red;"></span>
          患者-疾病(红色线)
        </div>
        <div class="legend-item">
          <span class="color-swatch" style="background-color:orange;"></span>
          疾病-影像(橙色线)
        </div>
        <div class="legend-item">
          <span class="color-swatch" style="background-color:purple;"></span>
          患者-患者(同一对象)(紫色线)
        </div>
        <div class="legend-item">
          <span class="color-swatch" style="background-color:blue;"></span>
          康复关联(蓝色线)
        </div>
        <div class="legend-item">
          <span class="color-swatch" style="background-color:gray;"></span>
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';

const graphContainer = ref(null);
const emit = defineEmits(['nodeClick']);

const initGraph = () => {
  const width = graphContainer.value.clientWidth;
  const height = graphContainer.value.clientHeight;
  
  // 创建 SVG
  const svg = d3.select(graphContainer.value)
    .attr('width', width)
    .attr('height', height)
    .call(d3.zoom()
      .scaleExtent([0.1, 8])
      .on('zoom', (event) => {
        const container = d3.select('.graph-container');
        if (container.empty()) {
          svg.append('g')
            .attr('class', 'graph-container')
            .attr('transform', event.transform);
        } else {
          container.attr('transform', event.transform);
        }
      })
    );

  // 創建容器組
  const container = svg.append('g')
    .attr('class', 'graph-container');

  // 创建力导向图
  const simulation = d3.forceSimulation()
    .force('link', d3.forceLink().id(d => d.id))
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2));

  // 示例数据
  const graphData = {
    nodes: [
      { id: '患者A', group: 0, size: 20, detail: '基本信息', shape: 'diamond' },
      { id: '糖尿病', group: 1, size: 15, detail: '疾病信息', shape: 'square' },
      { id: 'CT影像', group: 2, size: 15, detail: '影像数据', shape: 'triangle' },
      { id: '医院A', group: 3, size: 12, detail: '医疗机构', shape: 'trapezoid' },
      { id: '年龄', group: 4, size: 12, detail: '属性信息', shape: 'circle' }
    ],
    links: [
      { source: '患者A', target: '糖尿病', type: 'red' },
      { source: '糖尿病', target: 'CT影像', type: 'orange' },
      { source: '患者A', target: '医院A', type: 'gray' },
      { source: '患者A', target: '年龄', type: 'blue' }
    ]
  };

  // 创建连线
  const link = container.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(graphData.links)
    .enter()
    .append('line')
    .attr('stroke', d => d.type)
    .attr('stroke-opacity', 0.5)
    .attr('stroke-width', 1);

  // 创建节点组
  const node = container.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(graphData.nodes)
    .enter()
    .append('g')
    .call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended))
    .on('click', (event, d) => {
      // 發送節點數據到父組件
      emit('nodeClick', {
        id: d.id,
        detail: d.detail,
        type: d.shape,
        connections: graphData.links
          .filter(link => link.source.id === d.id || link.target.id === d.id)
          .map(link => ({
            target: link.source.id === d.id ? link.target.id : link.source.id,
            type: link.type
          }))
      });
    });

  // 根据节点类型创建不同形状
  node.each(function(d) {
    const g = d3.select(this);
    switch(d.shape) {
      case 'diamond':
        g.append('rect')
          .attr('width', d.size)
          .attr('height', d.size)
          .attr('transform', 'rotate(45)')
          .attr('fill', '#fff')
          .attr('stroke', '#000');
        break;
      case 'square':
        g.append('rect')
          .attr('width', d.size)
          .attr('height', d.size)
          .attr('fill', '#fff')
          .attr('stroke', '#000');
        break;
      case 'triangle':
        g.append('path')
          .attr('d', `M0,${d.size} L${d.size},${d.size} L${d.size/2},0 Z`)
          .attr('fill', '#fff')
          .attr('stroke', '#000');
        break;
      case 'trapezoid':
        g.append('path')
          .attr('d', `M0,${d.size} L${d.size/4},0 L${3*d.size/4},0 L${d.size},${d.size} Z`)
          .attr('fill', '#fff')
          .attr('stroke', '#000');
        break;
      case 'circle':
        g.append('circle')
          .attr('r', d.size/2)
          .attr('fill', '#fff')
          .attr('stroke', '#000');
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
  simulation.nodes(graphData.nodes).on('tick', ticked);
  simulation.force('link').links(graphData.links);

  function ticked() {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node.attr('transform', d => `translate(${d.x},${d.y})`);
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
  initGraph();
});
</script>

<style lang="scss" scoped>
.main-content {
  flex: 1;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 1rem;

  h2 {
    font-size: 1rem;
    margin-bottom: 0.8rem;
    color: #007bff;
  }
}

.graph-visual {
  border: 1px dashed #ccc;
  height: 95%;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  border-radius: 4px;
  position: relative;
  overflow: hidden;

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
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
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
</style> 