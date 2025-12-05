# Repository Guidelines

## 项目结构与模块
- `src/`: Express 入口与核心逻辑，子目录含 routes/handlers/services/middleware/validators/utils。
- `web/admin-spa`: 管理端前端源码与构建产物；后端通过 `/admin-next/` 提供静态文件。
- `scripts/`: 运维与调试脚本（服务管理、数据迁移、定价更新、测试脚本等）。
- `cli/`: 命令行工具入口与交互逻辑。
- `config/`, `resources/`: 配置与模型定价数据；`VERSION` 存放版本号。

## 开发、构建与测试命令
- 本地开发：`npm run dev`（nodemon 热加载）。
- 启动服务：`npm start`（先 lint 再启动）。
- Lint/格式：`npm run lint` 自动修复；`npm run lint:check`、`npm run format:check` 仅检查；`npm run format` 格式化 src/cli/scripts。
- 测试：`npm test`（Jest）；补充脚本测试可参考 `scripts/test-*.js`。
- 前端构建：`npm run build:web`（在 web/admin-spa 内构建）。
- Docker：`npm run docker:build` 镜像；`npm run docker:up` / `npm run docker:down` 管理 compose。
- 服务管理脚本：`npm run service:start` / `:stop` / `:restart` / `:logs`，便于部署环境快速操作。

## 编码风格与命名
- 语言：Node.js/Express，使用 ESLint + Prettier（推荐 2 空格缩进，单引号，分号省略保持一致）。
- 命名：文件/目录使用 kebab-case，JS 变量与函数用 camelCase；常量大写蛇形。
- 日志：使用 `src/utils/logger`，保留上下文信息；严禁在仓库提交机密。

## 测试指南
- 框架：Jest + Supertest（已在 devDependencies 中）。
- 组织：优先放置于 `src/__tests__/` 或与模块邻近的 `*.test.js`；脚本型校验可放 `scripts/test-*.js`。
- 覆盖：至少覆盖核心路由、鉴权/限流中间件、服务初始化路径；新增接口需包含成功与错误分支。
- 运行：`npm test`，如需过滤用 `npm test -- <pattern>`；CI/预提交前请同时跑 `npm run lint:check`。

## 提交与 Pull Request
- Commit：遵循 Conventional Commits（如 `fix: ...`, `chore: ...`, `feat: ...`），与现有历史保持一致。
- PR 内容：描述变更点、测试结果、关联 Issue；前端改动附截图/录屏；涉及配置或脚本更新需写明影响面。
- 评审前自检：确保 lint/test 通过，命令示例可直接运行，敏感配置未入库。

## 安全与配置提示
- 使用 `.env` 管理敏感信息，示例可参考 `config/`；生产必须启用 Redis、全局速率限制与请求体大小限制。
- 调试开关：`DEBUG_HTTP_TRAFFIC` 会输出 HTTP 调试日志，请勿在生产长期开启。
- 部署：推荐通过 `npm run service:start` 或 Docker compose；更新时先备份 Redis，再执行迁移脚本（如 `scripts/migrate-*.js`）。
