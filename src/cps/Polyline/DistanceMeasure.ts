import Polyline from './Polyline.js'
import * as mu from '../mapUtil';
import _ from 'lodash'
import * as Cesium from 'cesium';

export default class DistanceMeasure extends Polyline {

  constructor(p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '距离测量',
      ...p
    }, viewer, layer)
  }


  override initTempShape(): void {
    this.ctls.map( (v,i,l) => {
      let curctl = v
      let lastctl = i>0 ? l[i-1] : undefined
      if (lastctl) {
        this.createTempShape(curctl, lastctl)
      }
    })
  }

  override updateTempShape(ctl: Cesium.Entity): void {
    if (this.ctls.length>1) {
      let curctl = ctl
      let lastctl = this.ctls[this.ctls.length-2]
      this.createTempShape(curctl, lastctl)
    }
  }

  private createTempShape(curctl: Cesium.Entity, lastctl: Cesium.Entity) {
    this.tempShapes.push(this.entities.add(new Cesium.Entity({
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
