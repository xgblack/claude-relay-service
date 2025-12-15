# 任务清单: 修复 usage-timeline 今日总费用与首页不一致

目录: `helloagents/plan/202512151706_fix_usage-timeline-today-summary/`

---

## 1. 统计修复
- [√] 1.1 在 `src/models/redis.js` 将 `addUsageRecord()` 默认保留条数从 200 调整为 5000
- [√] 1.2 在 `src/routes/admin/usageTimeline.js` 移除仅扫描前 200 个 API Key 的限制
- [√] 1.3 在 `web/admin-spa/src/views/UsageTimelineView.vue` 让“今日”默认范围以服务端系统时区为准

## 2. 测试
- [√] 2.1 运行 `npm test`
- [√] 2.2 运行 `npm run lint:check`

## 3. 文档同步
- [√] 3.1 更新 `helloagents/wiki/api.md` 与 `helloagents/wiki/modules/admin-web.md`，说明默认时间口径与限制
- [√] 3.2 更新 `helloagents/CHANGELOG.md` 记录修复
- [√] 3.3 更新 `helloagents/history/index.md` 并迁移方案包到 `helloagents/history/`

