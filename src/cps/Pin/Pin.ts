import Graph from '../Graph'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil.ts'
import Point from './Point'

export default class Pin extends Graph {

  maxPointNum = 1
  minPointNum = 1

  pinBuilder = new Cesium.PinBuilder()

  constructor (p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '钉',
      rotation: 0,
      scale: 1,
      width: 30,
      height: 30,
      ...p
    }, viewer, layer)
    this.propDefs.push(
      { name: 'rotation', title: '旋转', type: 'number', editable: true, step: 1, max: 360, min: -360 },
      { name: 'scale', title: '缩放', type: 'number', editable: true, min: 0.5, step: 0.1, max: 100 },
      { name: 'width', title: '宽度', type: 'number', editable: true, step: 1, min: 0 , max: 10000},
      { name: 'height', title: '高度', type: 'number', editable: true, step: 1, min: 0, max: 10000 },
    )
  }

  calcuteShape(points: Array<Cesium.Entity>, time: Cesium.JulianDate) {
    if (points.length < this.minPointNum) {
      return []
    }
    return points[0].position.getValue(time)
  }

  toEdit() {
    super.toEdit()
    let ent = this.shapes[0]
    ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.ctls, time)
    }, false)
  }

  finish() {
    if (this.shapes.length > 0) {
      super.finish()
      this.shapes[0].position = this.calcuteShape(this.ctls, mu.julianDate())
    }
  }
}
