<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <div class="page-title">商机管理</div>
        <div class="page-subtitle">采购咨询商机跟进 · 阶段看板 · 销售漏斗 · 到期提醒</div>
      </div>
    </div>

    <!-- 到期提醒 -->
    <el-alert v-if="dueOppo.length" type="warning" :closable="false" show-icon style="margin-bottom:16px">
      <template #title>
        <span>有 <b>{{ dueOppo.length }}</b> 个商机将在7天内到达预计成交日，</span>
        <el-button link type="warning" @click="scrollToKanban">查看详情 →</el-button>
      </template>
    </el-alert>

    <!-- 统计 -->
    <div class="stat-cards">
      <div class="stat-card" @click="viewMode = 'kanban'">
        <div class="stat-info"><div class="stat-label">商机总数</div><div class="stat-value">{{ opps.length }}</div></div>
        <div class="stat-icon blue"><el-icon><Files /></el-icon></div>
      </div>
      <div class="stat-card" @click="viewMode = 'list'">
        <div class="stat-info"><div class="stat-label">预计总金额(¥)</div><div class="stat-value">{{ m(totalAmount) }}</div></div>
        <div class="stat-icon green"><el-icon><Money /></el-icon></div>
      </div>
      <div class="stat-card" @click="viewMode = 'list'">
        <div class="stat-info"><div class="stat-label">加权金额(¥)</div><div class="stat-value">{{ m(weightedAmount) }}</div></div>
        <div class="stat-icon orange"><el-icon><TrendCharts /></el-icon></div>
      </div>
      <div class="stat-card" @click="filterByStage('win')">
        <div class="stat-info"><div class="stat-label">已成交(¥)</div><div class="stat-value">{{ m(winAmount) }}</div></div>
        <div class="stat-icon purple"><el-icon><CircleCheck /></el-icon></div>
      </div>
      <div class="stat-card" @click="scrollToKanban">
        <div class="stat-info"><div class="stat-label">本月预计成交</div><div class="stat-value">{{ m(sepAmount) }}</div></div>
        <div class="stat-icon cyan"><el-icon><Present /></el-icon></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="tabs-inline">
          <el-radio-group v-model="viewMode" size="small">
            <el-radio-button value="kanban">看板视图</el-radio-button>
            <el-radio-button value="list">列表视图</el-radio-button>
            <el-radio-button value="funnel">销售漏斗</el-radio-button>
          </el-radio-group>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <el-input v-model="kw" placeholder="搜索商机名/客户/产品" clearable style="width:240px" :prefix-icon="Search" />
          <el-select v-model="ownerFilter" placeholder="负责人" clearable style="width:120px">
            <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.name" />
          </el-select>
          <el-select v-model="priorityFilter" placeholder="优先级" clearable style="width:110px">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
          </el-select>
          <el-select v-model="stageFilter" placeholder="商机阶段" clearable style="width:130px">
            <el-option v-for="s in opportunityStages" :key="s.key" :label="s.name" :value="s.key" />
          </el-select>
          <el-tag v-if="stageFilter" closable type="warning" effect="light" style="margin-left:4px" @close="stageFilter=null">
            阶段：{{ stageName(stageFilter) }}（点击漏斗或已成交统计卡可触发）
          </el-tag>
          <el-button type="primary" @click="showCreate = true">
            <el-icon><Plus /></el-icon>新建商机
          </el-button>
        </div>
      </div>

      <!-- ========== 看板视图 ========== -->
      <div v-if="viewMode === 'kanban'" id="kanban-area" class="kanban-wrap">
        <div v-for="stage in opportunityStages" :key="stage.key" class="kanban-col">
          <div class="col-head" :style="{borderColor: stage.color, background: stage.color + '10'}">
            <span class="col-bar" :style="{background: stage.color}"></span>
            <b>{{ stage.name }}</b>
            <el-tag size="small" effect="plain" style="margin-left:auto">{{ byStage(stage.key).length }} 个</el-tag>
            <el-tag size="small" type="warning" effect="plain" style="margin-left:4px">¥{{ m(stageAmount(stage.key)) }}</el-tag>
          </div>
          <div class="col-body">
            <div v-for="op in byStage(stage.key)" :key="op.id" class="oppo-card" @click="showDetail(op)">
              <div class="card-top">
                <el-tag size="small" effect="light"
                  :type="op.priority==='high'?'danger':op.priority==='medium'?'warning':'info'">
                  {{ op.priority==='high'?'高优':op.priority==='medium'?'中':'低' }}
                </el-tag>
                <span class="oppo-id muted">{{ op.id }}</span>
              </div>
              <div class="card-title">{{ op.name }}</div>
              <div class="card-customer">
                <el-icon><OfficeBuilding /></el-icon>
                {{ op.customer }}
              </div>
              <div class="card-product muted">
                <el-icon><Goods /></el-icon>{{ op.product }}
              </div>
              <div class="card-mid">
                <div class="amount">¥{{ m(op.amount) }}</div>
                <el-progress :percentage="op.probability" :stroke-width="8" style="width:80px" />
              </div>
              <div class="card-foot">
                <span><el-icon><Calendar /></el-icon>{{ op.expectedDate }}</span>
                <el-avatar :size="22" style="background:#2563eb;font-size:11px" :title="op.owner">{{ op.owner[0] }}</el-avatar>
              </div>
            </div>
            <div v-if="byStage(stage.key).length === 0" class="empty-col">暂无商机</div>
          </div>
        </div>
      </div>

      <!-- ========== 列表视图 ========== -->
      <div v-if="viewMode === 'list'">
        <el-table :data="filteredOpps" border stripe>
          <el-table-column prop="id" label="编号" width="90" />
          <el-table-column label="商机名称" min-width="220">
            <template #default="{ row }">
              <div>
                <div class="link-blue" @click="showDetail(row)">{{ row.name }}</div>
                <div class="muted"><el-icon><OfficeBuilding /></el-icon>{{ row.customer }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="product" label="意向产品" width="180" />
          <el-table-column label="金额(¥)" width="120" align="right">
            <template #default="{ row }">{{ m(row.amount) }}</template>
          </el-table-column>
          <el-table-column label="预算(¥)" width="120" align="right">
            <template #default="{ row }">{{ m(row.budget) }}</template>
          </el-table-column>
          <el-table-column label="阶段" width="110">
            <template #default="{ row }">
              <el-tag :color="stageColor(row.stage)" effect="dark" style="color:#fff">{{ stageName(row.stage) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="成交概率" width="130">
            <template #default="{ row }"><el-progress :percentage="row.probability" :stroke-width="8" /></template>
          </el-table-column>
          <el-table-column label="预计成交" width="120">
            <template #default="{ row }">
              <span :class="dueClass(row)">{{ row.expectedDate }}</span>
              <el-tag v-if="isDue(row)" size="small" type="danger" effect="light" style="margin-left:4px">将到期</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="负责人" width="90">
            <template #default="{ row }">
              <el-tooltip :content="row.owner"><el-avatar :size="26" style="background:#2563eb;font-size:12px">{{ row.owner[0] }}</el-avatar></el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="优先级" width="80">
            <template #default="{ row }">
              <el-tag size="small" effect="light"
                :type="row.priority==='high'?'danger':row.priority==='medium'?'warning':'info'">
                {{ row.priority==='high'?'高':row.priority==='medium'?'中':'低' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="advanceStage(row)">推进阶段</el-button>
              <el-button link type="primary" size="small" @click="showDetail(row)">详情</el-button>
              <el-button link type="danger" size="small">输单</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- ========== 销售漏斗 ========== -->
      <div v-if="viewMode === 'funnel'" class="funnel-wrap">
        <div class="funnel-chart">
          <div v-for="(s, i) in funnelData" :key="s.key"
            class="funnel-stage clickable"
            :title="'点击查看「' + s.name + '」的商机列表'"
            @click="filterByStage(s.key)"
            :style="{ width: s.w + '%', background: s.bg }">
            <div class="f-left">
              <div class="f-name">{{ s.name }}</div>
              <div class="f-num muted">{{ s.count }} 个商机</div>
            </div>
            <div class="f-right">
              <div class="f-amount">¥{{ m(s.amount) }}</div>
              <div class="f-rate">转化率 {{ s.rate }}%</div>
            </div>
          </div>
        </div>
        <div class="funnel-summary">
          <h4>漏斗分析概览</h4>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="顶层线索入商机">{{ funnelData[0].count }} 个</el-descriptions-item>
            <el-descriptions-item label="成交转化率">{{ funnelData[3].rate }}%</el-descriptions-item>
            <el-descriptions-item label="漏斗总额(全阶段)">¥{{ m(funnelTotal) }}</el-descriptions-item>
            <el-descriptions-item label="平均周期">约 23 天</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
    </div>

    <!-- 商机详情抽屉 -->
    <el-drawer v-model="detailVisible" title="商机详情" size="560px">
      <div v-if="currentOppo" class="detail-wrap">
        <div class="detail-top">
          <h3>{{ currentOppo.name }}</h3>
          <el-tag :color="stageColor(currentOppo.stage)" effect="dark" style="color:#fff;margin-right:6px">{{ stageName(currentOppo.stage) }}</el-tag>
          <el-tag size="small" effect="light"
            :type="currentOppo.priority==='high'?'danger':currentOppo.priority==='medium'?'warning':'info'">
            {{ currentOppo.priority==='high'?'高优':currentOppo.priority==='medium'?'中优先级':'低优先级' }}
          </el-tag>
        </div>

        <div class="detail-amount">
          <div><span class="muted">商机金额</span><h2>¥{{ m(currentOppo.amount) }}</h2></div>
          <div><span class="muted">客户预算</span><b>¥{{ m(currentOppo.budget) }}</b></div>
          <div><span class="muted">成交概率</span><el-progress :percentage="currentOppo.probability" :stroke-width="10" style="width:140px" /></div>
        </div>

        <el-descriptions :column="2" border size="small" style="margin-top:16px">
          <el-descriptions-item label="商机编号">{{ currentOppo.id }}</el-descriptions-item>
          <el-descriptions-item label="关联客户">{{ currentOppo.customer }}</el-descriptions-item>
          <el-descriptions-item label="意向产品">{{ currentOppo.product }}</el-descriptions-item>
          <el-descriptions-item label="负责人">{{ currentOppo.owner }}</el-descriptions-item>
          <el-descriptions-item label="创建日期">{{ currentOppo.createTime }}</el-descriptions-item>
          <el-descriptions-item label="预计成交">
            <span :class="dueClass(currentOppo)">{{ currentOppo.expectedDate }}</span>
            <el-tag v-if="isDue(currentOppo)" size="small" type="danger" effect="light" style="margin-left:4px">7天内到期</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="section">
          <div class="section-title"><el-icon><ChatLineSquare /></el-icon>客户询盘/需求</div>
          <div class="section-body">{{ currentOppo.inquiry }}</div>
        </div>

        <div class="section">
          <div class="section-title"><el-icon><Promotion /></el-icon>阶段推进</div>
          <el-steps :active="stepActive(currentOppo.stage)" finish-status="success" size="small">
            <el-step v-for="s in opportunityStages.slice(0,3)" :key="s.key" :title="s.name" />
          </el-steps>
          <div style="display:flex;gap:8px;margin-top:12px">
            <el-button size="small" @click="advanceStage(currentOppo)">推进阶段 →</el-button>
            <el-button size="small" type="success" @click="toStage(currentOppo,'win')">标记成交</el-button>
            <el-button size="small" type="danger" @click="toStage(currentOppo,'lose')">标记输单</el-button>
          </div>
        </div>

        <div class="section">
          <div class="section-title"><el-icon><Edit /></el-icon>跟进日志</div>
          <div class="logs">
            <div v-for="(l,i) in opLogs" :key="i" class="log-line">
              <div class="log-time muted">{{ l.time }}</div>
              <div class="log-ct">
                <b>{{ l.writer }}</b> · {{ l.content }}
              </div>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <el-input v-model="newLog" placeholder="新增跟进记录..." size="small" />
            <el-button type="primary" size="small" @click="addLog">发布</el-button>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible=false">关闭</el-button>
        <el-button type="primary">编辑商机</el-button>
      </template>
    </el-drawer>

    <!-- 新建商机 -->
    <el-dialog v-model="showCreate" title="新建商机" width="600px">
      <el-form :model="newOp" label-width="100px">
        <el-form-item label="商机名称"><el-input v-model="newOp.name" placeholder="例：XX客户Q4采购订单" /></el-form-item>
        <el-form-item label="关联客户">
          <el-select v-model="newOp.customerId" style="width:100%" filterable placeholder="选择客户" @change="pickCustomer">
            <el-option v-for="c in customers" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="意向产品"><el-input v-model="newOp.product" /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="商机金额"><el-input-number v-model="newOp.amount" :min="0" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="客户预算"><el-input-number v-model="newOp.budget" :min="0" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="预计成交"><el-date-picker v-model="newOp.expectedDate" value-format="YYYY-MM-DD" type="date" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="负责人">
            <el-select v-model="newOp.owner" style="width:100%">
              <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.name" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="初始阶段">
            <el-select v-model="newOp.stage" style="width:100%">
              <el-option v-for="s in opportunityStages.slice(0,3)" :key="s.key" :label="s.name" :value="s.key" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="优先级">
            <el-radio-group v-model="newOp.priority">
              <el-radio label="high">高</el-radio><el-radio label="medium">中</el-radio><el-radio label="low">低</el-radio>
            </el-radio-group>
          </el-form-item></el-col>
        </el-row>
        <el-form-item label="询盘/需求"><el-input v-model="newOp.inquiry" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreate=false">取消</el-button>
        <el-button type="primary" @click="submitCreate">创建商机</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { opportunities as _ops, users, customers, opportunityStages } from '@/mock'

const opps = ref([..._ops])
const viewMode = ref('kanban')
const kw = ref(''), ownerFilter = ref(''), priorityFilter = ref('')

const detailVisible = ref(false), currentOppo = ref(null)
const showCreate = ref(false)
const newOp = reactive({
  name: '', customerId: '', product: '', amount: 100000, budget: 120000,
  expectedDate: '2026-10-01', owner: '张伟', stage: 'contact', priority: 'medium', inquiry: ''
})

const opLogs = ref([
  { time: '2026-08-30 10:20', writer: '李娜', content: '已发送详细报价单PDF，客户表示3天内回复。' },
  { time: '2026-08-28 16:30', writer: '李娜', content: '电话确认客户采购流程和时间表。' },
  { time: '2026-08-25 09:00', writer: '李娜', content: '首次电话沟通，明确客户采购意向和预算范围。' }
])
const newLog = ref('')

const today = +new Date('2026-09-02')
const isDue = row => (+new Date(row.expectedDate) - today) / 86400000 <= 7 && row.stage !== 'win' && row.stage !== 'lose'
const dueOppo = computed(() => opps.value.filter(o => isDue(o)))
const dueClass = row => (isDue(row) ? 'danger-text' : '')

const totalAmount = computed(() => opps.value.reduce((s, o) => s + o.amount, 0))
const weightedAmount = computed(() => opps.value.reduce((s, o) => s + o.amount * o.probability / 100, 0))
const winAmount = computed(() => opps.value.filter(o => o.stage === 'win').reduce((s, o) => s + o.amount, 0))
const sepAmount = computed(() => opps.value.filter(o => o.expectedDate.startsWith('2026-09') && o.stage !== 'lose').reduce((s, o) => s + o.amount, 0))

const stageFilter = ref(null)
const filteredOpps = computed(() => opps.value.filter(o => {
  if (kw.value) {
    const k = kw.value.toLowerCase()
    if (!(o.name.toLowerCase().includes(k) || o.customer.toLowerCase().includes(k) || o.product.toLowerCase().includes(k))) return false
  }
  if (ownerFilter.value && o.owner !== ownerFilter.value) return false
  if (priorityFilter.value && o.priority !== priorityFilter.value) return false
  if (stageFilter.value && o.stage !== stageFilter.value) return false
  return true
}))

const byStage = key => filteredOpps.value.filter(o => o.stage === key)
const stageAmount = key => byStage(key).reduce((s, o) => s + o.amount, 0)
const stageName = s => (opportunityStages.find(x => x.key === s) || {}).name || s
const stageColor = s => (opportunityStages.find(x => x.key === s) || {}).color || '#64748b'
const stepActive = s => ['contact', 'quote', 'negotiate', 'win'].indexOf(s) + 1

const funnelTotal = computed(() => {
  const keys = ['contact','quote','negotiate']
  return keys.reduce((s,k) => s + stageAmount(k), 0)
})
const funnelData = computed(() => {
  const conf = [
    { key: 'contact',   name: '初步接触', bg: 'linear-gradient(90deg,#dbeafe,#bfdbfe)' },
    { key: 'quote',     name: '报价阶段', bg: 'linear-gradient(90deg,#fed7aa,#fdba74)' },
    { key: 'negotiate', name: '谈判阶段', bg: 'linear-gradient(90deg,#bbf7d0,#86efac)' },
    { key: 'win',       name: '已成交',   bg: 'linear-gradient(90deg,#a7f3d0,#6ee7b7)' }
  ]
  const maxCount = Math.max(...conf.map(c => byStage(c.key).length), 1)
  const lastCount = byStage('contact').length || 1
  return conf.map(c => ({
    ...c,
    count: byStage(c.key).length,
    amount: stageAmount(c.key),
    w: Math.max(28, Math.round((byStage(c.key).length / maxCount) * 100)),
    rate: c.key === 'contact' ? 100 : Math.round(byStage(c.key).length / lastCount * 100)
  }))
})

const m = v => (v || 0).toLocaleString()

const scrollToKanban = async () => {
  // 如果当前不是看板视图，先切到看板（DOM渲染后才能找到 id）
  if (viewMode.value !== 'kanban') {
    viewMode.value = 'kanban'
    await nextTick()
  }
  await nextTick()
  const el = document.getElementById('kanban-area')
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // 给个轻微的高亮闪烁提示，让用户感知跳转成功
    el.style.transition = 'box-shadow 0.3s'
    el.style.boxShadow = '0 0 0 3px #fde68a, 0 10px 15px -3px rgba(0,0,0,0.08)'
    setTimeout(() => { el.style.boxShadow = '' }, 1800)
  }
}

const showDetail = op => { currentOppo.value = op; detailVisible.value = true }

// 按阶段筛选商机 → 切到列表视图并应用阶段过滤
const filterByStage = key => {
  stageFilter.value = key
  viewMode.value = 'list'
  ElMessage.success(`已切换到列表视图，并筛选「${stageName(key)}」阶段的商机`)
}

const advanceStage = op => {
  const order = ['contact', 'quote', 'negotiate', 'win']
  const idx = order.indexOf(op.stage)
  if (idx >= 0 && idx < order.length - 1) {
    op.stage = order[idx + 1]
    op.probability = [25, 50, 75, 100][idx + 1]
    ElMessage.success(`阶段已推进到「${stageName(op.stage)}」`)
  } else {
    ElMessage.info('已是最终阶段')
  }
}
const toStage = (op, s) => { op.stage = s; op.probability = s === 'win' ? 100 : 0; ElMessage.success(`状态已更新为「${stageName(s)}」`) }
const addLog = () => {
  if (!newLog.value.trim()) return
  opLogs.value.unshift({ time: new Date().toISOString().slice(0, 16).replace('T', ' '), writer: '张伟', content: newLog.value })
  newLog.value = ''
  ElMessage.success('记录已添加')
}

const pickCustomer = id => {
  const c = customers.find(x => x.id === id); if (c) newOp.owner = c.follower
}
const submitCreate = () => {
  if (!newOp.name || !newOp.customerId) return ElMessage.warning('请填写商机名称并选择关联客户')
  const c = customers.find(x => x.id === newOp.customerId)
  const id = 'OP' + Date.now().toString().slice(-4)
  opps.value.unshift({
    id, name: newOp.name, customer: c.name, customerId: newOp.customerId,
    stage: newOp.stage, product: newOp.product, amount: newOp.amount,
    probability: { contact: 25, quote: 50, negotiate: 75 }[newOp.stage] || 25,
    expectedDate: newOp.expectedDate, owner: newOp.owner, inquiry: newOp.inquiry,
    budget: newOp.budget, createTime: new Date().toISOString().slice(0, 10), priority: newOp.priority
  })
  ElMessage.success('商机创建成功')
  showCreate.value = false
  Object.assign(newOp, { name: '', customerId: '', product: '', amount: 100000, budget: 120000, expectedDate: '2026-10-01', owner: '张伟', stage: 'contact', priority: 'medium', inquiry: '' })
}
</script>

<style scoped lang="scss">
.muted { color: #64748b; font-size: 12px; }
.danger-text { color:#ef4444; font-weight:600; }
.link-blue { color: #2563eb; cursor: pointer; font-weight: 500; }

.kanban-wrap {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  min-height: 500px;
}
.kanban-col {
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  min-height: 480px;
  .col-head {
    padding: 10px 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    border-radius: 6px 6px 0 0;
    border-left: 4px solid;
    .col-bar { width: 4px; height: 16px; border-radius: 2px; display: none; }
  }
  .col-body { flex: 1; padding: 10px; overflow: auto; display: flex; flex-direction: column; gap: 10px; }
  .empty-col { text-align: center; padding: 24px 0; color: #94a3b8; font-size: 12px; }
}
.oppo-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  cursor: pointer;
  transition: all 0.18s;
  &:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: #cbd5e1; }
  .card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .card-title { font-weight: 600; color: #1e293b; margin-bottom: 4px; font-size: 13.5px; line-height: 1.4; }
  .card-customer { font-size: 12px; color: #475569; margin-bottom: 3px; display: flex; align-items: center; gap: 3px; }
  .card-product { font-size: 12px; margin-bottom: 10px; display: flex; align-items: center; gap: 3px; }
  .card-mid { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
    .amount { color: #ef4444; font-weight: 700; font-size: 15px; }
  }
  .card-foot { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #64748b;
    span { display: flex; align-items: center; gap: 3px; }
  }
}

.funnel-wrap {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 24px;
  padding: 8px;
  .funnel-chart { display: flex; flex-direction: column; gap: 12px; align-items: center; justify-content: center;
    min-height: 400px; background: #f8fafc; border-radius: 10px; padding: 30px 20px;
  }
  .funnel-stage {
    height: 64px; border-radius: 8px; padding: 12px 24px;
    display: flex; justify-content: space-between; align-items: center;
    transition: all 0.3s;
    &.clickable { cursor: pointer; }
    &.clickable:hover { transform: translateX(6px); box-shadow: 0 4px 12px rgba(0,0,0,0.12); filter: brightness(0.97); }
    .f-name { font-size: 15px; font-weight: 600; color: #1e293b; }
    .f-amount { font-size: 18px; font-weight: 700; color: #1e293b; text-align: right; }
    .f-rate { font-size: 12px; color: #475569; text-align: right; }
  }
  .funnel-summary {
    background: #f8fafc; border-radius: 10px; padding: 20px;
    h4 { margin-bottom: 16px; }
  }
}

.detail-wrap {
  .detail-top { margin-bottom: 16px; h3 { margin: 0 0 8px 0; font-size: 20px; } }
  .detail-amount {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px;
    background: #f8fafc; border-radius: 8px;
    h2 { margin: 4px 0 0 0; color: #ef4444; }
    b { font-size: 16px; display: block; margin-top: 4px; }
    > div { span { font-size: 12px; } }
  }
  .section { margin-top: 18px;
    .section-title { font-weight: 600; margin-bottom: 10px; color: #1e293b;
      display: flex; align-items: center; gap: 4px;
    }
    .section-body { background: #f8fafc; padding: 12px 14px; border-radius: 6px; line-height: 1.7; }
    .logs { display: flex; flex-direction: column; gap: 10px;
      .log-line { border-left: 2px solid #e2e8f0; padding-left: 12px;
        .log-time { font-size: 12px; margin-bottom: 2px; }
        .log-ct { font-size: 13.5px; color: #334155; }
      }
    }
  }
}
</style>
