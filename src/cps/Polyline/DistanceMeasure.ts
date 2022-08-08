import _ from 'lodash'
import * as Cesium from 'cesium';
import PointLine from './PointLine.js';

export default class DistanceMeasure extends PointLine {

  constructor(p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '距离测量',
      ...p
    }, viewer, layer)
  }


  override initShape(): void {
    super.initShape()
    this.ctls.map((v, i, l) => {
      let curctl = v
      let lastctl = i > 0 ? l[i - 1] : undefined
      if (lastctl) {
        this.createDistanceText(curctl, lastctl)
      }
    })
  }

  override increaseShape(ctl: Cesium.Entity): void {
    super.increaseShape(ctl)
    if (this.ctls.length>1) {
      let curctl = ctl
      let lastctl = this.ctls[this.ctls.length-2]
      this.createDistanceText(curctl, lastctl)
    }
  }

  override decreaseShape(ctl: Cesium.Entity): void {
    super.decreaseShape(ctl)
    let ent = this.shapes.pop()
    this.entities.remove(ent)
  }

  private createDistanceText(curctl: Cesium.Entity, lastctl: Cesium.Entity) {
    this.shapes.push(this.entities.add(new Cesium.Entity({
      position: new Cesium.CallbackProperty((time, result) => {
        return curctl.position.getValue(time)
      }, false),
      label: {
        text: new Cesium.CallbackProperty((time, result) => {
          let distance = Cesium.Cartesian3.distance(curctl.position.getValue(Cesium.JulianDate.fromDate(new Date())),
            lastctl.position.getValue(Cesium.JulianDate.fromDate(new Date()))
          )
          return '距离: ' + distance.toPrecision(8) + " km"
        }, false),
        font: '12px monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(15, -10)
      }
    })))
  }

}
