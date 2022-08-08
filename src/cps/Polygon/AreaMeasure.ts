import Polygon from "./Polygon"
import _ from 'lodash'
import * as Cesium from 'cesium';
import * as turf from '@turf/turf';
import * as mu from '../mapUtil';


export default class AreaMeasure extends Polygon {

  constructor(p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '面积测量',
      ...p
    }, viewer, layer)
  }

  initShape(): void {
    super.initShape()
    this.createAreaText()
  }

  private createAreaText() {
    this.shapes.push(this.entities.add(new Cesium.Entity({
      position: new Cesium.CallbackProperty((time, result) => {
        if (this.ctls.length < 3) {
          return ""
        } else {
          let pos = this.ctls.map(ctl => mu.cartesian2lonlat(ctl.position.getValue(time)))
          pos.push(pos[0])
          let cps = turf.getCoord(turf.centerOfMass(turf.polygon([pos])))
          return mu.lonlat2Cartesian(cps)
3        }
      }, false),
      label: {
        text: new Cesium.CallbackProperty((time, result) => {
          if (this.ctls.length < 3) {
            return ""
          } else {
            let pos = this.ctls.map(ctl => mu.cartesian2lonlat(ctl.position.getValue(time)))
            pos.push(pos[0])
            let pg = turf.polygon([pos]);
            let cp = turf.centerOfMass(pg);
            let av = turf.area(pg)
            if (av < 1000) {
              return '面积' + av.toFixed(3) + ' m2'
            } else if (av < 1000000) {
              return '面积' + av.toFixed(2) + ' m2'
            } else {
              return '面积' + (av/1000000).toFixed(1) + ' km2'
            }
3          }
        }, false),
        font: '18px monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        pixelOffset: new Cesium.Cartesian2(0, 0),
        fillColor: Cesium.Color.RED.withAlpha(0.9)
      }
    })))
  }
}
