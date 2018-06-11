import Graph from '../Graph'
import Cesium from 'cesium/Source/Cesium.js'

export default class Point extends Graph {
  maxPointNum = 1
  ent

  addHandler (ctlPoint, ctl) {
    this.ent = this.addShape({
      id: 'point_' + Graph.seq++,
      parent: this.ent,
      position: new Cesium.CallbackProperty((time, result) => {
        return this.calcuteShape(ctlPoint, time)
      }, false),
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromCssColorString('#fd7f44'),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      ctl: ctlPoint
    })
  }
  calcuteShape (ctlPoint, time) {
    return ctlPoint.position.getValue(time)
  }

  highLight (enabled) {
    if (enabled) {
      this.ent.point.color.setValue(new Cesium.Color(0.98, 0.5, 0.265, 0.4).brighten(0.6, new Cesium.Color()))
      this.ent.parent.parent.ctl.show = true
    } else {
      this.ent.point.color.setValue(new Cesium.Color(0.98, 0.5, 0.265, 0.2))
      this.ent.parent.parent.ctl.show = false
    }
  }

  toEdit () {
    this.highLight(true)
    this.ent.position.setCallback((time, result) => {
      return this.calcuteShape(this.graph.ctl._children[0], time)
    }, false)
  }

  finish () {
    if (this.ent) {
      this.highLight(false)
      this.ent.position.setCallback((time, result) => {
        return this.calcuteShape(this.graph.ctl._children[0], time)
      }, true)
    }
  }
}
