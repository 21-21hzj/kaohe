<template>
  <div class="page-container profile-page">
    <!-- 客户头部概览 -->
    <div class="profile-header card">
      <div class="ph-left">
        <div class="avatar-big">{{ current.shortName }}</div>
        <div class="ph-info">
          <div class="ph-title">
            <h2>{{ current.name }}</h2>
            <el-tag v-for="l in levels" :key="l" :type="l==='S'?'danger':l==='A'?'warning':'primary'" size="small" effect="dark" style="margin-left:6px">{{ current.level }}</el-tag>
            <el-tag v-if="current.protect" type="success" size="small" effect="plain" style="margin-left:4px">
              <el-icon style="margin-right:2px"><Lock /></el-icon>已保护
            </el-tag>
            <el-tag type="info" size="small" effect="plain" style="margin-left:4px">{{ current.type }}</el-tag>
          </div>
          <div class="ph-meta">
            <span><el-icon><Postcard /></el-icon>{{ current.id }}</span>
            <span><el-icon><Location /></el-icon>{{ current.country }}</span>
            <span><el-icon><OfficeBuilding /></el-icon>{{ current.industry }}</span>
            <span><el-icon><User /></el-icon>{{ current.scale }}</span>
            <span><el-icon><Money /></el-icon>年度成交额 ¥{{ m(current.annual) }}</span>
            <span>信用度 <el-progress :percentage="current.credit" :stroke-width="10" style="width:80px;display:inline-block;vertical-align:middle;margin-left:4px" /></span>
          </div>
          <div class="ph-owner">
            负责人：<el-avatar :size="24" style="background:#2563eb;font-size:12px">{{ current.follower[0] }}</el-avatar>
            <b style="margin:0 4px">{{ current.follower }}</b> · 上次跟进 {{ current.lastFollow }} · 下次跟进
            <span :class="warnCls(current)">{{ current.nextFollow }}
              <el-tag v-if="current.status==='overdue'" size="small" type="danger" effect="light" style="margin-left:4px">已超期</el-tag>
            </span>
          </div>
        </div>
      </div>
      <div class="ph-actions">
        <el-button><el-icon><Edit /></el-icon>编辑资料</el-button>
        <el-button><el-icon><Phone /></el-icon>拨打电话</el-button>
        <el-button type="primary"><el-icon><EditPen /></el-icon>写跟进</el-button>
        <el-button type="success"><el-icon><Money /></el-icon>新建商机</el-button>
        <el-dropdown trigger="click">
          <el-button>更多操作 <el-icon><ArrowDown /></el-icon></el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>移交客户</el-dropdown-item>
              <el-dropdown-item>导出档案</el-dropdown-item>
              <el-dropdown-item type="danger">放入公海</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <el-row :gutter="16">
      <!-- 左侧：基础信息 + 联系人 -->
      <el-col :span="8">
        <div class="card">
          <div class="card-header"><div class="card-title">企业基础资料</div>
            <el-button link type="primary" size="small"><el-icon><Edit /></el-icon>编辑</el-button>
          </div>
          <el-descriptions :column="1" border size="small">
            <el-descriptions-item label="公司中文名">{{ current.name }}</el-descriptions-item>
            <el-descriptions-item label="公司英文名">{{ current.name }} Co., Ltd.</el-descriptions-item>
            <el-descriptions-item label="公司地址">{{ current.country }} - 主城市 商业中心 123号</el-descriptions-item>
            <el-descriptions-item label="官网">www.{{ current.shortName.toLowerCase() }}.com</el-descriptions-item>
            <el-descriptions-item label="海关编码">HS-{{ current.id }}-8821</el-descriptions-item>
            <el-descriptions-item label="年采购额">USD {{ (current.annual / 7).toFixed(0) }}K+</el-descriptions-item>
            <el-descriptions-item label="主要市场">欧洲 / 北美 / 中东</el-descriptions-item>
            <el-descriptions-item label="合作起始日">2025-06-12</el-descriptions-item>
            <el-descriptions-item label="客户标签">
              <el-tag v-for="t in ['高价值','核心客户','长期合作']" :key="t" size="small" effect="plain" style="margin-right:4px">{{ t }}</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="card">
          <div class="card-header"><div class="card-title">联系人信息</div>
            <el-button link type="primary" size="small"><el-icon><Plus /></el-icon>新增</el-button>
          </div>
          <div v-for="c in contacts" :key="c.id" class="contact-card">
            <el-avatar :size="44" :style="{background:c.color}">{{ c.name[0] }}</el-avatar>
            <div class="c-info">
              <div class="c-name">
                <b>{{ c.name }}</b>
                <el-tag v-if="c.isKP" size="small" type="danger" effect="light" style="margin-left:4px">KP决策人</el-tag>
              </div>
              <div class="c-pos muted">{{ c.position }} · {{ c.dep }}</div>
              <div class="c-row"><el-icon><Phone /></el-icon>{{ c.phone }}</div>
              <div class="c-row"><el-icon><Message /></el-icon>{{ c.email }}</div>
              <div class="c-row"><el-icon><ChatDotRound /></el-icon>WhatsApp: {{ c.whatsapp }}</div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 右侧：时间线 / 全生命周期跟进 -->
      <el-col :span="16">
        <div class="card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="跟进日志" name="log">
              <div class="toolbar">
                <div class="toolbar-left">
                  <el-select v-model="logFilter" placeholder="分类" style="width:140px" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="电话跟进" value="call" />
                    <el-option label="邮件" value="email" />
                    <el-option label="WhatsApp" value="wa" />
                    <el-option label="报价记录" value="quote" />
                    <el-option label="拜访" value="visit" />
                  </el-select>
                </div>
                <div class="toolbar-right">
                  <el-button type="primary" @click="showAddLog = true"><el-icon><Plus /></el-icon>新增跟进记录</el-button>
                </div>
              </div>

              <el-timeline class="timeline-wrap">
                <el-timeline-item
                  v-for="(item, i) in filteredLogs" :key="i"
                  :timestamp="item.time"
                  :type="item.type === 'win' ? 'success' : item.type === 'quote' ? 'warning' : item.type === 'email' ? 'primary' : ''"
                  :hollow="false"
                  :icon="iconMap[item.kind]"
                >
                  <div class="log-card">
                    <div class="log-head">
                      <span class="log-type tag-tag" :class="colorMap[item.kind]">{{ item.way }}</span>
                      <b>{{ item.title }}</b>
                      <span class="log-writer muted">
                        <el-avatar :size="20" style="background:#2563eb;font-size:10px;margin:0 4px">{{ item.writer[0] }}</el-avatar>{{ item.writer }}
                      </span>
                    </div>
                    <div class="log-body">{{ item.content }}</div>
                    <div v-if="item.files" class="log-files">
                      <div v-for="f in item.files" :key="f" class="file-chip">
                        <el-icon><Paperclip /></el-icon>{{ f }}
                      </div>
                    </div>
                    <div class="log-foot">
                      <el-button link size="small" type="primary">回复</el-button>
                      <el-button link size="small" type="primary">编辑</el-button>
                      <el-button link size="small" type="danger">删除</el-button>
                      <span v-if="item.next" class="next-follow muted">下次跟进：{{ item.next }}</span>
                    </div>
                  </div>
                </el-timeline-item>
              </el-timeline>
            </el-tab-pane>

            <el-tab-pane label="历史邮件" name="email">
              <el-empty description="暂无邮件数据" />
            </el-tab-pane>
            <el-tab-pane label="社媒聊天记录" name="social">
              <el-empty description="暂无社媒聊天记录" />
            </el-tab-pane>
            <el-tab-pane label="报价记录" name="quote">
              <el-table :data="quotes" border stripe>
                <el-table-column prop="id" label="报价单编号" width="140" />
                <el-table-column prop="product" label="产品" min-width="200" />
                <el-table-column prop="amount" label="金额(¥)" width="120" align="right">
                  <template #default="{ row }">{{ m(row.amount) }}</template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" width="100" align="right" />
                <el-table-column prop="createTime" label="报价日期" width="120" />
                <el-table-column prop="expire" label="有效期至" width="120" />
                <el-table-column prop="status" label="状态" width="110">
                  <template #default="{ row }">
                    <el-tag v-if="row.status==='accepted'" type="success" effect="light">已接受</el-tag>
                    <el-tag v-else-if="row.status==='pending'" type="warning" effect="light">审核中</el-tag>
                    <el-tag v-else type="info" effect="light">已发送</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="140">
                  <template #default>
                    <el-button link type="primary" size="small">查看PDF</el-button>
                    <el-button link type="primary" size="small">复制</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="关联商机" name="oppo">
              <el-table :data="customerOppo" border stripe>
                <el-table-column prop="id" label="商机编号" width="110" />
                <el-table-column prop="name" label="商机名称" min-width="220" />
                <el-table-column prop="product" label="产品" width="180" />
                <el-table-column prop="amount" label="金额(¥)" width="120" align="right">
                  <template #default="{ row }">{{ m(row.amount) }}</template>
                </el-table-column>
                <el-table-column prop="stage" label="阶段" width="120">
                  <template #default="{ row }">
                    <el-tag :color="stageColor(row.stage)" effect="dark" style="color:#fff">{{ stageName(row.stage) }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="probability" label="概率" width="100">
                  <template #default="{ row }">
                    <el-progress :percentage="row.probability" :stroke-width="10" />
                  </template>
                </el-table-column>
                <el-table-column prop="expectedDate" label="预计成交" width="120" />
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-col>
    </el-row>

    <!-- 新增跟进记录 -->
    <el-dialog v-model="showAddLog" title="新增跟进记录" width="560px">
      <el-form :model="logForm" label-width="90px">
        <el-form-item label="跟进方式">
          <el-radio-group v-model="logForm.way">
            <el-radio value="电话跟进">电话</el-radio>
            <el-radio value="邮件跟进">邮件</el-radio>
            <el-radio value="WhatsApp沟通">WhatsApp</el-radio>
            <el-radio value="客户拜访">拜访</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="跟进主题"><el-input v-model="logForm.title" /></el-form-item>
        <el-form-item label="详细内容"><el-input v-model="logForm.content" type="textarea" :rows="4" /></el-form-item>
        <el-form-item label="下次跟进"><el-date-picker v-model="logForm.next" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddLog=false">取消</el-button>
        <el-button type="primary" @click="saveLog">保存记录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { customers, opportunities, opportunityStages } from '@/mock'

const route = useRoute()
const id = route.query.id || 'C202604'
const current = ref({ ...customers.find(c => c.id === id) || customers[0] })

const levels = ref([current.value.level])
const activeTab = ref('log')
const logFilter = ref('')
const showAddLog = ref(false)

const logForm = reactive({ way: '电话跟进', title: '', content: '', next: '' })

const contacts = [
  { id: 1, name: current.value.contact, position: '采购总监', dep: '采购部', phone: current.value.phone, email: current.value.email, whatsapp: current.value.phone, isKP: true, color: '#2563eb' },
  { id: 2, name: 'Linda Carter', position: '采购经理', dep: '采购部', phone: '+1-555-0188', email: 'linda@' + current.value.shortName.toLowerCase() + '.com', whatsapp: '+1-555-0188', isKP: false, color: '#10b981' },
  { id: 3, name: 'David Chen', position: '技术副总', dep: '研发部', phone: '+1-555-0200', email: 'david@' + current.value.shortName.toLowerCase() + '.com', whatsapp: '+1-555-0200', isKP: true, color: '#9333ea' }
]

const logs = [
  { kind: 'visit', type: '', way: '客户拜访', writer: '张伟', time: '2026-08-26 15:30', title: '年度续约视频会议',
    content: '与客户CEO视频会议2小时，确认Q3~Q4采购计划，续约条款达成一致：全年框架总金额USD 97万，较上年增长12%。客户对我们的产品质量和物流服务非常满意，提出希望增加定制化服务选项。',
    next: '2026-09-10', files: ['2026年度续约合同草案_v2.pdf', '会议纪要.docx'] },
  { kind: 'quote', type: 'win', way: '报价记录', writer: '张伟', time: '2026-08-20 10:12', title: '家居全系列年度报价',
    content: '提交了全系列产品最新报价单，涵盖5大品类共86个SKU，单价较上年度平均下调3%，同时承诺订单量达标后再返点2%。客户财务部门已进行内部核算。',
    files: ['2026家居系列报价_Nordic.xlsx'] },
  { kind: 'email', type: '', way: '邮件跟进', writer: '张伟', time: '2026-08-15 09:45', title: '样品反馈邮件',
    content: '客户确认收到3批样品，其中2批通过检测，1批需修改颜色色号。已同步工厂进行第二次打样，预计5天后寄出。' },
  { kind: 'call', type: '', way: '电话跟进', writer: '李娜', time: '2026-07-28 14:20', title: '7月订单进度确认',
    content: '确认7月两笔订单船期，其中第一批已到港清关，客户对包装提出改进建议，已转发给物流部门优化方案。',
    next: '2026-08-10' },
  { kind: 'wa', type: '', way: 'WhatsApp沟通', writer: '张伟', time: '2026-07-10 20:30', title: '新品预览沟通',
    content: 'WhatsApp发送8月新品图册，客户挑选出12个SKU表示感兴趣，已安排寄送样品，并附报价单。' }
]

const quotes = [
  { id: 'QT20260820', product: '家居全系列产品 (86SKU)', amount: 6800000, quantity: '12个大柜', createTime: '2026-08-20', expire: '2026-09-30', status: 'accepted' },
  { id: 'QT20260715', product: '实木餐桌椅北欧系列', amount: 480000, quantity: '2个柜', createTime: '2026-07-15', expire: '2026-08-15', status: 'sent' },
  { id: 'QT20260628', product: '智能灯具组合套装', amount: 260000, quantity: '1个柜', createTime: '2026-06-28', expire: '2026-07-28', status: 'pending' }
]

const customerOppo = computed(() => opportunities.filter(o => o.customerId === current.value.id))

const iconMap = {
  call: 'Phone',
  email: 'Message',
  wa: 'ChatDotRound',
  quote: 'Money',
  visit: 'LocationFilled'
}
const colorMap = {
  call: 'blue', email: 'purple', wa: 'green', quote: 'orange', visit: 'red'
}

const filteredLogs = computed(() => logFilter.value ? logs.filter(l => l.kind === logFilter.value) : logs)

const m = v => (v || 0).toLocaleString()
const warnCls = row => row.status === 'overdue' ? 'danger-text' : row.status === 'warning' ? 'warning-text' : ''

const stageName = s => (opportunityStages.find(x => x.key === s) || {}).name || s
const stageColor = s => (opportunityStages.find(x => x.key === s) || {}).color || '#64748b'

const saveLog = () => {
  if (!logForm.title || !logForm.content) return ElMessage.warning('请填写主题和内容')
  const map = { '电话跟进': 'call', '邮件跟进': 'email', 'WhatsApp沟通': 'wa', '客户拜访': 'visit' }
  logs.unshift({
    kind: map[logForm.way], way: logForm.way, writer: '张伟',
    time: new Date().toISOString().slice(0, 16).replace('T', ' '),
    title: logForm.title, content: logForm.content, next: logForm.next || ''
  })
  ElMessage.success('跟进记录已保存到档案')
  showAddLog.value = false
}
</script>

<style scoped lang="scss">
.profile-page {
  .profile-header {
    display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 16px;
    .ph-left { display: flex; gap: 20px; align-items: center; }
    .avatar-big {
      width: 72px; height: 72px; border-radius: 14px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: #fff; font-size: 24px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .ph-info {
      .ph-title { display: flex; align-items: center; margin-bottom: 8px;
        h2 { font-size: 22px; margin: 0; }
      }
      .ph-meta { display: flex; flex-wrap: wrap; gap: 14px; color: #64748b; font-size: 13px; margin-bottom: 8px;
        span { display: inline-flex; align-items: center; gap: 4px; }
      }
      .ph-owner { font-size: 13px; color: #64748b;
        .danger-text { color: #ef4444; font-weight: 600; }
      }
    }
    .ph-actions { display: flex; flex-wrap: wrap; gap: 8px; }
  }
}

.contact-card {
  display: flex; gap: 12px; padding: 12px 0;
  border-bottom: 1px dashed var(--border-light);
  &:last-child { border-bottom: none; }
  .c-info { flex: 1;
    .c-name { margin-bottom: 2px; }
    .c-pos { margin-bottom: 4px; font-size: 12px; }
    .c-row { font-size: 12px; color: #475569; display: flex; align-items: center; gap: 4px; margin-top: 2px; }
  }
}

.timeline-wrap { margin: 0 8px; }
.log-card {
  background: #f8fafc; border: 1px solid var(--border-light);
  border-radius: 8px; padding: 14px 16px;
  .log-head { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;
    .log-writer { margin-left: auto; font-size: 12px; display: flex; align-items: center; }
  }
  .log-body { color: #334155; line-height: 1.7; font-size: 13.5px; }
  .log-files { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 8px;
    .file-chip { background: #fff; border: 1px solid var(--border-color); padding: 4px 10px; border-radius: 16px;
      font-size: 12px; color: #475569; display: inline-flex; align-items: center; gap: 4px;
    }
  }
  .log-foot { margin-top: 12px; display: flex; align-items: center; gap: 10px;
    .next-follow { margin-left: auto; }
  }
}
.muted { color: #64748b; font-size: 12px; }
.danger-text { color: #ef4444; font-weight: 600; }
.warning-text { color: #f59e0b; font-weight: 600; }
</style>
