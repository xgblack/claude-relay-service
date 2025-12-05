# 变更提案: 调度优先级失效原因分析

## 需求背景
OpenAI-Responses 账户设置了不同 priority（数值越小优先级越高），但实际调用出现 1:1 轮询。用户怀疑存在比 priority 更高的调度策略或逻辑覆盖，希望基于现有代码体系分析失效原因并给出最小改动的修正建议。

## 变更内容
1. 全面梳理 unifiedOpenAIScheduler 共享池/分组/粘性会话路径，列出真实的排序与过滤顺序。
2. 对比其他调度器(Claude/Gemini/OpenAI 原生)的优先级实现，确认一致性或差异。
3. 找出导致 priority 未生效的具体逻辑分支或权重，并提出最小化改动的修正方案/验证方案。

## 影响范围
- **模块:** relay-service 调度
- **文件:** src/services/unifiedOpenAIScheduler.js (+ 同类调度器阅读)
- **API:** OpenAI / OpenAI-Responses 调度行为
- **数据:** priority、lastUsedAt、session 映射键

## 核心场景
### 需求: 解释并修正 priority 未生效
**模块:** relay-service
在共享池或分组内，priority 数值更小的账户应优先；若同优先级才按 lastUsedAt/createdAt。需要解释当前为何出现 1:1 轮询。

#### 场景: 分组双账号(优先级 10 vs 50)
- 粘性会话、限流、订阅过期、schedulable 标志等逻辑不应压过 priority 排序。
- 若存在更高优先级的策略（如 session 粘性），需明确其优先顺序。

## 风险评估
- **风险:** 误判真实生产行为、改动影响其他调度器的一致性。
- **缓解:** 以分析为主，小步验证；必要时仅补充日志/文档或局部排序调整。
