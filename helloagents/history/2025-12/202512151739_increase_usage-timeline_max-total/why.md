# 变更提案: 提升 usage-timeline 聚合查询上限到60000

## 需求背景
`/usage-timeline` 页面依赖 `/admin/usage-records-timeline` 聚合查询。该接口存在总记录保护上限 `MAX_TOTAL_USAGE_RECORDS`，当系统当天调用量较大时，`summary` 会因达到上限而截断，导致“今日总费用/总请求”等统计偏小。

## 变更内容
将 `/admin/usage-records-timeline` 的总记录保护上限从 20000 调整为 60000，以覆盖更高调用量场景下的当天统计。

## 影响范围
- **模块:** 管理端统计接口、admin-web
- **文件:**
  - `src/routes/admin/usageTimeline.js`
  - `helloagents/wiki/api.md`
  - `helloagents/CHANGELOG.md`
  - `helloagents/history/index.md`

## 核心场景

### 需求: 高调用量当天统计更完整
**模块:** 管理端统计接口
在当天调用明细总量 > 20000 的情况下，`/usage-timeline` 的顶部统计应尽可能覆盖更多记录，以减少与首页“今日费用”的差异。

#### 场景: 当天高并发
- 前置条件：全站当天调用明细 > 20000
- 操作：打开 `/usage-timeline` 并保持默认“今日”范围
- 预期结果：顶部统计能覆盖更多当日记录（上限 60000），偏差缩小

## 风险评估
- **风险:** 服务器侧聚合/排序/汇总开销增加，接口响应时间变长。
- **缓解:** 仍保留总上限与分页返回，避免无限扫描；必要时可进一步优化为按时间倒序提前终止或改用更适合的统计数据源。

