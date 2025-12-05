# 技术设计: 修复 OpenAI-Responses 账号分组保存异常

## 技术方案
### 核心技术
- Node.js/Express 后端：admin 路由、accountGroupService。
- Vue3 + Pinia 管理端：AccountForm 组件、分组加载与提交流程。

### 实现要点
1. 对齐 openai-responses 更新接口与 accountGroupService 的平台校验，允许写入分组。
2. 管理端提交时确保 groupIds/groupId 映射与平台过滤一致，并向后端传递正确字段。
3. 补充分组保存回归检查（前端交互或接口层验证）。

## 安全与性能
- 安全：避免越权平台写入，仅调整 openai-responses 平台映射；不触碰敏感字段。
- 性能：只涉少量读写 Redis/状态管理，影响可忽略。

## 测试与部署
- 测试：管理端手动回归/现有接口级测试，覆盖 openai-responses 分组保存与重载查看。
- 部署：常规构建发布流程，无额外迁移。
