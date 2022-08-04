import * as Cesium from 'cesium';
import Graph from '../Graph'
import * as mu from '../mapUtil'


export default class Polyline extends Graph {

  minPointNum = 2
  isShowTempLine = false

  constructor(prop: {}, viewer: Cesium.Viewer, layer: Cesium.Entity, isShowTempLine: boolean = false) {
    super({
      type: '折线',
      width: 1,
      fill: true,
      ...prop
    }, viewer, layer, isShowTempLine)
    // console.log('propdef', super.propDefs)
    this.propDefs.push(
      { name: 'width', title: '线宽', type: 'number', editable: true, min: 1, max: 256 },
      { name: 'fill', title: '是否填充', type: 'boolean', editable: true },
    )
  }

  initShape() {
    let ent = this.entities.add(new Cesium.Entity({polyline: {}, name: '画线'}))
    this.fillShape(ent)
    Object.assign(ent.polyline, {
      width: new Cesium.CallbackProperty((time, result) => this.props.width, true),
      fill: true,
      material: new Cesium.ColorMaterialProperty(
        new Cesium.CallbackProperty(() => {
          let c = Cesium.Color.fromCssColorString(this.props.color).withAlpha(this.props.alpha)
          return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
        }, true)),
      height: 0,
      outline: true,
      outlineWidth: 1,
      outlineColor: Cesium.Color.fromCssColorString('#fd7f44'),
      positions: new Cesium.CallbackProperty((time, result) => {
        return this.calcuteShape(this.ctls.concat(window.cursor), time)
      }, false)
    })
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
