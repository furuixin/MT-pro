import { ref } from 'vue'

// 封装关注逻辑，规范 useXxx，表示使用某功能
import { followDoctor } from '@/services/consult'
import type { FollowType } from '@/types/consult'
export const useFollow = (type: FollowType = 'doc') => {
  const loading = ref(false)
  // {a, b} 类型，传值得时候 {a, b, c} 也可以，这是类型兼容：多的可以给少的
  const follow = async (obj: { id: string; likeFlag: 0 | 1 }) => {
    loading.value = true
    try {
      await followDoctor(obj.id, type)
      obj.likeFlag = obj.likeFlag === 1 ? 0 : 1
    } finally {
      loading.value = false
    }
  }
  return { loading, follow }
}

// 封装查看处方逻辑
import { showImagePreview } from 'vant'
import { getPrescriptionPic } from '@/services/consult'
export const useShowPrescription = () => {
  const showPrescription = async (id?: string) => {
    if (id) {
      const res = await getPrescriptionPic(id)
      showImagePreview([res.data.url])
    }
  }
  return { showPrescription }
}

// 封装取消订单逻辑
import { showToast } from 'vant'
import { OrderType } from '@/enums'
import { cancelOrder } from '@/services/consult'
import type { ConsultOrderItem } from '@/types/consult'
export const useCancelOrder = () => {
  const loading = ref(false)
  const cancelConsultOrder = (item: ConsultOrderItem) => {
    loading.value = true
    cancelOrder(item.id)
      .then(() => {
        item.status = OrderType.ConsultCancel
        item.statusValue = '已取消'
        showToast({ type: 'success', message: '取消成功' })
      })
      .catch(() => {
        showToast({ message: '取消失败', type: 'fail' })
      })
      .finally(() => {
        loading.value = false
      })
  }
  return { loading, cancelConsultOrder }
}

// 封装删除订单逻辑
import { deleteOrder } from '@/services/consult'
export const useDeleteOrder = (cb: () => void) => {
  const deleteLoading = ref(false)
  const deleteConsultOrder = async (item: ConsultOrderItem) => {
    deleteLoading.value = true
    try {
      await deleteOrder(item.id)
      cb && cb()
      showToast({ type: 'success', message: '删除成功' })
    } catch {
      showToast({ type: 'fail', message: '删除失败' })
    } finally {
      deleteLoading.value = false
    }
  }
  return { deleteLoading, deleteConsultOrder }
}
