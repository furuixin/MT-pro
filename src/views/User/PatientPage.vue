<script setup lang="ts">
import { getPatientList } from '@/services/user'
import type { PatientList } from '@/types/user'
import { onMounted, ref } from 'vue'

// 1. 页面初始化加载数据
const list = ref<PatientList>([])
const loadList = async () => {
  const res = await getPatientList()
  list.value = res.data
}
onMounted(() => {
  loadList()
})

const show = ref(false)
const showPopup = () => {
  show.value = true
}
const gender = ref(1)
const options = [
  { label: '男', value: 1 },
  { label: '女', value: 0 }
]
</script>

<template>
  <div class="patient-page">
    <cpNavBar title="家庭档案"></cpNavBar>
    <div class="patient-list">
      <div class="patient-item" v-for="item in list" :key="item.id">
        <div class="info">
          <span class="name">{{ item.name }}</span>
          <!--
            点号表示任意字符
            (.{6}) 匹配第一个捕获组$1，
            (?:\d+) 表示匹配一个或多个数字，但不捕获它们，
            (.{4}) $匹配第二个捕获组$2
           -->
          <span class="id">{{ item.idCard.replace(/^(.{6})(?:\d+)(.{4})$/, '\$1******\$2') }}</span>
          <span class="sex">{{ item.genderValue }}</span>
          <span class="age">{{ item.age }}岁</span>
        </div>
        <div class="icon">
          <cpIcon name="user-edit"></cpIcon>
        </div>
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <div class="patient-add" v-if="list.length < 6">
        <cp-icon name="user-add" />
        <p>添加患者</p>
      </div>
      <div class="patient-tip">最多可添加 6 人</div>
    </div>
    <CpRadioBtn :options="options" v-model="gender"></CpRadioBtn>
    <van-popup v-model:show="show" position="right">
      <cp-nav-bar title="添加患者" right-text="保存"></cp-nav-bar>
    </van-popup>
  </div>
</template>

<style lang="scss" scoped>
.patient-page {
  padding: 46px 0 80px;
  .patient-list {
    padding: 15px;
    .patient-item {
      display: flex;
      align-items: center;
      padding: 15px;
      background-color: var(--cp-bg);
      border-radius: 8px;
      margin-bottom: 15px;
      position: relative;
      border: 1px solid var(--cp-bg);
      transition: all 0.3s;
      overflow: hidden;
      .info {
        display: flex;
        flex-wrap: wrap;
        flex: 1;
        span {
          color: var(--cp-tip);
          margin-right: 20px;
          line-height: 30px;
          &.name {
            font-size: 16px;
            color: var(--cp-text1);
            width: 80px;
            margin-right: 0;
          }
          &.id {
            color: var(--cp-text2);
            width: 180px;
          }
        }
      }
      .tag {
        position: absolute;
        top: 21px;
        right: 60px;
        width: 30px;
        height: 16px;
        color: #fff;
        font-size: 10px;
        line-height: 16px;
        text-align: center;
        border-radius: 2px;
        background-color: var(--cp-primary);
      }
    }
    .patient-add {
      padding: 15px 0;
      text-align: center;
      border-radius: 8px;
      color: var(--cp-primary);
      background-color: var(--cp-bg);
      .cp-icon {
        font-size: 24px;
      }
    }
    .patient-tip {
      color: var(--cp-tag);
      padding: 12px 0;
    }
  }
  ::v-deep() {
    .van-popup {
      width: 80%;
      height: 100%;
    }
  }
}
</style>
