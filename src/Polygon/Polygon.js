import Cesium from 'cesium/Source/Cesium.js'
import Graph from '../Graph.js'
import * as mu from '../mapUtil.js'

export default class Polygon extends Graph {

  minPointNum = 2

  constructor (prop, viewer, layer) {
    super({
      type: '多边形',
      color: '#00FF00',
      alpha: 0.8,
      fill: true,
      outline: true,
      outlineColor: '#000',
      outlineWidth: 2,
      ...prop
    }, viewer, layer)
  }

  initProps (defs) {
    super.initProps([
      {name: 'color', title: '颜色', type: 'color'},
      {name: 'rotation', title: '旋转', type: 'number', step: 0.1},
      {name: 'material', title: '贴图', type: 'string', show: false},
      {name: 'alpha', title: '透明度', type: 'number', step: 0.05, max: 1, min: 0},
      {name: 'fill', title: '填充', type: 'boolean'},
      {name: 'outline', title: '边框', type: 'boolean'},
      {name: 'outlineColor', title: '边框颜色', type: 'color'},
      {name: 'outlineWidth', title: '边框宽度', type: 'number', step: 1, min: 1, max: 100},
      ...defs
    ])
  }

  initShape() {
    this.ent = this.entities.add(new Cesium.Entity({polygon: {}}))
    this.fillShape(this.ent)
    let material = this.ent.propx.material.value
    material = material !== undefined && material !== '' && material.slice(0, 10) === 'data:image'
             ? material
             : 'data:image/jpeg;base64,' + material
    material = new Cesium.ImageMaterialProperty({
      image: material,
      color: new Cesium.CallbackProperty( () => {
        let c = Cesium.Color.fromCssColorString(this.ent.propx.color.value).withAlpha(this.ent.propx.alpha.value)
        return this.ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
      }, false)
    })
    /* if (material !== undefined && material !== '' ) {
     *   material = new Cesium.ImageMaterialProperty({
     *     image: material,
     *     color: new Cesium.CallbackProperty( () => {
     *       let c = Cesium.Color.fromCssColorString(this.ent.propx.color.value).withAlpha(this.ent.propx.alpha.value)
     *       return this.ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
     *     }, false)
     *   })
     * } else {
     *   material = new Cesium.ColorMaterialProperty(
     *     new Cesium.CallbackProperty( () => {
     *       let c = Cesium.Color.fromCssColorString(this.ent.propx.color.value).withAlpha(this.ent.propx.alpha.value)
     *       return this.ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
     *     }, false))
     * } */

    Object.assign(this.ent.polygon, {
      fill: new Cesium.CallbackProperty((time, result) => this.ent.propx.fill.value, false),
      material: material,
      stRotation: new Cesium.CallbackProperty((time, result) => {
        return this.ent.propx.rotation.value*3.14/180 // convert degree to radian
      }, false),
      outline: new Cesium.CallbackProperty((time, result) => this.ent.propx.outline.value, false),
      outlineColor: new Cesium.CallbackProperty(() => {
        let c = Cesium.Color.fromCssColorString(this.ent.propx.outlineColor.value).withAlpha(this.ent.propx.alpha.value)
        return this.ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
      }, false),
      height: 0,
      outlineWidth: new Cesium.CallbackProperty((time, result) => this.ent.propx.outlineWidth.value, true),
      hierarchy: new Cesium.CallbackProperty((time, result) => {
        return this.calcuteShape(this.graph.ctl._children.concat(window.cursor), time)
      }, false)
    })
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
