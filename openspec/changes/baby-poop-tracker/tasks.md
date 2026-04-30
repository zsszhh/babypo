## 1. 后端核心

- [x] 1.1 初始化 Express 项目骨架（package.json、入口文件、中间件链）
- [x] 1.2 初始化 SQLite 数据库（建表：babies、records + 索引 + 默认宝宝）
- [x] 1.3 实现 Auth 认证模块（POST /auth/login、POST /auth/verify、JWT 中间件）
- [x] 1.4 实现 Records CRUD（GET/POST/PUT/DELETE /records、分页、日期筛选）
- [x] 1.5 实现 Babies CRUD（GET/POST/PUT /babies）
- [x] 1.6 实现 Sync 接口（POST /sync/push、POST /sync/pull）
- [x] 1.7 实现 Statistics 接口（GET /statistics/summary）
- [x] 1.8 实现 Export 接口（GET /export/json、GET /export/csv）
- [x] 1.9 统一错误处理中间件

## 2. 设计系统实现

- [x] 2.1 建立 SCSS 设计 Token（配色、字体、间距、阴影变量）
- [x] 2.2 实现深色模式 Token 体系
- [x] 2.3 全局样式配置（uni.scss、App.vue 全局样式）
- [x] 2.4 实现字体大小调节机制（CSS 变量 + 全局响应）

## 3. 前端项目初始化

- [x] 3.1 uniapp 项目脚手架初始化（manifest.json、pages.json、vite.config.ts）
- [x] 3.2 TypeScript 类型定义（PoopRecord、Baby、API 响应类型）
- [x] 3.3 常量定义（布里斯托分类、颜色、排便量枚举）
- [x] 3.4 API 请求封装模块（request.ts：auth 头、错误处理、401 跳转）
- [x] 3.5 Pinia stores（auth、record、baby、sync、settings）
- [x] 3.6 离线存储服务（storage.ts）
- [x] 3.7 同步引擎服务（sync.ts：30s 轮询、push/pull、冲突处理）

## 4. UI 页面实现

- [x] 4.1 连接配置页（服务器地址、密码、昵称输入 + 连接按钮 + loading/error 状态）
- [x] 4.2 首页时间线（日期分组、记录卡片、下拉刷新、长按菜单、FAB、同步状态栏）
- [x] 4.3 宝宝切换器（顶部 Tab/下拉切换当前宝宝）
- [x] 4.4 添加/编辑记录页（类型网格选择器、颜色/量下拉、时间选择、备注、表单验证）
- [x] 4.5 统计页（摘要卡片、类型分布条形图、颜色分布条形图、日期范围切换）
- [x] 4.6 宝宝管理页（宝宝列表、添加、编辑）
- [x] 4.7 设置页（字体大小三档、深色模式切换、版本信息）
- [x] 4.8 共享组件（record-item、type-selector、sync-status、empty-state）

## 5. 部署与测试

- [x] 5.1 Dockerfile + docker-compose.yml
- [x] 5.2 .env.example + 环境变量文档
- [x] 5.3 后端 API 测试（auth、records、sync、statistics）
- [x] 5.4 端到端流程验证（连接 → 添加记录 → 同步 → 查看统计）
