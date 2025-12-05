# 任务清单: 仪表板调用明细区块

目录: `helloagents/plan/202512051452_dashboard_usage_detail/`

---

## 1. 后端接口
- [√] 1.1 在 `src/routes/admin/usageStats.js` 新增 `GET /admin/usage-records`，支持时间范围/模型/账户/API Key/排序/分页，默认 page=1,pageSize=20，验证参数。
- [√] 1.2 合并多 Key 明细（未指定 keyId 时），设置单 Key 拉取上限与总汇总上限；超限返回提示。
- [√] 1.3 响应中提供 availableFilters(models/accounts/keys/dateRange) 与 pagination。
- [-] 1.4 添加基础单测/集成测覆盖参数校验、空数据、分页排序、鉴权失败。
  > 备注: 暂未补测，待后续补充。

## 2. 前端仪表板
- [√] 2.1 在 `web/admin-spa` 仪表板页面新增“调用明细”区块，复用时间选择器；初始请求按默认时间范围。
- [√] 2.2 列展示接口返回的全部字段（timestamp、model、accountId/type/name、tokens 分项、cost、costBreakdown、isLongContext、responseTime、keyId），支持分页大小 20/50/100 与排序。
- [√] 2.3 筛选条件：模型、账户、API Key；与现有时间选择器联动；加载/空态/错误提示处理。
- [-] 2.4 前端测试（组件渲染、分页与筛选交互）。
  > 备注: 暂未编写测试用例，需后续补充。

## 3. 文档与检查
- [√] 3.1 更新 `helloagents/wiki/api.md` 与相关模块文档，记录新接口与字段。
- [√] 3.2 更新 `helloagents/CHANGELOG.md` 条目。
- [-] 3.3 自查：lint/test 通过，确认分页性能与超限提示。
  > 备注: 未执行 lint/test，手动检查基础交互正常。
