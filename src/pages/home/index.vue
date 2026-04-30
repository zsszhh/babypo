<template>
  <view class="home-page">
    <top-app-bar />

    <main class="home-content" :style="{ paddingTop: contentTop + 'px' }">
      <!-- 问候区 -->
      <section class="welcome-section">
        <view class="welcome-left">
          <view class="baby-avatar">
            <text class="baby-avatar-text">{{ babyStore.activeBaby?.name?.[0] || '?' }}</text>
          </view>
          <view class="welcome-texts">
            <text class="daily-label">每日记录</text>
            <text class="hello-text">你好，{{ authStore.operatorName || '家长' }}</text>
          </view>
        </view>
        <text class="welcome-hint">今天{{ babyStore.activeBaby?.name || '宝宝' }}的便便怎么样？</text>
      </section>

      <!-- Quick Log -->
      <quick-log-card @saved="onQuickLogSaved" />

      <!-- Bento 洞察 -->
      <section class="insight-grid">
        <view class="insight-card insight-card--main">
          <view class="insight-main-left">
            <text class="insight-title">{{ insightTitle }}</text>
            <text class="insight-desc">{{ insightDesc }}</text>
          </view>
          <view class="insight-icon-box">
            <text class="material-symbols-outlined insight-icon">{{ insightIcon }}</text>
          </view>
        </view>
        <view class="insight-card insight-card--small">
          <text class="material-symbols-outlined insight-mini-icon">history</text>
          <text class="insight-mini-label">最近记录</text>
          <text class="insight-mini-value">{{ lastLogTime }}</text>
        </view>
        <view class="insight-card insight-card--small">
          <text class="material-symbols-outlined insight-mini-icon">analytics</text>
          <text class="insight-mini-label">日均次数</text>
          <text class="insight-mini-value">{{ dailyAvg }}</text>
        </view>
      </section>
    </main>

    <!-- FAB -->
    <view class="fab" @tap="goAdd" hover-class="fab-active">
      <text class="material-symbols-outlined fab-icon">add</text>
      <text class="fab-label">记录</text>
    </view>

    <bottom-nav-bar current="home" @switch="handleSwitch" />
  </view>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRecordStore } from '@/stores/record'
import { useBabyStore } from '@/stores/baby'
import { useAuthStore } from '@/stores/auth'
import { syncService } from '@/services/sync'
import { api } from '@/services/api'
import { useStatusBar, useNavSwitch } from '@/composables/useLayout'
import type { StatisticsData } from '@/types'

const recordStore = useRecordStore()
const babyStore = useBabyStore()
const authStore = useAuthStore()
const { contentTop } = useStatusBar()
const { handleSwitch } = useNavSwitch()

const stats = ref<StatisticsData>({
  totalCount: 0,
  avgPerDay: 0,
  typeDistribution: {},
  colorDistribution: {}
})

const lastLogTime = computed(() => {
  const records = recordStore.sortedRecords
  if (records.length === 0) return '暂无'
  const last = new Date(records[0].timestamp)
  const now = new Date()
  const diffH = Math.floor((now.getTime() - last.getTime()) / 3600000)
  if (diffH < 1) return '刚刚'
  if (diffH < 24) return `${diffH} 小时前`
  return `${Math.floor(diffH / 24)} 天前`
})

const dailyAvg = computed(() => {
  if (stats.value.avgPerDay > 0) return `${stats.value.avgPerDay} 次`
  const count = recordStore.sortedRecords.length
  return count > 0 ? `${count} 次` : '0 次'
})

/**
 * 根据统计数据动态生成健康洞察
 */
const insightTitle = computed(() => {
  if (stats.value.totalCount === 0) return '暂无数据'
  const avg = stats.value.avgPerDay
  if (avg >= 1 && avg <= 3) return '状态良好！'
  if (avg > 3) return '频率偏高'
  return '频率偏低'
})

const insightDesc = computed(() => {
  if (stats.value.totalCount === 0) return '添加记录后自动分析'
  const avg = stats.value.avgPerDay
  if (avg >= 1 && avg <= 3) return '排便规律正常'
  if (avg > 3) return '注意观察是否有腹泻'
  return '注意饮食和水分摄入'
})

const insightIcon = computed(() => {
  if (stats.value.totalCount === 0) return 'info'
  const avg = stats.value.avgPerDay
  if (avg >= 1 && avg <= 3) return 'thumb_up'
  return 'warning'
})

onMounted(async () => {
  try {
    await babyStore.fetchBabies()
    await recordStore.fetchRecords(babyStore.activeBabyId)
    syncService.startAutoSync()
    const res = await api.getStatistics(babyStore.activeBabyId, 7)
    stats.value = res.data
  } catch (e) { /* silent */ }
})

function onQuickLogSaved() {
  recordStore.fetchRecords(babyStore.activeBabyId)
}

function goAdd() {
  uni.navigateTo({ url: '/pages/add-record/index' })
}
</script>

<style scoped>
.home-page {
  background: var(--background);
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.home-content {
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 240rpx;
}

/* 问候区 */
.welcome-section {
  margin-bottom: 48rpx;
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 16rpx;
}

.baby-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 3rpx solid var(--primary-container);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-container), var(--primary));
  box-shadow: 0 4rpx 16rpx rgba(59, 105, 76, 0.15);
}

.baby-avatar-text {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--on-primary);
}

.daily-label {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: block;
}

.hello-text {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--on-surface);
  letter-spacing: -0.02em;
  display: block;
}

.welcome-hint {
  font-size: 28rpx;
  color: var(--outline);
  margin-left: 104rpx;
}

/* Bento 洞察 */
.insight-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-top: 32rpx;
}

.insight-card {
  background: var(--surface-container-lowest);
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(191, 201, 196, 0.15);
}

.insight-card--main {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(209, 250, 229, 0.4);
  border-color: rgba(59, 105, 76, 0.15);
}

.insight-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--primary);
  display: block;
}

.insight-desc {
  font-size: 26rpx;
  color: var(--on-surface-variant);
  margin-top: 4rpx;
  display: block;
}

.insight-icon-box {
  width: 80rpx;
  height: 80rpx;
  background: var(--primary);
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.insight-icon {
  color: var(--on-primary);
  font-size: 44rpx;
}

.insight-mini-icon {
  font-size: 36rpx;
  color: var(--primary);
  margin-bottom: 12rpx;
}

.insight-mini-label {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--outline);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: block;
}

.insight-mini-value {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--on-surface);
  margin-top: 8rpx;
  display: block;
}

/* FAB */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 220rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, var(--primary), var(--primary-container));
  color: #fff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-fab);
  z-index: 40;
  transition: transform 0.2s ease;
  border: none;
  cursor: pointer;
}

.fab-active {
  transform: scale(0.92);
}

.fab-icon {
  font-size: 48rpx;
  line-height: 1;
  color: #fff;
}

.fab-label {
  font-size: 20rpx;
  font-weight: 600;
  margin-top: 4rpx;
  opacity: 0.9;
  color: #fff;
}

</style>
