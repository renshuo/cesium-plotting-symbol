import * as turf from '@turf/turf'
import * as mu from '../mapUtil'
import Polygon from './Polygon'
import _ from 'lodash'
import * as Cesium from "cesium"

type Pot = turf.Feature<turf.Point, turf.Properties>

export default class MultiPartArrow extends Polygon {

  minPointNum = 2

  constructor(p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity){
    super({
      type: '多段箭头',
      ...p}, viewer, layer)
    this.propDefs.push(
    )
  }
  options = { units: 'kilometers' }

  getStartPoints(s: Pot, s1: Pot, width: number) {
    let bearing = turf.bearing(s, s1)
    let distance = turf.distance(s, s1, this.options)
    let a = distance / 10 
    return [
      turf.destination(s, a, bearing - 90, this.options),
      turf.destination(s, a, bearing, this.options),
      turf.destination(s, a, bearing + 90, this.options)
      ]
  }

  getEndPoints(e0: Pot, e: Pot, width: number) {
    let bearing = turf.bearing(e0, e)
    let distance = turf.distance(e0, e, this.options)
    let b = distance / 10
    let innerDeg = 170
    let innerDis = b * 0.9

    let outerDeg = 160
    let outerDis = b * 1.41
    return [
      turf.destination(e, innerDis, bearing + innerDeg, this.options),
      turf.destination(e, outerDis, bearing + outerDeg, this.options),
      turf.destination(e, 0, bearing, this.options),
      turf.destination(e, outerDis, bearing - outerDeg, this.options),
      turf.destination(e, innerDis, bearing - innerDeg, this.options)
    ]
  }

  genMidPoints(eb: Pot, e: Pot, en: Pot, width: number) {

    let bbear = turf.bearing(eb, e)
    let bdis = turf.distance(eb, e, this.options)

    let nbear = turf.bearing(e, en)
    let ndis = turf.distance(e, en, this.options)

    let ma = turf.midpoint(eb, en)
    let ba = turf.bearing(e, ma)
    
    if (ba<0) {
      ba = -ba
    }
    return [
      turf.destination(e, width, -(180 - bbear - nbear)/2, this.options),
      turf.destination(e, width, (180 + bbear  + nbear)/2, this.options)
    ]
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
      let s = turfPoints[0]
      let s1 = turfPoints[1]

      let e = turfPoints[turfPoints.length-1]
      let e0 = turfPoints[turfPoints.length-2]

      let startPs = this.getStartPoints(s, s1, 0)
      let endPs = this.getEndPoints(e0, e, 0)

      let midPs = []
      if (turfPoints.length> 2) {
        for(let i=0; i<turfPoints.length-2; i++) {
          let eb = turfPoints[i]
          let e = turfPoints[i+1]
          let en = turfPoints[i+2]
          midPs.push(this.genMidPoints(eb, e, en, 10))
        }
        console.log("get midps", midPs)
      }
      let tgts = []

      tgts.push(...startPs)
      midPs.map( mp => tgts.push(mp[1]))
      tgts.push(...endPs)
      midPs.map(mp => tgts.push(mp[0]))

      console.log("get poins: ", tgts)
      return tgts.map(tgt => mu.lonlat2Cartesian(turf.getCoord(tgt)))
    } else {
      return []
    }
  }
}
