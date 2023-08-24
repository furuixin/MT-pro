import { useUserStore } from '@/stores'
import router from '@/router'
import axios from 'axios'
import { Toast } from 'vant'

// 1. 新axios实例，基础配置
const baseURL = 'https://consult-api.itheima.net/'
const instance = axios.create({
  baseURL,
  timeout: 10000
})

// 2. 请求拦截器，携带token
instance.interceptors.request.use(
  (config) => {
    // 模块中store可能还没初始化,所以使用useXxxStore函数
    const store = useUserStore()
    // 如果user模块中有token，并且config.headers 对象可能为空或未定义
    // 在某些情况下，config.headers 对象可能为空或未定义，如果直接尝试给不存在的属性赋值会导致错误。
    if (store.user?.token && config.headers) {
      // 给token赋值给请求头的Authorization字段
      config.headers['Authorization'] = `Bearer ${store.user?.token}`
    }
    return config
  },
  (err) => Promise.reject(err)
)

// 3. 响应拦截器，剥离无效数据，401拦截
instance.interceptors.response.use(
  (res) => {
    // 后台约定，响应成功，但是code不是10000，是业务逻辑失败
    if (res.data?.code !== 10000) {
      // Vant的Toast组件实际上是一个类（Class），通过使用new关键字创建实例对象才可以调用该类中定义的方法和属性。
      new Toast(res.data?.message)
      return Promise.reject(res.data)
    }
    // 业务逻辑成功(响应成功，且后台业务操作完毕)，返回响应数据，作为axios成功的结果
    return res.data
  },
  (err) => {
    // 401表示权限认证未通过,也就是登录过期
    if (err.response.status === 401) {
      // 删除用户信息
      const store = useUserStore()
      store.delUser()
      // 跳转登录，带上接口失效所在页面的地址，登录完成后回跳使用
      router.push(`/login?returnUrl=${router.currentRoute.value.fullPath}`)
    }
    return Promise.reject(err)
  }
)

//  导出baseURL的目的是其他模块可能需要使用
export { baseURL, instance }
