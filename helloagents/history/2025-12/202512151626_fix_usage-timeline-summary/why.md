# 变更提案: 修复 usage-timeline 顶部统计口径

## 需求背景
管理端 `/usage-timeline` 页面顶部展示“总请求 / 总 Token / 总费用 / 平均费用/次”等统计。当前观察到点击“重置”后统计数值反而变小，与“当天范围内持续有新调用，总费用只会递增”的预期不一致。

## 变更内容
1. 修复后端接口 `/admin/usage-records-timeline` 的 `summary` 统计被分页记录重复累加的问题，确保统计口径仅基于“匹配筛选条件的全量记录”。
2. 增加回归测试，防止 `summary` 再次因分页逻辑被污染。
3. 同步更新知识库说明，明确顶部统计的时间范围与口径。

## 影响范围
- **模块:** 管理端统计接口、admin-web
- **文件:**
  - `src/routes/admin/usageTimeline.js`
  - `tests/usageTimeline.route.test.js`
  - `helloagents/wiki/api.md`
  - `helloagents/wiki/modules/admin-web.md`
  - `helloagents/CHANGELOG.md`
  - `helloagents/history/index.md`

## 核心场景

### 需求: usage-timeline 顶部统计应稳定且可解释
**模块:** admin-web
顶部统计应基于当前筛选条件命中的全量记录（默认当天 00:00:00 - 23:59:59.999），不应因为分页切换或点击“重置”而出现口径变化导致的数值回退。

#### 场景: 点击重置
- 前置条件：当天持续产生调用记录
- 操作：点击“重置”
- 预期结果：
  - 顶部统计口径不随分页变化
  - 在真实数据持续增长的情况下，统计数值不因“重置”而回退

## 风险评估
- **风险:** 统计口径变化会影响管理员对当日费用的判断。
- **缓解:** 增加路由级回归测试，保证 `summary` 仅按全量命中记录计算；在 API 文档中明确口径与保护上限。

