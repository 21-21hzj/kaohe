// 统一的 Mock 数据模块

// ========== 员工/用户 ==========
export const users = [
  { id: 1, name: '张伟', role: '销售总监', dept: '销售一部', avatar: '张' },
  { id: 2, name: '李娜', role: '高级销售', dept: '销售一部', avatar: '李' },
  { id: 3, name: '王强', role: '销售', dept: '销售一部', avatar: '王' },
  { id: 4, name: '刘洋', role: '销售', dept: '销售二部', avatar: '刘' },
  { id: 5, name: '陈静', role: '销售', dept: '销售二部', avatar: '陈' }
]

// ========== 公共：渠道来源 ==========
export const channels = [
  { value: 'linkedin', label: 'LinkedIn', color: 'blue' },
  { value: 'whatsapp', label: 'WhatsApp', color: 'green' },
  { value: 'facebook', label: 'Facebook', color: 'blue' },
  { value: 'customs', label: '海关数据', color: 'purple' },
  { value: 'exhibition', label: '展会', color: 'orange' },
  { value: 'website', label: '官网询盘', color: 'cyan' },
  { value: 'referral', label: '客户转介绍', color: 'yellow' },
  { value: 'google', label: 'Google搜索', color: 'red' }
]

// ========== 公共：客户标签 ==========
export const leadTags = [
  { value: '高意向', color: 'red' },
  { value: '中意向', color: 'orange' },
  { value: '低意向', color: 'gray' },
  { value: '大客户', color: 'purple' },
  { value: '长期合作', color: 'blue' },
  { value: '需跟进', color: 'yellow' },
  { value: '已回复', color: 'green' },
  { value: '样品客户', color: 'cyan' }
]

// ========== 板块一 · 检索池（线索） ==========
export const leads = [
  { id: 'L20260901001', company: 'Global Trading LLC', contact: 'John Smith', position: '采购经理', email: 'john@globaltrading.com', phone: '+1-555-0101', country: '美国', channel: 'linkedin', tags: ['高意向','大客户'], budget: 500000, source: 'Linkedin精准搜索', follower: '李娜', createTime: '2026-09-01 09:12', status: 'new', duplicate: false },
  { id: 'L20260901002', company: 'Euro Industrial Supplies', contact: 'Emma Wilson', position: '供应链总监', email: 'emma@euroind.eu', phone: '+49-30-12345', country: '德国', channel: 'customs', tags: ['中意向'], budget: 280000, source: '海关数据-德国港口', follower: '王强', createTime: '2026-09-01 10:33', status: 'following', duplicate: false },
  { id: 'L20260901003', company: 'Asia Pacific Traders', contact: 'Michael Tan', position: 'CEO', email: 'michael@asiapac.sg', phone: '+65-1234-5678', country: '新加坡', channel: 'exhibition', tags: ['高意向','样品客户'], budget: 150000, source: '广交会现场名片', follower: '张伟', createTime: '2026-08-30 15:20', status: 'following', duplicate: false },
  { id: 'L20260901004', company: 'South America Imports', contact: 'Carlos Diaz', position: '采购主管', email: 'carlos@saimports.br', phone: '+55-11-98765', country: '巴西', channel: 'whatsapp', tags: ['低意向','需跟进'], budget: 60000, source: 'WhatsApp群发', follower: '刘洋', createTime: '2026-08-29 11:08', status: 'new', duplicate: false },
  { id: 'L20260901005', company: 'Middle East Manufacturing', contact: 'Ahmed Hassan', position: '运营经理', email: 'ahmed@mem.co.ae', phone: '+971-4-123-4567', country: '阿联酋', channel: 'google', tags: ['中意向','长期合作'], budget: 420000, source: 'Google Ads点击', follower: '陈静', createTime: '2026-08-28 20:45', status: 'converted', duplicate: false },
  { id: 'L20260901006', company: 'Oceanic Goods Co.', contact: 'Sarah Johnson', position: '采购助理', email: 'sarah@oceanic.com.au', phone: '+61-2-9876-5432', country: '澳大利亚', channel: 'facebook', tags: ['低意向'], budget: 35000, source: 'FB广告', follower: '李娜', createTime: '2026-08-27 08:55', status: 'new', duplicate: true },
  { id: 'L20260901007', company: 'Nordic Trade Partners', contact: 'Anders Svensson', position: 'CEO', email: 'anders@nordic.se', phone: '+46-8-123-456', country: '瑞典', channel: 'referral', tags: ['高意向','大客户','长期合作'], budget: 890000, source: '老客户介绍', follower: '张伟', createTime: '2026-08-26 14:30', status: 'following', duplicate: false },
  { id: 'L20260901008', company: 'Eastern Buyers Ltd', contact: 'Priya Patel', position: '采购总监', email: 'priya@ebuyers.in', phone: '+91-98-7654-3210', country: '印度', channel: 'website', tags: ['中意向','已回复'], budget: 210000, source: '官网询盘表单', follower: '王强', createTime: '2026-08-25 16:18', status: 'following', duplicate: false },
  { id: 'L20260901009', company: 'West Africa Distributors', contact: 'Kwame Mensah', position: '总经理', email: 'kwame@wadist.gh', phone: '+233-24-123-4567', country: '加纳', channel: 'linkedin', tags: ['需跟进','低意向'], budget: 45000, source: 'LinkedIn群发', follower: '刘洋', createTime: '2026-08-24 10:40', status: 'new', duplicate: false },
  { id: 'L20260901010', company: 'North American Resellers', contact: 'Jennifer Lee', position: 'VP of Sales', email: 'jennifer@nar.ca', phone: '+1-416-555-0199', country: '加拿大', channel: 'customs', tags: ['高意向','样品客户'], budget: 320000, source: '海关提单信息', follower: '陈静', createTime: '2026-08-23 19:02', status: 'converted', duplicate: false }
]

// 回收站线索
export const recycleLeads = [
  { id: 'R001', company: 'Closed Corp', contact: 'Mark Davis', deleteTime: '2026-08-15', reason: '客户明确拒绝', operator: '王强' },
  { id: 'R002', company: 'Duplicate Ltd', contact: 'Lisa Wang', deleteTime: '2026-08-10', reason: '重复线索', operator: '李娜' }
]

// ========== 板块一 · 客户池 ==========
export const customers = [
  { id: 'C202601', name: 'Global Trading LLC', shortName: 'Global', type: '代理商', country: '美国', industry: '建材', scale: '200-500人', level: 'A', follower: '李娜', contact: 'John Smith', phone: '+1-555-0101', email: 'john@globaltrading.com', lastFollow: '2026-09-01', nextFollow: '2026-09-05', protect: true, credit: 95, annual: 4500000, status: 'active', tag: '高价值' },
  { id: 'C202602', name: 'Euro Industrial Supplies', shortName: 'EuroInd', type: '进口商', country: '德国', industry: '机械', scale: '100-200人', level: 'B', follower: '王强', contact: 'Emma Wilson', phone: '+49-30-12345', email: 'emma@euroind.eu', lastFollow: '2026-08-28', nextFollow: '2026-09-02', protect: true, credit: 88, annual: 2200000, status: 'active', tag: '稳定' },
  { id: 'C202603', name: 'Asia Pacific Traders', shortName: 'AsiaPac', type: '批发商', country: '新加坡', industry: '电子', scale: '50-100人', level: 'A', follower: '张伟', contact: 'Michael Tan', phone: '+65-1234-5678', email: 'michael@asiapac.sg', lastFollow: '2026-08-30', nextFollow: '2026-09-06', protect: true, credit: 92, annual: 3800000, status: 'active', tag: '核心客户' },
  { id: 'C202604', name: 'Nordic Trade Partners', shortName: 'Nordic', type: '代理商', country: '瑞典', industry: '家居', scale: '200-500人', level: 'S', follower: '张伟', contact: 'Anders Svensson', phone: '+46-8-123-456', email: 'anders@nordic.se', lastFollow: '2026-08-26', nextFollow: '2026-09-08', protect: true, credit: 98, annual: 8900000, status: 'active', tag: '战略级' },
  { id: 'C202605', name: 'Eastern Buyers Ltd', shortName: 'EBuyers', type: '进口商', country: '印度', industry: '纺织', scale: '100-200人', level: 'B', follower: '王强', contact: 'Priya Patel', phone: '+91-98-7654-3210', email: 'priya@ebuyers.in', lastFollow: '2026-08-15', nextFollow: '2026-09-01', protect: false, credit: 76, annual: 1500000, status: 'warning', tag: '待激活' },
  { id: 'C202606', name: 'North American Resellers', shortName: 'NAR', type: '分销商', country: '加拿大', industry: '汽配', scale: '50-100人', level: 'A', follower: '陈静', contact: 'Jennifer Lee', phone: '+1-416-555-0199', email: 'jennifer@nar.ca', lastFollow: '2026-08-23', nextFollow: '2026-09-03', protect: true, credit: 90, annual: 2800000, status: 'active', tag: '潜力大' },
  { id: 'C202607', name: 'Middle East Manufacturing', shortName: 'MEM', type: '生产商', country: '阿联酋', industry: '化工', scale: '500+人', level: 'A', follower: '陈静', contact: 'Ahmed Hassan', phone: '+971-4-123-4567', email: 'ahmed@mem.co.ae', lastFollow: '2026-08-28', nextFollow: '2026-09-04', protect: true, credit: 85, annual: 4200000, status: 'active', tag: '复购高' },
  { id: 'C202608', name: 'Oceanic Goods Co.', shortName: 'Oceanic', type: '零售商', country: '澳大利亚', industry: '食品', scale: '<50人', level: 'C', follower: '李娜', contact: 'Sarah Johnson', phone: '+61-2-9876-5432', email: 'sarah@oceanic.com.au', lastFollow: '2026-06-20', nextFollow: '2026-09-01', protect: false, credit: 68, annual: 350000, status: 'overdue', tag: '长期未跟进' },
  { id: 'C202609', name: 'South America Imports', shortName: 'SAI', type: '进口商', country: '巴西', industry: '家具', scale: '100-200人', level: 'B', follower: '刘洋', contact: 'Carlos Diaz', phone: '+55-11-98765', email: 'carlos@saimports.br', lastFollow: '2026-08-29', nextFollow: '2026-09-05', protect: true, credit: 72, annual: 600000, status: 'active', tag: '新客户' },
  { id: 'C202610', name: 'West Africa Distributors', shortName: 'WAD', type: '代理商', country: '加纳', industry: '五金', scale: '50-100人', level: 'C', follower: '刘洋', contact: 'Kwame Mensah', phone: '+233-24-123-4567', email: 'kwame@wadist.gh', lastFollow: '2026-07-10', nextFollow: '2026-08-30', protect: false, credit: 60, annual: 450000, status: 'overdue', tag: '未保护' }
]

// 公海池客户
export const publicSeaCustomers = [
  { id: 'P001', name: 'Abandoned Co.', country: '南非', industry: '矿业', lastFollow: '2026-05-10', originalOwner: '王强', recycleTime: '2026-07-10', reason: '超60天未跟进' },
  { id: 'P002', name: 'Dormant Ltd', country: '墨西哥', industry: '包装', lastFollow: '2026-04-05', originalOwner: '刘洋', recycleTime: '2026-06-20', reason: '超60天未跟进' },
  { id: 'P003', name: 'Silent Partners', country: '日本', industry: '数码', lastFollow: '2026-06-01', originalOwner: '陈静', recycleTime: '2026-08-15', reason: '主动释放' }
]

// ========== 板块一 · 商机 ==========
export const opportunities = [
  { id: 'OP001', name: 'Global 2026年Q4建材采购', customer: 'Global Trading LLC', customerId: 'C202601', stage: 'negotiate', product: '高端瓷砖系列', amount: 1580000, probability: 80, expectedDate: '2026-09-20', owner: '李娜', inquiry: '客户Q4需要20柜40HQ的高端瓷砖，要求CE认证，交货期10月底。', budget: 1600000, createTime: '2026-08-15', priority: 'high' },
  { id: 'OP002', name: 'EuroInd 机械生产线配件', customer: 'Euro Industrial Supplies', customerId: 'C202602', stage: 'quote', product: '机械配件套装A型', amount: 420000, probability: 50, expectedDate: '2026-09-30', owner: '王强', inquiry: '客户整条线配件采购，样品寄送中，等待测试结果。', budget: 450000, createTime: '2026-08-20', priority: 'medium' },
  { id: 'OP003', name: 'AsiaPac 智能电子订单', customer: 'Asia Pacific Traders', customerId: 'C202603', stage: 'contact', product: '智能蓝牙音箱X1', amount: 280000, probability: 25, expectedDate: '2026-10-15', owner: '张伟', inquiry: '广交会现场交换名片，初步对智能音箱系列有兴趣。', budget: 300000, createTime: '2026-08-30', priority: 'high' },
  { id: 'OP004', name: 'Nordic 家居年框续约', customer: 'Nordic Trade Partners', customerId: 'C202604', stage: 'win', product: '家居全系列产品', amount: 6800000, probability: 100, expectedDate: '2026-09-10', owner: '张伟', inquiry: '年度框架合同已签署，总金额680万RMB，分4批出货。', budget: 7000000, createTime: '2026-08-01', priority: 'high' },
  { id: 'OP005', name: 'EBuyers 纺织面料大货', customer: 'Eastern Buyers Ltd', customerId: 'C202605', stage: 'quote', product: '纯棉印花面料', amount: 680000, probability: 45, expectedDate: '2026-09-25', owner: '王强', inquiry: '面料报价已出，客户在对比3家供应商。', budget: 700000, createTime: '2026-08-18', priority: 'medium' },
  { id: 'OP006', name: 'NAR 汽配新项目', customer: 'North American Resellers', customerId: 'C202606', stage: 'contact', product: '汽车LED大灯', amount: 920000, probability: 20, expectedDate: '2026-11-01', owner: '陈静', inquiry: '客户对新款LED大灯感兴趣，已发产品目录。', budget: 950000, createTime: '2026-08-22', priority: 'low' },
  { id: 'OP007', name: 'MEM 化工原料季度单', customer: 'Middle East Manufacturing', customerId: 'C202607', stage: 'negotiate', product: '工业级PVC原料', amount: 2100000, probability: 75, expectedDate: '2026-09-15', owner: '陈静', inquiry: '价格条款谈判最后阶段，付款方式确认中。', budget: 2200000, createTime: '2026-08-05', priority: 'high' },
  { id: 'OP008', name: 'SAI 实木家具试单', customer: 'South America Imports', customerId: 'C202609', stage: 'contact', product: '实木餐桌椅套装', amount: 180000, probability: 20, expectedDate: '2026-10-10', owner: '刘洋', inquiry: 'WhatsApp初步沟通，客户希望先试一个小柜。', budget: 200000, createTime: '2026-08-29', priority: 'medium' },
  { id: 'OP009', name: 'Oceanic 零食订单', customer: 'Oceanic Goods Co.', customerId: 'C202608', stage: 'lose', product: '休闲零食组合', amount: 85000, probability: 0, expectedDate: '2026-09-01', owner: '李娜', inquiry: '客户已选择当地供应商，价格低于我司15%。', budget: 90000, createTime: '2026-07-10', priority: 'low' }
]

export const opportunityStages = [
  { key: 'contact', name: '初步接触', color: '#64748b' },
  { key: 'quote',   name: '报价阶段', color: '#3b82f6' },
  { key: 'negotiate', name: '谈判阶段', color: '#f59e0b' },
  { key: 'win',     name: '已成交',   color: '#10b981' },
  { key: 'lose',    name: '已失败',   color: '#ef4444' }
]

// ========== 板块一 · 日程/日报/任务 ==========
export const schedules = [
  { id: 'S01', date: '2026-09-02', time: '09:30', type: 'follow', title: '跟进 Global Trading', content: '电话确认9月订单细节', related: 'Global Trading LLC (C202601)', owner: '李娜', status: 'pending', priority: 'high' },
  { id: 'S02', date: '2026-09-02', time: '14:00', type: 'meeting', title: '销售周会', content: 'Q3业绩汇报与目标拆解', related: '', owner: '全员', status: 'pending', priority: 'medium' },
  { id: 'S03', date: '2026-09-02', time: '16:00', type: 'develop', title: 'Linkedin 拓客', content: '开发北美行业客户 20 个', related: '', owner: '王强', status: 'pending', priority: 'low' },
  { id: 'S04', date: '2026-09-03', time: '10:00', type: 'visit', title: '拜访 Nordic 客户', content: '年度续约签约仪式', related: 'Nordic Trade Partners (C202604)', owner: '张伟', status: 'pending', priority: 'high' },
  { id: 'S05', date: '2026-09-05', time: '15:00', type: 'quote', title: '提交 EuroInd 报价', content: '最终报价单+样品报告', related: 'Euro Industrial Supplies (C202602)', owner: '王强', status: 'pending', priority: 'high' },
  { id: 'S06', date: '2026-09-01', time: '11:00', type: 'follow', title: 'WhatsApp回访 SAI', content: '确认餐桌椅样品照片反馈', related: 'SAI (C202609)', owner: '刘洋', status: 'done', priority: 'medium' }
]

export const dailyReports = [
  { id: 'D01', date: '2026-09-01', owner: '李娜', dept: '销售一部', content: '1. 电话跟进Global客户，确认报价细节\n2. 发送OP001合同初稿\n3. 开发新线索5条，分配3条', followCount: 8, devCount: 5, dealAmount: 0, nextPlan: '1. 收回合同\n2. 准备广交会资料' },
  { id: 'D02', date: '2026-09-01', owner: '王强', dept: '销售一部', content: '1. EuroInd样品寄DHL，单号已发客户\n2. EBuyers价格二次谈判\n3. LinkedIn开发德国机械客户', followCount: 10, devCount: 8, dealAmount: 0, nextPlan: '1. 追踪样品签收\n2. 整理询盘对比表' },
  { id: 'D03', date: '2026-09-01', owner: '陈静', dept: '销售二部', content: '1. MEM付款条款确认\n2. NAR产品目录发送\n3. 新客户开发7条', followCount: 6, devCount: 7, dealAmount: 0, nextPlan: '1. 跟进MEM合同\n2. 整理老客户复购清单' },
  { id: 'D04', date: '2026-08-31', owner: '张伟', dept: '销售一部', content: '1. 与Nordic视频会议，续约条款达成一致\n2. 准备9月部门培训\n3. 审批报价单5份', followCount: 3, devCount: 0, dealAmount: 6800000, nextPlan: '1. 签署Nordic合同\n2. 团队例会' }
]

export const todoTasks = [
  { id: 'T01', title: '完成 Global 合同审核', owner: '李娜', deadline: '2026-09-03', status: 'pending', priority: 'high' },
  { id: 'T02', title: '整理 Q3 意向客户清单', owner: '王强', deadline: '2026-09-05', status: 'doing', priority: 'medium' },
  { id: 'T03', title: '更新海关数据抓取关键词', owner: '陈静', deadline: '2026-09-04', status: 'pending', priority: 'low' },
  { id: 'T04', title: '准备部门周会 PPT', owner: '张伟', deadline: '2026-09-02', status: 'done', priority: 'high' },
  { id: 'T05', title: '9月生日客户礼物寄送', owner: '刘洋', deadline: '2026-09-10', status: 'pending', priority: 'medium' }
]

// ========== 板块三：邮件中心 ==========
// 1. 已绑定邮箱账号（企业邮箱/Gmail/Outlook/QQ邮箱）
export const mailAccounts = [
  { id: 'A01', type: '企业邮箱', host: 'smtp.globaltrade.com', username: 'li.yan@globaltrade.com', alias: '李艳·业务主管', status: 'ok', lastSync: '2026-09-02 09:01', unread: 23 },
  { id: 'A02', type: 'Gmail',     host: 'smtp.gmail.com',         username: 'zhangwei.sales@gmail.com', alias: '张伟·海外拓客', status: 'ok', lastSync: '2026-09-02 08:55', unread: 7 },
  { id: 'A03', type: 'Outlook',   host: 'smtp.office365.com',     username: 'wangqiang_trade@outlook.com', alias: '王强·欧洲线', status: 'warn', lastSync: '2026-09-01 22:30', unread: 3 },
  { id: 'A04', type: 'QQ邮箱',    host: 'smtp.qq.com',            username: 'liuxiang_2024@qq.com',       alias: '刘洋·备用',    status: 'ok', lastSync: '2026-09-02 08:10', unread: 1 }
]

// 2. 邮件列表（一对一往来邮件，每封属于一个对话 Thread）
// folder: inbox / sent / drafts / trash / starred
// direction: in(客户发给我) / out(我发给客户)
// threadId: 同一对话的邮件共用同一个
export const mails = [
  // ---- 第一组：Global Industries（C001）往返对话 ----
  { id: 'M001', threadId: 'TH001', folder: 'inbox', direction: 'in', starred: true, read: false, important: true, hasAttach: false,
    accountId: 'A01', accountAlias: '李艳·业务主管', accountAddr: 'li.yan@globaltrade.com',
    fromName: 'James Wilson', fromAddr: 'james.wilson@globalindustries.us',
    toName: '李艳', toAddr: 'li.yan@globaltrade.com',
    subject: 'Re: 2026 第四季度铝型材采购订单', customerId: 'C001', customerName: '美国 Global Industries Inc.', customerShort: 'Global Industries',
    contact: 'James Wilson（采购总监）',
    sendAt: '2026-09-02 08:36', sendTime: 1756773360000,
    preview: 'Hi 李艳，感谢你的报价！我和技术团队核对了 6063-T5 的样品报告，尺寸和阳极氧化色差均符合我们 AQL 2.5 的……',
    body: `<p>Hi 李艳，</p><p>感谢你的报价！我和技术团队核对了 6063-T5 的样品报告，尺寸和阳极氧化色差均符合我们 AQL 2.5 的验收标准。</p>
<p>关于第四季度订单，我们计划分三批出货：</p>
<ul>
  <li>9/20 前：1×20GP（订单号 PO-GI-0920）</li>
  <li>10/15 前：1×40HQ（订单号 PO-GI-1015）</li>
  <li>11/20 前：1×40HQ（订单号 PO-GI-1120）</li>
</ul>
<p>请更新合同并附上付款条款（我们倾向于 30% T/T in advance，70% 见提单副本）。</p>
<p>另外，关于 <b>价格</b>，当前铝锭 LME 价格较上次合同下跌 ~6%，能否按比例下调单价 3%？如果可以，我今天就安排 30% 定金。</p>
<p>Best<br/>James Wilson<br/>Global Industries Inc. · Procurement Director<br/>T: +1 (310) 555-0188</p>`
  },
  { id: 'M002', threadId: 'TH001', folder: 'sent', direction: 'out', starred: false, read: true, important: true, hasAttach: true,
    accountId: 'A01', accountAlias: '李艳·业务主管', accountAddr: 'li.yan@globaltrade.com',
    fromName: '李艳', fromAddr: 'li.yan@globaltrade.com',
    toName: 'James Wilson', toAddr: 'james.wilson@globalindustries.us',
    subject: 'Re: 2026 第四季度铝型材采购订单', customerId: 'C001', customerName: '美国 Global Industries Inc.', customerShort: 'Global Industries',
    contact: 'James Wilson（采购总监）',
    sendAt: '2026-09-01 16:42', sendTime: 1756716120000,
    preview: 'Hi James，附件是 6063-T5 铝型材的 SGS 检测报告与样品测试数据，以及第四季度的正式报价单，单价已经考虑了本月 LME 铝锭……',
    body: `<p>Hi James，</p><p>附件是 6063-T5 铝型材的 SGS 检测报告与样品测试数据，以及第四季度的正式报价单。</p>
<p>单价我们已经考虑了本月 LME 铝锭的回调，较上次合同下调 3.2%（附件里标绿的是调整后的价格）。</p>
<p>付款条款方面，因为你们是 A 级客户，破例接受 30/70 电汇。</p>
<p>附件：<br/>① Quotation-Q4-GI-20260901.pdf（报价单）<br/>② SGS-6063T5-Report-20260828.pdf（检测报告）</p>
<p>期待你的 PO！<br/>李艳 · GlobalTrade 业务主管<br/>li.yan@globaltrade.com</p>`
  },
  { id: 'M003', threadId: 'TH001', folder: 'inbox', direction: 'in', starred: false, read: true, important: false, hasAttach: false,
    accountId: 'A01', accountAlias: '李艳·业务主管', accountAddr: 'li.yan@globaltrade.com',
    fromName: 'James Wilson', fromAddr: 'james.wilson@globalindustries.us',
    toName: '李艳', toAddr: 'li.yan@globaltrade.com',
    subject: '2026 第四季度铝型材采购订单', customerId: 'C001', customerName: '美国 Global Industries Inc.', customerShort: 'Global Industries',
    contact: 'James Wilson（采购总监）',
    sendAt: '2026-08-31 22:10', sendTime: 1756659000000,
    preview: 'Hi 李艳，我们希望与贵司续约 2026 年第四季度的 6063-T5 铝型材采购，大致数量是 3 个柜子。请尽快提供最新的检测报告、报……',
    body: `<p>Hi 李艳，</p><p>我们希望与贵司续约 2026 年第四季度的 6063-T5 铝型材采购，大致数量是 3 个柜子。</p>
<p>请尽快提供：<br/>① 最新的检测报告（ISO 9001 + RoHS 2.0）<br/>② FOB Ningbo 的单价<br/>③ 9 月-11 月的交付计划</p>
<p>Thanks<br/>James</p>`
  },

  // ---- 第二组：AutoTech（C002）----
  { id: 'M010', threadId: 'TH002', folder: 'inbox', direction: 'in', starred: true, read: false, important: true, hasAttach: true,
    accountId: 'A02', accountAlias: '张伟·海外拓客', accountAddr: 'zhangwei.sales@gmail.com',
    fromName: 'Hans Müller', fromAddr: 'h.mueller@autotech.de',
    toName: '张伟', toAddr: 'zhangwei.sales@gmail.com',
    subject: 'RE: Automotive Cable Harness RFQ - 35k pcs', customerId: 'C002', customerName: '德国 AutoTech GmbH', customerShort: 'AutoTech',
    contact: 'Hans Müller（采购经理）',
    sendAt: '2026-09-02 06:12', sendTime: 1756764720000,
    preview: 'Dear Zhang Wei, Thanks for the quick turnaround on the cable harness sample — our QA team finished the mechanical/electrical stress tests. Attached is the……',
    body: `<p>Dear Zhang Wei,</p><p>Thanks for the quick turnaround on the cable harness sample — our QA team finished the mechanical/electrical stress tests.</p>
<p>Attached is the QA report, here are the key findings:</p>
<ul>
  <li>✅ Pull-out force: PASS (≥ 120N required, 156N measured)</li>
  <li>✅ Insulation resistance: PASS (@ 500V DC / 100MΩ)</li>
  <li>⚠️ Heat-shrink sleeve: <b>requires correction</b> — 1 sample burned through at +135°C (spec: +150°C)</li>
</ul>
<p>We need the sleeve material upgraded to <b>DW-150 grade</b>. If you can confirm this within 24h, we'll place the 35k pcs order at € 12.80 / pc.</p>
<p>Best regards<br/>Hans Müller · AutoTech GmbH · Einkaufsleiter</p>`
  },
  { id: 'M011', threadId: 'TH002', folder: 'sent', direction: 'out', starred: false, read: true, important: false, hasAttach: false,
    accountId: 'A02', accountAlias: '张伟·海外拓客', accountAddr: 'zhangwei.sales@gmail.com',
    fromName: '张伟', fromAddr: 'zhangwei.sales@gmail.com',
    toName: 'Hans Müller', toAddr: 'h.mueller@autotech.de',
    subject: 'Re: Automotive Cable Harness RFQ - 35k pcs', customerId: 'C002', customerName: '德国 AutoTech GmbH', customerShort: 'AutoTech',
    contact: 'Hans Müller（采购经理）',
    sendAt: '2026-09-01 15:20', sendTime: 1756711200000,
    preview: 'Dear Hans, Thank you for approving the sample! Regarding the heat-shrink sleeve grade, I confirm we have DW-150 in stock — we are able to produce with this m……',
    body: `<p>Dear Hans,</p><p>Thank you for approving the sample!</p><p>Regarding the heat-shrink sleeve grade, I confirm we have DW-150 in stock — we are able to produce with this material at the same €12.80 price. MOQ remains 5,000pcs.</p>
<p>Proforma invoice is being prepared by the finance team, you'll receive it within 2 hours.</p>
<p>Best regards<br/>张伟 · Zhang Wei<br/>Sales Manager · Overseas Division</p>`
  },

  // ---- 第三组：Sunrise（C003）+ 失败/退信案例 ----
  { id: 'M020', threadId: 'TH003', folder: 'sent', direction: 'out', starred: false, read: true, important: false, hasAttach: false,
    accountId: 'A01', accountAlias: '李艳·业务主管', accountAddr: 'li.yan@globaltrade.com',
    fromName: '李艳', fromAddr: 'li.yan@globaltrade.com',
    toName: 'Priya Sharma', toAddr: 'priya.sharma@sunrise-india.in',
    subject: 'Sunrise 合作意向 — 不锈钢阀门 catalog', customerId: 'C003', customerName: '印度 Sunrise Valves Pvt.', customerShort: 'Sunrise Valves',
    contact: 'Priya Sharma（Sourcing）',
    sendAt: '2026-09-01 11:05', sendTime: 1756695900000,
    preview: 'Hi Priya，我从海关数据看到 Sunrise Valves 在 7-8 月从韩国进口了一批 CF8M 球阀，而我们同样材质的产品出厂价可以比韩国便宜 12-15%。附上 2026 版……',
    body: `<p>Hi Priya，</p><p>我从海关数据看到 Sunrise Valves 在 7-8 月从韩国进口了一批 CF8M 球阀，而我们同样材质的产品出厂价可以比韩国便宜 12-15%。</p>
<p>附上 2026 版 Catalog，目录编号从 SV-100 到 SV-350 对应你们常用的 1/4" ~ 4" 系列。</p>
<p>如果方便的话，本周三 20:00 IST（北京时间 22:30）可以安排一个 30 分钟的线上会议详细介绍？</p>
<p>Best<br/>李艳</p>`
  },
  { id: 'M021', threadId: 'TH003', folder: 'inbox', direction: 'in', starred: false, read: false, important: false, hasAttach: false,
    accountId: 'A01', accountAlias: '李艳·业务主管', accountAddr: 'li.yan@globaltrade.com',
    fromName: 'Mail Delivery Subsystem', fromAddr: 'mailer-daemon@globaltrade.com',
    toName: '李艳', toAddr: 'li.yan@globaltrade.com',
    subject: '⚠️ Undelivered: Sunrise 合作意向 — 不锈钢阀门 catalog', customerId: 'C003', customerName: '印度 Sunrise Valves Pvt.', customerShort: 'Sunrise Valves',
    contact: 'Priya Sharma（Sourcing）',
    sendAt: '2026-09-01 11:07', sendTime: 1756696020000,
    preview: 'Delivery has failed to these recipients or groups: priya.sharma@sunrise-india.in — The email address you entered couldn\'t be found. Please check the recipient……',
    body: `<p style="color:#dc2626"><b>Delivery has failed</b> to these recipients or groups:</p>
<p><b>priya.sharma@sunrise-india.in</b><br/>The email address you entered couldn't be found. Please check the recipient's email address and try resending.</p>
<p>Diagnostic information for administrators:<br/>Remote Server returned '<span style="font-family:monospace">550 5.1.10 RESOLVER.ADR.RecipientNotFound; Recipient not found by SMTP address lookup</span>'</p>
<p>Original message headers:</p>
<pre style="background:#f1f5f9;padding:10px;font-size:12px;overflow:auto">
Received: from mail.globaltrade.com (localhost [127.0.0.1]) by mx.google.com with ESMTPSA id xxx
Subject: Sunrise 合作意向 — 不锈钢阀门 catalog
From: li.yan@globaltrade.com
To: priya.sharma@sunrise-india.in
Date: Tue, 01 Sep 2026 11:05:02 +0800
</pre>`
  },

  // ---- 第四组：Nordic（C004）+ 今日跟进 ----
  { id: 'M030', threadId: 'TH004', folder: 'inbox', direction: 'in', starred: false, read: true, important: false, hasAttach: false,
    accountId: 'A03', accountAlias: '王强·欧洲线', accountAddr: 'wangqiang_trade@outlook.com',
    fromName: 'Erik Hansen', fromAddr: 'e.hansen@nordicpackaging.no',
    toName: '王强', toAddr: 'wangqiang_trade@outlook.com',
    subject: 'Re: 牛皮纸卷样品 (Kraft Paper Roll Sample #NP-80)', customerId: 'C004', customerName: '挪威 Nordic Packaging AS', customerShort: 'Nordic Packaging',
    contact: 'Erik Hansen（QA）',
    sendAt: '2026-09-02 03:48', sendTime: 1756756080000,
    preview: 'Hi Wang Qiang, we received the kraft paper sample today. Bursting strength 270 kPa is OK per EN 23035 but grammage measured 79.6 gsm (spec: 80 ±1g). Could you send……',
    body: `<p>Hi Wang Qiang,</p><p>We received the kraft paper sample today.</p>
<ul>
  <li>Bursting strength 270 kPa ✅ OK (EN 23035)</li>
  <li>Moisture 6.8% ✅ OK (4-8%)</li>
  <li>Grammage 79.6 gsm ⚠️ slightly below spec (80 ±1g)</li>
</ul>
<p>Could you send another batch with a tighter 80–81 gsm window? Once we verify, PO for 2×40HQ will be sent this week.</p>
<p>Rgds<br/>Erik · Nordic Packaging</p>`
  },

  // ---- 草稿箱 / 垃圾箱样本 ----
  { id: 'M040', threadId: 'TH005', folder: 'drafts', direction: 'out', starred: false, read: true, important: false, hasAttach: false,
    accountId: 'A01', accountAlias: '李艳·业务主管', accountAddr: 'li.yan@globaltrade.com',
    fromName: '李艳', fromAddr: 'li.yan@globaltrade.com',
    toName: 'Carlos Gómez', toAddr: 'c.gomez@iberica-parts.es',
    subject: 'Re: Request for quotation - Brass compression fittings', customerId: 'C005', customerName: '西班牙 Iberica Parts', customerShort: 'Iberica Parts',
    contact: 'Carlos Gómez（Purchasing）',
    sendAt: '2026-09-02 09:20', sendTime: 1756776000000,
    preview: 'Hi Carlos, thanks for reaching out! Regarding the brass compression fittings (item #IB-16 / IB-20 / IB-25), please find the pricing below. This was written in draft.',
    body: `<p>Hi Carlos, thanks for reaching out!</p><p>Regarding the brass compression fittings, please find the pricing below — <b>[DRAFT, pricing TBD by finance]</b></p>`
  },
  { id: 'M050', threadId: 'TH006', folder: 'inbox', direction: 'in', starred: false, read: true, important: false, hasAttach: false,
    accountId: 'A04', accountAlias: '刘洋·备用', accountAddr: 'liuxiang_2024@qq.com',
    fromName: 'Alibaba International', fromAddr: 'no-reply@notice.alibaba.com',
    toName: '刘洋', toAddr: 'liuxiang_2024@qq.com',
    subject: 'Alibaba Gold Supplier renewal notice（推广广告，可忽略）', customerId: '', customerName: '', customerShort: '',
    contact: '',
    sendAt: '2026-09-01 20:05', sendTime: 1756728300000,
    preview: 'Congratulations! Your Gold Supplier membership is eligible for renewal. Get 2 months FREE when you renew before 9/15…',
    body: `<p>…广告内容…</p>`
  },

  // ---- 额外 16 封未读杂项邮件（让收件箱>20条看起来丰满）----
  ...Array.from({ length: 16 }).map((_, i) => {
    const pairs = [
      ['Koji Tanaka', 'k.tanaka@japantools.co.jp', 'C006', '日本 Japan Tools Ltd.', 'Japan Tools', '社长・田中浩二'],
      ['Sarah Baker', 'sarah.b@bakerhardware.co.nz', 'C007', '新西兰 Baker Hardware', 'Baker Hardware', 'Operations Director'],
      ['David Okonkwo', 'd.okonkwo@lagostraders.ng', 'C008', '尼日利亚 Lagos Traders', 'Lagos Traders', 'MD'],
      ['Lucia Rossi', 'l.rossi@eurocasa.it', 'C009', '意大利 EuroCasa Arredamenti', 'EuroCasa', 'Procurement'],
      ['Muhammad Al-Farsi', 'm.alfarsi@middleeastbuild.ae', 'C010', '阿联酋 Middle East Build', 'ME Build', 'Senior Buyer']
    ]
    const p = pairs[i % pairs.length]
    const subjects = [
      'Re: RFQ confirmation - PO #JT-' + (3200 + i),
      'Re: New product catalog 2026 H2',
      '样品寄件通知 (DHL: 5389' + (1000 + i) + ')',
      'Regarding delayed shipment Aug container (booked ETD 09-' + (8 + (i%12)).toString().padStart(2,'0') + ')',
      'Invoice INV-2026-' + (900 + i) + ' due date reminder'
    ]
    const j = i % 5
    return {
      id: 'M1' + (100 + i).toString().padStart(3,'0'),
      threadId: 'TH' + (100 + i),
      folder: 'inbox',
      direction: 'in',
      starred: j === 2,
      read: i >= 9,  // 前9封未读，后7封已读
      important: j === 0,
      hasAttach: (i % 3) === 0,
      accountId: 'A0' + ((i % 4) + 1),
      accountAlias: mailAccounts[i % 4].alias,
      accountAddr: mailAccounts[i % 4].username,
      fromName: p[0], fromAddr: p[1],
      toName: ['李艳','张伟','王强','刘洋'][i % 4],
      toAddr:  mailAccounts[i % 4].username,
      subject: subjects[j] + '（第' + (i+1) + '封）',
      customerId: p[2], customerName: p[3], customerShort: p[4], contact: p[5],
      sendAt: `2026-09-0${i < 5 ? 2 : 1} ${String(8 + (i % 10)).padStart(2,'0')}:${String(7 + (i * 3) % 50).padStart(2,'0')}`,
      sendTime: 1756700000000 + i * 3600000,
      preview: 'Dear ' + ['李艳','张伟','王强','刘洋'][i % 4] + ', we are writing to follow up on ' + subjects[j].slice(0, 20) + ' mentioned in our last call…',
      body: `<p>Dear ${['李艳','张伟','王强','刘洋'][i % 4]},</p><p>we are writing to follow up on <b>${subjects[j]}</b> mentioned in our last call.</p><p>…（正文省略，示例数据）…<br/><br/>Best regards<br/>${p[0]}</p>`
    }
  })
]

// 3. 邮件追踪：每封邮件的投递链路（针对外发邮件 M002/M011/M020 等）
// status: pending / sending / sent / delivered / opened / replied / bounced / failed
export const mailTracking = [
  // TH001（M002 我发报价单给 Global）—— 成功链路 + 已被打开多次并回复
  { mailId: 'M002', threadId: 'TH001', subject: 'Re: 2026 第四季度铝型材采购订单',
    fromAddr: 'li.yan@globaltrade.com', toAddr: 'james.wilson@globalindustries.us',
    toCustomer: '美国 Global Industries Inc.', toContact: 'James Wilson',
    sentAt: '2026-09-01 16:42', accountType: '企业邮箱',
    opens: 4, clicks: 1, replied: true, bounced: false, failed: false,
    latestStatus: 'replied',
    timeline: [
      { t: '2026-09-01 16:42:08', ev: 'pending',   label: '进入发送队列',              detail: '待 SMTP 连接…' },
      { t: '2026-09-01 16:42:11', ev: 'sending',   label: 'SMTP 握手成功',              detail: '连接 smtp.globaltrade.com:465 / TLS OK' },
      { t: '2026-09-01 16:42:13', ev: 'sent',      label: '已发送至对方服务器',          detail: 'Remote: mx1.globalindustries.us · Size 1.8 MB' },
      { t: '2026-09-01 16:43:01', ev: 'delivered', label: '已送达收件人邮箱',            detail: 'DSN 2.0.0 OK d52si983127qvc.32 - gsmtp' },
      { t: '2026-09-01 17:22:40', ev: 'opened',    label: '第 1 次打开',                detail: 'IP 118.89.xx.xx · Chrome 128 · macOS 14.6' },
      { t: '2026-09-01 23:10:08', ev: 'opened',    label: '第 2 次打开（点击下载附件）', detail: 'IP 38.105.xx.xx · Safari · iPhone 15' },
      { t: '2026-09-02 02:35:22', ev: 'clicked',   label: '链接被点击（报价单第 2 页）', detail: 'URL: /download/Q4-GI-20260901.pdf · 打开 38 秒' },
      { t: '2026-09-02 08:36:15', ev: 'replied',   label: '客户已回复',                  detail: 'Re: 2026 第四季度铝型材采购订单（M001）' }
    ]
  },
  // TH002（M011 张伟发给 AutoTech Hans）—— 已送达已打开但未回复
  { mailId: 'M011', threadId: 'TH002', subject: 'Re: Automotive Cable Harness RFQ - 35k pcs',
    fromAddr: 'zhangwei.sales@gmail.com', toAddr: 'h.mueller@autotech.de',
    toCustomer: '德国 AutoTech GmbH', toContact: 'Hans Müller',
    sentAt: '2026-09-01 15:20', accountType: 'Gmail',
    opens: 2, clicks: 0, replied: false, bounced: false, failed: false,
    latestStatus: 'opened',
    timeline: [
      { t: '2026-09-01 15:20:01', ev: 'pending',   label: '进入发送队列', detail: '' },
      { t: '2026-09-01 15:20:03', ev: 'sending',   label: 'Gmail API 鉴权成功', detail: 'OAuth2 scope: send' },
      { t: '2026-09-01 15:20:05', ev: 'sent',      label: '已发送',       detail: 'Gmail Message-Id: <CADabcdef123@mail.gmail.com>' },
      { t: '2026-09-01 15:20:11', ev: 'delivered', label: '已送达',       detail: 'autotech-smtp.de accepted' },
      { t: '2026-09-01 21:12:55', ev: 'opened',    label: '第 1 次打开', detail: 'IP 46.89.xx.xx · Edge 126 · Windows 11' },
      { t: '2026-09-02 06:05:40', ev: 'opened',    label: '第 2 次打开', detail: 'IP 46.89.xx.xx · Outlook Desktop' }
    ]
  },
  // TH003（M020 李艳发给 Sunrise Priya）—— 退信
  { mailId: 'M020', threadId: 'TH003', subject: 'Sunrise 合作意向 — 不锈钢阀门 catalog',
    fromAddr: 'li.yan@globaltrade.com', toAddr: 'priya.sharma@sunrise-india.in',
    toCustomer: '印度 Sunrise Valves Pvt.', toContact: 'Priya Sharma',
    sentAt: '2026-09-01 11:05', accountType: '企业邮箱',
    opens: 0, clicks: 0, replied: false, bounced: true, failed: false,
    bounceCode: '550 5.1.10 · RecipientNotFound',
    latestStatus: 'bounced',
    timeline: [
      { t: '2026-09-01 11:05:02', ev: 'pending',   label: '进入发送队列', detail: '' },
      { t: '2026-09-01 11:05:04', ev: 'sent',      label: '已发送',       detail: 'mx-in.sunrise-india.in accepted' },
      { t: '2026-09-01 11:07:18', ev: 'bounced',   label: '⚠️ 已退信',    detail: '550 5.1.10 RESOLVER.ADR.RecipientNotFound — 请检查收件人邮箱是否变更' }
    ]
  },
  // 额外 5 封杂项追踪
  { mailId: 'M003', threadId: 'TH001', subject: '2026 第四季度铝型材采购订单（客户询价）',
    fromAddr: 'james.wilson@globalindustries.us', toAddr: 'li.yan@globaltrade.com',
    toCustomer: '美国 Global Industries Inc.', toContact: 'James Wilson',
    sentAt: '2026-08-31 22:10', accountType: '外部',
    opens: 3, clicks: 0, replied: true, bounced: false, failed: false,
    latestStatus: 'replied',
    timeline: [
      { t: '2026-08-31 22:10:00', ev: 'delivered', label: '收件箱已接收', detail: 'SpamAssassin 评分 0.2 → 收件箱' },
      { t: '2026-08-31 22:12:30', ev: 'opened',    label: '李艳已读取',   detail: 'Webmail' },
      { t: '2026-09-01 16:42:00', ev: 'replied',   label: '已回复',       detail: 'M002 - Re: 2026 第四季度铝型材采购订单' }
    ]
  }
]

