<template>
  <div class="patient-analysis">
    <!-- 主容器 -->
    <div class="container">
      <!-- 查询与选择卡片 -->
      <div class="query-card">
        <h2>数据分析查询</h2>

        <!-- 选择对象: 患者 或 疾病 -->
        <el-radio-group class="radio-group" v-model="queryConfig.target">
          <el-radio value="patient">单个患者</el-radio>
          <el-radio value="disease">某种疾病</el-radio>
        </el-radio-group>

        <div class="form-row">
          <div class="form-col">
            <label for="patientOrDisease">
              {{ queryConfig.target === "patient" ? "患者ID" : "疾病名称" }}
            </label>
            <el-input
              v-model="queryConfig.keyword"
              :placeholder="
                queryConfig.target === 'patient'
                  ? '如 Patient_X101'
                  : '如 糖尿病'
              "
              size="large"
            />
          </div>
          <div class="form-col">
            <label for="analysisTimeRange">时间范围</label>
            <el-date-picker
              v-model="queryConfig.timeRange"
              type="daterange"
              range-separator="To"
              start-placeholder="Start date"
              end-placeholder="End date"
              size="large"
              style="width: 100%"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-col">
            <label>数据来源</label>
            <el-select
              v-model="queryConfig.dataSource"
              placeholder="请选择数据来源"
              size="large"
              style="width: 100%"
            >
              <el-option
                v-for="item in dataSourceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="form-col">
            <label>分析模式</label>
            <el-select
              v-model="queryConfig.analysisMode"
              placeholder="请选择分析模式"
              size="large"
              style="width: 100%"
            >
              <el-option
                v-for="item in analysisModeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
        </div>

        <button
          class="analyze-button"
          @click="startAnalysis"
          :disabled="!canStartAnalysis"
        >
          开始分析
        </button>
      </div>

      <!-- 分析结果展示 -->
      <div class="analysis-result">
        <h2>分析结果</h2>

        <!-- 指标卡片 -->
        <div class="metrics">
          <div class="metric-card">
            <h4>记录总数</h4>
            <p>{{ metrics.totalRecords || "--" }}</p>
          </div>
          <div class="metric-card">
            <h4>主要诊断数</h4>
            <p>{{ metrics.mainDiagnosisCount || "--" }}</p>
          </div>
          <div class="metric-card">
            <h4>平均就诊频次</h4>
            <p>{{ metrics.avgVisitFrequency || "--" }}</p>
          </div>
        </div>

        <!-- 图表区域 -->
        <div class="chart-area" v-loading="loading">
          <div v-if="!isAnalyzing" class="placeholder">
            可视化图表(如折线、柱状、饼图)等
          </div>
          <div ref="graphRef" class="graph-container" id="chart"></div>
        </div>

        <!-- 结果表格 -->
        <table class="analysis-table">
          <thead>
            <tr>
              <th>记录ID/名称</th>
              <th>日期/时间</th>
              <th>关联信息</th>
              <th>关键指标</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(record, index) in analysisResults" :key="index">
              <td>{{ record.id }}</td>
              <td>{{ record.date }}</td>
              <td>{{ record.relatedInfo }}</td>
              <td>{{ record.keyMetrics }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import * as echarts from "echarts";

// 查询配置
const queryConfig = ref({
  target: "patient",
  keyword: "",
  timeRange: "",
  dataSource: "all",
  analysisMode: "statistics",
});

// 数据来源选项
const dataSourceOptions = [
  { value: "medical", label: "就诊记录" },
  { value: "elderly", label: "养老/居家数据" },
  { value: "rehabilitation", label: "康复机构数据" },
  { value: "all", label: "全部" },
];

// 分析模式选项
const analysisModeOptions = [
  { value: "statistics", label: "统计汇总" },
  { value: "trend", label: "趋势预测" },
  { value: "cluster", label: "聚类/分群" },
];

// 分析状态
const isAnalyzing = ref(false);
const loading = ref(false);

// 指标数据
const metrics = ref({
  totalRecords: null,
  mainDiagnosisCount: null,
  avgVisitFrequency: null,
});

// 分析结果
const analysisResults = ref([
  {
    id: "R_2024_01",
    date: "2024-03-10",
    relatedInfo: "血压检测/康复数据",
    keyMetrics: "高血压 160/95",
  },
]);

// 计算属性：是否可以开始分析
const canStartAnalysis = computed(() => {
  return queryConfig.value.keyword !== "" && queryConfig.value.timeRange !== "";
});

// 开始分析
const startAnalysis = async () => {
  if (!canStartAnalysis.value) return;

  isAnalyzing.value = true;

  try {
    // 模拟分析过程
    loading.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 更新指标数据
    metrics.value = {
      totalRecords: 156,
      mainDiagnosisCount: 8,
      avgVisitFrequency: "2.3次/月",
    };

    // 更新分析结果
    analysisResults.value = [
      {
        id: "R_2024_01",
        date: "2024-03-10",
        relatedInfo: "血压检测/康复数据",
        keyMetrics: "高血压 160/95",
      },
      {
        id: "R_2024_02",
        date: "2024-03-15",
        relatedInfo: "血糖检测/养老数据",
        keyMetrics: "空腹血糖 6.8mmol/L",
      },
    ];

    initGraph();
  } catch (error) {
    console.error("分析过程出错:", error);
  } finally {
    loading.value = false;
  }
};

const graphRef = ref();

const initGraph = () => {
  const myChart = echarts.init(graphRef.value);

  // 模擬數據
  const dates = ["2024-01", "2024-02", "2024-03", "2024-04", "2024-05"];
  const data = {
    bloodSugar: [6.2, 5.8, 6.5, 5.9, 6.1],
    bloodPressure: [130, 128, 135, 132, 129],
    weight: [65, 64, 63, 64, 63],
  };

  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
        },
      },
    },
    legend: {
      data: ["血糖", "血壓", "體重"],
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: dates,
    },
    yAxis: [
      {
        type: "value",
        name: "血糖(mmol/L)",
        position: "left",
      },
      {
        type: "value",
        name: "血壓(mmHg)",
        position: "right",
      },
      {
        type: "value",
        name: "體重(kg)",
        position: "right",
        offset: 80,
      },
    ],
    series: [
      {
        name: "血糖",
        type: "line",
        data: data.bloodSugar,
        smooth: true,
        itemStyle: {
          color: "#ff6384",
        },
      },
      {
        name: "血壓",
        type: "line",
        yAxisIndex: 1,
        data: data.bloodPressure,
        smooth: true,
        itemStyle: {
          color: "#36a2eb",
        },
      },
      {
        name: "體重",
        type: "line",
        yAxisIndex: 2,
        data: data.weight,
        smooth: true,
        itemStyle: {
          color: "#4bc0c0",
        },
      },
    ],
  };

  myChart.setOption(option);

  // 監聽窗口大小變化，調整圖表大小
  window.addEventListener("resize", () => {
    myChart.resize();
  });
};
</script>

<style lang="scss" scoped>
.patient-analysis {
  .container {
    margin: 1rem 2rem;
  }

  .query-card {
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    margin-bottom: 1rem;

    h2 {
      font-size: 1rem;
      margin-bottom: 0.8rem;
      color: #007bff;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      margin-bottom: 0.8rem;
    }

    .form-col {
      flex: 1;
      display: flex;
      flex-direction: column;

      label {
        margin-bottom: 0.3rem;
        font-weight: bold;
        color: #444;
      }

      input,
      select {
        padding: 0.4rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }
    }

    .radio-group {
      margin-bottom: 0.8rem;

      label {
        margin-right: 1rem;
        font-weight: normal;
      }
    }

    .analyze-button {
      width: 100%;
      padding: 0.6rem;
      background-color: #28a745;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.95rem;

      &:hover {
        background-color: #218838;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .analysis-result {
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

    .chart-area {
      border: 1px dashed #ccc;
      height: 300px;
      margin-bottom: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #999;
      border-radius: 4px;

      .placeholder {
        text-align: center;
        position: absolute;
      }
      .graph-container {
        width: 100%;
        height: 100%;
      }
    }

    .analysis-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 1rem;

      th,
      td {
        border: 1px solid #ddd;
        padding: 0.6rem;
        text-align: left;
      }

      th {
        background-color: #f7f7f7;
      }
    }
  }
}
</style>
