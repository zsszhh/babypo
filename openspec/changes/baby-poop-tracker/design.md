## Context

BabyPoopTracker 是一个家庭宝宝排便记录 App，需要自托管后端 + 跨平台 App 前端。后端已通过 `kaifa.md` 明确定义 API 契约和数据模型，前端设计系统已通过 UI/UX Pro Max 生成并持久化到 `design-system/babypooptracker/MASTER.md`。

当前状态：空白项目，从零开始构建前后端完整实现。

关键约束：
- 数据完全自托管，不依赖第三方云服务
- 离线可用 + 在线自动同步
- 面向老年人，需大触控目标和高对比度
- 跨平台 App（优先 Android/iOS）

## Goals / Non-Goals

**Goals:**
- Express + SQLite 后端完整实现（Auth、Records CRUD、Sync、Statistics、Export）
- uniapp (Vue 3 + TS) App 前端完整实现（配置页、首页、记录页、统计页、设置页）
- 离线本地存储 + 30s 轮询同步
- 多宝宝管理（选择、切换、管理）
- Docker 一键部署
- 遵循 UI/UX Pro Max 设计系统（配色、字体、触控规范）

**Non-Goals:**
- 微信小程序 / H5 兼容（仅 App，但 uniapp 架构保留扩展能力）
- 推送通知（v1.1 规划）
- 第三方云存储同步
- 原生插件开发

## Decisions

### 1. 后端：Express + better-sqlite3
- **选择理由**：better-sqlite3 同步 API，无需连接池，零配置，适合家庭小规模使用
- **替代方案**：SQLite via sequelize → 太重，ORM 增加复杂度
- **API 版本**：`/api/v1/` 前缀，便于后续版本升级

### 2. 认证：共享密码 + JWT
- **选择理由**：家庭场景不需要独立账号注册，共享密码 + token 即可
- **Token 有效期**：1 年（家庭设备不像 App 那样频繁更换）
- **密码存储**：bcryptjs 哈希存储

### 3. 前端：uniapp App
- **选择理由**：一套代码编译 Android/iOS/H5/小程序，保留多端扩展能力
- **状态管理**：Pinia + pinia-plugin-persistedstate（自动持久化到本地存储）
- **离线策略**：本地记录标记 `localId` + `isLocal`，同步后映射服务端 ID

### 4. 同步策略：Push/Pull + Last-Write-Wins
- **Push**：推送 `updatedAt > lastSyncTime` 的本地变更
- **Pull**：拉取服务端 `updatedAt > lastSyncTime` 的新增/更新记录
- **冲突解决**：以 `updatedAt` 较大的版本为准（Last-Write-Wins）
- **轮询间隔**：30s（平衡及时性与性能）
- **同步状态**：synced / syncing / offline / error

### 5. 多宝宝实现
- **后端**：`babies` 表 + `records.baby_id` FK（kaifa.md 已定义）
- **API**：新增 `GET /babies`、`POST /babies`、`PUT /babies/:id`
- **前端**：首页顶部 Tab 切换 + 宝宝管理页
- **默认行为**：首次创建默认宝宝，记录时自动关联当前选中宝宝

### 6. 设计系统
- **配色**：Primary #0891B2 (cyan) + CTA #059669 (green) — 来自 UI/UX Pro Max
- **字体**：Varela Round (标题) + Nunito Sans (正文)
- **触控**：所有交互目标 ≥48rpx
- **图标**：使用 SVG 图标库，禁止 emoji 作为 UI 图标
- **深色模式**：语义化 CSS 变量，light/dark 两套 Token

### 7. 项目结构
- 前端代码在 `src/` 目录（uniapp 标准结构）
- 后端代码在 `server/` 目录（独立 Node.js 项目）
- Docker 配置在项目根目录

## Risks / Trade-offs

| 风险 | 缓解措施 |
|------|----------|
| 离线存储容量不足（大量记录 + 图片备注） | v1.0 仅文字记录，单条约 200B；5MB 可存 2.5 万条 |
| 同步冲突导致数据丢失（Last-Write-Wins 覆盖） | 保留服务端历史版本能力（后续 v1.1 可加时间旅行） |
| uniapp 编译 App 对原生 API 的兼容性 | 仅使用 uni.xxx 标准 API，避免原生插件依赖 |
| 密码泄露导致数据暴露 | JWT 密钥 + 密码可通过环境变量配置，建议定期更换 |
