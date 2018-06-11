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
        pixelSize: 12,
        color: new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty((time, result) => {
          if (this.highLighted) {
            return new Cesium.Color(0.98, 0.5, 0.265, 0.8).brighten(0.6, new Cesium.Color())
          } else {
            return new Cesium.Color(0.98, 0.5, 0.265, 0.8)
          }
        }, false)),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
      },
      ctl: ctlPoint
    })
  }
  calcuteShape (ctlPoint, time) {
    return ctlPoint.position.getValue(time)
  }

  toEdit () {
    this.ent.parent.parent.ctl.show = true
    this.ent.position.setCallback((time, result) => {
      return this.calcuteShape(this.graph.ctl._children[0], time)
    }, false)
  }

  finish () {
    if (this.ent) {
      this.ent.parent.parent.ctl.show = false
      this.ent.position.setCallback((time, result) => {
        return this.calcuteShape(this.graph.ctl._children[0], time)
      }, true)
    }
  }
}
