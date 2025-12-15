# 技术设计: 提升调用明细保留条数到20000

## 技术方案

### 核心技术
- Redis list：`usage:records:{keyId}`
- 写入：`LPUSH` + `LTRIM` + `EXPIRE`

### 实现要点
1. **写入保留条数**
   - `redis.addUsageRecord()` 默认 `maxRecords` 调整为 20000。
2. **读取上限对齐**
   - `/admin/usage-records-timeline` 的单 Key 读取上限调整为 20000（`MAX_USAGE_RECORDS_PER_KEY`）。
   - `/admin/api-keys/:keyId/usage-records` 读取上限调整为 20000。
   - `/admin/accounts/:accountId/usage-records`（按账户聚合明细）批量读取上限调整为 20000。
3. **TTL 行为说明**
   - 每次写入都会执行 `EXPIRE(listKey, 86400*90)`，因此 TTL=90天，且会在持续写入时不断刷新。

## 安全与性能
- **安全:** 不涉及权限与敏感信息变更。
- **性能:** 写入的 `LTRIM` 长度增加会略增 Redis 操作成本；读取上限增加会增大管理端查询压力，需关注高并发下的响应时间与内存。

## 测试与部署
- **测试:** `npm test`、`npm run lint:check`
- **部署:** 常规发布；必要时回滚到较小保留条数以控制 Redis 内存。

