<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { RouterView, RouterLink, useRouter } from 'vue-router'
import {
  NButton,
  NModal,
  NDropdown,
  NAvatar,
  NConfigProvider,
  NMessageProvider,
  darkTheme as naiveDarkTheme,
} from 'naive-ui'
import LoginModal from './components/LoginModal.vue'
import RegisterModal from './components/RegisterModal.vue'

// ====== 路由 ======
const router = useRouter()
const store = useStore()
const username = computed(() => store.state.username)

// ====== 主题相关 ======
const currentTheme = ref(localStorage.getItem('theme') || 'system')
const theme = ref(null)

function applyTheme(value) {
  currentTheme.value = value

  if (value === 'dark') {
    theme.value = naiveDarkTheme
    document.documentElement.classList.add('dark')
    document.documentElement.classList.remove('light')
  } else if (value === 'light') {
    theme.value = null
    document.documentElement.classList.add('light')
    document.documentElement.classList.remove('dark')
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    theme.value = prefersDark ? naiveDarkTheme : null
    document.documentElement.classList.toggle('dark', prefersDark)
    document.documentElement.classList.toggle('light', !prefersDark)
  }

  localStorage.setItem('theme', value)
}

// ====== 弹窗控制 ======
const modalType = ref(null)
const showModal = computed({
  get: () => modalType.value !== null,
  set: (val) => {
    if (!val) modalType.value = null
  },
})

// ====== 根据路径自动打开登录或注册 ======
// 强制用户登陆
if (window.location.pathname === '/login' && !store.state.username) {
  modalType.value = 'login'
} else if (window.location.pathname === '/register' && !store.state.username) {
  modalType.value = 'register'
}

// ====== 登录/注册回调 ======
const handleLoginSuccess = () => {
  modalType.value = null
  router.push('/dashboard')
}

const handleLoginFail = () => {
  modalType.value = 'login'
  username.value = ''
}

const handleRegisterSuccess = () => {
  modalType.value = null
  modalType.value = 'login'
}

const handleRegisterFail = () => {
  modalType.value = 'register'
}

// ====== 下拉菜单处理 ======
const handleDropdownSelect = (key) => {
  if (key === 'logout') {
    store.dispatch('logout')
    window.location.href = '/' // 强制刷新回首页
  } else if (key === 'settings') {
    router.push('/settings/profile')
  }
}

// ====== 初始化 ======
onMounted(() => {
  applyTheme(currentTheme.value)
})
</script>

<template>
  <n-config-provider :theme="theme">
    <header class="navbar">
      <n-space class="nav-links">
        <RouterLink to="/" class="nav-items">Home</RouterLink>
      </n-space>

      <div class="account-actions">
        <template v-if="!username">
          <n-button class="login-button" @click="modalType = 'login'">Login</n-button>
          <n-button class="register-button" @click="modalType = 'register'">Register</n-button>
        </template>

        <template v-else>
          <n-dropdown
            placement="bottom-end"
            trigger="click"
            :options="[
              { label: 'Settings', key: 'settings' },
              { label: 'Logout', key: 'logout' },
            ]"
            @select="handleDropdownSelect"
          >
            <n-button class="account-button">
              <n-avatar round size="small" src="" /> {{ username }}
            </n-button>
          </n-dropdown>
        </template>
      </div>
    </header>

    <!-- 登录/注册弹窗 -->
    <n-message-provider>
      <n-modal
        v-model:show="showModal"
        preset="card"
        :title="modalType === 'login' ? 'Login' : 'Register'"
        :style="{
          width: '90%',
          maxWidth: '500px',
        }"
        :bordered="false"
        size="huge"
        closable
        :mask-closable="false"
      >
        <LoginModal
          v-if="modalType === 'login'"
          @success="handleLoginSuccess"
          @fail="handleLoginFail"
        />
        <RegisterModal
          v-if="modalType === 'register'"
          @success="handleRegisterSuccess"
          @fail="handleRegisterFail"
        />
      </n-modal>
    </n-message-provider>

    <RouterView />
  </n-config-provider>
</template>

<style scoped>
.navbar {
  width: 75%;
  height: 60px;
  margin: 15px auto 0 auto;
  display: flex;
  align-items: center;
}

.account-actions {
  margin-left: auto;
  padding: 5px 10px;
  gap: 10px;
  display: flex;
  align-items: center;
}

.login-button,
.register-button {
  font-size: 1.15rem;
  font-weight: 700;
  border-radius: 5px;
  background-color: transparent;
  line-height: 35px;
  text-align: center;
  color: var(--color-text);
}

.account-button {
  padding: 20px 20px;
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 1.025rem;
  border-radius: 5px;
  background-color: transparent;
}

.n-avatar {
  margin-right: 10px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 15px;
}

.nav-items {
  font-size: 1.15rem;
  font-weight: 700;
  text-align: center;
  color: var(--color-text);
  border-radius: 5px;
  padding: 8px 12px;
  transition: all 0.2s ease;
}

.nav-items:hover {
  color: #409eff;
  transform: translateY(-2px);
}
</style>
