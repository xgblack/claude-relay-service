# 任务清单: 提升 usage-timeline 聚合查询上限到60000

目录: `helloagents/plan/202512151739_increase_usage-timeline_max-total/`

---

## 1. 代码调整
- [√] 1.1 在 `src/routes/admin/usageTimeline.js` 将 `MAX_TOTAL_USAGE_RECORDS` 调整为 60000

## 2. 验证
- [√] 2.1 运行 `npm test`
- [√] 2.2 运行 `npm run lint:check`

## 3. 文档同步
- [√] 3.1 更新 `helloagents/wiki/api.md` 的限制说明
- [√] 3.2 更新 `helloagents/CHANGELOG.md` 记录变更
- [√] 3.3 更新 `helloagents/history/index.md` 并迁移方案包到 `helloagents/history/`
