<script setup>
import { onMounted } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

if (store.state.username === null) {
  // 如果用户未登录，重定向到主页或登录页
  window.location.href = '/'
}

onMounted(() => {
  document.title = 'Settings'
})

</script>

<template>
  <div class="settings-container">
    <!-- 左侧导航栏 -->
    <nav class="settings-nav">
      <h2>Settings</h2>
      <ul class="settings-list">
        <li class="settings-item">
          <RouterLink to="/settings/profile" active-class="active">Profile</RouterLink>
        </li>
        <li class="settings-item">
          <RouterLink to="/settings/account" active-class="active">Account</RouterLink>
        </li>
      </ul>
    </nav>

    <n-message-provider>
      <!-- 右侧内容 -->
      <section class="settings-content">
        <RouterView />
      </section>
    </n-message-provider>
  </div>
</template>

<style scoped>
.settings-container {
  display: flex;
  justify-content: center;
  margin-top: 2%;
  gap: 20px;
}

/* 左侧导航栏 */
.settings-nav {
  width: 220px;
  min-height: 80vh;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
  background-color: var(--color-fill-2);
}

.settings-list {
  padding: 0;
  margin-top: 15px;
}

.settings-item {
  list-style: none;
  margin-bottom: 12px;
}

.settings-item > a {
  display: block;
  padding: 8px 12px;
  border-radius: 6px;
  color: var(--color-text);
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.2s;
}

.settings-item > a:hover {
  background-color: var(--color-fill-3);
  color: #409eff;
}

.settings-item > a.active {
  background-color: #409eff;
  color: #fff;
}

/* 右侧内容区域 */
.settings-content {
  flex: 1;
  min-height: 80vh;
  max-width: 50%;
  width: auto;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 20px;
}
</style>
