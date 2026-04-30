<template>
  <header class="top-app-bar" :style="{ height: navBarHeight + 'px', paddingTop: statusBarHeight + 'px' }">
    <view class="app-bar-content">
      <view class="app-bar-left">
        <text class="app-bar-icon material-symbols-outlined">child_care</text>
        <text class="app-bar-title">TummyTrack</text>
      </view>
      <view class="app-bar-right" @tap="showBabyPicker = true" hover-class="hover-tap">
        <text class="baby-name">{{ babyStore.activeBaby?.name || '选择宝宝' }}</text>
        <text class="material-symbols-outlined baby-arrow">expand_more</text>
      </view>
    </view>
  </header>

  <!-- 宝宝选择器 -->
  <view class="baby-picker-overlay" v-if="showBabyPicker" @tap="showBabyPicker = false">
    <view class="baby-picker" @tap.stop>
      <view class="picker-header">
        <text class="picker-title">切换宝宝</text>
      </view>
      <view
        class="baby-option"
        v-for="baby in babyStore.babies"
        :key="baby.id"
        :class="{ active: baby.id === babyStore.activeBabyId }"
        @tap="switchBaby(baby.id)"
        hover-class="hover-tap"
      >
        <text>{{ baby.name }}</text>
        <text v-if="baby.id === babyStore.activeBabyId" class="check">✓</text>
      </view>
      <view class="baby-option manage" @tap.stop="goBabyManage" hover-class="hover-tap">
        <text>管理宝宝</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useBabyStore } from '@/stores/baby'
import { useRecordStore } from '@/stores/record'

const babyStore = useBabyStore()
const recordStore = useRecordStore()

const showBabyPicker = ref(false)

// 获取状态栏高度，适配 App 端
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 0
// 导航栏内容高度 64px，总高度 = 状态栏 + 64px
const navBarHeight = statusBarHeight + 64

function switchBaby(id: number) {
  babyStore.setActiveBaby(id)
  showBabyPicker.value = false
  recordStore.fetchRecords(id)
}

function goBabyManage() {
  showBabyPicker.value = false
  uni.navigateTo({ url: '/pages/baby-manage/index' })
}
</script>

<style scoped>
.top-app-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(191, 201, 196, 0.3);
  box-sizing: border-box;
}

.dark .top-app-bar {
  background: rgba(46, 49, 47, 0.9);
  border-bottom-color: rgba(65, 73, 66, 0.5);
}

.app-bar-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40rpx 16rpx;
}

.app-bar-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.app-bar-icon {
  color: var(--primary);
  font-size: 48rpx;
}

.app-bar-title {
  font-size: 36rpx;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -0.02em;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.app-bar-right {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 12rpx 24rpx;
  background: var(--primary-container);
  border-radius: 999rpx;
}

.baby-name {
  font-size: 26rpx;
  font-weight: 600;
  color: var(--on-primary-container);
  max-width: 160rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.baby-arrow {
  font-size: 32rpx;
  color: var(--on-primary-container);
}

/* 宝宝选择器 */
.baby-picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: flex-end;
  z-index: 100;
}

.baby-picker {
  width: 100%;
  background: var(--surface-container-lowest);
  border-radius: 32rpx 32rpx 0 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.picker-header {
  padding: 32rpx;
  text-align: center;
  border-bottom: 1px solid var(--outline-variant);
}

.picker-title {
  font-size: 36rpx;
  font-weight: 600;
  color: var(--on-surface);
}

.baby-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 32rpx;
  font-size: 32rpx;
  color: var(--on-surface);
  border-bottom: 1px solid var(--outline-variant);
}

.baby-option.active {
  color: var(--primary);
  font-weight: 600;
}

.baby-option.manage {
  color: var(--outline);
  border-top: 24rpx solid var(--surface-container-low);
}

.check {
  color: var(--primary);
}
</style>
