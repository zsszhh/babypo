<template>
  <view class="config-page" :style="{ paddingTop: pageTop + 'px' }">
    <!-- Logo 区 -->
    <view class="logo-section">
      <view class="logo-badge">
        <text class="logo-emoji">💩</text>
      </view>
      <text class="logo-title">宝宝排便记录</text>
      <text class="logo-desc">家庭共享 · 离线可用 · 简单易用</text>
    </view>

    <!-- 表单区 -->
    <view class="form-section">
      <!-- 服务器地址 -->
      <view class="field-group">
        <text class="field-label">服务器地址</text>
        <view class="input-wrapper">
          <input
            class="field-input"
            v-model="form.serverUrl"
            placeholder="http://192.168.1.100:3000"
            placeholder-style="color: #9CA3AF"
            type="text"
            @focus="showHistory = true"
            @blur="onUrlBlur"
            @input="onUrlInput"
          />
        </view>
        <view v-if="showHistory && historyUrls.length > 0" class="history-panel">
          <view
            v-for="url in historyUrls"
            :key="url"
            class="history-row"
            @tap="selectHistory(url)"
            hover-class="hover-tap"
          >
            <text class="material-symbols-outlined history-row-icon">history</text>
            <text class="history-row-text">{{ url }}</text>
          </view>
        </view>
      </view>

      <!-- 家庭密码 -->
      <view class="field-group">
        <text class="field-label">家庭密码</text>
        <view class="input-wrapper">
          <input
            class="field-input"
            v-model="form.password"
            placeholder="请输入共享密码"
            placeholder-style="color: #9CA3AF"
            type="password"
          />
        </view>
      </view>

      <!-- 昵称 -->
      <view class="field-group">
        <text class="field-label">您的昵称</text>
        <view class="input-wrapper">
          <input
            class="field-input"
            v-model="form.nickname"
            placeholder="妈妈 / 爸爸 / 奶奶..."
            placeholder-style="color: #9CA3AF"
            type="text"
          />
        </view>
      </view>

      <!-- 连接按钮 -->
      <button
        class="connect-btn"
        :class="{ 'connect-btn--loading': loading }"
        :disabled="loading || !canConnect"
        @tap="handleConnect"
      >
        <text v-if="loading">连接中...</text>
        <text v-else>
          <text class="material-symbols-outlined connect-btn-icon">link</text>
          连 接
        </text>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useAuthStore } from '@/stores/auth'
import { useSyncStore } from '@/stores/sync'
import { syncService } from '@/services/sync'
import { isValidUrl } from '@/utils/validator'
import { STORAGE_KEYS } from '@/constants'

const auth = useAuthStore()
const syncStore = useSyncStore()

// 计算页面顶部 padding（状态栏高度）
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 0
const pageTop = ref(statusBarHeight + 40)

const form = reactive({
  serverUrl: 'http://192.168.31.202:3000',
  password: '',
  nickname: ''
})

const loading = ref(false)
const showHistory = ref(false)
const historyUrls = ref<string[]>([])

const canConnect = computed(() => {
  return form.serverUrl && form.password && form.nickname
})

// 检查登录态并跳转
function checkSessionAndRedirect() {
  const hasSession = auth.restoreSession()
  console.log('config 页面检查登录态:', hasSession, 'token:', auth.token?.substring(0, 10) + '...')

  if (hasSession && auth.token) {
    uni.reLaunch({ url: '/pages/home/index' })
    return true
  }
  return false
}

onMounted(() => {
  // 未登录时，填充历史记录
  if (!checkSessionAndRedirect()) {
    const saved = uni.getStorageSync(STORAGE_KEYS.SERVER_URL)
    if (saved) form.serverUrl = saved

    const savedName = uni.getStorageSync(STORAGE_KEYS.OPERATOR_NAME)
    if (savedName) form.nickname = savedName
  }
})

// 每次页面显示时也检查登录态（处理 App 从后台恢复的情况）
onShow(() => {
  checkSessionAndRedirect()
})

function onUrlInput() {
  loadHistory()
  showHistory.value = true
}

function onUrlBlur() {
  // 延迟关闭让 tap 事件先触发
  setTimeout(() => {
    showHistory.value = false
  }, 200)
}

function loadHistory() {
  try {
    const raw = uni.getStorageSync('babypoop-url-history')
    historyUrls.value = raw ? JSON.parse(raw) : []
  } catch {
    historyUrls.value = []
  }
}

function selectHistory(url: string) {
  form.serverUrl = url
  showHistory.value = false
}

async function handleConnect() {
  if (!isValidUrl(form.serverUrl)) {
    uni.showToast({ title: '请输入有效的服务器地址', icon: 'none' })
    return
  }
  if (form.password.length < 4) {
    uni.showToast({ title: '密码长度不少于4位', icon: 'none' })
    return
  }
  if (!form.nickname) {
    uni.showToast({ title: '请输入您的昵称', icon: 'none' })
    return
  }

  loading.value = true

  try {
    const url = form.serverUrl.replace(/\/+$/, '')
    auth.serverUrl = url
    auth.operatorName = form.nickname
    uni.setStorageSync(STORAGE_KEYS.SERVER_URL, url)
    uni.setStorageSync(STORAGE_KEYS.OPERATOR_NAME, form.nickname)

    await auth.login(form.password)

    saveHistory()
    syncService.startAutoSync()
    syncStore.setStatus('synced')

    uni.showToast({ title: '连接成功', icon: 'success' })
    uni.reLaunch({ url: '/pages/home/index' })
  } catch (error: any) {
    uni.showToast({ title: error.message || '连接失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function saveHistory() {
  loadHistory()
  if (!historyUrls.value.includes(form.serverUrl)) {
    historyUrls.value.unshift(form.serverUrl)
    if (historyUrls.value.length > 5) historyUrls.value.pop()
    uni.setStorageSync('babypoop-url-history', JSON.stringify(historyUrls.value))
  }
}
</script>

<style scoped>
.config-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  padding-left: 48rpx;
  padding-right: 48rpx;
  padding-bottom: 48rpx;
  background: linear-gradient(180deg, var(--surface) 0%, var(--surface-container-lowest) 100%);
}

/* Logo */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 72rpx;
}

.logo-badge {
  width: 140rpx;
  height: 140rpx;
  background: linear-gradient(135deg, var(--primary-fixed), var(--primary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(59, 105, 76, 0.2);
}

.logo-emoji {
  font-size: 72rpx;
}

.logo-title {
  font-size: 48rpx;
  font-weight: 800;
  color: var(--on-surface);
  letter-spacing: -0.02em;
  margin-bottom: 12rpx;
}

.logo-desc {
  font-size: 28rpx;
  color: var(--outline);
  font-weight: 500;
}

/* 表单区 */
.form-section {
  width: 100%;
  max-width: 640rpx;
}

.field-group {
  margin-bottom: 32rpx;
  position: relative;
}

.field-label {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--outline);
  letter-spacing: 0.04em;
  margin-bottom: 12rpx;
}

.input-wrapper {
  background: var(--surface-container-lowest);
  border-radius: 24rpx;
  border: 1px solid rgba(191, 201, 196, 0.15);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.field-input {
  width: 100%;
  height: 96rpx;
  padding: 0 28rpx;
  font-size: 30rpx;
  font-weight: 500;
  color: var(--on-surface);
  box-sizing: border-box;
  background: transparent;
}

/* 历史记录面板 */
.history-panel {
  background: var(--surface-container-lowest);
  border: 1px solid rgba(191, 201, 196, 0.15);
  border-radius: 24rpx;
  margin-top: 12rpx;
  overflow: hidden;
  box-shadow: var(--shadow-base);
  z-index: 10;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 28rpx;
  border-bottom: 1px solid rgba(191, 201, 196, 0.1);
}

.history-row:last-child {
  border-bottom: none;
}

.history-row:active {
  background: var(--surface-container);
}

.history-row-icon {
  font-size: 36rpx;
  color: var(--outline);
}

.history-row-text {
  font-size: 28rpx;
  color: var(--on-surface-variant);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* 连接按钮 */
.connect-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, var(--primary), var(--primary-fixed-dim));
  color: var(--on-primary);
  border-radius: 999rpx;
  font-size: 34rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(59, 105, 76, 0.2);
  transition: all 0.2s;
  margin-top: 48rpx;
}

.connect-btn:active {
  transform: scale(0.97);
  opacity: 0.9;
}

.connect-btn--loading {
  opacity: 0.7;
}

.connect-btn[disabled] {
  opacity: 0.45;
  box-shadow: none;
}

.connect-btn-icon {
  font-size: 40rpx;
  vertical-align: middle;
}
</style>
