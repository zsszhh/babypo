<template>
  <view class="record-item" @tap.stop="handleEdit" @longpress="handleLongPress">
    <view class="record-main">
      <view class="record-type">
        <image class="type-icon" :src="typeInfo?.icon" mode="aspectFit" />
        <text class="type-name">{{ typeInfo?.name }}</text>
      </view>

      <view class="record-details">
        <text class="record-time">{{ formatTime(record.timestamp) }}</text>
        <view class="record-meta">
          <view v-if="record.color" class="color-indicator" :style="{ backgroundColor: colorInfo?.color }" />
          <text v-if="record.amount" class="amount-tag">{{ amountInfo?.name }}</text>
          <text v-if="record.note" class="record-note">{{ record.note }}</text>
        </view>
      </view>
    </view>

    <text class="operator-name">{{ record.operatorName }}</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { POOP_TYPES, POOP_COLORS, POOP_AMOUNTS } from '@/constants'
import { formatTime } from '@/utils/date'
import type { PoopRecord, LocalRecord, PoopType, PoopColor, PoopAmount } from '@/types'

const props = defineProps<{
  record: PoopRecord | LocalRecord
}>()

const emit = defineEmits<{
  edit: [record: PoopRecord | LocalRecord]
  delete: [record: PoopRecord | LocalRecord]
}>()

const typeInfo = computed(() => POOP_TYPES[props.record.type as PoopType])
const colorInfo = computed(() => props.record.color ? POOP_COLORS[props.record.color as PoopColor] : null)
const amountInfo = computed(() => props.record.amount ? POOP_AMOUNTS[props.record.amount as PoopAmount] : null)

function handleEdit() {
  emit('edit', props.record)
}

function handleLongPress() {
  uni.showActionSheet({
    itemList: ['编辑', '删除'],
    success: (res) => {
      if (res.tapIndex === 0) {
        emit('edit', props.record)
      } else if (res.tapIndex === 1) {
        uni.showModal({
          title: '确认删除',
          content: '删除后可通过同步恢复',
          success: (r) => {
            if (r.confirm) emit('delete', props.record)
          }
        })
      }
    }
  })
}
</script>

<style scoped>
.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  background: var(--card-bg);
  border-radius: 24rpx;
  margin-bottom: 12rpx;
  box-shadow: var(--shadow-sm);
  min-height: 88rpx;
  border: 1px solid rgba(191, 201, 196, 0.12);
  transition: box-shadow 0.2s;
}

.record-item:active {
  box-shadow: var(--shadow-base);
}

.record-main {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.record-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80rpx;
}

.type-icon {
  width: 44rpx;
  height: 44rpx;
}

.type-name {
  font-size: 22rpx;
  color: var(--text-hint);
  margin-top: 4rpx;
}

.record-details {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
  flex: 1;
}

.record-time {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--text-primary);
}

.record-meta {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}

.color-indicator {
  width: 20rpx;
  height: 20rpx;
  border-radius: 50%;
}

.amount-tag {
  font-size: 20rpx;
  color: var(--text-secondary);
  background: var(--bg);
  padding: 2rpx 12rpx;
  border-radius: 8rpx;
}

.record-note {
  font-size: 22rpx;
  color: var(--text-hint);
  max-width: 200rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.operator-name {
  font-size: 20rpx;
  color: var(--text-hint);
  margin-left: 16rpx;
  white-space: nowrap;
}
</style>
