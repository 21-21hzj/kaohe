import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout/Index.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/customer/lead-pool',
    children: [
      // ========== 板块一：客户管理 ==========
      {
        path: '/customer/lead-pool',
        name: 'LeadPool',
        component: () => import('@/views/customer/LeadPool.vue'),
        meta: { title: '检索池', module: 'customer' }
      },
      {
        path: '/customer/customer-pool',
        name: 'CustomerPool',
        component: () => import('@/views/customer/CustomerPool.vue'),
        meta: { title: '客户池', module: 'customer' }
      },
      {
        path: '/customer/customer-profile',
        name: 'CustomerProfile',
        component: () => import('@/views/customer/CustomerProfile.vue'),
        meta: { title: '客户档案', module: 'customer' }
      },
      {
        path: '/customer/opportunity',
        name: 'Opportunity',
        component: () => import('@/views/customer/Opportunity.vue'),
        meta: { title: '商机管理', module: 'customer' }
      },
      {
        path: '/customer/schedule',
        name: 'Schedule',
        component: () => import('@/views/customer/Schedule.vue'),
        meta: { title: '日程管理', module: 'customer' }
      },

      // ========== 板块二：客户开发（占位） ==========
      {
        path: '/dev/auto',
        name: 'DevAuto',
        component: () => import('@/views/placeholder/Placeholder.vue'),
        meta: { title: '自动开发', module: 'dev' }
      },
      {
        path: '/dev/semi-auto',
        name: 'DevSemiAuto',
        component: () => import('@/views/placeholder/Placeholder.vue'),
        meta: { title: '半自动开发', module: 'dev' }
      },
      {
        path: '/dev/kp',
        name: 'DevKp',
        component: () => import('@/views/placeholder/Placeholder.vue'),
        meta: { title: 'KP', module: 'dev' }
      },
      {
        path: '/dev/whatsapp',
        name: 'DevWhatsApp',
        component: () => import('@/views/placeholder/Placeholder.vue'),
        meta: { title: 'WhatsApp', module: 'dev' }
      },
      {
        path: '/dev/social-direct',
        name: 'DevSocialDirect',
        component: () => import('@/views/placeholder/Placeholder.vue'),
        meta: { title: '社媒直通车', module: 'dev' }
      },
      {
        path: '/dev/customs',
        name: 'DevCustoms',
        component: () => import('@/views/placeholder/Placeholder.vue'),
        meta: { title: '海关数据开发器', module: 'dev' }
      },
      {
        path: '/dev/social-helper',
        name: 'DevSocialHelper',
        component: () => import('@/views/placeholder/Placeholder.vue'),
        meta: { title: '社媒助手', module: 'dev' }
      },

      // ========== 板块三：邮件中心 ==========
      {
        path: '/email/common',
        name: 'EmailCommon',
        component: () => import('@/views/email/CommonMail.vue'),
        meta: { title: '普邮管理', module: 'email' }
      },
      {
        path: '/email/tracking',
        name: 'EmailTracking',
        component: () => import('@/views/email/MailTracking.vue'),
        meta: { title: '邮件追踪', module: 'email' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
