import Cesium from 'cesium/Source/Cesium.js'
import Graph from '../Graph.js'
import * as mu from '../mapUtil.js'

export default class Polygon extends Graph {
  ent

  constructor (id) {
    super(id)
    this.initShape()
  }

  initProps () {
    super.initProps()
    this.props.color = {
      value: '#00ff00', title: '颜色', type: 'color'
    }
    this.props.alpha = {
      value: 0.8, title: '透明度', type: 'number', step: 0.05, max: 1, min: 0
    }
  }

  initShape() {
    this.ent = this.addShape({
      id: 'arrow1_' + Graph.seq++,
      polygon: {
        fill: true,
        material: new Cesium.ColorMaterialProperty(
          new Cesium.CallbackProperty((time, result) => {
            let c = Cesium.Color.fromCssColorString(this.props.color.value)
            return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
          }, false)),
        height: 0,
        outline: false
      }
    })
  }

  addHandler (ctlPoint, ctl) {
    if (ctl._children.length === 1) {      
      this.ent.polygon.hierarchy = new Cesium.CallbackProperty((time, result) => {
        return this.calcuteShape(this.graph.ctl._children.concat(window.cursor), time)
      }, false)
    }
  }
  
  calcuteShape (points, time) {
    return points.map(ent => ent.position.getValue(time))
  }

  toEdit () {
    super.toEdit()
    this.ent.polygon.hierarchy = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.graph.ctl._children, time)
    }, false)
  }

  finish () {
    if (this.ent) {
      super.finish()
      this.ent.polygon.hierarchy = this.calcuteShape(this.graph.ctl._children, mu.julianDate())
    }
  }
}
