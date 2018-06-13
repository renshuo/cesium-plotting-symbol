import Graph from '../Graph'
import Cesium from 'cesium/Source/Cesium.js'
import * as mu from '../mapUtil.js'

export default class Circle extends Graph {
  maxPointNum = 3
  ent
  
  center
  p1
  p2

  radius

  addHandler (ctlPoint, ctl) {
    if (ctl._children.length === 1) {
      this.center = ctlPoint
      this.ent = this.addShape({
        id: 'arrow1_' + Graph.seq++,
        position: this.center.position,
        ellipse: {
          material: new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty((time, result) => {
            if (this.highLighted) {
              return new Cesium.Color(0.98, 0.5, 0.265, 0.4).brighten(0.6, new Cesium.Color())
            } else {
              return new Cesium.Color(0.98, 0.5, 0.265, 0.2)
            }
          }, false)),
          outline: true,
          outlineWidth: 1,
          outlineColor: Cesium.Color.fromCssColorString('#fd7f44')
        }
      })
      this.ent.ellipse.semiMajorAxis = new Cesium.CallbackProperty((time, result) => {
        return this.calcuteRadius(this.center, window.cursor, time)
      }, false)
      this.ent.ellipse.semiMinorAxis = new Cesium.CallbackProperty((time, result) => {
        return this.calcuteRadius(this.center, window.cursor, time)
      }, false)
    } else if (ctl._children.length === 2) {
      this.p1 = ctlPoint
      this.ent.ellipse.semiMajorAxis = new Cesium.CallbackProperty((time, result) => {
        return this.calcuteMajor(this.center, this.p1, window.cursor, time)
      }, false)
      this.ent.ellipse.semiMinorAxis = new Cesium.CallbackProperty((time, result) => {
        return this.calcuteMinor(this.center, this.p1, window.cursor, time)
      }, false)
    } else if (ctl._children.length === 3) {
      this.p2 = ctlPoint
    }
  }

  calcuteMajor (center, p1, p2, time) {
    let d1 = mu.distance(center.position.getValue(time), p1.position.getValue(time))
    let d2 = mu.distance(center.position.getValue(time), p2.position.getValue(time))
    return d1 > d2 ? d1 : d2
  }

  calcuteMinor (center, p1, p2, time) {
    let d1 = mu.distance(center.position.getValue(time), p1.position.getValue(time))
    let d2 = mu.distance(center.position.getValue(time), p2.position.getValue(time))
    return d1 < d2 ? d1 : d2
  }

  calcuteRadius (center, outer, time) {
    let distance = mu.distance(center.position.getValue(time), outer.position.getValue(time))
    return distance === 0 ? 1 : distance // distance=0 make cesium ellipse cartesian convert error
  }

  toEdit () {
    this.ent.parent.parent.ctl.show = true
    this.ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.center.position.getValue(time)
    }, false)
    this.ent.ellipse.semiMajorAxis = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteMajor(this.center, this.p1, this.p2, time)
    }, false)
    this.ent.ellipse.semiMinorAxis = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteMinor(this.center, this.p1, this.p2, time)
    }, false)
  }

  finish () {
    if (this.ent) {
      let time = mu.julianDate()
      this.ent.parent.parent.ctl.show = false
      this.ent.position = this.center.position.getValue(time)
      this.ent.ellipse.semiMajorAxis = this.calcuteMajor(this.center, this.p1, this.p2, time)
      this.ent.ellipse.semiMinorAxis = this.calcuteMinor(this.center, this.p1, this.p2, time)
    }
  }
}