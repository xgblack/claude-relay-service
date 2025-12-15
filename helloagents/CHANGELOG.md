# Changelog

本文件记录项目所有重要变更。
格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/),
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 变更
- 将 `/admin/usage-records-timeline` 聚合查询总记录保护上限提升到 60000。

## [1.1.3] - 2025-12-15

### 新增
- 无

### 变更
- 将 Redis 调用明细 `usage:records:{keyId}` 默认保留条数提升到 20000，并对齐相关管理端接口的读取上限。

### 修复
- 无

### 移除
- 无

## [1.1.2] - 2025-12-15

### 新增
- 无

### 变更
- 无

### 修复
- 修复 `/usage-timeline` 今日范围口径与系统时区不一致，以及调用明细默认仅保留 200 条导致总费用长期停在固定值附近的问题。

### 移除
- 无

## [1.1.1] - 2025-12-15

### 新增
- 无

### 变更
- 无

### 修复
- 修复 `/admin/usage-records-timeline` 的 `summary` 被分页记录重复累加，导致 `/usage-timeline` 顶部统计随分页/重置波动甚至变小的问题。

### 移除
- 无

## [1.1.0] - 2025-12-09

### 新增
- 新增管理端调用明细时间线全量接口 `/admin/usage-records-timeline`，支持多 Key 聚合、分页与成本展示。
- 新增前端页面 `/usage-timeline`，展示所有 API Key 调用时间线，附加 API Key 名称与中文相对时间。

### 变更
- 无

### 修复
- 无

### 移除
- 无
