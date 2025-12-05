# 任务清单: 修复 OpenAI-Responses 账号分组保存异常

目录: `helloagents/plan/20251127124221_openai_responses_group/`

---

## 1. 复现与定位
- [ ] 1.1 复现 openai-responses 分组保存失败，记录请求/响应与 Redis 分组写入情况

## 2. 后端修复
- [√] 2.1 核对 `/admin/openai-responses-accounts/:id` 更新接口，补齐分组字段校验/写入
- [√] 2.2 确保 accountGroupService 平台校验允许 openai-responses 写入并与 openai 分组对齐

## 3. 前端修复
- [ ] 3.1 检查 AccountForm 分组选择与提交 payload，对 openai-responses 平台保持 groupIds 正确传递

## 4. 验证与测试
- [ ] 4.1 手动回归：编辑 openai-responses 账号分组后保存，再次打开应显示分组；分组过滤/调度生效
- [ ] 4.2 快速检查相关 lint/单测（如有必要跑 npm run test 或针对性脚本）

## 5. 文档与记录
- [ ] 5.1 更新变更记录（如需）
