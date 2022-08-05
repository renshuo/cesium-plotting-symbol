import Polyline from './Polyline.js'
import * as mu from '../mapUtil';
import _ from 'lodash'
import * as Cesium from 'cesium';

type Pos = {
  lon: number;
  lat: number;
  hei: number;
}


export default class DistanceMeasure extends Polyline {

  constructor(p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '距离测量',
      ...p
    }, viewer, layer, true)
  }


  initTempShape(): void {
    let curctl = undefined
    let lastcp2 = undefined
    if (this.ctls.length >1) {
      curctl = this.ctls[this.ctls.length - 1]
      lastcp2 = this.ctls[this.ctls.length - 2]
      this.tempShapes.push(this.entities.add(new Cesium.Entity({
        position: new Cesium.CallbackProperty((time, result) => {
          return curctl.position.getValue(time)
        }, false),
        label: {
          text: new Cesium.CallbackProperty((time, result) => {
            if (lastcp2 == undefined) {
              return ''
            } else {
              let distance = Cesium.Cartesian3.distance(curctl.position.getValue(Cesium.JulianDate.fromDate(new Date())),
                lastcp2.position.getValue(Cesium.JulianDate.fromDate(new Date()))
              )
              return '距离: ' + distance.toPrecision(8) + " km"
            }
          }, false),
          font: '12px monospace',
          horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new Cesium.Cartesian2(15, -10)
        }
      })))
    }
  }

  addCtlPoint(pos: Pos): Cesium.Entity {
    let cp = super.addCtlPoint(pos)
    console.log("in distance measure", cp.position)
    this.initTempShape()
    return cp
  }

}
