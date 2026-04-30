<template>
  <view class="type-grid">
    <view
      v-for="t in POOP_TYPE_LIST"
      :key="t"
      class="type-item"
      :class="{ selected: modelValue === t }"
      @tap="$emit('update:modelValue', t)"
    >
      <image class="type-icon" :src="POOP_TYPES[t].icon" mode="aspectFit" />
      <text class="type-name">{{ POOP_TYPES[t].name }}</text>
      <text class="type-desc">{{ POOP_TYPES[t].description }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { POOP_TYPES, POOP_TYPE_LIST } from '@/constants'
import type { PoopType } from '@/types'

defineProps<{
  modelValue: PoopType | ''
}>()

defineEmits<{
  'update:modelValue': [value: PoopType]
}>()
</script>

<style scoped>
.type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.type-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 8rpx;
  background: var(--surface-container-lowest);
  border-radius: 24rpx;
  border: 2rpx solid transparent;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}

.type-item.selected {
  border-color: var(--primary);
  background: var(--primary-container);
}

.type-icon {
  width: 44rpx;
  height: 44rpx;
  margin-bottom: 8rpx;
}

.type-name {
  font-size: 24rpx;
  font-weight: 600;
  text-align: center;
  color: var(--on-surface);
}

.type-item.selected .type-name {
  color: var(--on-primary-container);
}

.type-desc {
  font-size: 20rpx;
  color: var(--outline);
  text-align: center;
  margin-top: 4rpx;
}
</style>
