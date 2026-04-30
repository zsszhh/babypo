import { ref } from 'vue'

/**
 * 获取状态栏和导航栏高度，用于计算页面内容区域的顶部 padding
 * 适配 App 端（状态栏高度动态获取）和 H5 端
 */
export function useStatusBar() {
  const systemInfo = uni.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight || 0
  const navBarHeight = 64
  const contentTop = ref(statusBarHeight + navBarHeight + 8)
  const headerTop = ref(statusBarHeight + 12)
  return { statusBarHeight, navBarHeight, contentTop, headerTop }
}

/**
 * 底部导航栏页面切换（使用 reLaunch 保证单页面栈）
 */
export function useNavSwitch() {
  function handleSwitch(key: string) {
    uni.reLaunch({ url: `/pages/${key}/index` })
  }
  return { handleSwitch }
}
