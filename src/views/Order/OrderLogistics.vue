<script setup lang="ts">
import { getMedicalOrderLogistics } from '@/services/order'
import type { Logistics } from '@/types/order'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
// 引入地图API
import AMapLoader from '@amap/amap-jsapi-loader'
// 地图图标
import endImg from '@/assets/end.png'
import startImg from '@/assets/start.png'
import carImg from '@/assets/car.png'

// 获取物流信息
const logistics = ref<Logistics>()
const route = useRoute()
onMounted(async () => {
  const res = await getMedicalOrderLogistics(route.params.id as string)
  logistics.value = res.data
  window._AMapSecurityConfig = {
    securityJsCode: 'e6421d9d0bfa101021ce705544a74318'
  }
  // 1.创建地图
  AMapLoader.load({
    // 申请好的Web端开发者Key，首次调用 load 时必填
    key: 'b55df2dfd8bc676cbc5f8207cb43bbc6',
    // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
    version: '2.0',
    // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    plugins: ['']
  }).then((AMap) => {
    // 2.使用 Amap 初始化地图
    //参数1为地图容器id
    const map = new AMap.Map('map', {
      //设置地图的显示样式,whitesmoke为一个高德地图样式ID
      mapStyle: 'amap://styles/whitesmoke',
      //设置地图的缩放级别
      zoom: 12
    })
    // 3.AMap.plugin异步加载插件，在回调中使用插件功能
    AMap.plugin('AMap.Driving', function () {
      // AMap.Driving插件：驾车路线规划服务，提供按照起、终点进行驾车路线的功能
      const driving = new AMap.Driving({
        // map 指定将路线规划方案绘制到对应的AMap.Map对象上
        map: map,
        // 是否显示交通路况图层
        showTraffic: false,
        // 设置隐藏路径规划的起始点图标，设置为true：隐藏图标；设置false：显示图标 默认值为：false
        hideMarkers: true
      })

      // 4.起点为轨迹信息数组的第一个
      const start = res.data.logisticsInfo.shift()
      //  创建一个图标的标记点用来做起点
      const startMarker = new AMap.Marker({
        // 经纬度对象，也可以是经纬度构成的一维数组
        position: [start?.longitude, start?.latitude],
        // 标记点图标
        icon: startImg
      })
      // 将起点添加到地图容器中
      map.add(startMarker)

      // 5.终点为数组的最后一个
      const end = res.data.logisticsInfo.pop()
      // 创建一个图标的标记点用于终点
      const endMarker = new AMap.Marker({
        // 经纬度对象，也可以是经纬度构成的一维数组
        position: [end?.longitude, end?.latitude],
        // 标记点图标
        icon: endImg
      })
      // 将终点添加到地图容器中
      map.add(endMarker)

      // 6.创建一个图标的标记点为当前所在位置点
      const marker = new AMap.Marker({
        // 经纬度对象，也可以是经纬度构成的一维数组
        position: [res.data.currentLocationInfo.longitude, res.data.currentLocationInfo.latitude],
        // 标记点图标
        icon: carImg,
        // 设置标记的锚点位置，共九个锚点位置，标记点是在中间的 ⁝⁝⁝
        anchor: 'center'
      })
      // 将当前地点添加到地图容器
      map.add(marker)
      // 7.driving.search(origin, destination, opts, callback)：根据起点、终点和途经点（可选）坐标或名称，实现驾车路线规划
      // 参数说明：origin(LngLat)起点经纬度 destination(LngLat)终点经纬度
      // opts(Object) 途径点最多支持16个,格式为opts.waypoints:Array<LngLat>
      driving.search(
        [start?.longitude, start?.latitude],
        [end?.longitude, end?.latitude],
        {
          waypoints: res.data.logisticsInfo.map((item) => [item.longitude, item.latitude])
        },
        // callback(DrivingCallback) status为complete时，result为DrivingResult；当status为error时，result为错误信息info；当status为no_data时，代表检索返回0结果。
        function (status: string, result: object) {
          // 未出错时，result即是对应的路线规划方案
          console.log('+++++', status, result)
          // 使用setTimeout是为了一段时间后再执行自动缩放地图和设置缩放级别的操作。
          // 这样做的目的是为了让用户有时间看到地图上的标记点，然后再进行缩放操作。
          setTimeout(() => {
            // setFitView(overlays, immediately, avoid, maxZoom)
            // 8.根据地图上添加的覆盖物分布情况，自动缩放地图到合适的视野级别，参数均可缺省。[marker]覆盖物数组
            map.setFitView([marker])
            // 9.设置地图显示的缩放级别，参数 zoom 可设范围：[2, 30]
            map.setZoom(10)
          }, 3000)
        }
      )
    })
  })
})
</script>

<template>
  <div class="order-logistics-page">
    <div id="map">
      <div class="title">
        <van-icon name="arrow-left" @click="$router.back()" />
        <span>{{ logistics?.statusValue }}</span>
        <van-icon name="service" />
      </div>
      <div class="current">
        <p class="status">{{ logistics?.statusValue }} 预计{{ logistics?.estimatedTime }}送达</p>
        <p class="predict">
          <span>{{ logistics?.name }}</span>
          <span>{{ logistics?.awbNo }}</span>
        </p>
      </div>
    </div>
    <div class="logistics">
      <p class="title">物流详情</p>
      <van-steps direction="vertical" :active="0">
        <van-step v-for="item in logistics?.list" :key="item.id">
          <p class="status" v-if="item.statusValue">{{ item.statusValue }}</p>
          <p class="content">{{ item.content }}</p>
          <p class="time">{{ item.createTime }}</p>
        </van-step>
      </van-steps>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.order-logistics-page {
  --van-step-icon-size: 18px;
  --van-step-circle-size: 10px;
}

#map {
  height: 450px;
  background-color: var(--cp-bg);
  overflow: hidden;
  position: relative;

  .title {
    background-color: #fff;
    height: 46px;
    width: 355px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    padding: 0 15px;
    font-size: 16px;
    position: absolute;
    left: 10px;
    top: 10px;
    box-sizing: border-box;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;

    > span {
      flex: 1;
      text-align: center;
    }

    .van-icon {
      font-size: 18px;
      color: #666;

      &:last-child {
        color: var(--cp-primary);
      }
    }
  }

  .current {
    height: 80px;
    border-radius: 4px;
    background-color: #fff;
    height: 80px;
    width: 355px;
    box-sizing: border-box;
    padding: 15px;
    position: absolute;
    left: 10px;
    bottom: 10px;
    box-shadow: 0px 0px 22px 0px rgba(229, 229, 229, 0.5);
    z-index: 999;

    .status {
      font-size: 15px;
      line-height: 26px;
    }

    .predict {
      color: var(--cp-tip);
      font-size: 13px;
      margin-top: 5px;

      > span {
        padding-right: 10px;
      }
    }
  }
}

.logistics {
  padding: 0 10px 20px;

  .title {
    font-size: 16px;
    padding: 15px 5px 5px;
  }

  .van-steps {
    :deep(.van-step) {
      &::after {
        display: none;
      }
    }

    .status {
      font-size: 15px;
      color: var(--cp-text3);
      margin-bottom: 4px;
    }

    .content {
      font-size: 13px;
      color: var(--cp-tip);
      margin-bottom: 4px;
    }

    .time {
      font-size: 13px;
      color: var(--cp-tag);
    }
  }
}
</style>
