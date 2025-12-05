# 任务清单: 调度优先级失效原因分析

目录: `helloagents/plan/202512051747_priority-audit/`

---

## 1. 代码与逻辑梳理
- [ ] 1.1 梳理 unifiedOpenAIScheduler 的决策流程（专属绑定、粘性会话、可用性过滤、排序器），列出优先级生效/旁路点，验证 why.md#需求:-解释并修正-priority-未生效-场景:-分组双账号(优先级-10-vs-50)
- [ ] 1.2 对比 unifiedClaudeScheduler / unifiedGeminiScheduler 的 _sortAccountsByPriority 实现与调用位置，找出与 OpenAI 路径的一致性或差异点

## 2. 失效原因定位与建议
- [ ] 2.1 总结导致“priority 未生效”的具体代码位置与触发条件（如粘性会话提前返回、限流/订阅过滤、lastUsedAt 默认值、排序调用缺失等），给出最小改动建议（如补充排序调用或日志）

## 3. 验证方案
- [ ] 3.1 设计最小验证场景（分组双账号、无粘性/有粘性、限流/过期过滤），输出预期调度结果与验证步骤

## 4. 文档同步
- [ ] 4.1 视结论需要，更新知识库 relay-service 模块的“变更历史/调度说明”以反映优先级行为
