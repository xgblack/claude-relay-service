# 任务清单: 修复 usage-timeline 顶部统计口径

目录: `helloagents/plan/202512151626_fix_usage-timeline-summary/`

---

## 1. 后端修复
- [√] 1.1 在 `src/routes/admin/usageTimeline.js` 修复 `summary` 被分页记录重复累加的问题

## 2. 测试
- [√] 2.1 新增路由回归测试 `tests/usageTimeline.route.test.js`，验证 `summary` 不随分页变化
- [√] 2.2 运行 `npm test` 确认全套测试通过

## 3. 文档同步
- [√] 3.1 更新 `helloagents/wiki/api.md` 说明 `summary` 统计口径与默认时间范围
- [√] 3.2 更新 `helloagents/wiki/modules/admin-web.md` 说明顶部统计口径与变更历史
- [√] 3.3 更新 `helloagents/CHANGELOG.md` 记录修复
- [√] 3.4 更新 `helloagents/history/index.md` 并迁移方案包到 `helloagents/history/`

