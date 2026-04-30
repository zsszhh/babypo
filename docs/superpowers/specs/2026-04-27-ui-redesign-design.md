---
name: UI Redesign - Lullaby Mint Theme
created: 2026-04-27
status: draft
---

# UI 重设计规范

基于 `stitch_/lullaby_mint` 设计系统，对 Baby Poop Tracker 前端进行全面 UI 重构。

## 1. 设计系统基础

### 1.1 颜色 Token

```css
/* 主色调 - 薄荷绿 */
--primary: #3b694c;
--primary-container: #d1fae5;
--primary-fixed: #beeed0;
--primary-fixed-dim: #a2d3b2;
--on-primary: #ffffff;
--on-primary-container: #002111;
--on-primary-fixed: #002115;
--on-primary-fixed-variant: #224e35;

/* 辅助色 */
--secondary: #506354;
--secondary-container: #d3e8d6;
--secondary-fixed: #d3e8d6;
--secondary-fixed-dim: #b7ccba;
--on-secondary: #ffffff;
--on-secondary-container: #0e1f14;
--on-secondary-fixed: #0e1f14;
--on-secondary-fixed-variant: #384b3d;

--tertiary: #3d6469;
--tertiary-container: #beeaf1;
--tertiary-fixed: #beeaf1;
--tertiary-fixed-dim: #a3ced5;
--on-tertiary: #ffffff;
--on-tertiary-container: #001f24;
--on-tertiary-fixed: #001f24;
--on-tertiary-fixed-variant: #344d51;

/* 表面层级 */
--surface: #f7faf8;
--surface-dim: #d8dbd9;
--surface-bright: #f7faf8;
--surface-container-lowest: #ffffff;
--surface-container-low: #f0f7f4;
--surface-container: #e8f3ee;
--surface-container-high: #ddebe4;
--surface-container-highest: #d2e3db;

/* 文字 */
--on-surface: #191c1a;
--on-surface-variant: #414942;
--on-background: #191c1a;
--outline: #707973;
--outline-variant: #bfc9c4;

/* 背景 */
--background: #f7faf8;
--surface-variant: #dee5e0;
--surface-tint: #3b694c;

/* 反色 */
--inverse-surface: #2e312f;
--inverse-on-surface: #f0f1ef;
--inverse-primary: #a2d3b2;

/* 错误 */
--error: #ba1a1a;
--error-container: #ffdad6;
--on-error: #ffffff;
--on-error-container: #410002;
```

### 1.2 字体系统

**主字体**：Plus Jakarta Sans

| Token | Size | Weight | Line Height | Letter Spacing |
|-------|------|--------|-------------|----------------|
| display-lg | 32px | 700 | 40px | -0.02em |
| headline-md | 24px | 600 | 32px | -0.01em |
| headline-sm | 20px | 600 | 28px | 0 |
| body-lg | 18px | 400 | 28px | 0 |
| body-base | 16px | 400 | 24px | 0 |
| body-sm | 14px | 400 | 20px | 0 |
| label-bold | 12px | 700 | 16px | 0.05em |
| label-medium | 12px | 500 | 16px | 0 |

**图标字体**：Material Symbols Outlined

### 1.3 间距系统

| Token | Value |
|-------|-------|
| xs | 8rpx (4px) |
| base | 16rpx (8px) |
| sm | 24rpx (12px) |
| gutter | 32rpx (16px) |
| margin | 40rpx (20px) |
| md | 48rpx (24px) |
| lg | 80rpx (40px) |

### 1.4 圆角系统

| Token | Value |
|-------|-------|
| sm | 8rpx |
| base | 16rpx |
| md | 24rpx |
| lg | 32rpx |
| xl | 48rpx |
| 2xl | 64rpx |
| full | 9999rpx |

### 1.5 阴影系统

```css
--shadow-sm: 0 2rpx 8rpx rgba(59, 105, 76, 0.06);
--shadow-base: 0 4rpx 16rpx rgba(59, 105, 76, 0.08);
--shadow-lg: 0 8rpx 32rpx rgba(59, 105, 76, 0.1);
--shadow-fab: 0 8rpx 24rpx rgba(59, 105, 76, 0.3);
--shadow-nav: 0 -8rpx 30rpx rgba(59, 105, 76, 0.06);
```

---

## 2. 公共组件

### 2.1 顶部导航栏 (TopAppBar)

```
┌─────────────────────────────────────────────┐
│  [👶] TummyTrack                    [🔔]   │
└─────────────────────────────────────────────┘
```

- **位置**：固定顶部，z-index: 50
- **高度**：128rpx（含状态栏 44px + 内容 64rpx）
- **背景**：`#ffffff / 80%` + `backdrop-filter: blur(10px)`
- **底部边框**：`1px solid outline-variant/30`
- **左侧**：child_care 图标 (primary) + 标题 "TummyTrack"
- **右侧**：通知按钮（圆形，点击区域 80rpx）

### 2.2 底部导航栏 (BottomNavBar)

```
┌─────────────────────────────────────────────┐
│   🏠        📋        📊        👤        │
│  首页      历史      趋势      个人       │
└─────────────────────────────────────────────┘
```

- **位置**：固定底部，z-index: 50
- **高度**：120rpx + safe-area-inset-bottom
- **背景**：`surface / 90%` + `backdrop-filter: blur(12px)`
- **顶部圆角**：`48rpx`
- **顶部边框**：`1px solid outline-variant/30`
- **阴影**：`shadow-nav`
- **每个入口**：
  - 图标 + 文字标签
  - 间距：padding 24rpx
  - 非选中：`outline` 颜色
  - 选中：`primary-container` 背景 + `primary` 颜色 + 圆角 `32rpx`

### 2.3 卡片组件 (Card)

- **背景**：`surface-container-lowest`
- **圆角**：`24rpx` ~ `48rpx`
- **内边距**：`gutter` (32rpx)
- **阴影**：`shadow-sm`
- **边框**：`1px solid outline-variant / 10%`

### 2.4 FAB 浮动按钮

- **位置**：`right: 32rpx; bottom: 200rpx`
- **尺寸**：`120rpx` 圆形
- **背景**：`linear-gradient(135deg, primary, primary-dark)`
- **颜色**：白色
- **阴影**：`shadow-fab`
- **内容**：`+` 图标 + "记录" 文字
- **交互**：点击缩放 0.95

### 2.5 标签徽章 (Chip/Badge)

- **圆角**：`full`
- **内边距**：`8rpx 24rpx`
- **背景**：`primary-container / 40%`
- **文字**：`label-bold` + `on-primary-container`

---

## 3. 页面设计

### 3.1 首页 (Home)

**结构**：
```
┌─────────────────────────────────────┐
│           TopAppBar                 │
├─────────────────────────────────────┤
│  👶 头像                             │
│  DAILY TRACKER                      │
│  Hello, [宝宝名]                     │
│  [宝宝]今天的便便怎么样？             │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ Quick Log          10:45 AM │    │
│  │ STOOL COLOR                 │    │
│  │ ⚫ ⚫ ⚫ ⚫ ⚫ ⚫              │    │
│  │ CONSISTENCY                 │    │
│  │ [水滴] [云朵✓] [六边形]      │    │
│  │ [   + SAVE ENTRY   ]        │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ Looking Good!     👍       │    │
│  │ 宝宝消化正常               │    │
│  └─────────────────────────────┘    │
│  ┌──────────┐  ┌──────────┐        │
│  │ LAST LOG │  │ DAILY AVG│        │
│  │   3h ago │  │  4 times │        │
│  └──────────┘  └──────────┘        │
├─────────────────────────────────────┤
│              FAB                    │
├─────────────────────────────────────┤
│          BottomNavBar               │
└─────────────────────────────────────┘
```

**功能**：
- 欢迎区：宝宝头像（可点击切换）、问候语
- Quick Log 卡片：快速选择颜色 + 质地，一键保存
- Bento Grid 洞察卡片：健康状态提示 / 最后记录时间 / 日均次数
- FAB：跳转完整添加记录页面

### 3.2 历史记录页 (History)

**结构**：
```
┌─────────────────────────────────────┐
│           TopAppBar                 │
├─────────────────────────────────────┤
│  History          [筛选] [日历]     │
│  ┌─────────────────────────────┐    │
│  │  Mon  Tue  Wed  Thu  Fri    │    │
│  │  12   13  [14]  15   16     │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  TODAY, OCT 14                     │
│  ┌─────────────────────────────┐    │
│  │█ 09:45 AM  [Normal]   ⚫    │    │
│  │  Soft / Paste-like         │    │
│  │  [🍽️ Post-Breakfast]       │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │▓ 02:15 PM  [Caution]  ⚫    │    │
│  │  Liquid / Runny            │    │
│  │  "Small amount, watery"    │    │
│  └─────────────────────────────┘    │
│  YESTERDAY, OCT 13                 │
│  ...                               │
├─────────────────────────────────────┤
│          BottomNavBar               │
└─────────────────────────────────────┘
```

**功能**：
- 周视图日期选择器
- 时间线式记录列表
- 每条记录左侧有颜色指示条
- 点击记录可编辑/删除
- FAB 在此页面也显示

### 3.3 数据统计页 (Trends)

**结构**：
```
┌─────────────────────────────────────┐
│           TopAppBar                 │
├─────────────────────────────────────┤
│  Stool Trends                       │
│  Insights for the last 7 days       │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ WEEKLY FREQUENCY            │    │
│  │   2.4 avg logs/day          │    │
│  │  ▁▂▃▅▄▂▆ (bar chart)       │    │
│  │  Mon Tue Wed Thu Fri Sat Sun│    │
│  └─────────────────────────────┘    │
│  ┌──────────┐  ┌──────────┐        │
│  │✨        │  │💧        │        │
│  │Consistency│  │Hydration │        │
│  │ Healthy  │  │ Optimal  │        │
│  └──────────┘  └──────────┘        │
├─────────────────────────────────────┤
│  Common Colors          Last 30 Logs│
│  ████████████████ (color bar)      │
│  ⚫ Mustard Yellow    45%          │
│  ⚫ Golden Tan        30%          │
│  ⚫ Deep Brown        15%          │
├─────────────────────────────────────┤
│  Texture Analysis                  │
│  [☁️ Soft  18] [💧 Liquid  4] [▪️ Firm  2] │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │ 💡 Pediatrician Note        │    │
│  │ 宝宝排便正常，无异常指标     │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│          BottomNavBar               │
└─────────────────────────────────────┘
```

**功能**：
- 频率摘要卡片 + 柱状图
- 一致性/水分状态指示
- 颜色分布条形图
- 质地分析网格
- 儿科建议卡片

### 3.4 个人资料页 (Profile)

**结构**：
```
┌─────────────────────────────────────┐
│           TopAppBar                 │
├─────────────────────────────────────┤
│         ┌─────┐                     │
│         │ 👶  │ [📷]               │
│         └─────┘                     │
│         Leo Archer                  │
│        [📅 6 Months Old]            │
├─────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐        │
│  │ Born     │  │ Weight   │        │
│  │Oct 12,23 │  │ 18.5 lbs │        │
│  └──────────┘  └──────────┘        │
├─────────────────────────────────────┤
│  Settings                          │
│  ┌─────────────────────────────┐    │
│  │ 🔔 Daily Reminders    [===○]│    │
│  ├─────────────────────────────┤    │
│  │ ↗️ Export Logs           >  │    │
│  ├─────────────────────────────┤    │
│  │ 👥 Co-Parent Access      +  │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐    │
│  │    🚪 Log Out              │    │
│  └─────────────────────────────┘    │
├─────────────────────────────────────┤
│          BottomNavBar               │
└─────────────────────────────────────┘
```

**功能**：
- 宝宝头像（可更换）+ 基本信息
- 出生信息卡片 + 体重卡片
- 设置列表：每日提醒开关 / 导出日志 / 共享访问
- 退出登录按钮

### 3.5 其他页面

**配置页**：
- 使用相同设计 token
- 服务器地址输入框 + 连接按钮
- 操作员姓名输入

**宝宝管理页**：
- 宝宝卡片列表
- 添加/编辑对话框
- 保持现有功能，应用新样式

**设置页**：
- 字体大小选择器
- 深色模式开关（保留现有功能）
- 版本信息
- 退出登录

**添加记录页**：
- 保持现有表单结构
- 应用新设计 token
- 顶部导航栏返回按钮
- 底部保存按钮

---

## 4. 技术实现

### 4.1 文件结构

```
src/
├── assets/
│   └── fonts/
│       ├── PlusJakartaSans-Regular.ttf
│       ├── PlusJakartaSans-Medium.ttf
│       ├── PlusJakartaSans-SemiBold.ttf
│       ├── PlusJakartaSans-Bold.ttf
│       └── MaterialSymbolsOutlined.woff2
├── components/
│   ├── top-app-bar.vue
│   ├── bottom-nav-bar.vue
│   └── quick-log-card.vue
├── pages/
│   ├── home/index.vue (重构)
│   ├── history/index.vue (新建)
│   ├── trends/index.vue (重构 statistics)
│   ├── profile/index.vue (新建)
│   ├── add-record/index.vue (样式更新)
│   ├── baby-manage/index.vue (样式更新)
│   ├── settings/index.vue (样式更新)
│   └── config/index.vue (样式更新)
└── uni.scss (设计 token)
```

### 4.2 页面路由

```json
{
  "pages": [
    { "path": "pages/home/index" },
    { "path": "pages/history/index" },
    { "path": "pages/trends/index" },
    { "path": "pages/profile/index" },
    { "path": "pages/add-record/index" },
    { "path": "pages/baby-manage/index" },
    { "path": "pages/settings/index" },
    { "path": "pages/config/index" }
  ],
  "tabBar": null
}
```

### 4.3 实现顺序

1. **Phase 1**: 设计系统基础
   - 下载字体文件
   - 更新 uni.scss 设计 token
   - 配置字体加载

2. **Phase 2**: 公共组件
   - TopAppBar 组件
   - BottomNavBar 组件
   - QuickLogCard 组件

3. **Phase 3**: 页面重构
   - 首页
   - 历史记录页（新建，拆分自首页）
   - 数据统计页
   - 个人资料页（新建）
   - 其他页面样式更新

---

## 5. 注意事项

1. **中文适配**：所有界面文字保持中文
2. **FAB 位置**：仅在首页显示
3. **字体加载**：本地加载，确保离线可用
4. **深色模式**：暂保留现有功能，后续可扩展
5. **兼容性**：uni-app 多端兼容，注意 CSS 兼容性
