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
- **限制:** 单 Key 5000 条，总计 20000 条保护上限。
- **返回:** `{ records, pagination, filters, availableFilters(models/accounts/keys/dateRange), summary, limits }`。

### GET /admin/accounts/:accountId/usage-records
- **描述:** 获取账户的请求时间线，可按平台、模型、Key 筛选。
- **鉴权:** 管理员登录。
- **查询参数:** `platform, model, apiKeyId, startDate, endDate, sortOrder, page, pageSize`。
- **返回:** `{ records, pagination, accountInfo, summary, availableFilters }`。
