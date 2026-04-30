<template>
  <view class="manage-page">
    <!-- 顶部栏 -->
    <header class="manage-header" :style="{ paddingTop: headerTop + 'px' }">
      <view class="header-left" @tap="goBack" hover-class="hover-tap">
        <text class="material-symbols-outlined header-back-icon">arrow_back</text>
      </view>
      <text class="header-title">宝宝管理</text>
      <view class="header-right" @tap="showAddDialog" hover-class="hover-tap">
        <text class="material-symbols-outlined header-add-icon">add</text>
      </view>
    </header>

    <!-- 宝宝列表 -->
    <view class="baby-list">
      <view v-if="babyStore.babies.length === 0" class="empty-hint">
        <text class="material-symbols-outlined empty-icon">child_care</text>
        <text class="empty-text">还没有添加宝宝</text>
        <text class="empty-sub">点击右上角 + 添加</text>
      </view>
      <view
        class="baby-card"
        v-for="baby in babyStore.babies"
        :key="baby.id"
      >
        <view class="baby-main">
          <view class="baby-avatar">
            <text class="baby-avatar-text">{{ baby.name[0] }}</text>
          </view>
          <view class="baby-info">
            <text class="baby-name">{{ baby.name }}</text>
            <text class="baby-birth">{{ formatDate(baby.birthdate, 'YYYY年M月D日') }}</text>
          </view>
        </view>
        <text class="baby-edit-link" @tap="showEditDialog(baby)" hover-class="hover-tap">编辑</text>
      </view>
    </view>

    <!-- 添加/编辑对话框 -->
    <view class="dialog-overlay" v-if="showDialog" @tap="closeDialog">
      <view class="dialog" @tap.stop>
        <text class="dialog-title">{{ editingBaby ? '编辑宝宝' : '添加宝宝' }}</text>
        <view class="dialog-form">
          <input
            class="dialog-input"
            v-model="dialogForm.name"
            placeholder="宝宝名字"
            placeholder-style="color: #9CA3AF"
          />
          <picker class="dialog-picker" mode="date" @change="onBirthdateChange">
            <view class="dialog-input picker-value">
              <text v-if="dialogForm.birthdateText" class="picker-text">{{ dialogForm.birthdateText }}</text>
              <text v-else class="picker-placeholder">选择出生日期</text>
            </view>
          </picker>
          <view class="gender-row">
            <view
              class="gender-chip"
              :class="{ 'gender-chip--active': dialogForm.gender === 'male' }"
              @tap="dialogForm.gender = 'male'"
              hover-class="hover-tap"
            >男</view>
            <view
              class="gender-chip"
              :class="{ 'gender-chip--active': dialogForm.gender === 'female' }"
              @tap="dialogForm.gender = 'female'"
              hover-class="hover-tap"
            >女</view>
          </view>
        </view>
        <view class="dialog-actions">
          <button class="dialog-btn dialog-btn--cancel" @tap="closeDialog">取消</button>
          <button class="dialog-btn dialog-btn--confirm" @tap="handleSaveBaby">保存</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useBabyStore } from '@/stores/baby'
import { formatDate } from '@/utils/date'
import type { Baby } from '@/types'

const babyStore = useBabyStore()

// 计算顶部栏高度
const systemInfo = uni.getSystemInfoSync()
const statusBarHeight = systemInfo.statusBarHeight || 0
const headerTop = ref(statusBarHeight + 12)

const editingBaby = ref<Baby | null>(null)
const showDialog = ref(false)

const dialogForm = reactive({
  name: '',
  birthdate: '',
  birthdateText: '',
  gender: '' as string
})

function showAddDialog() {
  editingBaby.value = null
  dialogForm.name = ''
  dialogForm.birthdate = ''
  dialogForm.birthdateText = ''
  dialogForm.gender = ''
  showDialog.value = true
}

function showEditDialog(baby: Baby) {
  editingBaby.value = baby
  dialogForm.name = baby.name
  dialogForm.birthdate = formatDate(baby.birthdate, 'YYYY-MM-DD')
  dialogForm.birthdateText = formatDate(baby.birthdate, 'YYYY年M月D日')
  dialogForm.gender = baby.gender || ''
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
}

function onBirthdateChange(e: any) {
  dialogForm.birthdate = e.detail.value
  dialogForm.birthdateText = formatDate(new Date(e.detail.value).getTime(), 'YYYY年M月D日')
}

async function handleSaveBaby() {
  if (!dialogForm.name) {
    uni.showToast({ title: '请输入宝宝名字', icon: 'none' })
    return
  }

  const birthdate = dialogForm.birthdate
    ? new Date(dialogForm.birthdate).getTime()
    : Date.now()

  try {
    if (editingBaby.value) {
      await babyStore.updateBaby(editingBaby.value.id, {
        name: dialogForm.name,
        birthdate,
        gender: dialogForm.gender || undefined
      } as any)
      uni.showToast({ title: '已更新', icon: 'success' })
      closeDialog()
    } else {
      await babyStore.createBaby(dialogForm.name, birthdate, dialogForm.gender)
      uni.showToast({ title: '添加成功', icon: 'success' })
      closeDialog()
    }
  } catch (e: any) {
    uni.showToast({ title: e.message || '操作失败', icon: 'none' })
  }
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.manage-page {
  min-height: 100vh;
  background: var(--background);
}

/* 顶部栏 */
.manage-header {
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

.dark .manage-header {
  background: rgba(46, 49, 47, 0.9);
  border-bottom-color: rgba(65, 73, 66, 0.5);
}

.header-left,
.header-right {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.header-left:active,
.header-right:active {
  background: var(--surface-container);
}

.header-back-icon,
.header-add-icon {
  font-size: 44rpx;
  color: var(--on-surface-variant);
}

.header-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--on-surface);
  letter-spacing: -0.01em;
}

/* 宝宝列表 */
.baby-list {
  padding: 24rpx 32rpx;
}

.empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  color: var(--outline-variant);
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--outline);
  margin-bottom: 8rpx;
}

.empty-sub {
  font-size: 26rpx;
  color: var(--outline-variant);
}

.baby-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  background: var(--surface-container-lowest);
  border-radius: 24rpx;
  margin-bottom: 16rpx;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(191, 201, 196, 0.12);
}

.baby-main {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.baby-avatar {
  width: 88rpx;
  height: 88rpx;
  background: linear-gradient(135deg, var(--primary-container), var(--primary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(59, 105, 76, 0.15);
}

.baby-avatar-text {
  font-size: 40rpx;
  font-weight: 700;
  color: var(--on-primary);
}

.baby-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.baby-name {
  font-size: 34rpx;
  font-weight: 700;
  color: var(--on-surface);
}

.baby-birth {
  font-size: 26rpx;
  color: var(--outline);
  font-weight: 500;
}

.baby-edit-link {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--primary);
  padding: 12rpx 28rpx;
  border-radius: 999rpx;
  background: var(--primary-container);
}

.baby-edit-link:active {
  opacity: 0.7;
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog {
  background: var(--surface-container-lowest);
  border-radius: 40rpx;
  padding: 40rpx 32rpx 32rpx;
  width: 620rpx;
  box-shadow: 0 16rpx 48rpx rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(191, 201, 196, 0.15);
}

.dialog-title {
  font-size: 36rpx;
  font-weight: 700;
  text-align: center;
  margin-bottom: 36rpx;
  display: block;
  color: var(--on-surface);
  letter-spacing: -0.01em;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.dialog-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  background: var(--surface-container-low);
  border: 1px solid rgba(191, 201, 196, 0.15);
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 500;
  color: var(--on-surface);
  box-sizing: border-box;
}

.picker-value {
  display: flex;
  align-items: center;
}

.picker-text {
  color: var(--on-surface);
  font-size: 30rpx;
  font-weight: 500;
}

.picker-placeholder {
  color: #9CA3AF;
  font-size: 30rpx;
}

.gender-row {
  display: flex;
  gap: 16rpx;
}

.gender-chip {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  border: 2rpx solid rgba(191, 201, 196, 0.3);
  border-radius: 20rpx;
  font-size: 30rpx;
  font-weight: 500;
  color: var(--on-surface-variant);
  background: var(--surface-container-low);
  transition: all 0.2s;
}

.gender-chip--active {
  border-color: var(--primary);
  background: var(--primary-container);
  color: var(--on-primary-container);
  font-weight: 700;
}

.dialog-actions {
  display: flex;
  gap: 16rpx;
  margin-top: 36rpx;
}

.dialog-btn {
  flex: 1;
  text-align: center;
  padding: 24rpx;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 600;
  border: none;
}

.dialog-btn--cancel {
  background: var(--surface-container);
  color: var(--on-surface-variant);
}

.dialog-btn--cancel:active {
  opacity: 0.7;
}

.dialog-btn--confirm {
  background: linear-gradient(135deg, var(--primary), var(--primary-fixed-dim));
  color: var(--on-primary);
}

.dialog-btn--confirm:active {
  opacity: 0.85;
}
</style>
