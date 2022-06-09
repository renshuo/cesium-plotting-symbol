import Graph from '../Graph'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil.js'
import Point from './Point'

export default class Pin extends Graph {

  maxPointNum = 1
  minPointNum = 1

  pinBuilder = new Cesium.PinBuilder()

  constructor (p, viewer, layer) {
    super({
      type: '钉',
      rotation: 0,
      scale: 1,
      width: 30,
      height: 30,
      ...p
    }, viewer, layer)
  }

  initProps (defs) {
    super.initProps([
      {name: 'rotation', title: '旋转', type: 'number', step: 1, max: 360, min: -360},
      {name: 'scale', title: '缩放', type: 'number', min: 0.5, step: 0.1},
      {name: 'width', title: '宽度', type: 'number', step: 1, min: 0},
      {name: 'height', title: '高度', type: 'number', step: 1, min: 0},
      ...defs
    ])
  }

  calcuteShape (points, time) {
    if (points.length < this.minPointNum) {
      return []
    }
    return points[0].position.getValue(time)
  }

  toEdit () {
    super.toEdit()
    this.ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.graph.ctl._children, time)
    }, false)
  }

  finish () {
    if (this.ent) {
      super.finish()
      this.ent.position = this.calcuteShape(this.graph.ctl._children, mu.julianDate())
    }
  }

}
