<template>
  <div class="page-container">
    <!-- 页头 + 统计 -->
    <div class="page-header">
      <div>
        <div class="page-title">检索池 · 销售线索管理</div>
        <div class="page-subtitle">统一管理多渠道采集的销售线索，支持分配、查重、导出、回收站</div>
      </div>
    </div>

    <div class="stat-cards">
      <div class="stat-card" @click="goFilter('all')">
        <div class="stat-info">
          <div class="stat-label">线索总数</div>
          <div class="stat-value">{{ leads.length }}</div>
        </div>
        <div class="stat-icon blue"><el-icon><Files /></el-icon></div>
      </div>
      <div class="stat-card" @click="goFilter('today')">
        <div class="stat-info">
          <div class="stat-label">今日新增</div>
          <div class="stat-value">{{ todayNewCount }}</div>
        </div>
        <div class="stat-icon green"><el-icon><Plus /></el-icon></div>
      </div>
      <div class="stat-card" @click="goFilter('following')">
        <div class="stat-info">
          <div class="stat-label">跟进中</div>
          <div class="stat-value">{{ followCount }}</div>
        </div>
        <div class="stat-icon orange"><el-icon><Clock /></el-icon></div>
      </div>
      <div class="stat-card" @click="goFilter('converted')">
        <div class="stat-info">
          <div class="stat-label">已转化客户</div>
          <div class="stat-value">{{ convertedCount }}</div>
        </div>
        <div class="stat-icon purple"><el-icon><UserFilled /></el-icon></div>
      </div>
      <div class="stat-card" @click="goRecycleBin">
        <div class="stat-info">
          <div class="stat-label">回收站</div>
          <div class="stat-value">{{ recycleLeads.length }}</div>
        </div>
        <div class="stat-icon cyan"><el-icon><Delete /></el-icon></div>
      </div>
    </div>

    <!-- 选项卡 -->
    <div class="card">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="线索列表" name="list">
          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input v-model="keyword" placeholder="搜索公司名/联系人/邮箱/手机" clearable style="width:280px">
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
              <el-select v-model="filterChannel" placeholder="来源渠道" clearable style="width:140px">
                <el-option v-for="c in channels" :key="c.value" :label="c.label" :value="c.value" />
              </el-select>
              <el-select v-model="filterTag" placeholder="线索标签" clearable style="width:140px">
                <el-option v-for="t in leadTags" :key="t.value" :label="t.value" :value="t.value" />
              </el-select>
              <el-select v-model="filterStatus" placeholder="线索状态" clearable style="width:140px">
                <el-option label="全新线索" value="new" />
                <el-option label="跟进中" value="following" />
                <el-option label="已转化" value="converted" />
              </el-select>
              <el-select v-model="filterFollower" placeholder="负责人" clearable style="width:120px">
                <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.name" />
              </el-select>
              <el-date-picker
                v-model="filterDateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
                style="width:260px"
                clearable
              />
              <el-button type="primary" @click="showDuplicate">
                <el-icon><CopyDocument /></el-icon>查重 ({{ dupCount }})
              </el-button>
            </div>
            <div class="toolbar-right">
              <el-button :disabled="!selection.length" @click="batchAssign">
                <el-icon><User /></el-icon>批量分配 ({{ selection.length }})
              </el-button>
              <el-button :disabled="!selection.length" @click="batchToCustomer">
                <el-icon><Promotion /></el-icon>转客户
              </el-button>
              <el-button :disabled="!selection.length" type="danger" @click="batchDelete">
                <el-icon><Delete /></el-icon>删除
              </el-button>
              <el-button type="success" @click="doExport">
                <el-icon><Download /></el-icon>导出
              </el-button>
              <el-button type="primary" @click="showCreate = true">
                <el-icon><Plus /></el-icon>新建线索
              </el-button>
            </div>
          </div>

          <!-- 表格 -->
          <el-table :data="filteredLeads" border stripe @selection-change="s => selection = s" style="width:100%">
            <el-table-column type="selection" width="42" />
            <el-table-column prop="id" label="线索编号" width="130" />
            <el-table-column label="公司信息" min-width="220">
              <template #default="{ row }">
                <div class="company-cell">
                  <div class="co-name">{{ row.company }}
                    <el-tag v-if="row.duplicate" type="warning" size="small" effect="light" style="margin-left:6px">疑似重复</el-tag>
                  </div>
                  <div class="co-meta">
                    <el-icon><Location /></el-icon>{{ row.country }} · {{ row.source }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="联系人" width="170">
              <template #default="{ row }">
                <div>
                  <div style="font-weight:500">{{ row.contact }}</div>
                  <div class="muted">{{ row.position }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="渠道" width="110">
              <template #default="{ row }">
                <span class="tag-tag" :class="channelColor(row.channel)">
                  {{ channelLabel(row.channel) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="标签" min-width="160">
              <template #default="{ row }">
                <span v-for="t in row.tags" :key="t" class="tag-tag" :class="tagColor(t)">{{ t }}</span>
              </template>
            </el-table-column>
            <el-table-column label="预算" width="110" align="right">
              <template #default="{ row }">¥{{ formatMoney(row.budget) }}</template>
            </el-table-column>
            <el-table-column label="负责人" width="90">
              <template #default="{ row }">
                <el-tooltip :content="row.follower" placement="top">
                  <el-avatar :size="28" style="background:#2563eb;font-size:12px">{{ row.follower[0] }}</el-avatar>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="创建时间" width="150" prop="createTime" />
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag v-if="row.status==='new'" type="info" effect="light">全新</el-tag>
                <el-tag v-else-if="row.status==='following'" type="warning" effect="light">跟进中</el-tag>
                <el-tag v-else type="success" effect="light">已转化</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="190" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="toCustomer(row)">转客户</el-button>
                <el-button link type="primary" size="small" @click="assignOne(row)">分配</el-button>
                <el-button link type="danger" size="small" @click="delOne(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div style="margin-top:12px;display:flex;justify-content:flex-end">
            <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="filteredLeads.length" :page-size="10" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="回收站" name="recycle">
          <div class="toolbar">
            <div class="toolbar-left">
              <el-alert type="info" :closable="false" show-icon
                title="回收站会保留最近30天删除的线索，可还原回线索列表或彻底删除（不可恢复）。" />
            </div>
            <div class="toolbar-right">
              <el-button :disabled="!recycleSel.length" @click="batchRestore">
                <el-icon><RefreshLeft /></el-icon>批量还原 ({{ recycleSel.length }})
              </el-button>
              <el-button :disabled="!recycleSel.length" type="danger" @click="batchPurge">
                <el-icon><Delete /></el-icon>批量彻底删除
              </el-button>
            </div>
          </div>
          <el-table :data="recycleLeads" border stripe @selection-change="s => recycleSel = s">
            <el-table-column type="selection" width="42" />
            <el-table-column prop="id" label="编号" width="100" />
            <el-table-column label="公司/联系人" min-width="220">
              <template #default="{ row }">
                <div>
                  <div style="font-weight:500">{{ row.company }}</div>
                  <div class="muted">联系人：{{ row.contact }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="来源/负责人" width="180">
              <template #default="{ row }">
                <div>
                  <div v-if="row._source">来源：{{ row._source }}</div>
                  <div v-if="row._follower" class="muted">原负责人：{{ row._follower }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="deleteTime" label="删除时间" width="130" />
            <el-table-column prop="reason" label="删除原因" min-width="140" />
            <el-table-column prop="operator" label="操作人" width="90" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="restoreRow(row)">
                  <el-icon><RefreshLeft /></el-icon>还原
                </el-button>
                <el-button link type="warning" size="small" @click="restoreAndAssign(row)">
                  <el-icon><User /></el-icon>还原+分配
                </el-button>
                <el-button link type="danger" size="small" @click="purgeRow(row)">
                  <el-icon><Delete /></el-icon>彻底删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top:12px;display:flex;justify-content:flex-end">
            <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="recycleLeads.length" :page-size="10" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新建线索弹窗 -->
    <el-dialog v-model="showCreate" title="新建线索" width="640px">
      <el-form :model="form" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="公司名称"><el-input v-model="form.company" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="国家/地区"><el-input v-model="form.country" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="联系人"><el-input v-model="form.contact" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="职位"><el-input v-model="form.position" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="来源渠道">
            <el-select v-model="form.channel" style="width:100%">
              <el-option v-for="c in channels" :key="c.value" :label="c.label" :value="c.value" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="线索标签">
            <el-select v-model="form.tags" multiple style="width:100%">
              <el-option v-for="t in leadTags" :key="t.value" :label="t.value" :value="t.value" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="线索来源详情"><el-input v-model="form.source" placeholder="例：具体搜索关键词、展会名称等" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showCreate=false">取消</el-button>
        <el-button type="primary" @click="submitCreate">确认新增</el-button>
      </template>
    </el-dialog>

    <!-- 批量分配 -->
    <el-dialog v-model="assignVisible" title="分配负责人" width="400px">
      <el-form label-width="80px">
        <el-form-item label="负责人">
          <el-select v-model="assignUser" style="width:100%" placeholder="选择销售员">
            <el-option v-for="u in users" :key="u.id" :label="u.name + ' · ' + u.role" :value="u.name" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmAssign">确认分配</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { leads as _leads, recycleLeads as _recycle, users, channels, leadTags } from '@/mock'

const leads = ref([..._leads])
const recycleLeads = ref([..._recycle])
const activeTab = ref('list')
const selection = ref([])
const recycleSel = ref([])

// 把回收站内恢复时保存的「完整线索快照」映射：如果 recycleRow 缺少 _lead（老数据），
// 就用已有关键字段拼一个最小记录
const buildRestoreLeadFromRecycle = r => {
  if (r._lead) return { ...r._lead }
  return {
    id: r.id,
    company: r.company,
    contact: r.contact,
    country: '-',
    position: '-',
    email: '',
    phone: '',
    channel: r._source || '其他',
    tags: [],
    follower: r._follower || '未分配',
    status: 'new',
    createTime: '2026-09-02',
    updateTime: '2026-09-02',
    duplicate: false,
    source: r._source || ''
  }
}

const keyword = ref('')
const filterChannel = ref('')
const filterTag = ref('')
const filterStatus = ref('')
const filterFollower = ref('')

const showCreate = ref(false)
const assignVisible = ref(false)
const assignUser = ref('')
const assignTargets = ref([])

const form = reactive({
  company: '', country: '', contact: '', position: '', email: '', phone: '',
  channel: '', tags: [], source: ''
})

const followCount = computed(() => leads.value.filter(l => l.status === 'following').length)
const convertedCount = computed(() => leads.value.filter(l => l.status === 'converted').length)
const dupCount = computed(() => leads.value.filter(l => l.duplicate).length)
const todayNewCount = computed(() => leads.value.filter(l => l.createTime && l.createTime.startsWith('2026-09-02')).length)

// 统计卡点击后跳转到列表并应用对应筛选条件
const goFilter = type => {
  activeTab.value = 'list'
  // 每次点击都重置其他条件，避免干扰
  keyword.value = ''
  filterChannel.value = ''
  filterTag.value = ''
  filterFollower.value = ''
  filterStatus.value = ''
  filterDateRange.value = null
  if (type === 'today') {
    filterDateRange.value = ['2026-09-02', '2026-09-02']
    ElMessage.success('已切换到「今日新增」线索')
  } else if (type === 'following') {
    filterStatus.value = 'following'
    ElMessage.success('已筛选出「跟进中」的线索')
  } else if (type === 'converted') {
    filterStatus.value = 'converted'
    ElMessage.success('已筛选出「已转化」的线索')
  } else if (type === 'all') {
    ElMessage.success('已重置筛选，显示全部线索')
  }
}
const goRecycleBin = () => {
  activeTab.value = 'recycle'
  recycleSel.value = []
  ElMessage.info('已跳转到回收站')
}

// 用于「今日新增」的日期范围筛选
const filterDateRange = ref(null)

const filteredLeads = computed(() => {
  return leads.value.filter(l => {
    if (keyword.value) {
      const k = keyword.value.toLowerCase()
      if (!(l.company.toLowerCase().includes(k) || l.contact.toLowerCase().includes(k) ||
            l.email.toLowerCase().includes(k) || l.phone.includes(k))) return false
    }
    if (filterChannel.value && l.channel !== filterChannel.value) return false
    if (filterTag.value && !l.tags.includes(filterTag.value)) return false
    if (filterStatus.value && l.status !== filterStatus.value) return false
    if (filterFollower.value && l.follower !== filterFollower.value) return false
    if (filterDateRange.value && filterDateRange.value.length === 2 && l.createTime) {
      const day = l.createTime.slice(0, 10)
      if (day < filterDateRange.value[0] || day > filterDateRange.value[1]) return false
    }
    return true
  })
})

const channelLabel = v => (channels.find(c => c.value === v) || {}).label || v
const channelColor = v => (channels.find(c => c.value === v) || {}).color || 'gray'
const tagColor = v => (leadTags.find(t => t.value === v) || {}).color || 'gray'

const formatMoney = v => (v || 0).toLocaleString()

const batchAssign = () => { assignTargets.value = [...selection.value]; assignVisible.value = true }
const assignOne = row => { assignTargets.value = [row]; assignVisible.value = true }
const confirmAssign = () => {
  if (!assignUser.value) return ElMessage.warning('请选择负责人')
  assignTargets.value.forEach(r => { const x = leads.value.find(i => i.id === r.id); if (x) x.follower = assignUser.value })
  ElMessage.success(`已将 ${assignTargets.value.length} 条线索分配给 ${assignUser.value}`)
  assignVisible.value = false
  assignUser.value = ''
}

const batchToCustomer = () => confirmToCustomer(selection.value)
const toCustomer = row => confirmToCustomer([row])
const confirmToCustomer = async rows => {
  try {
    await ElMessageBox.confirm(`确认将选中的 ${rows.length} 条线索转化为客户档案？`, '线索转客户', { type: 'warning' })
    rows.forEach(r => { const x = leads.value.find(i => i.id === r.id); if (x) x.status = 'converted' })
    ElMessage.success('转化成功！客户档案已新增')
  } catch {}
}

const batchDelete = () => confirmDel(selection.value)
const delOne = row => confirmDel([row])
const confirmDel = async rows => {
  try {
    await ElMessageBox.confirm(`将 ${rows.length} 条线索移入回收站？`, '删除线索', { type: 'warning' })
    // 先把被删线索转成回收站记录插入 recycleLeads，**保存完整快照**便于还原
    rows.forEach(r => {
      const original = leads.value.find(i => i.id === r.id)
      if (original) {
        recycleLeads.value.unshift({
          id: original.id,
          company: original.company,
          contact: original.contact,
          deleteTime: '2026-09-02',
          reason: '手动删除',
          operator: '张伟',
          _source: original.channel,
          _follower: original.follower,
          _lead: { ...original } // 保存完整快照，还原时无信息丢失
        })
      }
    })
    // 再从线索列表移除
    rows.forEach(r => { leads.value = leads.value.filter(i => i.id !== r.id) })
    selection.value = []
    ElMessage.success(`已移入回收站（共 ${rows.length} 条），可在回收站还原或彻底删除`)
  } catch {}
}

// ============ 回收站操作 ============
const _internalRestoreNoMessage = rows => {
  const restores = rows.map(r => {
    const lead = buildRestoreLeadFromRecycle(r)
    lead.updateTime = '2026-09-02'
    return { id: r.id, lead }
  })
  // 先从回收站移除
  const ids = new Set(restores.map(x => x.id))
  recycleLeads.value = recycleLeads.value.filter(r => !ids.has(r.id))
  recycleSel.value = []
  // 再塞回线索列表头部（避免重复插入同 ID）
  restores.forEach(({ id, lead }) => {
    const exists = leads.value.find(l => l.id === id)
    if (!exists) leads.value.unshift(lead)
  })
  return restores.length
}

const restoreRow = async row => {
  try {
    await ElMessageBox.confirm(`确认还原「${row.company}」回线索列表？`, '还原线索', { type: 'info' })
    const n = _internalRestoreNoMessage([row])
    ElMessage.success(`已成功还原 ${n} 条线索到线索列表`)
    activeTab.value = 'list'
  } catch {}
}
const batchRestore = async () => {
  if (!recycleSel.value.length) return ElMessage.warning('请先选择要还原的线索（点击左侧选择框）')
  try {
    await ElMessageBox.confirm(`确认从回收站还原 ${recycleSel.value.length} 条线索回线索列表？`, '批量还原', { type: 'info' })
    const n = _internalRestoreNoMessage(recycleSel.value)
    ElMessage.success(`批量还原成功，共 ${n} 条`)
    activeTab.value = 'list'
  } catch {}
}

const restoreAndAssign = async row => {
  try {
    await ElMessageBox.confirm(`还原「${row.company}」并打开分配负责人对话框？`, '还原并分配', { type: 'info' })
    const n = _internalRestoreNoMessage([row])
    if (!n) return
    const lead = leads.value.find(l => l.id === row.id)
    assignTargets.value = lead ? [lead] : []
    assignUser.value = row._follower || users[0]?.name || ''
    assignVisible.value = true
    activeTab.value = 'list'
    ElMessage.success('已还原，现在请指派负责人')
  } catch {}
}

const purgeRow = async row => {
  try {
    await ElMessageBox.confirm(
      `彻底删除「${row.company}」？<br/><b style="color:#ef4444">删除后不可恢复！</b>`,
      '彻底删除',
      { type: 'warning', dangerouslyUseHTMLString: true, confirmButtonText: '确认彻底删除' }
    )
    recycleLeads.value = recycleLeads.value.filter(r => r.id !== row.id)
    ElMessage.success('已从回收站彻底删除')
  } catch {}
}

const batchPurge = async () => {
  if (!recycleSel.value.length) return ElMessage.warning('请先选择要彻底删除的线索')
  try {
    await ElMessageBox.confirm(
      `确认彻底删除 ${recycleSel.value.length} 条？<br/><b style="color:#ef4444">此操作不可撤销！</b>`,
      '批量彻底删除',
      { type: 'warning', dangerouslyUseHTMLString: true, confirmButtonText: '确认彻底删除' }
    )
    const ids = new Set(recycleSel.value.map(r => r.id))
    recycleLeads.value = recycleLeads.value.filter(r => !ids.has(r.id))
    recycleSel.value = []
    ElMessage.success(`已彻底删除 ${ids.size} 条`)
  } catch {}
}

const doExport = () => ElMessage.success(`已导出 ${filteredLeads.value.length} 条线索`)

const showDuplicate = () => {
  filterStatus.value = ''
  const dupList = leads.value.filter(l => l.duplicate).map(l => l.company).join('、')
  ElMessageBox.alert(`发现疑似重复线索 ${dupCount.value} 条：<br/>${dupList}`, '线索查重结果', {
    type: 'warning', dangerouslyUseHTMLString: true, confirmButtonText: '去处理'
  })
}

const submitCreate = () => {
  if (!form.company || !form.contact) return ElMessage.warning('公司名和联系人为必填')
  const id = 'L' + Date.now().toString().slice(-9)
  leads.value.unshift({
    id, company: form.company, contact: form.contact, position: form.position,
    email: form.email, phone: form.phone, country: form.country,
    channel: form.channel, tags: form.tags, budget: 0,
    source: form.source || '手动录入', follower: '张伟',
    createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
    status: 'new', duplicate: false
  })
  ElMessage.success('线索创建成功')
  showCreate.value = false
  Object.keys(form).forEach(k => Array.isArray(form[k]) ? (form[k] = []) : (form[k] = ''))
}
</script>

<style scoped lang="scss">
.company-cell {
  .co-name { font-weight: 600; color: #1e293b; }
  .co-meta { font-size: 12px; color: #64748b; margin-top: 4px;
    display: flex; align-items: center; gap: 4px;
  }
}
.muted { color: #64748b; font-size: 12px; }
</style>
