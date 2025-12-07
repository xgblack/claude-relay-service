<!-- eslint-disable vue/attributes-order, prettier/prettier -->
<template>
  <div class="space-y-4 p-4 lg:p-6">
    <div class="flex items-center justify-end gap-2 text-sm text-gray-500 dark:text-gray-400">
      <el-button :loading="loading" size="small" type="primary" @click="refresh">
        <i class="fas fa-sync-alt mr-1" />刷新
      </el-button>
    </div>

    <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div class="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <el-input
          v-model="filters.keyId"
          clearable
          placeholder="API Key ID"
          size="small"
          @clear="refresh(true)"
          @keyup.enter="refresh(true)"
        />
        <el-input
          v-model="filters.accountId"
          clearable
          placeholder="账户 ID"
          size="small"
          @clear="refresh(true)"
          @keyup.enter="refresh(true)"
        />
        <el-select
          v-model="filters.accountType"
          clearable
          filterable
          placeholder="渠道"
          size="small"
          @change="refresh(true)"
        >
          <el-option
            v-for="item in accountTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-input
          v-model="filters.model"
          clearable
          placeholder="模型"
          size="small"
          @clear="refresh(true)"
          @keyup.enter="refresh(true)"
        />
        <el-date-picker
          v-model="filters.dateRange"
          class="md:col-span-2"
          clearable
          end-placeholder="结束时间"
          format="YYYY-MM-DD HH:mm:ss"
          range-separator="至"
          start-placeholder="开始时间"
          type="datetimerange"
          unlink-panels
          value-format="YYYY-MM-DDTHH:mm:ss[Z]"
          @change="refresh(true)"
        />
        <div class="flex items-center gap-3">
          <el-button size="small" @click="resetFilters">重置</el-button>
        </div>
      </div>

      <div class="table-scroll">
        <el-table
          :data="records"
          :stripe="true"
          size="small"
          :border="false"
          :row-class-name="() => 'usage-row'"
          v-loading="loading"
          class="usage-table"
        >
          <el-table-column label="时间" width="140">
            <template #default="scope">
              <div class="flex flex-col">
                <span class="font-medium">{{ formatTime(scope.row.timestamp) }}</span>
                <span class="text-xs text-gray-500">{{ formatRelativeTime(scope.row.timestamp) }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="API Key" width="180">
            <template #default="scope">
              <span class="font-medium">{{ scope.row.keyName || scope.row.keyId || '未知 Key' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="渠道" prop="accountTypeName" width="200" />
          <el-table-column label="账户" min-width="200">
            <template #default="scope">
              <span class="font-medium">{{ scope.row.accountName || '未知' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="模型" prop="model" min-width="120" />
          <el-table-column label="输入" prop="inputTokens" :formatter="formatNumber" width="80" />
          <el-table-column label="输出" prop="outputTokens" :formatter="formatNumber" width="80" />
          <el-table-column label="缓存创建" prop="cacheCreateTokens" width="100">
            <template #default="scope">
              <span :class="cacheTokenClass(scope.row.cacheCreateTokens)">
                {{ formatNumber(null, null, scope.row.cacheCreateTokens) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="缓存读取" prop="cacheReadTokens" width="100">
            <template #default="scope">
              <span :class="cacheTokenClass(scope.row.cacheReadTokens)">
                {{ formatNumber(null, null, scope.row.cacheReadTokens) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="总 Token" prop="totalTokens" width="100">
            <template #default="scope">
              <span class="font-semibold text-gray-900 dark:text-gray-100">
                {{ formatNumber(null, null, scope.row.totalTokens) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="费用" prop="cost" width="100">
            <template #default="scope">
              <span class="text-emerald-600 dark:text-emerald-400 font-semibold">
                {{ formatCost(null, null, scope.row.cost) }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="mt-3 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
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
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
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
  accountType: '',
  model: '',
  dateRange: null,
  sortOrder: 'desc'
})

const pagination = reactive({
  currentPage: 1,
  pageSize: 20,
  totalRecords: 0
})

const pageSizes = [20, 50, 100]

const accountTypeOptions = [
  { label: 'Claude官方', value: 'claude' },
  { label: 'Claude Console', value: 'claude-console' },
  { label: 'Claude Console Relay', value: 'ccr' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'OpenAI Responses', value: 'openai-responses' },
  { label: 'Gemini', value: 'gemini' },
  { label: 'Gemini API', value: 'gemini-api' },
  { label: 'Droid', value: 'droid' },
  { label: 'Azure OpenAI', value: 'azure-openai' },
  { label: 'Bedrock', value: 'bedrock' }
]
const formatNumber = (_row, _column, value) => {
  const num = Number(value) || 0
  if (num >= 1000000) return `${(num / 1000000).toFixed(2)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const formatCost = (_row, _column, value) => {
  const num = Number(value) || 0
  if (num >= 1) return `$${num.toFixed(2)}`
  if (num >= 0.01) return `$${num.toFixed(3)}`
  return `$${num.toFixed(6)}`
}

const formatTime = (value) => (value ? dayjs(value).format('MM-DD HH:mm:ss') : '--')
const formatRelativeTime = (value) => (value ? dayjs(value).fromNow() : '--')

const cacheTokenClass = (val) => {
  const num = Number(val) || 0
  if (num <= 0) return 'text-gray-400'
  return 'text-purple-600 dark:text-purple-400 font-semibold'
}

const buildParams = (page) => {
  const params = {
    page,
    pageSize: pagination.pageSize,
    sortOrder: filters.sortOrder
  }
  if (filters.keyId) params.keyId = filters.keyId
  if (filters.accountId) params.accountId = filters.accountId
  if (filters.accountType) params.accountType = filters.accountType
  if (filters.model) params.model = filters.model
  if (filters.dateRange && filters.dateRange.length === 2) {
    params.startDate = filters.dateRange[0]
    params.endDate = filters.dateRange[1]
  }
  return params
}

const fetchRecords = async (page = 1) => {
  loading.value = true
  try {
    const resp = await apiClient.get('/admin/plus/usage-records', { params: buildParams(page) })
    const data = resp.data || {}
    records.value = data.records || []
    const p = data.pagination || {}
    pagination.currentPage = p.currentPage || page
    pagination.pageSize = p.pageSize || pagination.pageSize
    pagination.totalRecords = p.totalRecords || 0
  } catch (e) {
    showToast(`加载调用明细失败: ${e.message || '未知错误'}`, 'error')
  } finally {
    loading.value = false
  }
}

const refresh = (resetPage = false) => {
  if (resetPage) pagination.currentPage = 1
  fetchRecords(pagination.currentPage)
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
  filters.accountType = ''
  filters.model = ''
  filters.dateRange = null
  filters.sortOrder = 'desc'
  refresh(true)
}

onMounted(() => {
  fetchRecords(1)
})
</script>

<style scoped>
.usage-table :global(.el-table__inner-wrapper) {
  border: none;
}
.usage-table :global(.el-table__header-wrapper th) {
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.usage-table :global(.el-table__body-wrapper td) {
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-right: none;
}
.usage-table :global(.el-table__body-wrapper tr) {
  border-left: none;
  border-right: none;
}
.usage-table :global(.el-table__row) {
  border-left: none;
  border-right: none;
}
.usage-table :global(.el-table__row:last-child td) {
  border-bottom: none;
}
.usage-row:hover > td {
  background: rgba(59, 130, 246, 0.04) !important;
}
.table-scroll {
  max-height: 45vh;
  overflow: auto;
}
</style>
