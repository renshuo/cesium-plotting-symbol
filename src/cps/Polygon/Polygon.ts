import * as Cesium from 'cesium';
import Graph from '../Graph'
import * as mu from '../mapUtil'

export default class Polygon extends Graph {

  minPointNum = 3

  constructor (prop, viewer, layer) {
    super({
      rotation: 0,
      material: '',
      fill: true,
      outline: true,
      outlineColor: '#aaaaaa',
      outlineWidth: 2,
      ...prop
    }, viewer, layer)
    this.propDefs.push(
      { name: 'rotation', title: '旋转', type: 'number', editable: true, min: -360, max: 360, step: 1 },
      { name: 'material', title: '贴图', type: 'string', editable: false },
      { name: 'fill', title: '填充', type: 'boolean', editable: true },
      { name: 'outline', title: '边框', type: 'boolean', editable: true },
      { name: 'outlineColor', title: '边框颜色', type: 'color', editable: true },
      { name: 'outlineWidth', title: '边框宽度', type: 'number', editable: true, step: 1, min: 1, max: 100 },
    )
  }

  initShape() {
    let ent = this.entities.add(new Cesium.Entity({polygon: {}, parent: this.graph}))
    this.fillShape(ent)
    let material = this.props.material
    material = material !== undefined && material !== '' && material.slice(0, 10) === 'data:image'
             ? material
             : 'data:image/jpeg;base64,' + material
    material = new Cesium.ImageMaterialProperty({
      image: material,
      color: new Cesium.CallbackProperty( () => {
        let c = Cesium.Color.fromCssColorString(this.props.color).withAlpha(this.props.alpha)
        return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
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

    Object.assign(ent.polygon, {
      fill: new Cesium.CallbackProperty((time, result) => this.props.fill, false),
      material: material,
      stRotation: new Cesium.CallbackProperty((time, result) => {
        return this.props.rotation*3.14/180 // convert degree to radian
      }, false),
      outline: new Cesium.CallbackProperty((time, result) => this.props.outline, false),
      outlineColor: new Cesium.CallbackProperty(() => {
        let c = Cesium.Color.fromCssColorString(this.props.outlineColor).withAlpha(this.props.alpha)
        return ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
      }, false),
      height: 0,
      outlineWidth: new Cesium.CallbackProperty((time, result) => this.props.outlineWidth, true),
      hierarchy: new Cesium.CallbackProperty((time, result) => {
        let ps = this.calcuteShape(this.ctls.concat(window.cursor), time)
        return new Cesium.PolygonHierarchy(ps, [])
      }, false)
    })
  }

  calcuteShape (points, time) {
    if (points.length < this.minPointNum) {
      return []
    }
    return points.map( (pt) => pt.position.getValue(time))
  }

  toEdit () {
    super.toEdit()
    let shp = this.shapes[0]
    shp.polygon.hierarchy = new Cesium.CallbackProperty((time, result) => {
      return new Cesium.PolygonHierarchy(this.calcuteShape(this.ctls, time), [])
    }, false)
  }

  finish () {
    super.finish()
    if (this.shapes.length > 0) {
      let shp = this.shapes[0]
      shp.polygon.hierarchy = new Cesium.PolygonHierarchy(this.calcuteShape(this.ctls, mu.julianDate(new Date())), [])
    }
  }

}
