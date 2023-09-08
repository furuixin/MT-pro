<script setup lang="ts">
import RoomStatus from './components/RoomStatus.vue'
import RoomAction from './components/RoomAction.vue'
import RoomMessage from './components/RoomMessage.vue'

import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'
import { onMounted, onUnmounted } from 'vue'
import { useUserStore } from '@/stores'
import { useRoute } from 'vue-router'

const store = useUserStore()
const route = useRoute()

import { ref, nextTick } from 'vue'
// 消息类型
import { MsgType, OrderType } from '@/enums'
// 消息规范和消息分组列表
import type { Message, TimeMessages } from '@/types/room'
// 聊天记录
const list = ref<Message[]>([])

// 规定socket的类型
let socket: Socket
// 组件挂载后进行socket连接
onMounted(async () => {
  // 建立链接，创建 socket.io 实例并定义接收事件
  socket = io('https://consult-api.itheima.net', {
    auth: {
      token: `Bearer ${store.user?.token}`
    },
    query: {
      orderId: route.query.orderId
    }
  })

  // 建立连接成功
  socket.on('connect', () => {
    // 断开连接后再次连接，清空聊天记录
    list.value = []
  })
  // 获取聊天记录
  const initialMsg = ref(true)
  socket.on('chatMsgList', ({ data }: { data: TimeMessages[] }) => {
    // 准备转换常规消息列表
    const arr: Message[] = []
    data.forEach((item, i) => {
      if (i === 0) time.value = item.createTime
      arr.push({
        msgType: MsgType.Notify,
        msg: { content: item.createTime },
        createTime: item.createTime,
        id: item.createTime
      })
      arr.push(...item.items)
    })
    // 追加到聊天消息列表
    list.value.unshift(...arr)
    // 关闭加载状态
    loading.value = false
    // 没有数据就提示
    if (!data.length) {
      return showToast('没有聊天记录了')
    }
    nextTick(() => {
      if (initialMsg.value) {
        // 已读最后一条
        socket.emit('updateMsgStatus', arr[arr.length - 1].id)
        window.scrollTo(0, document.body.scrollHeight)
        initialMsg.value = false
      }
    })
  })

  // 订单状态改变
  socket.on('statusChange', async () => {
    const res = await getConsultOrderDetail(route.query.orderId as string)
    consult.value = res.data
  })

  // 接收消息
  socket.on('receiveChatMsg', async (event) => {
    list.value.push(event)
    await nextTick()
    // 发送消息说已经读过了,最后一条已读之前所有消息即使已读
    socket.emit('updateMsgStatus', event.id)
    window.scrollTo(0, document.body.scrollHeight)
  })

  // 错误异常消息
  socket.on('error', (event) => {
    console.log('error', event)
  })

  // 已经断开连接
  socket.on('disconnect', () => {
    console.log('disconnect')
  })
})

// 获取订单状态
import type { ConsultOrderItem } from '@/types/consult'
import { getConsultOrderDetail } from '@/services/consult'
const consult = ref<ConsultOrderItem>()
// 在setup里生命周期可以写多次
onMounted(async () => {
  const res = await getConsultOrderDetail(route.query.orderId as string)
  consult.value = res.data
})

// 发送消息
const sendText = (text: string) => {
  // 发送信息需要  发送人  收消息人  消息类型  消息内容
  socket.emit('sendChatMsg', {
    from: store.user?.id,
    to: consult.value?.docInfo?.id,
    msgType: MsgType.MsgText,
    msg: { content: text }
  })
}

// 发送图片
import type { Image } from '@/types/consult'
const sendImage = (img: Image) => {
  socket.emit('sendChatMsg', {
    // 谁发的:用户id
    from: store.user?.id,
    // 发给谁:订单信息内的医生id
    to: consult.value?.docInfo?.id,
    // 聊天类型
    msgType: MsgType.MsgImage,
    // 消息内容:图片
    msg: { picture: img }
  })
}

// 下拉刷新
const loading = ref(false)
import dayjs from 'dayjs'
import { showToast } from 'vant'
const time = ref(dayjs().format('YYYY-MM-DD HH:mm:ss'))
// 触发下拉,获取聊天记录
const onRefresh = () => {
  socket.emit('getChatMsgList', 20, time.value, route.query.orderId)
}

// 注入订单信息：提供医生ID和订单ID
import { provide } from 'vue'
// provide:祖先组件向其所有子孙后代注入一个依赖，不论组件层次有多深。
provide('consult', consult)

// 评价成功后修改星级
const completeEva = (score: number) => {
  // 找到评价的信息
  const item = list.value.find((item) => item.msgType === MsgType.CardEvaForm)
  if (item) {
    // 修改评价星级
    item.msg.evaluateDoc = { score }
    // 修改评价类型为已评价
    item.msgType = MsgType.CardEva
  }
}
// 将事件传给子孙组件用来获得参数
provide('completeEva', completeEva)

// 页面卸载前关闭连接
onUnmounted(() => {
  socket.close()
})
</script>

<template>
  <div class="room-page">
    <cp-nav-bar title="医生问诊室" />
    <room-status :status="consult?.status" :countdown="consult?.countdown" />
    <van-pull-refresh v-model="loading" @refresh="onRefresh">
      <room-message :list="list" />
    </van-pull-refresh>
    <room-action @send-text="sendText" @send-image="sendImage" :disabled="consult?.status !== OrderType.ConsultChat" />
  </div>
</template>

<style lang="scss" scoped>
.room-page {
  padding-top: 90px;
  padding-bottom: 60px;
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--cp-bg);

  .van-pull-refresh {
    width: 100%;
    min-height: calc(100vh - 150px);
  }
}
</style>
