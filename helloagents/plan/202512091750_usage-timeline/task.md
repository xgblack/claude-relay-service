# 任务清单: 调用明细时间线全量视图

目录: `helloagents/plan/202512091750_usage-timeline/`

---

## 1. 后端接口
- [√] 1.1 新增路由文件 `src/routes/admin/usageTimeline.js`，实现 GET /admin/usage-records-timeline，聚合所有 Key 调用明细，字段同单 Key 时间线并附加 keyId/keyName。
- [√] 1.2 在 `src/routes/admin/index.js` 挂载新路由，路径保持独立。

## 2. 前端页面
- [√] 2.1 新增视图 `web/admin-spa/src/views/UsageTimelineView.vue`，基于 ApiKeyUsageRecordsView 克隆，新增 API Key 列与相对时间行。
- [√] 2.2 在 `web/admin-spa/src/router/index.js` 增加路由 `/usage-timeline`（不加入 Tab），确保可直接访问。

## 3. 安全检查
- [√] 3.1 确认接口鉴权使用 `authenticateAdmin`，分页/上限校验生效。

## 4. 文档与记录
- [ ] 4.1 更新 `helloagents/CHANGELOG.md` 记录新增功能。
- [ ] 4.2 更新 `helloagents/wiki/api.md` 中的管理端接口概览，加入新路由。

## 5. 测试
- [ ] 5.1 手动调用新接口验证分页、排序、相对时间字段；前端页面加载与表格显示正确。
