# API 手册

## 路由概览
- `/api` / `/claude`：Claude 兼容转发与调度
- `/openai`：OpenAI 兼容路由（含 `/v1/chat/completions`、`/v1/responses`）
- `/gemini`：Gemini 标准与兼容路由
- `/azure`：Azure OpenAI 代理路由
- `/admin`、`/admin/webhook`：管理与回调接口
- `/web`：认证与页面重定向
- `/apiStats`：统计数据接口
- `/health`、`/metrics`：健康与运行指标

## 管理端统计接口

### GET /admin/api-keys/:keyId/usage-records
- **描述:** 获取单个 API Key 的请求时间线，可按时间、模型、账户筛选并分页。
- **鉴权:** 管理员登录（Bearer token）。
- **查询参数:** `startDate,endDate,model,accountId,sortOrder,page,pageSize`。
- **返回:** `{ records, pagination, apiKeyInfo, summary, availableFilters }`。

### GET /admin/usage-records-timeline
- **描述:** 聚合所有 API Key 的请求时间线，按时间排序，附带 key 名称、成本与账户信息。
- **鉴权:** 管理员登录（Bearer token）。
- **查询参数:** `keyId`(可选单 Key)、`model`、`accountId`、`accountType`、`startDate`、`endDate`、`sortOrder`(`asc|desc`)、`page`(默认1)、`pageSize`(20/50/100)。
- **限制:** 单 Key 20000 条，总计 60000 条保护上限。
- **返回:** `{ records, pagination, filters, availableFilters(models/accounts/keys/dateRange), summary, limits }`。
- **统计口径(重要):**
  - `summary` 基于“命中当前筛选条件的全量记录”计算，不随分页变化。
  - 未传 `startDate/endDate` 时，后端默认使用服务器本地时区的“当天 00:00:00 - 23:59:59.999”。
  - 受保护上限影响，若当日记录量超过上限，`summary` 可能无法覆盖完整当天全量数据。
  - 调用明细记录存储在 Redis list `usage:records:{keyId}` 中，默认最多保留 20000 条（按最近写入截断）。
  - 调用明细会自动过期：每次写入都会刷新 TTL，为 90 天。

### GET /admin/accounts/:accountId/usage-records
- **描述:** 获取账户的请求时间线，可按平台、模型、Key 筛选。
- **鉴权:** 管理员登录。
- **查询参数:** `platform, model, apiKeyId, startDate, endDate, sortOrder, page, pageSize`。
- **返回:** `{ records, pagination, accountInfo, summary, availableFilters }`。
