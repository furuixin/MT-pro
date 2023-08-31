// 页面权限
// 当用户坐在未登录的情况, 如果访问的不是登录页或者注册页,或者404等页面, 则跳转到登录页面

import router from '@/router'
import { useUserStore } from '@/stores/user'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({
  showSpinner: false
})

// 白名单列表
const whiteList = ['/login', '/register', '/404', '/401']

router.beforeEach((to) => {
  NProgress.start()
  const store = useUserStore()
  // 如果没有token, 并且进入的页面也不是login/register/404/401等页面,则直接进入到登录页面
  if (!store.user?.token && !whiteList.includes(to.path)) return '/login'
  else if (store.user?.token && to.path === '/login') return '/'
})
router.afterEach((to) => {
  document.title = `优医问诊-${to.meta.title || ''}`
  NProgress.done()
})
