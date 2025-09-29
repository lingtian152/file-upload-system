<script setup>
import { ref, defineEmits, computed } from 'vue'
import { NButton, NInput } from 'naive-ui'
import { useStore } from 'vuex'
const emit = defineEmits(['success'])

const store = useStore()
const username = computed(() => store.state.username)

const newName = ref('')

const updateName = async () => {
  if (!newName.value.trim()) {
    alert('New username cannot be empty')
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/UpdateName', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        newUsername: newName.value.trim(),
      }),
    })

    const data = await response.json()

    if (data.success) {
      store.commit('setUsername', newName.value.trim())
      newName.value = ''
      alert('用户名修改成功')
      emit('success')
    } else {
      alert(`Failed to update username: ${data.message || 'Unknown error'}`)
    }
  } catch (error) {
    console.error(error)
    alert('An error occurred while updating the username.')
  }
}
</script>

<template>
  <div class="change-name-container">
    <h2>Change Username</h2>

    <div class="input-group">
      <label for="newName">New Name:</label>
      <n-input id="newName" v-model:value="newName" placeholder="Enter new name" />
    </div>

    <n-button class="update-name-btn" @click="updateName">Update Name</n-button>
  </div>
</template>

<style scoped>
.change-name-container {
  padding: 30px 50px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  color: var(--color-text);
  background-color: var(--color-background);
  border-radius: 8px;
  max-width: 500px;
  margin: auto;
}

.input-group {
  display: flex;
  flex-direction: row;
  gap: 5px;
}

.input-group label {
  font-size: 1.1rem;
  display: inline-block;
  white-space: nowrap;
}

.n-input {
  background-color: var(--color-input-background);
  color: var(--color-text);
}

.update-name-btn {
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 5px;
  line-height: 35px;
  text-align: center;
  border: 2px solid var(--color-border);
  color: var(--color-text);
  background-color: transparent;
}
</style>
