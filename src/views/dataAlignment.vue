<template>
  <div class="data-alignment">
    <!-- 主体容器 -->
    <div class="container">
      <!-- 左侧配置: 对齐参数 & 执行操作 -->
      <div class="sidebar">
        <h2>对齐配置</h2>

        <!-- 时序对齐设置 -->
        <div class="form-group">
          <label for="timeAlignMethod">时序对齐算法</label>
          <el-select
            v-model="alignmentConfig.timeAlignMethod"
            placeholder="请选择时序对齐算法"
            size="large"
            style="width: 100%"
          >
            <el-option
              v-for="item in timeAlignMethodOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="form-group">
          <label for="timeGranularity">时间粒度(小时/天)</label>
          <el-input
            type="number"
            v-model="alignmentConfig.timeGranularity"
            placeholder="例如24"
            size="large"
          />
        </div>

        <!-- 语义对齐设置 -->
        <div class="form-group">
          <label for="semanticModel">语义对齐模型</label>
          <el-select
            v-model="alignmentConfig.semanticModel"
            placeholder="请选择语义对齐模型"
            size="large"
            style="width: 100%"
          >
            <el-option
              v-for="item in semanticModelOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="form-group">
          <label for="similarityThreshold">相似度阈值</label>
          <el-input
            v-model="alignmentConfig.similarityThreshold"
            placeholder="如0.7"
            size="large"
          />
        </div>

        <el-button
          type="primary"
          @click="startAlignment"
          :disabled="!canStartAlignment"
          size="large"
          style="width: 100%"
        >
          开始对齐
        </el-button>
      </div>

      <!-- 中间结果区: 可视化 + 对齐状态 -->
      <div class="main-content">
        <h2>对齐结果概览</h2>
        <!-- 指标卡片 -->
        <div class="metrics">
          <div class="metric-card">
            <h4>时序误差</h4>
            <p>{{ metrics.timeError || "--" }}</p>
          </div>
          <div class="metric-card">
            <h4>语义准确率</h4>
            <p>{{ metrics.semanticAccuracy || "--" }}</p>
          </div>
          <div class="metric-card">
            <h4>对齐覆盖数</h4>
            <p>{{ metrics.alignmentCount || "--" }}</p>
          </div>
        </div>

        <!-- 对齐可视化 -->
        <div class="align-visual" v-loading="loading">
          <div v-show="!isAligning" class="placeholder">
            时序/语义对齐图可在此处渲染（热力图、Attention可视化等）
          </div>
          <div
            ref="heatmapRef"
            class="heatmap-container"
            id="chart"
          ></div>
        </div>

        <!-- 对齐详情表 -->
        <el-table
          :data="alignmentResults"
          style="width: 100%"
          border
        >
          <el-table-column prop="textId" label="文本ID/描述" />
          <el-table-column prop="imageId" label="图像ID/描述" />
          <el-table-column prop="timeAlignment" label="时序对齐" />
          <el-table-column prop="similarity" label="语义相似度" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, } from "vue";
import * as echarts from "echarts";

// 对齐配置
const alignmentConfig = ref({
  timeAlignMethod: "dtw",
  timeGranularity: 24,
  semanticModel: "clip",
  similarityThreshold: 0.7,
});

// 时序对齐算法选项
const timeAlignMethodOptions = [
  { value: "dtw", label: "DTW" },
  { value: "transformer", label: "自适应时间编码器" },
  { value: "other", label: "其他" },
];

// 语义对齐模型选项
const semanticModelOptions = [
  { value: "clip", label: "CLIP" },
  { value: "bertcnn", label: "BERT + CNN" },
  { value: "custom", label: "自定义对比学习" },
];

// 对齐状态
const isAligning = ref(false);
const loading = ref(false);
// 对齐指标
const metrics = ref({
  timeError: null,
  semanticAccuracy: null,
  alignmentCount: null,
});

// 对齐结果
const alignmentResults = ref([
  {
    textId: "ExampleText_1",
    imageId: "Img_2024_05_10",
    timeAlignment: "时间差2h",
    similarity: 0.72,
  },
]);

// 计算属性：是否可以开始对齐
const canStartAlignment = computed(() => {
  return (
    alignmentConfig.value.timeGranularity > 0 &&
    alignmentConfig.value.similarityThreshold > 0
  );
});

// 开始对齐
const startAlignment = async () => {
  if (!canStartAlignment.value) return;

  isAligning.value = true;

  try {
    // 模拟对齐过程
    loading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 更新指标
    metrics.value = {
      timeError: "0.5h",
      semanticAccuracy: "85%",
      alignmentCount: 156,
    };

    // 更新结果
    alignmentResults.value = [
      {
        textId: "ExampleText_1",
        imageId: "Img_2024_05_10",
        timeAlignment: "时间差2h",
        similarity: 0.72,
      },
      {
        textId: "ExampleText_2",
        imageId: "Img_2024_05_11",
        timeAlignment: "时间差1h",
        similarity: 0.85,
      },
    ];

    
    initHeatmap();
  } catch (error) {
    console.error("对齐过程出错:", error);
  } finally {
    loading.value = false;
  }
};

const heatmapRef = ref();


const initHeatmap = () => {
  const myChart = echarts.init(heatmapRef.value);

  const hours = [
    "12a",
    "1a",
    "2a",
    "3a",
    "4a",
    "5a",
    "6a",
    "7a",
    "8a",
    "9a",
    "10a",
    "11a",
    "12p",
    "1p",
    "2p",
    "3p",
    "4p",
    "5p",
    "6p",
    "7p",
    "8p",
    "9p",
    "10p",
    "11p",
  ];

  const days = [
    "Saturday",
    "Friday",
    "Thursday",
    "Wednesday",
    "Tuesday",
    "Monday",
    "Sunday",
  ];

  const data = [
    [0, 0, 5],
    [0, 1, 1],
    [0, 2, 0],
    [0, 3, 0],
    [0, 4, 0],
    [0, 5, 0],
    [0, 6, 0],
    [0, 7, 0],
    [0, 8, 0],
    [0, 9, 0],
    [0, 10, 0],
    [0, 11, 2],
    [0, 12, 4],
    [0, 13, 1],
    [0, 14, 1],
    [0, 15, 3],
    [0, 16, 4],
    [0, 17, 6],
    [0, 18, 4],
    [0, 19, 4],
    [0, 20, 3],
    [0, 21, 3],
    [0, 22, 2],
    [0, 23, 5],
    [1, 0, 7],
    [1, 1, 0],
    [1, 2, 0],
    [1, 3, 0],
    [1, 4, 0],
    [1, 5, 0],
    [1, 6, 0],
    [1, 7, 0],
    [1, 8, 0],
    [1, 9, 0],
    [1, 10, 5],
    [1, 11, 2],
    [1, 12, 2],
    [1, 13, 6],
    [1, 14, 9],
    [1, 15, 11],
    [1, 16, 6],
    [1, 17, 7],
    [1, 18, 8],
    [1, 19, 12],
    [1, 20, 5],
    [1, 21, 5],
    [1, 22, 7],
    [1, 23, 2],
    [2, 0, 1],
    [2, 1, 1],
    [2, 2, 0],
    [2, 3, 0],
    [2, 4, 0],
    [2, 5, 0],
    [2, 6, 0],
    [2, 7, 0],
    [2, 8, 0],
    [2, 9, 0],
    [2, 10, 3],
    [2, 11, 2],
    [2, 12, 1],
    [2, 13, 9],
    [2, 14, 8],
    [2, 15, 10],
    [2, 16, 6],
    [2, 17, 5],
    [2, 18, 5],
    [2, 19, 5],
    [2, 20, 7],
    [2, 21, 4],
    [2, 22, 2],
    [2, 23, 4],
    [3, 0, 7],
    [3, 1, 3],
    [3, 2, 0],
    [3, 3, 0],
    [3, 4, 0],
    [3, 5, 0],
    [3, 6, 0],
    [3, 7, 0],
    [3, 8, 1],
    [3, 9, 0],
    [3, 10, 5],
    [3, 11, 4],
    [3, 12, 7],
    [3, 13, 14],
    [3, 14, 13],
    [3, 15, 12],
    [3, 16, 9],
    [3, 17, 5],
    [3, 18, 5],
    [3, 19, 10],
    [3, 20, 6],
    [3, 21, 4],
    [3, 22, 4],
    [3, 23, 1],
    [4, 0, 1],
    [4, 1, 3],
    [4, 2, 0],
    [4, 3, 0],
    [4, 4, 0],
    [4, 5, 1],
    [4, 6, 0],
    [4, 7, 0],
    [4, 8, 0],
    [4, 9, 2],
    [4, 10, 4],
    [4, 11, 4],
    [4, 12, 2],
    [4, 13, 4],
    [4, 14, 4],
    [4, 15, 14],
    [4, 16, 12],
    [4, 17, 1],
    [4, 18, 8],
    [4, 19, 5],
    [4, 20, 3],
    [4, 21, 7],
    [4, 22, 3],
    [4, 23, 0],
    [5, 0, 2],
    [5, 1, 1],
    [5, 2, 0],
    [5, 3, 3],
    [5, 4, 0],
    [5, 5, 0],
    [5, 6, 0],
    [5, 7, 0],
    [5, 8, 2],
    [5, 9, 0],
    [5, 10, 4],
    [5, 11, 1],
    [5, 12, 5],
    [5, 13, 10],
    [5, 14, 5],
    [5, 15, 7],
    [5, 16, 11],
    [5, 17, 6],
    [5, 18, 0],
    [5, 19, 5],
    [5, 20, 3],
    [5, 21, 4],
    [5, 22, 2],
    [5, 23, 0],
    [6, 0, 1],
    [6, 1, 0],
    [6, 2, 0],
    [6, 3, 0],
    [6, 4, 0],
    [6, 5, 0],
    [6, 6, 0],
    [6, 7, 0],
    [6, 8, 0],
    [6, 9, 0],
    [6, 10, 1],
    [6, 11, 0],
    [6, 12, 2],
    [6, 13, 1],
    [6, 14, 3],
    [6, 15, 4],
    [6, 16, 0],
    [6, 17, 0],
    [6, 18, 0],
    [6, 19, 0],
    [6, 20, 1],
    [6, 21, 2],
    [6, 22, 2],
    [6, 23, 6],
  ].map(function (item) {
    return [item[1], item[0], item[2] || "-"];
  });

  const option = {
    tooltip: {
      position: "top",
    },
    grid: {
      height: "70%",
      top: "5%",
    },
    xAxis: {
      type: "category",
      data: hours,
      splitArea: {
        show: true,
      },
    },
    yAxis: {
      type: "category",
      data: days,
      splitArea: {
        show: true,
      },
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: "horizontal",
      left: "center",
      bottom: "0%",
    },
    series: [
      {
        name: "Punch Card",
        type: "heatmap",
        data: data,
        label: {
          show: true,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  myChart.setOption(option);
};
</script>

<style lang="scss" scoped>
.data-alignment {
  .container {
    display: flex;
    margin: 1rem 2rem;
    min-height: calc(100vh - 80px);
  }

  .sidebar {
    flex: 0 0 280px;
    background-color: #fff;
    border-radius: 6px;
    margin-right: 1rem;
    padding: 1rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    h2 {
      font-size: 1rem;
      margin-bottom: 1rem;
      color: #007bff;
    }

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin: 0.5rem 0 0.2rem;
        font-weight: bold;
        color: #444;
      }
    }
  }

  .main-content {
    flex: 1;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1rem;

    h2 {
      font-size: 1rem;
      margin-bottom: 0.8rem;
      color: #007bff;
    }

    .metrics {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;

      .metric-card {
        flex: 1;
        background-color: #f0f3f5;
        border-radius: 4px;
        padding: 0.8rem;
        text-align: center;

        h4 {
          font-weight: normal;
          color: #777;
          margin-bottom: 0.4rem;
        }

        p {
          font-size: 1.2rem;
          color: #333;
          font-weight: bold;
        }
      }
    }

    .align-visual {
      height: 400px;
      margin-bottom: 1rem;
      position: relative;
      overflow: hidden;
      border: 1px dashed #ccc;
      border-radius: 4px;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #999;

      .placeholder {
        text-align: center;
        position: absolute;
      }

      .loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          color: #666;
        }

      .heatmap-container {
        width: 100%;
        height: 100%;
      }
    }
  }
}
</style>
