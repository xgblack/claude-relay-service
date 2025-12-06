# 技术设计: dev 功能迁移增强

## 技术方案
### 核心技术
- Node.js/Express 后端路由与服务拆分
- Vue 3 + admin SPA 路由按需加载
- Redis 账户/调用缓存复用

### 实现要点
- 新增并行后端模块（命名 *.plus.js）承载 dev 功能，避免覆盖 main 原文件。
- 在管理端增加独立路由前缀（如 `/admin-plus`、`/api/usage-plus`），前端通过新视图组件访问。
- 账户名称与渠道解析使用独立缓存服务（accountNameCacheService.plus.js），保证查询性能并与主逻辑隔离。
- 调度优先级逻辑封装为新调度器（unifiedOpenAIScheduler.plus.js），按 priority → lastUsedAt → createdAt 排序，兼容 OpenAI Responses 特性。
- 调用明细查询增加分页、防护阈值（单 key 上限/全局上限），默认页大小 20，可选 50/100。

## 架构设计
- 后端: `src/routes/admin/usageStats.plus.js` 挂载到新路由；`src/services/*plus.js` 提供独立实现；入口仅做路由注册。
- 前端: 新增 `DashboardPlusView.vue`、`UsageRecordsPlusView.vue`，在路由表中以新 path 挂载，复用已有 store/API 客户端。
- 运行时可同时保留原页面，增强版通过显式路径访问。

## 架构决策 ADR
- ADR-001: 并行增强策略 vs. 直接修改主干
  - **上下文:** 需要将 dev 功能带回 main，又要降低后续合并冲突。
  - **决策:** 采用并行增强文件与路由，不直接改动主文件；仅在入口做最小挂载改动。
  - **理由:** 主干保持稳定，上游同步时冲突面最小；增强可随时下线。
  - **替代方案:** 直接 cherry-pick（冲突大）；feature flag 内联（仍改动主文件）。
  - **影响:** 增加少量重复代码与入口维护成本，可通过后续收敛消除。

## API设计
- 新增管理端调用明细接口（GET `/admin-plus/api-keys/:keyId/usage-records`），分页参数 `page`、`pageSize`，总数防护；返回账户名称映射、渠道、模型与耗时。

## 数据模型
- 复用 Redis usage 记录存储结构；新增缓存键前缀 `usage:account-name-cache:*`。

## 安全与性能
- 限制单 key 最多 5000 条、全局最多 20000 条；输入参数校验与鉴权复用 `authenticateAdmin`。
- 日志降噪：仅记录账户索引加载摘要与样例；避免写入敏感内容。

## 测试与部署
- 单元/集成：为新路由与调度器添加 Jest 用例；使用 supertest 覆盖新接口分页与阈值。
- 前端：添加 Cypress/单元测试（若可）验证相对时间渲染与表格列。
- 部署：保持与 main 相同的启动流程；新增路由默认随服务启动，无需额外配置。
