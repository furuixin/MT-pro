import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 按需引入vant
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'

// 根据 icons 文件svg图片打包到项目中，通过组件使用图标
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue({
      // 开启后可将解构props转换为响应式，仅适用于 Vue 3.3 及以下版本，3.4将会移除
      reactivityTransform: true
    }),
    // 自动导入的插件，解析器可以是 vant element and-vue
    Components({
      // 不开起自动生成声明文件 dts: false
      dts: false,
      // 原因：Toast Confirm 这类组件的样式还是需要单独引入，样式全局引入了，关闭自动引入
      resolvers: [VantResolver({ importStyle: false })]
    }),
    createSvgIconsPlugin({
      // 指定图标文件夹，绝对路径（NODE代码）
      iconDirs: [path.resolve(process.cwd(), 'src/icons')]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '/dev-api': {
        target: 'https://consult-api.itheima.net',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/dev-api/, '')
      }
    }
  }
})
