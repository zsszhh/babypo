<template>
  <view class="add-page">
    <!-- 顶部栏 -->
    <header class="add-header" :style="{ paddingTop: headerTop + 'px' }">
      <view class="header-left" @tap="goBack" hover-class="hover-tap">
        <text class="material-symbols-outlined header-back-icon">arrow_back</text>
      </view>
      <text class="header-title">{{ isEdit ? '编辑记录' : '添加记录' }}</text>
      <view class="header-placeholder" />
    </header>

    <scroll-view class="form-scroll" scroll-y>
      <!-- 时间 -->
      <view class="form-section">
        <text class="section-label">时间</text>
        <picker
          mode="multiSelector"
          :range="dateRange"
          :value="pickerValue"
          @change="onTimeChange"
          @columnchange="onColumnChange"
        >
          <view class="time-picker">
            <view class="time-picker-left">
              <text class="material-symbols-outlined time-icon">schedule</text>
              <text class="time-text">{{ formattedTime }}</text>
            </view>
            <text class="material-symbols-outlined time-arrow">expand_more</text>
          </view>
        </picker>
      </view>

      <!-- 便便类型 -->
      <view class="form-section">
        <text class="section-label">便便类型</text>
        <view class="type-grid">
          <view
            v-for="t in POOP_TYPE_LIST"
            :key="t"
            class="type-card"
            :class="{ 'type-card--active': form.type === t }"
            @tap="form.type = t"
            hover-class="hover-tap"
          >
            <image class="type-icon" :src="POOP_TYPES[t].icon" mode="aspectFit" />
            <text class="type-card-name">{{ POOP_TYPES[t].name }}</text>
            <text class="type-card-desc">{{ POOP_TYPES[t].description }}</text>
          </view>
        </view>
      </view>

      <!-- 颜色 -->
      <view class="form-section">
        <text class="section-label">颜色</text>
        <view class="color-grid">
          <view
            v-for="c in POOP_COLOR_LIST"
            :key="c"
            class="color-chip"
            :class="{ 'color-chip--active': form.color === c }"
            @tap="form.color = form.color === c ? '' : c"
            hover-class="hover-tap"
          >
            <view
              class="color-chip-dot"
              :style="{ backgroundColor: POOP_COLORS[c].color }"
            />
            <text class="color-chip-label">{{ POOP_COLORS[c].name }}</text>
          </view>
        </view>
      </view>

      <!-- 排便量 -->
      <view class="form-section">
        <text class="section-label">排便量</text>
        <view class="amount-row">
          <view
            v-for="a in POOP_AMOUNT_LIST"
            :key="a"
            class="amount-chip"
            :class="{ 'amount-chip--active': form.amount === a }"
            @tap="form.amount = form.amount === a ? '' : a"
            hover-class="hover-tap"
          >
            <text>{{ POOP_AMOUNTS[a].name }}</text>
          </view>
        </view>
      </view>

      <!-- 备注 -->
      <view class="form-section">
        <text class="section-label">备注</text>
        <textarea
          class="note-field"
          v-model="form.note"
          placeholder="添加备注信息..."
          placeholder-style="color: #9CA3AF"
        />
      </view>

      <view style="height: 32rpx" />

      <!-- 保存按钮 -->
      <button
        class="save-btn"
        :class="{ 'save-btn--disabled': !canSave }"
        :disabled="saving || !canSave"
        @tap="handleSave"
      >
        <text v-if="saving">保存中...</text>
        <text v-else>
          <text class="material-symbols-outlined save-icon">check</text>
          保存记录
        </text>
      </button>

      <view style="height: 64rpx" />
    </scroll-view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRecordStore } from '@/stores/record'
import { useBabyStore } from '@/stores/baby'
import { useAuthStore } from '@/stores/auth'
import { POOP_TYPES, POOP_TYPE_LIST, POOP_COLORS, POOP_COLOR_LIST, POOP_AMOUNTS, POOP_AMOUNT_LIST } from '@/constants'
import { formatDateTime, now } from '@/utils/date'
import { syncService, generateLocalId } from '@/services/sync'
import type { PoopType, PoopColor, PoopAmount, PoopRecord } from '@/types'

const recordStore = useRecordStore()
const babyStore = useBabyStore()
const authStore = useAuthStore()

// 计算顶部栏高度（状态栏 + 导航栏）
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 0
const headerTop = ref(statusBarHeight + 12)

const isEdit = ref(false)
const editId = ref<number | null>(null)
const saving = ref(false)

const form = reactive({
  timestamp: now(),
  type: '' as PoopType | '',
  color: '' as PoopColor | '',
  amount: '' as PoopAmount | '',
  note: ''
})

// 日期选择器数据
const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 1 + i)
const months = Array.from({ length: 12 }, (_, i) => i + 1)
const hours = Array.from({ length: 24 }, (_, i) => i)
const minutes = Array.from({ length: 60 }, (_, i) => i)
const dayOptions = ref(Array.from({ length: 31 }, (_, i) => i + 1))

const dateRange = computed(() => [years, months, dayOptions.value, hours, minutes])

const pickerValue = computed(() => {
  const d = new Date(form.timestamp)
  return [
    years.indexOf(d.getFullYear()),
    d.getMonth(),
    Math.min(d.getDate() - 1, dayOptions.value.length - 1),
    d.getHours(),
    d.getMinutes()
  ]
})

// 存储各列当前选择的索引
const selectedIndexes = ref([...pickerValue.value])

function onColumnChange(e: any) {
  const { column, value } = e.detail
  selectedIndexes.value[column] = value
  // 更新 days 列的天数（根据年月计算）
  if (column === 0 || column === 1) {
    const year = years[selectedIndexes.value[0]]
    const month = months[selectedIndexes.value[1]]
    const daysInMonth = new Date(year, month, 0).getDate()
    dayOptions.value = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }
}

function onTimeChange(e: any) {
  const [yi, mi, di, hi, nni] = e.detail.value
  const year = years[yi]
  const month = months[mi]
  const day = dayOptions.value[Math.min(di, dayOptions.value.length - 1)]
  const hour = hours[hi]
  const minute = minutes[nni]
  form.timestamp = new Date(year, month - 1, day, hour, minute).getTime()
}

const formattedTime = computed(() => formatDateTime(form.timestamp))
const canSave = computed(() => form.type && authStore.operatorName)

onMounted(() => {
  const pages = getCurrentPages()
  const page = pages[pages.length - 1] as any
  if (page?.$page?.fullPath) {
    const query = page.$page.fullPath.split('?')[1]
    if (query) {
      const params = new URLSearchParams(query)
      const id = params.get('id')
      if (id) {
        isEdit.value = true
        editId.value = Number(id)
        loadRecord(Number(id))
      }
    }
  }
})

function loadRecord(id: number) {
  const record = [...recordStore.records].find(r => r.id === id)
  if (record) {
    form.timestamp = record.timestamp
    form.type = record.type
    form.color = record.color || ''
    form.amount = record.amount || ''
    form.note = record.note || ''
  }
}

function goBack() {
  uni.navigateBack()
}

async function handleSave() {
  if (!canSave.value) return
  saving.value = true

  const data = {
    babyId: babyStore.activeBabyId,
    timestamp: form.timestamp,
    type: form.type as PoopType,
    color: (form.color || null) as PoopColor | null,
    amount: (form.amount || null) as PoopAmount | null,
    note: form.note || null,
    operatorName: authStore.operatorName
  }

  try {
    if (isEdit.value && editId.value) {
      await recordStore.updateRecord(editId.value, data)
      uni.showToast({ title: '已更新', icon: 'success' })
    } else {
      await recordStore.addRecord(data)
      uni.showToast({ title: '保存成功', icon: 'success' })
    }
    setTimeout(() => uni.navigateBack(), 800)
  } catch (error: any) {
    if (error.message?.includes('网络')) {
      const localId = generateLocalId()
      const localRecord = {
        localId,
        ...data,
        createdAt: now(),
        updatedAt: now(),
        isDeleted: false
      }
      recordStore.addLocalRecord(localRecord as any)
      uni.showToast({ title: '已离线保存', icon: 'success' })
      setTimeout(() => uni.navigateBack(), 800)
    } else {
      uni.showToast({ title: error.message || '保存失败', icon: 'none' })
    }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.add-page {
  min-height: 100vh;
  background: var(--background);
  overflow-x: hidden;
}

/* 顶部栏 */
.add-header {
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

.dark .add-header {
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
  color: var(--on-surface);
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

/* 表单滚动区 */
.form-scroll {
  width: 100%;
  padding: 32rpx 32rpx 0;
  box-sizing: border-box;
  overflow-x: hidden;
}

.form-section {
  margin-bottom: 40rpx;
}

.section-label {
  display: block;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--outline);
  letter-spacing: 0.05em;
  margin-bottom: 16rpx;
}

/* 时间选择器 */
.time-picker {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  background: var(--surface-container-lowest);
  border-radius: 24rpx;
  border: 1px solid rgba(191, 201, 196, 0.15);
  box-shadow: var(--shadow-sm);
}

.time-picker-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.time-icon {
  font-size: 40rpx;
  color: var(--primary);
}

.time-text {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--on-surface);
}

.time-arrow {
  font-size: 36rpx;
  color: var(--outline);
}

/* 类型网格 */
.type-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16rpx;
}

.type-card {
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

.type-card--active {
  border-color: var(--primary);
  background: var(--primary-container);
}

.type-icon {
  width: 48rpx;
  height: 48rpx;
  margin-bottom: 4rpx;
}

.type-card-name {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--on-surface);
  text-align: center;
}

.type-card--active .type-card-name {
  color: var(--on-primary-container);
}

.type-card-desc {
  font-size: 20rpx;
  color: var(--outline);
  text-align: center;
  margin-top: 4rpx;
}

/* 颜色选择 */
.color-grid {
  display: flex;
  gap: 16rpx;
  flex-wrap: wrap;
}

.color-chip {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 18rpx 24rpx;
  background: var(--surface-container-lowest);
  border-radius: 24rpx;
  border: 2rpx solid transparent;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}

.color-chip--active {
  border-color: var(--surface-tint);
  background: var(--surface-container);
}

.color-chip-dot {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  box-shadow: 0 2rpx 6rpx rgba(0,0,0,0.12);
}

.color-chip-label {
  font-size: 28rpx;
  font-weight: 500;
  color: var(--on-surface);
}

/* 排便量 */
.amount-row {
  display: flex;
  gap: 16rpx;
}

.amount-chip {
  flex: 1;
  text-align: center;
  padding: 28rpx 16rpx;
  background: var(--surface-container-lowest);
  border-radius: 24rpx;
  font-size: 28rpx;
  font-weight: 500;
  color: var(--on-surface);
  border: 2rpx solid transparent;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s;
}

.amount-chip--active {
  border-color: var(--primary);
  background: var(--primary-container);
  color: var(--on-primary-container);
  font-weight: 700;
}

/* 备注 */
.note-field {
  width: 100%;
  min-height: 180rpx;
  padding: 24rpx;
  background: var(--surface-container-lowest);
  border-radius: 24rpx;
  border: 1px solid rgba(191, 201, 196, 0.15);
  font-size: 28rpx;
  color: var(--on-surface);
  box-sizing: border-box;
  box-shadow: var(--shadow-sm);
}

/* 保存按钮 */
.save-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, var(--primary), var(--primary-fixed-dim));
  color: var(--on-primary);
  border-radius: 999rpx;
  font-size: 32rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  border: none;
  box-shadow: 0 8rpx 24rpx rgba(59, 105, 76, 0.25);
  transition: all 0.2s;
}

.save-btn:active {
  transform: scale(0.97);
  opacity: 0.9;
}

.save-btn--disabled {
  opacity: 0.45;
  box-shadow: none;
}

.save-icon {
  font-size: 40rpx;
  vertical-align: middle;
}
</style>
