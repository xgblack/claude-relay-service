# 任务清单: 提升调用明细保留条数到20000

目录: `helloagents/plan/202512151724_increase_usage-records_retention/`

---

## 1. 存储与接口调整
- [√] 1.1 在 `src/models/redis.js` 将 `addUsageRecord()` 默认 `maxRecords` 调整为 20000
- [√] 1.2 在 `src/routes/admin/usageTimeline.js` 将 `MAX_USAGE_RECORDS_PER_KEY` 调整为 20000
- [√] 1.3 在 `src/routes/admin/usageStats.js` 将 `getUsageRecords(..., 5000)` 调整为 20000

## 2. 验证
- [√] 2.1 运行 `npm test`
- [√] 2.2 运行 `npm run lint:check`

## 3. 文档同步
- [√] 3.1 更新 `helloagents/wiki/api.md`，补充明细 TTL 与默认保留条数说明
- [√] 3.2 更新 `helloagents/CHANGELOG.md` 记录变更
- [√] 3.3 更新 `helloagents/history/index.md` 并迁移方案包到 `helloagents/history/`
