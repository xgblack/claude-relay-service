# 技术设计: 修复 usage-timeline 顶部统计口径

## 技术方案

### 核心技术
- 后端：Express 路由 `/admin/usage-records-timeline`
- 测试：Jest + supertest

### 实现要点
- `summary` 只允许基于“命中筛选条件的全量记录”计算一次。
- 分页仅影响 `records` 返回集合，不应影响 `summary`。
- 增加路由级测试，校验 `summary.totalRequests/totalTokens/totalCost/avgCost` 不受分页逻辑影响。

## 安全与性能
- **安全:** 不新增权限点，沿用管理员鉴权中间件。
- **性能:** 不改变数据扫描上限与分页规则，修复仅移除重复累加逻辑。

## 测试与部署
- **测试:** `npm test`（包含新增 `tests/usageTimeline.route.test.js`）
- **部署:** 常规发布；回滚方式为恢复 `src/routes/admin/usageTimeline.js` 的历史版本。

