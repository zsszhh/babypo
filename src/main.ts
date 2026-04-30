import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persistedstate'
import App from './App.vue'

// 全局组件
import SyncStatus from '@/components/sync-status.vue'
import EmptyState from '@/components/empty-state.vue'
import RecordItem from '@/components/record-item.vue'
import TypeSelector from '@/components/type-selector.vue'
import TopAppBar from '@/components/top-app-bar.vue'
import QuickLogCard from '@/components/quick-log-card.vue'
import BottomNavBar from '@/components/bottom-nav-bar.vue'

export function createApp() {
  const app = createSSRApp(App)

  // 注册全局组件
  app.component('sync-status', SyncStatus)
  app.component('empty-state', EmptyState)
  app.component('record-item', RecordItem)
  app.component('type-selector', TypeSelector)
  app.component('top-app-bar', TopAppBar)
  app.component('bottom-nav-bar', BottomNavBar)
  app.component('quick-log-card', QuickLogCard)

  const pinia = createPinia()
  pinia.use(piniaPersist)
  app.use(pinia)
  return { app }
}
