<template>
  <div style="position: relative">
    <div id="mapContainer"></div>

    <div style="position: absolute; top: 0px; margin: 4px">
      <div v-for="(v, k, i) in funcs1" :key="i" >
        <button v-for="c in v" :key="c.name" @click="c.func"
          class="tbt"
        >{{c.name}}</button>
        <br />
      </div>
      <input ref="input" type="file" />
      <br />
      <p>是否使用属性编辑器<input type="checkbox" checked @click="toggleProp"/></p>
    </div>

    <PropEditor ref="propEdit" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
window.CESIUM_BASE_URL = "/Cesium";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";

import { GraphManager } from "./cps/index.ts";
import PropEditor from "./cps/PropEditor/index.vue";
import Graph from "./cps/Graph";

var gm = undefined
const propEdit = ref();

function getCurrentEnt() {
  console.log("", gm.em.currentEditEnt);
}

function setupPropEditor() {
  gm.setGraphSelectHandler( (ent: Graph) => {
    if (ent) {
      propEdit.value.show(true, ent)
      let propDefs = ent.propDefs
      let props = ent.props
      console.log("handle select ent in top", propDefs, props)
    } else {
      propEdit.value.show(false, ent)
      console.log("unselect")
    }
  })
}

onMounted(() => {
  Cesium.Ion.defaultAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxNWY5YzhhMS05ZmYxLTQ5NzgtOTcwNC0zZmViNGFjZjc4ODEiLCJpZCI6ODU0MjMsImlhdCI6MTY0Njk4ODA1NX0.4-plF_5ZfEMMpHqJyefkDCFC8JWkFw39s3yKVcNg55c";
  Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
    100,
    30,
    110,
    40
  );
  let viewer = new Cesium.Viewer("mapContainer", {
    infoBox: false, //是否显示信息框
    selectionIndicator: false, //是否显示选取指示器组件
    timeline: false, //是否显示时间轴
    animation: false, //是否创建动画小器件，左下角仪表
    terrainProvider: Cesium.createWorldTerrain()
  });

  viewer.scene.fog.enabled = false

  gm = new GraphManager(viewer, {
    layerId: "testbh1",
    editAfterCreate: true,
  });

  gm.setGraphFinishHandler( (ent: Graph) => {
    console.log("handler graph finish: ", ent)
  })
});

const files=ref([])
const graphList = []

const funcs1 = ref([
  [
    {name: '多边形', func: () => gm.create({obj: 'Polygon', color: '#00FF00'}) },
    {name: '矩形', func: () => gm.create({obj: 'Rectangle', color: '#00FF00'}) },
    {name: '单箭头', func: () => gm.create({obj: 'Arrow1', color: '#00FF00'}) },
    {name: '椭圆', func: () => gm.create({obj: 'Ellipse', color: '#00FF00'}) },
    {name: '圆', func: () => gm.create({obj: 'Circle', color: '#00FF00'}) },
    {name: '方形箭头', func: () => gm.create({obj: 'SquareArrow', color: '#00FF00'}) },
    {name: '弧面', func: () => gm.create({obj: 'CircleArcArea', color: '#00FF00'}) },
    {name: '扇形', func: () => gm.create({obj: 'SectorArea', color: '#00FF00'}) },
    {name: '三角旗', func: () => gm.create({obj: 'FlagTriangle', color: '#00FF00'}) },
    {name: '四角旗', func: () => gm.create({obj: 'FlagRectangle', color: '#00FF00'}) },
    {name: '多段箭头', func: () => gm.create({obj: 'MultiPartArrow', color: '#00FF00'}) },
    {name: '平滑区域', func: () => gm.create({obj: 'SplineArea', color: '#00FF00'}) },
    {name: '钳击', func: () => gm.create({obj: 'PincerAttack', color: '#00FF00'}) },
  ],
  [
    {name: '直线', func: () => gm.create({obj: 'Polyline', color: '#ff0000'}) },
    {name: 'bezier1', func: () => gm.create({obj: 'Bezier1', color: '#ff0000'}) },
    {name: 'bezier2', func: () => gm.create({obj: 'Bezier2', color: '#ff0000'}) },
    {name: 'bezierN', func: () => gm.create({obj: 'BezierN', color: '#ff0000'}) },
    {name: '平滑线', func: () => gm.create({obj: 'BezierSpline', color: '#ff0000'}) },
    {name: '圆弧线', func: () => gm.create({obj: 'CircleArc', color: '#ff0000'}) },
    {name: '顶点线', func: () => gm.create({obj: 'PointLine', color: '#ff0000'}) },
    {name: '顶点平滑线', func: () => gm.create({obj: 'PointSpline', color: '#ff0000'}) },
    {name: '线段', func: () => gm.create({obj: 'BeeLine', color: '#ff0000'}) },
  ],

  [
    {name: '点', func: () => gm.create({obj: 'Point', color: '#00ff00'}) },
    {name: '地面站', func: () => gm.create({obj: 'Station', color: '#00ff00'}) },
    {name: '卫星', func: () => gm.create({obj: 'Satellite', color: '#00ff00'}) },
    {name: 'PinText', func: () => gm.create({obj: 'PinText', color: '#00ff00'}) },
    {name: 'PinIcon', func: () => gm.create({obj: 'PinIcon', color: '#00ff00'}) },
    {name: 'PinImg', func: () => gm.create({obj: 'PinImage', color: '#00ff00'}) },
    {name: 'PinImg2', func: loadPinImage },
  ],
  [
    {name: '图', func: () => gm.create({obj: 'Image', color: '#ffff00'}) },
    {name: '红旗', func: () => gm.create({obj: 'RedFlag', color: '#ffff00'}) },
  ],
  [
    {name: '距离测量', func: () => gm.create({obj: 'DistanceMeasure', color: '#00ff00'}) },
    {name: '面积测量', func: () => gm.create({obj: 'AreaMeasure', color: '#00ff00'}) },
    {name: '角度测量', func: () => gm.create({obj: 'AngleMeasure', color: '#00ff00'}) },
    {name: '三角测量', func: () => gm.create({obj: 'TriangleMeasure', color: '#00ff00'}) },
    {name: '通视线', func: () => gm.create({obj: 'SightLine', color: '#00ff00'}) },
  ],
  [
    {name: '删除', func: () => gm.delete() },
    {name: '删除对象', func: testDelete },
    {name: '删除id', func: testDeleteById },
    {name: '清空', func: () => gm.deleteAll() },
    {name: '自动', func: createByJson },
    {name: '选择模式', func: () => gm.start() },
    {name: '查看模式', func: () => gm.finish() },
  ], [
    {name: '保存', func: saveGraphs },
    {name: '上传', func: loadGraphs },
    {name: '贴图', func: loadBase64Picture }
  ]
])

function createByJson () {
  graphList.push(gm.draw({obj: 'Point', color: '#ff0000', ctls: [[98, 37]]}))
  graphList.push(gm.draw({obj: 'Point', color: '#ff5500', ctls: [{lon: 98, lat: 39}]}))
  graphList.push(gm.draw({obj: 'Point', color: '#ff8800', ctls: [{lon: 100, lat: 39}]}))
  graphList.push(gm.draw({obj: 'Point', color: '#ffcc00', ctls: [[100, 37]]}))
  gm.draw({obj: 'Polygon', color: '#ff0088', ctls: [
    {lon: 102, lat: 40},
    [110, 43, 10000],
    {lon: 110, lat: 44},
    {lon: 102, lat: 46, hei: 10000},
  ]})
  gm.draw({obj: 'Polyline', color: '#00ffff', ctls: [
    {lon: 112, lat: 40, hei: 0},
    {lon: 120, lat: 43, hei: 10000},
    {lon: 112, lat: 46},
  ]})
}

function loadGraphs (file) {
  let reader = new FileReader()
  reader.readAsText(input.value.files[0])
  reader.onload = f => {
    let graphs = JSON.parse(f.target.result)
    gm.load(graphs)
  }
}

function testDelete () {
  graphList.forEach(graph => {
    gm.delete(graph)
  })
}

function testDeleteById () {
  gm.draw({id: 'xxx1', obj: 'Point', color: '#ffff00', ctls: [[99, 36]]})
  let obj = gm.findById('xxx1')
  console.log('obj: ', obj)
  gm.delete(obj)
}

function saveGraphs () {
  let data = gm.save()
  console.log('currentGraphs: ', data)
  let blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"})
  fs.saveAs(blob, "graphs.json")
}

function loadBase64Picture () {
  let reader = new FileReader()
  reader.readAsDataURL(input.value.files[0])
  reader.onload = f => {
    let result = f.target.result
    console.log('get data: ', result)
    gm.draw({obj: 'Polygon', rotation: 12, ctls: [[130,30], [130, 40], [120,40], [120,30]],
             material: result
    })
  }
}

function loadPinImage() {
  let reader = new FileReader()
  reader.readAsDataURL(input.value.files[0])
  reader.onload = f => {
    let result = f.target.result
    console.log('get data: ', result)
    gm.create({obj: 'PinImage', rotation: 12, image: result})
  }
}

function toggleProp(a,b,c) {
  console.log('toggle porp editor', a.target.checked)
  if (a.target.checked) {
    setupPropEditor()
  } else {
    gm.setGraphSelectHandler( (ent: Graph) => {
      console.log("no prop editor")
    })
  }
}

</script>

<style>
.tbt {
  border: 1px solid blue;
  background: transparent;
  background-color: rgba(120,120,120, 0.2);
  border-radius: 2px;
  margin: 1px 2px;
  padding: 2px 8px;
  min-width: 90px;
  font-size: 14px;
  line-height: 16px;
  color: #00ff00;
}
</style>
