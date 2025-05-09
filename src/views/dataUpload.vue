<template>
  <div class="data-upload">
    <!-- 主體 -->
    <div class="container">
      <!-- 頂部介紹區 -->
      <div class="upload-header">
        <h2>数据上传</h2>
        <p>
          支持上传文件类型：CSV、Excel、医养康影像等。请确保字段中包含患者标识、机构信息等必需项，以便后续数据对齐与融合，单次仅允许上传一个文件。
        </p>
      </div>

      <!-- 左右分欄: 上傳操作 / 已上傳列表 -->
      <div class="upload-container">
        <!-- 左側：上傳操作 -->
        <div class="left-panel">
          <h3>上传文件</h3>

          <div class="info-field">
            <label for="dataSourceName">数据源名称</label>
            <el-input
              v-model="formData.dataSourceName"
              placeholder="例: 广西医院2024-Q1影像数据"
              size="large"
            />
          </div>
          <div class="info-field">
            <label for="modalType">模态类型</label>
            <el-select
              v-model="formData.modalType"
              placeholder="请选择模态类型"
              size="large"
              style="width: 100%"
            >
              <el-option
                v-for="item in modalTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="info-field">
            <label for="orgName">机构名称/备注</label>
            <el-input
              v-model="formData.orgName"
              placeholder="例: 广东省人民医院"
              size="large"
            />
          </div>

          <el-upload
            class="upload-area"
            drag
            :action="uploadUrl"
            :auto-upload="false"
            :on-change="handleFileChange"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
            v-model:file-list="fileList"
            :on-remove="handleRemove"
            :limit="1"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              拖拽文件到这里或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持的文件类型：CSV、Excel、医养康影像等，单个文件大小不超过
                500MB，单次仅允许上传一个文件。
              </div>
            </template>
          </el-upload>

          <div class="upload-actions">
            <el-button
              type="primary"
              @click="submitUpload"
              :disabled="!canUpload"
            >
              开始上传
            </el-button>
            <el-button @click="handleCancel">取消</el-button>
          </div>

          <div class="progress-area" v-if="uploadProgress > 0">
            <el-progress :percentage="uploadProgress" />
          </div>
        </div>

        <!-- 右側：已上傳數據列表 -->
        <div class="right-panel">
          <h3>已上传数据列表</h3>

          <el-table
            :data="uploadedFiles"
            style="width: 100%"
            max-height="410"
            border
          >
            <el-table-column prop="name" label="数据源名称"/>
            <el-table-column prop="type" label="模态类型" width="120" />
            <el-table-column prop="uploadTime" label="上传时间" width="180" />
            <el-table-column prop="status" label="状态" width="120" />
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button
                  type="danger"
                  size="small"
                  @click="handleDelete(scope.row)"
                >
                  刪除
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  @click="handleAlign(scope.row)"
                >
                  数据对齐
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";
import { UploadFilled } from "@element-plus/icons-vue";
import { uploadData,getDataUploadList,deleteData } from "@/api/dataUpload";

// 上傳 URL
const uploadUrl =
  "https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15";

// 表單數據
const formData = ref({
  dataSourceName: "",
  modalType: 1,
  orgName: "",
});

// 文件列表
const fileList = ref([]);

// 上傳進度
const uploadProgress = ref(0);

// 已上傳文件列表
const uploadedFiles = ref([
  {
    id:1,
    name: "（三级医院）广东省人民医院检查信息",
    type: "文本",
    uploadTime: "2025-05-05 15:30",
    status: "成功",
  },
]);

// 模态类型选项
const modalTypeOptions = [
  { value: 1, label: "文本" },
  { value: 2, label: "图像" },
  { value: 3, label: "时序" },
];

// 計算屬性：是否可以上傳
const canUpload = computed(() => {
  console.log("11", fileList.value);
  return (
    formData.value.dataSourceName &&
    formData.value.orgName &&
    fileList.value.length > 0
  );
});

// 處理文件選擇
const handleFileChange = (file, fileList) => {
  if (file) {
    // 自動填充數據源名稱（使用第一個文件名）
    if (!formData.value.dataSourceName && fileList.length === 1) {
      formData.value.dataSourceName = file.name.split(".")[0];
    }
  }
};

// 上傳前的驗證
const beforeUpload = (file) => {
  const isLt500M = file.size / 1024 / 1024 < 500;
  if (!isLt500M) {
    ElMessage.error("文件大小不能超過 500MB!");
    return false;
  }
  return true;
};

// 處理上傳成功
const handleUploadSuccess = (response, file) => {
  uploadProgress.value = 100;
  // 添加上傳記錄
  uploadedFiles.value.unshift({
    name: formData.value.dataSourceName,
    type: formData.value.modalType,
    uploadTime: new Date().toLocaleString(),
    status: "成功",
  });

  ElMessage.success("文件上传成功");
  resetForm();
};

// 處理上傳失敗
const handleUploadError = (error) => {
  console.error("上传失败:", error);
  ElMessage.error("文件上傳失敗，請重試");
};

// 提交上傳
const submitUpload = async() => {
  if (!canUpload.value) {
    ElMessage.warning("請填寫所有必填項並選擇文件");
    return;
  }
  // 這裡可以添加實際的上傳邏輯
  uploadProgress.value = 0;
  console.log("11", fileList.value);
  // 模擬上傳進度

  const file = fileList.value[0];
  const params = {
    dataSourceName: formData.value.dataSourceName,
    modalType: formData.value.modalType,
    orgName: formData.value.orgName,
    file: file,
  };
  
   const res = await uploadData(params)
   if(res.code === 200){
    ElMessage.success("文件上传成功");
    resetForm();
    getDataUploadList();
   }else{
    ElMessage.error("文件上传失败");
   }
};

// 處理取消
const handleCancel = () => {
  resetForm();
};

// 重置表單
const resetForm = () => {
  formData.value = {
    dataSourceName: "",
    modalType: "text",
    orgName: "",
  };
  fileList.value = [];
  uploadProgress.value = 0;
};


// 處理刪除
const handleDelete = async(item) => {
  const index = uploadedFiles.value.indexOf(item);
  if (index > -1) {
    const res = await deleteData({id:item.id})
    if(res.code === 200){
      uploadedFiles.value.splice(index, 1);
      ElMessage.success("刪除成功");
    }else{
      ElMessage.error("刪除失败");
    }
  }
};

// 處理數據對齊
const handleAlign = (item) => {
  console.log("數據對齊:", item);
};

// 处理文件移除
const handleRemove = (file, fileList) => {
};
</script>

<style lang="scss" scoped>
.data-upload {
  .container {
    margin: 1rem 2rem;
  }

  .upload-header {
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    margin-bottom: 1rem;

    h2 {
      font-size: 1rem;
      margin-bottom: 0.5rem;
      color: #007bff;
    }

    p {
      font-size: 0.9rem;
      line-height: 1.4;
      color: #666;
    }
  }

  .upload-container {
    display: flex;
    gap: 1rem;
    min-height: 400px;
  }

  .left-panel,
  .right-panel {
    flex: 1;
    background-color: #fff;
    border-radius: 6px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1rem;

    h3 {
      font-size: 1rem;
      margin-bottom: 0.5rem;
      color: #007bff;
    }
  }

  .info-field {
    margin-bottom: 0.8rem;

    label {
      display: block;
      margin-bottom: 0.3rem;
      font-weight: bold;
      color: #444;
    }

    input,
    select {
      width: 100%;
      padding: 0.4rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  }

  .upload-area {
    margin: 1rem 0;
    width: 100%;

    :deep(.el-upload) {
      width: 100%;
    }

    :deep(.el-upload-dragger) {
      width: 100%;
    }
  }

  .upload-actions {
    display: flex;
    gap: 0.6rem;
    margin-top: 1rem;

    .el-button {
      flex: 1;
    }
  }

  .progress-area {
    margin-top: 1rem;
  }
}
</style>
