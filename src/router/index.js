import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      children: [
        {
          path: 'profile',
          name: 'settings-profile',
          component: () => import('../views/settings/ProfileView.vue'),
        },
        {
          path: 'account',
          name: 'settings-account',
          component: () => import('../views/settings/AccountView.vue'),
          children: [
            {
              path: 'password',
              name: 'settings-account-password',
              component: () =>
                import('../components/PasswordView.vue'),
            }
          ],
        },
      ],
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    }
  ],
})

export default router
