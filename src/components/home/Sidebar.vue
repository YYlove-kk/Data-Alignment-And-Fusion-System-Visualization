<template>
  <div class="sidebar">
    <div class="node-details" v-if="selectedNode">
      <h3>節點詳情</h3>
      <div class="detail-item">
        <span class="label">節點ID：</span>
        <span class="value">{{ selectedNode.id }}</span>
      </div>
      <div class="detail-item">
        <span class="label">節點類型：</span>
        <span class="value">{{ getNodeTypeName(selectedNode.type) }}</span>
      </div>
      <div class="detail-item">
        <span class="label">詳細信息：</span>
        <span class="value">{{ selectedNode.detail }}</span>
      </div>
      
      <div class="connections" v-if="selectedNode.connections.length">
        <h4>關聯節點</h4>
        <div class="connection-item" v-for="(conn, index) in selectedNode.connections" :key="index">
          <span class="conn-type" :style="{ backgroundColor: getConnectionColor(conn.type) }"></span>
          <span class="conn-target">{{ conn.target }}</span>
        </div>
      </div>
    </div>
    <div class="no-selection" v-else>
      <p>請點擊圖譜中的節點查看詳情</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const selectedNode = ref(null);

const getNodeTypeName = (type) => {
  const typeMap = {
    'diamond': '患者數據節點',
    'square': '表單數據節點',
    'triangle': '圖像數據節點',
    'trapezoid': '機構數據節點',
    'circle': '屬性數據節點'
  };
  return typeMap[type] || type;
};

const getConnectionColor = (type) => {
  const colorMap = {
    'red': '#ff0000',
    'orange': '#ffa500',
    'purple': '#800080',
    'blue': '#0000ff',
    'gray': '#808080'
  };
  return colorMap[type] || type;
};

// 接收節點點擊事件
const handleNodeClick = (nodeData) => {
  selectedNode.value = nodeData;
};

defineExpose({
  handleNodeClick
});
</script>

<style lang="scss" scoped>
.sidebar {
  width: 300px;
  height: 100%;
  background-color: #fff;
  border-left: 1px solid #ddd;
  padding: 1rem;
  overflow-y: auto;
}

.node-details {
  h3 {
    color: #007bff;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

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