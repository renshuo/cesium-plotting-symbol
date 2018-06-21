import * as mu from './mapUtil.js'
import Cesium from 'cesium/Source/Cesium.js'

export default class Graph {
  static seq = new Date().getTime()
  static lastGraph
  viewer
  layer

  /**
   * set max ctl point number
   * when ctlPoints.length >= maxPointNum call this.finish()
   */
  maxPointNum = 9999

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

  props = {}

  name = ''
  description = ''

  constructor (id, viewer = window.viewer) {
    this.viewer = viewer
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
    this.initRootEntity(id)
    this.initProps()
  }

  initProps () {
    this.props.name = {
      value: '', title: '名称', type: 'string'
    }
    this.props.description = {
      value: '', title: '描述', type: 'string'
    },
    this.props.type = {
      value: this.constructor.name, title: '类型', type: 'string', editable: false
    }
  }

  initRootEntity (id) {
    console.log('this layer: ', this.layer)
    this.graph = this.viewer.entities.add({
      id: id === undefined ? this.layer.name + '_graph_' + Graph.seq++ : id,
      parent: this.layer.rootEnt
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



  isFinished () {
    return this.graph.ctl._children.length >= this.maxPointNum
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
    let ent = window.viewer.entities.add(new Cesium.Entity(properties))
    ent.parent = this.graph.shape
    ent.graphType = 'shp'
    ent.seq = Graph.seq
    ent.highLight = () => this.highLight(true)
    ent.downLight = () => this.highLight(false)
    ent.finish = () => this.finish()
    ent.toEdit = () => this.toEdit()
    console.log('add a shape : ', ent)
    return ent
  }

  deleteShape (ent) {
    console.log('delete shap entity.')
    let seq = this.graph.shape._children.indexOf(ent)
    this.graph.shape._children.splice(seq, 1)
    window.viewer.entities.remove(ent)
  }

  getCtlPositions () {
    let dt = Cesium.JulianDate.fromDate(new Date())
    return this.graph.ctl._children.map((ent) => {
      return ent.position.getValue(dt)
    })
  }

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
    this.highLighted = false
    this.ent.parent.parent.ctl.show = true
  }
  /**
   * 图形绘制结束后调用
   */
  finish () {
    this.ent.parent.parent.ctl.show = false
  }
}
