<!-- eslint-disable vue/attributes-order, prettier/prettier -->
<template>
  <div class="space-y-4 p-4 lg:p-6">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
          调用明细时间线（全量）
        </p>
        <h2 class="text-xl font-bold text-gray-900 dark:text-gray-100">所有 API Key</h2>
        <p class="text-xs text-gray-500 dark:text-gray-400">按时间排序展示最近调用</p>
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <i class="fas fa-clock text-blue-500" />
        <span v-if="dateRangeHint">{{ dateRangeHint }}</span>
        <span v-else>显示近 {{ limits.total }} 条以内记录</span>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div
        class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <p class="text-xs uppercase text-gray-500 dark:text-gray-400">总请求</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ formatNumber(summary.totalRequests) }}
        </p>
      </div>
      <div
        class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <p class="text-xs uppercase text-gray-500 dark:text-gray-400">总 Token</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ formatNumber(summary.totalTokens) }}
        </p>
      </div>
      <div
        class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <p class="text-xs uppercase text-gray-500 dark:text-gray-400">总费用</p>
        <p class="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {{ formatCost(summary.totalCost) }}
        </p>
      </div>
      <div
        class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
      >
        <p class="text-xs uppercase text-gray-500 dark:text-gray-400">平均费用/次</p>
        <p class="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ formatCost(summary.avgCost) }}
        </p>
      </div>
    </div>

    <div
      class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <div class="flex flex-wrap items-center gap-3">
        <el-date-picker
          v-model="filters.dateRange"
          class="max-w-[320px]"
          clearable
          end-placeholder="结束时间"
          format="MM-DD HH:mm:ss"
          start-placeholder="开始时间"
          type="datetimerange"
          unlink-panels
          value-format="YYYY-MM-DDTHH:mm:ssZ"
        />

        <el-select
          v-model="filters.model"
          class="w-[180px]"
          clearable
          filterable
          placeholder="所有模型"
        >
          <el-option
            v-for="modelOption in availableModels"
            :key="modelOption"
            :label="modelOption"
            :value="modelOption"
          />
        </el-select>

        <el-select
          v-model="filters.accountId"
          class="w-[220px]"
          clearable
          filterable
          placeholder="所有账户"
        >
          <el-option
            v-for="account in availableAccounts"
            :key="account.id"
            :label="`${account.name}（${account.accountTypeName}）`"
            :value="account.id"
          />
        </el-select>

        <el-select
          v-model="filters.keyId"
          class="w-[200px]"
          clearable
          filterable
          placeholder="所有 API Key"
        >
          <el-option
            v-for="key in availableKeys"
            :key="key.id"
            :label="`${key.name}（${key.id}）`"
            :value="key.id"
          />
        </el-select>

        <el-select v-model="filters.sortOrder" class="w-[140px]" placeholder="排序">
          <el-option label="时间降序" value="desc" />
          <el-option label="时间升序" value="asc" />
        </el-select>

        <el-button @click="resetFilters"> <i class="fas fa-undo mr-2" /> 重置 </el-button>
      </div>
    </div>

    <div
      class="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <div
        v-if="loading"
        class="flex items-center justify-center p-10 text-gray-500 dark:text-gray-400"
      >
        <i class="fas fa-spinner fa-spin mr-2" /> 加载中...
      </div>
      <div v-else>
        <div
          v-if="records.length === 0"
          class="flex flex-col items-center gap-2 p-10 text-gray-500 dark:text-gray-400"
        >
          <i class="fas fa-inbox text-2xl" />
          <p>暂无记录</p>
        </div>
        <div v-else class="space-y-4">
          <div class="hidden overflow-x-auto md:block">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    时间
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    API Key
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    账户
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    模型
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    输入
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    输出
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    缓存(创/读)
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    总 Token
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                    费用
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
                <tr v-for="record in records" :key="record.timestamp + record.model + record.keyId">
                  <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                    <div class="flex flex-col">
                      <span>{{ formatDate(record.timestamp) }}</span>
                      <span class="text-xs text-gray-500">{{ formatRelative(record.timestamp) }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                    <div class="flex flex-col">
                      <span class="font-semibold">{{ record.keyName || record.keyId || '未知 Key' }}</span>
                      <span class="text-xs text-gray-500">ID: {{ record.keyId }}</span>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                    <div class="flex flex-col">
                      <span class="font-semibold">{{ record.accountName || '未知账户' }}</span>
                      <span class="text-xs text-gray-500">{{ record.accountTypeName || '未知渠道' }}</span>
                    </div>
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                    {{ record.model }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-sm text-blue-600 dark:text-blue-400">
                    {{ formatNumber(record.inputTokens) }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-sm text-green-600 dark:text-green-400">
                    {{ formatNumber(record.outputTokens) }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-sm text-purple-600 dark:text-purple-400">
                    {{ formatNumber(record.cacheCreateTokens) }} /
                    {{ formatNumber(record.cacheReadTokens) }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-800 dark:text-gray-100">
                    {{ formatNumber(record.totalTokens) }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-sm text-yellow-600 dark:text-yellow-400">
                    {{ record.costFormatted || formatCost(record.cost) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="space-y-3 md:hidden">
            <div
              v-for="record in records"
              :key="record.timestamp + record.model + record.keyId + 'm'"
              class="rounded-lg border border-gray-200 p-3 dark:border-gray-800"
            >
              <div class="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {{ record.keyName || record.keyId || '未知 Key' }}
              </div>
              <div class="text-xs text-gray-500">ID: {{ record.keyId }}</div>
              <div class="mt-1 text-xs text-gray-500">
                {{ formatDate(record.timestamp) }} · {{ formatRelative(record.timestamp) }}
              </div>
              <div class="mt-1 text-sm text-gray-800 dark:text-gray-100">
                {{ record.accountName || '未知账户' }}（{{ record.accountTypeName || '未知渠道' }}）
              </div>
              <div class="mt-1 text-xs text-gray-500">模型: {{ record.model }}</div>
              <div class="mt-1 text-xs text-blue-600 dark:text-blue-400">
                输入 {{ formatNumber(record.inputTokens) }} | 输出 {{ formatNumber(record.outputTokens) }}
              </div>
              <div class="mt-1 text-xs text-purple-600 dark:text-purple-400">
                缓存 {{ formatNumber(record.cacheCreateTokens) }} / {{ formatNumber(record.cacheReadTokens) }}
              </div>
              <div class="mt-1 text-xs text-gray-700 dark:text-gray-200">
                总 Token {{ formatNumber(record.totalTokens) }} · 费用
                <span class="text-yellow-600 dark:text-yellow-400">
                  {{ record.costFormatted || formatCost(record.cost) }}
                </span>
              </div>
            </div>
          </div>

          <div
            class="flex flex-col gap-2 border-t border-gray-100 px-4 py-3 text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400 md:flex-row md:items-center md:justify-between"
          >
            <div>
              共 {{ pagination.totalRecords }} 条 · 每页
              <el-select
                v-model="pagination.pageSize"
                size="small"
                style="width: 90px"
                @change="handleSizeChange"
              >
                <el-option v-for="size in pageSizes" :key="size" :label="size" :value="size" />
              </el-select>
            </div>
            <el-pagination
              background
              layout="prev, pager, next"
              :current-page="pagination.currentPage"
              :page-size="pagination.pageSize"
              :total="pagination.totalRecords"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { apiClient } from '@/config/api'
import { showToast } from '@/utils/toast'

dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

const records = ref([])
const loading = ref(false)

const filters = reactive({
  keyId: '',
  accountId: '',
  model: '',
  dateRange: null,
  sortOrder: 'desc'
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  totalRecords: 0
})

const limits = reactive({
  total: 20000
})

const summary = reactive({
  totalRequests: 0,
  totalTokens: 0,
  totalCost: 0,
  avgCost: 0
})

const pageSizes = [20, 50, 100]

const availableModels = ref([])
const availableAccounts = ref([])
const availableKeys = ref([])

const dateRangeHint = computed(() => {
  if (!filters.dateRange || filters.dateRange.length !== 2) return ''
  const [start, end] = filters.dateRange
  return `${formatDate(start)} 至 ${formatDate(end)}`
})

const formatNumber = (value) => {
  const num = Number(value) || 0
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

const formatCost = (value) => {
  const num = Number(value) || 0
  if (num >= 1) return `$${num.toFixed(2)}`
  if (num >= 0.01) return `$${num.toFixed(3)}`
  return `$${num.toFixed(6)}`
}

const formatDate = (value) => (value ? dayjs(value).format('MM-DD HH:mm:ss') : '--')
const formatRelative = (value) => (value ? dayjs(value).fromNow() : '--')

const setTodayRange = () => {
  const start = dayjs().startOf('day').format('YYYY-MM-DDTHH:mm:ssZ')
  const end = dayjs().endOf('day').format('YYYY-MM-DDTHH:mm:ssZ')
  filters.dateRange = [start, end]
}

const buildParams = (page) => {
  const params = {
    page,
    pageSize: pagination.pageSize,
    sortOrder: filters.sortOrder
  }
  if (filters.model) params.model = filters.model
  if (filters.accountId) params.accountId = filters.accountId
  if (filters.keyId) params.keyId = filters.keyId
  if (filters.dateRange && filters.dateRange.length === 2) {
    params.startDate = filters.dateRange[0]
    params.endDate = filters.dateRange[1]
  }
  return params
}

const fetchRecords = async (page = 1) => {
  loading.value = true
  try {
    // apiClient 返回的就是 JSON 对象: { success, data }
    const resp = await apiClient.get('/admin/usage-records-timeline', { params: buildParams(page) })
    const data = resp.data || resp || {}
    records.value = data.records || []
    const p = data.pagination || {}
    pagination.currentPage = p.currentPage || page
    pagination.pageSize = p.pageSize || pagination.pageSize
    pagination.totalRecords = p.totalRecords || 0

    limits.total = data.limits?.total || limits.total

    // 补集 summary，避免后端缺省导致 undefined
    const summaryData = data.summary || {}
    summary.totalRequests = summaryData.totalRequests || 0
    summary.totalTokens = summaryData.totalTokens || 0
    summary.totalCost = summaryData.totalCost || 0
    summary.avgCost = summaryData.avgCost || 0

    const filtersData = data.availableFilters || {}
    availableModels.value = filtersData.models || []
    availableAccounts.value = filtersData.accounts || []
    availableKeys.value = filtersData.keys || []
  } catch (e) {
    showToast(`加载调用明细失败: ${e.message || '未知错误'}`, 'error')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page) => {
  pagination.currentPage = page
  fetchRecords(page)
}

const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.currentPage = 1
  fetchRecords(1)
}

const resetFilters = () => {
  filters.keyId = ''
  filters.accountId = ''
  filters.model = ''
  setTodayRange()
  filters.sortOrder = 'desc'
  pagination.currentPage = 1
  fetchRecords(1)
}

onMounted(() => {
  setTodayRange()
  fetchRecords(1)
})
</script>

<style scoped>
.table-scroll {
  max-height: 45vh;
  overflow: auto;
}
</style>
