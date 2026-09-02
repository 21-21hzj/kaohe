<template>
  <div class="page-container schedule-page">
    <div class="page-header">
      <div>
        <div class="page-title">日程管理</div>
        <div class="page-subtitle">团队工作日志 · 工作计划日历化 · 待办任务进度追踪</div>
      </div>
    </div>

    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-info"><div class="stat-label">今日待办</div><div class="stat-value">{{ todayPending }}</div></div>
        <div class="stat-icon blue"><el-icon><Bell /></el-icon></div>
      </div>
      <div class="stat-card">
        <div class="stat-info"><div class="stat-label">已完成任务</div><div class="stat-value">{{ doneCount }} / {{ tasks.length }}</div></div>
        <div class="stat-icon green"><el-icon><CircleCheck /></el-icon></div>
      </div>
      <div class="stat-card">
        <div class="stat-info"><div class="stat-label">本周日报已提交</div><div class="stat-value">{{ reportsThisWeek }} 份</div></div>
        <div class="stat-icon orange"><el-icon><Notebook /></el-icon></div>
      </div>
      <div class="stat-card">
        <div class="stat-info"><div class="stat-label">团队总完成率</div><div class="stat-value">{{ teamRate }}%</div></div>
        <div class="stat-icon purple"><el-icon><DataAnalysis /></el-icon></div>
      </div>
      <div class="stat-card">
        <div class="stat-info"><div class="stat-label">今日日程</div><div class="stat-value">{{ todaySchedules }}</div></div>
        <div class="stat-icon cyan"><el-icon><Calendar /></el-icon></div>
      </div>
    </div>

    <el-row :gutter="16">
      <!-- ===== 左：日历 + 日程 ===== -->
      <el-col :span="17">
        <div class="card">
          <el-tabs v-model="activeTab">
            <!-- 日历视图 -->
            <el-tab-pane label="日历视图" name="calendar">
              <div class="toolbar">
                <div class="toolbar-left">
                  <el-button-group>
                    <el-button size="small" @click="changeMonth(-1)"><el-icon><ArrowLeft /></el-icon></el-button>
                    <el-button size="small" @click="goToday">今天</el-button>
                    <el-button size="small" @click="changeMonth(1)"><el-icon><ArrowRight /></el-icon></el-button>
                  </el-button-group>
                  <span class="cur-month">{{ curYear }} 年 {{ curMonth + 1 }} 月</span>
                </div>
                <div class="toolbar-right">
                  <el-radio-group v-model="viewType" size="small">
                    <el-radio-button value="month">月视图</el-radio-button>
                    <el-radio-button value="week">周视图</el-radio-button>
                    <el-radio-button value="day">日视图</el-radio-button>
                  </el-radio-group>
                  <el-button type="primary" size="small" @click="showAddSchedule = true">
                    <el-icon><Plus /></el-icon>新增日程
                  </el-button>
                </div>
              </div>

              <div class="calendar-grid">
                <div class="week-head">
                  <div v-for="w in weekNames" :key="w" class="wh-cell">{{ w }}</div>
                </div>
                <div class="day-grid">
                  <div v-for="(cell, i) in calendarCells" :key="i"
                    class="day-cell"
                    :class="{
                      'other-month': !cell.curMonth,
                      'today-cell': cell.date === today,
                      'selected-cell': cell.date === selectedDate
                    }"
                    @click="pickDate(cell.date)"
                  >
                    <div class="day-num">{{ cell.day }}</div>
                    <div class="day-events">
                      <div v-for="(ev, idx) in cell.events" :key="idx" class="day-ev" :class="ev.class">
                        <span class="ev-time">{{ ev.time }}</span>
                        <span class="ev-title">{{ ev.title }}</span>
                      </div>
                      <div v-if="cell.events.length > 3" class="more">+{{ cell.events.length - 3 }} 更多</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 选中日期的日程清单 -->
              <div v-if="dayEvents.length" class="day-detail card-inner">
                <h4>{{ selectedDate }} 的日程安排（{{ dayEvents.length }} 项）</h4>
                <div v-for="s in dayEvents" :key="s.id" class="sch-item">
                  <div class="sch-time">
                    <div class="st-time">{{ s.time }}</div>
                    <div class="st-bar" :class="barClass(s.type)"></div>
                  </div>
                  <div class="sch-body">
                    <div class="sch-title">
                      <el-tag size="small" effect="light" :class="tagClass(s.type)">{{ typeName(s.type) }}</el-tag>
                      <b>{{ s.title }}</b>
                      <el-tag v-if="s.priority==='high'" size="small" type="danger" effect="light" style="margin-left:4px">紧急</el-tag>
                      <el-tag v-else-if="s.priority==='medium'" size="small" type="warning" effect="light" style="margin-left:4px">重要</el-tag>
                      <el-tag v-if="s.status==='done'" size="small" type="success" effect="dark" style="margin-left:auto">已完成</el-tag>
                    </div>
                    <div class="sch-content muted">{{ s.content }}</div>
                    <div class="sch-meta muted">
                      <span v-if="s.related"><el-icon><Link /></el-icon>{{ s.related }}</span>
                      <span><el-icon><User /></el-icon>{{ s.owner }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 工作日报 -->
            <el-tab-pane label="工作日报" name="report">
              <div class="toolbar">
                <div class="toolbar-left">
                  <el-date-picker v-model="reportDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" size="default" />
                  <el-select v-model="reportUser" placeholder="选择成员（查看团队）" clearable style="width:180px">
                    <el-option label="全员" value="" />
                    <el-option v-for="u in users" :key="u.id" :label="u.name + ' · ' + u.dept" :value="u.name" />
                  </el-select>
                </div>
                <div class="toolbar-right">
                  <el-button type="primary" @click="showWriteReport = true">
                    <el-icon><EditPen /></el-icon>填写今日日报
                  </el-button>
                </div>
              </div>

              <!-- 汇总统计 -->
              <div class="report-summary">
                <div class="sum-item"><div class="label">跟进客户</div><div class="num">{{ reportSum.follow }}</div></div>
                <div class="sum-item"><div class="label">开发线索</div><div class="num">{{ reportSum.dev }}</div></div>
                <div class="sum-item"><div class="label">成交金额</div><div class="num">¥{{ m(reportSum.amount) }}</div></div>
                <div class="sum-item"><div class="label">提交人数</div><div class="num">{{ submitCount }}/{{ users.length }}</div></div>
              </div>

              <el-table :data="filteredReports" border stripe style="margin-top:16px">
                <el-table-column prop="date" label="日期" width="110" />
                <el-table-column prop="owner" label="姓名" width="90" />
                <el-table-column prop="dept" label="部门" width="100" />
                <el-table-column label="今日工作内容" min-width="320">
                  <template #default="{ row }">
                    <div class="whitespace-pre-line content-cell">{{ row.content }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="数据汇总" width="220">
                  <template #default="{ row }">
                    <div class="mini-stats">
                      <span><el-icon><UserFilled /></el-icon>跟进 {{ row.followCount }}</span>
                      <span><el-icon><Search /></el-icon>开发 {{ row.devCount }}</span>
                      <span><el-icon><Money /></el-icon>成交 ¥{{ m(row.dealAmount) }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="明日计划" min-width="220">
                  <template #default="{ row }">
                    <div class="whitespace-pre-line content-cell muted">{{ row.nextPlan }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="110">
                  <template #default>
                    <el-button link type="primary" size="small">评论</el-button>
                    <el-button link type="primary" size="small">点赞</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <!-- 团队视图 -->
            <el-tab-pane label="团队计划" name="team">
              <div class="toolbar">
                <div class="toolbar-left">
                  <span>时间范围：</span>
                  <el-radio-group v-model="range" size="small">
                    <el-radio-button value="week">本周</el-radio-button>
                    <el-radio-button value="month">本月</el-radio-button>
                    <el-radio-button value="quarter">本季</el-radio-button>
                  </el-radio-group>
                </div>
              </div>
              <el-table :data="teamProgress" border stripe>
                <el-table-column label="成员" width="220">
                  <template #default="{ row }">
                    <div style="display:flex;align-items:center;gap:10px">
                      <el-avatar :size="36" style="background:#2563eb">{{ row.name[0] }}</el-avatar>
                      <div>
                        <b>{{ row.name }}</b>
                        <div class="muted">{{ row.role }} · {{ row.dept }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="拓客目标" width="100" align="right"><template #default="{row}">{{ row.devTarget }}</template></el-table-column>
                <el-table-column label="拓客完成" width="130">
                  <template #default="{row}">
                    <el-progress :percentage="Math.min(100, Math.round(row.devDone/row.devTarget*100))" :stroke-width="10" />
                    <div class="muted" style="text-align:right;font-size:12px">{{ row.devDone }} / {{ row.devTarget }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="跟进目标" width="100" align="right"><template #default="{row}">{{ row.followTarget }}</template></el-table-column>
                <el-table-column label="跟进完成" width="130">
                  <template #default="{row}">
                    <el-progress :percentage="Math.min(100, Math.round(row.followDone/row.followTarget*100))" :stroke-width="10" />
                    <div class="muted" style="text-align:right;font-size:12px">{{ row.followDone }} / {{ row.followTarget }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="成交目标(¥)" width="130" align="right">
                  <template #default="{row}">{{ m(row.amountTarget) }}</template>
                </el-table-column>
                <el-table-column label="成交进度" width="160">
                  <template #default="{row}">
                    <el-progress :percentage="Math.min(100, Math.round(row.amountDone/row.amountTarget*100))" :stroke-width="10"
                      :color="row.amountDone/row.amountTarget >= 0.8 ? '#10b981' : row.amountDone/row.amountTarget >= 0.5 ? '#f59e0b' : '#ef4444'" />
                    <div class="muted" style="text-align:right;font-size:12px">¥{{ m(row.amountDone) }} / ¥{{ m(row.amountTarget) }}</div>
                  </template>
                </el-table-column>
                <el-table-column label="综合完成率" width="110" align="center">
                  <template #default="{row}">
                    <el-progress type="dashboard" :percentage="row.totalRate" :width="72" :stroke-width="10" />
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>

      <!-- ===== 右：待办清单 ===== -->
      <el-col :span="7">
        <div class="card">
          <div class="card-header">
            <div class="card-title">待办任务</div>
            <el-button link type="primary" size="small" @click="showAddTodo = true"><el-icon><Plus /></el-icon>新建</el-button>
          </div>

          <el-tabs v-model="todoTab" size="small">
            <el-tab-pane label="全部" name="all" />
            <el-tab-pane label="进行中" name="doing" />
            <el-tab-pane label="已完成" name="done" />
          </el-tabs>

          <div class="todo-list">
            <div v-for="t in filteredTasks" :key="t.id" class="todo-item" :class="'pri-' + t.priority">
              <div class="todo-check">
                <el-checkbox v-model="t.checked" @change="toggleDone(t)" />
              </div>
              <div class="todo-body" :class="{ done: t.status === 'done' }">
                <div class="todo-title">
                  <el-tag size="small" effect="light"
                    :type="t.priority==='high'?'danger':t.priority==='medium'?'warning':'info'">
                    {{ t.priority==='high'?'紧急':t.priority==='medium'?'重要':'普通' }}
                  </el-tag>
                  {{ t.title }}
                </div>
                <div class="todo-meta muted">
                  <span><el-icon><User /></el-icon>{{ t.owner }}</span>
                  <span><el-icon><Clock /></el-icon>{{ t.deadline }}</span>
                  <el-tag v-if="t.status==='doing'" size="small" type="primary" effect="light">进行中</el-tag>
                  <el-tag v-if="t.status==='pending'" size="small" type="info" effect="light">待开始</el-tag>
                  <el-tag v-if="t.status==='done'" size="small" type="success" effect="light">已完成</el-tag>
                </div>
              </div>
            </div>
          </div>

          <el-button plain style="width:100%;margin-top:12px" @click="showAddTodo = true"><el-icon><Plus /></el-icon>添加任务</el-button>
        </div>

        <!-- 任务提醒 -->
        <div class="card" style="margin-top:16px">
          <div class="card-header"><div class="card-title">近期提醒</div></div>
          <div class="reminder-list">
            <div v-for="(r, i) in reminders" :key="i" class="rm-item">
              <el-icon :color="r.color" :size="18"><el-component :is="r.icon" /></el-icon>
              <div class="rm-body">
                <div class="rm-title">{{ r.title }}</div>
                <div class="rm-meta muted">{{ r.time }} · {{ r.owner }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 新增日程 -->
    <el-dialog v-model="showAddSchedule" title="新建日程/工作事项" width="520px">
      <el-form :model="schedForm" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="日期"><el-date-picker v-model="schedForm.date" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="时间"><el-time-picker v-model="schedForm.time" format="HH:mm" value-format="HH:mm" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="类型">
          <el-radio-group v-model="schedForm.type">
            <el-radio label="follow">客户跟进</el-radio>
            <el-radio label="meeting">会议</el-radio>
            <el-radio label="develop">拓客</el-radio>
            <el-radio label="visit">客户拜访</el-radio>
            <el-radio label="quote">报价</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优先级">
          <el-radio-group v-model="schedForm.priority">
            <el-radio label="high">高</el-radio><el-radio label="medium">中</el-radio><el-radio label="low">低</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="事项标题"><el-input v-model="schedForm.title" /></el-form-item>
        <el-form-item label="详细内容"><el-input v-model="schedForm.content" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="关联客户/商机"><el-input v-model="schedForm.related" placeholder="可选，例如 Global Trading LLC (C202601)" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddSchedule=false">取消</el-button>
        <el-button type="primary" @click="saveSchedule">保存</el-button>
      </template>
    </el-dialog>

    <!-- 新增待办 -->
    <el-dialog v-model="showAddTodo" title="新建待办任务" width="440px">
      <el-form :model="todoForm" label-width="90px">
        <el-form-item label="任务标题"><el-input v-model="todoForm.title" /></el-form-item>
        <el-form-item label="负责人">
          <el-select v-model="todoForm.owner" style="width:100%">
            <el-option v-for="u in users" :key="u.id" :label="u.name" :value="u.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期"><el-date-picker v-model="todoForm.deadline" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        <el-form-item label="优先级">
          <el-radio-group v-model="todoForm.priority">
            <el-radio label="high">紧急</el-radio><el-radio label="medium">重要</el-radio><el-radio label="low">普通</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddTodo=false">取消</el-button>
        <el-button type="primary" @click="saveTodo">创建</el-button>
      </template>
    </el-dialog>

    <!-- 写日报 -->
    <el-dialog v-model="showWriteReport" title="填写工作日报 - 2026-09-02" width="600px">
      <el-form :model="reportForm" label-width="100px">
        <el-form-item label="今日工作内容"><el-input v-model="reportForm.content" type="textarea" :rows="5" placeholder="逐条列明今日完成工作..." /></el-form-item>
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="跟进客户数"><el-input-number v-model="reportForm.followCount" :min="0" style="width:100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="开发线索数"><el-input-number v-model="reportForm.devCount" :min="0" style="width:100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="成交金额(¥)"><el-input-number v-model="reportForm.dealAmount" :min="0" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="明日工作计划"><el-input v-model="reportForm.nextPlan" type="textarea" :rows="3" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showWriteReport=false">取消</el-button>
        <el-button type="primary" @click="saveReport">提交日报</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { schedules as _sch, dailyReports, todoTasks as _tasks, users } from '@/mock'

const schedules = ref([..._sch])
const tasks = ref(_tasks.map(t => ({ ...t, checked: t.status === 'done' })))
const reports = ref([...dailyReports])

const activeTab = ref('calendar')
const todoTab = ref('all')
const viewType = ref('month')

// ===== 日历计算 =====
const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const today = '2026-09-02'
const selectedDate = ref(today)
const curYear = ref(2026)
const curMonth = ref(8) // 0-based, 8=9月

const typeMap = {
  follow: { name: '客户跟进', class: 'blue', bar: 'bar-blue', tag: 'type-follow' },
  meeting: { name: '会议', class: 'purple', bar: 'bar-purple', tag: 'type-meeting' },
  develop: { name: '拓客', class: 'green', bar: 'bar-green', tag: 'type-develop' },
  visit: { name: '客户拜访', class: 'orange', bar: 'bar-orange', tag: 'type-visit' },
  quote: { name: '报价', class: 'cyan', bar: 'bar-cyan', tag: 'type-quote' }
}
const typeName = t => typeMap[t]?.name || t
const barClass = t => typeMap[t]?.bar || ''
const tagClass = t => typeMap[t]?.tag || ''

const buildCalendarCells = () => {
  const first = new Date(curYear.value, curMonth.value, 1)
  const firstWd = first.getDay()
  const daysInMonth = new Date(curYear.value, curMonth.value + 1, 0).getDate()
  const cells = []
  // 上月补齐
  const prevMonth = new Date(curYear.value, curMonth.value, 0).getDate()
  for (let i = firstWd - 1; i >= 0; i--) {
    const y = curMonth.value === 0 ? curYear.value - 1 : curYear.value
    const m = (curMonth.value === 0 ? 11 : curMonth.value - 1)
    const d = prevMonth - i
    cells.push({ curMonth: false, day: d, date: fmt(y, m, d), events: eventsOf(fmt(y, m, d)) })
  }
  // 当月
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ curMonth: true, day: d, date: fmt(curYear.value, curMonth.value, d), events: eventsOf(fmt(curYear.value, curMonth.value, d)) })
  }
  // 下月补齐
  while (cells.length < 42) {
    const idx = cells.length - firstWd - daysInMonth + 1
    const y = curMonth.value === 11 ? curYear.value + 1 : curYear.value
    const m = (curMonth.value + 1) % 12
    cells.push({ curMonth: false, day: idx, date: fmt(y, m, idx), events: eventsOf(fmt(y, m, idx)) })
  }
  return cells
}
const fmt = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
const eventsOf = date => schedules.value.filter(s => s.date === date).map(s => ({
  id: s.id, time: s.time, title: s.title, class: (typeMap[s.type]?.class || 'gray') + '-ev', type: s.type
}))

const calendarCells = computed(buildCalendarCells)
const dayEvents = computed(() => schedules.value.filter(s => s.date === selectedDate.value))

const changeMonth = n => {
  curMonth.value += n
  if (curMonth.value > 11) { curMonth.value = 0; curYear.value++ }
  else if (curMonth.value < 0) { curMonth.value = 11; curYear.value-- }
}
const goToday = () => { curYear.value = 2026; curMonth.value = 8; selectedDate.value = today }
const pickDate = d => { selectedDate.value = d }

// ===== 统计 =====
const todayPending = computed(() => tasks.value.filter(t => t.status !== 'done' && t.deadline === today).length)
const doneCount = computed(() => tasks.value.filter(t => t.status === 'done').length)
const todaySchedules = computed(() => schedules.value.filter(s => s.date === today).length)
const reportsThisWeek = computed(() => reports.value.filter(r => r.date >= '2026-08-27').length)
const teamRate = ref(68)

// ===== 待办筛选 =====
const filteredTasks = computed(() => {
  if (todoTab.value === 'all') return tasks.value
  if (todoTab.value === 'done') return tasks.value.filter(t => t.status === 'done')
  return tasks.value.filter(t => t.status !== 'done')
})

const toggleDone = t => {
  t.status = t.checked ? 'done' : (t.status === 'done' ? 'pending' : t.status)
  ElMessage.success(t.checked ? '恭喜完成任务！' : '已恢复任务')
}

// ===== 日报 =====
const reportDate = ref(''), reportUser = ref('')
const filteredReports = computed(() => reports.value.filter(r => {
  if (reportDate.value && r.date !== reportDate.value) return false
  if (reportUser.value && r.owner !== reportUser.value) return false
  return true
}))
const reportSum = computed(() => filteredReports.value.reduce((p, n) => ({
  follow: p.follow + n.followCount, dev: p.dev + n.devCount, amount: p.amount + n.dealAmount
}), { follow: 0, dev: 0, amount: 0 }))
const submitCount = computed(() => new Set(filteredReports.value.map(r => r.owner)).size)

// ===== 团队进度（mock） =====
const range = ref('week')
const teamProgress = computed(() => [
  { name: '张伟', role: '销售总监', dept: '销售一部', devTarget: 30, devDone: 25, followTarget: 40, followDone: 38, amountTarget: 5000000, amountDone: 4200000, totalRate: 86 },
  { name: '李娜', role: '高级销售', dept: '销售一部', devTarget: 50, devDone: 42, followTarget: 60, followDone: 48, amountTarget: 2000000, amountDone: 1580000, totalRate: 78 },
  { name: '王强', role: '销售', dept: '销售一部', devTarget: 50, devDone: 33, followTarget: 60, followDone: 40, amountTarget: 1500000, amountDone: 900000, totalRate: 62 },
  { name: '陈静', role: '销售', dept: '销售二部', devTarget: 50, devDone: 37, followTarget: 60, followDone: 51, amountTarget: 1800000, amountDone: 1320000, totalRate: 73 },
  { name: '刘洋', role: '销售', dept: '销售二部', devTarget: 50, devDone: 28, followTarget: 60, followDone: 34, amountTarget: 1200000, amountDone: 560000, totalRate: 52 }
])

// ===== 提醒 =====
const reminders = computed(() => [
  { icon: 'Bell', color: '#ef4444', title: '客户跟进 · Global Trading 合同签署', time: '今天 09:30', owner: '李娜' },
  { icon: 'Calendar', color: '#f59e0b', title: '销售周会 · Q3业绩汇报', time: '今天 14:00', owner: '全员' },
  { icon: 'Present', color: '#10b981', title: 'Nordic 签约仪式', time: '09-03 10:00', owner: '张伟' },
  { icon: 'Money', color: '#8b5cf6', title: 'EuroInd 报价截止提醒', time: '09-05 15:00', owner: '王强' },
  { icon: 'Clock', color: '#0ea5e9', title: '生日客户礼物寄送', time: '09-10 前', owner: '刘洋' }
])

// ===== 弹窗 =====
const showAddSchedule = ref(false), showAddTodo = ref(false), showWriteReport = ref(false)
const schedForm = reactive({ date: today, time: '09:00', type: 'follow', priority: 'medium', title: '', content: '', related: '' })
const todoForm = reactive({ title: '', owner: '张伟', deadline: '2026-09-10', priority: 'medium' })
const reportForm = reactive({ content: '', followCount: 0, devCount: 0, dealAmount: 0, nextPlan: '' })

const saveSchedule = () => {
  if (!schedForm.title) return ElMessage.warning('请填写事项标题')
  schedules.value.push({ id: 'S' + Date.now().toString().slice(-4), ...schedForm, owner: '张伟', status: 'pending' })
  ElMessage.success('日程已添加')
  showAddSchedule.value = false
}
const saveTodo = () => {
  if (!todoForm.title) return ElMessage.warning('请填写任务标题')
  tasks.value.unshift({ id: 'T' + Date.now().toString().slice(-3), ...todoForm, status: 'pending', checked: false })
  ElMessage.success('待办任务已创建')
  showAddTodo.value = false
}
const saveReport = () => {
  if (!reportForm.content) return ElMessage.warning('请填写工作内容')
  reports.value.unshift({ id: 'D' + Date.now(), date: today, owner: '张伟', dept: '销售一部', ...reportForm })
  ElMessage.success('日报已提交')
  showWriteReport.value = false
}

const m = v => (v || 0).toLocaleString()
</script>

<style scoped lang="scss">
.muted { color: #64748b; font-size: 12px; }
.whitespace-pre-line { white-space: pre-line; }
.cur-month { font-size: 18px; font-weight: 600; margin-left: 12px; }
.card-inner { background: #f8fafc; border-radius: 8px; padding: 16px; margin-top: 16px; }

/* 日历 */
.calendar-grid {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  .week-head { display: grid; grid-template-columns: repeat(7, 1fr); background: #f8fafc; border-bottom: 1px solid var(--border-color);
    .wh-cell { padding: 10px 0; text-align: center; font-weight: 500; font-size: 13px; color: #475569; }
  }
  .day-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
  .day-cell {
    min-height: 110px; border-right: 1px solid var(--border-light);
    border-bottom: 1px solid var(--border-light);
    padding: 6px 8px; cursor: pointer; transition: background 0.15s;
    display: flex; flex-direction: column;
    &:nth-child(7n) { border-right: none; }
    &:hover { background: #f0f7ff; }
    &.other-month { background: #fafbfc; .day-num { color: #cbd5e1; } .day-ev { opacity: 0.5; } }
    &.today-cell { background: #eff6ff; .day-num { background: #2563eb; color: #fff !important; } }
    &.selected-cell { outline: 2px solid #2563eb; outline-offset: -2px; }

    .day-num {
      display: inline-flex; align-items: center; justify-content: center;
      width: 26px; height: 26px; border-radius: 50%; font-weight: 500; margin-bottom: 4px;
    }
    .day-events { flex: 1; display: flex; flex-direction: column; gap: 3px; overflow: hidden; }
    .day-ev {
      display: flex; align-items: center; gap: 4px; font-size: 11.5px;
      padding: 2px 6px; border-radius: 4px; line-height: 1.5;
      .ev-time { font-weight: 600; }
      &.blue-ev { background: #dbeafe; color: #1e40af; }
      &.green-ev { background: #d1fae5; color: #065f46; }
      &.purple-ev { background: #ede9fe; color: #6d28d9; }
      &.orange-ev { background: #fed7aa; color: #c2410c; }
      &.cyan-ev { background: #cffafe; color: #0e7490; }
      &.gray-ev { background: #f1f5f9; color: #475569; }
    }
    .more { font-size: 11px; color: #64748b; text-align: right; padding: 0 4px; }
  }
}

.day-detail { h4 { margin: 0 0 12px 0; } }
.sch-item { display: flex; gap: 10px; padding: 12px 0; border-bottom: 1px dashed var(--border-color);
  &:last-child { border-bottom: none; }
  .sch-time { width: 64px; text-align: center; position: relative; padding-top: 2px;
    .st-time { font-size: 14px; font-weight: 600; }
    .st-bar { width: 3px; height: calc(100% - 20px); position: absolute; left: 50%; transform: translateX(-50%); margin-top: 6px; border-radius: 2px; }
    .bar-blue { background: #3b82f6; } .bar-green { background: #10b981; } .bar-purple { background: #8b5cf6; }
    .bar-orange { background: #f97316; } .bar-cyan { background: #06b6d4; }
  }
  .sch-body { flex: 1; padding-top: 2px;
    .sch-title { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
    .sch-content { margin-bottom: 6px; }
    .sch-meta { display: flex; gap: 14px; span { display: inline-flex; align-items: center; gap: 3px; } }
    .type-follow { background: #dbeafe !important; color: #1e40af !important; border-color: transparent !important; }
    .type-meeting { background: #ede9fe !important; color: #6d28d9 !important; border-color: transparent !important; }
    .type-develop { background: #d1fae5 !important; color: #065f46 !important; border-color: transparent !important; }
    .type-visit { background: #fed7aa !important; color: #c2410c !important; border-color: transparent !important; }
    .type-quote { background: #cffafe !important; color: #0e7490 !important; border-color: transparent !important; }
  }
}

/* 日报 */
.report-summary {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
  .sum-item { background: #f8fafc; border-radius: 8px; padding: 14px; text-align: center;
    .label { font-size: 12px; color: #64748b; margin-bottom: 6px; }
    .num { font-size: 22px; font-weight: 700; color: #2563eb; }
  }
}
.mini-stats { display: flex; flex-direction: column; gap: 4px; font-size: 12px;
  span { display: inline-flex; align-items: center; gap: 3px; color: #475569; }
}
.content-cell { font-size: 13px; line-height: 1.6; max-height: 90px; overflow: hidden; }

/* 待办 */
.todo-list { display: flex; flex-direction: column; gap: 8px; }
.todo-item {
  display: flex; gap: 10px; padding: 10px 12px; border-radius: 8px;
  background: #fff; border: 1px solid var(--border-light);
  &.pri-high { border-left: 4px solid #ef4444; }
  &.pri-medium { border-left: 4px solid #f59e0b; }
  &.pri-low { border-left: 4px solid #0ea5e9; }
  .todo-check { padding-top: 2px; }
  .todo-body { flex: 1;
    .todo-title { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; flex-wrap: wrap; }
    .todo-meta { display: flex; flex-wrap: wrap; gap: 10px; font-size: 12px;
      span { display: inline-flex; align-items: center; gap: 3px; }
    }
    &.done .todo-title { text-decoration: line-through; color: #94a3b8; }
  }
}

/* 提醒 */
.reminder-list { display: flex; flex-direction: column; gap: 12px; }
.rm-item { display: flex; gap: 10px; padding: 8px 4px;
  .rm-body { flex: 1;
    .rm-title { font-size: 13.5px; color: #334155; margin-bottom: 2px; }
    .rm-meta { font-size: 11.5px; }
  }
}
</style>
