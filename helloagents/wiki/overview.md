# Claude Relay Service

> 本文件包含项目级别的核心信息。详细的模块文档见 `modules/` 目录。

---

## 1. 项目概述

### 目标与背景
提供自托管的 Claude/Codex API 中转服务，支持多账户管理、成本监控与 OpenAI 兼容接口。

### 范围
- **范围内:** API 代理与调度、费用统计、管理面板、CLI 运维脚本
- **范围外:** 第三方支付结算、用户认证托管服务

### 干系人
- **负责人:** 仓库维护者与贡献者社区

---

## 2. 模块索引

| 模块名称 | 职责 | 状态 | 文档 |
|---------|------|------|------|
| relay-service | API 转发、账户调度、速率控制 | ✅稳定 | modules/relay-service.md |
| admin-web | 管理端 SPA 及静态资源服务 | 🚧开发中 | modules/admin-web.md |
| cli-tools | 命令行与脚本工具 | ✅稳定 | modules/cli-tools.md |

---

## 3. 快速链接
- [技术约定](../project.md)
- [架构设计](arch.md)
- [API 手册](api.md)
- [数据模型](data.md)
- [变更历史](../history/index.md)
