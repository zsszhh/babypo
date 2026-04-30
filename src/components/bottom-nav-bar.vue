<template>
  <nav class="bottom-nav">
    <view
      v-for="tab in tabs"
      :key="tab.key"
      class="nav-item"
      :class="{ 'nav-item--active': current === tab.key }"
      @tap="handleSwitch(tab.key)"
      hover-class="nav-item-hover"
    >
      <text class="nav-icon material-symbols-outlined">{{ tab.icon }}</text>
      <text class="nav-label">{{ tab.label }}</text>
    </view>
  </nav>
</template>

<script setup lang="ts">
const props = defineProps<{
  current: string
}>()

const emit = defineEmits<{
  switch: [key: string]
}>()

const tabs = [
  { key: 'home', icon: 'home', label: '首页' },
  { key: 'history', icon: 'history', label: '历史' },
  { key: 'trends', icon: 'analytics', label: '趋势' },
  { key: 'profile', icon: 'person', label: '个人' }
]

function handleSwitch(key: string) {
  emit('switch', key)
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 24rpx 32rpx 32rpx;
  background: rgba(247, 250, 248, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(191, 201, 196, 0.3);
  border-radius: 48rpx 48rpx 0 0;
  box-shadow: 0 -8rpx 30rpx rgba(59, 105, 76, 0.06);
  box-sizing: border-box;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12rpx 24rpx;
  color: var(--outline);
  transition: all 0.2s ease;
  border-radius: 32rpx;
  min-width: 120rpx;
}

.nav-item--active {
  color: var(--primary);
  background: var(--primary-container);
}

.nav-item-hover {
  transform: scale(0.9);
}

.nav-icon {
  font-size: 48rpx;
  margin-bottom: 4rpx;
  line-height: 1;
}

.nav-label {
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1.2;
  font-family: 'Plus Jakarta Sans', sans-serif;
}
</style>
