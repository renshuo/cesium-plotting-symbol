import * as Cesium from 'cesium';
import Graph from '../Graph'
import * as mu from '../mapUtil'

export default class Polygon extends Graph {

  minPointNum = 3

  constructor(prop: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      rotation: 0,
      material: '',
      fill: true,
      outline: true,
      outlineColor: '#aaaaaa',
      outlineWidth: 2,
      heightReference: Cesium.HeightReference.NONE,
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

  /**
   * polygon类的图形的默认辅助线造型
   */
  addTempLine(positions: Cesium.CallbackProperty): Cesium.Entity {
    let ent = new Cesium.Entity({
      polyline: {
        width: 1,
        material: Cesium.Color.BLUE.withAlpha(0.7),
        positions: positions
      }
    })
    this.tempShapes.push(this.entities.add(ent))
    return ent
  }

  initShape() {

    let mat = this.props.material
    let ent = this.entities.add(new Cesium.Entity({
      polygon: {
        fill: new Cesium.CallbackProperty((time, result) => this.props.fill, true),
        material: new Cesium.ImageMaterialProperty({
          image: (mat !== undefined && mat !== '' && mat.slice(0, 10) === 'data:image') ? mat : 'data:image/jpeg;base64,' + mat ,
          color: new Cesium.CallbackProperty(() => {
            let c = Cesium.Color.fromCssColorString(this.props.color).withAlpha(this.props.alpha)
            return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
          }, true)
        }),
        stRotation: new Cesium.CallbackProperty((time, result) => {
          return this.props.rotation * 3.14 / 180 // convert degree to radian
        }, false),
        outline: new Cesium.CallbackProperty((time, result) => this.props.outline, true),
        outlineColor: new Cesium.CallbackProperty(() => {
          let c = Cesium.Color.fromCssColorString(this.props.outlineColor).withAlpha(this.props.alpha)
          return ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
        }, true),
        outlineWidth: new Cesium.CallbackProperty((time, result) => this.props.outlineWidth, true),
        hierarchy: new Cesium.CallbackProperty((time, result) => {
          let ps = this.calcuteShape(this.ctls, time)
          return new Cesium.PolygonHierarchy(ps, [])
        }, true),
        height: 0,
        /**
           oneTimeWarning.js:38 Entity geometry outlines are unsupported on terrain. Outlines will be disabled. To enable outlines, disable geometry terrain clamping by explicitly setting height to 0.
           */
        heightReference: new Cesium.CallbackProperty((time, result) => {
          return this.props.heightReference
        }, true)
      },
      parent: this.graph
    }))
    this.fillShape(ent)
  }

  calcuteShape(points: Array<Cesium.Entity>, time: Cesium.JulianDate) {
    if (points.length < this.minPointNum) {
      return []
    }
    return points.map((pt) => pt.position.getValue(time))
  }

  toEdit() {
    super.toEdit()
    let shp = this.shapes[0]
    shp.polygon.hierarchy = new Cesium.CallbackProperty((time, result) => {
      return new Cesium.PolygonHierarchy(this.calcuteShape(this.ctls, time), [])
    }, false)
  }

  finish() {
    super.finish()
    if (this.shapes.length > 0) {
      let shp = this.shapes[0]
      shp.polygon.hierarchy = new Cesium.PolygonHierarchy(this.calcuteShape(this.ctls, mu.julianDate(new Date())), [])
    }
  }

}
