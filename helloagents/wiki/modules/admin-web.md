# admin-web

## 目的
提供管理端 SPA，用于账户管理、统计监控与调用明细查看。

## 模块概述
- **职责:** 前端界面与后端 `/admin` 路由交互，展示账户、Key、统计与调用时间线。
- **状态:** 🚧开发中
- **最后更新:** 2025-12-15

## 规范
### 需求: 调用明细总览
**模块:** admin-web
在独立 URL `/usage-timeline` 展示所有 API Key 调用时间线，带 API Key 列与中文相对时间。

#### 场景: 默认访问
- 访问 `/usage-timeline` 直接进入页面
- 表格展示时间（含相对时间）、API Key 名称/ID、账户、模型、Token、费用
- 顶部统计口径为当前筛选条件命中的全量记录（默认当天范围），不随分页变化
- 默认“今日”时间范围以服务端系统时区为准（与首页面板口径一致）

## API接口
- 使用 `/admin/usage-records-timeline` 获取数据

## 数据模型
- 依赖调用记录数据结构，详见 wiki/data.md

## 依赖
- 前端：Vue 3、Element Plus、dayjs
- 后端接口：管理端统计路由

## 变更历史
- 202512091750_usage-timeline - 新增全量调用时间线页面
- 202512151626_fix_usage-timeline-summary - 修复顶部统计口径被分页污染
- 202512151706_fix_usage-timeline-today-summary - 修复今日口径与记录截断导致的总费用偏小
