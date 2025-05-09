<template>
  <div class="han-training">
    <div class="container">
      <!-- 训练配置区域 -->
      <div class="training-config">
        <h2>模型训练配置</h2>
        <div class="config-form">
          <div class="form-group">
            <label>模型保存名称</label>
            <el-input
              v-model="trainingConfig.modelName"
              placeholder="请输入模型保存名称"
              size="large"
            />
          </div>

          <el-button
            type="primary"
            @click="startTraining"
            :disabled="!canStartTraining"
            size="large"
            style="width: 100%"
          >
            开始训练
          </el-button>
        </div>
      </div>

      <!-- 训练记录区域 -->
      <div class="training-records">
        <div class="records-header">
          <h2>训练记录</h2>
          <el-button type="primary" @click="refreshRecords">
            <el-icon><Refresh /></el-icon>
            更新记录
          </el-button>
        </div>
        <el-table
          :data="trainingRecords"
          border
          style="width: 100%"
          v-loading="loading"
        >
          <el-table-column prop="epoch" label="周期" width="100"/>
          <el-table-column prop="resultPath" label="保存路径" />
          <el-table-column prop="hits1" label="Hits@1" width="150"/>
          <el-table-column prop="hits5" label="Hits@5" width="150"/>
          <el-table-column prop="hits10" label="Hits@10" width="150"/>
          <el-table-column prop="trainLoss" label="训练损失" width="150"/>
          <el-table-column prop="testLoss" label="测试损失" width="150"/>
          <el-table-column prop="createTime" label="开始时间" />
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";

// 训练配置
const trainingConfig = ref({
  // dataSource: '',
  modelName: "",
});

// 训练记录
const trainingRecords = ref([
    {
      "epoch": 0,
      "resultPath": "DAFSPython/han/han_epoch0.pt",
      "hits1": "0.2",
      "hits5": "0.6",
      "hits10": "0.6",
      "trainLoss": "0.7",
      "testLoss": "0.6",
      "createTime": "2025-05-07T10:01:12",
      "status": "SUCCESS",
      "log": ""
    },
    {
      "epoch": 1,
      "resultPath": "DAFSPython/han/han_epoch1.pt",
      "hits1": "0.3",
      "hits5": "0.6",
      "hits10": "0.7",
      "trainLoss": "0.65",
      "testLoss": "0.58",
      "createTime": "2025-05-07T10:01:13",
      "status": "SUCCESS",
      "log": ""
    },
    {
      "epoch": 2,
      "resultPath": "DAFSPython/han/han_epoch2.pt",
      "hits1": "0.3",
      "hits5": "0.7",
      "hits10": "0.7",
      "trainLoss": "0.6",
      "testLoss": "0.55",
      "createTime": "2025-05-07T10:01:14",
      "status": "SUCCESS",
      "log": ""
    },
    {
      "epoch": 3,
      "resultPath": "DAFSPython/han/han_epoch3.pt",
      "hits1": "0.4",
      "hits5": "0.7",
      "hits10": "0.8",
      "trainLoss": "0.55",
      "testLoss": "0.52",
      "createTime": "2025-05-07T10:01:15",
      "status": "SUCCESS",
      "log": ""
    },
    {
      "epoch": 4,
      "resultPath": "DAFSPython/han/han_epoch4.pt",
      "hits1": "0.4",
      "hits5": "0.8",
      "hits10": "0.8",
      "trainLoss": "0.5",
      "testLoss": "0.5",
      "createTime": "2025-05-07T10:01:15",
      "status": "SUCCESS",
      "log": ""
    },
    {
      "epoch": 5,
      "resultPath": "DAFSPython/han/han_epoch5.pt",
      "hits1": "0.5",
      "hits5": "0.8",
      "hits10": "0.9",
      "trainLoss": "0.45",
      "testLoss": "0.48",
      "createTime": "2025-05-07T10:01:16",
      "status": "SUCCESS",
      "log": ""
    },
    {
      "epoch": 6,
      "resultPath": "DAFSPython/han/han_epoch6.pt",
      "hits1": "0.4",
      "hits5": "0.8",
      "hits10": "0.8",
      "trainLoss": "0.4",
      "testLoss": "0.55",
      "createTime": "2025-05-07T10:01:17",
      "status": "SUCCESS",
      "log": ""
    },
    {
      "epoch": 7,
      "resultPath": "DAFSPython/han/han_epoch7.pt",
      "hits1": "0.6",
      "hits5": "0.9",
      "hits10": "0.9",
      "trainLoss": "0.35",
      "testLoss": "0.5",
      "createTime": "2025-05-07T10:01:18",
      "status": "SUCCESS",
      "log": ""
    }
  ]);

// 添加 loading 状态
const loading = ref(false);

// 是否可以开始训练
const canStartTraining = computed(() => {
  return trainingConfig.value.modelName !== "";
});

// 开始训练
const startTraining = async () => {
  if (!canStartTraining.value) return;

  try {
    // 模拟训练过程
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 添加新的训练记录
    trainingRecords.value.unshift({
      modelName: trainingConfig.value.modelName,
      trainingTime: new Date().toLocaleString(),
    });

    // 重置配置
    trainingConfig.value = {
      dataSource: "",
      modelName: "",
    };
  } catch (error) {
    console.error("训练过程出错:", error);
  }
};

// 更新记录
const refreshRecords = async () => {
  loading.value = true;
  try {
    // 这里添加获取最新记录的API调用
    // const response = await fetch('/api/training-records');
    // trainingRecords.value = await response.json();

    // 模拟更新
    await new Promise((resolve) => setTimeout(resolve, 1000));
    ElMessage.success("记录已更新");
  } catch (error) {
    console.error("更新记录失败:", error);
    ElMessage.error("更新记录失败");
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.han-training {
  .container {
    margin: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .training-config {
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1rem;

    h2 {
      font-size: 1rem;
      margin-bottom: 0.8rem;
      color: #007bff;
    }

    .config-form {
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

  .training-records {
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1rem;

    .records-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.8rem;

      h2 {
        font-size: 1rem;
        margin: 0;
        color: #007bff;
      }
    }
  }
}
</style>
