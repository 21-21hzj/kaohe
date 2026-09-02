<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <div class="page-title">客户池</div>
        <div class="page-subtitle">客户保护/分配/转移，公海池认领回收，跟进时效管理</div>
      </div>
    </div>

    <!-- 时效提醒条 -->
    <el-alert v-if="overdueCount" type="error" :closable="false" show-icon style="margin-bottom:16px">
      <template #title>
        <span>有 <b>{{ overdueCount }}</b> 个客户已超过跟进时效，</span>
        <el-button link type="danger" @click="goStatusFilter('overdue')">立即处理 →</el-button>
      </template>
    </el-alert>
    <el-alert v-if="todayCount" type="warning" :closable="false" show-icon style="margin-bottom:16px">
      <template #title>
        <span>今日需跟进客户 <b>{{ todayCount }}</b> 个，</span>
        <el-button link type="warning" @click="todayFilter">查看清单 →</el-button>
      </template>
    </el-alert>

    <!-- 统计 -->
    <div class="stat-cards">
      <div class="stat-card" @click="goStatCard('mine')">
        <div class="stat-info"><div class="stat-label">我的客户</div><div class="stat-value">{{ mineCount }}</div></div>
        <div class="stat-icon blue"><el-icon><UserFilled /></el-icon></div>
      </div>
      <div class="stat-card" @click="goStatCard('protect')">
        <div class="stat-info"><div class="stat-label">已保护（锁定）</div><div class="stat-value">{{ protectedCount }}</div></div>
        <div class="stat-icon green"><el-icon><Lock /></el-icon></div>
      </div>
      <div class="stat-card" @click="goStatCard('aLevel')">
        <div class="stat-info"><div class="stat-label">高价值客户（A级）</div><div class="stat-value">{{ aCount }}</div></div>
        <div class="stat-icon orange"><el-icon><Medal /></el-icon></div>
      </div>
      <div class="stat-card" @click="activeTab='public'; goStatCard('public')">
        <div class="stat-info"><div class="stat-label">公海池</div><div class="stat-value">{{ publicSea.length }}</div></div>
        <div class="stat-icon purple"><el-icon><Share /></el-icon></div>
      </div>
      <div class="stat-card" @click="goStatCard('monthDeal')">
        <div class="stat-info"><div class="stat-label">本月成交额(¥)</div><div class="stat-value">{{ formatMoney(monthDealAmount) }}</div></div>
        <div class="stat-icon cyan"><el-icon><Money /></el-icon></div>
      </div>
    </div>

    <div class="card">
      <el-tabs v-model="activeTab">
        <!-- ===== 我的客户 ===== -->
        <el-tab-pane label="我的客户" name="mine">
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input v-model="kw" placeholder="搜索客户名/编号/联系人/邮箱" clearable style="width:280px">
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
              <el-select v-model="filterLevel" placeholder="客户等级" clearable style="width:120px">
                <el-option label="S (战略级)" value="S" />
                <el-option label="A (核心)" value="A" />
                <el-option label="B (常规)" value="B" />
                <el-option label="C (小客户)" value="C" />
              </el-select>
              <el-select v-model="filterType" placeholder="客户类型" clearable style="width:130px">
                <el-option label="代理商" value="代理商" />
                <el-option label="进口商" value="进口商" />
                <el-option label="批发商" value="批发商" />
                <el-option label="分销商" value="分销商" />
                <el-option label="生产商" value="生产商" />
                <el-option label="零售商" value="零售商" />
              </el-select>
              <el-select v-model="filterStatus" placeholder="跟进状态" clearable style="width:140px">
                <el-option label="正常跟进" value="active" />
                <el-option label="待激活(>15天)" value="warning" />
                <el-option label="已超期(>30天)" value="overdue" />
              </el-select>
              <el-select v-model="filterOwner" placeholder="负责人" clearable style="width:120px">
                <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.name" />
              </el-select>
              <el-tag v-if="filterStatus==='overdue'" closable type="danger" effect="light" @close="filterStatus = ''">
                已超期客户（过滤中）
              </el-tag>
              <el-tag v-if="filterTodayFollow" closable type="warning" effect="light" @close="filterTodayFollow = false">
                今日需跟进（过滤中）
              </el-tag>
              <el-tag v-if="filterProtect" closable type="success" effect="light" @close="filterProtect=false">
                已保护客户（仅锁定）
              </el-tag>
              <el-tag v-if="filterHighValue" closable type="warning" effect="dark" @close="filterHighValue=false">
                高价值客户（S/A级）
              </el-tag>
              <el-tag v-if="filterMonthDeal" closable type="info" effect="dark" @close="filterMonthDeal=false">
                本月成交客户 · 合计 ¥{{ formatMoney(monthDealAmount) }}
              </el-tag>
            </div>
            <div class="toolbar-right">
              <el-button :disabled="!selection.length" @click="batchProtect">
                <el-icon><Lock /></el-icon>批量保护
              </el-button>
              <el-button :disabled="!selection.length" @click="batchTransfer">
                <el-icon><Switch /></el-icon>批量移交
              </el-button>
              <el-button :disabled="!selection.length" type="danger" @click="batchRecycle">
                <el-icon><Share /></el-icon>放入公海
              </el-button>
              <el-button type="primary" @click="showCreate = true">
                <el-icon><Plus /></el-icon>新建客户
              </el-button>
            </div>
          </div>

          <el-table :data="filteredMine" border stripe @selection-change="s => selection = s" style="width:100%">
            <el-table-column type="selection" width="42" />
            <el-table-column label="客户" min-width="220">
              <template #default="{ row }">
                <div class="customer-cell">
                  <div class="row-line">
                    <span class="co-name" @click="goProfile(row)">{{ row.name }}</span>
                    <el-tag :type="levelType(row.level)" size="small" effect="dark" style="margin-left:6px">{{ row.level }}</el-tag>
                    <el-tag v-if="row.protect" type="success" size="small" effect="plain" style="margin-left:4px">
                      <el-icon style="margin-right:2px"><Lock /></el-icon>已保护
                    </el-tag>
                  </div>
                  <div class="row-sub muted">
                    {{ row.id }} · {{ row.country }} · {{ row.industry }} · {{ row.scale }}
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="联系人" width="150">
              <template #default="{ row }">
                <div><b>{{ row.contact }}</b><div class="muted">{{ row.email }}</div></div>
              </template>
            </el-table-column>
            <el-table-column label="电话" width="140" prop="phone" />
            <el-table-column label="类型" width="90" align="center">
              <template #default="{ row }"><el-tag size="small" effect="light">{{ row.type }}</el-tag></template>
            </el-table-column>
            <el-table-column label="负责人" width="90" align="center">
              <template #default="{ row }">
                <el-tooltip :content="row.follower"><el-avatar :size="28" style="background:#2563eb;font-size:12px">{{ row.follower[0] }}</el-avatar></el-tooltip>
              </template>
            </el-table-column>
            <el-table-column label="年度金额(¥)" width="120" align="right">
              <template #default="{ row }">{{ formatMoney(row.annual) }}</template>
            </el-table-column>
            <el-table-column v-if="filterMonthDeal" label="本月成交(¥)" width="140" align="right" fixed>
              <template #default="{ row }">
                <b style="color:#2563eb">¥{{ formatMoney(customerMonthDeal(row)) }}</b>
              </template>
            </el-table-column>
            <el-table-column label="上次跟进" width="110" prop="lastFollow" />
            <el-table-column label="下次跟进" width="130">
              <template #default="{ row }">
                <div>
                  <div :class="statusClass(row)">{{ row.nextFollow }}</div>
                  <el-tag v-if="row.status==='overdue'" size="small" type="danger" effect="light">已超期</el-tag>
                  <el-tag v-else-if="row.status==='warning'" size="small" type="warning" effect="light">将到期</el-tag>
                  <el-tag v-else size="small" type="success" effect="plain">正常</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="信用" width="80" align="center">
              <template #default="{ row }">
                <el-progress :percentage="row.credit" :stroke-width="8"
                  :color="row.credit >= 85 ? '#10b981' : row.credit >= 70 ? '#f59e0b' : '#ef4444'" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="goProfile(row)">档案</el-button>
                <el-button link type="primary" size="small" @click="followNow(row)">跟进</el-button>
                <el-button v-if="!row.protect" link type="success" size="small" @click="toggleProtect(row,true)">保护</el-button>
                <el-button v-else link type="warning" size="small" @click="toggleProtect(row,false)">解除保护</el-button>
                <el-dropdown trigger="click" @command="(c) => handleCmd(c, row)">
                  <el-button link size="small">更多<el-icon><ArrowDown /></el-icon></el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="transfer">移交客户</el-dropdown-item>
                      <el-dropdown-item command="recycle">放入公海</el-dropdown-item>
                      <el-dropdown-item command="oppo">关联商机</el-dropdown-item>
                      <el-dropdown-item command="export" divided>导出该客户</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin-top:12px;display:flex;justify-content:flex-end">
            <el-pagination layout="total, sizes, prev, pager, next, jumper" :total="filteredMine.length" :page-size="10" />
          </div>
        </el-tab-pane>

        <!-- ===== 公海池 ===== -->
        <el-tab-pane label="公海池" name="public">
          <el-alert type="info" :closable="false" show-icon style="margin-bottom:12px"
            title="公海池存放长期未跟进或主动释放的客户，任何人可认领；认领后进入保护期防止撞客。" />
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input v-model="publicKw" placeholder="搜索客户名/行业/原负责人" clearable style="width:280px" />
              <el-select v-model="publicReason" placeholder="回收原因" clearable style="width:180px">
                <el-option label="超60天未跟进" value="超60天未跟进" />
                <el-option label="主动释放" value="主动释放" />
              </el-select>
            </div>
          </div>
          <el-table :data="filteredPublic" border stripe>
            <el-table-column prop="id" label="编号" width="100" />
            <el-table-column prop="name" label="公司名称" min-width="200" />
            <el-table-column prop="country" label="国家" width="100" />
            <el-table-column prop="industry" label="行业" width="110" />
            <el-table-column prop="lastFollow" label="最后跟进" width="120" />
            <el-table-column prop="originalOwner" label="原负责人" width="110" />
            <el-table-column prop="recycleTime" label="入池时间" width="120" />
            <el-table-column prop="reason" label="回收原因" min-width="160" />
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="claim(row)">立即认领</el-button>
                <el-button link type="info" size="small">查看档案</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 跟进 -->
    <el-dialog v-model="followVisible" :title="`跟进 · ${followTarget?.name||''}`" width="520px">
      <el-form label-width="90px">
        <el-form-item label="跟进方式">
          <el-radio-group v-model="followForm.type">
            <el-radio label="电话">电话</el-radio>
            <el-radio label="邮件">邮件</el-radio>
            <el-radio label="WhatsApp">WhatsApp</el-radio>
            <el-radio label="拜访">拜访</el-radio>
            <el-radio label="其他">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="下次跟进"><el-date-picker v-model="followForm.next" type="date" style="width:100%" value-format="YYYY-MM-DD" /></el-form-item>
        <el-form-item label="跟进内容"><el-input v-model="followForm.content" type="textarea" :rows="4" placeholder="记录本次沟通要点..." /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="followVisible=false">取消</el-button>
        <el-button type="primary" @click="submitFollow">保存跟进记录</el-button>
      </template>
    </el-dialog>

    <!-- 移交 -->
    <el-dialog v-model="transferVisible" title="移交客户" width="420px">
      <el-form label-width="90px">
        <el-form-item label="移交目标">
          <el-select v-model="transferUser" style="width:100%" placeholder="选择接受人">
            <el-option v-for="u in users" :key="u.id" :label="u.name + ' · ' + u.dept" :value="u.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="移交原因"><el-input v-model="transferReason" type="textarea" :rows="2" placeholder="可选" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmTransfer">确认移交</el-button>
      </template>
    </el-dialog>

    <!-- 新建客户 -->
    <el-dialog v-model="showCreate" title="新建客户" width="640px">
      <el-form :model="newCust" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="客户名称"><el-input v-model="newCust.name" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="客户编号"><el-input v-model="newCust.id" disabled placeholder="自动生成" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="国家"><el-input v-model="newCust.country" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="行业"><el-input v-model="newCust.industry" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="类型">
            <el-select v-model="newCust.type" style="width:100%">
              <el-option label="代理商" value="代理商" />
              <el-option label="进口商" value="进口商" />
              <el-option label="批发商" value="批发商" />
              <el-option label="分销商" value="分销商" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="联系人"><el-input v-model="newCust.contact" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="电话"><el-input v-model="newCust.phone" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="邮箱"><el-input v-model="newCust.email" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="负责人">
            <el-select v-model="newCust.follower" style="width:100%">
              <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.name" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="等级">
            <el-radio-group v-model="newCust.level">
              <el-radio label="S">S</el-radio><el-radio label="A">A</el-radio><el-radio label="B">B</el-radio><el-radio label="C">C</el-radio>
            </el-radio-group>
          </el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showCreate=false">取消</el-button>
        <el-button type="primary" @click="submitCreate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { customers as _c, publicSeaCustomers as _p, users, opportunities as _opps } from '@/mock'

const router = useRouter()
const customers = ref([..._c])
const publicSea = ref([..._p])
// 用于「本月成交」统计：取商机里 2026-09 月且赢单(stage=win) 的客户维度金额
const _oppsData = [..._opps]
const isSepWin = o => (o.expectedDate || o.createDate || o.createTime || '').startsWith('2026-09') && o.stage === 'win'
const monthDealsMap = computed(() => {
  const m = new Map()
  _oppsData.forEach(o => { if (isSepWin(o)) m.set(o.customer, (m.get(o.customer) || 0) + (o.amount || 0)) })
  return m
})
const monthDealCustomerNames = computed(() => {
  const s = new Set()
  _oppsData.forEach(o => { if (isSepWin(o)) s.add(o.customer) })
  return s
})
const monthDealAmount = computed(() => _oppsData.reduce((s, o) => isSepWin(o) ? s + (o.amount || 0) : s, 0))

const activeTab = ref('mine')
const selection = ref([])
const kw = ref(''), filterLevel = ref(''), filterType = ref(''), filterStatus = ref(''), filterOwner = ref('')
const publicKw = ref(''), publicReason = ref('')
// 统计卡对应联动筛选开关
const filterProtect = ref(false)
const filterHighValue = ref(false)
const filterMonthDeal = ref(false)
const filterTodayFollow = ref(false)

const followVisible = ref(false), followTarget = ref(null)
const followForm = reactive({ type: '电话', next: '', content: '' })

const transferVisible = ref(false), transferUser = ref(''), transferReason = ref(''), transferTargets = ref([])

const showCreate = ref(false)
const newCust = reactive({ name:'', id:'C' + Date.now().toString().slice(-5), country:'', industry:'', type:'代理商', contact:'', phone:'', email:'', follower:users[0].name, level:'B' })

const today = new Date().toISOString().slice(0, 10)
const mineCount = computed(() => customers.value.length)
const protectedCount = computed(() => customers.value.filter(c => c.protect).length)
const aCount = computed(() => customers.value.filter(c => ['S','A'].includes(c.level)).length)
const totalAmount = computed(() => customers.value.reduce((s,c) => s + c.annual, 0))
const overdueCount = computed(() => customers.value.filter(c => c.status === 'overdue').length)
const todayCount = computed(() => customers.value.filter(c => c.nextFollow === today).length)

const filteredMine = computed(() => {
  let list = customers.value
  // 统计卡联动过滤（优先级最高）
  if (filterProtect.value) list = list.filter(c => c.protect)
  if (filterHighValue.value) list = list.filter(c => ['S','A'].includes(c.level))
  if (filterMonthDeal.value) {
    // 本月成交的客户：按客户名匹配商机里的 customer；兜底用 customers 的 shortName 也匹配
    const names = monthDealCustomerNames.value
    list = list.filter(c => names.has(c.name) || names.has(c.shortName))
    // 按本月成交金额降序，更直观查看"成交金额从大到小的详情"
    list = [...list].sort((a, b) => {
      const aAmt = (monthDealsMap.value.get(a.name) || 0) + (monthDealsMap.value.get(a.shortName) || 0)
      const bAmt = (monthDealsMap.value.get(b.name) || 0) + (monthDealsMap.value.get(b.shortName) || 0)
      return bAmt - aAmt
    })
  }
  // 普通筛选条件
  return list.filter(c => {
    if (kw.value) {
      const k = kw.value.toLowerCase()
      if (!(c.name.toLowerCase().includes(k) || c.id.toLowerCase().includes(k) || c.contact.toLowerCase().includes(k) || c.email.toLowerCase().includes(k))) return false
    }
    if (filterLevel.value && c.level !== filterLevel.value) return false
    if (filterType.value && c.type !== filterType.value) return false
    if (filterStatus.value && c.status !== filterStatus.value) return false
    if (filterOwner.value && c.follower !== filterOwner.value) return false
    if (filterTodayFollow.value && c.nextFollow !== today) return false
    return true
  })
})

const filteredPublic = computed(() => publicSea.value.filter(p => {
  if (publicKw.value) {
    const k = publicKw.value.toLowerCase()
    if (!(p.name.toLowerCase().includes(k) || p.industry.toLowerCase().includes(k) || p.originalOwner.includes(publicKw.value))) return false
  }
  if (publicReason.value && p.reason !== publicReason.value) return false
  return true
}))

const formatMoney = v => (v || 0).toLocaleString()
const customerMonthDeal = row =>
  (monthDealsMap.value.get(row.name) || 0) + (monthDealsMap.value.get(row.shortName) || 0)
const levelType = l => l === 'S' ? 'danger' : l === 'A' ? 'warning' : l === 'B' ? 'primary' : 'info'
const statusClass = row => (row.status === 'overdue' ? 'danger-text' : row.status === 'warning' ? 'warning-text' : '')

// 统计卡统一入口 —— 清理所有互斥条件后应用目标筛选，避免"视觉无变化"
const goStatCard = key => {
  // 1) 清筛选
  kw.value = ''
  filterLevel.value = ''
  filterType.value = ''
  filterOwner.value = ''
  filterStatus.value = ''
  filterTodayFollow.value = false
  filterProtect.value = false
  filterHighValue.value = false
  filterMonthDeal.value = false

  if (key === 'public') {
    activeTab.value = 'public'
    publicKw.value = ''
    publicReason.value = ''
    ElMessage.success('已切换到公海池')
    return
  }

  activeTab.value = 'mine'
  if (key === 'mine') {
    ElMessage.success('已显示全部客户')
  } else if (key === 'protect') {
    filterProtect.value = true
    ElMessage.success(`已筛选 ${protectedCount.value} 个已保护客户（锁定中，无法被撞客或回收）`)
  } else if (key === 'aLevel') {
    filterHighValue.value = true
    ElMessage.success(`已筛选 ${aCount.value} 个高价值客户（S/A级）`)
  } else if (key === 'monthDeal') {
    filterMonthDeal.value = true
    const n = monthDealCustomerNames.value.size
    if (!n) {
      ElMessage.info(`本月暂无赢单商机的成交记录（当前合计 ¥${formatMoney(monthDealAmount.value)}）`)
    } else {
      ElMessage.success(`本月共成交 ¥${formatMoney(monthDealAmount.value)}，涉及 ${n} 个客户（已按成交金额降序显示，表格右侧新增「本月成交」列可查看明细）`)
    }
  }
}

// 统一的条件切换：确保先切到「我的客户」再应用筛选，清空其他条件避免干扰
const goStatusFilter = status => {
  filterProtect.value = false
  filterHighValue.value = false
  filterMonthDeal.value = false
  activeTab.value = 'mine'
  kw.value = ''
  filterLevel.value = ''
  filterType.value = ''
  filterOwner.value = ''
  filterStatus.value = status
}

const todayFilter = () => {
  filterProtect.value = false
  filterHighValue.value = false
  filterMonthDeal.value = false
  activeTab.value = 'mine'
  kw.value = ''
  filterLevel.value = ''
  filterType.value = ''
  filterOwner.value = ''
  // 今日需跟进：只看下次跟进==今天的客户 → 清空状态筛选，用日期匹配
  filterStatus.value = ''
  filterTodayFollow.value = true
  ElMessage.success(`已筛选今日需跟进客户（${todayCount.value} 人）`)
}

const goProfile = row => {
  router.push({ path: '/customer/customer-profile', query: { id: row.id } })
}
const followNow = row => { followTarget.value = row; followForm.next = row.nextFollow; followForm.content = ''; followVisible.value = true }
const submitFollow = () => {
  if (!followForm.content) return ElMessage.warning('请填写跟进内容')
  const t = customers.value.find(c => c.id === followTarget.value.id)
  if (t) { t.lastFollow = today; t.nextFollow = followForm.next || t.nextFollow; t.status = 'active' }
  ElMessage.success('跟进记录已保存')
  followVisible.value = false
}

const toggleProtect = async (row, protect) => {
  try {
    await ElMessageBox.confirm(`${protect ? '保护' : '解除保护'}客户「${row.name}」？`, protect ? '客户保护' : '解除保护', { type: 'warning' })
    row.protect = protect
    ElMessage.success(protect ? '已加入保护池，他人无法分配/认领' : '已解除保护')
  } catch {}
}
const batchProtect = () => { selection.value.forEach(r => r.protect = true); ElMessage.success(`已保护 ${selection.value.length} 个客户`) }

const batchTransfer = () => transfer(selection.value)
const confirmTransfer = () => {
  if (!transferUser.value) return ElMessage.warning('请选择接受人')
  transferTargets.value.forEach(r => { const x = customers.value.find(i => i.id === r.id); if (x) { x.follower = transferUser.value; x.protect = false } })
  ElMessage.success(`已移交 ${transferTargets.value.length} 个客户给 ${transferUser.value}`)
  transferVisible.value = false
}
const transfer = rows => { transferTargets.value = [...rows]; transferVisible.value = true }

const batchRecycle = async () => {
  const protectedRows = selection.value.filter(r => r.protect)
  if (protectedRows.length) return ElMessage.warning(`有 ${protectedRows.length} 个客户已保护，请先解除保护`)
  try {
    await ElMessageBox.confirm(`将 ${selection.value.length} 个客户放入公海池？`, '回收客户', { type: 'warning' })
    selection.value.forEach(r => {
      const idx = customers.value.findIndex(i => i.id === r.id)
      if (idx >= 0) {
        const c = customers.value[idx]
        publicSea.value.unshift({ id: c.id, name: c.name, country: c.country, industry: c.industry, lastFollow: c.lastFollow, originalOwner: c.follower, recycleTime: today, reason: '主动释放' })
        customers.value.splice(idx, 1)
      }
    })
    ElMessage.success('已移入公海池')
  } catch {}
}

const claim = async row => {
  try {
    await ElMessageBox.confirm(`认领客户「${row.name}」并加入我的客户池？`, '公海认领', { type: 'success' })
    publicSea.value = publicSea.value.filter(p => p.id !== row.id)
    customers.value.unshift({ ..._c[0], id: row.id, name: row.name, shortName: row.name.slice(0, 6), country: row.country, industry: row.industry, follower: users[0].name, protect: true, lastFollow: today, nextFollow: '2026-09-10', status: 'active' })
    ElMessage.success('认领成功！客户已加入我的客户池并自动保护7天')
  } catch {}
}

const submitCreate = () => {
  if (!newCust.name || !newCust.contact) return ElMessage.warning('客户名称和联系人为必填')
  customers.value.unshift({
    ...newCust, shortName: newCust.name.slice(0, 6), scale: '<50人', protect: true, credit: 70, annual: 0,
    lastFollow: today, nextFollow: '2026-09-12', status: 'active', tag: '新客户'
  })
  ElMessage.success('客户创建成功')
  showCreate.value = false
}

const handleCmd = (c, row) => {
  if (c === 'transfer') transfer([row])
  else if (c === 'recycle') { selection.value = [row]; batchRecycle() }
  else if (c === 'oppo') router.push('/customer/opportunity')
  else if (c === 'export') ElMessage.success('客户档案已导出')
}
</script>

<style scoped lang="scss">
.customer-cell .row-line { display:flex; align-items:center; flex-wrap:wrap;
  .co-name { font-weight:600; cursor:pointer; &:hover { color: var(--primary-color); } }
}
.customer-cell .row-sub { margin-top:4px; }
.muted { color: #64748b; font-size:12px; }
.danger-text { color:#ef4444; font-weight:600; }
.warning-text { color:#f59e0b; font-weight:600; }
</style>
