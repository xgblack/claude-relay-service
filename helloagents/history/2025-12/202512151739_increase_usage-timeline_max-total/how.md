# 技术设计: 提升 usage-timeline 聚合查询上限到60000

## 技术方案
将 `src/routes/admin/usageTimeline.js` 中的 `MAX_TOTAL_USAGE_RECORDS` 从 20000 调整为 60000。

## 安全与性能
- **安全:** 不涉及鉴权与数据权限变更。
- **性能:** 聚合与排序数据量上升，需关注接口延迟与内存；仍受单 Key 20000 与总计 60000 上限保护。

## 测试与部署
- **测试:** `npm test`、`npm run lint:check`
- **部署:** 常规发布；若性能不可接受，可回滚上限或改为更高效的数据结构/统计来源。

