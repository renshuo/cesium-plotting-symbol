import * as turf from '@turf/turf'
import * as mu from '../mapUtil'
import Polygon from './Polygon'
import _ from 'lodash'
import * as Cesium from "cesium"

export default class Arrow1 extends Polygon {
  maxPointNum = 2
  minPointNum = 2

  options: {} = { units: 'kilometers' }

  constructor(p, viewer: Cesium.Viewer, layer: Cesium.Entity){
    super({
      type: '单方型箭头',
      arrowWidth: 10,
      ...p}, viewer, layer)
    this.propDefs.push(
      { name: 'arrowWidth', title: '箭头宽度', type: 'number', editable: true, step: 1, min: 1, max: 100 },
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

      let distance = turf.distance(point1, point2, this.options)

      let b = this.props.arrowWidth

      let innerDeg = 157.5
      let innerDis = b

      let outerDeg = 135
      let outerDis = b* 2.732/2

      tgts.push(turf.destination(point1, b/2, bearing - 90, this.options))
      tgts.push(turf.destination(point1, b/2, bearing + 90, this.options))

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
