<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
// 支付方式
const paymentMethod = ref<0 | 1>()

// 接收父组件给的订单id，显示隐藏，订单价格，关闭回调
const props = defineProps<{
  show: boolean
  orderId: string
  actualPayment: number
  onClose?: () => void
}>()

// 提醒父组件更新show的状态
const emit = defineEmits<{
  (e: 'update:show', val: boolean): void
}>()

// 跳转支付
import { getConsultOrderPayUrl } from '@/services/consult'
const pay = async () => {
  if (paymentMethod.value === undefined) return showToast('请选择支付方式')
  showToast({ type: 'loading', message: '跳转支付' })
  // 将订单id和选择的支付方式以及回跳地址发送给后端
  const res = await getConsultOrderPayUrl({
    orderId: props.orderId,
    paymentMethod: paymentMethod.value,
    payCallback: 'http://localhost:5173/room'
  })
  // 调转到支付页面
  window.location.href = res.data.payUrl
}
</script>

<template>
  <van-action-sheet
    :show="show"
    title="选择支付方式"
    :close-on-popstate="false"
    :closeable="false"
    :before-close="onClose"
    @update:show="emit('update:show', $event)"
  >
    <div class="pay-type">
      <p class="amount">￥{{ actualPayment.toFixed(2) }}</p>
      <van-cell-group>
        <van-cell title="微信支付" @click="paymentMethod = 0">
          <template #icon><cp-icon name="consult-wechat" /></template>
          <template #extra><van-checkbox :checked="paymentMethod === 0" /></template>
        </van-cell>
        <van-cell title="支付宝支付" @click="paymentMethod = 1">
          <template #icon><cp-icon name="consult-alipay" /></template>
          <template #extra><van-checkbox :checked="paymentMethod === 1" /></template>
        </van-cell>
      </van-cell-group>
      <div class="btn">
        <van-button type="primary" round block @click="pay">立即支付</van-button>
      </div>
    </div>
  </van-action-sheet>
</template>

<style lang="scss" scoped>
.pay-type {
  .amount {
    padding: 20px;
    text-align: center;
    font-size: 16px;
    font-weight: bold;
  }
  .btn {
    padding: 15px;
  }
  .van-cell {
    align-items: center;
    .cp-icon {
      margin-right: 10px;
      font-size: 18px;
    }
    .van-checkbox :deep(.van-checkbox__icon) {
      font-size: 16px;
    }
  }
}
</style>
