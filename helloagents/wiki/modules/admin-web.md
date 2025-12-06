# admin-web

## 目的
提供管理面板前端，展示使用统计、账户配置与运营工具。

## 模块概述
- **职责:** 构建管理端 SPA，提供静态资源；由 Express 挂载 `/admin-next/`
- **状态:** 🚧开发中
- **最后更新:** 2025-12-06
- **并行增强:** 新增 DashboardPlus 与 AccountUsageRecordsPlus 视图，挂载在 `/dashboard-plus` 与 `/accounts/:id/usage-records-plus`，对应后端 `/admin/plus` 路由；保留原有页面不变

## 规范

### 需求: 管理面板访问
**模块:** admin-web
在 `/admin-next/` 提供管理界面入口，支持 SPA 路由。

#### 场景: 访问管理面板
- 请求 `/admin-next/`
- 返回构建后的 `index.html`，开启 no-cache 头

## 数据模型
- 前端依赖后端 API 提供统计与账户数据

## 依赖
- 构建脚本位于 `web/admin-spa`

## 变更历史
- 初始化记录 (202511270038) - 建立模块文档
