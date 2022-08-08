import Polygon from './Polygon';
import * as mu from '../mapUtil';
import * as turf from '@turf/turf';
import {Viewer, Entity, JulianDate} from 'cesium';


export default class FlagRectangle extends Polygon {
  maxPointNum = 2
  minPointNum = 2

  constructor(p: {}, viewer: Viewer, layer: Entity) {
    super({ type: '四角旗', ...p }, viewer, layer)
  }

  calcuteShape(points: Array<Entity>, time: JulianDate) {
    if (points.length < this.minPointNum) {
      return []
    }
    let ctls = points.map((p) => {
      let longLat = mu.cartesian2lonlat(p.position.getValue(time))
      return turf.point(longLat)
    })

    let s = ctls[0]
    let e = ctls[1]
    let m = turf.midpoint(s, e)
    let dis = turf.distance(s, e, { units: 'kilometers' })

    let bear = turf.bearing(s, e)

    let rectPoint1 = turf.destination(e, dis / 2, bear + 90, { units: 'kilometers' })
    let rectPoint2 = turf.destination(m, dis / 2, bear + 90, { units: 'kilometers' })

    let pos = [s,m, e, rectPoint1, rectPoint2, m]
    return pos.map((p) => mu.lonlat2Cartesian(p.geometry.coordinates))
  }
}

