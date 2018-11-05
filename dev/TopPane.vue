<template>
  <div>
    <div class="topbar">
      <div v-for="(v, k, i) in funcs1" :key="i" >
        <a-button ghost class="topbtn" v-for="c in v" :key="c.name" @click="c.func">{{c.name}}</a-button>
        <br/>
      </div>
      <input ref="input" class="topbtn " type="file" id="file" value="加载本地json" ></input>
    </div>
    
  </div>
</template>

<script>
import fs from 'file-saver'

import { Base64 } from 'js-base64'

import Vue from 'vue'
import { Button } from 'ant-design-vue'
Vue.component(Button.name, Button)

export default {
  props: {
    gm: {}
  },
  components: {
  },
  data () {
    return {
      files: [],
      message: '',
      graphList: [],
      funcs1: [
        [
          {name: '多边形', func: () => this.gm.create({obj: 'Polygon', color: '#00F'}) },
          {name: '矩形', func: () => this.gm.create({obj: 'Rectangle', color: '#00F'}) },
          {name: '单箭头', func: () => this.gm.create({obj: 'Arrow1', color: '#00F'}) },
          {name: '椭圆', func: () => this.gm.create({obj: 'Ellipse', color: '#00F'}) },
          {name: '圆', func: () => this.gm.create({obj: 'Circle', color: '#00F'}) },
        ],
        [
          {name: '直线', func: () => this.gm.create({obj: 'Polyline', color: '#f00'}) },
          {name: 'bezier1', func: () => this.gm.create({obj: 'Bezier1', color: '#f00'}) },
          {name: 'bezier2', func: () => this.gm.create({obj: 'Bezier2', color: '#f00'}) },
          {name: 'bezierN', func: () => this.gm.create({obj: 'BezierN', color: '#f00'}) },
          {name: '平滑线', func: () => this.gm.create({obj: 'BezierSpline', color: '#f00'}) },
          {name: '圆弧线', func: () => this.gm.create({obj: 'CircleArc', color: '#f00'}) },
          {name: '顶点线', func: () => this.gm.create({obj: 'PointLine', color: '#f00'}) },
          {name: '顶点平滑线', func: () => this.gm.create({obj: 'PointSpline', color: '#f00'}) },
        ],
        [
          {name: '点', func: () => this.gm.create({obj: 'Point', color: '#0f0'}) },
          {name: '船', func: () => this.gm.create({obj: 'Boat', color: '#0f0'}) },
          {name: '车', func: () => this.gm.create({obj: 'Vehicle', color: '#0f0'}) },
          {name: '地面站', func: () => this.gm.create({obj: 'Station', color: '#0f0'}) },
          {name: '卫星', func: () => this.gm.create({obj: 'Satellite', color: '#0f0'}) },
          {name: 'PinText', func: () => this.gm.create({obj: 'PinText', color: '#0f0'}) },
          {name: 'PinIcon', func: () => this.gm.create({obj: 'PinIcon', color: '#0f0'}) },
          {name: 'PinImg', func: () => this.gm.create({obj: 'PinImage', color: '#0f0'}) },
          {name: 'PinImg2', func: this.loadPinImage },
        ],
        [
          {name: '图', func: () => this.gm.create({obj: 'Image', color: '#ff0'}) },
          {name: '红旗', func: () => this.gm.create({obj: 'RedFlag', color: '#ff0'}) },
        ],
        [
          {name: '删除', func: () => this.gm.delete() },
          {name: '删除对象', func: this.testDelete },
          {name: '删除id', func: this.testDeleteById },
          {name: '清空', func: () => this.gm.deleteAll() },
          {name: '自动', func: this.createByJson },
          {name: '选择模式', func: () => this.gm.start() }
        ], [
          {name: '保存', func: this.saveGraphs },
          {name: '上传', func: this.loadGraphs },
          {name: '贴图', func: this.loadBase64Picture }
        ]
      ]
    }
  },
  methods: {
    createByJson () {
      this.graphList.push(this.gm.draw({obj: 'Point', color: '#f00', ctls: [[98, 37]]}))
      this.graphList.push(this.gm.draw({obj: 'Point', color: '#f50', ctls: [{lon: 98, lat: 39}]}))
      this.graphList.push(this.gm.draw({obj: 'Point', color: '#f80', ctls: [{lon: 100, lat: 39}]}))
      this.graphList.push(this.gm.draw({obj: 'Point', color: '#fc0', ctls: [[100, 37]]}))
      this.gm.draw({obj: 'Polygon', color: '#f08', ctls: [
        {lon: 102, lat: 40},
        [110, 43, 10000],
        {lon: 110, lat: 43},
        {lon: 102, lat: 46, hei: 10000},
      ]})
      this.gm.draw({obj: 'Polyline', color: '#0ff', ctls: [
        {lon: 112, lat: 40, hei: 0},
        {lon: 120, lat: 43, hei: 10000},
        {lon: 112, lat: 46},
      ]})
    },
    loadGraphs (file) {
      let reader = new FileReader()
      reader.readAsText(this.$refs.input.files[0])
      reader.onload = f => {
        let graphs = JSON.parse(f.target.result)
        this.gm.load(graphs)
      }
    },
    testDelete () {
      this.graphList.forEach(graph => {
        this.gm.delete(graph)
      })
    },
    testDeleteById () {
      this.gm.draw({id: 'xxx1', obj: 'Point', color: '#ff0', ctls: [[99, 36]]})
      let obj = this.gm.findById('xxx1')
      console.log('obj: ', obj)
      this.gm.delete(obj)
    },
    saveGraphs () {
      let data = this.gm.save()
      console.log('currentGraphs: ', data)
      let blob = new Blob([JSON.stringify(data)], {type: "text/plain;charset=utf-8"})
      fs.saveAs(blob, "graphs.json")
    },
    loadBase64Picture () {
      let reader = new FileReader()
      reader.readAsDataURL(this.$refs.input.files[0])
      reader.onload = f => {
        let result = f.target.result
        console.log('get data: ', result)
        this.gm.draw({obj: 'Polygon', rotation: 12, ctls: [[130,30], [130, 40], [120,40], [120,30]],
                      material: result
        })
      }
    },
    loadPinImage () {
      let reader = new FileReader()
      reader.readAsDataURL(this.$refs.input.files[0])
      reader.onload = f => {
        let result = f.target.result
        console.log('get data: ', result)
        this.gm.create({obj: 'PinImage', rotation: 12, image: result})
      }
    }
  },
  mounted () {
  }
}
</script>

<style scoped>
.topbar {
  top: 4px;
  position: absolute;
}

.topbtn {
  width: 80px;
  height: 32px;
  margin: 1px 5px;
  color: white;
}
</style>
