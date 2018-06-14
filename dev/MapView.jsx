import React from 'react'
import Cesium from 'cesium/Source/Cesium.js'
import 'cesium/Build/Cesium/Widgets/widgets.css'

export default class MapView extends React.Component {

  constructor (props) {
    super(props)
  }

  initMap () {
    window.CESIUM_BASE_URL = '/static/Cesium'
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
        100, 30, 110, 40
      )
    let mapContainer = document.getElementById('mapContainer')
    window.viewer = new Cesium.Viewer(mapContainer, {
        baseLayerPicker: true, // 底图选择器
        navigationHelpButton: false, // navigation 帮助文档按钮
        geocoder: false, // 地址搜索按钮
        animation: false, // 左下角的动画播放面板
        timeline: false, // 下方时间线
        fullscreenButton: false,
        selectionIndicator: false, // 是否显示选中的item的光标
        projectionPicker: false,
        infoBox: false // 是否显示右侧信息窗
        })
  }

  componentDidMount () {
    this.initMap()
  }

  render () {
    return <div id="mapContainer"></div>
  }
}
