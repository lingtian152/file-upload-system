<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
  fileName: String,
  filePath: String, // 后端返回的 base64 或 URL
})

const isImage = computed(() =>
  /\.(png|jpe?g|gif)$/i.test(props.fileName)
)

const isPDF = computed(() =>
  /\.pdf$/i.test(props.fileName)
)

const isText = computed(() =>
  /\.(txt|md|json|js|html|css)$/i.test(props.fileName)
)

const textContent = computed(() => {
  if (!isText.value || !props.filePath) return ''
  try {
    // Base64 -> 文本
    return atob(props.filePath.split(',')[1])
  } catch {
    return 'Unable to read text content'
  }
})
</script>

<template>
  <div class="view-container">
    <h2>{{ fileName }}</h2>
    <div class="view-file-container">
      <template v-if="isImage">
        <img :src="filePath" alt="file" />
      </template>
      <template v-else-if="isPDF">
        <iframe :src="filePath" width="100%" height="600px"></iframe>
      </template>
      <template v-else-if="isText">
        <pre>{{ textContent }}</pre>
      </template>
      <template v-else>
        <p>Cannot preview this file type.</p>
      </template>
    </div>
  </div>
</template>

<style scoped>
.view-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.view-file-container {
  width: 100%;
  height: 600px;
  overflow: auto;
}

img {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
