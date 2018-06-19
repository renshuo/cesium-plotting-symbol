import Cesium from 'cesium/Source/Cesium.js'
import Graph from '../Graph'
import * as mu from '../mapUtil.js'

export default class Polyline extends Graph {
  ent

  width = 1
  color = [ 0, 255, 0]
  alpha = 0.80

  constructor (id) {
    super(id)
    this.initShape()
  }

  initShape() {
    this.ent = this.addShape({
      id: 'arrow1_' + Graph.seq++,
      polyline: {
        width: new Cesium.CallbackProperty((time, result) => this.width, false),
        fill: true,
        material: new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty((time, result) => {
          if (this.highLighted) {
            return Cesium.Color.fromBytes(...this.color, this.alpha*256).brighten(0.6, new Cesium.Color())
          } else {
            return Cesium.Color.fromBytes(...this.color, this.alpha*256)
          }
        }, false)),
        height: 0,
        outline: true,
        outlineWidth: 1,
        outlineColor: Cesium.Color.fromCssColorString('#fd7f44')
      }
    })
    this.propEditor.addColor(this, 'color')
    this.propEditor.add(this, 'width')
    this.propEditor.add(this, 'alpha', 0, 1)
  }

  addHandler (ctlPoint, ctl) {
    if (ctl._children.length === 1) {
      this.ent.polyline.positions = new Cesium.CallbackProperty((time, result) => {
        return this.calcuteShape(this.graph.ctl._children.concat(window.cursor), time)
      }, false)
    }
  }

  calcuteShape (points, time) {
    return points.map(ent => ent.position.getValue(time))
  }

  toEdit () {
    super.toEdit()
    this.ent.polyline.positions = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.graph.ctl._children, time)
    }, false)
  }

  finish () {
    if (this.ent) {
      super.finish()
      this.ent.polyline.positions = this.calcuteShape(this.graph.ctl._children, mu.julianDate())
    }
  }
}
