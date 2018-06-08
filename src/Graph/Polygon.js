import Cesium from 'cesium/Source/Cesium.js'
import Graph from '../Graph'

export default class Polygon extends Graph {
  ent

  addHandler (ctlPoint, ctl) {
    if (ctl._children.length === 2) {
      this.ent = new Cesium.Entity({
        id: 'arrow1_' + Graph.seq++,
        polygon: {
          hierarchy: new Cesium.CallbackProperty((time, result) => {
            return this.calcuteShape(this.graph.ctl._children.concat(window.cursor), time)
          }, false),
          fill: true,
          material: new Cesium.Color(0.98, 0.5, 0.265, 0.2),
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
      this.ent.polygon.material.color.setValue(new Cesium.Color(0.98, 0.5, 0.265, 0.4).brighten(0.6, new Cesium.Color()))
      this.ent.parent.parent.ctl.show = true
    } else {
      this.ent.polygon.material.color.setValue(new Cesium.Color(0.98, 0.5, 0.265, 0.2))
      this.ent.parent.parent.ctl.show = false
    }
  }

  toEdit () {
    this.highLight(true)
    this.ent.polygon.hierarchy.setCallback((time, result) => {
      return this.calcuteShape(this.graph.ctl._children, time)
    }, false)
  }

  finish () {
    if (this.ent) {
      this.highLight(false)
      this.ent.polygon.hierarchy.setCallback((time, result) => {
        return this.calcuteShape(this.graph.ctl._children, time)
      }, true)
    }
  }
}
