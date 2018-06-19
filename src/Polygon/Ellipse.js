import * as mu from '../mapUtil.js'
import Polygon from './Polygon.js'
import * as turf from '@turf/turf'

export default class Ellipse extends Polygon {
  maxPointNum = 3

  calcuteShape (points, time) {
    if (points.length < 2) {
      return []
    }
    let ctls = points.map((p) => {
      return mu.cartesian2turfPoint(p.position.getValue(time))
    })
    let p2 = ctls.length > 2 ? ctls[2] : ctls[1]
    let xSemi = turf.distance(ctls[0], ctls[1], {units: 'kilometers'})
    xSemi = xSemi | 1
    let ySemi = ctls.length > 2
      ? turf.distance(ctls[0], p2, {units: 'kilometers'})
      : xSemi
    let geometry = turf.ellipse(ctls[0], xSemi, ySemi, {units: 'kilometers'})
    return turf.getCoords(geometry)[0].map((p) => mu.lonlat2Cartesian(p))
  }
}
