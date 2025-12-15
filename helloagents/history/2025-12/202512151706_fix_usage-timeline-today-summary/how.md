# 技术设计: 修复 usage-timeline 今日总费用与首页不一致

## 技术方案

### 核心技术
- Redis list：`usage:records:{keyId}` 调用明细记录（用于时间线展示）
- Express：`/admin/usage-records-timeline` 聚合路由
- Vue 3 + Element Plus：`UsageTimelineView.vue` 页面筛选与展示

### 实现要点
1. **扩大调用明细默认保留条数**
   - 将 `redis.addUsageRecord()` 的默认 `maxRecords` 从 200 调整为 5000，使“按记录汇总”的 `summary` 不再被 200 条截断。
2. **移除仅扫描前 200 个 API Key 的保护上限**
   - `usageTimeline` 路由不再对 `scanApiKeyIds()` 结果进行 `slice(0, 200)`，避免漏统计。
3. **统一“今日”时间范围口径**
   - 前端不再用浏览器本地时区计算“今日”起止；当用户未显式选择范围时，使用后端返回的默认范围（系统时区“今日”）回填到日期选择器。

## 安全与性能
- **安全:** 不新增权限点；沿用管理员鉴权。
- **性能:**
  - 查询依旧受 `MAX_TOTAL_USAGE_RECORDS` 上限保护，避免返回过大。
  - 记录保留条数提升会增加 Redis 存储开销，需要在高并发场景监控内存占用。

## 测试与部署
- **测试:** `npm test`（已有 `/admin/usage-records-timeline` 的 summary 回归测试）。
- **部署:** 常规发布；回滚方式为恢复 `src/models/redis.js` 的默认保留条数与前端日期范围逻辑。

