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
              <el-option value="" label="主知识图谱 #1" />
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
            <div class="graph-visual">
              <div v-if="!isBuilding" class="placeholder">
                这里显示图谱构建后的局部可视化（或力导向图）
              </div>
              <div v-else class="visualization">
                <div class="loading">正在生成可视化...</div>
              </div>
            </div>
            <el-table :data="buildResults" border>
              <el-table-column prop="name" label="节点名称" />
              <el-table-column prop="modality" label="模态" />
              <el-table-column prop="attributeCount" label="属性数" />
            </el-table>
          </el-tab-pane>
          
          <el-tab-pane label="融合结果" name="fusion">
            <div class="graph-visual">
              <div v-if="!isFusing" class="placeholder">
                这里展示融合后，与主知识图谱合并的可视化
              </div>
              <div v-else class="visualization">
                <div class="loading">正在生成可视化...</div>
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
import { ref, computed } from 'vue';

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
  
  isBuilding.value = true;
  
  try {
    // 模拟构建过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 更新构建结果
    buildResults.value = [
      {
        name: 'Patient_B200',
        modality: '患者',
        attributeCount: 5
      },
      {
        name: 'Disease_Heart',
        modality: '疾病',
        attributeCount: 3
      }
    ];
  } catch (error) {
    console.error('构建过程出错:', error);
  } finally {
    isBuilding.value = false;
  }
};

// 开始融合
const startFusion = async () => {
  if (!canStartFusion.value) return;
  
  isFusing.value = true;
  
  try {
    // 模拟融合过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 更新融合结果
    fusionResults.value = [
      {
        name: 'Disease_Heart',
        graph: '主图谱 #1',
        mergeMethod: 'GNN聚合(相似度0.8)'
      },
      {
        name: 'Patient_B201',
        graph: '主图谱 #2',
        mergeMethod: '启发式合并'
      }
    ];
  } catch (error) {
    console.error('融合过程出错:', error);
  } finally {
    isFusing.value = false;
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

    h2 {
      font-size: 1rem;
      margin-bottom: 0.8rem;
      color: #007bff;
    }

    .graph-visual {
      border: 1px dashed #ccc;
      height: 350px;
      margin-bottom: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #999;
      border-radius: 4px;

      .placeholder, .loading {
        text-align: center;
      }
    }
  }
}
</style>
