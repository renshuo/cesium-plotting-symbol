<template>
  <div>
    <div id="mapContainer"></div>
    <top-pane />
  </div>
</template>

<script>
import Cesium from 'cesium/Source/Cesium.js'
import 'cesium/Build/Cesium/Widgets/widgets.css'

import TopPane from './TopPane.vue'

function initMap () {
    window.CESIUM_BASE_URL = '/static/Cesium'
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
        100, 30, 110, 40
      )
    let mapContainer = document.getElementById('mapContainer')
    window.viewer = new Cesium.Viewer(mapContainer, {
        baseLayerPicker: true, // 底图选择器
        navigationHelpButton: false, // navigation 帮助文档按钮
        geocoder: false, // 地址搜索按钮
        animation: true, // 左下角的动画播放面板
        timeline: true, // 下方时间线
        fullscreenButton: false,
        selectionIndicator: false, // 是否显示选中的item的光标
        projectionPicker: true,
        infoBox: false // 是否显示右侧信息窗
        })
  }

export default {
  components: {
    TopPane
  },
  mounted () {
    initMap()
  }
}
</script>
