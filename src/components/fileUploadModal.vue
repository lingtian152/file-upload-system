<script setup>
import { ref, defineEmits } from 'vue'
import { FileUploadFilled } from '@vicons/material'
import { useMessage } from 'naive-ui'

const emit = defineEmits(['uploadSuccess'])
const message = useMessage()

const uploadFiles = ref([]) // 存放选中的文件

// 选择文件时触发
const handleFileChange = (options) => {
  uploadFiles.value = options.fileList.map((f) => f.file)
}

// 上传文件
const uploadFile = async () => {
  if (!uploadFiles.value.length) {
    message.warning('Please select at least one file to upload.')
    return
  }

  const formData = new FormData()
  uploadFiles.value.forEach((file) => {
    formData.append('file', file)
  })

  try {
    const response = await fetch('http://localhost:3000/file/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })
    const data = await response.json()

    if (data.success) {
      const uploadedFiles = data.files || [data.file] || []
      message.success('File(s) uploaded successfully!')
      emit('uploadSuccess', uploadedFiles)
      emit('close')
      uploadFiles.value = [] // 清空已选择文件
    } else {
      console.error('Upload failed:', data.message)
      message.error(data.message || 'Upload failed')
    }
  } catch (err) {
    console.error(err)
    message.error('Upload error')
  }
}
</script>

<template>
  <n-form class="upload-form">
    <n-upload multiple directory-dnd :default-upload="false" @change="handleFileChange">
      <n-upload-dragger>
        <n-icon size="48">
          <FileUploadFilled />
        </n-icon>
        <n-text class="upload-text">点击或拖动文件到此区域上传</n-text>
        <n-p depth="3" class="upload-warning"> 请不要上传敏感数据，例如银行卡号和密码 </n-p>
      </n-upload-dragger>
    </n-upload>

    <div class="modal-actions">
      <n-button @click="uploadFile" class="upload-btn">Upload</n-button>
    </div>
  </n-form>
</template>

<style scoped>
.upload-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.upload-text {
  font-size: 16px;
  margin-top: 8px;
}

.upload-warning {
  margin: 8px 0 0 0;
  text-align: center;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
