<template>
  <view class="profile-page">
    <top-app-bar />

    <main class="profile-content" :style="{ paddingTop: contentTop + 'px' }">
      <!-- 头像区 -->
      <section class="profile-header">
        <view class="avatar-section">
          <view class="avatar-wrapper">
            <view class="avatar-placeholder">
              <text class="avatar-initial">{{ babyStore.activeBaby?.name?.[0] || '?' }}</text>
            </view>
            <view class="avatar-camera-btn">
              <text class="material-symbols-outlined avatar-camera-icon">photo_camera</text>
            </view>
          </view>
          <text class="profile-name">{{ babyStore.activeBaby?.name || '宝宝' }}</text>
          <view class="profile-age-badge">
            <text class="material-symbols-outlined profile-age-icon">event</text>
            <text class="profile-age-text">{{ ageText }}</text>
          </view>
        </view>
      </section>

      <!-- 信息卡片 -->
      <section class="info-grid">
        <view class="info-card">
          <text class="info-card-label">出生日期</text>
          <text class="info-card-value">{{ birthDateText }}</text>
        </view>
        <view class="info-card info-card--highlight">
          <text class="info-card-label">月龄</text>
          <text class="info-card-value">{{ ageText }}</text>
        </view>
      </section>

      <!-- 设置列表 -->
      <section class="settings-section">
        <text class="settings-section-title">设置</text>
        <view class="settings-list">
          <!-- 每日提醒 -->
          <view class="setting-item" hover-class="setting-item-hover">
            <view class="setting-left">
              <view class="setting-icon-box setting-icon-box--primary">
                <text class="material-symbols-outlined setting-icon">notifications_active</text>
              </view>
              <view class="setting-texts">
                <text class="setting-name">每日提醒</text>
                <text class="setting-desc">6小时未记录时通知</text>
              </view>
            </view>
            <view class="toggle" :class="{ 'toggle--on': remindersOn }" @tap="remindersOn = !remindersOn">
              <view class="toggle-knob" :class="{ 'toggle-knob--on': remindersOn }" />
            </view>
          </view>

          <!-- 导出日志 -->
          <view class="setting-item" hover-class="setting-item-hover" @tap="handleExport">
            <view class="setting-left">
              <view class="setting-icon-box setting-icon-box--secondary">
                <text class="material-symbols-outlined setting-icon">share</text>
              </view>
              <view class="setting-texts">
                <text class="setting-name">导出日志</text>
                <text class="setting-desc">分享给儿科医生</text>
              </view>
            </view>
            <text class="material-symbols-outlined setting-arrow">chevron_right</text>
          </view>

          <!-- 编辑宝宝 -->
          <view class="setting-item" hover-class="setting-item-hover" @tap="handleEditBaby">
            <view class="setting-left">
              <view class="setting-icon-box setting-icon-box--tertiary">
                <text class="material-symbols-outlined setting-icon">edit</text>
              </view>
              <view class="setting-texts">
                <text class="setting-name">编辑宝宝信息</text>
                <text class="setting-desc">修改姓名、出生日期</text>
              </view>
            </view>
            <text class="material-symbols-outlined setting-arrow">chevron_right</text>
          </view>
        </view>
      </section>

      <!-- 退出登录 -->
      <view class="logout-section">
        <button class="logout-btn" @tap="handleLogout" hover-class="logout-btn-hover">
          <text class="material-symbols-outlined logout-icon">logout</text>
          <text>退出登录</text>
        </button>
      </view>

      <!-- 应用版本 -->
      <text class="version-text">v1.0.0</text>
    </main>

    <bottom-nav-bar current="profile" @switch="handleSwitch" />
  </view>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useBabyStore } from '@/stores/baby'
import { useAuthStore } from '@/stores/auth'
import { syncService } from '@/services/sync'
import { formatDate } from '@/utils/date'

const babyStore = useBabyStore()
const authStore = useAuthStore()

// 计算内容区域顶部 padding
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 0
const navBarHeight = 64
const contentTop = ref(statusBarHeight + navBarHeight + 8)

const remindersOn = ref(false)

const birthDateText = computed(() => {
  if (!babyStore.activeBaby?.birthdate) return '—'
  return formatDate(babyStore.activeBaby.birthdate, 'YYYY年M月D日')
})

const ageText = computed(() => {
  if (!babyStore.activeBaby?.birthdate) return '—'
  const now = Date.now()
  const diff = now - babyStore.activeBaby.birthdate
  const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30.44))
  if (months < 1) return '新生儿'
  if (months < 12) return `${months} 个月`
  const years = Math.floor(months / 12)
  const remainMonths = months % 12
  return remainMonths > 0 ? `${years} 岁 ${remainMonths} 个月` : `${years} 岁`
})

onMounted(() => {
  babyStore.fetchBabies()
})

function handleExport() {
  uni.showActionSheet({
    itemList: ['导出 JSON', '导出 CSV'],
    success: (res) => {
      uni.showToast({ title: '导出功能开发中', icon: 'none' })
    }
  })
}

function handleEditBaby() {
  uni.navigateTo({ url: '/pages/baby-manage/index' })
}

function handleLogout() {
  uni.showModal({
    title: '确认退出',
    content: '退出后需要重新连接服务器',
    success: (res) => {
      if (res.confirm) {
        syncService.stopAutoSync()
        authStore.logout()
        uni.reLaunch({ url: '/pages/config/index' })
      }
    }
  })
}

function handleSwitch(key: string) {
  uni.reLaunch({ url: `/pages/${key}/index` })
}
</script>

<style scoped>
.profile-page {
  background: var(--background);
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.profile-content {
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 200rpx;
}

/* 头像区 */
.profile-header {
  margin-bottom: 48rpx;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  position: relative;
  margin-bottom: 24rpx;
}

.avatar-placeholder {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 6rpx solid var(--primary-container);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-container), var(--primary));
  box-shadow: 0 8rpx 32rpx rgba(59, 105, 76, 0.15);
}

.avatar-initial {
  font-size: 64rpx;
  font-weight: 700;
  color: var(--on-primary);
}

.avatar-camera-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 56rpx;
  height: 56rpx;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(59, 105, 76, 0.3);
  border: 3rpx solid var(--surface-container-lowest);
}

.avatar-camera-icon {
  font-size: 28rpx;
  color: var(--on-primary);
}

.profile-name {
  font-size: 44rpx;
  font-weight: 700;
  color: var(--on-surface);
  letter-spacing: -0.02em;
  margin-bottom: 16rpx;
  display: block;
  text-align: center;
}

.profile-age-badge {
  display: inline-flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 24rpx;
  background: rgba(209, 250, 229, 0.5);
  border-radius: 999rpx;
}

.profile-age-icon {
  font-size: 28rpx;
  color: var(--primary);
}

.profile-age-text {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--on-primary-container);
  letter-spacing: 0.02em;
}

/* 信息卡片 */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24rpx;
  margin-bottom: 48rpx;
}

.info-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24rpx;
  background: var(--surface-container-low);
  border-radius: 24rpx;
  border: 1px solid rgba(191, 201, 196, 0.15);
}

.info-card--highlight {
  background: rgba(190, 234, 241, 0.3);
  border-color: rgba(190, 234, 241, 0.4);
}

.info-card-label {
  font-size: 24rpx;
  color: var(--outline);
  display: block;
  margin-bottom: 4rpx;
}

.info-card-value {
  font-size: 28rpx;
  font-weight: 700;
  color: var(--on-surface);
  display: block;
}

/* 设置列表 */
.settings-section {
  margin-bottom: 48rpx;
}

.settings-section-title {
  font-size: 24rpx;
  font-weight: 700;
  color: var(--outline);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  display: block;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}

.settings-list {
  background: var(--surface-container-lowest);
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(191, 201, 196, 0.15);
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1px solid rgba(191, 201, 196, 0.2);
  cursor: pointer;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item-hover {
  background: var(--surface-container-low);
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.setting-icon-box {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.setting-icon-box--primary {
  background: rgba(209, 250, 229, 0.5);
}

.setting-icon-box--secondary {
  background: rgba(211, 232, 214, 0.5);
}

.setting-icon-box--tertiary {
  background: rgba(190, 234, 241, 0.5);
}

.setting-icon {
  font-size: 32rpx;
}

.setting-icon-box--primary .setting-icon {
  color: var(--primary);
}

.setting-icon-box--secondary .setting-icon {
  color: var(--secondary);
}

.setting-icon-box--tertiary .setting-icon {
  color: var(--tertiary);
}

.setting-texts {
  flex: 1;
}

.setting-name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--on-surface);
  display: block;
}

.setting-desc {
  font-size: 24rpx;
  color: var(--outline);
  margin-top: 4rpx;
  display: block;
}

.setting-arrow {
  font-size: 32rpx;
  color: var(--outline-variant);
}

/* 切换开关 */
.toggle {
  width: 88rpx;
  height: 48rpx;
  border-radius: 999rpx;
  background: var(--outline-variant);
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
  cursor: pointer;
}

.toggle--on {
  background: var(--primary);
}

.toggle-knob {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 4rpx;
  left: 4rpx;
  transition: transform 0.2s;
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.15);
}

.toggle-knob--on {
  transform: translateX(40rpx);
}

/* 退出按钮 */
.logout-section {
  margin-bottom: 32rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background: var(--surface-container-lowest);
  border: 2rpx solid rgba(186, 26, 26, 0.2);
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  color: var(--error);
  font-size: 28rpx;
  font-weight: 700;
  cursor: pointer;
}

.logout-btn-hover {
  background: rgba(186, 26, 26, 0.05);
}

.logout-icon {
  font-size: 28rpx;
  color: var(--error);
}

/* 版本号 */
.version-text {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: var(--outline);
}
</style>
