<template>
  <el-container class="layout-container">
    <!-- 左侧导航 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="layout-aside">
      <div class="logo-wrap">
        <div class="logo-icon">CR</div>
        <div v-show="!isCollapse" class="logo-text">CRM 管理系统</div>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#1e293b"
        text-color="#cbd5e1"
        active-text-color="#ffffff"
        router
        class="layout-menu"
      >
        <!-- 板块一：客户管理 -->
        <el-sub-menu index="customer" class="menu-group">
          <template #title>
            <el-icon><User /></el-icon>
            <span>板块一 · 客户管理</span>
          </template>
          <el-menu-item index="/customer/lead-pool">
            <el-icon><Search /></el-icon>
            <span>检索池</span>
          </el-menu-item>
          <el-menu-item index="/customer/customer-pool">
            <el-icon><Files /></el-icon>
            <span>客户池</span>
          </el-menu-item>
          <el-menu-item index="/customer/customer-profile">
            <el-icon><Postcard /></el-icon>
            <span>客户档案</span>
          </el-menu-item>
          <el-menu-item index="/customer/opportunity">
            <el-icon><Medal /></el-icon>
            <span>商机管理</span>
          </el-menu-item>
          <el-menu-item index="/customer/schedule">
            <el-icon><Calendar /></el-icon>
            <span>日程管理</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 板块二：客户开发 -->
        <el-sub-menu index="dev" class="menu-group">
          <template #title>
            <el-icon><Promotion /></el-icon>
            <span>板块二 · 客户开发</span>
          </template>
          <el-menu-item index="/dev/auto">
            <el-icon><MagicStick /></el-icon>
            <span>自动开发</span>
          </el-menu-item>
          <el-menu-item index="/dev/semi-auto">
            <el-icon><Cpu /></el-icon>
            <span>半自动开发</span>
          </el-menu-item>
          <el-menu-item index="/dev/kp">
            <el-icon><Key /></el-icon>
            <span>KP</span>
          </el-menu-item>
          <el-menu-item index="/dev/whatsapp">
            <el-icon><ChatDotRound /></el-icon>
            <span>WhatsApp</span>
          </el-menu-item>
          <el-menu-item index="/dev/social-direct">
            <el-icon><Connection /></el-icon>
            <span>社媒直通车</span>
          </el-menu-item>
          <el-menu-item index="/dev/customs">
            <el-icon><DataAnalysis /></el-icon>
            <span>海关数据开发器</span>
          </el-menu-item>
          <el-menu-item index="/dev/social-helper">
            <el-icon><Service /></el-icon>
            <span>社媒助手</span>
          </el-menu-item>
        </el-sub-menu>

        <!-- 板块三：邮件中心 -->
        <el-sub-menu index="email" class="menu-group">
          <template #title>
            <el-icon><Message /></el-icon>
            <span>板块三 · 邮件中心</span>
          </template>
          <el-menu-item index="/email/common">
            <el-icon><EditPen /></el-icon>
            <span>普邮管理</span>
          </el-menu-item>
          <el-menu-item index="/email/tracking">
            <el-icon><View /></el-icon>
            <span>邮件追踪</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ moduleName }}</el-breadcrumb-item>
            <el-breadcrumb-item>{{ pageName }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="header-right">
          <el-tooltip content="全局搜索" placement="bottom">
            <el-icon class="header-icon"><Search /></el-icon>
          </el-tooltip>
          <el-tooltip content="通知消息" placement="bottom">
            <el-badge :value="5" :max="99" class="header-badge">
              <el-icon class="header-icon"><Bell /></el-icon>
            </el-badge>
          </el-tooltip>
          <el-dropdown>
            <div class="user-info">
              <el-avatar :size="32" style="background:#2563eb">张</el-avatar>
              <span class="user-name">张经理</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item><el-icon><Setting /></el-icon>系统设置</el-dropdown-item>
                <el-dropdown-item divided><el-icon><SwitchButton /></el-icon>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const moduleMap = {
  customer: '客户管理',
  dev: '客户开发',
  email: '邮件中心'
}

const moduleName = computed(() => moduleMap[route.meta.module] || '客户管理')
const pageName = computed(() => route.meta.title || '首页')
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.layout-aside {
  background: #1e293b;
  transition: width 0.25s;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .logo-wrap {
    height: 60px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0 18px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);

    .logo-icon {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
      flex-shrink: 0;
    }
    .logo-text {
      color: #fff;
      font-size: 16px;
      font-weight: 600;
      white-space: nowrap;
    }
  }

  /* ========= 菜单样式：完全使用 padding 控制内边距，避免 margin+calc 破坏定位参考系 ========= */
  .layout-menu {
    flex: 1;
    border-right: none;
    background: transparent;
    padding: 6px 0;

    /* 1) 菜单项 / 分组标题 —— 公共尺寸 + hover */
    :deep(.el-menu-item),
    :deep(.el-sub-menu__title) {
      height: 44px !important;
      line-height: 44px !important;
      padding: 0 18px !important;           /* 用 padding 而不是 margin 做内缩 */
      margin: 2px 8px !important;
      width: calc(100% - 16px) !important;
      max-width: calc(100% - 16px) !important;
      border-radius: 6px;
      box-sizing: border-box;
      overflow: hidden;
      display: flex !important;            /* 强制 flex，防止 Element 回落到 table-cell */
      align-items: center;
      position: relative;                  /* 给子级绝对定位做参考 */

      &:hover {
        background-color: #334155 !important;
      }

      /* 1.1) 图标固定 18px 宽，不许收缩 */
      > .el-icon,
      > [class^="el-icon-"] {
        width: 18px;
        flex: 0 0 18px;
        flex-shrink: 0;
        font-size: 17px;
        margin-right: 10px;
        display: inline-flex;
      }

      /* 1.2) 标题文字 —— 自动占满剩余宽度，超长省略号 */
      > span {
        flex: 1 1 auto;
        min-width: 0;                      /* 允许 flex-item 被 ellipsis 截断 */
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.2;
      }
    }

    /* 2) 分组标题 —— 右侧单独给箭头预留 30px 占位 padding */
    :deep(.el-sub-menu__title) {
      padding-right: 38px !important;      /* 30px 箭头 + 8px 间距 */

      /* 2.1) 图标/文字规则与上面共用，只补额外约束 */
      > .el-icon, > [class^="el-icon-"] { margin-right: 8px; }
      > span {
        max-width: none;
      }

      /* 2.2) 展开箭头 —— position:absolute 固定在最右侧 */
      :deep(.el-sub-menu__icon-arrow),
      .el-sub-menu__icon-arrow {
        position: absolute !important;
        right: 14px !important;
        left: auto !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        width: 12px;
        height: 12px;
        color: #94a3b8 !important;
        margin: 0 !important;
      }
    }

    /* 3) 激活态高亮 */
    :deep(.el-menu-item.is-active) {
      background-color: #2563eb !important;
      color: #fff !important;
    }

    /* 4) 子菜单项（分组展开后的二级）—— 更大的左缩进 */
    :deep(.el-sub-menu .el-menu-item) {
      padding-left: 48px !important;
      min-width: auto;
    }
  }
}

/* ========= 折叠态（64px）样式 —— 全部用 :deep 穿透到真实 DOM 节点，避免 scoped hash 让规则失效
   Element Plus 在折叠时给 ul.el-menu 添加 .el-menu--collapse 类 ==================== */
.layout-aside :deep(.el-menu--collapse) {
  width: 64px !important;

  > .el-menu-item,
  > .el-sub-menu > .el-sub-menu__title {
    width: 48px !important;
    max-width: 48px !important;
    padding: 0 !important;
    margin: 2px 8px !important;
    justify-content: center !important;
    align-items: center;
    overflow: hidden;
    line-height: 44px !important;
    display: flex !important;

    .el-icon,
    [class^="el-icon-"] {
      width: 18px !important;
      height: 18px !important;
      margin: 0 !important;
      flex: 0 0 18px !important;
    }

    > span {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
      overflow: hidden;
      visibility: hidden !important;
    }
  }

  /* 折叠态：不显示展开箭头，避免与唯一可见的图标叠在一起 */
  .el-sub-menu__icon-arrow {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    width: 0 !important;
    height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  /* 折叠态：子菜单（el-menu-item）也是 48px 宽 + 图标居中 */
  .el-menu-item,
  .el-sub-menu__title {
    width: 48px !important;
    max-width: 48px !important;
    padding: 0 !important;
    margin: 2px 8px !important;
    justify-content: center !important;
    overflow: hidden;
  }

  .el-sub-menu__title {
    padding-right: 0 !important;
  }
}

.layout-header {
  background: #fff;
  border-bottom: 1px solid var(--border-color);
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px !important;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .collapse-btn {
      font-size: 20px;
      cursor: pointer;
      color: var(--text-secondary);
      transition: color 0.2s;

      &:hover { color: var(--primary-color); }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 18px;

    .header-icon {
      font-size: 18px;
      color: var(--text-secondary);
      cursor: pointer;
      transition: color 0.2s;

      &:hover { color: var(--primary-color); }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      .user-name {
        font-size: 14px;
        color: var(--text-primary);
      }
      .el-icon {
        font-size: 12px;
        color: var(--text-secondary);
      }
    }
  }
}

.layout-main {
  padding: 0;
  background: var(--bg-main);
  overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
