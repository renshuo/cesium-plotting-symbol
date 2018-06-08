import {
  convertScreenPos2Cartesian
} from './mapUtil.js'
import Cesium from 'cesium/Source/Cesium.js'

export default class Graph {
  static seq = 0
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

  constructor (id, viewer = window.viewer) {
    this.viewer = viewer
    this.layer = window.layer.biaohui
    if (Graph.lastGraph) {
      Graph.lastGraph.finish()
    }
    Graph.lastGraph = this
    this.initRootEntity(id)
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

  /*
  add a point to map for rule
  */
  addCtlPoint (event) {
    let newpos = convertScreenPos2Cartesian(event.position)
    console.log('added a point: ', newpos)
    let ctlPoint = this.viewer.entities.add({
      id: this.graph.id + '_ctlpoint_' + Graph.seq++,
      parent: this.graph.ctl,
      position: newpos,
      graphType: 'ctl',
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromBytes(255, 255, 255, 80),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        outlineWidth: 1,
        outlineColor: Cesium.Color.AQUA
      }
    })
    this.addHandler(ctlPoint, this.graph.ctl)
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

  addShape (ent) {
    ent.parent = this.graph.shape
    ent.graphType = 'shp'
    ent.seq = Graph.seq
    ent.highLight = () => this.highLight(true)
    ent.downLight = () => this.highLight(false)
    ent.finish = () => this.finish()
    ent.toEdit = () => this.toEdit()
    window.viewer.entities.add(ent)
    console.log('add a shape : ', ent)
  }

  deleteShape (ent) {
    console.log('delete shap entity.')
    let seq = this.graph.shape._children.indexOf(ent)
    this.graph.shape._children.splice(seq, 1)
    window.viewer.entities.remove(ent)
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
    console.log('unimplemented')
  }

  /**
   * 进入编辑模式
   */
  toEdit () {
    console.log('unimplemented')
  }
  /**
   * 图形绘制结束后调用
   */
  finish () {
    console.log('unimplemented')
  }
}
