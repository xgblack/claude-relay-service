# 技术设计: 仪表板调用明细区块

## 技术方案
### 核心技术
- 后端：Express (`src/routes/admin/usageStats.js`) 扩展查询接口。
- 数据源：Redis 用量明细列表 `usage:records:<keyId>` 与费用/模型聚合键。
- 前端：`web/admin-spa` 仪表板页面组件，复用现有时间选择器与表格组件。

### 实现要点
- 新增接口 `GET /admin/usage-records`（admin 鉴权）：
  - 查询条件：`startDate,endDate,model,accountId,accountType,keyId,page,pageSize,sortOrder`。
  - 默认：时间范围沿用前端时间控件；`page=1`，`pageSize=20`，`sortOrder=desc`。
  - 行为：
    1) 若传 `keyId`，直接读取对应列表；
    2) 若未传 `keyId`，扫描 API Key 列表（限制数量，如前 200 个）并合并记录，按时间排序后分页。
  - 输出字段：timestamp, model, accountId/type/name/status, tokens 相关字段、成本拆分、isLongContext、responseTime、totalTokens、costFormatted；附 pagination 与可选项(models/accounts/keys)。
  - 性能保护：限制 max 拉取 5000 条/Key，最大汇总记录数（如 20000），超限时返回提示。
- 前端仪表板新增“调用明细”区块：
  - 使用同一时间选择器；筛选项：模型、账户、API Key；分页大小可选 20/50/100。
  - 列默认展示接口返回的全部字段；留出列显隐配置入口（可暂用简单“全部显示”）。
  - 空态与加载态处理；错误提示。

## 架构设计
- 路由层新增 handler，依赖 redis 客户端与现有 cost 计算工具；不改动核心服务层逻辑。
- 前端数据流：仪表板页的 store/服务（待确认文件）调用新 API，状态驱动表格组件。

## 架构决策 ADR
无新增 ADR。

## API设计
### GET /admin/usage-records
- **查询参数：**
  - `startDate,endDate`(ISO，可选；缺省由前端提供默认范围)
  - `model`、`accountId`、`accountType`、`keyId`、`sortOrder=desc|asc`
  - `page`(默认1)、`pageSize`(20，允许 20/50/100，最大200)
- **响应：**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "timestamp": "2025-12-05T14:38:20Z",
        "model": "gpt-4o-mini",
        "accountId": "acc_123",
        "accountType": "openai",
        "accountName": "acc_123",
        "inputTokens": 1000,
        "outputTokens": 200,
        "cacheCreateTokens": 0,
        "cacheReadTokens": 0,
        "ephemeral5mTokens": 0,
        "ephemeral1hTokens": 0,
        "totalTokens": 1200,
        "isLongContextRequest": false,
        "cost": 0.0012,
        "costFormatted": "$0.0012",
        "responseTime": 320,
        "keyId": "k_abc"
      }
    ],
    "pagination": {"currentPage":1,"pageSize":20,"totalRecords":123,"totalPages":7},
    "filters": {...},
    "availableFilters": {"models":[],"accounts":[],"keys":[],"dateRange":{}}
  }
}
```

## 数据模型
- 沿用 Redis 列表 `usage:records:<keyId>`，不新增存储结构；接口层合并分页。

## 安全与性能
- 仅 admin 鉴权可访问。
- 限制分页与单次汇总记录上限，避免阻塞；对错误或超限返回提示。

## 测试与部署
- 后端：接口单测/集成测覆盖查询参数、分页、无数据、超限、鉴权失败。
- 前端：组件渲染、分页切换、筛选交互与空态用例；snapshot/逻辑测试。
- 部署：无额外迁移；需确保 Redis 数据存在。
