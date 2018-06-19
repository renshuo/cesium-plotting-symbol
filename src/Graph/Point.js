import Graph from '../Graph'
import Cesium from 'cesium/Source/Cesium.js'
import * as mu from '../mapUtil.js'

export default class Point extends Graph {
  maxPointNum = 1
  ent

  constructor (id) {
    super(id)
    this.initShape()
  }

  initShape() {
    this.ent = this.addShape({
      id: 'point_' + Graph.seq++,
      point: {
        pixelSize: new Cesium.CallbackProperty((time, result) => this.pixelSize, false),
        color: new Cesium.CallbackProperty((time, result) => {
          if (this.highLighted) {
            return Cesium.Color.fromBytes(...this.color, this.alpha*256).brighten(0.6, new Cesium.Color())
          } else {
            return Cesium.Color.fromBytes(...this.color, this.alpha*256)
          }
        }, false),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      }
    })
    this.pixelSize = 12
    this.color = [ 0, 128, 255]
    this.alpha = 0.80
    this.propEditor.add(this, 'pixelSize', 1, 256)
    this.propEditor.addColor(this, 'color')
    this.propEditor.add(this, 'alpha', 0, 1)
  }

  addHandler (ctlPoint, ctl) {
    this.ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.graph.ctl._children[0], time)
    }, false)
  }

  calcuteShape (ctlPoint, time) {
    return ctlPoint.position.getValue(time)
  }

  toEdit () {
    super.toEdit()
    this.ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.graph.ctl._children[0], time)
    }, false)
  }

  finish () {
    if (this.ent) {
      super.finish()
      this.ent.position = this.calcuteShape(this.graph.ctl._children[0], mu.julianDate())
    }
  }
}
