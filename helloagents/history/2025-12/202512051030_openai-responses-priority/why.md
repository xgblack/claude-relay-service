# 变更提案: OpenAI-Responses 优先级调度纠正

## 需求背景
OpenAI-Responses 账户的调度目前仅按最后使用时间轮询，忽略配置的 priority 数值，导致 codex-RightCode(priority=10) 与 codex-PackyCode(priority=50) 被 1:1 轮询，违背“数字越小优先级越高”的预期，无法实现优先资源账户的优先分发。

## 变更内容
1. 在 OpenAI-Responses 共享池与分组调度中恢复“priority 先于 lastUsedAt”排序，保证小值优先。
2. 保留 lastUsedAt 作为同优先级的二级排序，必要时再以创建时间兜底。
3. 调整日志输出，明确显示按优先级选择的账户，便于运维验证。

## 影响范围
- **模块:** relay-service 调度
- **文件:** src/services/unifiedOpenAIScheduler.js
- **API:** OpenAI/OpenAI-Responses 兼容接口
- **数据:** 账户 priority 配置读取

## 核心场景
### 需求: 按优先级调度 OpenAI-Responses 账户
**模块:** relay-service
确保在共享池或分组内，priority 数值更小的账号优先被选中，同优先级则按最久未使用优先。

#### 场景: 分组绑定的双账号调度
- 分组包含 codex-RightCode(priority=10) 与 codex-PackyCode(priority=50)
- 正常调用流量下，选择结果应明显倾向 codex-RightCode；在其限流/不可用时才退化到其他账号。

## 风险评估
- **风险:** 可能影响现有粘性会话与限流逻辑。
- **缓解:** 仅调整排序逻辑，不改可用性判定；保留粘性会话优先；添加日志确认顺序。
