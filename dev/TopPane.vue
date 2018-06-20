<template>
  <div class="topbar">
    <div v-for="(v, k, i) in funcs1" :key="i" >
      <a-button ghost class="topbtn" v-for="c in v" :key="c.name" @click="c.func">{{c.name}}</a-button>
      <br/>
    </div>
  </div>
</template>

<script>
import gx from '../src/index.js'

export default {
  data () {
    return {
      funcs1: [
        [
          {name: '多边形', func: () => gx.start(new gx.Polygon()) },
          {name: '矩形', func: () => gx.start(new gx.Rectangle()) },
          {name: '单箭头', func: () => gx.start(new gx.Arrow1()) },
          {name: '椭圆', func: () => gx.start(new gx.Ellipse()) },
          {name: '圆', func: () => gx.start(new gx.Circle()) },
        ],
        [
          {name: '直线', func: () => gx.start(new gx.Polyline()) },
          {name: 'bezier1', func: () => gx.start(new gx.Bezier1()) },
          {name: 'bezier2', func: () => gx.start(new gx.Bezier2()) },
          {name: 'bezierN', func: () => gx.start(new gx.BezierN()) },
          {name: '平滑线', func: () => gx.start(new gx.BezierSpline()) },
          {name: '圆弧线', func: () => gx.start(new gx.CircleArc()) },
        ],
        [
          {name: '点', func: () => gx.start(new gx.Point()) },
          {name: '船', func: () => gx.start(new gx.Boat()) },
          {name: '车', func: () => gx.start(new gx.Vehicle()) },
          {name: '地面站', func: () => gx.start(new gx.Station()) },
          {name: '卫星', func: () => gx.start(new gx.Satellite()) },
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
