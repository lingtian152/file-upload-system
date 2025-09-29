<script setup>
import { ref, defineEmits } from 'vue'
import { useStore } from 'vuex'
import { useMessage, NInput, NButton, NForm, NFormItem } from 'naive-ui'
import { useRouter } from 'vue-router'

const emits = defineEmits(['success'])
const store = useStore()
const router = useRouter()
const message = useMessage()

// 表单字段
const oldPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// 提交修改密码
const submitPassword = async () => {
  if (!oldPassword.value || !newPassword.value || !confirmPassword.value) {
    message.warning('请填写完整信息')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    message.error('新密码与确认密码不一致')
    return
  }

  try {
    const response = await fetch('http://localhost:3000/api/ChangePassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: store.state.username,
        oldPassword: oldPassword.value.trim(),
        newPassword: newPassword.value.trim(),
      }),
    })

    const data = await response.json()

    if (data.success) {
      message.success('密码修改成功，请重新登录')
      store.dispatch('logout')
      router.push('/')
      emits('success')
    } else {
      message.error(`密码修改失败: ${data.message || '未知错误'}`)
    }
  } catch (error) {
    console.error(error)
    message.error('修改密码时发生错误')
  }
}
</script>

<template>
  <div class="change-password-container">
    <h2 class="title">修改密码</h2>
    <NForm class="password-form" @submit.prevent="submitPassword">
      <NFormItem label="旧密码" path="oldPassword">
        <NInput v-model:value="oldPassword" type="password" placeholder="输入旧密码" />
      </NFormItem>

      <NFormItem label="新密码" path="newPassword">
        <NInput v-model:value="newPassword" type="password" placeholder="11-20位数字和字母组合" />
      </NFormItem>

      <NFormItem label="确认新密码" path="confirmPassword">
        <NInput v-model:value="confirmPassword" type="password" placeholder="确认新密码" />
      </NFormItem>

      <div class="form-actions">
        <NButton
          type="primary"
          :disabled="!oldPassword || !newPassword || !confirmPassword"
          @click="submitPassword"
        >
          确认修改
        </NButton>
      </div>
    </NForm>
  </div>
</template>

<style scoped>
.change-password-container {
  padding: 24px;
  max-width: 500px;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 22px;
  font-weight: 700;
  text-align: center;
  margin-bottom: 24px;
  color: var(--color-text);
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.n-form-item-label {
  font-weight: 600;
}
</style>
