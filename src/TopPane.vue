<template>
  <div style="margin: 4px">
    <div v-for="(v, k, i) in funcs1" :key="i" >
      <button v-for="c in v" :key="c.name" @click="c.func"
        class="tbt"
      >{{c.name}}</button>
      <br />
    </div>
    <input ref="input" type="file" />
  </div>
</template>

<script lang="ts" setup>
import { ref, defineComponent } from 'vue'
import fs from 'file-saver'
import { Base64 } from 'js-base64'


const input=ref()

const prop = defineProps({
  gm: Object
})

const files=ref([])
const graphList = ref([])

function createByJson () {
  graphList.push(prop.gm.draw({obj: 'Point', color: '#f00', ctls: [[98, 37]]}))
  graphList.push(prop.gm.draw({obj: 'Point', color: '#f50', ctls: [{lon: 98, lat: 39}]}))
  graphList.push(prop.gm.draw({obj: 'Point', color: '#f80', ctls: [{lon: 100, lat: 39}]}))
  graphList.push(prop.gm.draw({obj: 'Point', color: '#fc0', ctls: [[100, 37]]}))
  prop.gm.draw({obj: 'Polygon', color: '#f08', ctls: [
    {lon: 102, lat: 40},
    [110, 43, 10000],
    {lon: 110, lat: 43},
    {lon: 102, lat: 46, hei: 10000},
  ]})
  prop.gm.draw({obj: 'Polyline', color: '#0ff', ctls: [
    {lon: 112, lat: 40, hei: 0},
    {lon: 120, lat: 43, hei: 10000},
    {lon: 112, lat: 46},
  ]})
}
function loadGraphs (file) {
  let reader = new FileReader()
  reader.readAsText($refs.input.files[0])
  reader.onload = f => {
    let graphs = JSON.parse(f.target.result)
    prop.gm.load(graphs)
  }
}

function testDelete () {
  graphList.forEach(graph => {
    prop.gm.delete(graph)
  })
}

function testDeleteById () {
  prop.gm.draw({id: 'xxx1', obj: 'Point', color: '#ff0', ctls: [[99, 36]]})
  let obj = prop.gm.findById('xxx1')
  console.log('obj: ', obj)
  prop.gm.delete(obj)
}

function saveGraphs () {
  let data = prop.gm.save()
  console.log('currentGraphs: ', data)
  let blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"})
  fs.saveAs(blob, "graphs.json")
}

function loadBase64Picture () {
  let reader = new FileReader()
  reader.readAsDataURL($refs.input.files[0])
  reader.onload = f => {
    let result = f.target.result
    console.log('get data: ', result)
    prop.gm.draw({obj: 'Polygon', rotation: 12, ctls: [[130,30], [130, 40], [120,40], [120,30]],
             material: result
    })
  }
}

function loadPinImage() {
  let reader = new FileReader()
  reader.readAsDataURL($refs.input.files[0])
  reader.onload = f => {
    let result = f.target.result
    console.log('get data: ', result)
    prop.gm.create({obj: 'PinImage', rotation: 12, image: result})
  }
}

const funcs1 = ref([
  [
    {name: '多边形', func: () => prop.gm.create({obj: 'Polygon', color: '#00F'}) },
    {name: '矩形', func: () => prop.gm.create({obj: 'Rectangle', color: '#00F'}) },
    {name: '单箭头', func: () => prop.gm.create({obj: 'Arrow1', color: '#00F'}) },
    {name: '椭圆', func: () => prop.gm.create({obj: 'Ellipse', color: '#00F'}) },
    {name: '圆', func: () => prop.gm.create({obj: 'Circle', color: '#00F'}) },
  ],
  [
    {name: '直线', func: () => prop.gm.create({obj: 'Polyline', color: '#f00'}) },
    {name: 'bezier1', func: () => prop.gm.create({obj: 'Bezier1', color: '#f00'}) },
    {name: 'bezier2', func: () => prop.gm.create({obj: 'Bezier2', color: '#f00'}) },
    {name: 'bezierN', func: () => prop.gm.create({obj: 'BezierN', color: '#f00'}) },
    {name: '平滑线', func: () => prop.gm.create({obj: 'BezierSpline', color: '#f00'}) },
    {name: '圆弧线', func: () => prop.gm.create({obj: 'CircleArc', color: '#f00'}) },
    {name: '顶点线', func: () => prop.gm.create({obj: 'PointLine', color: '#f00'}) },
    {name: '顶点平滑线', func: () => prop.gm.create({obj: 'PointSpline', color: '#f00'}) },
  ],
  [
    {name: '点', func: () => prop.gm.create({obj: 'Point', color: '#0f0'}) },
    {name: '船', func: () => prop.gm.create({obj: 'Boat', color: '#0f0'}) },
    {name: '车', func: () => prop.gm.create({obj: 'Vehicle', color: '#0f0'}) },
    {name: '地面站', func: () => prop.gm.create({obj: 'Station', color: '#0f0'}) },
    {name: '卫星', func: () => prop.gm.create({obj: 'Satellite', color: '#0f0'}) },
    {name: 'PinText', func: () => prop.gm.create({obj: 'PinText', color: '#0f0'}) },
    {name: 'PinIcon', func: () => prop.gm.create({obj: 'PinIcon', color: '#0f0'}) },
    {name: 'PinImg', func: () => prop.gm.create({obj: 'PinImage', color: '#0f0'}) },
    {name: 'PinImg2', func: loadPinImage },
  ],
  [
    {name: '图', func: () => prop.gm.create({obj: 'Image', color: '#ff0'}) },
    {name: '红旗', func: () => prop.gm.create({obj: 'RedFlag', color: '#ff0'}) },
  ],
  [
    {name: '删除', func: () => prop.gm.delete() },
    {name: '删除对象', func: testDelete },
    {name: '删除id', func: testDeleteById },
    {name: '清空', func: () => prop.gm.deleteAll() },
    {name: '自动', func: createByJson },
    {name: '选择模式', func: () => prop.gm.start() }
  ], [
    {name: '保存', func: saveGraphs },
    {name: '上传', func: loadGraphs },
    {name: '贴图', func: loadBase64Picture }
  ]
])
</script>

<style scoped>
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
  color: #0f0;
}
</style>
