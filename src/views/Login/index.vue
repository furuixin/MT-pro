<script setup lang="ts">
import cpNavBar from '@/components/cp-nav-bar.vue'
</script>
<template>
  <div class="login-page">
    <cp-nav-bar
      title="登录"
      right-text="注册"
      @click-right="$router.push('/register')"
    ></cp-nav-bar>
  </div>
</template>

<style lang="scss" scoped></style>
