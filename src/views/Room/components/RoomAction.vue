<script setup lang="ts">
import { ref } from 'vue'
defineProps<{
  disabled: boolean
}>()
const emit = defineEmits<{
  (e: 'send-text', text: string): void
  (e: 'send-image', img: Image): void
}>()
const text = ref('')
// 发送消息
const sendText = () => {
  emit('send-text', text.value)
  text.value = ''
}

// 发送图片
import { uploadImage } from '@/services/consult'
import type { Image } from '@/types/consult'
import { showToast, closeToast } from 'vant'
import type { UploaderAfterRead } from 'vant/lib/uploader/types'
const sendImage: UploaderAfterRead = async (data) => {
  // 如果是数组立马返回
  if (Array.isArray(data)) return
  // 判断有没有文件
  if (!data.file) return
  showToast({ type: 'loading', message: '正在上传' })
  // api创建formData并添加发送转为在线链接和图片id
  const res = await uploadImage(data.file)
  closeToast()
  //将链接和id给父组件发给socket.io
  emit('send-image', res.data)
}
</script>

<template>
  <div class="room-action">
    <van-field
      :disabled="disabled"
      v-model="text"
      type="text"
      class="input"
      :border="false"
      placeholder="问医生"
      autocomplete="off"
      @keyup.enter="sendText"
    ></van-field>
    <!-- 在上传完成后不展示预览图 -->
    <van-uploader :preview-image="false" :disabled="disabled" :after-read="sendImage">
      <cp-icon name="consult-img" />
    </van-uploader>
  </div>
</template>

<style lang="scss" scoped>
.room-action {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 60px;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  z-index: 1;
  box-sizing: border-box;

  .input {
    background-color: var(--cp-bg);
    border: none;
    border-radius: 25px;
    margin-right: 10px;
    padding: 8px 15px;
  }

  .cp-icon {
    width: 24px;
    height: 24px;
  }
}
</style>
