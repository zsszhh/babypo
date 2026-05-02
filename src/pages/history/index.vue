<template>
  <view class="history-page">
    <top-app-bar />

    <main class="history-content" :style="{ paddingTop: contentTop + 'px' }">
      <!-- 标题 -->
      <view class="history-header">
        <text class="history-title">历史记录</text>
      </view>

      <!-- 空状态 -->
      <view v-if="Object.keys(recordStore.groupedByDate).length === 0" class="history-empty">
        <empty-state title="暂无记录" desc="添加第一条记录后，它将出现在这里" />
      </view>

      <!-- 记录列表 -->
      <view v-else class="history-list">
        <view v-for="(records, dateStr) in recentGroupedRecords" :key="dateStr" class="date-group">
          <text class="date-header">{{ getDateLabel(records[0].timestamp) }}</text>

          <view
            v-for="record in records"
            :key="record.id || record.localId"
            class="record-entry"
            @tap="goEdit(record)"
            @longpress="handleRecordAction(record)"
            hover-class="record-entry-hover"
          >
            <!-- 颜色指示条 -->
            <view class="entry-indicator" :style="{ backgroundColor: getConsistencyColor(record.type) }" />

            <view class="entry-body">
              <view class="entry-top">
                <view class="entry-left">
                  <text class="entry-time">{{ formatTime(record.timestamp) }}</text>
                  <text class="entry-type-badge" :class="'entry-type-badge--' + getTypeStatus(record.type)">
                    {{ POOP_TYPES[record.type as PoopType]?.name || '未知' }}
                  </text>
                </view>
                <view
                  v-if="record.color"
                  class="entry-color-dot"
                  :style="{ backgroundColor: POOP_COLORS[record.color as PoopColor]?.color || '#ccc' }"
                />
              </view>

              <text class="entry-consistency">
                质地：<text class="entry-consistency-val">{{ POOP_TYPES[record.type as PoopType]?.description || '—' }}</text>
              </text>

              <view v-if="record.note" class="entry-note">
                <text>{{ record.note }}</text>
              </view>

              <text v-if="record.operatorName" class="entry-operator">记录人：{{ record.operatorName }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 查看全部入口 -->
      <view class="history-footer" @tap="goCalendar" hover-class="history-footer-hover">
        <text class="history-footer-text">
          <text class="material-symbols-outlined footer-icon">calendar_month</text>
          查看全部记录
        </text>
        <text class="material-symbols-outlined footer-arrow">chevron_right</text>
      </view>
    </main>

    <bottom-nav-bar current="history" @switch="handleSwitch" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRecordStore } from '@/stores/record'
import { useBabyStore } from '@/stores/baby'
import { useStatusBar, useNavSwitch } from '@/composables/useLayout'
import { POOP_TYPES, POOP_COLORS } from '@/constants'
import { formatTime, getDateLabel, formatDate } from '@/utils/date'
import type { PoopType, PoopColor } from '@/types'

const recordStore = useRecordStore()
const babyStore = useBabyStore()
const { contentTop } = useStatusBar()
const { handleSwitch } = useNavSwitch()

// 只显示最近10条记录
const recentGroupedRecords = computed(() => {
  const groups: Record<string, any[]> = {}
  let count = 0
  for (const record of recordStore.sortedRecords) {
    if (count >= 10) break
    const key = formatDate(record.timestamp, 'YYYY-MM-DD')
    if (!groups[key]) groups[key] = []
    groups[key].push(record)
    count++
  }
  return groups
})

onMounted(async () => {
  // 先确保 baby 数据已加载
  if (babyStore.babies.length === 0) {
    await babyStore.fetchBabies()
  }
  recordStore.fetchRecords(babyStore.activeBabyId, { limit: 10 })
})

/**
 * 根据布里斯托大便分类法返回对应的颜色值
 */
function getConsistencyColor(type: string): string {
  const map: Record<string, string> = {
    type1: '#707973', type2: '#707973',
    type3: '#506354', type4: '#3b694c',
    type5: '#D97706', type6: '#D97706', type7: '#DC2626'
  }
  return map[type] || '#707973'
}

/**
 * 返回类型标签的状态修饰符（用于 badge 样式）
 */
function getTypeStatus(type: string): string {
  const normal = ['type4', 'type5']
  const caution = ['type6', 'type7']
  if (normal.includes(type)) return 'normal'
  if (caution.includes(type)) return 'caution'
  return 'warning'
}

/**
 * 跳转到编辑页面
 */
function goEdit(record: any) {
  const id = record.id
  if (id) {
    uni.navigateTo({ url: `/pages/add-record/index?id=${id}` })
  }
}

/**
 * 长按记录弹出操作菜单（编辑/删除）
 */
function handleRecordAction(record: any) {
  uni.showActionSheet({
    itemList: ['编辑', '删除'],
    success: (res) => {
      if (res.tapIndex === 0) {
        goEdit(record)
      } else if (res.tapIndex === 1) {
        confirmDelete(record)
      }
    }
  })
}

/**
 * 确认删除弹窗
 */
function confirmDelete(record: any) {
  uni.showModal({
    title: '确认删除',
    content: '删除后可通过同步恢复，确认删除？',
    success: async (res) => {
      if (res.confirm) {
        try {
          if (record.id) {
            await recordStore.deleteRecord(record.id)
          } else if (record.localId) {
            recordStore.removeLocalRecord(record.localId)
          }
          uni.showToast({ title: '已删除', icon: 'success', duration: 1500 })
        } catch (e) {
          uni.showToast({ title: '删除失败', icon: 'error', duration: 1500 })
        }
      }
    }
  })
}

/**
 * 跳转到日历页面
 */
function goCalendar() {
  uni.navigateTo({ url: '/pages/calendar/index' })
}
</script>

<style scoped>
.history-page {
  min-height: 100vh;
  background: var(--background);
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.history-content {
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 200rpx;
}

/* 标题区域 */
.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48rpx;
}

.history-title {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--on-surface);
  letter-spacing: -0.01em;
}

/* 日期分组 */
.date-group {
  margin-bottom: 40rpx;
}

.date-header {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--outline);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: block;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

/* 记录条目卡片 */
.record-entry {
  position: relative;
  background: var(--surface-container-lowest);
  border-radius: 32rpx;
  padding: 32rpx 32rpx 32rpx 48rpx;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(191, 201, 196, 0.15);
  margin-bottom: 20rpx;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.record-entry-hover {
  box-shadow: var(--shadow-base);
}

.entry-indicator {
  position: absolute;
  left: 0;
  top: 0;
  width: 10rpx;
  height: 100%;
}

.entry-body {
  flex: 1;
}

.entry-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12rpx;
}

.entry-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.entry-time {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--on-surface);
}

.entry-type-badge {
  font-size: 20rpx;
  font-weight: 700;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  letter-spacing: 0.02em;
}

.entry-type-badge--normal {
  background: var(--secondary-container);
  color: var(--on-secondary-container);
}

.entry-type-badge--caution {
  background: var(--tertiary-container);
  color: var(--on-tertiary-container);
}

.entry-type-badge--warning {
  background: rgba(217, 119, 6, 0.15);
  color: #92400e;
}

.entry-color-dot {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  border: 4rpx solid var(--surface-container-lowest);
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.entry-consistency {
  font-size: 26rpx;
  color: var(--on-surface-variant);
}

.entry-consistency-val {
  font-weight: 600;
  color: var(--on-surface);
}

.entry-operator {
  font-size: 22rpx;
  display: block;
  color: var(--on-surface-variant);
  margin-top: 12rpx;
}

.entry-note {
  margin-top: 16rpx;
  padding: 16rpx 20rpx;
  background: rgba(190, 234, 241, 0.3);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: var(--on-tertiary-container);
  border: 1px solid rgba(190, 234, 241, 0.4);
  font-style: italic;
}

/* 空状态 */
.history-empty {
  padding-top: 120rpx;
}

/* 底部入口 */
.history-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx 24rpx;
  background: var(--surface-container-lowest);
  border-radius: 24rpx;
  margin-top: 24rpx;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(191, 201, 196, 0.15);
}

.history-footer-hover {
  background: var(--surface-container);
}

.history-footer-text {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 28rpx;
  font-weight: 600;
  color: var(--primary);
}

.footer-icon {
  font-size: 36rpx;
  color: var(--primary);
}

.footer-arrow {
  font-size: 36rpx;
  color: var(--on-surface-variant);
}
</style>
