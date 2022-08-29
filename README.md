# cesium-plotting-symbol
基于cesiumn的标绘，支持VUE3

## 支持图形
1. [贴图类](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/cps/Image)
   1. 红旗
   2. 地面贴图
2. [3D模型](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/cps/Model)
   1. 地面模型（地面站）
   2. 带有高度的参数的模型（卫星）
3. [图钉](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/cps/Pin)
   1. 文本图钉
   2. 图标图钉
   3. 图片图钉
   4. 自定义图片图钉
4. [点类型](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/cps/Point)
   1. 单点
5. [多边形](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/cps/Polygon)
   1. 单箭头
   2. 圆形
   3. 圆弧面
   4. 椭圆
   5. 方型旗
   6. 三角旗
   7. 多段线
   8. 钳击箭头
   9. 多边形
   10. 矩形
   11. 扇形
   12. 平滑面
   13. 方箭头
6. [线](https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/cps/Polyline)
   1. 2阶bezier曲线
   2. 3阶bezier曲线
   3. N阶bezier曲线
   4. bezier平滑线
   5. 圆弧线
   6. 带顶点的折线
   7. 带顶点的平滑线
   8. 多段线
   9. 线段
7. 测量工具
   1. 距离测量
   2. 角度测量
   3. 面积测量


## 安装
```bash
npm install cesium-plotting-symbol --save
```
注意： 需要将cesium的公共资源（cesium/Build/Cesium）复制到你的项目的public（或者static）目录下，保证下列路径正确：
```
/public/Cesium/Widgets/widgets.css
```

## 引入： 
```javascript
import {GraphManager} from 'cesium-plotting-symbol'
```

## 创建 GraphManager的实例
```javascript
  let gm = new GraphManager(viewer, {
    layerId: 'testbh1',
    editAfterCreate: true
  }
```
viewer是cesium的 Cesium.Viewer的实例


## 属性编辑窗
可以使用内置的propEditor：
```javascript
import PropEditor from 'cesium-plotting-symbol/PropEditor/index.vue'
```
```html
<PropEditor ref="propEdit" /> <!-- 在html template 中插入prop-editor组件 -->
```
让propHandler响应Graph Select事件：
```javascript
  const propEdit = ref();
  gm.value.setGraphSelectHandler( (ent: Graph) => {
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
```

也可以使用自定义的属性编辑功能，gm.value.setGraphSelectHandler 可以指定一个图形选择函数，当某个图形被选择时，会调用此方法。
ent.props 和 ent.propDefs 分别是此图形的属性值json和属性定义数据。当外部修改ent.props中的内容时，系统会根据新的数据更新当前图形。


## 开始绘图
通过鼠标和键盘控制图形的绘制过程
```javascript
gm.create({obj: 'Polygon', color: '#00FF00'})
```

## 直接绘图
根据传入的参数直接绘制图形到地图上
```javascript
gm.draw({obj: 'Point', color: '#00f', pixelSize: 12, alpha: 0.8, ctls: [{lon: 110, lat: 45}]})
```
在经纬度（110, 45）绘制一个大小为12, 蓝色，透明度0.8的点。

## 获取标绘的控制点信息
graph是gm.create()的返回值，用来持有图形对象，目前提供以下功能：
graph.getCtlPositions() // 返回图形的所有控制点的坐标，
```javascript
    graph.getCtlPositions().map((po) => {
            return gm.mapUtil.convertCartesian(po)
          }))
```

## 模式
### 观察模式
观察模式下，不能对图形作任何操作，进入观察模式：
```typescritp
  gm.finish()
```
### 选择模式
选择模式下，鼠标经过图形时，图形会高亮，点击鼠标左键可以选择图形，并进入图形编辑模式，以下代码进入选择模式：
```typescript
    gm.start()
```
### 图形编辑模式
在图形编辑模式下，当前图形的控制点和辅助线是可见的，并且鼠标可以拾取控制点，放下控制点，通过对控制点的移动实现对图形的编辑。


## 删除，清除图形
删除当前选中的图形
```javascript
gm.delete()
```


删除所有图形
```javascript
gm.deleteAll()
```


保存当前所有标绘到一个json对象列表
```javascript
let json = cps.save()
```


从json中获取标绘图形列表，并直接绘制在地图上
```javascript
gm.load(json)
```


## 快捷键
#### 查看模式
#### 创建模式
#### 选择模式
'ctrl+shift+d', 'shift+delete': 清除所有图形
#### 编辑模式
'delete', 'ctrl+d': 删除当前正在编辑的图形
#### 控制点编辑模式


## demo（VUE3）：
见(https://github.com/renshuo/cesium-plotting-symbol/tree/master/src/App.vue)
