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
      :class="{ 'ql-save-btn--disabled': !canSave, 'ql-save-btn--success': showSuccess }"
      :disabled="!canSave || saving"
      @tap="handleSave"
    >
      <view class="ripple-container">
        <view
          v-for="r in ripples"
          :key="r.id"
          class="ripple"
          :style="{ left: r.x + 'px', top: r.y + 'px' }"
        />
      </view>
      <text v-if="showSuccess" class="success-icon">✨</text>
      <text v-else class="material-symbols-outlined ql-save-icon">add</text>
      <text>{{ showSuccess ? '已记录！' : (saving ? '保存中...' : '保存记录') }}</text>
    </button>

    <!-- 粒子效果容器 -->
    <view class="particle-container" v-if="particles.length > 0">
      <view
        v-for="p in particles"
        :key="p.id"
        :class="p.type === 'star' ? 'star' : p.type === 'confetti' ? 'confetti' : 'particle'"
        :style="p.style"
      >
        <template v-if="p.type === 'star'">{{ p.style.content }}</template>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecordStore } from '@/stores/record'
import { useBabyStore } from '@/stores/baby'
import { useAuthStore } from '@/stores/auth'
import { useSaveEffect, useRipple } from '@/composables/useSaveEffect'
import { POOP_TYPES, POOP_COLORS, POOP_COLOR_LIST } from '@/constants'
import { now } from '@/utils/date'

const emit = defineEmits<{ saved: [] }>()

const recordStore = useRecordStore()
const babyStore = useBabyStore()
const authStore = useAuthStore()
const { particles, triggerSaveEffect } = useSaveEffect()
const { ripples, createRipple } = useRipple()

const saving = ref(false)
const showSuccess = ref(false)
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

async function handleSave(e: any) {
  if (!canSave.value) return

  // 创建涟漪效果
  if (e?.x !== undefined && e?.y !== undefined) {
    createRipple({ clientX: e.x, clientY: e.y } as any)
  }

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

    // 显示成功状态和粒子特效
    showSuccess.value = true
    const btnRect = e?.target?.getBoundingClientRect?.()
    if (btnRect) {
      triggerSaveEffect({
        clientX: btnRect.left + btnRect.width / 2,
        clientY: btnRect.top + btnRect.height / 2
      } as any, { type: 'simple' })
    }

    uni.showToast({ title: '保存成功', icon: 'success' })

    // 重置表单
    setTimeout(() => {
      showSuccess.value = false
      selectedColor.value = ''
      selectedConsistency.value = ''
      currentTime.value = formatTime(now())
      emit('saved')
    }, 600)
  } catch (e: any) {
    uni.showToast({ title: e.message || '保存失败', icon: 'none' })
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
/* 穿透 scroll-view 内部元素 */
.ql-colors :deep(.uni-scroll-view-content) {
  padding: 12rpx 0 12rpx 0;
  display: flex;
}

.ql-colors :deep(.uni-scroll-view-content) .ql-color-btn {
  margin-right: 20rpx;
}

.ql-colors :deep(.uni-scroll-view-content) .ql-color-btn:last-child {
  margin-right: 0;
}

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
  padding: 0;
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
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.08), 0 0 0 6rpx var(--primary);
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
  position: relative;
  overflow: hidden;
}

.ql-save-btn:active {
  transform: scale(0.97);
}

.ql-save-btn--disabled {
  opacity: 0.5;
}

.ql-save-btn--success {
  background: linear-gradient(135deg, #1DD1A1, #10AC84);
  animation: success-bounce 0.5s ease-out;
}

@keyframes success-bounce {
  0% { transform: scale(1); }
  30% { transform: scale(1.08); }
  50% { transform: scale(0.95); }
  70% { transform: scale(1.03); }
  100% { transform: scale(1); }
}

.success-icon {
  font-size: 36rpx;
  animation: star-spin 0.5s ease-out;
}

@keyframes star-spin {
  0% { transform: scale(0) rotate(0deg); }
  100% { transform: scale(1) rotate(360deg); }
}

.ql-save-icon {
  font-size: 36rpx;
  color: var(--on-primary);
}

/* 涟漪效果 */
.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

.ripple {
  position: absolute;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  transform: translate(-50%, -50%) scale(0);
  animation: ripple-expand 0.6s ease-out forwards;
}

@keyframes ripple-expand {
  to {
    transform: translate(-50%, -50%) scale(8);
    opacity: 0;
  }
}

/* 粒子效果容器 */
.particle-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 9999;
}

.particle {
  position: absolute;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  animation: particle-fly 0.7s ease-out forwards;
}

@keyframes particle-fly {
  0% {
    opacity: 1;
    transform: translate(0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), var(--ty)) scale(0.2);
  }
}

.confetti {
  position: absolute;
  width: 14rpx;
  height: 14rpx;
  animation: confetti-fall 0.9s ease-out forwards;
}

@keyframes confetti-fall {
  0% {
    opacity: 1;
    transform: translate(0, 0) rotate(0deg);
  }
  100% {
    opacity: 0;
    transform: translate(var(--tx), var(--ty)) rotate(var(--rot));
  }
}

.star {
  position: absolute;
  font-size: 32rpx;
  animation: star-pop 0.5s ease-out forwards;
}

@keyframes star-pop {
  0% {
    opacity: 0;
    transform: scale(0) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    opacity: 0;
    transform: scale(0.6) rotate(360deg);
  }
}
</style>
