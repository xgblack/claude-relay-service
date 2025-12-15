# 技术设计: 调用明细时间线全量视图

## 技术方案
### 核心技术
- 后端：Express 路由新增独立文件，复用 redis usageRecords 读取与 CostCalculator 成本计算
- 前端：Vue 3 + Element Plus，新页面复用现有 ApiKeyUsageRecordsView 结构，新增 API Key 列与相对时间

### 实现要点
- 新增路由 `src/routes/admin/usageTimeline.js`（命名待定），挂载到 `/admin/usage-records-timeline`，只接受管理员鉴权。
- 返回字段沿用单 Key 时间线接口，额外返回 `keyId`、`keyName`；分页/排序参数与校验同原实现，限制每 Key 5000、全量 20000 条。
- 为减少改动，后端采用独立文件并在 `admin/index.js` 中挂载一次。
- 前端新增路由 `/usage-timeline`，页面组件 `UsageTimelineView.vue` 复制主干样式，添加 API Key 列，时间下方显示 `dayjs().fromNow()`（中文）。

## 架构设计
- 不改动现有 plus 路由；保持 main 干净，新文件可独立删除或合并。

## 架构决策 ADR
### ADR-001: 聚合时间线独立路由
**上下文:** 需要在不影响现有 plus 分支的情况下，基于 main 提供多 Key 调用时间线。
**决策:** 新增独立路由文件并挂载 `/admin/usage-records-timeline`，前端单独页面直达；所有实现通过新增文件完成。
**理由:** 避免修改现有路由与视图，便于后续与 main 同步，降低冲突风险。
**替代方案:** 复用 plus 路由或改造现有单 Key 接口 → 拒绝原因：依赖非 main 代码或影响既有行为。
**影响:** 新增路由与视图文件，增加少量构建体积；需要文档同步。

## 安全与性能
- 鉴权：复用 `authenticateAdmin` 中间件。
- 限流/保护：分页大小限定 20/50/100，单 Key 5000，整体 20000 条；若 key 列表空返回空数组。
- 错误处理：统一返回 `{ success: false, error }`；日期校验与排序方向校验。

## 测试与部署
- 手动验证：后端接口 curl 检查分页与字段；前端页面加载、分页、相对时间显示。
- 无额外部署动作，随现有构建流程发布。
