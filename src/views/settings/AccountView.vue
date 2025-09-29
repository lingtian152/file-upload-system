<script setup>
import { RouterLink, RouterView } from 'vue-router'
import PasswordView from '../../components/PasswordView.vue'

import { ref } from 'vue'

const showChangePassword = ref(false)
</script>

<template>
  <div class="account-container">
    <h1 class="account-title">Account Settings</h1>

    <div class="account-section">
      <label class="section-label">Password</label>
      <n-button class="action-btn" @click="showChangePassword = true">Change Password</n-button>
    </div>
  </div>

  <n-message-provider>
    <n-modal
      v-model:show="showChangePassword"
      preset="dialog"
      :show-icon="false"
      style="border-radius: 8px; width: 400px"
      closable="true"
    >
      <PasswordView />
    </n-modal>
  </n-message-provider>
</template>

<style scoped>
.account-title {
  font-size: 26px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
}

.account-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}

.section-label {
  font-size: 18px;
  font-weight: 600;
}

.action-btn {
  font-size: 15px;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text);
  transition: all 0.2s ease;
}
</style>
