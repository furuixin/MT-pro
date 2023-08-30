<script setup lang="ts">
import KnowledgeCard from './KnowledgeCard.vue'
import { getKnowledgePage } from '@/services/consult'
import type { KnowledgeList, KnowledgeParams, KnowledgeType } from '@/types/consult'

import { ref } from 'vue'

const props = defineProps<{
  type: KnowledgeType
}>()

// 控制本次加载是否完成
const loading = ref(false)
// 控制全部数据是否加载完成，true就不在触发加载
const finished = ref(false)
const list = ref<KnowledgeList>([])
const params = ref<KnowledgeParams>({
  // 父页面传下来的类型，决定请求推荐还是关注...的数据
  type: props.type,
  current: 1,
  pageSize: 10
})
const onLoad = async () => {
  // 获取数据
  const res = await getKnowledgePage(params.value)
  // 添加获取的数据
  list.value.push(...res.data.rows)
  // 如果本地的页码大于等于服务器的页码(最多有多少页)
  if (params.value.current >= res.data.pageTotal) {
    // 关闭上拉加载功能
    finished.value = true
  } else {
    // 如果服务器还有更多页面数据，本地的页码属性+1用来下次请求
    params.value.current++
  }
  // 结束本次获取
  loading.value = false
}
</script>

<template>
  <div class="knowledge-list">
    <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <knowledge-card v-for="item in list" :key="item.id" :item="item" />
    </van-list>
  </div>
</template>

<style lang="scss" scoped>
.knowledge-list {
  padding: 0 15px;
}
</style>
