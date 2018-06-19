import Graph from '../Graph'
import Cesium from 'cesium/Source/Cesium.js'
import * as turf from '@turf/turf'
import * as mu from '../mapUtil'
import Polygon from './Polygon'
import _ from 'lodash'

export default class Arrow1 extends Polygon {
  maxPointNum = 2

  calcuteShape (pos, time) {
    let posis = _.map(pos, ent => ent.position.getValue(time)) // pos.map(ent => ent.position.getValue(time))
    let turfPoints = posis.map(cartesian3 => {
      let longLat = mu.cartesian2lonlat(cartesian3)
      return turf.point(longLat)
    })
    if (turfPoints.length > 1) {
      let tgts = []
      let point1 = turfPoints[0]
      let point2 = turfPoints[1]

      let bearing = turf.bearing(point1, point2)
      let options = {units: 'kilometers'}

      tgts.push(turf.destination(point1, 100, bearing, options))
      tgts.push(turf.destination(point1, 50, bearing + 90, options))
      tgts.push(turf.destination(point2, 100, bearing + 170, options))
      tgts.push(turf.destination(point2, 150, bearing + 150, options))
      tgts.push(turf.destination(point2, 0, bearing, options))
      tgts.push(turf.destination(point2, 150, bearing - 150, options))
      tgts.push(turf.destination(point2, 100, bearing - 170, options))
      tgts.push(turf.destination(point1, 50, bearing - 90, options))

      return tgts.map(tgt => {
        return Cesium.Cartesian3.fromDegrees(
          tgt.geometry.coordinates[0],
          tgt.geometry.coordinates[1],
          0,
          Cesium.Ellipsoid.WGS84
        )
      })
    } else {
      return []
    }
  }
}
