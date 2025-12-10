const express = require('express')
const ccrAccountService = require('../../services/ccrAccountService')
const claudeAccountService = require('../../services/claudeAccountService')
const claudeConsoleAccountService = require('../../services/claudeConsoleAccountService')
const geminiAccountService = require('../../services/geminiAccountService')
const geminiApiAccountService = require('../../services/geminiApiAccountService')
const openaiAccountService = require('../../services/openaiAccountService')
const openaiResponsesAccountService = require('../../services/openaiResponsesAccountService')
const droidAccountService = require('../../services/droidAccountService')
const redis = require('../../models/redis')
const { authenticateAdmin } = require('../../middleware/auth')
const logger = require('../../utils/logger')
const CostCalculator = require('../../utils/costCalculator')

const router = express.Router()

// 分页与安全阈值
const USAGE_RECORDS_PAGE_SIZES = [20, 50, 100]
const DEFAULT_USAGE_RECORDS_PAGE_SIZE = 20
const MAX_USAGE_RECORDS_PER_KEY = 5000
const MAX_TOTAL_USAGE_RECORDS = 20000

const accountTypeNames = {
  claude: 'Claude官方',
  'claude-console': 'Claude Console',
  ccr: 'Claude Console Relay',
  openai: 'OpenAI',
  'openai-responses': 'OpenAI Responses',
  gemini: 'Gemini',
  'gemini-api': 'Gemini API',
  droid: 'Droid',
  unknown: '未知渠道'
}

// 安全加载账户列表，构建索引(id -> {name, platform})
const addAccountToIndex = (index, id, platform, name, extra = {}) => {
  if (!id) return
  const displayName = name || extra.displayName || extra.label || extra.description || extra.email || id
  index.set(id, { name: displayName, platform })
  if (id.startsWith('api:')) {
    index.set(id.slice(4), { name: displayName, platform })
  } else if (id.startsWith('responses:')) {
    index.set(id.slice(10), { name: displayName, platform })
  }
}

const loadAccountsSafe = async (label, loader, platform, index, prefix = '') => {
  try {
    const list = await loader()
    if (Array.isArray(list)) {
      list.forEach((acc) => addAccountToIndex(index, prefix + acc.id, platform, acc.name, acc))
    }
  } catch (e) {
    logger.debug(`UsageTimeline account index skip ${label}: ${e.message}`)
  }
}

// 获取调用明细时间线（所有 Key 聚合）
router.get('/usage-records-timeline', authenticateAdmin, async (req, res) => {
  try {
    const {
      keyId,
      model,
      accountId,
      accountType,
      startDate,
      endDate,
      sortOrder = 'desc',
      page = 1,
      pageSize = DEFAULT_USAGE_RECORDS_PAGE_SIZE
    } = req.query

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1)
    const parsedPageSize = Math.min(
      Math.max(parseInt(pageSize, 10) || DEFAULT_USAGE_RECORDS_PAGE_SIZE, 1),
      200
    )
    const pageSizeNumber = USAGE_RECORDS_PAGE_SIZES.includes(parsedPageSize)
      ? parsedPageSize
      : DEFAULT_USAGE_RECORDS_PAGE_SIZE

    // 默认使用当天 00:00:00 - 23:59:59.999 的时间范围（本地时区）
    const defaultStart = new Date()
    defaultStart.setHours(0, 0, 0, 0)
    const defaultEnd = new Date()
    defaultEnd.setHours(23, 59, 59, 999)

    const startTime = startDate ? new Date(startDate) : defaultStart
    const endTime = endDate ? new Date(endDate) : defaultEnd

    // 归一化到本地时区日界线：若传入字符串含时区，则使用其绝对时间；默认今日需覆盖全天
    if (!startDate) {
      startTime.setHours(0, 0, 0, 0)
    }
    if (!endDate) {
      endTime.setHours(23, 59, 59, 999)
    }
    if (
      (startDate && Number.isNaN(startTime?.getTime())) ||
      (endDate && Number.isNaN(endTime?.getTime()))
    ) {
      return res.status(400).json({ success: false, error: 'Invalid date range' })
    }
    if (startTime && endTime && startTime > endTime) {
      return res
        .status(400)
        .json({ success: false, error: 'Start date must be before or equal to end date' })
    }

    const normalizedSortOrder = sortOrder === 'asc' ? 'asc' : 'desc'

    // 获取 key 列表
    let keyIds = []
    if (keyId) {
      keyIds = [keyId]
    } else {
      const scanned = await redis.scanApiKeyIds()
      keyIds = scanned.slice(0, 200) // 保护上限
    }

    if (keyIds.length === 0) {
      return res.json({
        success: true,
        data: {
          records: [],
          pagination: {
            currentPage: pageNumber,
            pageSize: pageSizeNumber,
            totalRecords: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: false
          },
          filters: {
            startDate: startTime ? startTime.toISOString() : null,
            endDate: endTime ? endTime.toISOString() : null,
            model: model || null,
            accountId: accountId || null,
            accountType: accountType || null,
            keyId: keyId || null,
            sortOrder: normalizedSortOrder
          },
          availableFilters: {
            models: [],
            accounts: [],
            keys: [],
            dateRange: { earliest: null, latest: null }
          },
          summary: {
            totalRequests: 0,
            inputTokens: 0,
            outputTokens: 0,
            cacheCreateTokens: 0,
            cacheReadTokens: 0,
            totalTokens: 0,
            totalCost: 0,
            avgCost: 0
          },
          limits: { perKey: MAX_USAGE_RECORDS_PER_KEY, total: MAX_TOTAL_USAGE_RECORDS }
        }
      })
    }

    // 构建账户索引
    const accountIndex = new Map()
    await Promise.all([
      loadAccountsSafe('claude', () => claudeAccountService.getAllAccounts(), 'claude', accountIndex),
      loadAccountsSafe(
        'claude-console',
        () => claudeConsoleAccountService.getAllAccounts(),
        'claude-console',
        accountIndex
      ),
      loadAccountsSafe('gemini', () => geminiAccountService.getAllAccounts(), 'gemini', accountIndex),
      loadAccountsSafe(
        'gemini-api',
        () => geminiApiAccountService.getAllAccounts(),
        'gemini-api',
        accountIndex,
        'api:'
      ),
      loadAccountsSafe('openai', () => openaiAccountService.getAllAccounts(), 'openai', accountIndex),
      loadAccountsSafe(
        'openai-responses',
        () => openaiResponsesAccountService.getAllAccounts(),
        'openai-responses',
        accountIndex,
        'responses:'
      ),
      loadAccountsSafe('droid', () => droidAccountService.getAllAccounts(), 'droid', accountIndex),
      loadAccountsSafe('ccr', () => ccrAccountService.getAllAccounts(), 'ccr', accountIndex)
    ])

    // 预取 Key 信息
    const keyInfoMap = new Map()
    try {
      const keyInfos = await redis.batchGetApiKeys(keyIds)
      keyInfos.forEach((info) => {
        keyInfoMap.set(info.id, {
          id: info.id,
          name: info.name || info.label || info.displayName || info.id
        })
      })
    } catch (e) {
      logger.debug(`UsageTimeline preload api keys failed: ${e.message}`)
    }

    const allRecords = []
    let totalRawCount = 0
    const accountOptionMap = new Map()
    const modelSet = new Set()
    let earliestTimestamp = null
    let latestTimestamp = null

    const toUsageObject = (record) => ({
      input_tokens: record.inputTokens || record.input_tokens || 0,
      output_tokens: record.outputTokens || record.output_tokens || 0,
      cache_creation_input_tokens: record.cacheCreateTokens || record.cache_creation_input_tokens || 0,
      cache_read_input_tokens: record.cacheReadTokens || record.cache_read_input_tokens || 0,
      cache_creation: record.cacheCreation || record.cache_creation || null
    })

    for (const id of keyIds) {
      if (totalRawCount >= MAX_TOTAL_USAGE_RECORDS) break

      const raw = await redis.getUsageRecords(id, MAX_USAGE_RECORDS_PER_KEY)
      if (!raw || raw.length === 0) continue

      for (const record of raw) {
        if (!record.timestamp) continue
        const ts = new Date(record.timestamp)
        if (Number.isNaN(ts.getTime())) continue
        if (startTime && ts < startTime) continue
        if (endTime && ts > endTime) continue
        if (model && record.model !== model) continue
        if (accountId && record.accountId !== accountId) continue
        if (accountType && record.accountType !== accountType) continue

        const usage = toUsageObject(record)
        const costData = CostCalculator.calculateCost(usage, record.model || 'unknown')
        const computedCost =
          typeof record.cost === 'number' ? record.cost : costData?.costs?.total || 0
        const totalTokens =
          record.totalTokens ||
          usage.input_tokens +
            usage.output_tokens +
            usage.cache_creation_input_tokens +
            usage.cache_read_input_tokens

        allRecords.push({
          keyId: id,
          keyName: keyInfoMap.get(id)?.name || id,
          timestamp: record.timestamp,
          model: record.model || 'unknown',
          accountId: record.accountId || null,
          accountType: record.accountType || 'unknown',
          accountName: record.accountName || null,
          inputTokens: usage.input_tokens,
          outputTokens: usage.output_tokens,
          cacheCreateTokens: usage.cache_creation_input_tokens,
          cacheReadTokens: usage.cache_read_input_tokens,
          ephemeral5mTokens: record.ephemeral5mTokens || 0,
          ephemeral1hTokens: record.ephemeral1hTokens || 0,
          totalTokens,
          isLongContextRequest: record.isLongContext || record.isLongContextRequest || false,
          cost: Number(computedCost.toFixed(6)),
          costFormatted:
            record.costFormatted ||
            costData?.formatted?.total ||
            CostCalculator.formatCost(computedCost),
          costBreakdown:
            record.costBreakdown || {
              input: costData?.costs?.input || 0,
              output: costData?.costs?.output || 0,
              cacheCreate: costData?.costs?.cacheWrite || 0,
              cacheRead: costData?.costs?.cacheRead || 0,
              total: costData?.costs?.total || computedCost
            },
          responseTime: record.responseTime || null
        })

        modelSet.add(record.model || 'unknown')
        if (record.accountId) {
          const key = `${record.accountId}:${record.accountType || 'unknown'}`
          if (!accountOptionMap.has(key)) {
            accountOptionMap.set(key, {
              id: record.accountId,
              accountType: record.accountType || 'unknown',
              name: record.accountName || null
            })
          }
        }

        if (!earliestTimestamp || ts < earliestTimestamp) earliestTimestamp = ts
        if (!latestTimestamp || ts > latestTimestamp) latestTimestamp = ts

        totalRawCount++
        if (totalRawCount >= MAX_TOTAL_USAGE_RECORDS) break
      }
    }

    allRecords.sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime()
      const bTime = new Date(b.timestamp).getTime()
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0
      return normalizedSortOrder === 'asc' ? aTime - bTime : bTime - aTime
    })

    const totalRecords = allRecords.length
    const totalPages = totalRecords > 0 ? Math.ceil(totalRecords / pageSizeNumber) : 0
    const safePage = totalPages > 0 ? Math.min(pageNumber, totalPages) : 1
    const startIndex = (safePage - 1) * pageSizeNumber
    const pageRecords =
      totalRecords === 0 ? [] : allRecords.slice(startIndex, startIndex + pageSizeNumber)

    const accountCache = new Map()
    const resolveAccountInfo = (id, type) => {
      if (!id) return null
      const cacheKey = `${type || 'any'}:${id}`
      if (accountCache.has(cacheKey)) return accountCache.get(cacheKey)

      const pick = (lookupId) => {
        const hit = accountIndex.get(lookupId)
        if (hit) {
          return {
            id,
            name: hit.name || lookupId,
            type: hit.platform || type || 'unknown'
          }
        }
        return null
      }

      let info = pick(id)
      if (!info && id.startsWith('api:')) info = pick(id.slice(4))
      if (!info && id.startsWith('responses:')) info = pick(id.slice(10))

      accountCache.set(cacheKey, info)
      return info
    }

    // 统计基于当前查询时间范围的全量记录
    const summary = allRecords.reduce(
      (acc, record) => {
        acc.totalRequests += 1
        acc.inputTokens += record.inputTokens
        acc.outputTokens += record.outputTokens
        acc.cacheCreateTokens += record.cacheCreateTokens
        acc.cacheReadTokens += record.cacheReadTokens
        acc.totalTokens += record.totalTokens
        acc.totalCost += record.cost
        return acc
      },
      {
        totalRequests: 0,
        inputTokens: 0,
        outputTokens: 0,
        cacheCreateTokens: 0,
        cacheReadTokens: 0,
        totalTokens: 0,
        totalCost: 0,
        avgCost: 0
      }
    )

    if (summary.totalRequests > 0) {
      summary.avgCost = Number((summary.totalCost / summary.totalRequests).toFixed(6))
      summary.totalCost = Number(summary.totalCost.toFixed(6))
    }

    const enrichedRecords = []

    for (const record of pageRecords) {
      const accountInfo = resolveAccountInfo(record.accountId, record.accountType)
      const resolvedType = accountInfo?.type || record.accountType || 'unknown'
      const resolvedName = accountInfo?.name || record.accountName || record.accountId || record.keyName

      const enriched = {
        ...record,
        accountName: resolvedName,
        accountType: resolvedType,
        accountTypeName: accountTypeNames[resolvedType] || '未知渠道'
      }
      enrichedRecords.push(enriched)

      summary.totalRequests += 1
      summary.inputTokens += record.inputTokens
      summary.outputTokens += record.outputTokens
      summary.cacheCreateTokens += record.cacheCreateTokens
      summary.cacheReadTokens += record.cacheReadTokens
      summary.totalTokens += record.totalTokens
      summary.totalCost += record.cost
    }

    if (summary.totalRequests > 0) {
      summary.avgCost = Number((summary.totalCost / summary.totalRequests).toFixed(6))
      summary.totalCost = Number(summary.totalCost.toFixed(6))
    }

    const accountOptions = []
    for (const option of accountOptionMap.values()) {
      const info = resolveAccountInfo(option.id, option.accountType)
      const resolvedType = info?.type || option.accountType || 'unknown'
      accountOptions.push({
        id: option.id,
        name: info?.name || option.name || option.id,
        accountType: resolvedType,
        accountTypeName: accountTypeNames[resolvedType] || '未知渠道'
      })
    }

    return res.json({
      success: true,
      data: {
        records: enrichedRecords,
        pagination: {
          currentPage: safePage,
          pageSize: pageSizeNumber,
          totalRecords,
          totalPages,
          hasNextPage: totalPages > 0 && safePage < totalPages,
          hasPreviousPage: totalPages > 0 && safePage > 1
        },
        filters: {
          startDate: startTime ? startTime.toISOString() : null,
          endDate: endTime ? endTime.toISOString() : null,
          model: model || null,
          accountId: accountId || null,
          accountType: accountType || null,
          keyId: keyId || null,
          sortOrder: normalizedSortOrder
        },
        availableFilters: {
          models: Array.from(modelSet),
          accounts: accountOptions,
          keys: keyIds.map((id) => ({ id, name: keyInfoMap.get(id)?.name || id })),
          dateRange: {
            earliest: earliestTimestamp ? earliestTimestamp.toISOString() : null,
            latest: latestTimestamp ? latestTimestamp.toISOString() : null
          }
        },
        summary,
        limits: {
          perKey: MAX_USAGE_RECORDS_PER_KEY,
          total: MAX_TOTAL_USAGE_RECORDS
        }
      }
    })
  } catch (error) {
    logger.error('❌ Failed to get usage records timeline:', error)
    return res
      .status(500)
      .json({ success: false, error: 'Failed to get usage records timeline' })
  }
})

module.exports = router
