<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <div class="page-title">邮件追踪</div>
        <div class="page-subtitle">
          投递状态追踪 · 打开/点击行为监控 · 按客户聚合往来邮件
        </div>
      </div>
      <div class="page-actions">
        <el-select v-model="dateRange" size="large" style="width:280px">
          <el-option label="近 7 天" value="7d" />
          <el-option label="近 30 天（当前）" value="30d" />
          <el-option label="本月" value="month" />
          <el-option label="季度" value="quarter" />
        </el-select>
        <el-button size="large" plain @click="refresh">
          <el-icon><Refresh /></el-icon>&nbsp; 拉取最新追踪
        </el-button>
      </div>
    </div>

    <!-- ========== 5 张统计卡 ========== -->
    <div class="stat-cards">
      <div class="stat-card" @click="goStatus('all')">
        <div class="stat-info">
          <div class="stat-label">今日发送数</div>
          <div class="stat-value">{{ todaySent }}</div>
          <div class="stat-sub">一对一外发邮件</div>
        </div>
        <div class="stat-icon blue"><el-icon><Promotion /></el-icon></div>
      </div>
      <div class="stat-card" @click="goStatus('delivered')">
        <div class="stat-info">
          <div class="stat-label">成功送达</div>
          <div class="stat-value">{{ deliveredCount }}</div>
          <div class="stat-sub">送达率 <b>{{ deliveryRate }}%</b></div>
        </div>
        <div class="stat-icon green"><el-icon><CircleCheck /></el-icon></div>
      </div>
      <div class="stat-card" @click="goStatus('opened')">
        <div class="stat-info">
          <div class="stat-label">平均打开率</div>
          <div class="stat-value">{{ avgOpenRate }}%</div>
          <div class="stat-sub">点击即查看详情</div>
        </div>
        <div class="stat-icon orange"><el-icon><View /></el-icon></div>
      </div>
      <div class="stat-card" @click="goStatus('replied')">
        <div class="stat-info">
          <div class="stat-label">客户回复数</div>
          <div class="stat-value">{{ repliedCount }}</div>
          <div class="stat-sub">回复率 <b>{{ repliedRate }}%</b></div>
        </div>
        <div class="stat-icon cyan"><el-icon><ChatLineRound /></el-icon></div>
      </div>
      <div class="stat-card" @click="goStatus('bounced')">
        <div class="stat-info">
          <div class="stat-label">退信 / 失败</div>
          <div class="stat-value">{{ bouncedCount }}</div>
          <div class="stat-sub" :class="{'danger-text': bouncedCount>0}">
            <span v-if="bouncedCount>0">需立即处理</span>
            <span v-else>暂无异常</span>
          </div>
        </div>
        <div class="stat-icon red"><el-icon><Warning /></el-icon></div>
      </div>
    </div>

    <!-- ========== 顶部 2 个 Tab ========== -->
    <el-tabs v-model="activeTab" type="card" size="large" class="main-tabs">
      <el-tab-pane label="📮 投递状态追踪" name="status">
        <div class="tab-card">
          <!-- 左侧 状态筛选条 -->
          <div class="status-bar">
            <div class="bar-title">按投递阶段</div>
            <div class="bar-chips">
              <div v-for="s in statusChips" :key="s.key"
                   class="bar-chip" :class="{active: statusFilter===s.key, [s.key]: true}"
                   @click="statusFilter = s.key">
                <el-icon style="vertical-align:-2px">
                  <Message v-if="s.key==='all'" />
                  <Clock v-else-if="s.key==='pending'" />
                  <Connection v-else-if="s.key==='sending'" />
                  <Promotion v-else-if="s.key==='sent'" />
                  <CircleCheck v-else-if="s.key==='delivered'" />
                  <View v-else-if="s.key==='opened'" />
                  <Link v-else-if="s.key==='clicked'" />
                  <ChatLineRound v-else-if="s.key==='replied'" />
                  <CircleClose v-else-if="s.key==='bounced'" />
                  <Warning v-else />
                </el-icon>
                &nbsp; {{ s.label }}
                <span class="chip-num" v-if="counterMap[s.key]!==undefined">({{ counterMap[s.key] }})</span>
              </div>
            </div>
            <div v-if="statusFilter" style="margin-top:10px">
              <el-tag closable size="default" effect="dark" :type="currentChip?.type" @close="statusFilter=''">
                当前筛选：{{ currentChip?.label }} · {{ counterMap[statusFilter] || 0 }} 封
              </el-tag>
            </div>
          </div>

          <div class="table-toolbar">
            <div style="display:flex;gap:10px;align-items:center">
              <el-input v-model="kw" placeholder="搜索主题 / 收件人 / 客户" clearable style="width:300px">
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
              <el-select v-model="accountFilter" placeholder="按发件账号" clearable style="width:220px">
                <el-option v-for="a in accounts" :key="a.id" :value="a.id" :label="`${a.alias} · ${a.type}`" />
              </el-select>
              <el-select v-model="typeFilter" placeholder="按账号类型" clearable style="width:160px">
                <el-option label="企业邮箱" value="企业邮箱" />
                <el-option label="Gmail" value="Gmail" />
                <el-option label="Outlook" value="Outlook" />
                <el-option label="QQ邮箱" value="QQ邮箱" />
              </el-select>
            </div>
            <div>
              <el-button :disabled="!selTrakRows.length" type="primary" plain @click="batchRetry">
                <el-icon><RefreshRight /></el-icon>&nbsp; 批量重试退信（{{ selTrakRows.length }}）
              </el-button>
              <el-button :disabled="!selTrakRows.length" type="danger" plain>
                <el-icon><Delete /></el-icon>&nbsp; 批量移除记录
              </el-button>
            </div>
          </div>

          <el-table :data="filteredRows" stripe @selection-change="r => selTrakRows = r" style="width:100%">
            <el-table-column type="selection" width="52" />
            <el-table-column label="主题" min-width="270">
              <template #default="{ row }">
                <div class="subj-cell">
                  <span class="subj-txt">{{ row.subject }}</span>
                  <el-tag v-if="row.replied" size="small" type="success" effect="dark" round style="margin-left:6px">已回复</el-tag>
                  <el-tag v-if="row.bounced" size="small" type="danger" effect="dark" round style="margin-left:6px">已退信</el-tag>
                  <el-tag v-if="row.opens >= 3" size="small" type="warning" effect="light" style="margin-left:6px">高频打开</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="发件" width="150">
              <template #default="{ row }">
                <div style="display:flex;flex-direction:column;gap:2px">
                  <span style="font-weight:600">{{ row.fromAddr.split('@')[0] }}</span>
                  <span style="color:#94a3b8;font-size:12px">{{ row.accountType }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="收件人（客户）" min-width="260">
              <template #default="{ row }">
                <div style="display:flex;align-items:center;gap:10px">
                  <el-avatar :size="32" :style="{background: avatarBg(row.toAddr)}">{{ first(row.toContact) || first(row.toAddr) }}</el-avatar>
                  <div style="min-width:0">
                    <div style="font-weight:600">{{ row.toContact }}</div>
                    <div style="color:#64748b;font-size:12px">{{ row.toAddr }}</div>
                    <el-tag v-if="row.toCustomer" size="small" type="primary" effect="light" style="margin-top:2px">
                      {{ row.toCustomer }}
                    </el-tag>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="发送时间" width="150" prop="sentAt" sortable />
            <el-table-column label="当前状态" width="130" align="center">
              <template #default="{ row }">
                <el-tag size="default" effect="dark" :type="statusToType(row.latestStatus)">
                  <el-icon style="vertical-align:-2px">
                    <Clock v-if="row.latestStatus==='pending'" />
                    <Connection v-else-if="row.latestStatus==='sending'" />
                    <Promotion v-else-if="row.latestStatus==='sent'" />
                    <CircleCheck v-else-if="row.latestStatus==='delivered'" />
                    <View v-else-if="row.latestStatus==='opened'" />
                    <ChatLineRound v-else-if="row.latestStatus==='replied'" />
                    <CircleClose v-else-if="row.latestStatus==='bounced'" />
                    <Warning v-else />
                  </el-icon>
                  &nbsp; {{ statusToLabel(row.latestStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="追踪数据" width="220" align="center">
              <template #default="{ row }">
                <div class="trak-stats">
                  <el-statistic size="mini" title="打开" :value="row.opens" />
                  <el-statistic size="mini" title="点击" :value="row.clicks" />
                  <el-statistic size="mini" title="回复" :value="row.replied ? 1 : 0" />
                </div>
              </template>
            </el-table-column>
            <el-table-column label="退信原因" v-if="bouncedCount>0 || statusFilter==='bounced'" min-width="220">
              <template #default="{ row }">
                <el-tag v-if="row.bounceCode" size="small" type="danger" effect="plain">{{ row.bounceCode }}</el-tag>
                <span v-else style="color:#94a3b8">—</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openDetail(row)"><el-icon><View /></el-icon>&nbsp;投递链路</el-button>
                <el-button link type="primary" size="small" @click="openInCommonMail(row)"><el-icon><EditPen /></el-icon>&nbsp;发跟进</el-button>
                <el-button v-if="row.bounced" link type="danger" size="small" @click="oneRetry(row)"><el-icon><RefreshRight /></el-icon>&nbsp;重发</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <el-tab-pane label="🧑‍💼 客户维度追踪" name="customer">
        <div class="tab-card">
          <div class="table-toolbar">
            <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
              <el-input v-model="customerKw" placeholder="搜索客户公司名 / 联系人" clearable style="width:300px">
                <template #prefix><el-icon><OfficeBuilding /></el-icon></template>
              </el-input>
              <el-select v-model="custLevelFilter" placeholder="客户等级（来自客户池）" clearable style="width:220px">
                <el-option label="S 级 · 头部客户" value="S" />
                <el-option label="A 级 · 高价值" value="A" />
                <el-option label="B 级 · 常规" value="B" />
                <el-option label="C 级 · 潜在" value="C" />
              </el-select>
              <el-select v-model="custOwnerFilter" placeholder="客户负责人" clearable style="width:180px">
                <el-option v-for="u in owners" :key="u.name" :value="u.name" :label="u.name" />
              </el-select>
              <el-select v-model="custReplyFilter" placeholder="互动状态" clearable style="width:180px">
                <el-option label="已回复客户" value="replied" />
                <el-option label="已打开未回复" value="opened_noreply" />
                <el-option label="已送达未打开" value="delivered_notopen" />
                <el-option label="有退信" value="bounced" />
              </el-select>
            </div>
            <div>
              <el-button type="primary" plain @click="exportCustomerTracking"><el-icon><Download /></el-icon>&nbsp;导出客户邮件追踪</el-button>
            </div>
          </div>

          <el-table :data="filteredCustomerRows" stripe>
            <el-table-column label="客户" min-width="260">
              <template #default="{ row }">
                <div style="display:flex;align-items:center;gap:10px">
                  <el-avatar :size="40" :style="{background: avatarBg(row.shortName)}">{{ row.shortName?.slice(0,1) || 'C' }}</el-avatar>
                  <div style="min-width:0">
                    <div style="font-weight:700;color:#0f172a">{{ row.shortName }}</div>
                    <div style="color:#64748b;font-size:12px">{{ row.company }} · {{ row.country }}</div>
                    <el-tag size="small" :type="levelTag(row.level)" effect="light" style="margin-top:2px">{{ row.level }} 级</el-tag>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="联系人 / 负责人" width="180">
              <template #default="{ row }">
                <div style="display:flex;flex-direction:column;gap:3px">
                  <span>🧑 {{ row.contact }}</span>
                  <span style="color:#64748b">👤 {{ row.follower }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="往来邮件数" align="center" width="120">
              <template #default="{ row }">
                <b style="font-size:16px">{{ row.totalMails }}</b>
                <div style="color:#94a3b8;font-size:12px">发 {{ row.sent }} / 收 {{ row.received }}</div>
              </template>
            </el-table-column>
            <el-table-column label="最近一次联系" width="160" prop="latestAt" sortable />
            <el-table-column label="打开率" width="150" align="center">
              <template #default="{ row }">
                <el-progress :percentage="row.openRate" :stroke-width="10" :color="rateColor(row.openRate)" />
              </template>
            </el-table-column>
            <el-table-column label="状态标签" width="150" align="center">
              <template #default="{ row }">
                <el-tag size="small" effect="dark" :type="custStatusType(row)">
                  {{ custStatusText(row) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="openCustomerDialog(row)">
                  <el-icon><ChatLineRound /></el-icon>&nbsp;查看往来邮件时间轴
                </el-button>
                <el-button link type="primary" size="small" @click="goCustomerProfile(row.id)">
                  <el-icon><User /></el-icon>&nbsp;跳客户档案
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- ========== 抽屉 1：单封邮件投递链路 ========== -->
    <el-drawer v-model="detailVisible" title="邮件投递链路追踪" size="640px">
      <div v-if="detail" class="drawer-inner">
        <div class="drawer-head-card">
          <div style="display:flex;justify-content:space-between;align-items:flex-start">
            <div>
              <h3 style="margin:0 0 8px;font-size:18px">{{ detail.subject }}</h3>
              <div class="meta-row">
                <el-tag size="small" :type="statusToType(detail.latestStatus)" effect="dark">
                  最终：{{ statusToLabel(detail.latestStatus) }}
                </el-tag>
                <span style="color:#94a3b8">📤 {{ detail.fromAddr }} → 📥 {{ detail.toAddr }}</span>
              </div>
              <div v-if="detail.toCustomer" style="margin-top:6px">
                <el-tag size="small" type="primary" effect="light">
                  <el-icon><OfficeBuilding /></el-icon>&nbsp; {{ detail.toCustomer }} · {{ detail.toContact }}
                </el-tag>
              </div>
            </div>
            <div style="text-align:right">
              <div style="color:#64748b;font-size:12px;margin-bottom:6px">账号类型：{{ detail.accountType }}</div>
              <div style="color:#64748b;font-size:12px;margin-bottom:6px">发送时间：{{ detail.sentAt }}</div>
              <div class="trak-stats" style="justify-content:flex-end">
                <el-statistic size="mini" title="打开" :value="detail.opens" />
                <el-statistic size="mini" title="点击" :value="detail.clicks" />
                <el-statistic size="mini" title="回复" :value="detail.replied?1:0" />
              </div>
            </div>
          </div>

          <!-- 进度条：投递阶段可视化 -->
          <el-steps :active="deliveryStepIndex(detail.latestStatus)" line-width="2" finish-status="success" align-center style="margin-top:20px">
            <el-step title="入队列">
              <template #icon><el-icon><Clock /></el-icon></template>
            </el-step>
            <el-step title="SMTP 发送">
              <template #icon><el-icon><Promotion /></el-icon></template>
            </el-step>
            <el-step title="送达">
              <template #icon><el-icon><CircleCheck /></el-icon></template>
            </el-step>
            <el-step title="已打开">
              <template #icon><el-icon><View /></el-icon></template>
            </el-step>
            <el-step title="已回复">
              <template #icon><el-icon><ChatLineRound /></el-icon></template>
            </el-step>
          </el-steps>

          <div v-if="detail.bounced" class="bounce-alert" style="margin-top:18px">
            <el-alert :title="`⚠️ 邮件已退信：${detail.bounceCode || 'Unknown'}`" type="error" :closable="false" show-icon>
              <template #default>
                <p style="margin:4px 0 10px;color:#7f1d1d">
                  建议：检查邮箱拼写是否正确，或联系客户确认邮箱是否变更。
                </p>
                <div style="display:flex;gap:8px;flex-wrap:wrap">
                  <el-button size="small" type="primary" @click="oneRetry(detail)"><el-icon><RefreshRight /></el-icon>&nbsp;立即重试</el-button>
                  <el-button size="small" plain @click="openInCommonMail(detail)"><el-icon><EditPen /></el-icon>&nbsp;去普邮重新编辑</el-button>
                </div>
              </template>
            </el-alert>
          </div>
        </div>

        <!-- 时间轴 -->
        <div style="margin-top:18px">
          <h4 style="margin:10px 0 14px;color:#0f172a">📋 详细追踪事件（{{ detail.timeline.length }} 条）</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(e, i) in detail.timeline.slice().reverse()"
              :key="i"
              :type="evType(e.ev)"
              :timestamp="e.t"
              placement="top"
              :hollow="false">
              <template #icon>
                <el-icon>
                  <Clock v-if="e.ev==='pending'" />
                  <Connection v-else-if="e.ev==='sending'" />
                  <Promotion v-else-if="e.ev==='sent'" />
                  <CircleCheck v-else-if="e.ev==='delivered'" />
                  <View v-else-if="e.ev==='opened'" />
                  <Link v-else-if="e.ev==='clicked'" />
                  <ChatLineRound v-else-if="e.ev==='replied'" />
                  <CircleClose v-else-if="e.ev==='bounced'" />
                  <Warning v-else />
                </el-icon>
              </template>
              <el-card shadow="never" class="timeline-card">
                <div class="timeline-head">
                  <span style="font-weight:700;font-size:14px">{{ e.label }}</span>
                  <el-tag size="small" effect="plain" :type="evType(e.ev)">{{ evTypeTag(e.ev) }}</el-tag>
                </div>
                <div style="color:#475569;margin-top:4px" v-if="e.detail">{{ e.detail }}</div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <template #footer>
        <div style="display:flex;justify-content:space-between">
          <el-button size="large" @click="detailVisible=false">关闭</el-button>
          <div>
            <el-button v-if="detail?.bounced" size="large" type="warning" @click="oneRetry(detail)"><el-icon><RefreshRight /></el-icon>&nbsp;重试这封</el-button>
            <el-button size="large" type="primary" :disabled="!detail" @click="openInCommonMail(detail)">
              <el-icon><EditPen /></el-icon>&nbsp;基于此邮件发跟进
            </el-button>
          </div>
        </div>
      </template>
    </el-drawer>

    <!-- ========== Dialog 2：客户维度往来时间轴 ========== -->
    <el-dialog v-model="customerDialogVisible" width="880px" top="4vh" :destroy-on-close="true">
      <template #title v-if="currentCustomer">
        <div style="display:flex;align-items:center;gap:12px">
          <el-avatar :size="38" :style="{background: avatarBg(currentCustomer.shortName)}">{{ currentCustomer.shortName?.slice(0,1) || 'C' }}</el-avatar>
          <div>
            <b style="font-size:16px">{{ currentCustomer.shortName }}</b>
            <span style="color:#94a3b8;margin-left:8px">往来邮件时间轴</span>
          </div>
          <el-tag size="small" :type="levelTag(currentCustomer.level)" effect="light" style="margin-left:8px">{{ currentCustomer.level }} 级</el-tag>
          <el-tag size="small" type="primary" effect="plain" style="margin-left:4px">负责人：{{ currentCustomer.follower }}</el-tag>
        </div>
      </template>
      <div v-if="currentCustomer">
        <el-descriptions :column="2" border size="default" style="margin-bottom:14px">
          <el-descriptions-item label="客户全称">{{ currentCustomer.company }}</el-descriptions-item>
          <el-descriptions-item label="所在地区">{{ currentCustomer.country }}</el-descriptions-item>
          <el-descriptions-item label="对接人">{{ currentCustomer.contact }}</el-descriptions-item>
          <el-descriptions-item label="往来邮件合计">{{ currentCustomer.totalMails }} 封（发 {{ currentCustomer.sent }} / 收 {{ currentCustomer.received }}）</el-descriptions-item>
          <el-descriptions-item label="最近联系">{{ currentCustomer.latestAt }}</el-descriptions-item>
          <el-descriptions-item label="互动状态">
            <el-tag size="small" :type="custStatusType(currentCustomer)" effect="dark">{{ custStatusText(currentCustomer) }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <el-timeline>
          <el-timeline-item
            v-for="m in customerMails" :key="m.id"
            :timestamp="m.sendAt"
            :type="m.direction==='in' ? 'primary' : 'success'"
            placement="top">
            <template #icon>
              <el-icon>
                <ChatLineRound v-if="m.direction==='in'" />
                <Promotion v-else />
              </el-icon>
            </template>
            <el-card shadow="never" :class="['thread-card', m.direction==='in' ? 'inbox' : 'outbox']">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
                  <el-tag size="small" effect="dark" :type="m.direction==='in' ? 'primary' : 'success'">
                    {{ m.direction==='in' ? `📥 ${m.fromName} 来信` : `📤 我（${m.accountAlias}）→ ${m.toName}` }}
                  </el-tag>
                  <b style="font-size:14px">{{ m.subject }}</b>
                  <el-tag v-if="m.hasAttach" size="small" effect="plain">📎</el-tag>
                </div>
                <div>
                  <el-button link size="small" type="primary" @click="jumpMailInCommon(m)">在普邮中打开</el-button>
                </div>
              </div>
              <div style="margin-top:8px;color:#475569">{{ m.preview }}</div>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      <template #footer>
        <div style="display:flex;justify-content:space-between">
          <el-button size="large" plain @click="customerDialogVisible = false">关闭</el-button>
          <el-button size="large" type="primary" :disabled="!currentCustomer" @click="goCustomerProfile(currentCustomer.id)">
            <el-icon><User /></el-icon>&nbsp;跳转到客户档案查看完整跟进记录
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Promotion, CircleCheck, View, ChatLineRound, Warning, Refresh, Search, RefreshRight, Delete,
  Download, EditPen, OfficeBuilding, User, Clock,
  Star, Message, DataAnalysis, CircleClose, Link, Connection
} from '@element-plus/icons-vue'
import {
  mailAccounts as _accs, mailTracking as _trak, mails as _mails, customers as _cust, users as _users
} from '@/mock'

const router = useRouter()
// 用 markRaw 避免 icon 响应式警告
const PromotionIcon  = markRaw(Promotion)
const CircleCheckIcon = markRaw(CircleCheck)
const ViewIcon       = markRaw(View)
const ChatIcon       = markRaw(ChatLineRound)

// ========== 基础 ==========
const accounts = [..._accs]
const trakRows = ref(_trak.map(t => ({ ...t })))   // 追踪表行（允许修改 opened/clicks 做模拟）
const allMails = _mails
const customerTable = _cust.map(c => ({ ...c, company: c.name }))
const owners = _users

// ========== 全局状态 ==========
const dateRange = ref('30d')
const activeTab = ref('status')
const statusFilter = ref('')
const kw = ref('')
const accountFilter = ref('')
const typeFilter = ref('')
const selTrakRows = ref([])

const customerKw = ref('')
const custLevelFilter = ref('')
const custOwnerFilter = ref('')
const custReplyFilter = ref('')

const detailVisible = ref(false)
const detail = ref(null)

const customerDialogVisible = ref(false)
const currentCustomer = ref(null)

// ========== 统计 ==========
const todaySent = computed(() => trakRows.value.filter(t => (t.sentAt||'').startsWith('2026-09-02')).length)
const deliveredCount = computed(() => trakRows.value.filter(t => !t.bounced && !t.failed).length)
const allTracked = computed(() => trakRows.value.length || 1)
const deliveryRate = computed(() => Math.round(deliveredCount.value / allTracked.value * 100))
const avgOpenRate = computed(() => {
  const rows = trakRows.value.filter(t => !t.bounced && !t.failed)
  if (!rows.length) return 0
  // 每封邮件"是否被打开"算 1，累计打开发 / 总封数 → 百分比
  const openedCount = rows.filter(t => t.opens > 0).length
  return Math.round(openedCount / rows.length * 100)
})
const repliedCount = computed(() => trakRows.value.filter(t => t.replied).length)
const repliedRate = computed(() => Math.round(repliedCount.value / allTracked.value * 100))
const bouncedCount = computed(() => trakRows.value.filter(t => t.bounced).length)

// ========== 投递状态 chips ==========
const statusChips = [
  { key: 'all',       label: '全部邮件', icon: markRaw(Message),       type: 'primary' },
  { key: 'pending',   label: '待发送',   icon: markRaw(Clock),         type: 'info' },
  { key: 'sending',   label: '发送中',   icon: markRaw(Connection),    type: 'warning' },
  { key: 'sent',      label: '已发送',   icon: markRaw(Promotion),     type: 'primary' },
  { key: 'delivered', label: '已送达',   icon: markRaw(CircleCheck),   type: 'success' },
  { key: 'opened',    label: '已打开',   icon: markRaw(View),          type: 'success' },
  { key: 'clicked',   label: '链接点击', icon: markRaw(Link),          type: 'warning' },
  { key: 'replied',   label: '已回复',   icon: markRaw(ChatLineRound), type: 'success' },
  { key: 'bounced',   label: '已退信',   icon: markRaw(CircleClose),   type: 'danger'  },
  { key: 'failed',    label: '发送失败', icon: markRaw(Warning),       type: 'danger'  }
]
const currentChip = computed(() => statusChips.find(s => s.key === statusFilter.value))
const counterMap = computed(() => {
  const m = { all: trakRows.value.length }
  trakRows.value.forEach(t => {
    // 基础状态单值
    m[t.latestStatus] = (m[t.latestStatus] || 0) + 1
    // clicked 是基于 opens/clicks 派生的
    if (t.clicks > 0) m.clicked = (m.clicked || 0) + 1
    if (t.opens > 0)  m.opened  = (m.opened  || 0) + 1
  })
  return m
})

// ========== 状态 → 标签/颜色/图标 ==========
const statusToLabel = s => statusChips.find(x => x.key===s)?.label || '未知'
const statusToType  = s => statusChips.find(x => x.key===s)?.type  || 'info'
const statusIcon    = s => statusChips.find(x => x.key===s)?.icon  || Message
const deliveryStepIndex = s => ({pending:1, sending:1.5, sent:2, delivered:3, opened:4, replied:5, clicked:3.5, bounced:0, failed:0}[s] | 0 || 0)

// ========== 投递状态 Tab 过滤 ==========
const filteredRows = computed(() => {
  let list = trakRows.value
  if (statusFilter.value && statusFilter.value !== 'all') {
    const k = statusFilter.value
    if (k === 'opened')       list = list.filter(t => t.opens > 0)
    else if (k === 'clicked') list = list.filter(t => t.clicks > 0)
    else                      list = list.filter(t => t.latestStatus === k)
  }
  if (accountFilter.value) {
    const a = accounts.find(x => x.id === accountFilter.value)
    if (a) list = list.filter(t => t.fromAddr === a.username)
  }
  if (typeFilter.value)    list = list.filter(t => t.accountType === typeFilter.value)
  if (kw.value) {
    const k = kw.value.toLowerCase()
    list = list.filter(t =>
      t.subject.toLowerCase().includes(k) ||
      t.toAddr.toLowerCase().includes(k) ||
      t.toCustomer.toLowerCase().includes(k) ||
      t.toContact.toLowerCase().includes(k) ||
      t.fromAddr.toLowerCase().includes(k)
    )
  }
  return list.slice().sort((a, b) => (b.sentAt||'').localeCompare(a.sentAt||''))
})

// ========== 客户维度数据聚合 ==========
const customerTrackRows = computed(() => {
  // 每客户聚合：来自 trakRows（追踪的外发）+ allMails（往来收件）
  const map = new Map()
  for (const t of trakRows.value) {
    if (!t.toCustomer) continue
    const key = t.toCustomer
    if (!map.has(key)) {
      map.set(key, {
        toCustomer: key, toContact: t.toContact, sentTracking: [], receivedMails: [],
        opensSum: 0, clicksSum: 0, repliedSum: 0, bouncedSum: 0
      })
    }
    const r = map.get(key)
    r.sentTracking.push(t)
    r.opensSum += t.opens; r.clicksSum += t.clicks
    if (t.replied) r.repliedSum += 1
    if (t.bounced) r.bouncedSum += 1
  }
  for (const m of allMails) {
    if (!m.customerName) continue
    const key = m.customerName
    if (!map.has(key)) {
      map.set(key, { toCustomer: key, toContact: m.contact||'', sentTracking: [], receivedMails: [], opensSum:0, clicksSum:0, repliedSum:0, bouncedSum:0 })
    }
    if (m.direction === 'in') map.get(key).receivedMails.push(m)
  }

  // 再拼上客户池客户的基础信息 + 汇总指标
  const rows = []
  for (const [toCustomer, agg] of map.entries()) {
    const cust = customerTable.find(c => (c.company === toCustomer) || (c.shortName && toCustomer.includes(c.shortName)))
    const totalSent = agg.sentTracking.length
    const openedSent = agg.sentTracking.filter(t => t.opens > 0).length
    rows.push({
      id: cust?.id || '',
      company: cust?.company || toCustomer,
      shortName: cust?.shortName || toCustomer.slice(0, 18),
      level: cust?.level || 'B',
      country: cust?.country || '—',
      contact: agg.toContact || cust?.contact || '（待录入）',
      follower: cust?.follower || '—',
      totalMails: totalSent + agg.receivedMails.length,
      sent: totalSent,
      received: agg.receivedMails.length,
      latestAt: [
        ...agg.sentTracking.map(t => t.sentAt),
        ...agg.receivedMails.map(m => m.sendAt)
      ].sort().reverse()[0] || '—',
      openRate: totalSent ? Math.round(openedSent / totalSent * 100) : 0,
      replied: agg.repliedSum > 0 || agg.receivedMails.length > 0,
      hasBounce: agg.bouncedSum > 0,
      openedSent, totalSent,
      _agg: agg
    })
  }
  return rows.sort((a, b) => (b.latestAt||'').localeCompare(a.latestAt||''))
})
const filteredCustomerRows = computed(() => {
  let list = customerTrackRows.value
  if (customerKw.value) {
    const k = customerKw.value.toLowerCase()
    list = list.filter(r => r.company.toLowerCase().includes(k) || r.shortName.toLowerCase().includes(k) || r.contact.toLowerCase().includes(k))
  }
  if (custLevelFilter.value) list = list.filter(r => r.level === custLevelFilter.value)
  if (custOwnerFilter.value) list = list.filter(r => r.follower === custOwnerFilter.value)
  if (custReplyFilter.value) {
    const f = custReplyFilter.value
    if (f === 'replied')            list = list.filter(r => r.replied)
    if (f === 'opened_noreply')     list = list.filter(r => r.openedSent > 0 && !r.replied)
    if (f === 'delivered_notopen')  list = list.filter(r => r.totalSent > 0 && r.openedSent === 0)
    if (f === 'bounced')            list = list.filter(r => r.hasBounce)
  }
  return list
})

// ========== 工具 ==========
const palette = ['#2563eb', '#10b981', '#f59e0b', '#0ea5e9', '#ef4444', '#8b5cf6', '#ec4899', '#059669', '#f97316', '#0891b2', '#7c3aed', '#db2777']
const avatarBg = s => palette[ (s || '').toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length ]
const first = s => (s || '?').toString().trim().slice(0,1).toUpperCase()
const levelTag = l => l === 'S' ? 'danger' : l === 'A' ? 'warning' : l === 'B' ? 'primary' : 'info'
const rateColor = p => p >= 70 ? '#10b981' : p >= 40 ? '#f59e0b' : '#ef4444'
const custStatusType = r => {
  if (r.hasBounce) return 'danger'
  if (r.replied)   return 'success'
  if (r.openedSent > 0) return 'warning'
  if (r.totalSent > 0) return 'primary'
  return 'info'
}
const custStatusText = r => {
  if (r.hasBounce) return '有退信需处理'
  if (r.replied)   return '双向回复中'
  if (r.openedSent > 0 && r.openedSent === r.totalSent) return '全部已打开'
  if (r.openedSent > 0) return `${r.openedSent}/${r.totalSent} 已打开`
  if (r.totalSent > 0) return '已送达未打开'
  return '暂无邮件往来'
}

// 时间轴事件 → 图标/颜色/tag
const evType = e => ({
  pending: 'info', sending: 'warning', sent: 'primary', delivered: 'success',
  opened: 'success', clicked: 'warning', replied: 'success', bounced: 'danger', failed: 'danger'
}[e] || 'info')
const evIcon = e => markRaw(({
  pending: Clock, sending: Connection, sent: Promotion, delivered: CircleCheck,
  opened: View, clicked: Link, replied: ChatLineRound, bounced: CircleClose, failed: Warning
}[e] || Message))
const evTypeTag = e => ({
  pending: '系统', sending: 'SMTP', sent: '外发', delivered: '送达',
  opened: '行为', clicked: '行为', replied: '客户', bounced: '错误', failed: '错误'
}[e] || 'Event')

// ========== 行为 ==========
const refresh = () => ElMessage.success('已模拟同步服务商（SendGrid / Mailgun / Gmail / 企业邮箱 网关）的最新追踪')
const goStatus = k => { activeTab.value = 'status'; statusFilter.value = k }
const openDetail = row => { detail.value = row; detailVisible.value = true }
const openInCommonMail = row => {
  ElMessage.success(`已为收件人「${row.toContact}」打开写邮件窗口（模拟：将在普邮管理中打开跟进邮件编辑界面；下一步真实跳转可以走路由传参）`)
  // 实际上可 router.push('/email/common?to=' + encodeURIComponent(row.toAddr))，此处直接走跳转：
  router.push({ path: '/email/common', query: { prefillTo: row.toAddr, prefillSubject: `Re: ${row.subject}` } })
}
const jumpMailInCommon = m => { router.push({ path: '/email/common', query: { mailId: m.id } }) }
const oneRetry = row => {
  ElMessageBox.confirm(`确认立即重发邮件「${row.subject}」到 ${row.toAddr}？`, '重试退信邮件', { type: 'warning' })
    .then(() => {
      if (row.bounced) {
        // 把 bounced 改回 sending → delivered → opened 的模拟
        row.bounced = false; row.failed = false; row.bounceCode = ''
        row.latestStatus = 'sending'
        setTimeout(() => { row.latestStatus = 'sent' }, 600)
        setTimeout(() => { row.latestStatus = 'delivered'; row.timeline.push({ t: new Date().toISOString().replace('T',' ').slice(0,19), ev:'delivered', label:'重发已送达', detail: '通过重试队列重新投递' }) }, 1300)
        setTimeout(() => { row.latestStatus = 'opened'; row.opens += 1; row.timeline.push({ t: new Date().toISOString().replace('T',' ').slice(0,19), ev:'opened', label:'重发邮件被打开', detail: '模拟 IP 61.177.xx.xx · Chrome 128' }) }, 2100)
      }
      ElMessage.success(`重发指令已下发：${row.subject}`)
    })
    .catch(() => {})
}
const batchRetry = () => {
  const rows = selTrakRows.value.filter(r => r.bounced || r.failed)
  if (!rows.length) return ElMessage.warning('请勾选至少 1 封退信/失败的邮件进行重试')
  ElMessageBox.confirm(`确定批量重试 ${rows.length} 封邮件？`, '批量重试', { type: 'warning' }).then(() => {
    rows.forEach((r, i) => setTimeout(() => oneRetry(r), i * 300))
  }).catch(() => {})
}

// 客户维度
const openCustomerDialog = r => {
  currentCustomer.value = r
  customerDialogVisible.value = true
}
const customerMails = computed(() => {
  if (!currentCustomer.value) return []
  // 按客户名或 shortName 匹配，返回该客户所有往来邮件，时间升序
  const { company, shortName } = currentCustomer.value
  return allMails
    .filter(m => m.customerName === company || m.customerShort === shortName || (shortName && m.customerShort?.includes(shortName)))
    .sort((a, b) => a.sendTime - b.sendTime)
})
const goCustomerProfile = id => {
  if (!id) return ElMessage.info('该客户还未在客户池建档，请先在检索池录入或新建客户')
  router.push({ path: '/customer/customer-profile', query: { highlightId: id } })
}
const exportCustomerTracking = () => ElMessage.success('模拟：已导出「客户邮件追踪_2026-09-02.xlsx」，共 ' + filteredCustomerRows.value.length + ' 行')
</script>

<style lang="scss" scoped>
.page-container { padding: 20px 24px 28px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.page-title { font-size: 22px; font-weight: 700; color:#0f172a; }
.page-subtitle { color: #64748b; margin-top: 4px; font-size: 13px; }
.page-actions { display: flex; gap: 10px; }

.stat-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; margin-bottom: 18px; }
.stat-card {
  background: #fff; border-radius: 10px; padding: 16px 18px; border: 1px solid #e2e8f0;
  display: flex; align-items: center; gap: 12px; cursor: pointer; transition: all 0.2s;
  &:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -8px rgba(15,23,42,0.12); border-color: #cbd5e1; }
  .stat-info { flex: 1; }
  .stat-label { color: #64748b; font-size: 13px; }
  .stat-value { font-size: 24px; font-weight: 700; color: #0f172a; margin: 4px 0 2px; }
  .stat-sub  { color: #94a3b8; font-size: 12px; }
  .stat-icon {
    width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 19px;
    &.blue   { background: linear-gradient(135deg,#2563eb,#3b82f6); }
    &.green  { background: linear-gradient(135deg,#10b981,#059669); }
    &.orange { background: linear-gradient(135deg,#f59e0b,#f97316); }
    &.cyan   { background: linear-gradient(135deg,#0ea5e9,#0891b2); }
    &.red    { background: linear-gradient(135deg,#ef4444,#dc2626); }
  }
  .danger-text { color: #dc2626; font-weight: 700; }
}
.main-tabs { :deep(.el-tabs__item) { font-size: 15px; } }
.tab-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 18px 22px;
}

/* 状态 chips 栏 */
.status-bar {
  padding: 12px 14px;
  background: linear-gradient(90deg, #f8fafc, #eef2ff 60%);
  border-radius: 8px; margin-bottom: 14px; border: 1px solid #e2e8f0;
}
.bar-title { color: #475569; font-size: 13px; font-weight: 600; margin-bottom: 8px; }
.bar-chips { display: flex; gap: 8px; flex-wrap: wrap; }
.bar-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 6px 12px; border-radius: 999px;
  background: #fff; border: 1px solid #e2e8f0; cursor: pointer; font-size: 13px; color: #334155;
  .chip-num { color: #94a3b8; font-weight: 600; margin-left: 4px; }
  transition: all 0.15s;
  &.all      { border-color: #bfdbfe; color: #1d4ed8; }
  &.pending, &.sending { border-color: #fde68a; color: #92400e; }
  &.sent, &.delivered, &.replied, &.opened { border-color: #bbf7d0; color: #166534; }
  &.clicked  { border-color: #fed7aa; color: #9a3412; }
  &.bounced, &.failed { border-color: #fecaca; color: #991b1b; }

  &.active {
    background: #1e40af !important; color: #fff !important; border-color: #1e40af !important;
    box-shadow: 0 6px 12px -4px rgba(30,64,175,0.5);
    .chip-num { color: #dbeafe; }
  }
}

/* 表格工具栏 */
.table-toolbar {
  display: flex; justify-content: space-between; align-items: center; margin: 12px 0;
  gap: 10px; flex-wrap: wrap;
}

/* 主题 / 发件 / 收件人 单元格紧凑 */
.subj-cell { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.subj-txt { font-weight: 600; color: #0f172a; }
.trak-stats { display: flex; gap: 14px; align-items: center; justify-content: center;
  :deep(.el-statistic__head) { color: #94a3b8; font-size: 11px; }
  :deep(.el-statistic__content) { font-size: 16px; font-weight: 700; }
}

/* 抽屉头卡 */
.drawer-head-card {
  padding: 14px 16px 18px;
  background: linear-gradient(135deg, #f8fafc, #eff6ff);
  border: 1px solid #dbeafe;
  border-radius: 10px;
}
.meta-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
.bounce-alert { :deep(.el-alert) { border-radius: 8px; } }

/* 时间轴卡片 */
.timeline-card {
  border: 1px solid #e2e8f0 !important;
  border-left: 3px solid #cbd5e1 !important;
  .timeline-head { display: flex; justify-content: space-between; align-items: center; }
}

/* 客户维度往来邮件时间轴卡片 */
.thread-card {
  border: 1px solid #e2e8f0 !important;
  &.inbox { border-left: 4px solid #2563eb !important; }
  &.outbox { border-left: 4px solid #10b981 !important; }
}
</style>
