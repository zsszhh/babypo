<template>
  <view class="ql-card">
    <view class="ql-header">
      <text class="ql-title">快速记录</text>
      <text class="ql-time">{{ currentTime }}</text>
    </view>

    <!-- 颜色选择 -->
    <view class="ql-section">
      <text class="ql-label">便便颜色</text>
      <scroll-view class="ql-colors" scroll-x>
        <view
          v-for="c in colorOptions"
          :key="c.key"
          class="ql-color-btn"
          :class="{ 'ql-color-btn--selected': selectedColor === c.key }"
          :style="{ backgroundColor: c.color }"
          @tap="selectedColor = c.key"
          hover-class="ql-color-hover"
        />
      </scroll-view>
    </view>

    <!-- 质地选择 -->
    <view class="ql-section">
      <text class="ql-label">质地</text>
      <view class="ql-consistencies">
        <view
          v-for="t in consistencyOptions"
          :key="t.key"
          class="ql-cons-item"
          :class="{ 'ql-cons-item--selected': selectedConsistency === t.key }"
          @tap="selectedConsistency = t.key"
          hover-class="ql-cons-hover"
        >
          <image class="ql-cons-icon" :src="t.icon" mode="aspectFit" />
          <text class="ql-cons-name">{{ t.label }}</text>
        </view>
      </view>
    </view>

    <!-- 保存按钮 -->
    <button
      class="ql-save-btn"
      :class="{ 'ql-save-btn--disabled': !canSave }"
      :disabled="!canSave || saving"
      @tap="handleSave"
    >
      <text class="material-symbols-outlined ql-save-icon">add</text>
      <text>{{ saving ? '保存中...' : '保存记录' }}</text>
    </button>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecordStore } from '@/stores/record'
import { useBabyStore } from '@/stores/baby'
import { useAuthStore } from '@/stores/auth'
import { POOP_TYPES, POOP_COLORS, POOP_COLOR_LIST } from '@/constants'
import { now } from '@/utils/date'

const emit = defineEmits<{ saved: [] }>()

const recordStore = useRecordStore()
const babyStore = useBabyStore()
const authStore = useAuthStore()

const saving = ref(false)
const selectedColor = ref('')
const selectedConsistency = ref('')
const currentTime = ref(formatTime(now()))

const colorOptions = POOP_COLOR_LIST.map(key => ({
  key,
  color: POOP_COLORS[key].color,
  name: POOP_COLORS[key].name
}))

const consistencyOptions = [
  { key: 'liquid', icon: POOP_TYPES.type7.icon, label: '水样' },
  { key: 'soft', icon: POOP_TYPES.type6.icon, label: '糊状' },
  { key: 'firm', icon: POOP_TYPES.type4.icon, label: '成形' }
]

const canSave = computed(() => selectedConsistency.value && authStore.operatorName)

function formatTime(ts: number): string {
  const d = new Date(ts)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

async function handleSave() {
  if (!canSave.value) return
  saving.value = true

  const typeMap: Record<string, string> = { liquid: 'type7', soft: 'type6', firm: 'type4' }

  try {
    await recordStore.addRecord({
      babyId: babyStore.activeBabyId,
      timestamp: now(),
      type: typeMap[selectedConsistency.value] || 'type6',
      color: selectedColor.value || null,
      operatorName: authStore.operatorName
    })
    uni.showToast({ title: '保存成功', icon: 'success' })
    selectedColor.value = ''
    selectedConsistency.value = ''
    currentTime.value = formatTime(now())
    emit('saved')
  } catch (e: any) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.ql-card {
  background: var(--surface-container-lowest);
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(59, 105, 76, 0.08);
  border: 1px solid rgba(191, 201, 196, 0.2);
}

.ql-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32rpx;
}

.ql-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--on-surface);
}

.ql-time {
  font-size: 26rpx;
  color: var(--outline);
  font-weight: 600;
}

.ql-section {
  margin-bottom: 32rpx;
}

.ql-label {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--on-surface-variant);
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 16rpx;
}

.ql-colors {
  display: flex;
  gap: 20rpx;
  white-space: nowrap;
  padding-bottom: 8rpx;
}

.ql-color-btn {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  border: 4rpx solid transparent;
  flex-shrink: 0;
  display: inline-block;
  transition: all 0.2s;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08);
}

.ql-color-btn--selected {
  border-color: var(--primary);
  border-width: 6rpx;
  transform: scale(1.1);
}

.ql-color-hover {
  transform: scale(0.9);
}

.ql-consistencies {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.ql-cons-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rpx 16rpx;
  border-radius: 24rpx;
  background: var(--surface-container-low);
  border: 2rpx solid rgba(191, 201, 196, 0.3);
  transition: all 0.2s;
  cursor: pointer;
}

.ql-cons-item--selected {
  background: var(--primary-container);
  border-color: var(--primary);
  border-width: 3rpx;
}

.ql-cons-hover {
  transform: scale(0.95);
}

.ql-cons-icon {
  width: 44rpx;
  height: 44rpx;
  margin-bottom: 8rpx;
}

.ql-cons-name {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--on-surface-variant);
}

.ql-cons-item--selected .ql-cons-name {
  color: var(--primary);
}

.ql-save-btn {
  width: 100%;
  height: 96rpx;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 700;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(59, 105, 76, 0.2);
  transition: all 0.2s;
  cursor: pointer;
}

.ql-save-btn:active {
  transform: scale(0.97);
}

.ql-save-btn--disabled {
  opacity: 0.5;
}

.ql-save-icon {
  font-size: 36rpx;
  color: var(--on-primary);
}
</style>
