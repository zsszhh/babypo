<template>
  <view class="calendar-page">
    <!-- 顶部导航栏 -->
    <header class="calendar-header" :style="{ paddingTop: headerTop + 'px' }">
      <view class="header-left">
        <view class="back-btn" @tap="goBack" hover-class="nav-arrow-hover">
          <text class="material-symbols-outlined">arrow_back</text>
        </view>
      </view>
      <view class="header-center">
        <view class="nav-arrow" @tap="goPrev" hover-class="nav-arrow-hover">
          <text class="material-symbols-outlined">chevron_left</text>
        </view>
        <view class="nav-title" @tap="showPicker = true">
          <text class="title-text">{{ viewMode === 'month' ? `${currentYear}年${currentMonth}月` : `${currentYear}年` }}</text>
          <text class="material-symbols-outlined title-arrow">expand_more</text>
        </view>
        <view class="nav-arrow" @tap="goNext" hover-class="nav-arrow-hover">
          <text class="material-symbols-outlined">chevron_right</text>
        </view>
      </view>
      <view class="header-right">
        <view class="view-toggle">
          <view
            class="toggle-btn"
            :class="{ 'toggle-btn--active': viewMode === 'month' }"
            @tap="viewMode = 'month'"
          >月</view>
          <view
            class="toggle-btn"
            :class="{ 'toggle-btn--active': viewMode === 'year' }"
            @tap="viewMode = 'year'"
          >年</view>
        </view>
      </view>
    </header>

    <!-- 月历视图 -->
    <view v-if="viewMode === 'month'" class="month-view">
      <!-- 星期行 -->
      <view class="weekday-row">
        <text v-for="w in weekdays" :key="w" class="weekday-text">{{ w }}</text>
      </view>

      <!-- 日历网格 -->
      <view class="calendar-grid">
        <view
          v-for="(cell, index) in calendarDays"
          :key="index"
          class="day-cell"
          :class="{
            'day-cell--other': !cell.isCurrentMonth,
            'day-cell--today': cell.isToday,
            'day-cell--selected': selectedDate && isSameDay(cell.date, selectedDate)
          }"
          @tap="selectDate(cell)"
        >
          <text class="day-number">{{ cell.day }}</text>
          <view v-if="getDateRecordCount(cell.date) > 0" class="day-indicator">
            <text class="day-count">{{ getDateRecordCount(cell.date) }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 年历视图 -->
    <scroll-view v-else class="year-view" scroll-y>
      <view class="year-grid">
        <view
          v-for="m in 12"
          :key="m"
          class="month-card"
          @tap="selectMonth(m)"
        >
          <text class="month-card-title">{{ m }}月</text>
          <view class="mini-calendar">
            <view class="mini-weekdays">
              <text v-for="w in miniWeekdays" :key="w" class="mini-weekday">{{ w }}</text>
            </view>
            <view class="mini-grid">
              <view
                v-for="(cell, idx) in getMiniCalendarDays(currentYear, m)"
                :key="idx"
                class="mini-cell"
              >
                <text v-if="cell.isCurrentMonth" class="mini-day">{{ cell.day }}</text>
                <view v-if="cell.isCurrentMonth && hasRecordOnDay(currentYear, m, cell.day)" class="mini-dot" />
              </view>
            </view>
          </view>
          <view class="month-card-footer">
            <text class="month-count">共 {{ getMonthRecordCount(currentYear, m) }} 条</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <!-- 底部导航 -->
    <bottom-nav-bar current="history" @switch="handleSwitch" />

    <!-- 日期详情抽屉 -->
    <view v-if="showDrawer" class="drawer-overlay" @tap="closeDrawer">
      <view class="drawer-panel" @tap.stop>
        <view class="drawer-handle" @tap="closeDrawer">
          <view class="handle-bar" />
        </view>
        <view class="drawer-header">
          <text class="drawer-date">{{ drawerDateText }}</text>
          <text class="drawer-count">共 {{ drawerRecords.length }} 条记录</text>
        </view>
        <scroll-view class="drawer-content" scroll-y>
          <view v-if="drawerRecords.length === 0" class="drawer-empty">
            <text class="material-symbols-outlined empty-icon">event_note</text>
            <text class="empty-text">暂无记录</text>
          </view>
          <view
            v-for="record in drawerRecords"
            :key="record.id"
            class="drawer-record"
            @tap="editRecord(record)"
            @longpress="handleRecordAction(record)"
          >
            <view class="record-time-type">
              <text class="record-time">{{ formatTime(record.timestamp) }}</text>
              <text class="record-type">{{ POOP_TYPES[record.type as PoopType]?.name }}</text>
            </view>
            <view class="record-info">
              <view
                v-if="record.color"
                class="record-color"
                :style="{ backgroundColor: POOP_COLORS[record.color as PoopColor]?.color }"
              />
              <text v-if="record.amount" class="record-amount">{{ POOP_AMOUNTS[record.amount as PoopAmount]?.name }}</text>
            </view>
            <text v-if="record.note" class="record-note">{{ record.note }}</text>
            <text v-if="record.operatorName" class="record-operator">记录人：{{ record.operatorName }}</text>
          </view>
        </scroll-view>
        <view class="drawer-footer">
          <button class="add-btn" @tap="addRecordForDate">
            <text class="material-symbols-outlined">add</text>
            <text>添加记录</text>
          </button>
        </view>
      </view>
    </view>

    <!-- 年月选择器 -->
    <view v-if="showPicker" class="picker-overlay" @tap="showPicker = false">
      <view class="picker-panel" @tap.stop>
        <view class="picker-header">
          <text class="picker-title">选择年月</text>
        </view>
        <picker-view
          class="picker-view"
          :value="pickerValue"
          @change="onPickerChange"
        >
          <picker-view-column>
            <view v-for="y in pickerYears" :key="y" class="picker-item">{{ y }}年</view>
          </picker-view-column>
          <picker-view-column>
            <view v-for="m in 12" :key="m" class="picker-item">{{ m }}月</view>
          </picker-view-column>
        </picker-view>
        <view class="picker-footer">
          <button class="picker-btn" @tap="confirmPicker">确定</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useRecordStore } from '@/stores/record'
import { useBabyStore } from '@/stores/baby'
import { useStatusBar, useNavSwitch } from '@/composables/useLayout'
import { POOP_TYPES, POOP_COLORS, POOP_AMOUNTS } from '@/constants'
import { formatTime, getCalendarMonth, getWeekdayName } from '@/utils/date'
import type { PoopRecord, PoopType, PoopColor, PoopAmount } from '@/types'

const recordStore = useRecordStore()
const babyStore = useBabyStore()
const { headerTop } = useStatusBar()
const { handleSwitch } = useNavSwitch()

const viewMode = ref<'month' | 'year'>('month')
const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth() + 1)
const selectedDate = ref<Date | null>(null)
const showDrawer = ref(false)
const showPicker = ref(false)

const weekdays = ['日', '一', '二', '三', '四', '五', '六']
const miniWeekdays = ['日', '一', '二', '三', '四', '五', '六']

// 年月选择器数据
const currentYearNum = new Date().getFullYear()
const pickerYears = Array.from({ length: 5 }, (_, i) => currentYearNum - 2 + i)
const pickerValue = ref([2, currentMonth.value - 1])

// 月历网格数据
const calendarDays = computed(() => getCalendarMonth(currentYear.value, currentMonth.value))

// 抽屉数据
const drawerRecords = computed(() => {
  if (!selectedDate.value) return []
  return recordStore.getRecordsByDate(selectedDate.value)
})

const drawerDateText = computed(() => {
  if (!selectedDate.value) return ''
  return `${selectedDate.value.getMonth() + 1}月${selectedDate.value.getDate()}日 · ${getWeekdayName(selectedDate.value)}`
})

// 监听视图模式变化，加载对应数据
watch(viewMode, async (mode) => {
  if (mode === 'year') {
    // 加载全年数据
    await recordStore.fetchRecordsByRange(
      babyStore.activeBabyId,
      new Date(currentYear.value, 0, 1).getTime(),
      new Date(currentYear.value, 11, 31, 23, 59, 59).getTime()
    )
  }
})

// 监听月份变化，加载数据
watch([currentYear, currentMonth], async ([year, month]) => {
  if (viewMode.value === 'month') {
    await recordStore.fetchMonthRecords(babyStore.activeBabyId, year, month)
  }
})

onMounted(async () => {
  await recordStore.fetchMonthRecords(babyStore.activeBabyId, currentYear.value, currentMonth.value)
})

onShow(() => {
  // 返回页面时刷新当月数据
  recordStore.clearMonthCache(currentYear.value, currentMonth.value)
  recordStore.fetchMonthRecords(babyStore.activeBabyId, currentYear.value, currentMonth.value)
})

function getDateRecordCount(date: Date): number {
  return recordStore.getRecordsByDate(date).length
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate()
}

function selectDate(cell: { date: Date; isCurrentMonth: boolean }) {
  selectedDate.value = cell.date
  showDrawer.value = true
}

function closeDrawer() {
  showDrawer.value = false
}

function selectMonth(month: number) {
  currentMonth.value = month
  viewMode.value = 'month'
}

function goPrev() {
  if (viewMode.value === 'month') {
    if (currentMonth.value === 1) {
      currentMonth.value = 12
      currentYear.value--
    } else {
      currentMonth.value--
    }
  } else {
    currentYear.value--
  }
}

function goNext() {
  if (viewMode.value === 'month') {
    if (currentMonth.value === 12) {
      currentMonth.value = 1
      currentYear.value++
    } else {
      currentMonth.value++
    }
  } else {
    currentYear.value++
  }
}

function onPickerChange(e: any) {
  pickerValue.value = e.detail.value
}

function confirmPicker() {
  currentYear.value = pickerYears[pickerValue.value[0]]
  currentMonth.value = pickerValue.value[1] + 1
  showPicker.value = false
}

function getMiniCalendarDays(year: number, month: number) {
  return getCalendarMonth(year, month)
}

function hasRecordOnDay(year: number, month: number, day: number): boolean {
  const stats = recordStore.getMonthStats(year, month)
  return stats.dates.includes(day)
}

function getMonthRecordCount(year: number, month: number): number {
  return recordStore.getMonthStats(year, month).count
}

function editRecord(record: PoopRecord) {
  if (record.id) {
    uni.navigateTo({ url: `/pages/add-record/index?id=${record.id}` })
  }
}

/**
 * 长按记录弹出操作菜单
 */
function handleRecordAction(record: PoopRecord) {
  uni.showActionSheet({
    itemList: ['编辑', '删除'],
    success: (res) => {
      if (res.tapIndex === 0) {
        editRecord(record)
      } else if (res.tapIndex === 1) {
        confirmDelete(record)
      }
    }
  })
}

/**
 * 确认删除弹窗
 */
function confirmDelete(record: PoopRecord) {
  uni.showModal({
    title: '确认删除',
    content: '删除后可通过同步恢复，确认删除？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await recordStore.deleteRecord(record.id)
          uni.showToast({ title: '已删除', icon: 'success', duration: 1500 })
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'error', duration: 1500 })
        }
      }
    }
  })
}

function addRecordForDate() {
  if (selectedDate.value) {
    const timestamp = selectedDate.value.getTime()
    uni.navigateTo({ url: `/pages/add-record/index?timestamp=${timestamp}` })
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.calendar-page {
  min-height: 100vh;
  background: var(--background);
  font-family: 'Plus Jakarta Sans', sans-serif;
  overflow-x: hidden;
}

/* 顶部导航栏 */
.calendar-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 24rpx;
  padding-right: 24rpx;
  padding-bottom: 24rpx;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(191, 201, 196, 0.3);
  box-sizing: border-box;
}

.dark .calendar-header {
  background: rgba(46, 49, 47, 0.9);
  border-bottom-color: rgba(65, 73, 66, 0.5);
}

.header-left {
  width: 72rpx;
}

.back-btn {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.back-btn .material-symbols-outlined {
  font-size: 40rpx;
  color: var(--on-surface);
}

.header-center {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex: 1;
  justify-content: center;
}

.header-right {
  width: 140rpx;
  display: flex;
  justify-content: flex-end;
}

.nav-arrow {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.nav-arrow-hover {
  background: var(--surface-container);
}

.nav-arrow .material-symbols-outlined {
  font-size: 36rpx;
  color: var(--on-surface);
}

.nav-title {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 12rpx;
  border-radius: 16rpx;
}

.nav-title:active {
  background: var(--surface-container);
}

.title-text {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--on-surface);
}

.title-arrow {
  font-size: 24rpx;
  color: var(--on-surface-variant);
}

.view-toggle {
  display: flex;
  gap: 4rpx;
  background: var(--surface-container-low);
  padding: 4rpx;
  border-radius: 999rpx;
}

.toggle-btn {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--on-surface-variant);
}

.toggle-btn--active {
  background: var(--primary);
  color: var(--on-primary);
}

/* 月历视图 */
.month-view {
  padding: 220rpx 24rpx 180rpx;
  width: 100%;
  box-sizing: border-box;
}

.weekday-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16rpx;
}

.weekday-text {
  width: 80rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: var(--outline);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6rpx;
  width: 100%;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 16rpx;
  background: var(--surface-container-lowest);
  border: 2rpx solid transparent;
  transition: all 0.2s;
}

.day-cell--other {
  opacity: 0.4;
}

.day-cell--today {
  background: var(--primary-container);
}

.day-cell--selected {
  border-color: var(--primary);
  background: var(--primary-container);
}

.day-number {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--on-surface);
}

.day-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 4rpx;
}

.day-count {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--primary);
}

/* 年历视图 */
.year-view {
  padding: 220rpx 24rpx 180rpx;
  height: 100vh;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

.year-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  width: 100%;
}

.month-card {
  background: var(--surface-container-lowest);
  border-radius: 20rpx;
  padding: 16rpx;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(191, 201, 196, 0.15);
  box-sizing: border-box;
}

.month-card-title {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--on-surface);
  margin-bottom: 8rpx;
  display: block;
  text-align: center;
}

.mini-calendar {
  margin-bottom: 8rpx;
}

.mini-weekdays {
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rpx;
}

.mini-weekday {
  font-size: 14rpx;
  color: var(--outline);
  width: 20rpx;
  text-align: center;
}

.mini-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1rpx;
}

.mini-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.mini-day {
  font-size: 14rpx;
  color: var(--on-surface-variant);
}

.mini-dot {
  width: 6rpx;
  height: 6rpx;
  border-radius: 50%;
  background: var(--primary);
  margin-top: 1rpx;
}

.month-card-footer {
  text-align: center;
  padding-top: 6rpx;
  border-top: 1px solid rgba(191, 201, 196, 0.15);
}

.month-count {
  font-size: 20rpx;
  color: var(--primary);
  font-weight: 600;
}

/* 抽屉 */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.drawer-panel {
  width: 100%;
  max-height: 70vh;
  background: var(--surface-container-lowest);
  border-radius: 40rpx 40rpx 0 0;
  display: flex;
  flex-direction: column;
}

.drawer-handle {
  padding: 20rpx;
  display: flex;
  justify-content: center;
}

.handle-bar {
  width: 80rpx;
  height: 8rpx;
  background: var(--outline);
  border-radius: 4rpx;
}

.drawer-header {
  padding: 0 32rpx 24rpx;
  border-bottom: 1px solid rgba(191, 201, 196, 0.15);
}

.drawer-date {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--on-surface);
  display: block;
}

.drawer-count {
  font-size: 26rpx;
  color: var(--on-surface-variant);
  margin-top: 4rpx;
  display: block;
}

.drawer-content {
  flex: 1;
  padding: 24rpx 32rpx;
  max-height: 50vh;
}

.drawer-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  color: var(--outline);
  margin-bottom: 16rpx;
}

.empty-text {
  font-size: 28rpx;
  color: var(--on-surface-variant);
}

.drawer-record {
  padding: 24rpx;
  background: var(--surface-container-low);
  border-radius: 20rpx;
  margin-bottom: 16rpx;
}

.record-time-type {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 8rpx;
}

.record-time {
  font-size: 30rpx;
  font-weight: 700;
  color: var(--on-surface);
}

.record-type {
  font-size: 24rpx;
  font-weight: 600;
  color: var(--primary);
  background: var(--primary-container);
  padding: 4rpx 12rpx;
  border-radius: 8rpx;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.record-color {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
}

.record-amount {
  font-size: 24rpx;
  color: var(--on-surface-variant);
}

.record-operator {
  font-size: 22rpx;
  color: var(--on-surface-variant);
  margin-top: 8rpx;
}

.record-note {
  font-size: 24rpx;
  color: var(--on-surface-variant);
  font-style: italic;
  background: rgba(190, 234, 241, 0.3);
  padding: 12rpx 16rpx;
  border-radius: 12rpx;
  margin-top: 8rpx;
  display: block;
}

.drawer-footer {
  padding: 24rpx 32rpx 48rpx;
  border-top: 1px solid rgba(191, 201, 196, 0.15);
}

.add-btn {
  width: 100%;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  background: linear-gradient(135deg, var(--primary), var(--primary-fixed-dim));
  color: var(--on-primary);
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  border: none;
}

.add-btn .material-symbols-outlined {
  font-size: 36rpx;
}

/* 年月选择器 */
.picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 100;
  display: flex;
  align-items: flex-end;
}

.picker-panel {
  width: 100%;
  background: var(--surface-container-lowest);
  border-radius: 40rpx 40rpx 0 0;
}

.picker-header {
  padding: 32rpx;
  border-bottom: 1px solid rgba(191, 201, 196, 0.15);
}

.picker-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--on-surface);
}

.picker-view {
  height: 400rpx;
}

.picker-item {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: var(--on-surface);
}

.picker-footer {
  padding: 24rpx 32rpx 48rpx;
}

.picker-btn {
  width: 100%;
  height: 88rpx;
  background: var(--primary);
  color: var(--on-primary);
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 700;
  border: none;
}
</style>
