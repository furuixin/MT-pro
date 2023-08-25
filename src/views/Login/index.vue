<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
import cpNavBar from '@/components/cp-nav-bar.vue'
import cpIcon from '@/components/cpIcon.vue'
import { loginByPassword } from '@/services/user'
import { useUserStore } from '@/stores'
import { useRoute, useRouter } from 'vue-router'
import { mobileRules, passwordRules } from '@/utils/rules'

const password = ref<string>('')
const mobile = ref<string>('')
const show = ref<boolean>(false)
const agree = ref<boolean>(false)
const store = useUserStore()
const router = useRouter()
const route = useRoute()

// 表单提交
const login = async () => {
  if (!agree.value) return showToast('请勾选我已同意')
  // 验证完毕，进行登录
  const res = await loginByPassword(mobile.value, password.value)
  console.log(res)
  store.setUser(res.data)
  // 如果有回跳地址就进行回跳，没有跳转到个人中心
  console.log(route.query.returnUrl)
  router.push((route.query.returnUrl as string) || '/user')
  showToast({ type: 'success', message: '登录成功' })
}
</script>
<template>
  <div class="login-page">
    <cp-nav-bar right-text="注册" @click-right="$router.push('/register')"></cp-nav-bar>
    <div class="login-head">
      <h3>密码登录</h3>
      <a href="javascript:;">
        <span>短信验证码登录</span>
        <van-icon name="arrow"></van-icon>
      </a>
    </div>
    <!-- form 表单 -->
    <van-form autocomplete="off" @submit="login">
      <van-field v-model="mobile" :rules="mobileRules" placeholder="请输入手机号" type="tel"></van-field>
      <van-field v-model="password" :rules="passwordRules" placeholder="请输入密码" :type="show ? 'text' : 'password'">
        <template #button>
          <cp-icon :name="`login-eye-${show ? 'on' : 'off'}`" @click="show = !show"></cp-icon>
        </template>
      </van-field>
      <div class="cp-cell">
        <van-checkbox v-model="agree">
          <span>我已同意</span>
          <a href="javascript:;">用户协议</a>
          <span>及</span>
          <a href="javascript:;">隐私条款</a>
        </van-checkbox>
      </div>
      <div class="cp-cell">
        <van-button block round type="primary" native-type="submit">登 录</van-button>
      </div>
      <div class="cp-cell">
        <a href="javascript:;">忘记密码？</a>
      </div>
    </van-form>
    <div class="login-other">
      <van-divider>第三方登录</van-divider>
      <div class="icon">
        <img src="@/assets/qq.svg" alt="qq" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  &-page {
    padding-top: 46px;
  }

  &-head {
    padding: 30px 30px 50px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    line-height: 1;

    h3 {
      font-weight: normal;
      font-size: 24px;
    }

    a {
      font-size: 15px;
    }
  }

  &-other {
    margin-top: 60px;
    padding: 0 30px;

    .icon {
      display: flex;
      justify-content: center;

      img {
        width: 36px;
        height: 36px;
        padding: 4px;
      }
    }
  }
}

.van-form {
  padding: 0 14px;

  .cp-cell {
    height: 52px;
    line-height: 24px;
    padding: 14px 16px;
    box-sizing: border-box;
    display: flex;
    align-items: center;

    .van-checkbox {
      a {
        color: var(--cp-primary);
        padding: 0 5px;
      }
    }
  }
}
</style>
