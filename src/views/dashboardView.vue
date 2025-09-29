<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { createDiscreteApi } from 'naive-ui'

import fileUploadModal from '@/components/fileUploadModal.vue'
import ViewFilePort from '@/components/ViewFilePort.vue'

const { message } = createDiscreteApi(['message'])

const store = useStore()
if (!store.state.username) window.location.href = '/login'

const files = ref([]) // 所有文件
const selectedFiles = ref(new Set()) // 选中的文件
const showModal = ref(false)
const showViewFile = ref(false)
const viewFileName = ref('')
const filePath = ref('')

// 全选 / 取消全选
const allSelected = computed({
  get: () => files.value.length > 0 && selectedFiles.value.size === files.value.length,
  set: (checked) => {
    if (checked) {
      selectedFiles.value = new Set(files.value)
    } else {
      selectedFiles.value.clear()
    }
  },
})

// 单个选择切换
const toggleSelect = (file) => {
  if (selectedFiles.value.has(file)) selectedFiles.value.delete(file)
  else selectedFiles.value.add(file)
}

// 上传成功回调
const handleUploadSuccess = async (uploadedFiles) => {
  files.value.push(...uploadedFiles)
  selectedFiles.value.clear()
  showModal.value = false
  await loadFiles()
}

// 删除文件
const handleDeleteFile = async () => {
  if (selectedFiles.value.size === 0) {
    message.error('No file selected for deletion.')
    return
  }

  try {
    const response = await fetch('http://localhost:3000/file/delete/', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileIds: Array.from(selectedFiles.value).map((f) => f.name) }),
      credentials: 'include',
    })
    const data = await response.json()
    if (data.success) {
      files.value = files.value.filter((f) => !selectedFiles.value.has(f))
      selectedFiles.value.clear()
      message.success('File(s) deleted successfully')
      await loadFiles()
    } else {
      message.error(data.message || 'Delete failed')
    }
  } catch (err) {
    console.error(err)
    message.error('Delete failed')
  }
}

// 预览文件
const handleViewFile = async (file) => {
  viewFileName.value = file.name

  try {
    const response = await fetch('http://localhost:3000/file/read_file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileIds: viewFileName.value }),
      credentials: 'include',
    })
    const data = await response.json()
    if (data.success) {
      filePath.value = data.data.path
      showViewFile.value = true
    } else {
      message.error(data.message || 'Failed to read file')
    }
  } catch (err) {
    console.error(err)
    message.error('Failed to read file')
  }
}

// 加载文件列表
const loadFiles = async () => {
  try {
    const res = await fetch('http://localhost:3000/file/request', {
      method: 'GET',
      credentials: 'include',
    })
    const data = await res.json()
    if (data.success) files.value = data.files
    else message.error(data.message)
  } catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  loadFiles()
})
</script>

<template>
  <div class="dashboard-container">
    <div class="action-group">
      <n-checkbox size="medium" label="Select All" v-model:checked="allSelected" />
      <div class="btn-group">
        <n-button class="upload-btn" @click="showModal = true">Upload File</n-button>
        <n-button class="delete-btn" @click="handleDeleteFile">Delete</n-button>
      </div>
    </div>

    <div class="file-list" v-if="files.length">
      <n-list>
        <n-list-item v-for="file in files" :key="file.name" class="file-item">
          <n-checkbox
            :label="file.name"
            :checked="selectedFiles.has(file)"
            @update:checked="() => toggleSelect(file)"
          />
          <n-button class="btn-item" @click="handleViewFile(file)">View</n-button>
        </n-list-item>
      </n-list>
    </div>

    <div v-else class="no-files">No files uploaded yet.</div>

    <n-message-provider>
      <n-modal
        v-model:show="showModal"
        title="Upload File"
        preset="card"
        :style="{ width: '600px' }"
      >
        <fileUploadModal @uploadSuccess="handleUploadSuccess" />
      </n-modal>
    </n-message-provider>

    <n-modal v-model:show="showViewFile" title="View File" :style="{ width: '80%', height: '80%' }">
      <ViewFilePort :fileName="viewFileName" :filePath="filePath" />
    </n-modal>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 50px auto;
  padding: 20px;
  background: var(--color-background-soft);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.action-group {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn-group {
  display: flex;
  gap: 10px;
}

.upload-btn {
  background-color: #3a6ea5;
  color: #fff;
  padding: 8px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.upload-btn:hover {
  background-color: #5a87bf;
}

.delete-btn {
  background-color: #e74c3c;
  color: #fff;
  padding: 8px 20px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.file-list {
  margin-top: 20px;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border);
}

.no-files {
  text-align: center;
  margin-top: 20px;
  font-size: 16px;
}
</style>
