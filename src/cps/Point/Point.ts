import Graph from '../Graph'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil.ts'

export default class Point extends Graph {
  maxPointNum = 1
  minPointNum = 1

  constructor (p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '点',
      pixelSize: 12,
      outlineColor: '#aaaaaa',
      outlineWidth: 2,
      ...p
    }, viewer, layer)
    this.propDefs.push(
      { name: 'pixelSize', title: '大小', type: 'number', editable: true, min: 1, max: 256, step: 1 },
      { name: 'outlineColor', title: '边框颜色', type: 'color', editable: true },
      { name: 'outlineWidth', title: '边框宽度', type: 'number', editable: true, step: 1, min: 0, max: 100 },
    )
  }

  initShape() {
    let ent = this.entities.add(new Cesium.Entity({
      name: '画点',
      point: {
        pixelSize: new Cesium.CallbackProperty((time, result) => this.props.pixelSize, true),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        color: new Cesium.CallbackProperty((time, result) => {
          let c = Cesium.Color.fromCssColorString(this.props.color).withAlpha(this.props.alpha)
          return ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
        }, true),
        outlineColor: new Cesium.CallbackProperty(() => {
          let c = Cesium.Color.fromCssColorString(this.props.outlineColor).withAlpha(this.props.alpha)
          return ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
        }, true),
        outlineWidth: new Cesium.CallbackProperty((time, result) => this.props.outlineWidth, true),
      },
      position: new Cesium.CallbackProperty((time, result) => {
        return this.calcuteShape(this.ctls, time)
      }, true)
    }))
    this.fillShape(ent)
  }

  calcuteShape (points: Array<Cesium.Entity>, time: Cesium.JulianDate) {
    if (points.length < this.minPointNum) {
      return []
    }
    return points[0].position.getValue(time)
  }

  toEdit () {
    super.toEdit()
    let ent = this.shapes[0]
    ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.ctls, time)
    }, true)
  }

  finish () {
    if (this.shapes.length>0) {
      super.finish()
      this.shapes[0].position = this.calcuteShape(this.ctls, mu.julianDate())
    }
  }
}
