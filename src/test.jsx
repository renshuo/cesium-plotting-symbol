import 'cesium/Build/Cesium/Widgets/widgets.css'
import Cesium from 'cesium/Source/Cesium.js'
import React from 'react'
import ReactDOM from 'react-dom'
import gx from './index.js'

function Gbutton (props) {
    return (
    <button onClick={props.func}
    style={{width: '70px', height: '32px', margin: '1px 5px'}}
    >{props.name}</button>
    )
}

let mapContainer = ReactDOM.render(
    <div>
        <div id="mapContainer"></div>
        <Gbutton func={() => gx.start(new gx.Point())} name="点"/>
        <Gbutton func={() => gx.start(new gx.Polygon())} name="多边形"/>
        <Gbutton func={() => gx.start(new gx.Polyline())} name="直线"/>
        <Gbutton func={() => gx.start(new gx.Bezier1())} name="bezier1"/>
        <Gbutton func={() => gx.start(new gx.Bezier2())} name="Bezier2"/>
        <Gbutton func={() => gx.start(new gx.BezierN())} name="BezierN"/>
        <Gbutton func={() => gx.start(new gx.BezierSpline())} name="平滑线"/>
        <br/>
        <Gbutton func={() => gx.start(new gx.Arrow1())} name="单箭头"/>
        <Gbutton func={() => gx.start(new gx.Ellipse())} name="椭圆"/>
        <Gbutton func={() => gx.start(new gx.Circle())} name="圆"/>
    </div>,
    document.body
  );

function initView () {
    window.CESIUM_BASE_URL = '/static/Cesium'
    Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
        100, 30, 110, 40
      )
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

initView()
