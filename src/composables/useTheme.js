import { ref, onMounted, onBeforeUnmount } from 'vue'
import { darkTheme as naiveDarkTheme } from 'naive-ui'

export function useTheme() {
  const currentTheme = ref(localStorage.getItem('theme') || 'system')
  const theme = ref(null)
  let mediaQuery = null

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

  function toggleTheme() {
    if (currentTheme.value === 'light') applyTheme('dark')
    else if (currentTheme.value === 'dark') applyTheme('light')
    else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      applyTheme(prefersDark ? 'light' : 'dark')
    }
  }

  onMounted(() => {
    if (currentTheme.value === 'system') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        applyTheme('system') // 重新根据系统模式应用
      })
    }
  })

  onBeforeUnmount(() => {
    if (mediaQuery) mediaQuery.removeEventListener('change', () => { })
  })

  // 初始化时应用主题
  applyTheme(currentTheme.value)

  return { currentTheme, theme, applyTheme, toggleTheme }
}
