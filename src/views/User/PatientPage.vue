<script setup lang="ts">
import { getPatientList, addPatient, editPatient, delPatient } from '@/services/user'
import type { PatientList, Patient } from '@/types/user'
import { showToast, showConfirmDialog } from 'vant'
import { onMounted, ref, computed } from 'vue'

// 1. 页面初始化加载数据
const list = ref<PatientList>([])
const loadList = async () => {
  const res = await getPatientList()
  list.value = res.data
  // 设置默认选中的ID，当你是选择患者的时候，且有患者信息的时候
  if (isChange.value && list.value.length) {
    // 找到默认就诊人对象
    const defPatient = list.value.find((item) => item.defaultFlag === 1)
    // 如果有默认就诊人就选中默认就诊人
    if (defPatient) patientId.value = defPatient.id
    // 不然的话选中第一个就诊人
    else patientId.value = list.value[0].id
  }
}
onMounted(() => {
  loadList()
})

// 侧边栏
const show = ref(false)
const showPopup = (item?: Patient) => {
  if (item) {
    // 如果时编辑，解构出需要的对象
    const { id, gender, name, idCard, defaultFlag } = item
    patient.value = { id, gender, name, idCard, defaultFlag }
  } else {
    // 如果为添加，没穿对象，就重置绑定的表单对象
    patient.value = { ...initPatient }
  }
  show.value = true
}
// 表单复选框选项
const options = [
  { label: '男', value: 1 },
  { label: '女', value: 0 }
]
// 默认表单对象
const initPatient: Patient = {
  name: '',
  idCard: '',
  gender: 1,
  defaultFlag: 0
}
// 绑定的表单对象
const patient = ref<Patient>({ ...initPatient })
// 默认值需要转换为布尔值
const defaultFlag = computed({
  // 使用时根据绑定表单性别是否等1返回出布尔值
  get() {
    return patient.value.defaultFlag === 1 ? true : false
  },
  // 改变时根据布尔值改变为1还是0
  set(value) {
    patient.value.defaultFlag = value ? 1 : 0
  }
})

// 提交表单
import Validator from 'id-validator'
const submit = async () => {
  if (!patient.value.name) return showToast('请输入真实姓名')
  if (!patient.value.idCard) return showToast('请输入身份证号')
  const validate = new Validator()
  console.log(validate.getInfo(patient.value.idCard))
  if (!validate.isValid(patient.value.idCard)) return showToast('身份证格式错误')
  const { sex } = validate.getInfo(patient.value.idCard)
  if (patient.value.gender !== sex) return showToast('性别和身份证不符')
  // 通过校验保存
  patient.value.id ? await editPatient(patient.value) : await addPatient(patient.value)
  show.value = false
  loadList()
  showToast({ type: 'success', message: patient.value.id ? '编辑成功' : '添加成功' })
}

// 删除患者
const remove = async () => {
  if (patient.value.id) {
    await showConfirmDialog({
      title: '温馨提示',
      message: `您确认要删除 ${patient.value.name} 患者信息吗 ？`,
      cancelButtonText: '取消',
      confirmButtonText: '确认'
    })
    await delPatient(patient.value.id)
    show.value = false
    loadList()
    showToast({ type: 'success', message: '删除成功' })
  }
}

//问诊时的选择患者兼容
import { useRoute, useRouter } from 'vue-router'
import { useConsultStore } from '@/stores'
const store = useConsultStore()
// 是否处于是选择患者
const route = useRoute()
const isChange = computed(() => route.query.isChange === '1')
// 点击选中效果
const patientId = ref<string>()
const selectedPatient = (item: Patient) => {
  // 如果当前处于问诊时才能执行选中
  if (isChange.value) {
    patientId.value = item.id
  }
}
// 选择完毕下一步
const router = useRouter()
const next = async () => {
  if (!patientId.value) return showToast('请选就诊择患者')
  store.setPatient(patientId.value)
  router.push('/consult/pay')
}
</script>

<template>
  <div class="patient-page">
    <cpNavBar :title="isChange ? '选择患者' : '家庭档案'"></cpNavBar>
    <!-- 问诊的头部提示 -->
    <div class="patient-change" v-if="isChange">
      <h3>请选择患者信息</h3>
      <p>以便医生给出更准确的治疗，信息仅医生可见</p>
    </div>
    <div class="patient-list">
      <div
        class="patient-item"
        v-for="item in list"
        :key="item.id"
        @click="selectedPatient(item)"
        :class="{ selected: patientId === item.id }"
      >
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
        <div class="icon" @click="showPopup(item)">
          <cpIcon name="user-edit"></cpIcon>
        </div>
        <div class="tag" v-if="item.defaultFlag === 1">默认</div>
      </div>
      <div class="patient-add" v-if="list.length < 6" @click="showPopup()">
        <cp-icon name="user-add" />
        <p>添加患者</p>
      </div>
      <div class="patient-tip">最多可添加 6 人</div>
    </div>
    <van-popup v-model:show="show" position="right">
      <cp-nav-bar
        :title="patient.id ? '编辑患者' : '添加患者'"
        right-text="保存"
        :back="() => (show = false)"
        @click-right="submit()"
      ></cp-nav-bar>
      <van-form autocomplete="off">
        <van-field label="真实姓名" v-model="patient.name" placeholder="请输入真实姓名" />
        <van-field label="身份证号" v-model="patient.idCard" placeholder="请输入身份证号" />
        <van-field label="性别">
          <!-- 单选按钮组件 -->
          <template #input>
            <cp-radio-btn :options="options" v-model="patient.gender"></cp-radio-btn>
          </template>
        </van-field>
        <van-field label="默认就诊人">
          <template #input>
            <van-checkbox round v-model="defaultFlag" />
          </template>
        </van-field>
      </van-form>
      <van-action-bar v-if="patient.id">
        <van-action-bar-button @click="remove">删除</van-action-bar-button>
      </van-action-bar>
    </van-popup>
    <!-- 问诊的底部提交按钮 -->
    <div class="patient-next" v-if="isChange">
      <van-button type="primary" @click="next" round block>下一步</van-button>
    </div>
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
    .selected {
      border-color: var(--cp-primary);
      background-color: var(--cp-plain);
    }
  }

  ::v-deep() {
    .van-popup {
      width: 100%;
      height: 100%;
      padding-top: 46px;
      box-sizing: border-box;

      .van-action-bar {
        padding: 0 10px;
        margin-bottom: 10px;

        .van-button {
          font-weight: 500;
          color: var(--cp-price);
          background-color: var(--cp-bg);
        }
      }
    }
  }

  .patient-change {
    padding: 15px;

    > h3 {
      font-weight: normal;
      margin-bottom: 5px;
    }

    > p {
      color: var(--cp-text3);
    }
  }

  .patient-next {
    padding: 15px;
    background-color: #fff;
    position: fixed;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 80px;
    box-sizing: border-box;
  }
}
</style>
