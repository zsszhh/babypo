## Why

家庭成员需要一套简单、可靠、离线可用的宝宝排便记录工具。现有方案依赖第三方云服务，数据隐私无法保障，且对老年人不够友好。本项目通过自托管后端 + App 前端的方式，实现数据完全自主掌控、多端同步、离线可用、老人友好的全链路体验。

## What Changes

- 新建 Express + SQLite 后端，提供 RESTful API 服务
- 新建 uniapp (Vue 3 + TypeScript) 跨平台 App 前端
- 支持家庭共享密码认证、多设备实时同步
- 离线可用：本地存储优先，联网后自动同步（30s 轮询）
- 多宝宝管理：支持记录时选择/切换宝宝
- 数据统计与导出（JSON/CSV）
- Docker 一键部署

## Capabilities

### New Capabilities
- `server-api`: Express 后端完整 API，包含 Auth、Records CRUD、Sync、Statistics、Export
- `client-data-layer`: 前端数据层，包含 API 封装、Pinia 状态管理、离线存储引擎、同步服务
- `client-ui`: 所有 UI 页面和组件（配置页、首页时间线、记录表单、统计页、设置页）
- `design-system`: 基于 UI/UX Pro Max 的设计 Token 体系（配色、字体、间距、阴影、组件规范）
- `deployment`: Docker 容器化部署与运维

### Modified Capabilities
- 无（全新项目）

## Impact

- 后端：Node.js >= 18, SQLite 嵌入式数据库, Docker 运行环境
- 前端：uniapp 开发环境 (HBuilderX), 微信开发者工具 (如需小程序编译)
- 无外部云服务依赖，数据完全自托管
