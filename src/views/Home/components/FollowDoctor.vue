<script setup lang="ts">
import DoctorCard from './DoctorCard.vue'
// import { onMounted, onUnmounted, ref } from 'vue'
// // 设置宽度
// const width = ref(0)
// // 宽度等于页面宽度
// const setWidth = () => {
//   width.value = window.innerWidth
// }
// // 组件挂载到DOM后，在setup()函数执行之后执行
// onMounted(() => {
//   setWidth()
//   // 只要窗口大小发生像素变化就会触发，resize是事件类型,如click或mousedown
//   window.addEventListener('resize', setWidth)
// })
// // 组件被销毁之前执行
// onUnmounted(() => {
//   // 移出事件监听
//   window.removeEventListener('resize', setWidth)
// })

import { useWindowSize } from '@vueuse/core'
const { width } = useWindowSize()
</script>

<template>
  <div class="follow-doctor">
    <div className="head">
      <p>推荐关注</p>
      <a href="javascript:;"> 查看更多<i class="van-icon van-icon-arrow" /></a>
    </div>
    <div class="body">
      <!-- 设置单个滑块的宽度为固定屏幕比例，去除指示器原点，关闭循环滚动 -->
      <van-swipe :width="width" :show-indicators="false" :loop="false">
        <van-swipe-item v-for="item in 5" :key="item">
          <doctor-card />
        </van-swipe-item>
      </van-swipe>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.follow-doctor {
  background-color: var(--cp-bg);
  height: 250px;
  .head {
    display: flex;
    justify-content: space-between;
    height: 45px;
    align-items: center;
    padding: 0 15px;
    font-size: 13px;
    > a {
      color: var(--cp-tip);
    }
  }
  .body {
    width: 100%;
    overflow: hidden;
  }
}
</style>
