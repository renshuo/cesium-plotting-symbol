<template>
  <div>
    <div class="mapctn">
      <div id="mapContainer"></div>
      <top-pane :gm="gm"/>
      <prop-editor ref="pe" />
    </div>
    <div class="mapctn">
      <div id="mapContainer2"></div>
      <top-pane :gm="gm2"/>
      <prop-editor ref="pe2" />
    </div>
  </div>
</template>

<script>
import Cesium from 'cesium/Source/Cesium.js'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import TopPane from './TopPane.vue'

import cps from '../src/index.js'
import {PropEditor} from '../src/index.js'

export default {
  name: 'dev',
  data () {
    return {
      message: '',
      gm: undefined,
      gm2: undefined
    }
  },
  components: {
    TopPane,
    'prop-editor': PropEditor
  },
  methods: {
    initMap () {
      window.CESIUM_BASE_URL = '/static/Cesium'
      Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
          100, 30, 110, 40
        )
      let mapContainer = document.getElementById('mapContainer')
      let viewer = new Cesium.Viewer(mapContainer, {
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
      this.gm = viewer.cps = new cps(viewer, {
        propEditor: this.$refs.pe,
        layerId: 'testbh1',
        editAfterCreate: true
      })

      let mapContainer2 = document.getElementById('mapContainer2')
      let viewer2 = new Cesium.Viewer(mapContainer2, {
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
      this.gm2 = viewer2.cps = new cps(viewer2, {
        propEditor: this.$refs.pe2,
        layerId: 'testbh2',
        editAfterCreate: false
      })
    }
  },
  mounted () {
    this.initMap()
  }
}
</script>

<style scoped>
.mapctn {
  position: relative;
}
</style>
