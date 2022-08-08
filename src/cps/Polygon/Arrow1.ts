import * as turf from '@turf/turf'
import * as mu from '../mapUtil.ts'
import Polygon from './Polygon.js'
import _ from 'lodash'
import * as Cesium from "cesium"

export default class Arrow1 extends Polygon {
  maxPointNum = 2
  minPointNum = 2

  options: {} = { units: 'kilometers' }

  constructor(p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity){
    super({
      type: '单箭头',
      ...p}, viewer, layer)
    this.propDefs.push(
    )
  }

  calcuteShape (points: Array<Cesium.Entity>, time: Cesium.JulianDate) {
    if (points.length < this.minPointNum) {
      return []
    }
    let posis = points.map( ent => ent.position.getValue(time))
    let turfPoints = posis.map(cartesian3 => {
      let longLat = mu.cartesian2lonlat(cartesian3)
      return turf.point(longLat)
    })
    if (turfPoints.length > 1) {
      let tgts = []
      let point1 = turfPoints[0]
      let point2 = turfPoints[1]

      let bearing = turf.bearing(point1, point2)

      let distance = turf.distance(point1, point2, options)

      let a = distance/10
      let b = distance/10

      let innerDeg = 170
      let innerDis = b * 0.9

      let outerDeg = 160
      let outerDis = b*1.41

      tgts.push(turf.destination(point1, a, bearing - 90, this.options))
      tgts.push(turf.destination(point1, a, bearing, this.options))
      tgts.push(turf.destination(point1, a, bearing + 90, this.options))

      tgts.push(turf.destination(point2, innerDis, bearing + innerDeg, this.options))
      tgts.push(turf.destination(point2, outerDis, bearing + outerDeg, this.options))
      tgts.push(turf.destination(point2, 0, bearing, this.options))
      tgts.push(turf.destination(point2, outerDis, bearing - outerDeg, this.options))
      tgts.push(turf.destination(point2, innerDis, bearing - innerDeg, this.options))

      return tgts.map(tgt => mu.lonlat2Cartesian(turf.getCoord(tgt)))
    } else {
      return []
    }
  }
}
