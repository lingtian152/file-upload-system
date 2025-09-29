<script setup>
import { ref, defineEmits } from 'vue'

const emit = defineEmits(['success', 'fail'])

const formRef = ref(null)
const model = ref({
  username: '',
  password: '',
  confirm_password: '',
  message: '', // 用于显示提示信息
})

// 表单验证规则
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: ['blur', 'input'] }],
  password: [{ required: true, message: '请输入密码', trigger: ['blur', 'input'] }],
  confirm_password: [
    { required: true, message: '请确认密码', trigger: ['blur', 'input'] },
    {
      validator: (rule, value) => {
        if (value !== model.value.password) {
          return new Error('两次输入的密码不一致')
        }
        return true
      },
      trigger: ['blur', 'input'],
    },
  ],
}

// 提交注册
const register = () => {
  formRef.value?.validate(async (errors) => {
    if (errors) return

    // 清空提示
    model.value.message = ''

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: model.value.username,
          password: model.value.password,
        }),
      })

      const data = await response.json()

      if (data.success) {
        model.value.message = '注册成功'
        emit('success')
        // 清空表单
        model.value.username = ''
        model.value.password = ''
        model.value.confirm_password = ''
      } else if (data.status === 409) {
        model.value.message = '用户名已存在'
        emit('fail')
      } else {
        model.value.message = '注册失败: ' + data.message
        emit('fail')
      }
    } catch (err) {
      console.error('注册出错:', err)
      model.value.message = '注册过程中出错'
      emit('fail')
    }
  })
}
</script>

<template>
  <div>
    <n-form
      ref="formRef"
      :model="model"
      :rules="rules"
      @submit.prevent="register"
      class="login-modal-container"
    >
      <n-form-item label="Username" path="username">
        <n-input v-model:value="model.username" placeholder="请输入用户名" />
      </n-form-item>

      <n-form-item label="Password" path="password">
        <n-input v-model:value="model.password" type="password" placeholder="请输入密码" />
      </n-form-item>

      <n-form-item label="Confirm Password" path="confirm_password">
        <n-input
          v-model:value="model.confirm_password"
          type="password"
          placeholder="请再次输入密码"
        />
      </n-form-item>

      <n-alert v-if="model.message" type="info" class="message-alert">
        {{ model.message }}
      </n-alert>

      <div class="action">
        <n-button type="primary" attr-type="submit">注册</n-button>
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

.message-alert {
  margin-top: 10px;
  text-align: center;
}

.n-form-item {
  color: var(--color-text);
}

.n-button {
  font-size: 1.15rem;
  font-weight: 700;
  border-radius: 5px;
}
</style>
