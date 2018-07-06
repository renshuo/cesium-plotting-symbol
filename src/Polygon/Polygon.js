import Cesium from 'cesium/Source/Cesium.js'
import Graph from '../Graph.js'
import * as mu from '../mapUtil.js'

export default class Polygon extends Graph {

  minPointNum = 3
  
  constructor (prop) {
    super({
      type: '多边形',
      color: '#00FF00',
      alpha: 0.8,
      fill: true,
      ...prop
    })
  }

  initProps (p) {
    super.initProps(p)
    this.props.color = {
      value: p.color, title: '颜色', type: 'color'
    }
    this.props.alpha = {
      value: p.alpha, title: '透明度', type: 'number', step: 0.05, max: 1, min: 0
    }
    this.props.fill = {
      value: p.fill, title: 'fill', type: 'boolean'
    }
  }

  initShape() {
    this.ent = this.addShape({
      polygon: {
        fill: new Cesium.CallbackProperty((time, result) => this.props.fill.value, true),
        material: new Cesium.ColorMaterialProperty(
          new Cesium.CallbackProperty((time, result) => {
            let c = Cesium.Color.fromCssColorString(this.props.color.value).withAlpha(this.props.alpha.value)
            return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
          }, false)),
        outline: true
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
    if (points.length < this.minPointNum) {
      return []
    }
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
