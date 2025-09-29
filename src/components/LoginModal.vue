<script setup>
import { ref, defineEmits } from 'vue'
import { useStore } from 'vuex'

import { useMessage } from 'naive-ui'

const store = useStore()
const message = useMessage()
const emit = defineEmits(['success', 'fail'])

const formRef = ref(null)
const model = ref({
  username: '',
  password: '',
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: ['blur', 'input'] }],
  password: [{ required: true, message: '请输入密码', trigger: ['blur', 'input'] }],
}

const login = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(model.value),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // 保存 token，统一 cookie 名称
            if (data.token) {
              document.cookie = `__Session__=${data.token}; path=/; max-age=3600` // 1小时有效
              // 解析用户名并更新 Vuex
              store.dispatch('loginSuccess', model.value.username)
              message.success('登录成功')
              emit('success')
            }


            setTimeout(() => {
              window.location.href = `/${window.location.pathname.split('/')[1] || ''}`
            }, 1500);

            // 重置表单
            model.value.username = ''
            model.value.password = ''
            formRef.value?.restoreValidation?.()
          } else {
            message.error(data.message || '登录失败，请重试')
            emit('fail')
          }
        })
        .catch((error) => {
          console.error('Error:', error)
          window.$message?.error?.('登录过程中出错')
          emit('fail')
        })
    }
  })
}
</script>

<template>
  <div class="login-modal">
    <!-- 登录表单 -->
    <n-form ref="formRef" :model="model" :rules="rules" @submit.prevent="login">
      <n-form-item label="Username" path="username" class="username">
        <n-input v-model:value="model.username" placeholder="Enter your username" />
      </n-form-item>
      <n-form-item label="Password" path="password" class="password">
        <n-input v-model:value="model.password" type="password" placeholder="Enter your password" />
      </n-form-item>
      <div class="action">
        <n-button type="primary" class="login-button" attr-type="submit">Login</n-button>
      </div>
    </n-form>
  </div>
</template>

<style scoped>
.action {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.username,
.password {
  color: var(--color-text);
}

.login-button {
  font-size: 1.15rem;
  font-weight: 700;
  border-radius: 5px;
  color: var(--color-text);
}
.user-info {
  text-align: center;
  margin-top: 30px;
  color: var(--color-text);
}
</style>
