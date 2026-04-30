<template>
  <view class="app" :class="{ dark: settings.darkMode }">
    <page-meta :page-style="themeStyle" />
    <router-view />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onLaunch } from '@dcloudio/uni-app'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { STORAGE_KEYS } from '@/constants'

const settings = useSettingsStore()
const auth = useAuthStore()

const themeStyle = computed(() => {
  return settings.darkMode
    ? 'background-color: #2e312f; color: #f0f1ef;'
    : 'background-color: #f7faf8; color: #191c1a;'
})

// 应用启动时恢复登录态
onLaunch(() => {
  // 加载 Material Symbols 字体（App 端必须）
  // #ifdef APP-PLUS
  uni.loadFontFace({
    family: 'Material Symbols Outlined',
    source: 'url("/static/fonts/MaterialSymbolsOutlined.ttf")',
    success: () => console.log('字体加载成功'),
    fail: (err: any) => console.error('字体加载失败', err)
  })
  // #endif

  // 恢复登录态（各页面会根据 token 状态自行处理跳转）
  auth.restoreSession()
  console.log('App 启动，登录态:', auth.token ? '已登录' : '未登录')
})

// 全局路由守卫：未登录时禁止访问非登录页
// 注意：这里直接读取 storage，因为拦截器执行时 store 可能还未初始化
const LOGIN_PAGE = '/pages/config/index'
const routeHooks = ['navigateTo', 'redirectTo', 'reLaunch', 'switchTab'] as const
routeHooks.forEach((hook) => {
  uni.addInterceptor(hook, {
    invoke(args: any) {
      const url = typeof args === 'string' ? args : args?.url || ''
      // 白名单：config 页放行
      if (url === LOGIN_PAGE || url.startsWith(LOGIN_PAGE)) return true
      // 未登录则跳转登录页（直接读 storage，避免 store 未初始化问题）
      const token = uni.getStorageSync(STORAGE_KEYS.TOKEN)
      if (!token) {
        uni.reLaunch({ url: LOGIN_PAGE })
        return false
      }
      return true
    }
  })
})
</script>

<style>
/* Material Symbols 字体 - App 端必须本地加载 */
@font-face {
  font-family: 'Material Symbols Outlined';
  src: url('/static/fonts/MaterialSymbolsOutlined.woff2') format('woff2'),
       url('/static/fonts/MaterialSymbolsOutlined.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

:root {
  /* 主色调 */
  --primary: #3b694c;
  --primary-container: #d1fae5;
  --primary-fixed: #beeed0;
  --primary-fixed-dim: #a2d3b2;
  --on-primary: #ffffff;
  --on-primary-container: #002111;

  /* 辅助色 */
  --secondary: #506354;
  --secondary-container: #d3e8d6;
  --on-secondary: #ffffff;
  --on-secondary-container: #0e1f14;

  --tertiary: #3d6469;
  --tertiary-container: #beeaf1;
  --on-tertiary: #ffffff;
  --on-tertiary-container: #001f24;

  /* 表面层级 */
  --surface: #f7faf8;
  --surface-dim: #d8dbd9;
  --surface-bright: #f7faf8;
  --surface-container-lowest: #ffffff;
  --surface-container-low: #f0f7f4;
  --surface-container: #e8f3ee;
  --surface-container-high: #ddebe4;
  --surface-container-highest: #d2e3db;

  /* 文字 */
  --on-surface: #191c1a;
  --on-surface-variant: #414942;
  --on-background: #191c1a;
  --outline: #707973;
  --outline-variant: #bfc9c4;

  /* 背景 */
  --background: #f7faf8;

  /* 错误 */
  --error: #ba1a1a;
  --error-container: #ffdad6;
  --on-error: #ffffff;

  /* 阴影 */
  --shadow-sm: 0 2rpx 8rpx rgba(59, 105, 76, 0.06);
  --shadow-base: 0 4rpx 16rpx rgba(59, 105, 76, 0.08);
  --shadow-lg: 0 8rpx 32rpx rgba(59, 105, 76, 0.1);
  --shadow-fab: 0 8rpx 24rpx rgba(59, 105, 76, 0.3);

  /* 兼容旧 token 名称（过渡期使用） */
  --bg: #f7faf8;
  --card-bg: #ffffff;
  --text-primary: #191c1a;
  --text-secondary: #414942;
  --text-hint: #707973;
  --border: #bfc9c4;

  /* 字体缩放 */
  --font-scale: 1;
}

.dark {
  /* 主色调 */
  --primary: #a2d3b2;
  --primary-container: #1c5c38;
  --primary-fixed: #beeed0;
  --primary-fixed-dim: #a2d3b2;
  --on-primary: #003919;
  --on-primary-container: #d1fae5;

  /* 辅助色 */
  --secondary: #b8ccbc;
  --secondary-container: #394b3d;
  --on-secondary: #223528;
  --on-secondary-container: #d3e8d6;

  --tertiary: #a2ced4;
  --tertiary-container: #234c52;
  --on-tertiary: #04363c;
  --on-tertiary-container: #beeaf1;

  /* 表面层级 */
  --surface: #2e312f;
  --surface-dim: #2e312f;
  --surface-bright: #545755;
  --surface-container-lowest: #292c2a;
  --surface-container-low: #363a38;
  --surface-container: #3a3e3c;
  --surface-container-high: #454947;
  --surface-container-highest: #515452;

  /* 文字 */
  --on-surface: #f0f1ef;
  --on-surface-variant: #bfc9c4;
  --on-background: #f0f1ef;
  --outline: #89938e;
  --outline-variant: #414942;

  /* 背景 */
  --background: #2e312f;

  /* 错误 */
  --error: #ffb4ab;
  --error-container: #93000a;
  --on-error: #690005;

  /* 阴影 */
  --shadow-sm: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
  --shadow-base: 0 4rpx 16rpx rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 8rpx 32rpx rgba(0, 0, 0, 0.4);
  --shadow-fab: 0 8rpx 24rpx rgba(0, 0, 0, 0.5);

  /* 兼容旧 token 名称（过渡期使用） */
  --bg: #2e312f;
  --card-bg: #363a38;
  --text-primary: #f0f1ef;
  --text-secondary: #bfc9c4;
  --text-hint: #89938e;
  --border: #414942;
}

.app {
  min-height: 100vh;
  background: var(--background);
  color: var(--on-surface);
  font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* 统一触控反馈 */
.hover-tap {
  opacity: 0.7;
  transition: opacity 0.15s;
}

/* 统一动画过渡 */
view, text, scroll-view, button, input, textarea {
  transition-property: background-color, border-color, opacity, box-shadow;
  transition-duration: 0.2s;
  transition-timing-function: ease-out;
}

/* 触控目标至少 48rpx（针对块级交互元素） */
button,
.clickable {
  min-width: 48rpx;
  min-height: 48rpx;
}

/* 指针样式（H5） */
@media (hover: hover) {
  button:not(.no-cursor) {
    cursor: pointer;
  }
}

/* 减少动画偏好 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

/* Material Symbols 图标字体 */
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
