import Polyline from './Polyline'
import * as mu from '../mapUtil'
import * as turf from '@turf/turf'
import {Viewer, Entity, JulianDate, CallbackProperty} from 'cesium';

export default class CircleArc extends Polyline {
  maxPointNum = 3
  minPointNum = 3

  constructor(p: {}, viewer: Viewer, layer: Entity){
    super({type: '圆弧线', ...p}, viewer, layer, true)
  }

  calcuteShape (points: Array<Entity>, time: JulianDate) {
    if (points.length < this.minPointNum) {
      return []
    }
    let ctls = points.map((p) => {
      let longLat = mu.cartesian2lonlat(p.position.getValue(time))
      return turf.point(longLat)
    })

    let b1 = turf.bearing(ctls[0], ctls[1])
    let b2 = turf.bearing(ctls[0], ctls[2])

    let d1 = turf.distance(ctls[0], ctls[1], {units: 'kilometers'})
    let d2 = turf.distance(ctls[0], ctls[2], {units: 'kilometers'})
    let radius = d1 > d2 ? d1 : d2
    let linestr = turf.lineArc(ctls[0], radius, b1, b2)
    let geometry = linestr.geometry.coordinates
    return geometry.map((p) => mu.lonlat2Cartesian(p))
  }

  initTempShape(): void {
    this.addTempLine(new CallbackProperty((time, result) => {
      if (this.ctls.length == 2) {
        return [this.ctls[1], this.ctls[0]].map(ent => ent.position?.getValue(time))
      } else if (this.ctls.length == 3) {
        return [this.ctls[1], this.ctls[0], this.ctls[2]].map(ent => ent.position?.getValue(time))
      } else {
        return []
      }
    }, false))
  }
}
