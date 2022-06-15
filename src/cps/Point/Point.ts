import Graph from '../Graph'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil.ts'

export default class Point extends Graph {
  maxPointNum = 1
  minPointNum = 1

  constructor (p, viewer, layer) {
    super({
      type: '点',
      pixelSize: 12,
      ...p
    }, viewer, layer)
    this.propDefs.push(
      { name: 'pixelSize', title: '大小', type: 'number', editable: true, min: 1, max: 256, step: 1 },
    )
  }

  initShape() {
    let ent = this.entities.add(new Cesium.Entity({point: {}, name: '画点'}))
    this.fillShape(ent)
    Object.assign(ent.point, {
      pixelSize: new Cesium.CallbackProperty((time, result) => this.props.pixelSize, true),
      color: new Cesium.CallbackProperty((time, result) => {
        let c = Cesium.Color.fromCssColorString(this.props.color).withAlpha(this.props.alpha)
        return ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
      }, true),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    })
    ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.ctls.concat(window.cursor), time)
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
    let ent = this.shapes[0]
    ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.ctls, time)
    }, false)
  }

  finish () {
    if (this.shapes.length>0) {
      super.finish()
      this.shapes[0].position = this.calcuteShape(this.ctls, mu.julianDate())
    }
  }
}
