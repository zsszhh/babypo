<template>
  <view class="stats-page">
    <view class="header">
      <text class="back-btn" @tap="goBack">返回</text>
      <text class="header-title">数据统计</text>
      <view class="header-right">
        <text class="export-btn" @tap="showExportMenu" hover-class="hover-tap">导出</text>
      </view>
    </view>

    <!-- 天数切换 -->
    <view class="days-toggle">
      <view
        class="day-option"
        :class="{ active: days === 7 }"
        @tap="switchDays(7)"
        hover-class="hover-tap"
      >近7天</view>
      <view
        class="day-option"
        :class="{ active: days === 30 }"
        @tap="switchDays(30)"
        hover-class="hover-tap"
      >近30天</view>
    </view>

    <!-- 摘要卡片 -->
    <view class="summary-cards">
      <view class="summary-card">
        <text class="summary-value">{{ stats.totalCount }}</text>
        <text class="summary-label">总次数</text>
      </view>
      <view class="summary-card">
        <text class="summary-value">{{ stats.avgPerDay }}</text>
        <text class="summary-label">日均次数</text>
      </view>
    </view>

    <!-- 类型分布 -->
    <view class="chart-section">
      <text class="section-title">类型分布</text>
      <view v-if="hasTypeData" class="bar-chart">
        <view v-for="(count, type) in stats.typeDistribution" :key="type" class="bar-row">
          <text class="bar-label">{{ POOP_TYPES[type as keyof typeof POOP_TYPES]?.name || type }}</text>
          <view class="bar-track">
            <view
              class="bar-fill"
              :style="{ width: getBarPercent(count, maxTypeCount) + '%' }"
            />
          </view>
          <text class="bar-value">{{ count }}</text>
        </view>
      </view>
      <empty-state title="暂无数据" desc="记录数据后自动生成统计" />
    </view>

    <!-- 颜色分布 -->
    <view class="chart-section">
      <text class="section-title">颜色分布</text>
      <view v-if="hasColorData" class="bar-chart">
        <view v-for="(count, color) in stats.colorDistribution" :key="color" class="bar-row">
          <text class="bar-label">{{ POOP_COLORS[color as keyof typeof POOP_COLORS]?.name || color }}</text>
          <view class="bar-track">
            <view
              class="bar-fill color-fill"
              :style="{ width: getBarPercent(count, maxColorCount) + '%', backgroundColor: POOP_COLORS[color as keyof typeof POOP_COLORS]?.color }"
            />
          </view>
          <text class="bar-value">{{ count }}</text>
        </view>
      </view>
      <empty-state v-else title="暂无颜色数据" desc="添加记录时选择颜色后生效" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useBabyStore } from '@/stores/baby'
import { api } from '@/services/api'
import { POOP_TYPES, POOP_COLORS } from '@/constants'
import type { StatisticsData } from '@/types'

const babyStore = useBabyStore()

const days = ref(7)
const stats = reactive<StatisticsData>({
  totalCount: 0,
  avgPerDay: 0,
  typeDistribution: {},
  colorDistribution: {}
})

const maxTypeCount = computed(() => Math.max(1, ...Object.values(stats.typeDistribution)))
const maxColorCount = computed(() => Math.max(1, ...Object.values(stats.colorDistribution)))
const hasTypeData = computed(() => Object.values(stats.typeDistribution).some(v => v > 0))
const hasColorData = computed(() => Object.values(stats.colorDistribution).some(v => v > 0))

onMounted(() => fetchStats())

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
  fetchStats()
}

function getBarPercent(value: number, max: number): number {
  return max > 0 ? (value / max) * 100 : 0
}

function goBack() {
  uni.navigateBack()
}

function showExportMenu() {
  uni.showActionSheet({
    itemList: ['导出 JSON', '导出 CSV'],
    success: (res) => {
      const format = res.tapIndex === 0 ? 'json' : 'csv'
      const url = api.getExportUrl(format)
      uni.downloadFile({
        url,
        success: (downloadRes) => {
          uni.saveFile({
            tempFilePath: downloadRes.tempFilePath,
            success: () => {
              uni.showToast({ title: '导出成功', icon: 'success' })
            }
          })
        }
      })
    }
  })
}
</script>

<style scoped>
.stats-page {
  min-height: 100vh;
  background: var(--bg);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 100rpx 32rpx 24rpx;
  background: var(--bg);
}

.back-btn {
  font-size: calc(28rpx * var(--font-scale));
  font-weight: 500;
  color: var(--primary);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  background: var(--surface);
}

.header-title {
  font-size: calc(36rpx * var(--font-scale));
  font-weight: 600;
}

.export-btn {
  font-size: calc(28rpx * var(--font-scale));
  color: var(--primary);
  padding: 8rpx 16rpx;
  border-radius: 8rpx;
  background: var(--surface);
}

.days-toggle {
  display: flex;
  gap: 16rpx;
  padding: 0 32rpx 24rpx;
}

.day-option {
  padding: 12rpx 32rpx;
  border-radius: 999rpx;
  font-size: calc(28rpx * var(--font-scale));
  background: var(--card-bg);
  color: var(--text-secondary);
  border: 2rpx solid var(--border);
}

.day-option.active {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.summary-cards {
  display: flex;
  gap: 24rpx;
  padding: 0 32rpx 32rpx;
}

.summary-card {
  flex: 1;
  background: var(--card-bg);
  border-radius: 16rpx;
  padding: 32rpx;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.summary-value {
  font-size: calc(48rpx * var(--font-scale));
  font-weight: 700;
  color: var(--primary);
}

.summary-label {
  font-size: calc(24rpx * var(--font-scale));
  color: var(--text-hint);
  margin-top: 8rpx;
}

.chart-section {
  padding: 0 32rpx 32rpx;
}

.section-title {
  font-size: calc(32rpx * var(--font-scale));
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 16rpx;
  display: block;
}

.bar-chart {
  background: var(--card-bg);
  border-radius: 12rpx;
  padding: 24rpx;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-bottom: 16rpx;
}

.bar-label {
  min-width: 120rpx;
  font-size: calc(24rpx * var(--font-scale));
  color: var(--text-secondary);
}

.bar-track {
  flex: 1;
  height: 32rpx;
  background: var(--bg);
  border-radius: 16rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-light), var(--primary));
  border-radius: 16rpx;
  transition: width 0.3s;
}

.color-fill {
  background: var(--primary);
}

.bar-value {
  min-width: 48rpx;
  font-size: calc(24rpx * var(--font-scale));
  font-weight: 600;
  color: var(--text-primary);
  text-align: right;
}
</style>
