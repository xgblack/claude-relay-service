# 技术设计: 调度优先级失效原因分析

## 技术方案
### 核心技术
- 现有 unifiedOpenAIScheduler 调度流程解析
- 对比 unifiedClaudeScheduler / unifiedGeminiScheduler 的排序实现
- 日志与代码阅读，不引入新依赖

### 实现要点
- 绘制决策顺序：粘性会话 → 专属绑定 → 可用性过滤(限流/订阅/支持模型/可调度标志) → 排序器。
- 检查排序器的实现与调用点，确认是否存在旁路路径（如粘性命中直接返回、rate-limit 清除逻辑修改 schedulable）。
- 梳理 lastUsedAt 更新与 createdAt 默认值，评估在时间戳相同或缺失时的排序结果。
- 对比其他调度器的排序函数，确保一致性或明确差异（Gemini/Claude/Droid）。

## 架构设计
- 不修改架构，仅产出分析与可能的最小补丁建议（如已发现排序缺口或日志缺失）。

## 架构决策 ADR
- 无新增 ADR。

## API设计
- 无接口改动。

## 数据模型
- 不变；关注 priority / lastUsedAt / createdAt / schedulable / rateLimitStatus 字段的读取与写入。

## 安全与性能
- 仅阅读与轻量日志，性能无新增开销；如提出补丁，保持 O(n log n) 排序复杂度。

## 测试与部署
- 设计最小验证用例：
  - 分组两账号（priority 10/50），无粘性/无限流 → 应选 10。
  - 有 session 粘性 → 命中粘性即返回，不排序（解释为预期行为）。
  - 限流或过期导致过滤 → 验证 fallback 选择。
- 部署不涉及特殊操作。
