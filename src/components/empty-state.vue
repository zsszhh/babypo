<template>
  <view class="empty-state">
    <view class="empty-icon-wrapper">
      <text class="empty-icon">{{ icon }}</text>
    </view>
    <text class="empty-title">{{ title }}</text>
    <text v-if="desc" class="empty-desc">{{ desc }}</text>
    <slot />
  </view>
</template>

<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  desc?: string
}>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 32rpx;
}

.empty-icon-wrapper {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: var(--surface-container);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}

.empty-icon {
  font-size: 64rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--on-surface);
  margin-bottom: 8rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: var(--outline);
  text-align: center;
}
</style>
