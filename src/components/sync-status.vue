<template>
  <view class="sync-status" @tap="handleTap">
    <view class="sync-dot" :class="statusClass" />
    <text class="sync-text">{{ statusText }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useSyncStore } from '@/stores/sync'

const syncStore = useSyncStore()

const statusClass = computed(() => {
  switch (syncStore.status) {
    case 'synced': return 'dot-synced'
    case 'syncing': return 'dot-syncing'
    case 'error': return 'dot-error'
    default: return 'dot-offline'
  }
})

const statusText = computed(() => {
  switch (syncStore.status) {
    case 'synced': return '已同步'
    case 'syncing': return '同步中'
    case 'error': return syncStore.errorMessage || '同步失败'
    default: return '未连接'
  }
})

function handleTap() {
  uni.showToast({ title: statusText.value, icon: 'none' })
}
</script>

<style scoped>
.sync-status {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: var(--surface-container);
  min-width: 44px;
  min-height: 44px;
}

.sync-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
}

.dot-synced {
  background-color: #22C55E;
}

.dot-syncing {
  background-color: #F59E0B;
  animation: pulse 1s ease-in-out infinite;
}

.dot-error {
  background-color: #EF4444;
}

.dot-offline {
  background-color: #9CA3AF;
}

.sync-text {
  font-size: 22rpx;
  color: var(--outline);
  font-weight: 500;
  white-space: nowrap;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
</style>
