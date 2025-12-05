# API 手册

## 路由概览
- `/api` / `/claude`：Claude 兼容转发与统一调度
- `/openai`：OpenAI 兼容路由（含 `/v1/chat/completions`、`/v1/responses`）
- `/gemini`：Gemini 标准与兼容路由
- `/azure`：Azure OpenAI 代理路由
- `/admin`、`/admin/webhook`：管理与回调接口
- `/web`：认证与页面重定向
- `/apiStats`：统计数据接口
- `/health`、`/metrics`：健康与运行指标

## 鉴权与安全
- 默认依赖配置中的 API Key/账户校验，中间件位于 `src/middleware/auth.js`
- 生产环境启用全局速率限制与请求大小限制

## 响应规范
- 成功：遵循上游 API 结构（OpenAI/Anthropic/Gemini 兼容）
- 失败：统一返回 `{ error, message, timestamp }`，404 返回路由信息

## 管理端统计接口

### GET /admin/usage-records
- **描述:** 获取调用明细列表，可按时间范围、模型、账户、API Key 过滤，支持分页与排序。
- **鉴权:** 需管理员登录（Bearer token）。
- **查询参数:**
  - `startDate,endDate` (可选，ISO 字符串，默认沿用仪表板时间选择器范围)
  - `model`、`accountId`、`accountType`、`keyId` (可选过滤项)
  - `sortOrder` (`asc|desc`，默认 `desc`)
  - `page` (默认 1)、`pageSize` (20，允许 20/50/100)
- **返回示例:**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "timestamp": "2025-12-05T14:38:20Z",
        "keyId": "k_xxx",
        "keyName": "demo-key",
        "model": "gpt-4o-mini",
        "accountId": "acc_123",
        "accountType": "openai",
        "accountTypeName": "OpenAI",
        "inputTokens": 1000,
        "outputTokens": 200,
        "cacheCreateTokens": 0,
        "cacheReadTokens": 0,
        "totalTokens": 1200,
        "cost": 0.0012,
        "costFormatted": "$0.0012",
        "isLongContextRequest": false,
        "responseTime": 320
      }
    ],
    "pagination": { "currentPage": 1, "pageSize": 20, "totalRecords": 123, "totalPages": 7 },
    "availableFilters": {
      "models": ["gpt-4o-mini"],
      "accounts": [{ "id": "acc_123", "accountType": "openai", "accountTypeName": "OpenAI" }],
      "keys": [{ "id": "k_xxx", "name": "demo-key" }],
      "dateRange": { "earliest": "2025-12-01T00:00:00Z", "latest": "2025-12-05T15:59:59Z" }
    },
    "limits": { "perKey": 5000, "total": 20000 }
  }
}
```
