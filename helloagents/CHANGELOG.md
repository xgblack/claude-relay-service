# 变更日志

本文件记录项目所有重要变更。
格式基于 Keep a Changelog，版本号遵循语义化版本。

## [Unreleased]

- 初始化知识库结构，补充项目基础说明
- 新增根目录贡献者指南 AGENTS.md，整理结构、命令与规范
- 修复 OpenAI-Responses 账户分组保存问题，对齐分组校验与写入
- 仪表板新增“调用明细”区块，后端提供 `/admin/usage-records` 聚合查询，支持时间/模型/账户/API Key 筛选与分页

## [1.1.223] - 2025-12-05

### 修复
- OpenAI-Responses 账户调度恢复“priority 越小越优先”，同级按 `lastUsedAt` 和 `createdAt` 排序，日志输出包含优先级，防止分组/共享池出现 1:1 轮询
