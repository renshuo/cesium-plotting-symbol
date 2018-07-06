<template>
  <div>
    <div class="topbar">
      <div v-for="(v, k, i) in funcs1" :key="i" >
        <a-button ghost class="topbtn" v-for="c in v" :key="c.name" @click="c.func">{{c.name}}</a-button>
        <br/>
      </div>
    </div>
  </div>
</template>

<script>
import gx from '../src/index.js'

export default {
  components: {
  },
  data () {
    return {
      message: '',
      funcs1: [
        [
          {name: '多边形', func: () => gx.start(new gx.Polygon({color: '#0000FF'})) },
          {name: '矩形', func: () => gx.start(new gx.Rectangle({color: '#0000FF'})) },
          {name: '单箭头', func: () => gx.start(new gx.Arrow1({color: '#0000FF'})) },
          {name: '椭圆', func: () => gx.start(new gx.Ellipse({color: '#0000FF'})) },
          {name: '圆', func: () => gx.start(new gx.Circle({color: '#0000FF'})) },
        ],
        [
          {name: '直线', func: () => gx.start(new gx.Polyline({color: '#f00'})) },
          {name: 'bezier1', func: () => gx.start(new gx.Bezier1({color: '#f00'})) },
          {name: 'bezier2', func: () => gx.start(new gx.Bezier2({color: '#f00'})) },
          {name: 'bezierN', func: () => gx.start(new gx.BezierN({color: '#f00'})) },
          {name: '平滑线', func: () => gx.start(new gx.BezierSpline({color: '#f00'})) },
          {name: '圆弧线', func: () => gx.start(new gx.CircleArc({color: '#f00'})) },
        ],
        [
          {name: '点', func: () => gx.start(new gx.Point({color: '#0f0'})) },
          {name: '船', func: () => gx.start(new gx.Boat({color: '#0f0'})) },
          {name: '车', func: () => gx.start(new gx.Vehicle({color: '#0f0'})) },
          {name: '地面站', func: () => gx.start(new gx.Station({color: '#0f0'})) },
          {name: '卫星', func: () => gx.start(new gx.Satellite({color: '#0f0'})) },
        ],
        [
          {name: '图', func: () => gx.start(new gx.Image({color: '#ff0'})) },
          {name: '红旗', func: () => gx.start(new gx.RedFlag({color: '#ff0'})) },
        ],
        [
          {name: '删除', func: () => gx.deleteGraph() },
          {name: '清空', func: () => gx.deleteAllGraph() },
        ]
      ]
    }
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
