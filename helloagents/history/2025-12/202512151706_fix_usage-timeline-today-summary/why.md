# 变更提案: 修复 usage-timeline 今日总费用与首页不一致

## 需求背景
管理端 `/usage-timeline` 页面顶部“总费用”长期停留在约 $20 左右，与系统首页面板显示的“今日已使用 $31+”（来自 `/admin/usage-costs?period=today`）不一致。

该问题会误导管理员对当天费用的判断，且与“当天接口持续调用，总费用应随调用递增”的直觉不符。

## 变更内容
1. 修复调用明细记录的默认保留条数过小导致的统计截断问题（每个 API Key 仅保留 200 条记录）。
2. 修复 usage-timeline 后端仅扫描前 200 个 API Key 的保护上限导致的统计不完整问题。
3. 修复 usage-timeline 前端“今日”默认时间范围使用浏览器本地时区，而非系统时区口径，导致与首页面板口径不一致的问题。

## 影响范围
- **模块:** relay-service（统计/记录）、admin-web（展示口径）
- **文件:**
  - `src/models/redis.js`
  - `src/routes/admin/usageTimeline.js`
  - `web/admin-spa/src/views/UsageTimelineView.vue`
  - `helloagents/wiki/api.md`
  - `helloagents/wiki/modules/admin-web.md`
  - `helloagents/CHANGELOG.md`
  - `helloagents/history/index.md`

## 核心场景

### 需求: usage-timeline 今日总费用与首页一致
**模块:** admin-web
在默认“今日”范围下，`/usage-timeline` 顶部总费用应与系统首页的“今日费用”口径一致（同一系统时区），且在持续有新调用时应稳定递增。

#### 场景: 默认访问与点击重置
- 前置条件：系统当天持续产生调用
- 操作：打开 `/usage-timeline` 或点击“重置”
- 预期结果：
  - 时间范围为系统时区的“今日”
  - 顶部总费用与首页面板一致或非常接近（受保护上限影响时应在文档中说明）
  - 费用不会因为记录截断或 Key 扫描上限而卡在固定值附近

## 风险评估
- **风险:** 将每个 API Key 的调用明细保留条数从 200 提升到 5000，可能增加 Redis 内存占用。
- **缓解:**
  - 继续保留 90 天过期策略与后端汇总上限（总计 20000 条）来控制查询与返回体积。
  - 若后续遇到内存压力，可进一步引入可配置的保留条数或切换为更适合时间范围查询的数据结构（如 ZSET）。

