import type { KnowledgePage, KnowledgeParams, DoctorPage, PageParams, FollowType } from '@/types/consult'
import { request } from '@/utils/request'

// 获取文章列表接口
export const getKnowledgePage = (params: KnowledgeParams) =>
  request<KnowledgePage>('/patient/home/knowledge', 'GET', params)
// 获取推荐关注医生
export const getDoctorPage = (params: PageParams) => request<DoctorPage>('/home/page/doc', 'GET', params)
// 关注医生接口
export const followDoctor = (id: string, type: FollowType = 'doc') => request('/like', 'POST', { id, type })
