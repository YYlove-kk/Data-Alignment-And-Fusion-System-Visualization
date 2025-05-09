<template>
  <div class="dimension-reduction">
    <div class="container">
      <!-- 降维配置区域 -->
      <div class="reduction-config">
        <h2>数据降维配置</h2>
        <div class="config-form">
          <div class="form-group">
            <label>选择数据源</label>
            <el-select 
              v-model="reductionConfig.dataSource"
              placeholder="选择可用的知识图谱"
              size="large"
              style="width: 100%"
            >
              <el-option 
                v-for="graph in availableGraphs" 
                :key="graph.value"
                :value="graph.value"
                :label="graph.label"
              />
            </el-select>
          </div>

          <el-button 
            type="primary"
            @click="startReduction"
            :disabled="!canStartReduction"
            size="large"
            style="width: 100%"
          >
            开始降维
          </el-button>
        </div>
      </div>

      <!-- 降维记录区域 -->
      <div class="reduction-records">
        <div class="records-header">
          <h2>降维记录</h2>
          <el-button type="primary" @click="refreshRecords">
            <el-icon><Refresh /></el-icon>
            更新记录
          </el-button>
        </div>
        <el-table :data="reductionRecords" border style="width: 100%" v-loading="loading">
          <el-table-column prop="id" label="id" />
          <el-table-column prop="filename" label="文件名" />
          <el-table-column prop="sourceid" label="数据源" />
          <el-table-column prop="status" label="降维状态">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ scope.row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

// 可用的知识图谱列表
const availableGraphs = ref([
  { value: 'graph1', label: '知识图谱 #1' },
  { value: 'graph2', label: '知识图谱 #2' }
]);

// 降维配置
const reductionConfig = ref({
  dataSource: ''
});

// 降维记录
const reductionRecords = ref([
  {
    "id": 1,
    "filename": "pacs01CT201702170412_z_t.npy",
    "sourceid": "诊断记录表",
    "status": "COMPLETED"
  },
  {
    "id": 2,
    "filename": "pacs01CT201702170412_z_i.npy",
    "sourceid": "dcm影像记录",
    "status": "COMPLETED"
  },
  {
    "id": 3,
    "filename": "pacs01CT201702170413_z_t.npy",
    "sourceid": "诊断记录表",
    "status": "COMPLETED"
  },
  {
    "id": 4,
    "filename": "pacs01CT201702170413_z_i.npy",
    "sourceid": "dcm影像记录",
    "status": "COMPLETED"
  },
  {
    "id": 5,
    "filename": "pacs01CT201702170415_z_t.npy",
    "sourceid": "诊断记录表",
    "status": "COMPLETED"
  },
  {
    "id": 6,
    "filename": "pacs01CT201702170415_z_i.npy",
    "sourceid": "dcm影像记录",
    "status": "COMPLETED"
  },
  {
    "id": 7,
    "filename": "pacs01CT201702170416_z_t.npy",
    "sourceid": "诊断记录表",
    "status": "COMPLETED"
  },
  {
    "id": 8,
    "filename": "pacs01CT201702170416_z_i.npy",
    "sourceid": "dcm影像记录",
    "status": "COMPLETED"
  }
]
);

// 添加 loading 状态
const loading = ref(false);

// 是否可以开始降维
const canStartReduction = computed(() => {
  return reductionConfig.value.dataSource !== '';
});

// 获取状态标签类型
const getStatusType = (status) => {
  const typeMap = {
    '成功': 'success',
    '进行中': 'warning',
    '失败': 'danger'
  };
  return typeMap[status] || 'info';
};

// 开始降维
const startReduction = async () => {
  if (!canStartReduction.value) return;
  
  try {
    // 模拟降维过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 添加新的降维记录
    reductionRecords.value.unshift({
      dataSource: `知识图谱 #${reductionConfig.value.dataSource.slice(-1)}`,
      fileName: `reduction_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}.npy`,
      reductionTime: new Date().toLocaleString(),
      status: '成功'
    });

    // 重置配置
    reductionConfig.value = {
      dataSource: ''
    };
  } catch (error) {
    console.error('降维过程出错:', error);
  }
};

// 更新记录
const refreshRecords = async () => {
  loading.value = true;
  try {
    // 这里添加获取最新记录的API调用
    // const response = await fetch('/api/reduction-records');
    // reductionRecords.value = await response.json();
    
    // 模拟更新
    await new Promise(resolve => setTimeout(resolve, 1000));
    ElMessage.success('记录已更新');
  } catch (error) {
    console.error('更新记录失败:', error);
    ElMessage.error('更新记录失败');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.dimension-reduction {
  .container {
    margin: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .reduction-config {
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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

  .reduction-records {
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
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