import Graph from '../Graph'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil.js'

export default class Point extends Graph {
  maxPointNum = 1
  minPointNum = 1

  constructor (p, viewer, layer) {
    super({
      type: '点',
      pixelSize: 12,
      color: '#00FF00',
      alpha: 0.8,
      ...p
    }, viewer, layer)
  }

  initProps (defs) {
    super.initProps([
      {name: 'color', title: '颜色', type: 'color'},
      {name: 'alpha', title: '透明度', type: 'number', step: 0.05, max: 1, min: 0},
      {name: 'pixelSize', title: '大小', type: 'number', min: 1, max: 256},
      ...defs
    ])
  }

  initShape() {
    this.ent = this.entities.add(new Cesium.Entity({point: {}, name: '画点'}))
    this.fillShape(this.ent)
    Object.assign(this.ent.point, {
      pixelSize: new Cesium.CallbackProperty((time, result) => this.ent.propx.pixelSize.value, true),
      color: new Cesium.CallbackProperty((time, result) => {
        let c = Cesium.Color.fromCssColorString(this.ent.propx.color.value).withAlpha(this.ent.propx.alpha.value)
        return this.ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
      }, true),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    })
    this.ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.graph.ctl._children.concat(window.cursor), time)
    }, false)
  }

  calcuteShape (points, time) {
    if (points.length < this.minPointNum) {
      return []
    }
    return points[0].position.getValue(time)
  }

  toEdit () {
    super.toEdit()
    this.ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.graph.ctl._children, time)
    }, false)
  }

  finish () {
    if (this.ent) {
      super.finish()
      this.ent.position = this.calcuteShape(this.graph.ctl._children, mu.julianDate())
    }
  }
}
