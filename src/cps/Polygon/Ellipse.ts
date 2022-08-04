import * as mu from '../mapUtil.ts'
import Polygon from './Polygon.js'
import * as turf from '@turf/turf'
import * as Cesium from 'cesium'

export default class Ellipse extends Polygon {

  maxPointNum = 3
  minPointNum = 2 // 2个点的椭圆即退化为圆

  option = { units: 'kilometers' }

  constructor(p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({ type: '椭圆', ...p }, viewer, layer, true)
  }

  calcuteShape(points: Array<Cesium.Entity>, time: Cesium.JulianDate) {
    if (points.length < this.minPointNum) {
      return []
    } else {
      let ctls = points.map((p) => {
        return mu.cartesian2turfPoint(p.position.getValue(time))
      })
      let geometry
      if (points.length === this.minPointNum) { // 2个控制点时，ellipse退化为circle
        let radius = turf.distance(ctls[0], ctls[1], this.option)
        geometry = turf.circle(ctls[0], radius, this.option)
      } else {
        let xSemi = turf.distance(ctls[0], ctls[1], this.option)
        let ySemi = turf.distance(ctls[0], ctls[2], this.option)
        geometry = turf.ellipse(ctls[0], xSemi, ySemi, this.option)
      }
      return turf.getCoords(geometry)[0].map((p) => mu.lonlat2Cartesian(p))
    }
  }

  initTempShape(isWithCursor: boolean): void {
    this.addTempLine(new Cesium.CallbackProperty((time, result) => {
      let ctlss = this.getLinePoints(isWithCursor)
      if (ctlss.length == 2) {
        return [ctlss[1], ctlss[0]].map(ent => ent.position?.getValue(time))
      } else if (ctlss.length == 3) {
        return [ctlss[1], ctlss[0], ctlss[2], ctlss[1]].map(ent => ent.position?.getValue(time))
      } else {
        return []
      }
    }, false))
  }
}
