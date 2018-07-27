# cesium-plotting-symbol
基于cesiumn的标绘插件

## 支持图形
1. [点类型](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/Point)
    1. 点
    2. 3D模型
2. [线](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/Polyline)
    1. 2阶bezier曲线
    2. 3阶bezier曲线
    3. N阶bezier曲线
    4. bezier平滑线
    5. 圆弧线
    6. 折线
3. [多边形](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/Polygon)
    1. 多边形
    2. 矩形
    3. 椭圆
    4. 圆形
4. 其他
    1. 单箭头
5. [贴图类](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/Image)
    3. 红旗

## 安装
```bash
npm install cesium-plotting-symbol --save
```

## 引入： 
```javascript
import cps from 'cesium-plotting-symbol'
```
## 属性编辑窗
```html
<prop-editor /> <!-- 在html template 中插入prop-editor组件 -->
```

```javascript
export default {
  components: {
    'prop-editor': cps.PropEditor // 在vue中注册cps.PropEditor
  }
}
```

## 开始绘图
用户通过鼠标和键盘控制图形的绘制过程
```javascript
let graph = cps.start(new cps.Point())
```
或
```javascript
let graph = cps.start({obj: 'Point'})
```

## 直接绘图
根据传入的参数直接绘制图形到地图上
```javascript
let graph = cps.draw({obj: 'Point', color: '#00f', pixelSize: 12, alpha: 0.8, ctls: [{lon: 110, lat: 45}]})
```
在经纬度（110, 45）绘制一个大小为12, 蓝色，透明度0.8的点。

## 获取标绘的控制点信息
graph是new cps.Point()的结果，用来持有图形对象，目前提供以下功能：
graph.getCtlPositions() // 返回图形的所有控制点的坐标，
```javascript
    graph.getCtlPositions().map((po) => {
            return cps.mapUtil.convertCartesian(po)
          }))
```

## 删除，清除图形
```javascript
cps.delete()
```
删除当前选中的图形

```javascript
cps.deleteAll()
```
删除所有图形

```javascript
let json = cps.save()
```
保存当前所有标绘到一个json对象列表

```javascript
cps.load(json)
```
从json中获取标绘图形列表，并直接绘制在地图上


## 快捷键
#### 查看模式
#### 创建模式
#### 选择模式
'ctrl+shift+d', 'shift+delete': 清除所有图形
#### 编辑模式
'delete', 'ctrl+d': 删除当前正在编辑的图形
#### 控制点编辑模式


## 一个栗子（VUE）：
```html
<template>
      <button @click="drawPoint"></button>
      <button @click="drawArea"></button>
      <button @click="getCtlPositions"></button>
</template>
```
```javascript
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
      this.$data.graphList.push(cps.start({obj: 'Polygon'}))
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
```
具体栗子见(https://github.com/renshuo/cesium-plotting-symbol/tree/master/dev/TopPane.vue)