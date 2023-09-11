<script setup lang="ts">
import { getConsultOrderPre, createConsultOrder } from '@/services/consult'
import { getPatientDetail } from '@/services/user'
import { useConsultStore } from '@/stores'
import type { ConsultOrderPreData } from '@/types/consult'
import type { Patient } from '@/types/user'
import { showConfirmDialog, showToast } from 'vant'
import { onMounted, ref } from 'vue'

const store = useConsultStore()

// 获取支付信息
const payInfo = ref<ConsultOrderPreData>()
const loadData = async () => {
  const res = await getConsultOrderPre({
    type: store.consult.type,
    illnessType: store.consult.illnessType
  })
  payInfo.value = res.data
  // 设置默认优惠券
  store.setCoupon(payInfo.value.couponId)
}
// 获取患者信息
const patient = ref<Patient>()
const loadPatient = async () => {
  if (!store.consult.patientId) return
  const res = await getPatientDetail(store.consult.patientId)
  patient.value = res.data
}

onMounted(() => {
  // 防止在当前页面刷新，问诊记录已经清空，组件初始化需要校验
  if (
    !store.consult.type ||
    !store.consult.illnessDesc ||
    !store.consult.illnessTime ||
    !store.consult.patientId ||
    !store.consult.depId
  ) {
    return showConfirmDialog({
      title: '温馨提示',
      message: '问诊信息不完整请重新填写，如有未支付的问诊订单可在问诊记录中继续支付',
      closeOnPopstate: false
    }).then(() => {
      router.push('/')
    })
  }
  // 获取数据
  loadData()
  loadPatient()
})

// 支付协议是否勾选
const agree = ref(false)
// 选项支付抽屉显示隐藏
const show = ref(false)
// 按钮是否显示为加载状态
const loading = ref(false)
// 本次支付的订单id
const orderId = ref('')
// 外层立即支付生成订单id
const submit = async () => {
  if (!agree.value) return showToast('请勾选我已同意支付协议')
  // 按钮加载状态
  loading.value = true
  // 将信息发送给后台获取订单id
  const res = await createConsultOrder(store.consult)
  // id赋值给变量
  orderId.value = res.data.id
  // 打开弹窗
  show.value = true
  // 按钮加载状态结束
  loading.value = false
  // 清空pinia内的问诊信息
  store.clear()
}
//在离开当前路由时判断是否已经生成订单了，如果生成有订单就禁止离开
import { onBeforeRouteLeave, useRouter } from 'vue-router'
onBeforeRouteLeave(() => {
  if (orderId.value) return false
})
//生成订单后不可关闭支付抽屉
const router = useRouter()
// 关闭支付弹窗时的回调
const onClose = () => {
  return showConfirmDialog({
    title: '关闭支付',
    message: '取消支付将无法获得医生回复，医生接诊名额有限，是否确认关闭？',
    cancelButtonText: '仍要关闭',
    confirmButtonText: '继续支付',
    confirmButtonColor: 'var(--cp-primary)'
  })
    .then(() => {
      return false
    })
    .catch(() => {
      orderId.value = ''
      router.push('/user/consult')
      return true
    })
}
</script>

<template>
  <div class="consult-pay-page" v-if="payInfo">
    <cp-nav-bar title="支付" />
    <div class="pay-info">
      <p class="tit">图文问诊 {{ payInfo?.payment }} 元</p>
      <img class="img" src="@/assets/avatar-doctor.svg" />
      <p class="desc">
        <span>极速问诊</span>
        <span>自动分配医生</span>
      </p>
    </div>
    <van-cell-group>
      <van-cell title="优惠券" :value="`-¥${payInfo?.couponDeduction}`" />
      <van-cell title="积分抵扣" :value="`-¥${payInfo?.pointDeduction}`" />
      <van-cell title="实付款" :value="`¥${payInfo?.actualPayment}`" class="pay-price" />
    </van-cell-group>
    <div class="pay-space"></div>
    <van-cell-group>
      <van-cell title="患者信息" :value="`${patient?.name} | ${patient?.genderValue} | ${patient?.age}岁`"></van-cell>
      <van-cell title="病情描述" label="头痛，头晕，恶心"></van-cell>
    </van-cell-group>
    <div class="pay-schema">
      <van-checkbox v-model="agree">我已同意 <span class="text">支付协议</span></van-checkbox>
    </div>
    <van-submit-bar
      button-type="primary"
      :price="payInfo?.actualPayment * 100"
      button-text="立即支付"
      text-align="left"
      :loading="loading"
      @click="submit"
    />
  </div>
  <cp-pay-sheet
    payCallback="http://localhost:5173/room"
    v-model:show="show"
    :order-id="orderId"
    :actualPayment="payInfo?.actualPayment!"
    :onClose="onClose"
  />
</template>

<style lang="scss" scoped>
.consult-pay-page {
  padding: 46px 0 50px 0;
  .pay-info {
    display: flex;
    padding: 15px;
    flex-wrap: wrap;
    align-items: center;
    .tit {
      width: 100%;
      font-size: 16px;
      margin-bottom: 10px;
    }
    .img {
      margin-right: 10px;
      width: 38px;
      height: 38px;
      border-radius: 4px;
      overflow: hidden;
    }
    .desc {
      flex: 1;
      > span {
        display: block;
        color: var(--cp-tag);
        &:first-child {
          font-size: 16px;
          color: var(--cp-text2);
        }
      }
    }
  }
  .pay-price {
    ::v-deep() {
      .vam-cell__title {
        font-size: 16px;
      }
      .van-cell__value {
        font-size: 16px;
        color: var(--cp-price);
      }
    }
  }
  .pay-space {
    height: 12px;
    background-color: var(--cp-bg);
  }
  .pay-schema {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    .text {
      color: var(--cp-primary);
    }
  }
  ::v-deep() {
    .van-submit-bar__button {
      font-weight: normal;
      width: 160px;
    }
  }
}
</style>
