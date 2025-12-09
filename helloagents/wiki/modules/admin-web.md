# admin-web

## 目的
提供管理端 SPA，用于账户管理、统计监控与调用明细查看。

## 模块概述
- **职责:** 前端界面与后端 `/admin` 路由交互，展示账户、Key、统计与调用时间线。
- **状态:** 🚧开发中
- **最后更新:** 2025-12-09

## 规范
### 需求: 调用明细总览
**模块:** admin-web
在独立 URL `/usage-timeline` 展示所有 API Key 调用时间线，带 API Key 列与中文相对时间。

#### 场景: 默认访问
- 访问 `/usage-timeline` 直接进入页面
- 表格展示时间（含相对时间）、API Key 名称/ID、账户、模型、Token、费用

## API接口
- 使用 `/admin/usage-records-timeline` 获取数据

## 数据模型
- 依赖调用记录数据结构，详见 wiki/data.md

## 依赖
- 前端：Vue 3、Element Plus、dayjs
- 后端接口：管理端统计路由

## 变更历史
- 202512091750_usage-timeline - 新增全量调用时间线页面
