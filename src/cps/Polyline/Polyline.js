import * as Cesium from 'cesium';
import Graph from '../Graph.js'
import * as mu from '../mapUtil.js'

export default class Polyline extends Graph {

  minPointNum = 2

  constructor (prop, viewer, layer) {
    super({
      type: '折线',
      width: 1,
      color: '#00FF00',
      alpha: 0.8,
      fill: true,
      ...prop
    }, viewer, layer)
  }

  initProps (defs) {
    super.initProps([
      {name: 'color', title: '颜色', type: 'color'},
      {name: 'alpha', title: '透明度', type: 'number', step: 0.05, max: 1, min: 0},
      {name: 'width', title: '线宽', type: 'number', min: 1, max: 256},
      ...defs
    ])
  }
  
  initShape() {
    this.ent = this.entities.add(new Cesium.Entity({polyline: {}, name: '画线'}))
    this.fillShape(this.ent)
    Object.assign(this.ent.polyline, {
      width: new Cesium.CallbackProperty((time, result) => this.ent.propx.width.value, true),
      fill: true,
      material: new Cesium.ColorMaterialProperty(
        new Cesium.CallbackProperty(() => {
          let c = Cesium.Color.fromCssColorString(this.ent.propx.color.value).withAlpha(this.ent.propx.alpha.value)
          return this.ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
        }, true)),
      height: 0,
      outline: true,
      outlineWidth: 1,
      outlineColor: Cesium.Color.fromCssColorString('#fd7f44'),
      positions: new Cesium.CallbackProperty((time, result) => {
        return this.calcuteShape(this.graph.ctl._children.concat(window.cursor), time)
      }, false)
    })
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
