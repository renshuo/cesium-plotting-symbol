import * as mu from './mapUtil.js'
import Cesium from 'cesium/Source/Cesium.js'
import _ from 'lodash'

export default class Graph {
  static seq = new Date().getTime()
  entities

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
   */

  highLighted

  properties = {}
  props = {}

  constructor (properties, viewer, layer) {
    if (!viewer) {
      throw 'get null viewer.'
    }
    this.entities = viewer.entities
    this.properties = {
      level: 0,
      ...properties
    }
    this.initRootEntity(layer)
    this.initProps({})
    this.initShape()
    this.initCtls(properties)
  }

  initProps (defs) {
    [
      {name: 'id', title: '编号', type: 'string', editable: false},
      {name: 'name', title: '名称', type: 'string'},
      {name: 'description', title: '描述', type: 'string'},
      {name: 'level', title: '层', type: 'number', min: -10, max: 10, step: 1},
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

  initRootEntity (layer) {
    this.graph = this.entities.add({
      id: layer.id + '_graph_' + Graph.seq++,
      parent: layer
    })
    this.graph.graphType = 'entity'
    this.graph.ctl = this.entities.add({
      id: this.graph.id + '__ctl',
      parent: this.graph,
      graphType: 'ctlRoot',
      show: true
    })
    this.graph.shape = this.entities.add({
      id: this.graph.id + '__shape',
      parent: this.graph,
      graphType: 'shapeRoot',
      show: true
    })
  }

  initShape () {
    throw 'should overide by sub class.'
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

  addCtl (cartesian3) {
    let pos = mu.cartesian2lonlat(cartesian3)
    let ctlPoint = this.entities.add({
      id: this.graph.id + '_ctlpoint_' + Graph.seq++,
      parent: this.graph.ctl,
      position: cartesian3,
      graphType: 'ctl',
      point: {
        pixelSize: 8,
        color: Cesium.Color.fromBytes(255, 255, 255, 70),
        outlineWidth: 1,
        outlineColor: Cesium.Color.AQUA
      },
      label: {
        text: 'Lon: ' + pos[0].toPrecision(5) + '\u00B0' +
        '\nLat: ' + pos[1].toPrecision(5) + '\u00B0',
        font : '12px monospace',
        horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
        verticalOrigin : Cesium.VerticalOrigin.TOP,
        pixelOffset : new Cesium.Cartesian2(15, 0)
      }
    })
    ctlPoint.finish = () => {
      ctlPoint.label.text = ctlPoint.label.text.getValue(Cesium.JulianDate.fromDate(new Date()))
      ctlPoint.position = ctlPoint.position.getValue(Cesium.JulianDate.fromDate(new Date()))
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
    console.log('added a ctl: ', ctlPoint)
    this.handleNewCtl(ctlPoint)
    return ctlPoint
  }

  handleNewCtl (ctl) {
  }

  addCtlPoint (pos) {
    let c3 = mu.lonlathei2Cartesian(pos)
    this.addCtl(c3)
  }

  fillShape (ent) {
    if (this.props.id.value === undefined || this.props.id.value === '') {
      this.props.id.value = ent.id
    }
    ent.parent = this.graph.shape
    ent.graphType = 'shp'
    ent.seq = Graph.seq
    ent.highLighted = false
    ent.highLight = () => ent.highLighted = true
    ent.downLight = () => ent.highLighted = false
    ent.finish = () => this.finish()
    ent.toEdit = () => this.toEdit()
    ent.addCtlPoint = (pos) => this.addCtlPoint(pos)
    ent.ishaveMaxCtls = () => this.ishaveMaxCtls()
    ent.isCtlNumValid = () => this.isCtlNumValid()
    ent.deleteLastPoint = () => this.deleteLastPoint()
    ent.getProperties = () => this.getProperties()
    ent.propx = this.props
    ent.delete = () => this.delete()
    ent.level = new Cesium.CallbackProperty((time, result) => {
      return ent.propx.level.value
    }, true)
    console.log('add a shape : ', ent)
    return ent
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

  /**
   * 进入编辑模式
   */
  toEdit () {
    this.highLighted = false
    this.graph.ctl.show = true
  }
  /**
   * 图形绘制结束后调用
   */
  finish () {
    this.graph.ctl.show = false
  }

  /* ############# delete ############# */

  delete() {
    this.deleteEnts([this.graph])
  }

  deleteEnts (ents) {
    ents.forEach((ent) => {
      if (ent._children.length > 0) {
        this.deleteEnts(ent._children)
      }
      this.entities.remove(ent)
    })
  }

  /**
   * delete last point,
   */
  deleteLastPoint () {
    let e = this.graph.ctl._children.pop()
    this.entities.remove(e)
    console.log('remove last control point: ', e)
  }

  /**
   * delelte a point in list
   * @param {ctlPoint} ctlPoint
   */
  deleteCtlPoint (ctlPoint) {
    let i = this.graph.ctl._children.indexOf(ctlPoint)
    this.graph.ctl._children.splice(i, 1)
    this.entities.remove(ctlPoint)
  }
}
