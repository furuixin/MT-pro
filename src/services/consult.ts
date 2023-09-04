import type {
  KnowledgePage,
  KnowledgeParams,
  DoctorPage,
  PageParams,
  FollowType,
  TopDep,
  Image,
  ConsultOrderPreData,
  ConsultOrderPreParams,
  PartialConsult
} from '@/types/consult'
import { request } from '@/utils/request'

// 获取文章列表接口
export const getKnowledgePage = (params: KnowledgeParams) =>
  request<KnowledgePage>('/patient/home/knowledge', 'GET', params)
// 获取推荐关注医生
export const getDoctorPage = (params: PageParams) => request<DoctorPage>('/home/page/doc', 'GET', params)
// 关注医生接口
export const followDoctor = (id: string, type: FollowType = 'doc') => request('/like', 'POST', { id, type })

// 极速问诊选择科室
export const getAllDep = () => request<TopDep[]>('/dep/all')
// 病情描述图片上传
export const uploadImage = (file: File) => {
  const fd = new FormData()
  fd.append('file', file)
  return request<Image>('/upload', 'POST', fd)
}
// 拉取预支付订单信息
export const getConsultOrderPre = (params: ConsultOrderPreParams) =>
  request<ConsultOrderPreData>('/patient/consult/order/pre', 'GET', params)

// 生成订单
export const createConsultOrder = (data: PartialConsult) =>
  request<{ id: string }>('/patient/consult/order', 'POST', data)

// 获取支付地址  0 是微信  1 支付宝
export const getConsultOrderPayUrl = (params: { paymentMethod: 0 | 1; orderId: string; payCallback: string }) =>
  request<{ payUrl: string }>('/patient/consult/pay', 'POST', params)
