# 项目技术约定

## 技术栈
- 核心：Node.js 18+ / Express
- 数据：Redis 6+
- 工具：Docker、docker-compose、Makefile 脚本

## 开发约定
- 代码规范：ESLint + Prettier；提交前运行 `npm run lint` 与 `npm run test`
- 命名约定：文件与目录使用 kebab-case，函数与变量使用 camelCase
- 配置管理：使用 `.env`，敏感信息不入库；示例可参考 `config/` 下的模板

## 错误与日志
- 统一使用 `src/utils/logger` 输出结构化日志
- 健康检查与指标：`/health`、`/metrics` 端点

## 测试与流程
- 单元与集成测试：Jest/Supertest；命令 `npm test`
- 提交信息：遵循 Conventional Commits（如 `fix: ...`, `chore: ...`）
