# 数据模型

## 存储概览
- 主存储：Redis，用于账户状态、速率限制、会话窗口、缓存统计
- 配置文件：`config/` 下的 JSON/YAML/ENV 配置；`data/init.json` 作为管理员凭据来源
- 版本信息：`VERSION` 与 `package.json` 中的版本号

## 关键数据结构
- `concurrency:*`：并发计数有序集合，定期清理过期项
- 会话/凭据：通过 `redis.setSession` 与 `redis.getClient().ping()` 校验连接
- 费用/模型定价：由 `src/services/pricingService` 与资源目录维护

## 备份与迁移
- 数据迁移脚本：`scripts/migrate-*.js`、`scripts/data-transfer*.js`
- 建议在执行迁移或更新前备份 Redis 数据快照
