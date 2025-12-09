# 项目技术约定

---

## 技术栈
- **核心:** Node.js 18 / Express
- **前端:** Vue 3 + Vite + Element Plus (admin SPA)
- **数据:** Redis 用于速率与调用记录缓存

---

## 开发约定
- **代码规范:** ESLint + Prettier，前端遵循 Vite 默认构建规范，后端保持单一职责路由文件。
- **命名约定:** 路由文件按功能命名，前端视图使用 PascalCase 命名。

---

## 错误与日志
- **策略:** 统一使用 `logger` 输出；接口错误返回 `{ success: false, error, message? }`。
- **日志:** 生产环境保留 info/error，调试信息使用 debug 级别。

---

## 测试与流程
- **测试:** 首选 `npm test` / `npm run lint`；前端构建使用 `npm run build`。
- **提交:** 建议遵循 Conventional Commits，提交包含代码与知识库同步更新。
