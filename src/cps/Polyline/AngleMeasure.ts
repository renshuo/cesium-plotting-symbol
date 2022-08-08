import _ from 'lodash'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil';
import PointLine from './PointLine.js';
import * as turf from '@turf/turf';

export default class AngleMeasure extends PointLine {

  constructor(p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '角度测量',
      ...p
    }, viewer, layer)
  }

  override initShape(): void {
    super.initShape()
    this.ctls.map((v, i, l) => {
      let curctl = v
      let lastctl = i > 0 ? l[i - 1] : undefined
      if (lastctl) {
        this.createAngleText(lastctl, curctl)
      }
    })
  }

  increaseShape(ctl: Cesium.Entity): void {
    super.increaseShape(ctl)
    if (this.ctls.length > 1) {
      let curctl = ctl
      let lastctl = this.ctls[this.ctls.length - 2]
      this.createAngleText(lastctl, curctl)
    }
  }

  decreaseShape(ctl: Cesium.Entity): void {
    super.decreaseShape(ctl)
    let ent = this.shapes.pop()
    this.entities.remove(ent)
  }

  private createAngleText(curctl: Cesium.Entity, nextctl: Cesium.Entity) {
    this.shapes.push(this.entities.add(new Cesium.Entity({
      position: new Cesium.CallbackProperty((time, result) => {
        return curctl.position.getValue(time)
      }, false),
      label: {
        text: new Cesium.CallbackProperty((time, result) => {
          let p1 = mu.cartesian2turfPoint(curctl.position.getValue(time))
          let p2 = mu.cartesian2turfPoint(nextctl.position.getValue(time))
          let angle = turf.bearing(p1, p2);
          return angle.toFixed(2) + '°'
        }, false),
        font: '12px monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(15, -10)
      }
    })))
  }
}
