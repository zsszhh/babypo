<template>
  <view class="settings-page">
    <!-- 顶部栏 -->
    <header class="settings-header" :style="{ paddingTop: headerTop + 'px' }">
      <view class="header-left" @tap="goBack" hover-class="hover-tap">
        <text class="material-symbols-outlined header-back-icon">arrow_back</text>
      </view>
      <text class="header-title">设置</text>
      <view class="header-placeholder" />
    </header>

    <view class="settings-body">
      <!-- 显示 -->
      <view class="setting-group">
        <text class="group-title">显示</text>
        <view class="setting-card">
          <view class="setting-row">
            <text class="setting-label">字体大小</text>
            <view class="font-options">
              <view
                v-for="option in fontOptions"
                :key="option.value"
                class="font-chip"
                :class="{ 'font-chip--active': settings.fontLevel === option.value }"
                @tap="settings.setFontSize(option.value)"
                hover-class="hover-tap"
              >
                <text :style="{ fontSize: option.fontSize + 'px' }">A</text>
              </view>
            </view>
          </view>
          <view class="setting-row setting-row--last">
            <text class="setting-label">深色模式</text>
            <view class="toggle" :class="{ 'toggle--on': settings.darkMode }" @tap="settings.toggleDarkMode()">
              <view class="toggle-knob" :class="{ 'toggle-knob--on': settings.darkMode }" />
            </view>
          </view>
        </view>
      </view>

      <!-- 关于 -->
      <view class="setting-group">
        <text class="group-title">关于</text>
        <view class="setting-card">
          <view class="setting-row">
            <text class="setting-label">应用版本</text>
            <text class="setting-value">v1.0.0</text>
          </view>
          <view class="setting-row setting-row--last" @tap="showServerInfo" hover-class="hover-tap">
            <text class="setting-label">服务器信息</text>
            <view class="setting-link-row">
              <text class="setting-value link">{{ auth.serverUrl ? '已连接' : '未配置' }}</text>
              <text class="material-symbols-outlined setting-arrow">chevron_right</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 退出 -->
      <view class="logout-section">
        <button class="logout-btn" @tap="handleLogout" hover-class="logout-btn-hover">
          <text class="material-symbols-outlined logout-icon">logout</text>
          <text>退出登录</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSettingsStore, type FontSizeLevel } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { syncService } from '@/services/sync'

const settings = useSettingsStore()
const auth = useAuthStore()

// 计算顶部栏高度
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 0
const headerTop = ref(statusBarHeight + 12)

const fontOptions: { value: FontSizeLevel; fontSize: number }[] = [
  { value: 'small', fontSize: 14 },
  { value: 'medium', fontSize: 16 },
  { value: 'large', fontSize: 20 }
]

function goBack() {
  uni.navigateBack()
}

function showServerInfo() {
  const url = auth.serverUrl
  uni.showModal({
    title: '服务器信息',
    content: `服务器地址: ${url || '未配置'}`,
    showCancel: false
  })
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '退出后需要重新连接服务器',
    success: (res) => {
      if (res.confirm) {
        syncService.stopAutoSync()
        auth.logout()
        uni.reLaunch({ url: '/pages/config/index' })
      }
    }
  })
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--background);
}

/* 顶部栏 */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: 20rpx;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(191, 201, 196, 0.3);
  position: sticky;
  top: 0;
  z-index: 10;
}

.dark .settings-header {
  background: rgba(46, 49, 47, 0.9);
  border-bottom-color: rgba(65, 73, 66, 0.5);
}

.header-left {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.header-left:active {
  background: var(--surface-container);
}

.header-back-icon {
  font-size: 44rpx;
  color: var(--on-surface-variant);
}

.header-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--on-surface);
  letter-spacing: -0.01em;
}

.header-placeholder {
  width: 72rpx;
}

/* 设置内容 */
.settings-body {
  padding: 24rpx 32rpx;
}

.setting-group {
  margin-bottom: 36rpx;
}

.group-title {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--outline);
  letter-spacing: 0.05em;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
  display: block;
}

.setting-card {
  background: var(--surface-container-lowest);
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(191, 201, 196, 0.12);
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1px solid rgba(191, 201, 196, 0.1);
}

.setting-row--last {
  border-bottom: none;
}

.setting-label {
  font-size: 30rpx;
  font-weight: 500;
  color: var(--on-surface);
}

.setting-value {
  font-size: 28rpx;
  color: var(--outline);
}

.setting-value.link {
  color: var(--primary);
  font-weight: 500;
}

.setting-link-row {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.setting-arrow {
  font-size: 36rpx;
  color: var(--outline-variant);
}

/* 字体大小选项 */
.font-options {
  display: flex;
  gap: 12rpx;
}

.font-chip {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2rpx solid rgba(191, 201, 196, 0.3);
  background: var(--surface-container-low);
  color: var(--on-surface-variant);
  transition: all 0.2s;
}

.font-chip--active {
  border-color: var(--primary);
  background: var(--primary-container);
  color: var(--on-primary-container);
}

/* 开关 */
.toggle {
  width: 88rpx;
  height: 48rpx;
  border-radius: 999rpx;
  background: var(--surface-container-highest);
  position: relative;
  transition: background 0.2s;
}

.toggle--on {
  background: var(--primary);
}

.toggle-knob {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: #fff;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: transform 0.2s;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.15);
}

.toggle-knob--on {
  transform: translateX(40rpx);
}

/* 退出 */
.logout-section {
  margin-top: 56rpx;
}

.logout-btn {
  width: 100%;
  height: 96rpx;
  background: var(--surface-container-lowest);
  border: 2rpx solid rgba(186, 26, 26, 0.15);
  border-radius: 999rpx;
  color: var(--error);
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  box-shadow: var(--shadow-sm);
}

.logout-btn-hover {
  background: var(--error-container);
}

.logout-icon {
  font-size: 40rpx;
}
</style>
