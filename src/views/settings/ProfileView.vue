<template>
  <div class="profile-container">
    <!-- 修改用户名 -->
    <div class="change-username">
      <div class="input-group">
        <label for="username">Username:</label>
        <n-input
          v-model:value="newUsername"
          :placeholder="username"
          class="username-input"
          :disabled="!active"
          :class="{ 'active-input': active }"
        />
        <n-button v-if="!active" @click="enableEdit" class="edit-button"> Edit </n-button>
        <n-button v-else @click="updateName" class="save-button"> Save </n-button>
      </div>
    </div>

    <!-- 主题设置 -->
    <div class="theme-settings">
      <span class="theme-label">Theme:</span>
      <div class="theme-options">
        <n-button
          class="theme-button"
          :class="{ 'active-theme': currentTheme === 'system' }"
          @click="applyTheme('system')"
        >
          System
        </n-button>
        <n-button
          class="theme-button"
          :class="{ 'active-theme': currentTheme === 'light' }"
          @click="applyTheme('light')"
        >
          Light
        </n-button>
        <n-button
          class="theme-button"
          :class="{ 'active-theme': currentTheme === 'dark' }"
          @click="applyTheme('dark')"
        >
          Dark
        </n-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useTheme } from '../../composables/useTheme'
import { useStore } from 'vuex'
import { useMessage } from 'naive-ui'

const { currentTheme, applyTheme } = useTheme()
const store = useStore()
const message = useMessage()

// 响应式用户名（Vuex）
const username = computed(() => store.state.username)
const newUsername = ref('')
const active = ref(false)

// 启用编辑
const enableEdit = () => {
  newUsername.value = username.value
  active.value = true
}

// 更新用户名
const updateName = async () => {
  if (!newUsername.value.trim()) {
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/UpdateName', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        newUsername: newUsername.value.trim(),
      }),
    })

    const data = await response.json()

    if (data.success) {
      store.commit('setUsername', newUsername.value.trim())
      active.value = false
      message.success('Username updated successfully!')
    } else {
      message.error(`Failed to update username: ${data.message || 'Unknown error'}`)
    }
  } catch (error) {
    console.error(error)
    alert('An error occurred while updating the username.')
  }
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme') || 'system'
  applyTheme(savedTheme)
})
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 20px;
  gap: 30px;
}

/* 修改用户名 */
.change-username {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.input-group > label {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text);
}

.username-input {
  background-color: transparent;
  color: var(--color-text);
}

.active-input {
  border: 2px solid var(--color-border);
  border-radius: 5px;
  color: var(--color-text);
}

/* 按钮交互 */
.edit-button {
  font-size: 1rem;
  padding: 5px 15px;
  border: none;
  color: var(--color-text);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.input-group:hover > .edit-button,
.edit-button:hover {
  opacity: 1;
}

.save-button {
  font-size: 1rem;
  padding: 5px 15px;
  border: 2px solid var(--color-border);
  border-radius: 5px;
  background-color: #409eff;
  color: #fff;
  transition: background-color 0.3s ease;
}

.save-button:hover {
  background-color: #66b1ff;
}

/* 主题设置 */
.theme-settings {
  display: flex;
  align-items: center;
  gap: 20px;
}

.theme-options {
  display: flex;
  gap: 10px;
}

.theme-button {
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 5px;
  line-height: 35px;
  text-align: center;
  border: 2px solid var(--color-border);
  color: var(--color-text);
}

.active-theme {
  background-color: #409eff;
  color: #fff;
}

.theme-label {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text);
}
</style>
