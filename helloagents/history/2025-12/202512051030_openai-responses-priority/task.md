# 任务清单: OpenAI-Responses 优先级调度纠正

目录: `helloagents/plan/202512051030_openai-responses-priority/`

---

## 1. 调度排序修正
- [√] 1.1 在 `src/services/unifiedOpenAIScheduler.js` 共享池路径中，使用“priority → lastUsedAt → createdAt”排序，验证 why.md#需求:-按优先级调度-openai-responses-账户-场景:-分组绑定的双账号调度
- [√] 1.2 在 `src/services/unifiedOpenAIScheduler.js` 分组路径中，使用相同排序器，验证 why.md#需求:-按优先级调度-openai-responses-账户-场景:-分组绑定的双账号调度
- [√] 1.3 增强相关日志输出，包含 priority 与排序依据，便于运维验证

## 2. 测试与验证
- [ ] 2.1 手动或脚本模拟双账号分组调用，确认 codex-RightCode(priority=10) 优先被选中；同优先级时按 lastUsedAt 先后

## 3. 文档与记录
- [√] 3.1 如需，更新相关知识库描述（当前为逻辑纠偏，如无新信息可评估是否保持不变）
