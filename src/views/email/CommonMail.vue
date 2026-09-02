<template>
  <div class="page-container">
    <div class="page-header">
      <div>
        <div class="page-title">普邮管理</div>
        <div class="page-subtitle">绑定用户自有邮箱 · 一对一单发邮件 · 保存往来对话 · 收件箱回复统一查看</div>
      </div>
      <div class="page-actions">
        <el-select v-model="activeAccountId" size="large" style="width: 260px" @change="() => {activeFolder='inbox'; ElMessage.success(`已切换邮箱：${currentAccount?.alias || ''}`)}">
          <template #prefix><el-icon><Avatar /></el-icon></template>
          <el-option v-for="a in accounts" :key="a.id" :value="a.id" :label="`${a.alias}  ·  ${a.username}`">
            <div style="display:flex;align-items:center;gap:10px">
              <el-tag size="small" :type="a.status==='ok' ? 'success' : 'warning'" effect="light">
                {{ a.type }}
              </el-tag>
              <div style="display:flex;flex-direction:column">
                <span style="font-weight:600">{{ a.alias }}</span>
                <span style="color:#94a3b8;font-size:12px">{{ a.username }}</span>
              </div>
              <el-tag v-if="a.unread" size="small" type="danger" round effect="dark" style="margin-left:auto">{{ a.unread }} 未读</el-tag>
            </div>
          </el-option>
        </el-select>
        <el-button size="large" type="primary" plain @click="addAccountVisible=true">
          <el-icon><Link /></el-icon>&nbsp; 绑定新邮箱
        </el-button>
        <el-button size="large" type="primary" @click="openCompose()">
          <el-icon><EditPen /></el-icon>&nbsp; 写邮件
        </el-button>
      </div>
    </div>

    <!-- ========== 顶部 4 张统计卡 ========== -->
    <div class="stat-cards">
      <div class="stat-card" @click="switchFolder('inbox')">
        <div class="stat-info">
          <div class="stat-label">收件箱</div>
          <div class="stat-value">{{ inboxCount }}</div>
          <div class="stat-sub" v-if="unreadCount"><b style="color:#dc2626">{{ unreadCount }} 封未读</b></div>
          <div class="stat-sub" v-else>全部已读</div>
        </div>
        <div class="stat-icon blue"><el-icon><MessageBox /></el-icon></div>
      </div>
      <div class="stat-card" @click="switchFolder('starred')">
        <div class="stat-info">
          <div class="stat-label">星标邮件</div>
          <div class="stat-value">{{ starCount }}</div>
          <div class="stat-sub">重要客户往来</div>
        </div>
        <div class="stat-icon orange"><el-icon><Star /></el-icon></div>
      </div>
      <div class="stat-card" @click="switchFolder('drafts')">
        <div class="stat-info">
          <div class="stat-label">草稿箱</div>
          <div class="stat-value">{{ draftCount }}</div>
          <div class="stat-sub">未完成的邮件</div>
        </div>
        <div class="stat-icon green"><el-icon><DocumentCopy /></el-icon></div>
      </div>
      <div class="stat-card" @click="switchFolder('sent')">
        <div class="stat-info">
          <div class="stat-label">本月已发送</div>
          <div class="stat-value">{{ monthSentCount }}</div>
          <div class="stat-sub">一对一单发</div>
        </div>
        <div class="stat-icon cyan"><el-icon><Promotion /></el-icon></div>
      </div>
    </div>

    <!-- ========== 三栏主体 ========== -->
    <div class="mail-body">
      <!-- 左栏：文件夹 + 快捷客户对话 -->
      <div class="mail-aside">
        <div class="mail-aside-card">
          <div class="card-head">
            <span class="card-title">文件夹</span>
            <el-icon style="color:#94a3b8" @click="refresh"><Refresh /></el-icon>
          </div>
          <div class="folder-list">
            <div class="folder-item" :class="{active: activeFolder==='inbox'}" @click="switchFolder('inbox')">
              <el-icon class="fold-ic"><MessageBox /></el-icon>
              <span>收件箱</span>
              <el-tag v-if="unreadCount" type="danger" size="small" round effect="dark">{{ unreadCount }}</el-tag>
            </div>
            <div class="folder-item" :class="{active: activeFolder==='starred'}" @click="switchFolder('starred')">
              <el-icon class="fold-ic yellow"><Star /></el-icon>
              <span>星标邮件</span>
            </div>
            <div class="folder-item" :class="{active: activeFolder==='sent'}" @click="switchFolder('sent')">
              <el-icon class="fold-ic"><Promotion /></el-icon>
              <span>已发送</span>
            </div>
            <div class="folder-item" :class="{active: activeFolder==='drafts'}" @click="switchFolder('drafts')">
              <el-icon class="fold-ic green"><DocumentCopy /></el-icon>
              <span>草稿箱</span>
              <el-tag v-if="draftCount" type="success" size="small" round effect="light">{{ draftCount }}</el-tag>
            </div>
            <div class="folder-item" :class="{active: activeFolder==='trash'}" @click="switchFolder('trash')">
              <el-icon class="fold-ic red"><Delete /></el-icon>
              <span>垃圾箱</span>
            </div>
          </div>
        </div>

        <div class="mail-aside-card">
          <div class="card-head"><span class="card-title">最近客户往来</span></div>
          <div class="cust-list">
            <div v-for="g in recentCustomerGroups" :key="g.customerId"
                 class="cust-item" :class="{active: kwCustomer===g.customerId}"
                 @click="toggleCustomerFilter(g.customerId)">
              <el-avatar :size="38" :style="{background: avatarBg(g.customerShort)}">{{ g.customerShort?.slice(0,1) || 'C' }}</el-avatar>
              <div class="cust-meta">
                <div class="cust-line1">
                  <span class="cust-name">{{ g.customerShort || '（未关联客户）' }}</span>
                  <el-tag size="small" :type="mailTypeTag(g.latestMail)" effect="plain">{{ g.latestMail.direction==='in' ? '客户来信' : '我已发送' }}</el-tag>
                </div>
                <div class="cust-line2">{{ g.latestMail.fromName }} · {{ g.latestMail.sendAt.slice(5) }}</div>
              </div>
              <el-tag size="small" type="primary" effect="dark" round style="margin-left:auto">{{ g.count }}</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- 中栏：邮件列表 -->
      <div class="mail-list-panel">
        <div class="list-toolbar">
          <div class="lt-left">
            <el-checkbox v-model="checkAll" :indeterminate="selection.length>0 && !checkAll" @change="toggleCheckAll" />
            <el-button link type="primary" size="small" :disabled="!selection.length" @click="markAs('read')">标记已读</el-button>
            <el-button link type="primary" size="small" :disabled="!selection.length" @click="markAs('unread')">标未读</el-button>
            <el-button link type="primary" size="small" :disabled="!selection.length" @click="moveTo('trash')">删除</el-button>
            <el-divider direction="vertical" />
            <el-button link type="primary" size="small" @click="refresh"><el-icon><Refresh /></el-icon>&nbsp;刷新</el-button>
          </div>
          <div class="lt-right">
            <el-input v-model="kw" size="default" placeholder="搜索主题 / 发件人 / 内容" clearable style="width:280px">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
        </div>

        <el-empty v-if="!visibleMails.length" description="该文件夹下暂无邮件" :image-size="110" />

        <div v-else class="mail-list">
          <div v-for="m in visibleMails" :key="m.id"
               class="mail-row" :class="{selected: selectedMailId===m.id, unread: !m.read}"
               @click="selectMail(m)">
            <div class="row-check"><el-checkbox v-model="m._sel" @change.stop="refreshSelection" /></div>
            <div class="row-star" @click.stop="m.starred = !m.starred">
              <el-icon :class="{yellow: m.starred}"><StarFilled v-if="m.starred" /><Star v-else /></el-icon>
            </div>
            <el-icon v-if="m.important" class="row-imp red" :title="'重要'" @click.stop="m.important = !m.important"><WarningFilled /></el-icon>
            <el-icon v-else class="row-imp phantom"><Warning /></el-icon>
            <el-avatar class="row-avatar" :size="36" :style="{background: avatarBg(m.fromName)}">{{ first(m.fromName) }}</el-avatar>
            <div class="row-sender" :title="m.fromAddr">{{ m.fromName }}</div>
            <div class="row-subject">
              <span class="subj-text" :class="{fold: m.hasAttach}">{{ m.subject }}</span>
              <el-icon v-if="m.hasAttach" class="row-att"><Paperclip /></el-icon>
              <span class="row-preview">{{ m.preview }}</span>
            </div>
            <div class="row-time">{{ m.sendAt.slice(5) }}</div>
          </div>
        </div>
      </div>

      <!-- 右栏：邮件阅读 + 对话时间轴 -->
      <div class="mail-read-panel" v-if="selectedMail">
        <div class="read-head">
          <div class="subject-line">
            <el-button link @click="selectedMailId = null; selectedMail = null"><el-icon><Back /></el-icon></el-button>
            <h2 class="subj">{{ selectedMail.subject }}</h2>
          </div>
          <el-tag v-if="selectedMail.customerName" size="small" type="primary" effect="light">
            <el-icon><OfficeBuilding /></el-icon>&nbsp; {{ selectedMail.customerName }} · {{ selectedMail.contact || '联系人' }}
          </el-tag>
          <el-tag v-if="selectedMail.hasAttach" size="small" effect="plain">📎 带附件</el-tag>
          <el-tag size="small" :type="mailTypeTag(selectedMail)" effect="dark">
            {{ selectedMail.direction==='in' ? '客户来信' : '我已发送' }}
          </el-tag>
        </div>

        <div class="read-meta">
          <div class="rm-left">
            <el-avatar :size="40" :style="{background: avatarBg(selectedMail.fromName)}">{{ first(selectedMail.fromName) }}</el-avatar>
            <div class="rm-info">
              <div class="rm-from">
                <b>{{ selectedMail.fromName }}</b>
                <span style="color:#64748b">&nbsp;&lt;{{ selectedMail.fromAddr }}&gt;</span>
              </div>
              <div class="rm-to">
                发送至：<b>{{ selectedMail.toName }}</b> &lt;{{ selectedMail.toAddr }}&gt;
              </div>
            </div>
          </div>
          <div class="rm-right">
            <div class="rm-time">{{ selectedMail.sendAt }}</div>
            <div class="rm-actions">
              <el-button size="small" type="primary" plain @click="openReply(selectedMail)"><el-icon><ChatDotRound /></el-icon>&nbsp;回复</el-button>
              <el-button size="small" @click="openForward(selectedMail)"><el-icon><Right /></el-icon>&nbsp;转发</el-button>
              <el-button size="small" plain @click="selectedMail.starred = !selectedMail.starred">
                <el-icon :class="{yellow: selectedMail.starred}"><Star /></el-icon>&nbsp; 星标
              </el-button>
              <el-button size="small" plain type="danger" @click="moveMail(selectedMail, 'trash')"><el-icon><Delete /></el-icon></el-button>
            </div>
          </div>
        </div>

        <div class="mail-body-text" v-html="selectedMail.body"></div>

        <!-- 同对话往来时间轴（Thread） -->
        <div class="thread-wrap" v-if="sameThreadMails.length > 1">
          <div class="card-head"><span class="card-title">本对话往来（{{ sameThreadMails.length }} 封）</span></div>
          <el-timeline>
            <el-timeline-item
              v-for="(t, i) in sameThreadMails.slice().reverse()" :key="t.id"
              :timestamp="t.sendAt"
              :type="t.direction==='in' ? 'primary' : 'success'"
              placement="top">
              <template #icon>
                <el-icon>
                  <ChatLineRound v-if="t.direction==='in'" />
                  <Promotion v-else />
                </el-icon>
              </template>
              <el-card shadow="never" :class="['thread-card', t.direction==='in' ? 'inbox' : 'outbox']" style="cursor:pointer" @click="selectMailById(t.id)">
                <div class="thread-head">
                  <el-tag size="small" :type="mailTypeTag(t)" effect="dark">
                    {{ t.direction==='in' ? `${t.fromName} 来信` : `我通过${t.accountAlias} 发给 ${t.toName}` }}
                  </el-tag>
                  <span style="color:#94a3b8;font-size:12px">{{ i===0 ? '（最新）' : '' }}</span>
                </div>
                <div class="thread-subj">{{ t.subject }}</div>
                <div class="thread-preview">{{ t.preview }}</div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>

        <!-- 底部快速回复区（可折叠） -->
        <div class="quick-reply" v-if="selectedMail.direction==='in'">
          <div class="card-head" @click="showQuickReply=!showQuickReply" style="cursor:pointer">
            <span class="card-title"><el-icon style="vertical-align:-2px"><ChatDotRound /></el-icon> 快速回复此客户</span>
            <el-icon style="color:#64748b"><CaretTop v-if="showQuickReply" /><CaretBottom v-else /></el-icon>
          </div>
          <div v-if="showQuickReply" class="quick-reply-body">
            <div style="margin-bottom:10px;color:#475569;font-size:13px">
              回复：<b>{{ selectedMail.fromName }} &lt;{{ selectedMail.fromAddr }}&gt;</b>
              &nbsp; 用账号：<el-tag size="small" effect="plain">{{ currentAccount?.alias }}</el-tag>
              &nbsp; 关联客户：<el-tag v-if="selectedMail.customerName" size="small" type="primary" effect="light">{{ selectedMail.customerShort }}</el-tag>
            </div>
            <el-input v-model="quickReplyText" type="textarea" :rows="5" placeholder="输入回复内容，支持 Shift+Enter 换行…" />
            <div class="reply-foot-toolbar">
              <div class="rft-left">
                <el-input placeholder="附件：输入文件名后回车（模拟）" style="width:300px"
                  @keydown.enter.prevent="e => { if(e.target.value) { quickReplyAttach.push(e.target.value); e.target.value=''; }}" />
                <div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center;margin-top:8px">
                  <el-tag v-for="(a, i) in quickReplyAttach" :key="'a'+i" size="small" effect="light" closable @close="quickReplyAttach.splice(i,1)">📎 {{ a }}</el-tag>
                  <span v-if="!quickReplyAttach.length" style="color:#94a3b8;font-size:12px">暂无附件（Mock，不上传真实文件）</span>
                </div>
              </div>
              <div class="rft-right">
                <el-button size="small" type="primary" plain @click="saveReplyAsDraft(selectedMail)">存草稿</el-button>
                <el-button size="small" type="primary" @click="sendQuickReply(selectedMail)"><el-icon><Promotion /></el-icon>&nbsp;发送回复</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="mail-read-panel mail-read-empty" v-else>
        <el-empty description="请从左侧列表选择一封邮件查看详情（或点击上方「写邮件」新建一对一邮件）" :image-size="160">
          <el-button type="primary" size="large" @click="openCompose()"><el-icon><EditPen /></el-icon>&nbsp; 一对一写邮件</el-button>
        </el-empty>
      </div>
    </div>

    <!-- ========== 抽屉：写新邮件 / 回复 / 转发 ========== -->
    <el-drawer v-model="composeVisible" title="一对一写邮件" size="760px" :destroy-on-close="true">
      <div class="compose-form">
        <div class="cf-row">
          <label>发件账号</label>
          <el-select v-model="compose.accountId" size="large" style="flex:1">
            <el-option v-for="a in accounts" :key="a.id" :value="a.id">
              <span style="display:inline-flex;align-items:center;gap:8px">
                <el-tag size="small" :type="a.status==='ok' ? 'success' : 'warning'" effect="light">{{ a.type }}</el-tag>
                <b>{{ a.alias }}</b> · <span style="color:#64748b">{{ a.username }}</span>
              </span>
            </el-option>
          </el-select>
        </div>
        <div class="cf-row">
          <label>收件人 <span style="color:#dc2626">*</span></label>
          <el-select v-model="compose.toAddr" size="large" filterable allow-create default-first-option style="flex:1" placeholder="从客户池联系人中选择，或手动输入邮箱后回车">
            <el-option v-for="(c, i) in contactSuggestions" :key="'s'+i" :label="sugLabel(c)" :value="c.email">
              <el-row>
                <el-col :span="10"><b>{{ c.name }}</b> &nbsp;<span style="color:#94a3b8">{{ c.email }}</span></el-col>
                <el-col :span="14" style="text-align:right;color:#64748b">{{ c.shortName }} · {{ c.level }}级 · {{ c.contact }} · {{ c.country }}</el-col>
              </el-row>
            </el-option>
          </el-select>
        </div>
        <div class="cf-row">
          <label>关联客户</label>
          <el-select v-model="compose.customerId" size="large" filterable clearable style="flex:1" placeholder="选填 — 发送后自动挂到客户档案·历史邮件">
            <el-option v-for="c in customerList" :key="c.id" :value="c.id" :label="`${c.shortName}（${c.id} · ${c.level}级 · ${c.follower}）`" />
          </el-select>
        </div>
        <div class="cf-row">
          <label>抄送 / 密送</label>
          <div style="flex:1;display:flex;gap:8px">
            <el-input v-model="compose.cc" size="large" placeholder="Cc（逗号分隔多邮箱，暂仅支持 1 对 1 单发，此处为模拟）" disabled />
            <el-input v-model="compose.bcc" size="large" placeholder="Bcc（暂仅支持 1 对 1 单发，此处为模拟）" disabled />
          </div>
        </div>
        <div class="cf-row">
          <label>主题 <span style="color:#dc2626">*</span></label>
          <el-input v-model="compose.subject" size="large" style="flex:1" placeholder="Re: 或 新主题" />
        </div>

        <!-- 简易富文本：加粗/斜体/列表/链接（纯文本编辑模拟） -->
        <div class="cf-row cf-body">
          <label>正文</label>
          <div class="editor-wrap" style="flex:1">
            <div class="editor-toolbar">
              <el-button size="small" plain @click="wrapText('**','**')"><b>B</b></el-button>
              <el-button size="small" plain @click="wrapText('<i>','</i>')"><i>I</i></el-button>
              <el-button size="small" plain @click="wrapText('<ul><li>','</li></ul>')"><el-icon><List /></el-icon></el-button>
              <el-button size="small" plain @click="wrapText('<a href=&quot;&quot;>','</a>')"><el-icon><Link /></el-icon></el-button>
              <el-divider direction="vertical" />
              <el-upload
                action="#"
                :auto-upload="false"
                multiple
                :on-change="f => { if (f.name && !compose.attach.includes(f.name)) compose.attach.push(f.name) }"
                style="display:inline-block">
                <el-button size="small" plain><el-icon><Paperclip /></el-icon>&nbsp; 添加附件</el-button>
              </el-upload>
              <span style="color:#94a3b8;font-size:12px;margin-left:8px">* 本环境为前端 Mock，附件不会真正上传</span>
            </div>
            <div class="attach-pills" v-if="compose.attach.length">
              <el-tag v-for="(a, i) in compose.attach" :key="i" size="small" effect="light" closable @close="compose.attach.splice(i,1)" style="margin:2px 6px 2px 0">
                📎 {{ a }}
              </el-tag>
            </div>
            <el-input v-model="compose.body" type="textarea" :rows="14" placeholder="Dear [客户名]，&#10;&#10;...写信正文...&#10;&#10;Best regards&#10;你的名字" />
          </div>
        </div>
      </div>

      <template #footer>
        <div style="display:flex;justify-content:space-between">
          <el-button size="large" plain @click="closeCompose()">关闭</el-button>
          <div>
            <el-button size="large" plain type="primary" @click="saveComposeAsDraft()">
              <el-icon><DocumentCopy /></el-icon>&nbsp; 存草稿
            </el-button>
            <el-dropdown @command="sendAtCmd">
              <el-button size="large" type="primary">
                <el-icon><Promotion /></el-icon>&nbsp; 立即发送<el-icon style="margin-left:6px"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="now">立即发送</el-dropdown-item>
                  <el-dropdown-item command="30m">30 分钟后发送</el-dropdown-item>
                  <el-dropdown-item command="tomorrow">明天 9:00 发送</el-dropdown-item>
                  <el-dropdown-item command="mon">下周一 9:00 发送</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </template>
    </el-drawer>

    <!-- ========== Dialog：绑定新邮箱 ========== -->
    <el-dialog v-model="addAccountVisible" title="绑定自有邮箱账号" width="620px" :destroy-on-close="true">
      <el-tabs v-model="bindTab" type="card">
        <el-tab-pane label="自动配置（推荐）" name="auto">
          <el-descriptions :column="1" border size="default" style="margin-bottom:10px">
            <el-descriptions-item label="支持类型">企业邮箱（SMTP/IMAP）、Gmail（OAuth2）、Outlook / Office 365、QQ 邮箱、163 邮箱、iCloud 等 —— 系统会按邮箱后缀自动识别服务器参数</el-descriptions-item>
          </el-descriptions>
          <el-form label-width="110px" label-position="right">
            <el-form-item label="邮箱地址" required>
              <el-input v-model="newAccount.email" size="large" placeholder="name@company.com 或 name@gmail.com">
                <template #suffix>
                  <el-tag v-if="detectedAccountType" size="small" type="primary" effect="light">已识别：{{ detectedAccountType }}</el-tag>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="密码 / 授权码" required>
              <el-input v-model="newAccount.password" size="large" type="password" show-password placeholder="Gmail / QQ 邮箱请使用「专用授权码」而非登录密码" />
            </el-form-item>
            <el-form-item label="显示名称">
              <el-input v-model="newAccount.alias" size="large" placeholder="例：李艳·业务主管" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="手动配置（IMAP/SMTP）" name="manual">
          <el-form label-width="110px" label-position="right">
            <el-form-item label="邮箱地址"><el-input v-model="newAccount.email" size="large" /></el-form-item>
            <el-form-item label="显示名称"><el-input v-model="newAccount.alias" size="large" /></el-form-item>
            <el-divider content-position="left">IMAP · 收件服务器</el-divider>
            <el-form-item label="IMAP 服务器"><el-input v-model="newAccount.imapHost" size="large" placeholder="imap.xxx.com" /></el-form-item>
            <el-form-item label="端口">
              <el-input-number v-model="newAccount.imapPort" size="large" :min="1" :max="65535" style="width:50%" />
              <el-tag size="small" effect="plain" style="margin-left:8px">通常 993 (SSL) / 143 (STARTTLS)</el-tag>
            </el-form-item>
            <el-form-item label="加密方式">
              <el-radio-group v-model="newAccount.imapSsl">
                <el-radio value="ssl">SSL/TLS</el-radio>
                <el-radio value="tls">STARTTLS</el-radio>
                <el-radio value="none">无（不推荐）</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-divider content-position="left">SMTP · 发件服务器</el-divider>
            <el-form-item label="SMTP 服务器"><el-input v-model="newAccount.smtpHost" size="large" placeholder="smtp.xxx.com" /></el-form-item>
            <el-form-item label="端口">
              <el-input-number v-model="newAccount.smtpPort" size="large" :min="1" :max="65535" style="width:50%" />
              <el-tag size="small" effect="plain" style="margin-left:8px">通常 465 (SSL) / 587 (STARTTLS)</el-tag>
            </el-form-item>
            <el-form-item label="加密方式">
              <el-radio-group v-model="newAccount.smtpSsl">
                <el-radio value="ssl">SSL/TLS</el-radio>
                <el-radio value="tls">STARTTLS</el-radio>
                <el-radio value="none">无（不推荐）</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="账号密码"><el-input v-model="newAccount.password" size="large" type="password" show-password /></el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <div style="display:flex;justify-content:space-between">
          <el-button size="large" plain :loading="testingConn" @click="testConnection()">
            <el-icon><Connection /></el-icon>&nbsp; 测试连接
          </el-button>
          <div>
            <el-button size="large" plain @click="addAccountVisible=false">取消</el-button>
            <el-button size="large" type="primary" :loading="savingNew" @click="saveNewAccount()">
              <el-icon><Check /></el-icon>&nbsp; 保存并启用
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Avatar, Link, EditPen, MessageBox, Star, StarFilled, DocumentCopy, Promotion, Delete, Refresh,
  Search, Back, ChatDotRound, Right, Warning, WarningFilled, Paperclip, CaretTop, CaretBottom,
  ChatLineRound, OfficeBuilding, List, ArrowDown, Connection, Check
} from '@element-plus/icons-vue'
import {
  mailAccounts as _accs, mails as _mails, customers as _cust
} from '@/mock'

// ========== 基础数据 ==========
// 无图标别名
const accounts = ref([..._accs])
const allMails = ref(_mails.map(m => ({ ...m, _sel: false })))
const customerList = _cust.map(c => ({ id: c.id, name: c.company, shortName: c.shortName, level: c.level, follower: c.follower, country: c.country, contact: c.contact, email: c.emails?.[0] || `${c.id}@customer.mock` }))
const contactSuggestions = _cust.filter(c => c.emails?.length).map(c => ({
  name: c.contact, email: c.emails[0], shortName: c.shortName, level: c.level, contact: c.contact, country: c.country
}))

// ========== 状态 ==========
const activeAccountId = ref(accounts.value[0]?.id || 'A01')
const activeFolder = ref('inbox')
const kw = ref('')
const kwCustomer = ref('')
const checkAll = ref(false)
const selection = ref([])

const selectedMailId = ref(null)
const selectedMail = ref(null)
const showQuickReply = ref(false)
const quickReplyText = ref('')
const quickReplyAttach = ref([])

const composeVisible = ref(false)
const emptyCompose = () => ({
  accountId: activeAccountId.value, toAddr: '', customerId: '', subject: '', body: '', cc: '', bcc: '',
  attach: [], mode: 'new', replyMailId: null
})
const compose = reactive(emptyCompose())

const addAccountVisible = ref(false)
const bindTab = ref('auto')
const testingConn = ref(false), savingNew = ref(false)
const newAccount = reactive({
  email: '', password: '', alias: '',
  imapHost: '', imapPort: 993, imapSsl: 'ssl',
  smtpHost: '', smtpPort: 465, smtpSsl: 'ssl'
})

// ========== 派生 ==========
const currentAccount = computed(() => accounts.value.find(a => a.id === activeAccountId.value))
const accountMails = computed(() => allMails.value.filter(m => m.accountId === activeAccountId.value))
// 文件夹筛选
const folderMails = computed(() => {
  const arr = accountMails.value
  if (activeFolder.value === 'inbox')   return arr.filter(m => m.folder === 'inbox')
  if (activeFolder.value === 'starred') return arr.filter(m => m.starred)
  if (activeFolder.value === 'sent')    return arr.filter(m => m.folder === 'sent')
  if (activeFolder.value === 'drafts')  return arr.filter(m => m.folder === 'drafts')
  if (activeFolder.value === 'trash')   return arr.filter(m => m.folder === 'trash')
  return arr
})
// 客户筛选 + 关键词搜索
const visibleMails = computed(() => {
  let list = folderMails.value
  if (kwCustomer.value) list = list.filter(m => m.customerId === kwCustomer.value)
  if (kw.value) {
    const k = kw.value.toLowerCase()
    list = list.filter(m =>
      m.subject.toLowerCase().includes(k) ||
      m.fromName.toLowerCase().includes(k) ||
      m.fromAddr.toLowerCase().includes(k) ||
      (m.preview || '').toLowerCase().includes(k) ||
      (m.body || '').toLowerCase().includes(k)
    )
  }
  return list.sort((a, b) => b.sendTime - a.sendTime)
})

const inboxCount = computed(() => accountMails.value.filter(m => m.folder === 'inbox').length)
const unreadCount = computed(() => accountMails.value.filter(m => m.folder === 'inbox' && !m.read).length)
const starCount   = computed(() => accountMails.value.filter(m => m.starred).length)
const draftCount  = computed(() => accountMails.value.filter(m => m.folder === 'drafts').length)
const monthSentCount = computed(() => accountMails.value.filter(m => m.folder === 'sent' && (m.sendAt || '').startsWith('2026-09')).length)

// 最近客户往来分组
const recentCustomerGroups = computed(() => {
  const groups = new Map()
  for (const m of accountMails.value.slice().sort((a, b) => b.sendTime - a.sendTime)) {
    const key = m.customerId || '__no_customer__'
    if (!groups.has(key)) groups.set(key, { customerId: m.customerId || '', customerShort: m.customerShort || '未关联客户', count: 0, latestMail: m })
    groups.get(key).count++
  }
  return [...groups.values()].slice(0, 8)
})

// 当前选中邮件 + 同对话
const sameThreadMails = computed(() => {
  if (!selectedMail.value) return []
  return allMails.value
    .filter(m => m.threadId === selectedMail.value.threadId)
    .sort((a, b) => a.sendTime - b.sendTime)
})

// 绑定新邮箱：自动识别服务器
const detectedAccountType = computed(() => {
  const e = (newAccount.email || '').toLowerCase().trim()
  if (!e.includes('@')) return ''
  const domain = e.split('@')[1]
  if (domain === 'gmail.com') return 'Gmail · OAuth2'
  if (domain === 'outlook.com' || domain === 'hotmail.com' || domain === 'live.com') return 'Outlook / Office 365'
  if (domain === 'qq.com' || domain === 'foxmail.com') return 'QQ 邮箱（需授权码）'
  if (domain === '163.com' || domain === '126.com') return '163 网易邮箱'
  if (domain === 'icloud.com' || domain === 'me.com') return 'iCloud 邮箱'
  // 其它：判断企业域名（3 个字母以上 + 非公共）
  if (domain.includes('.')) return `企业邮箱（${domain}）· 自动识别 IMAP/SMTP`
  return '未知邮箱类型'
})

// ========== 工具 ==========
const first = s => (s || '?').slice(0,1).toUpperCase()
const palette = ['#2563eb', '#10b981', '#f59e0b', '#0ea5e9', '#ef4444', '#8b5cf6', '#ec4899', '#059669', '#f97316', '#0891b2', '#7c3aed', '#db2777']
const avatarBg = s => palette[ (s || '').toString().split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length ]
const mailTypeTag = m => m?.direction === 'in' ? 'primary' : 'success'
const sugLabel = c => `${c.name}  [${c.email}]  -  ${c.shortName}`

// ========== 行为 ==========
const switchFolder = f => { activeFolder.value = f; selectedMailId.value = null; selectedMail.value = null; checkAll.value = false; refreshSelection() }
const toggleCustomerFilter = cid => {
  kwCustomer.value = (kwCustomer.value === cid) ? '' : cid
  selectedMailId.value = null; selectedMail.value = null
  ElMessage.success(kwCustomer.value ? '已按客户筛选往来邮件' : '已取消客户筛选')
}
const refresh = () => { ElMessage.success('已模拟 IMAP 重新拉取') }

const selectMail = m => {
  selectedMailId.value = m.id
  selectedMail.value = m
  if (!m.read) {
    m.read = true
    // 同步对应账号的未读数 -1（仅模拟：简单减 1 当未读数>0 时）
    const a = accounts.value.find(x => x.id === m.accountId)
    if (a && a.unread > 0) a.unread = a.unread - 1
  }
  showQuickReply.value = false
  quickReplyText.value = ''
  quickReplyAttach.value = []
}
const selectMailById = id => {
  const m = allMails.value.find(x => x.id === id)
  if (m) {
    activeFolder.value = 'inbox'  // 跳转对话自动切到收件箱确保能看到
    selectMail(m)
  }
}

const refreshSelection = () => {
  selection.value = visibleMails.value.filter(m => m._sel)
  checkAll.value = selection.value.length > 0 && selection.value.length === visibleMails.value.length
}
const toggleCheckAll = v => {
  visibleMails.value.forEach(m => { m._sel = v })
  refreshSelection()
}
const markAs = mode => {
  selection.value.forEach(m => { m.read = (mode === 'read') })
  ElMessage.success(`${mode==='read'?'已读':'未读'}：${selection.value.length} 封`)
  refreshSelection()
}
const moveTo = folder => {
  const n = selection.value.length
  selection.value.forEach(m => { m.folder = folder })
  ElMessage.success(`已移动到「${folder==='trash'?'垃圾箱':folder}」：${n} 封`)
  checkAll.value = false
  refreshSelection()
}
const moveMail = (m, folder) => {
  m.folder = folder
  if (selectedMailId.value === m.id) { selectedMailId.value = null; selectedMail.value = null }
  ElMessage.success('已移动邮件')
}

// ========== 回复 / 转发 / 新建 ==========
const openCompose = (mode = 'new') => {
  Object.assign(compose, emptyCompose())
  compose.mode = mode
  composeVisible.value = true
  nextTick(() => compose.accountId = activeAccountId.value)
}
const openReply = m => {
  Object.assign(compose, emptyCompose())
  compose.mode = 'reply'; compose.replyMailId = m.id
  compose.accountId = m.accountId
  compose.toAddr = m.fromAddr
  compose.customerId = m.customerId
  compose.subject = m.subject.startsWith('Re:') ? m.subject : `Re: ${m.subject}`
  compose.body = `\n\n> ---- ${m.fromName} <${m.fromAddr}> wrote:\n> Subject: ${m.subject}\n> Date: ${m.sendAt}\n>\n> ${(m.preview || '').slice(0, 120)}…`
  composeVisible.value = true
}
const openForward = m => {
  Object.assign(compose, emptyCompose())
  compose.mode = 'forward'; compose.replyMailId = m.id
  compose.accountId = m.accountId
  compose.subject = `Fwd: ${m.subject}`
  compose.body = `\n\n> ---- Forwarded message ----\n> From: ${m.fromName} <${m.fromAddr}>\n> To: ${m.toName} <${m.toAddr}>\n> Subject: ${m.subject}\n> Date: ${m.sendAt}\n>\n${m.preview}…`
  composeVisible.value = true
}
const closeCompose = () => composeVisible.value = false

const wrapText = (pre, suf) => {
  // 简易版：在 body 末尾追加带 pre/suf 占位，方便用户定位编辑
  compose.body = (compose.body || '') + `\n${pre}在此输入${suf}\n`
  ElMessage.info('已在正文末尾插入格式标记，请在此位置编辑内容')
}
const saveComposeAsDraft = () => {
  if (!compose.toAddr) return ElMessage.warning('请先填写收件人邮箱')
  const id = 'D' + Date.now().toString().slice(-6)
  const a = accounts.value.find(x => x.id === compose.accountId) || accounts.value[0]
  const now = new Date().toISOString().replace('T',' ').slice(0,16)
  allMails.value.unshift({
    id, threadId: compose.replyMailId ? (allMails.value.find(x => x.id===compose.replyMailId)?.threadId || `TH-${id}`) : `TH-${id}`,
    folder: 'drafts', direction: 'out', starred: false, read: true, important: false, hasAttach: compose.attach.length > 0,
    accountId: compose.accountId, accountAlias: a.alias, accountAddr: a.username,
    fromName: a.alias.split('·')[0]?.trim() || '我', fromAddr: a.username,
    toName: compose.toAddr.split('@')[0], toAddr: compose.toAddr,
    subject: compose.subject || '(未填写主题)',
    customerId: compose.customerId,
    customerName: customerList.find(c => c.id === compose.customerId)?.name || '',
    customerShort: customerList.find(c => c.id === compose.customerId)?.shortName || '',
    contact: customerList.find(c => c.id === compose.customerId)?.contact || '',
    sendAt: now, sendTime: Date.now(),
    preview: (compose.body || '').slice(0, 100),
    body: `<p>${(compose.body || '').replace(/\n/g,'<br/>')}</p>`
  })
  composeVisible.value = false
  ElMessage.success('已保存到草稿箱')
}
const sendAtCmd = cmd => {
  if (!compose.toAddr) return ElMessage.warning('请先填写「收件人」邮箱（一对一单发）')
  if (!compose.subject) return ElMessage.warning('请填写邮件「主题」')
  const now = Date.now()
  let delay = 0
  let label = '立即'
  if (cmd === '30m')      { delay = 1800 * 1000; label = '30 分钟后' }
  else if (cmd === 'tomorrow') { delay = 0; label = '明天 9:00（已加入定时队列，Mock）' }
  else if (cmd === 'mon')      { delay = 0; label = '下周一 9:00（已加入定时队列，Mock）' }
  const doSend = () => _realSend(compose, delay)
  if (delay > 0 && cmd !== '30m') { ElMessage.success(`已加入定时发送队列：${label}`); composeVisible.value = false; return }
  doSend()
  ElMessage.success(cmd === 'now' ? '已发送！邮件已进入发送队列 → 可在「邮件追踪」查看投递链路' : `已加入发送队列，将在 ${label} 发送`)
  composeVisible.value = false
}
// 辅助：模拟真实发送 → 加入 sent 箱 + 邮件追踪里新增一条 timeline
const _realSend = (comp, delay) => {
  const id = 'M-S' + Date.now().toString().slice(-6)
  const a = accounts.value.find(x => x.id === comp.accountId) || accounts.value[0]
  const sendAtStr = new Date(Date.now() + delay).toISOString().replace('T',' ').slice(0,16)
  const nowSec = ts => new Date(ts).toISOString().replace('T',' ').slice(0,19)
  const t0 = Date.now() + delay
  const customer = customerList.find(c => c.id === comp.customerId)
  const toName = comp.toAddr.split('@')[0]
  const outMail = {
    id, threadId: comp.replyMailId ? (allMails.value.find(x => x.id===comp.replyMailId)?.threadId || `TH-${id}`) : `TH-${id}`,
    folder: 'sent', direction: 'out', starred: false, read: true, important: false, hasAttach: comp.attach.length > 0,
    accountId: comp.accountId, accountAlias: a.alias, accountAddr: a.username,
    fromName: a.alias.split('·')[0]?.trim() || '我', fromAddr: a.username,
    toName, toAddr: comp.toAddr,
    subject: comp.subject || '(未填写主题)',
    customerId: comp.customerId || '', customerName: customer?.name || '', customerShort: customer?.shortName || '',
    contact: customer?.contact || '',
    sendAt: sendAtStr, sendTime: t0,
    preview: (comp.body || '').slice(0, 100),
    body: `<p>${(comp.body || '').replace(/\n/g,'<br/>')}</p>`,
    _sel: false
  }
  allMails.value.unshift(outMail)
}

// 快速回复
const sendQuickReply = m => {
  if (!quickReplyText.value.trim()) return ElMessage.warning('请填写回复内容')
  Object.assign(compose, emptyCompose())
  compose.mode = 'reply'; compose.replyMailId = m.id
  compose.accountId = activeAccountId.value
  compose.toAddr = m.fromAddr
  compose.customerId = m.customerId
  compose.subject = m.subject.startsWith('Re:') ? m.subject : `Re: ${m.subject}`
  compose.body = quickReplyText.value
  compose.attach = [...quickReplyAttach.value]
  _realSend(compose, 0)
  quickReplyText.value = ''; quickReplyAttach.value = []
  ElMessage.success('已回复客户，新邮件已进入「已发送」& 邮件追踪可查投递状态')
}
const saveReplyAsDraft = m => {
  Object.assign(compose, emptyCompose())
  compose.mode = 'reply'; compose.replyMailId = m.id
  compose.accountId = activeAccountId.value
  compose.toAddr = m.fromAddr
  compose.customerId = m.customerId
  compose.subject = m.subject.startsWith('Re:') ? m.subject : `Re: ${m.subject}`
  compose.body = quickReplyText.value
  compose.attach = [...quickReplyAttach.value]
  saveComposeAsDraft()
  quickReplyText.value = ''; quickReplyAttach.value = []
}

// ========== 绑定邮箱 ==========
watch(bindTab, t => {
  if (t === 'auto') return
  // 切换到手动配置时，用已识别的信息填充
  const d = detectedAccountType.value || ''
  const e = newAccount.email || ''
  if (!e) return
  const dom = e.split('@')[1]
  if (d.includes('Gmail')) {
    if (!newAccount.imapHost) newAccount.imapHost = 'imap.gmail.com'
    if (!newAccount.imapPort) newAccount.imapPort = 993
    if (!newAccount.smtpHost) newAccount.smtpHost = 'smtp.gmail.com'
    if (!newAccount.smtpPort) newAccount.smtpPort = 465
  } else if (d.includes('Outlook') || d.includes('Office')) {
    if (!newAccount.imapHost) newAccount.imapHost = 'outlook.office365.com'
    if (!newAccount.imapPort) newAccount.imapPort = 993
    if (!newAccount.smtpHost) newAccount.smtpHost = 'smtp.office365.com'
    if (!newAccount.smtpPort) newAccount.smtpPort = 587
    newAccount.smtpSsl = 'tls'
  } else if (d.includes('QQ')) {
    if (!newAccount.imapHost) newAccount.imapHost = 'imap.qq.com'
    if (!newAccount.imapPort) newAccount.imapPort = 993
    if (!newAccount.smtpHost) newAccount.smtpHost = 'smtp.qq.com'
    if (!newAccount.smtpPort) newAccount.smtpPort = 465
  } else if (dom) {
    // 企业邮箱：自动猜
    if (!newAccount.imapHost) newAccount.imapHost = 'imap.' + dom
    if (!newAccount.smtpHost) newAccount.smtpHost = 'smtp.' + dom
  }
})
const testConnection = async () => {
  testingConn.value = true
  await new Promise(r => setTimeout(r, 1500))
  testingConn.value = false
  ElMessage.success('✅ 连接测试成功（Mock）：SMTP/IMAP 握手正常 · TLS OK · 账号密码校验通过')
}
const saveNewAccount = async () => {
  if (!newAccount.email) return ElMessage.warning('请填写邮箱地址')
  if (!newAccount.password) return ElMessage.warning('请填写密码/授权码')
  savingNew.value = true
  await new Promise(r => setTimeout(r, 900))
  savingNew.value = false
  const id = 'A' + (accounts.value.length + 1).toString().padStart(2, '0')
  let type = '企业邮箱'
  if (detectedAccountType.value.includes('Gmail')) type = 'Gmail'
  else if (detectedAccountType.value.includes('Outlook') || detectedAccountType.value.includes('Office')) type = 'Outlook'
  else if (detectedAccountType.value.includes('QQ')) type = 'QQ邮箱'
  else if (detectedAccountType.value.includes('163')) type = '163邮箱'
  else if (detectedAccountType.value.includes('iCloud')) type = 'iCloud'
  accounts.value.push({
    id, type,
    host: newAccount.smtpHost || ('smtp.' + (newAccount.email.split('@')[1] || '')),
    username: newAccount.email,
    alias: newAccount.alias || newAccount.email.split('@')[0],
    status: 'ok',
    lastSync: new Date().toISOString().replace('T',' ').slice(0,16),
    unread: 0
  })
  activeAccountId.value = id
  addAccountVisible.value = false
  // 清空
  Object.assign(newAccount, { email:'', password:'', alias:'', imapHost:'', imapPort:993, imapSsl:'ssl', smtpHost:'', smtpPort:465, smtpSsl:'ssl' })
  ElMessage.success(`✅ 已绑定并启用新邮箱：${newAccount.alias || newAccount.email}`)
}
</script>

<style lang="scss" scoped>
.page-container { padding: 20px 24px 28px; }
.page-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.page-title { font-size: 22px; font-weight: 700; color: #0f172a; }
.page-subtitle { color: #64748b; margin-top: 4px; font-size: 13px; }
.page-actions { display: flex; gap: 10px; align-items: center; }

.stat-cards {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px;
  .stat-card {
    background: #fff; border-radius: 10px; padding: 16px 18px;
    border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 12px;
    cursor: pointer; transition: all 0.2s;
    &:hover { transform: translateY(-2px); box-shadow: 0 10px 20px -8px rgba(15,23,42,0.12); border-color: #cbd5e1; }
  }
  .stat-info { flex: 1; }
  .stat-label { color: #64748b; font-size: 13px; }
  .stat-value { font-size: 26px; font-weight: 700; color: #0f172a; margin: 4px 0 2px; }
  .stat-sub  { color: #94a3b8; font-size: 12px; }
  .stat-icon {
    width: 46px; height: 46px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 20px;
    &.blue   { background: linear-gradient(135deg,#2563eb,#3b82f6); }
    &.orange { background: linear-gradient(135deg,#f59e0b,#f97316); color:#fff; }
    &.green  { background: linear-gradient(135deg,#10b981,#059669); }
    &.cyan   { background: linear-gradient(135deg,#0ea5e9,#0891b2); }
  }
}

/* ========== 三栏主体 ========== */
.mail-body {
  display: grid; grid-template-columns: 260px 420px 1fr;
  gap: 14px;
  min-height: calc(100vh - 260px);
}
.mail-aside { display: flex; flex-direction: column; gap: 14px; }
.mail-aside-card {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;
}
.card-head { display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; margin-bottom: 8px; }
.card-title { font-weight: 600; color: #0f172a; font-size: 14px; }

.folder-list { display: flex; flex-direction: column; gap: 2px; }
.folder-item {
  display: flex; align-items: center; gap: 10px; padding: 9px 10px;
  border-radius: 6px; color: #334155; cursor: pointer; font-size: 14px;
  &:hover { background: #f1f5f9; }
  &.active { background: #eef2ff; color: #2563eb; font-weight: 600; }
  .fold-ic { color: #475569; &.yellow { color:#f59e0b;} &.green { color:#10b981;} &.red { color:#ef4444;} }
}

.cust-list { display: flex; flex-direction: column; gap: 8px; max-height: 340px; overflow: auto; }
.cust-item {
  display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 8px;
  cursor: pointer; border: 1px solid transparent; transition: all 0.15s;
  &:hover { background: #f8fafc; border-color: #e2e8f0; }
  &.active { background: #eff6ff; border-color: #bfdbfe; }
}
.cust-meta { flex: 1; min-width: 0; }
.cust-line1 { display: flex; align-items: center; gap: 6px; }
.cust-name { font-weight: 600; color: #0f172a; max-width: 100px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cust-line2 { color: #94a3b8; font-size: 12px; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ========== 邮件列表中栏 ========== */
.mail-list-panel {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
  display: flex; flex-direction: column; overflow: hidden;
}
.list-toolbar {
  padding: 10px 14px; border-bottom: 1px solid #f1f5f9;
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
  flex-wrap: wrap;
}
.lt-left, .lt-right { display: flex; align-items: center; gap: 6px; }

.mail-list { flex: 1; overflow: auto; }
.mail-row {
  display: grid;
  grid-template-columns: 28px 30px 28px 44px 110px 1fr 72px;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: #f8fafc; }
  &.selected { background: #eff6ff; border-left: 3px solid #2563eb; padding-left: 9px; }
  &.unread {
    background: #fff;
    .row-sender, .row-subject .subj-text { font-weight: 700; color: #0f172a; }
  }
}
.row-check { text-align: center; }
.row-star { text-align: center; .yellow { color: #f59e0b; } }
.row-imp { text-align: center; &.red { color:#ef4444;} &.phantom { color: transparent; } }
.row-avatar { }
.row-sender { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #334155; font-size: 14px; }
.row-subject {
  display: flex; flex-direction: column; min-width: 0;
  .subj-text {
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #334155; font-size: 14px;
  }
  .row-att { color: #94a3b8; margin-left: 4px; vertical-align: -2px; }
  .row-preview {
    font-size: 12px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    margin-top: 2px;
  }
}
.row-time { font-size: 12px; color: #64748b; text-align: right; }

/* ========== 邮件阅读右栏 ========== */
.mail-read-panel {
  background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 18px 20px 20px;
  display: flex; flex-direction: column; gap: 14px;
  overflow: auto;
  &.mail-read-empty { justify-content: center; align-items: center; }
}
.read-head { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.subject-line { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.subj { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }

.read-meta {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 14px 16px; background: #f8fafc; border-radius: 8px;
  flex-wrap: wrap; gap: 10px;
}
.rm-left { display: flex; align-items: center; gap: 12px; }
.rm-info { .rm-from { font-size: 14px; } .rm-to { color: #64748b; font-size: 12px; margin-top: 3px; } }
.rm-right { text-align: right; }
.rm-time { color: #64748b; font-size: 12px; margin-bottom: 8px; }
.rm-actions { display: flex; gap: 6px; flex-wrap: wrap; }

.mail-body-text {
  padding: 14px 4px;
  line-height: 1.8; color: #1e293b; font-size: 14px;
  border-top: 1px dashed #e2e8f0;
  border-bottom: 1px dashed #e2e8f0;
  word-break: break-word;
  :deep(pre) { background: #f1f5f9; padding: 10px; overflow: auto; font-size: 12px; border-radius: 4px; }
  :deep(ul) { padding-left: 22px; }
}

/* 对话时间轴 */
.thread-wrap { margin-top: 4px; }
.thread-card {
  border: 1px solid #e2e8f0 !important;
  &.inbox { border-left: 4px solid #2563eb !important; }
  &.outbox { border-left: 4px solid #10b981 !important; }
  .thread-head { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .thread-subj { font-weight: 600; color: #0f172a; margin: 4px 0; }
  .thread-preview { color: #64748b; font-size: 13px; }
}

/* 快速回复 */
.quick-reply {
  background: #f8fafc; border-radius: 8px; padding: 4px 12px 12px;
  border: 1px dashed #cbd5e1;
}
.quick-reply-body { margin-top: 8px; }

/* ========== 写邮件抽屉 ========== */
.compose-form {
  padding: 0 8px 24px;
  display: flex; flex-direction: column; gap: 12px;
}
.cf-row {
  display: flex; align-items: center; gap: 10px;
  label {
    width: 90px; text-align: right; color: #475569; flex-shrink: 0;
  }
  &.cf-body { align-items: flex-start; label { padding-top: 10px; } }
}
.editor-wrap {
  border: 1px solid #dcdfe6; border-radius: 6px; overflow: hidden;
  display: flex; flex-direction: column;
}
.editor-toolbar {
  padding: 6px 10px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
}
.attach-pills { padding: 8px 10px; background: #fff; border-bottom: 1px solid #f1f5f9; }
</style>
