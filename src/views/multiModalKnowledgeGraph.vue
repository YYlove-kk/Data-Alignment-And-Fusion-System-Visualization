<template>
  <div class="knowledge-graph">
    <!-- 页面主体 -->
    <div class="container">
      <!-- 左侧: 构建 & 融合配置 -->
      <div class="left-panel">
        <h2>图谱构建 & 融合配置</h2>

        <!-- 图谱构建模块 -->
        <div class="panel-section">
          <h3>知识图谱构建</h3>
          <div class="form-group">
            <label>选择对齐后的数据</label>
            <el-select 
              v-model="buildConfig.dataSource"
              placeholder="选择可用的数据集"
              size="large"
              style="width: 100%"
            >
              <el-option value="" label="选择可用的数据集" />
              <el-option value="alignment1" label="对齐结果 #1" />
              <el-option value="alignment2" label="对齐结果 #2" />
            </el-select>
          </div>

          <div class="form-group">
            <label>构建模式</label>
            <el-select 
              v-model="buildConfig.buildMode"
              placeholder="选择构建模式"
              size="large"
              style="width: 100%"
            >
              <el-option value="single" label="单模态" />
              <el-option value="multi" label="多模态" />
            </el-select>
          </div>

          <el-button 
            type="primary"
            @click="startBuild"
            :disabled="!canStartBuild"
            size="large"
            style="width: 100%"
          >
            开始构建图谱
          </el-button>
        </div>

        <!-- 图谱融合模块 -->
        <div class="panel-section">
          <h3>知识图谱融合</h3>
          <div class="form-group">
            <label>融合到已有图谱</label>
            <el-select 
              v-model="fusionConfig.targetGraph"
              placeholder="选择目标图谱"
              size="large"
              style="width: 100%"
            >
              <el-option value="graph1" label="主知识图谱 #1" />
              <el-option value="graph2" label="主知识图谱 #2" />
            </el-select>
          </div>

          <div class="form-group">
            <label>融合策略</label>
            <el-select 
              v-model="fusionConfig.strategy"
              placeholder="选择融合策略"
              size="large"
              style="width: 100%"
            >
              <el-option value="gnn" label="GNN多头注意力" />
              <el-option value="heuristic" label="启发式合并" />
              <el-option value="rules" label="规则驱动" />
            </el-select>
          </div>

          <el-button 
            type="primary"
            @click="startFusion"
            :disabled="!canStartFusion"
            size="large"
            style="width: 100%"
          >
            开始融合
          </el-button>
        </div>
      </div>

      <!-- 中间: 可视化 + 结果显示 -->
      <div class="main-content">
        <h2>知识图谱构建 & 融合结果</h2>

        <!-- Tab切换 -->
        <el-tabs v-model="activeTab">
          <el-tab-pane label="构建结果" name="build">
            <div v-loading="loading" class="graph-visual">
              <svg ref="localGraphContainer"></svg>
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
            <el-table :data="buildResults" border>
              <el-table-column prop="name" label="节点名称" />
              <el-table-column prop="modality" label="模态" />
              <el-table-column prop="attributeCount" label="属性数" />
            </el-table>
          </el-tab-pane>
          
          <el-tab-pane label="融合结果" name="fusion">
            <div v-loading="loading" class="graph-visual">
              <svg ref="fusedGraphContainer"></svg>
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
            <el-table :data="fusionResults" border>
              <el-table-column prop="name" label="节点名称" />
              <el-table-column prop="graph" label="所属图谱" />
              <el-table-column prop="mergeMethod" label="合并方式" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { getMultiModalKnowledgeGraphList } from "@/api/multiModalKnowledgeGraph";
import * as d3 from "d3";

// 构建配置
const buildConfig = ref({
  dataSource: '',
  buildMode: 'single'
});

// 融合配置
const fusionConfig = ref({
  targetGraph: '',
  strategy: 'gnn'
});

// 构建状态
const isBuilding = ref(false);

// 融合状态
const isFusing = ref(false);

// 当前激活的标签页
const activeTab = ref('build');

// 构建结果
const buildResults = ref([
  {
    name: 'Patient_B200',
    modality: '患者',
    attributeCount: 5
  }
]);

// 融合结果
const fusionResults = ref([
  {
    name: 'Disease_Heart',
    graph: '主图谱 #1',
    mergeMethod: 'GNN聚合(相似度0.8)'
  }
]);

// 加載狀態
const loading = ref(false);

// 计算属性：是否可以开始构建
const canStartBuild = computed(() => {
  return buildConfig.value.dataSource !== '';
});

// 计算属性：是否可以开始融合
const canStartFusion = computed(() => {
  return fusionConfig.value.targetGraph !== '' && 
         fusionConfig.value.strategy !== '';
});

// 开始构建
const startBuild = async () => {
  if (!canStartBuild.value) return;
  
  loading.value = true;
  activeTab.value = 'build';
  
  try {
    // 模擬構建過程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 更新構建結果
    buildResults.value = [
      {
        name: 'Patient',
        modality: '患者',
        attributeCount: 4
      },
      {
        name: 'image',
        modality: '图像',
        attributeCount: 4
      },{
        name: 'text',
        modality: '文本',
        attributeCount: 4
      },{
        name: 'Institution',
        modality: '机构',
        attributeCount: 2
      }
    ];

    // 初始化構建結果圖譜
    nextTick(() => {
      initLocalGraph();
    });
  } catch (error) {
    console.error('構建過程出錯:', error);
  } finally {
    loading.value = false;
  }
};

// 开始融合
const startFusion = async () => {
  if (!canStartFusion.value) return;
  
  loading.value = true;
  activeTab.value = 'fusion';
  
  try {
    // 模擬融合過程
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 更新融合結果
    fusionResults.value = [
      {
        name: 'Patient',
        graph: '主图谱 #1',
        mergeMethod: 'GNN聚合'
      },
      {
        name: 'image',
        graph: '主图谱 #1',
        mergeMethod: 'GNN聚合'
      },
      {
        name: 'text',
        graph: '主图谱 #1',
        mergeMethod: 'GNN聚合'
      },
      {
        name: 'Institution',
        graph: '主图谱 #1',
        mergeMethod: 'GNN聚合'
      }
    ];

    // 初始化融合結果圖譜
    nextTick(() => {
      initFusedGraph();
    });
  } catch (error) {
    console.error('融合過程出錯:', error);
  } finally {
    loading.value = false;
  }
};



const localGraphContainer = ref(null);
const fusedGraphContainer = ref(null);

// 初始化本地圖譜
const initLocalGraph = () => {
  if (!localGraphContainer.value) return;
  
  // 清除現有內容
  d3.select(localGraphContainer.value).selectAll("*").remove();
  
  const width = localGraphContainer.value.clientWidth;
  const height = localGraphContainer.value.clientHeight;

  const svg = d3
    .select(localGraphContainer.value)
    .attr("width", width)
    .attr("height", height)
    .call(
      d3
        .zoom()
        .scaleExtent([0.1, 8])
        .on("zoom", (event) => {
          const container = d3.select(".local-graph-container");
          if (container.empty()) {
            svg
              .append("g")
              .attr("class", "local-graph-container")
              .attr("transform", event.transform);
          } else {
            container.attr("transform", event.transform);
          }
        })
    );

  const container = svg.append("g").attr("class", "local-graph-container");

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

    { "source": "pacs01CT201702170412_z_t", "target": "pacs01CT201702170413_z_t", "relations": [{ "relation": "TEXT_SIMILAR", "weight": 0.82 }] },
    { "source": "pacs01CT201702170415_z_t", "target": "pacs01CT201702170416_z_t", "relations": [{ "relation": "TEXT_SIMILAR", "weight": 0.76 }] },

    { "source": "pacs01CT201702170412_z_i", "target": "pacs01CT201702170413_z_i", "relations": [{ "relation": "IMAGE_SIMILAR", "weight": 0.79 }] },
    { "source": "pacs01CT201702170415_z_i", "target": "pacs01CT201702170416_z_i", "relations": [{ "relation": "IMAGE_SIMILAR", "weight": 0.73 }] },
    { "source": "pacs01CT201702170412_z_i", "target": "pacs01CT201702170415_z_i", "relations": [{ "relation": "IMAGE_SIMILAR", "weight": 0.74 }] },
    { "source": "pacs01CT201702170413_z_i", "target": "pacs01CT201702170416_z_i", "relations": [{ "relation": "IMAGE_SIMILAR", "weight": 0.76 }] }
  ]
}

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
    );

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

// 初始化融合圖譜
const initFusedGraph = () => {
  if (!fusedGraphContainer.value) return;
  
  // 清除現有內容
  d3.select(fusedGraphContainer.value).selectAll("*").remove();
  
  const width = fusedGraphContainer.value.clientWidth;
  const height = fusedGraphContainer.value.clientHeight;

  const svg = d3
    .select(fusedGraphContainer.value)
    .attr("width", width)
    .attr("height", height)
    .call(
      d3
        .zoom()
        .scaleExtent([0.1, 8])
        .on("zoom", (event) => {
          const container = d3.select(".fused-graph-container");
          if (container.empty()) {
            svg
              .append("g")
              .attr("class", "fused-graph-container")
              .attr("transform", event.transform);
          } else {
            container.attr("transform", event.transform);
          }
        })
    );

  const container = svg.append("g").attr("class", "fused-graph-container");

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
    );

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
</script>

<style lang="scss" scoped>
.knowledge-graph {
  .container {
    margin: 1rem 2rem;
    display: flex;
    gap: 1rem;
  }

  .left-panel {
    flex: 0 0 300px;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 1rem;

    h2 {
      font-size: 1rem;
      margin-bottom: 0.8rem;
      color: #007bff;
    }

    .panel-section {
      margin-bottom: 1.5rem;
      background-color: #f0f3f5;
      padding: 0.8rem;
      border-radius: 4px;

      h3 {
        font-size: 1rem;
        color: #333;
        margin-bottom: 0.5rem;
      }

      .form-group {
        margin-bottom: 0.8rem;

        label {
          display: block;
          margin-bottom: 0.3rem;
          font-weight: bold;
          color: #444;
        }
      }
    }
  }

  .main-content {
    flex: 1;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    padding: 1rem;
    display: flex;
    flex-direction: column;

    h2 {
      font-size: 1rem;
      margin-bottom: 0.8rem;
      color: #007bff;
    }

    .graph-visual {
      border: 1px dashed #ccc;
      height: 500px;
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

      .visualization {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;

        .loading {
          text-align: center;
          color: #666;
        }
      }
    }
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
  max-width: 200px;

  h4 {
    margin-bottom: 0.3rem;
    color: #007bff;
    font-size: 0.9rem;
  }
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0.3rem 0;
  font-size: 0.8rem;
}

.color-swatch {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  display: inline-block;
  margin-right: 0.4rem;
  flex-shrink: 0;
}

.shape-swatch {
  width: 16px;
  height: 16px;
  display: inline-block;
  margin-right: 0.4rem;
  margin-top: 2px;
  flex-shrink: 0;

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
  flex-shrink: 0;
}

.trapezoid {
  width: 0;
  height: 0;
  border-bottom: 16px solid #000;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  margin-right: 0.4rem;
  margin-top: 1px;
  flex-shrink: 0;
}
</style>
