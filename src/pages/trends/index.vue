<template>
  <view class="trends-page">
    <top-app-bar />

    <main class="trends-content" :style="{ paddingTop: contentTop + 'px' }">
      <!-- 标题区 -->
      <section class="trends-header">
        <text class="trends-title">便便趋势</text>
        <text class="trends-subtitle">最近 {{ days }} 天洞察</text>
        <view class="days-toggle">
          <view
            class="day-option"
            :class="{ 'day-option--active': days === 7 }"
            @tap="switchDays(7)"
            hover-class="day-option-hover"
          >7天</view>
          <view
            class="day-option"
            :class="{ 'day-option--active': days === 30 }"
            @tap="switchDays(30)"
            hover-class="day-option-hover"
          >30天</view>
        </view>
      </section>

      <!-- 频率摘要 -->
      <view class="freq-card">
        <text class="freq-label">周频率</text>
        <view class="freq-value-row">
          <text class="freq-value">{{ stats.avgPerDay || 0 }}</text>
          <text class="freq-unit">日均次数</text>
        </view>
        <!-- 简易柱状图 -->
        <view class="mini-chart">
          <view v-for="(h, i) in barHeights" :key="i" class="mini-bar-wrap">
            <view
              class="mini-bar"
              :class="{ 'mini-bar--today': barIsToday[i] }"
              :style="{ height: h }"
            />
          </view>
        </view>
        <view class="mini-chart-labels">
          <text v-for="(d, i) in barDayLabels" :key="i" class="mini-chart-label">{{ d }}</text>
        </view>
      </view>

      <!-- 指标卡片 -->
      <view class="metrics-grid">
        <view class="metric-card metric-card--primary">
          <text class="material-symbols-outlined metric-icon">auto_awesome</text>
          <text class="metric-label">一致性</text>
          <text class="metric-value">{{ consistencyLabel }}</text>
        </view>
        <view class="metric-card metric-card--tertiary">
          <text class="material-symbols-outlined metric-icon">water_drop</text>
          <text class="metric-label">水分</text>
          <text class="metric-value">{{ hydrationLabel }}</text>
        </view>
      </view>

      <!-- 颜色分布 -->
      <section class="section">
        <view class="section-header">
          <text class="section-title">常见颜色</text>
          <text class="section-note">最近 {{ stats.totalCount || 0 }} 次记录</text>
        </view>
        <view class="color-card" v-if="hasColorData">
          <view class="color-bar">
            <view
              v-for="(c, index) in colorItems"
              :key="index"
              class="color-bar-seg"
              :style="{ width: c.percent + '%', backgroundColor: c.color }"
            />
          </view>
          <view class="color-list">
            <view v-for="(c, index) in colorItems" :key="index" class="color-row">
              <view class="color-row-left">
                <view class="color-dot" :style="{ backgroundColor: c.color }" />
                <text class="color-name">{{ c.name }}</text>
              </view>
              <text class="color-percent">{{ c.percent }}%</text>
            </view>
          </view>
        </view>
        <empty-state v-else title="暂无数据" desc="添加记录选择颜色后生成" />
      </section>

      <!-- 质地分析 -->
      <section class="section">
        <text class="section-title">质地分析</text>
        <view class="texture-grid" v-if="hasTypeData">
          <view
            v-for="(t, index) in textureItems"
            :key="index"
            class="texture-card"
            :class="{ 'texture-card--active': index === 0 }"
          >
            <view class="texture-icon-box">
              <image class="texture-icon" :src="t.icon" mode="aspectFit" />
            </view>
            <text class="texture-name">{{ t.name }}</text>
            <text class="texture-count">{{ t.count }} 条</text>
          </view>
        </view>
        <empty-state v-else title="暂无数据" desc="记录数据后自动生成" />
      </section>

      <!-- 建议卡片 -->
      <section class="section">
        <view class="advice-card">
          <view class="advice-bg-icon">
            <text class="material-symbols-outlined advice-bg-icon-text">lightbulb</text>
          </view>
          <view class="advice-content">
            <view class="advice-header">
              <text class="material-symbols-outlined advice-icon">verified_user</text>
              <text class="advice-title">儿科建议</text>
            </view>
            <text class="advice-text">{{ adviceText }}</text>
          </view>
        </view>
      </section>
    </main>

    <bottom-nav-bar current="trends" @switch="handleSwitch" />
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useRecordStore } from '@/stores/record'
import { useBabyStore } from '@/stores/baby'
import { api } from '@/services/api'
import { POOP_TYPES, POOP_COLORS } from '@/constants'
import type { StatisticsData, PoopType, PoopColor } from '@/types'

const recordStore = useRecordStore()
const babyStore = useBabyStore()

// 计算内容区域顶部 padding
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 0
const navBarHeight = 64
const contentTop = ref(statusBarHeight + navBarHeight + 8)

const days = ref(7)
const stats = reactive<StatisticsData>({
  totalCount: 0,
  avgPerDay: 0,
  typeDistribution: {},
  colorDistribution: {}
})

const weekDays = ['一', '二', '三', '四', '五', '六', '日']

// 根据实际记录数据计算每日柱状图高度
const barData = computed(() => {
  const now = new Date()
  const result: { count: number; label: string; isToday: boolean }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    const count = recordStore.sortedRecords.filter(r => {
      const t = new Date(r.timestamp)
      return t >= d && t < next
    }).length
    result.push({ count, label: weekDays[6 - i], isToday: i === 0 })
  }
  return result
})

const barHeights = computed(() => {
  const max = Math.max(...barData.value.map(d => d.count), 1)
  return barData.value.map(d => `${Math.round((d.count / max) * 100)}%`)
})

const barDayLabels = computed(() => barData.value.map(d => d.label))

const barIsToday = computed(() => barData.value.map(d => d.isToday))

// 一致性评估：理想类型(type4)占比越高越好
const consistencyLabel = computed(() => {
  const total = Object.values(stats.typeDistribution).reduce((a, b) => a + b, 0)
  if (total === 0) return '暂无'
  const good = stats.typeDistribution['type4'] || 0
  const ratio = good / total
  if (ratio >= 0.6) return '健康'
  if (ratio >= 0.4) return '良好'
  if (ratio >= 0.2) return '一般'
  return '需关注'
})

// 水分评估：水样(type7)占比判断
const hydrationLabel = computed(() => {
  const total = Object.values(stats.typeDistribution).reduce((a, b) => a + b, 0)
  if (total === 0) return '暂无'
  const liquid = (stats.typeDistribution['type6'] || 0) + (stats.typeDistribution['type7'] || 0)
  const ratio = liquid / total
  if (ratio <= 0.15) return '正常'
  if (ratio <= 0.3) return '偏湿'
  return '过湿'
})

// 动态建议
const adviceText = computed(() => {
  const total = stats.totalCount
  if (total === 0) return '暂无记录，添加排便数据后将生成个性化建议。'
  const avg = stats.avgPerDay || 0
  const parts: string[] = []
  if (avg < 1) parts.push('排便频率偏低')
  else if (avg > 5) parts.push('排便频率偏高，请关注是否有腹泻迹象')
  else parts.push('排便频率正常')
  const good = stats.typeDistribution['type4'] || 0
  const ratio = total > 0 ? good / total : 0
  if (ratio >= 0.5) parts.push('便便形态以理想型为主')
  else if (ratio < 0.3) parts.push('建议观察便便形态变化')
  const liquid = (stats.typeDistribution['type6'] || 0) + (stats.typeDistribution['type7'] || 0)
  if (liquid / total > 0.3) parts.push('糊状/水样比例较高，注意补水')
  return parts.join('。') + '。'
})

const hasColorData = computed(() =>
  Object.values(stats.colorDistribution).some(v => v > 0)
)
const hasTypeData = computed(() =>
  Object.values(stats.typeDistribution).some(v => v > 0)
)

const colorItems = computed(() => {
  const total = Object.values(stats.colorDistribution).reduce((a, b) => a + b, 0)
  if (total === 0) return []
  return Object.entries(stats.colorDistribution)
    .map(([key, count]) => {
      const colorInfo = POOP_COLORS[key as PoopColor]
      return {
        name: colorInfo?.name || key,
        color: colorInfo?.color || '#ccc',
        percent: Math.round((count / total) * 100),
        count
      }
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
})

const textureItems = computed(() => {
  const typeNames: Record<string, { name: string; icon: string }> = {
    type4: { name: '成形', icon: '/static/images/poop-type4.png' },
    type5: { name: '软便', icon: '/static/images/poop-type5.png' },
    type6: { name: '糊状', icon: '/static/images/poop-type6.png' },
    type7: { name: '水样', icon: '/static/images/poop-type7.png' }
  }
  return Object.entries(stats.typeDistribution)
    .filter(([_, count]) => count > 0)
    .map(([key, count]) => ({
      key,
      ...(typeNames[key] || { name: POOP_TYPES[key as PoopType]?.name || key, icon: POOP_TYPES[key as PoopType]?.icon || '/static/images/poop-type4.png' }),
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
})

onMounted(() => loadData())

async function loadData() {
  try {
    // 并行加载记录和统计数据
    await Promise.all([
      recordStore.fetchRecords(babyStore.activeBabyId),
      fetchStats()
    ])
  } catch { /* silent */ }
}

async function fetchStats() {
  try {
    const res = await api.getStatistics(babyStore.activeBabyId, days.value)
    Object.assign(stats, res.data)
  } catch {
    uni.showToast({ title: '加载统计失败', icon: 'none' })
  }
}

function switchDays(d: number) {
  days.value = d
  loadData()
}

function handleSwitch(key: string) {
  uni.reLaunch({ url: `/pages/${key}/index` })
}
</script>

<style scoped>
.trends-page {
  background: var(--background);
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.trends-content {
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 200rpx;
}

/* 标题区 */
.trends-header {
  margin-bottom: 48rpx;
}

.trends-title {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--on-surface);
  letter-spacing: -0.01em;
  display: block;
}

.trends-subtitle {
  font-size: 26rpx;
  color: var(--on-surface-variant);
  margin-top: 4rpx;
  display: block;
}

.days-toggle {
  display: flex;
  gap: 16rpx;
  margin-top: 24rpx;
}

.day-option {
  padding: 12rpx 32rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  font-weight: 600;
  background: var(--surface-container-low);
  color: var(--on-surface-variant);
  border: 1px solid rgba(191, 201, 196, 0.3);
  cursor: pointer;
}

.day-option--active {
  background: var(--primary);
  color: var(--on-primary);
  border-color: var(--primary);
}

.day-option-hover {
  opacity: 0.8;
}

/* 频率卡片 */
.freq-card {
  background: var(--surface-container-lowest);
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(191, 201, 196, 0.15);
  margin-bottom: 24rpx;
}

.freq-label {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--outline);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: block;
}

.freq-value-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin: 12rpx 0 24rpx;
}

.freq-value {
  font-size: 56rpx;
  font-weight: 700;
  color: var(--primary);
}

.freq-unit {
  font-size: 26rpx;
  color: var(--on-surface-variant);
}

.mini-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 120rpx;
  padding: 0 8rpx;
}

.mini-bar-wrap {
  width: 40rpx;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  height: 120rpx;
}

.mini-bar {
  width: 100%;
  background: var(--primary-fixed-dim);
  border-radius: 8rpx 8rpx 0 0;
  opacity: 0.6;
  transition: height 0.3s;
  min-height: 8rpx;
}

.mini-bar--today {
  background: var(--primary);
  opacity: 1;
  box-shadow: 0 2rpx 8rpx rgba(59, 105, 76, 0.2);
}

.mini-chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 12rpx;
}

.mini-chart-label {
  font-size: 20rpx;
  font-weight: 700;
  color: var(--outline);
}

/* 指标卡片 */
.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  border-radius: 32rpx;
  text-align: center;
}

.metric-card--primary {
  background: rgba(209, 250, 229, 0.4);
  border: 1px solid rgba(59, 105, 76, 0.15);
}

.metric-card--tertiary {
  background: rgba(190, 234, 241, 0.4);
  border: 1px solid rgba(61, 100, 105, 0.15);
}

.metric-icon {
  font-size: 48rpx;
  margin-bottom: 12rpx;
}

.metric-card--primary .metric-icon {
  color: var(--primary);
}

.metric-card--tertiary .metric-icon {
  color: var(--tertiary);
}

.metric-label {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--outline);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: block;
}

.metric-value {
  font-size: 32rpx;
  font-weight: 700;
  margin-top: 8rpx;
  display: block;
}

.metric-card--primary .metric-value {
  color: var(--on-primary-container);
}

.metric-card--tertiary .metric-value {
  color: var(--on-tertiary-container);
}

/* 通用区块 */
.section {
  margin-bottom: 48rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--on-surface);
}

.section-note {
  font-size: 24rpx;
  color: var(--primary);
  font-weight: 600;
}

/* 颜色卡片 */
.color-card {
  background: var(--surface-container-lowest);
  border-radius: 32rpx;
  padding: 32rpx;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(191, 201, 196, 0.15);
}

.color-bar {
  display: flex;
  height: 48rpx;
  border-radius: 999rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}

.color-bar-seg {
  height: 100%;
  transition: width 0.3s;
}

.color-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.color-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.color-row-left {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.color-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
}

.color-name {
  font-size: 28rpx;
  color: var(--on-surface);
}

.color-percent {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--on-surface-variant);
}

/* 质地网格 */
.texture-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.texture-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24rpx 16rpx;
  background: var(--surface-container-lowest);
  border-radius: 24rpx;
  border: 1px solid rgba(191, 201, 196, 0.15);
  box-shadow: var(--shadow-sm);
}

.texture-card--active {
  background: rgba(209, 250, 229, 0.4);
  border: 2rpx solid var(--primary);
}

.texture-icon-box {
  width: 72rpx;
  height: 72rpx;
  background: var(--surface-container);
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12rpx;
}

.texture-card--active .texture-icon-box {
  background: var(--primary-container);
}

.texture-icon {
  width: 36rpx;
  height: 36rpx;
}

.texture-name {
  font-size: 22rpx;
  font-weight: 700;
  color: var(--outline);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  display: block;
}

.texture-card--active .texture-name {
  color: var(--primary);
}

.texture-count {
  font-size: 26rpx;
  font-weight: 700;
  color: var(--on-surface);
  margin-top: 4rpx;
  display: block;
}

/* 建议卡片 */
.advice-card {
  position: relative;
  background: rgba(209, 250, 229, 0.4);
  border-radius: 32rpx;
  padding: 32rpx;
  border: 1px solid rgba(59, 105, 76, 0.15);
  overflow: hidden;
}

.advice-bg-icon {
  position: absolute;
  top: 16rpx;
  right: 24rpx;
  opacity: 0.1;
}

.advice-bg-icon-text {
  font-size: 128rpx;
  color: var(--primary);
}

.advice-content {
  position: relative;
  z-index: 1;
}

.advice-header {
  display: flex;
  align-items: center;
  gap: 8rpx;
  margin-bottom: 12rpx;
}

.advice-icon {
  font-size: 32rpx;
  color: var(--primary);
}

.advice-title {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.advice-text {
  font-size: 28rpx;
  color: var(--on-primary-container);
  line-height: 1.5;
}
</style>
