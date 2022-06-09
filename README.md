# cesium-plotting-symbol
基于cesiumn的标绘，支持VUE3

## 支持图形
1. [点类型](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/cps/Point)
    1. 点
       1. 单点
       2. 文本图钉
       3. 图标图钉
       4. 图片图钉
       5. 自定义图片图钉
    2. 3D模型
       1. 地面模型
       2. 带有高度的参数的模型
2. [线](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/cps/Polyline)
    1. 多段直线
    1. 2阶bezier曲线
    2. 3阶bezier曲线
    3. N阶bezier曲线
    4. bezier平滑线
    5. 圆弧线
    6. 带顶点的折线
    7. 带顶点的平滑线
3. [多边形](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/cps/Polygon)
    1. 多边形
    2. 矩形
    3. 椭圆
    4. 圆形
4. 其他
    1. 单箭头
5. [贴图类](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/cps/Image)
    1. 红旗
    2. 地面贴图

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
<PropEditor ref="propEdit" /> <!-- 在html template 中插入prop-editor组件 -->
```

```javascript
import {PropEditor} from 'cesium-plotting-symbol'
```

创建cps实例时，需要将propEditor作为参数传递给cps
```javascript
  new cps(viewer, {
    propEditor: popEdit,
    layerId: 'testbh1',
    editAfterCreate: true
  })
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


## demo（VUE3）：
见(https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/TopPane.vue)
