import Graph from '../Graph'
import Cesium from 'cesium/Source/Cesium.js'
import * as turf from '@turf/turf'
import {
  convertCartesian
} from '../mapUtil'
import Polygon from './Polygon'
import _ from 'lodash'

export default class Arrow1 extends Polygon {
  maxPointNum = 2

  ent = null

  addHandler (ctlPoint, ctl) {
    if (ctl._children.length === 1) {
      this.ent = new Cesium.Entity({
        id: 'arrow1_' + Graph.seq++,
        polygon: {
          hierarchy: new Cesium.CallbackProperty((time, result) => {
            return this.calcuteShape(this.graph.ctl._children.concat(window.cursor), time)
          }, false),
          fill: true,
          material: new Cesium.Color(0.98, 0.5, 0.265, 0.2),
          height: 0,
          outline: true,
          outlineWidth: 1,
          outlineColor: Cesium.Color.fromCssColorString('#fd7f44')
        }
      })
      this.addShape(this.ent)
    }
  }

  calcuteShape (pos, time) {
    let posis = _.map(pos, ent => ent.position.getValue(time)) // pos.map(ent => ent.position.getValue(time))
    console.log('turf: ', _, turf)
    let turfPoints = posis.map(cartesian3 => {
      let longLat = convertCartesian(cartesian3)
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
