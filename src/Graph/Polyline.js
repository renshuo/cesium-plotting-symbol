import Cesium from 'cesium/Source/Cesium.js'
import Graph from '../Graph'

export default class Polyline extends Graph {
  ent

  addHandler (ctlPoint, ctl) {
    if (ctl._children.length === 1) {
      this.ent = new Cesium.Entity({
        id: 'arrow1_' + Graph.seq++,
        polyline: {
          positions: new Cesium.CallbackProperty((time, result) => {
            return this.calcuteShape(this.graph.ctl._children.concat(window.cursor), time)
          }, false),
          width: 1,
          fill: true,
          material: new Cesium.Color(0.98, 0.5, 0.265, 0.8),
          height: 0,
          outline: true,
          outlineWidth: 1,
          outlineColor: Cesium.Color.fromCssColorString('#fd7f44')
        }
      })
      this.addShape(this.ent)
    }
  }

  calcuteShape (points, time) {
    return points.map(ent => ent.position.getValue(time))
  }

  highLight (enabled) {
    if (enabled) {
      this.ent.polyline.outlineWidth = 5
      this.ent.parent.parent.ctl.show = true
    } else {
      this.ent.polyline.outlineWidth = 1
      this.ent.parent.parent.ctl.show = false
    }
  }

  toEdit () {
    this.highLight(true)
    this.ent.polyline.positions.setCallback((time, result) => {
      return this.calcuteShape(this.graph.ctl._children, time)
    }, false)
  }

  finish () {
    console.debug('finish Polyline graph: ', this)
    if (this.ent) {
      this.highLight(false)
      this.ent.polyline.positions.setCallback((time, result) => {
        return this.calcuteShape(this.graph.ctl._children, time)
      }, true)
    }
  }
}
