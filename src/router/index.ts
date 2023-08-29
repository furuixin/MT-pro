import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: '登录',
      component: () => import('@/views/Login/index.vue')
    },
    {
      path: '/',
      component: () => import('@/views/Layout/index.vue'),
      redirect: '/home',
      children: [
        { path: '/home', component: () => import('@/views/Home/index.vue'), meta: { title: '首页' } },
        { path: '/article', component: () => import('@/views/Article/index.vue'), meta: { title: '健康百科' } },
        { path: '/notify', component: () => import('@/views/Notify/index.vue'), meta: { title: '消息通知' } },
        { path: '/user', component: () => import('@/views/User/index.vue'), meta: { title: '个人中心' } }
      ]
    },
    { path: '/order', component: () => import('@/views/Order/index.vue'), meta: { title: '订单' } },
    {
      path: '/register',
      name: '注册',
      component: () => import('@/views/Register/index.vue')
    }
  ]
})

export default router
