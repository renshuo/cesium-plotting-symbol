import Cesium from 'cesium/Source/Cesium.js'
import Graph from '../Graph'

export default class Polyline extends Graph {
  ent

  addHandler (ctlPoint, ctl) {
    if (ctl._children.length === 1) {
      this.ent = this.addShape({
        id: 'arrow1_' + Graph.seq++,
        polyline: {
          positions: new Cesium.CallbackProperty((time, result) => {
            return this.calcuteShape(this.graph.ctl._children.concat(window.cursor), time)
          }, false),
          width: 1,
          fill: true,
          material: new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty((time, result) => {
            if (this.highLighted) {
              return new Cesium.Color(0.98, 0.5, 0.265, 0.8).brighten(0.6, new Cesium.Color())
            } else {
              return new Cesium.Color(0.98, 0.5, 0.265, 0.8)
            }
          }, false)),
          height: 0,
          outline: true,
          outlineWidth: 1,
          outlineColor: Cesium.Color.fromCssColorString('#fd7f44')
        }
      })
    }
  }

  calcuteShape (points, time) {
    return points.map(ent => ent.position.getValue(time))
  }

  toEdit () {
    this.ent.parent.parent.ctl.show = true
    this.ent.polyline.positions.setCallback((time, result) => {
      return this.calcuteShape(this.graph.ctl._children, time)
    }, false)
  }

  finish () {
    console.debug('finish Polyline graph: ', this)
    if (this.ent) {
      this.ent.parent.parent.ctl.show = false
      this.ent.polyline.positions.setCallback((time, result) => {
        return this.calcuteShape(this.graph.ctl._children, time)
      }, true)
    }
  }
}
