import * as mu from './mapUtil.js'
import Cesium from 'cesium/Source/Cesium.js'
import _ from 'lodash'

export default class Graph {
  static seq = new Date().getTime()
  static lastGraph
  viewer
  layer

  /**
   * set max ctl point number
   * when ctlPoints.length >= maxPointNum call this.finish()
   */
  maxPointNum = Infinity
  minPointNum = 1

  graph
  /**
   * graph
   *  L ctl (graphType='ctlRoot')
   *      L children (graphType='ctl')
   *  L shape (graphType='shapeRoot')
   *      L children (graphType='shp')
   *  L graph = this
   */

  highLighted

  properties = {}
  props = {}

  name = ''
  description = ''

  constructor (properties, viewer = window.viewer) {
    this.viewer = viewer
    this.properties = {
      level: 0,
      ...properties
    }
    if (!window.layer) {
      window.layer = {biaohui: this.viewer.entities.add({'id': 'biaohui', name: 'biaohui'})}
    } else if (!window.layer.biaohui) {
      window.layer.biaohui = this.viewer.entities.add({'id': 'biaohui', name: 'biaohui'})
    }
    this.layer = window.layer.biaohui
    if (Graph.lastGraph) {
      Graph.lastGraph.finish()
    }
    Graph.lastGraph = this
    this.initRootEntity()
    this.initProps({})
    this.renewProperties(this.props)
    this.initShape()
    this.initCtls(properties)
  }

  initProps (defs) {
    [
      {name: 'id', title: '编号', type: 'string', editable: false},
      {name: 'name', title: '名称', type: 'string'},
      {name: 'description', title: '描述', type: 'string'},
      {name: 'level', title: '层', type: 'number'},
      {name: 'type', title: '类型', type: 'string', editable: false},
      ...defs
    ].forEach(prop => {
      prop.value = this.properties[prop.name]
      this.props[prop.name] = prop
    })
  }

  initCtls (properties) {
    if (properties.ctls) {
      properties.ctls.forEach(pos => {
        let p = {}
        if (pos instanceof Array) {
          if (pos.length === 2) {
            p = {lon: pos[0], lat: pos[1]}
          } else if (pos.length === 3) {
            p = {lon: pos[0], lat: pos[1], hei: pos[2]}
          } else {
            console.log('invalid pos array length: ', pos)
          }
        } else {
          p = pos
        }
        console.log('pos: ', p)
        this.addCtlPoint(p)
      })
    }
  }

  renewProperties (props) {
    // store.dispatch('selected', this.props)
    console.log('props: ', props)
    let ev = document.createEvent('HTMLEvents')
    ev.initEvent('ppe', false, false)
    ev.props = props
    window.dispatchEvent(ev)
  }

  initRootEntity () {
    console.log('this layer: ', this.layer)
    this.graph = this.viewer.entities.add({
      id: this.layer.name + '_graph_' + Graph.seq++,
      parent: this.layer
    })
    this.graph.ctl = this.viewer.entities.add({
      id: this.graph.id + '__ctl',
      parent: this.graph,
      graphType: 'ctlRoot',
      show: true
    })
    this.graph.shape = this.viewer.entities.add({
      id: this.graph.id + '__shape',
      parent: this.graph,
      graphType: 'shapeRoot',
      show: true
    })
    this.graph.graph = this
  }

  initShape () {
    console.log('should overide by sub class.')
  }

  /**
   * 返回当前Graph的属性，以及控制点数据
   */
  getProperties () {
    let p = {
      obj: this.constructor.name
    }
    _.forIn(this.props, (v, k) => {
      p[k] = v.value
    })
    p.ctls = this.getCtlPositions().map(c3 => {
      let lonlat = mu.cartesian2lonlat(c3)
      return {lon: lonlat[0], lat: lonlat[1]}
    })
    return p
  }

  /**
   * 返回当前graph的所有控制点坐标（cartesian3）
   */
  getCtlPositions () {
    let dt = Cesium.JulianDate.fromDate(new Date())
    return this.graph.ctl._children.map((cp) => {
      return cp.position.getValue(dt)
    })
  }

  addCtlPoint (pos, viewer = window.viewer) {
    let ctlPoint = viewer.entities.add({
      id: this.graph.id + '_ctlpoint_' + Graph.seq++,
      parent: this.graph.ctl,
      position: mu.lonlathei2Cartesian(pos),
      graphType: 'ctl',
      point: {
        pixelSize: 8,
        color: Cesium.Color.fromBytes(255, 255, 255, 70),
        outlineWidth: 1,
        outlineColor: Cesium.Color.AQUA
      },
      label: {
        text: 'Lon: ' + pos.lon.toPrecision(5) + '\u00B0' +
        '\nLat: ' + pos.lat.toPrecision(5) + '\u00B0',
        font : '14px monospace',
        horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
        verticalOrigin : Cesium.VerticalOrigin.TOP,
        pixelOffset : new Cesium.Cartesian2(15, 0)
      }
    })
    ctlPoint.finish = () => {
      ctlPoint.label.text = ctlPoint.label.text.getValue(mu.julianDate())
      ctlPoint.position = ctlPoint.position.getValue(mu.julianDate())
    }
    ctlPoint.pickup = () => {
      ctlPoint.label.text = new Cesium.CallbackProperty((time, result) => {
        let p = mu.cartesian2lonlat(ctlPoint.position.getValue(time))
        return 'Lon: ' + p[0].toPrecision(5) + '\u00B0' +
               '\nLat: ' + p[1].toPrecision(5) + '\u00B0'
      }, false)
      ctlPoint.position = new Cesium.CallbackProperty((time, result) => {
        return window.cursorPos.clone()
      }, false)
    }
    console.log('added a point: ', ctlPoint)
    this.addHandler(ctlPoint, this.graph.ctl)
    return ctlPoint
  }

  /**
   * 对于maxPointNum为指定值的图形，返回是否已达到最大ctl数量
   * 比如rectange只需要2个点即可结束绘制
   */
  ishaveMaxCtls () {
    return this.graph.ctl._children.length >= this.maxPointNum
  }

  /**
   * 返回当前ctl数量是否可以绘制图形
   * 无限max点的图形比较min值，比如，polygon至少需要3个点，polyline至少需要2个点... 
   * 对于限定ctl数量的图形，ctlnum >= max 返回true
   */
  isCtlNumValid () {
    let ctlnum = this.graph.ctl._children.length
    if (this.maxPointNum === Infinity){
      return ctlnum >= this.minPointNum
    } else {
      return ctlnum >= this.maxPointNum
    }
  }


  /* ############# delete ############# */

  deleteGraph () {
    console.log('delete this graph: ', this)
    mu.deleteEnts([this.graph])
  }

  /**
   * delete last point,
   */
  deleteLastPoint () {
    let e = this.graph.ctl._children.pop()
    this.viewer.entities.remove(e)
    console.log('remove last control point: ', e)
  }

  /**
   * delelte a point in list
   * @param {ctlPoint} ctlPoint
   */
  deleteCtlPoint (ctlPoint) {
    let seq = this.graph.ctl._children.indexOf(ctlPoint)
    this.graph.ctl._children.splice(seq, 1)
    window.viewer.entities.remove(ctlPoint)
  }

  addShape (properties) {
    if (!properties.id) {
      if (properties.id_prefix) {
        properties.id = properties.id_prefix + Graph.seq++
      } else {
        properties.id = 'shp_' + Graph.seq++
      }
    }
    let ent = window.viewer.entities.add(new Cesium.Entity(properties))
    ent.parent = this.graph.shape
    ent.graphType = 'shp'
    ent.seq = Graph.seq
    ent.highLight = () => this.highLight(true)
    ent.downLight = () => this.highLight(false)
    ent.finish = () => this.finish()
    ent.toEdit = () => this.toEdit()
    ent.level = new Cesium.CallbackProperty((time, result) => {
      return this.props.level.value
    }, true)
    console.log('add a shape : ', ent)
    return ent
  }

  deleteShape (ent) {
    console.log('delete shap entity.')
    let seq = this.graph.shape._children.indexOf(ent)
    this.graph.shape._children.splice(seq, 1)
    window.viewer.entities.remove(ent)
  }

  /* ############## spliter ############## */

  /**
   * 在ctlPoint增加之后被调用
   * @param {Entity} ctlPoint 控制点的实体
   */
  addHandler (ctlPoint, ctl) {
    console.log('unimplemented')
  }

  /**
   * 在选择模式下当鼠标over的时候，或者编辑模式下调用
   * @param {boolean} enable
   */
  highLight (enabled) {
    this.highLighted = enabled
  }

  /**
   * 进入编辑模式
   */
  toEdit () {
    this.renewProperties(this.props)
    this.highLighted = false
    this.graph.ctl.show = true
  }
  /**
   * 图形绘制结束后调用
   */
  finish () {
    this.renewProperties({})
    this.graph.ctl.show = false
  }
}
