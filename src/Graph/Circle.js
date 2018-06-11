import Graph from '../Graph'
import Cesium from 'cesium/Source/Cesium.js'
import * as mu from '../mapUtil.js'

export default class Circle extends Graph {
  maxPointNum = 2
  ent
  
  center
  outer

  radius

  addHandler (ctlPoint, ctl) {
    if (ctl._children.length === 1) {
      this.center = ctlPoint
      this.ent = this.addShape({
        id: 'arrow1_' + Graph.seq++,
        position: this.center.position,
        ellipse: {
          semiMajorAxis: new Cesium.CallbackProperty((time, result) => {
            return this.calcuteRadius(this.center, window.cursor, time)
          }, false),
          semiMinorAxis: new Cesium.CallbackProperty((time, result) => {
            return this.calcuteRadius(this.center, window.cursor, time)
          }, false),
          material: new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty((time, result) => {
            if (this.highLighted) {
              return new Cesium.Color(0.98, 0.5, 0.265, 0.8).brighten(0.6, new Cesium.Color())
            } else {
              return new Cesium.Color(0.98, 0.5, 0.265, 0.8)
            }
          }, false)),
          outline: true,
          outlineWidth: 1,
          outlineColor: Cesium.Color.fromCssColorString('#fd7f44')
        }
      })
    } else if (ctl._children.length === 2) {
      this.outer = ctlPoint
    }
  }

  calcuteRadius (center, outer, time) {
    console.debug('radius: ', center, outer)
    return mu.distance(center.position.getValue(time), outer.position.getValue(time))
  }

  toEdit () {
    this.ent.parent.parent.ctl.show = true
    this.ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.center.position.getValue(time)
    }, false)
    this.ent.ellipse.semiMajorAxis = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteRadius(this.center, this.outer, time)
    }, false)
    this.ent.ellipse.semiMinorAxis = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteRadius(this.center, this.outer, time)
    }, false)
  }

  finish () {
    if (this.ent) {
      let time = mu.julianDate()
      this.ent.parent.parent.ctl.show = false
      this.ent.position = this.center.position.getValue(time)
      let radius = this.calcuteRadius(this.center, this.outer, time)
      this.ent.ellipse.semiMajorAxis = radius
      this.ent.ellipse.semiMinorAxis = radius
    }
  }
}
