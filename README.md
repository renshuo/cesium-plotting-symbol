# cesium-plotting-symbol
基于cesiumn的标绘插件

## 支持图形
1. 单点
2. 折线
3. 多边形
4. 单箭头

具体支持的图形参照：
[Graph](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/Graph)

## 安装
```bash
npm install cesium-plotting-symbol --save
```

## 引入： 
```javascript
import cps from 'cesium-plotting-symbol'
```

## 创建图形
```javascript
let graph = cps.start(new cps.Point())
```

graph是new cps.Point()的结果，用来持有图形对象，目前提供以下功能：
graph.getCtlPositions() // 返回图形的所有控制点的坐标，
```javascript
    graph.getCtlPositions().map((po) => {
            return cps.mapUtil.convertCartesian(po)
          }))
```

一个栗子（VUE）：
```vue
<template>
      <button @click="drawPoint"></button>
      <button @click="drawArea"></button>
      <button @click="getCtlPositions"></button>
</template>

<script>
import cps from 'cesium-plotting-symbol'

export default {
  name: 'mapview',
  data () {
    return {
      graphList: []
    }
  },
  methods: {
    drawPoint () {
      this.$data.graphList.push(cps.start(new cps.Point()))
    },
    drawArea () {
      this.$data.graphList.push(cps.start(new cps.Polygon()))
    },
    getCtlPositions () {
      this.$data.graphList.map((graph) => {
        let pos = graph.getCtlPositions()
        if (pos.length === 1) {
          console.log('point:', cps.mapUtil.convertCartesian(pos[0]))
        } else {
          console.log('area:', pos.map((po) => {
            return cps.mapUtil.convertCartesian(po)
          }))
        }
      })
    }
  }
</script>
```
