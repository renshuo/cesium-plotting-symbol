import Graph from '../Graph.js'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil.js'
import Point from './Point'

export default class Model extends Graph {

  maxPointNum = 1
  minPointNum = 1

  constructor (p, viewer, layer) {
    super({
      type: '3D模型',
      color: '#ffffff',
      alpha: 0.8,
      scale: 30,
      uri: 'boat.gltf',
      ...p
    }, viewer, layer)
  }

  initProps (defs) {
    super.initProps([
      {name: 'color', title: '颜色', type: 'color'},
      {name: 'alpha', title: '透明度', type: 'number', step: 0.05, max: 1, min: 0},
      {name: 'scale', title: '缩放', type: 'number', min: 10, max: 100},
      {name: 'uri', title: '模型', type: 'string'},
      ...defs
    ])
  }

  initShape() {
    this.ent = this.entities.add(new Cesium.Entity({model: {}}))
    this.fillShape(this.ent)
    Object.assign(this.ent.model, {
      uri: new Cesium.CallbackProperty((time, result) => '../../../static/model/' + this.ent.propx.uri.value, true),
      scale: new Cesium.CallbackProperty((time, result) => this.ent.propx.scale.value, true),
      color: new Cesium.CallbackProperty((time, result) => {
        let c = Cesium.Color.fromCssColorString(this.ent.propx.color.value).withAlpha(this.ent.propx.alpha.value)
        return this.ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
      }, true)
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
