# 任务清单: dev 功能迁移增强

目录: `helloagents/plan/202512062347_dev-sync-enhance/`

---

## 1. 后端增强
- [√] 1.1 新增 `src/routes/admin/usageStats.plus.js`，实现调用明细分页查询与账户名称映射，验证 why.md#需求-调用明细查询增强-场景-查询某-api-key-调用记录
- [√] 1.2 新增 `src/services/accountNameCacheService.plus.js`，封装账户索引与缓存逻辑，验证 why.md#需求-调用明细查询增强-场景-查询某-api-key-调用记录
- [√] 1.3 新增 `src/services/unifiedOpenAIScheduler.plus.js`，实现 priority/lastUsedAt/createdAt 排序调度，兼容 OpenAI Responses，验证 why.md#需求-调度与账户优先级优化-场景-选择下发账户

## 2. 前端增强
- [√] 2.1 新增 `web/admin-spa/src/views/UsageRecordsPlusView.vue` 并以弹窗形式嵌入 AccountsView，“明细”按钮触发；保留 `/dashboard-plus` 访问路径
- [√] 2.2 新增 `web/admin-spa/src/views/AccountUsageRecordsPlusView.vue` 及表格组件，调用新接口展示调用明细，验证 why.md#需求-调用明细查询增强-场景-查询某-api-key-调用记录

## 3. 安全检查
- [√] 3.1 执行输入校验、鉴权复用、自测阈值保护，确保无敏感日志输出
> 备注: 已复核新路由依赖 authenticateAdmin，分页阈值生效；日志仅输出摘要，无敏感信息

## 4. 文档更新
- [√] 4.1 更新 `helloagents/wiki/api.md`、`helloagents/wiki/arch.md` 与 `helloagents/CHANGELOG.md`，记录并行增强策略

## 5. 测试
- [ ] 5.1 为新路由与调度器编写 Jest/supertest 用例，覆盖分页与排序逻辑
> 备注: 待补充测试用例
- [ ] 5.2 运行 `npm test` / `npm run lint:check`，输出结果
> 备注: `npm run lint:check` 在 docker 构建中失败，原因是 admin-spa 内存在大量 console 警告及 1 个 prettier 错误（已修复 prettier），仍需本地安装依赖后重跑；未执行 npm test
