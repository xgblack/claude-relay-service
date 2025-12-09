# 数据模型

## 调用记录 (Redis list `usage:records:{keyId}`)
| 字段 | 类型 | 说明 |
|------|------|------|
| timestamp | ISO 字符串 | 请求时间 |
| model | string | 模型名称 |
| accountId | string | 上游账户标识 |
| accountType | string | 渠道类型，如 claude/openai/gemini |
| inputTokens | number | 输入 Token |
| outputTokens | number | 输出 Token |
| cacheCreateTokens | number | 缓存写入 Token |
| cacheReadTokens | number | 缓存读取 Token |
| cost | number | 费用(USD) |
| responseTime | number | 响应时间(ms) |
| keyName | string | API Key 名称（新接口返回时附带） |

## API Key 元数据 (Redis hash `apikey:{id}`)
| 字段 | 类型 | 说明 |
|------|------|------|
| name/label/displayName | string | Key 名称 |
| status | string | 状态 |
| createdAt | ISO 字符串 | 创建时间 |
