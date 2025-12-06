# relay-service

## 目的
提供统一的 API 转发与账户调度能力，兼容 Claude/OpenAI/Gemini/Azure 等上游。

## 模块概述
- **职责:** 入口路由、鉴权、限流、缓存监控、健康检查
- **状态:** ✅稳定
- **最后更新:** 2025-12-06
- **并行增强:** 新增 `/admin/plus` 前缀的调用明细与账户解析路由，使用 *.plus 模块提供增强功能，避免影响主干路径

## 规范

### 需求: API 转发与限流
**模块:** relay-service
处理多上游兼容请求并应用限流与日志。

#### 场景: 标准 API 请求
- 接收 `/api` 或 `/openai` 请求
- 应用认证、速率限制、体积限制
- 转发到对应上游并返回兼容响应

## API接口
- 详见 `wiki/api.md` 列出的核心路由

## 数据模型
- Redis 作为缓存与限流计数存储

## 依赖
- `express`、`helmet`、`compression`、`cors`
- `redis` 客户端封装于 `src/models/redis.js`

## 变更历史
- 初始化记录 (202511270038) - 建立模块文档
- 优先级调度纠偏 (202512051030) - OpenAI-Responses 调度按 priority→lastUsedAt 排序
