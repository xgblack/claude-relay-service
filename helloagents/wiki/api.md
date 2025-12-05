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
