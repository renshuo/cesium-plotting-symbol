import * as Cesium from 'cesium';
import Graph from '../Graph'
import * as mu from '../mapUtil'


export default class Polyline extends Graph {

  minPointNum = 2

  constructor(prop: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '折线',
      width: 5,
      fill: true,
      ...prop
    }, viewer, layer)
    this.propDefs.push(
      { name: 'width', title: '线宽', type: 'number', editable: true, min: 1, max: 256 },
      { name: 'fill', title: '是否填充', type: 'boolean', editable: true },
    )
  }

  /**
   * polyline类型的图形的默认辅助线造型
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
    let ent = this.entities.add(new Cesium.Entity({
      name: '画线',
      polyline: {
        width: new Cesium.CallbackProperty((time, result) => this.props.width, true),
        material: new Cesium.ColorMaterialProperty(
          new Cesium.CallbackProperty(() => {
            let c = Cesium.Color.fromCssColorString(this.props.color).withAlpha(this.props.alpha)
            return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
          }, true)),
        positions: new Cesium.CallbackProperty((time, result) => {
          return this.calcuteShape(this.ctls, time)
        }, false),
        clampToGround: true,
      }
    }))
    this.fillShape(ent)
  }

  calcuteShape (ctls: Array<Cesium.Entity>, time: Cesium.JulianDate) {
    return ctls.map(ent => ent.position?.getValue(time))
  }

  toEdit () {
    super.toEdit()
    let ent = this.shapes[0]
    ent.polyline.positions = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.ctls, time)
    }, false)
  }

  finish () {
    super.finish()
    if (this.shapes.length> 0) {
      this.shapes[0].polyline.positions = this.calcuteShape(this.ctls, mu.julianDate(new Date()))
    }
  }
}
