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
  options: {units: turf.helpers.Units | undefined } = { units:  'kilometers' }

  getStartPoints(s: Pot, s1: Pot, width: number) {
    let bearing = turf.bearing(s, s1)
    let distance = turf.distance(s, s1, this.options)
    return [
      turf.destination(s, width, bearing - 90, this.options),
      turf.destination(s, width, bearing, this.options),
      turf.destination(s, width, bearing + 90, this.options)
      ]
  }

  getEndPoints(e0: Pot, e: Pot, width: number) {
    let bearing = turf.bearing(e0, e)
    let distance = turf.distance(e0, e, this.options)
    let innerDeg = 160
    let innerDis = width/2 / Math.cos((innerDeg-90)/180*Math.PI)
    let outerDeg = 150
    let outerDis = width / Math.cos((outerDeg-90)/180*Math.PI)
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
    let nbear = turf.bearing(e, en)
    let ndis = turf.distance(e, en, this.options)

    let leftBear = -(180 - bbear - nbear) / 2
    let rightBear = (180 + bbear + nbear) / 2

    let leftPoint = turf.destination(e, width, leftBear, this.options)
    let isClock = turf.booleanClockwise(
      turf.lineString([
        e.geometry.coordinates,
        leftPoint.geometry.coordinates,
        en.geometry.coordinates,
        e.geometry.coordinates,
      ]))
    if (isClock) {
      return {
        left: turf.destination(e, width, leftBear, this.options),
        right: turf.destination(e, width, rightBear, this.options)
      }
    } else {
      return {
        right: turf.destination(e, width, leftBear, this.options),
        left: turf.destination(e, width, rightBear, this.options)
      }
    }
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
      let tps = turfPoints.map( p => {return p.geometry.coordinates})
      //let totalLength = turf.length(turf.lineString(tps), this.options)
      let distance = turf.distance(turfPoints[0], turfPoints[1], this.options)
      let startWidth = distance/10
      let endWidth = startWidth/2

      let startPs = this.getStartPoints(turfPoints[0], turfPoints[1], startWidth)
      let endPs = this.getEndPoints(turfPoints[turfPoints.length-2], turfPoints[turfPoints.length-1], endWidth)

      let midPs = []
      if (turfPoints.length> 2) {
        for(let i=0; i<turfPoints.length-2; i++) {
          let eb = turfPoints[i]
          let e = turfPoints[i+1]
          let en = turfPoints[i+2]
          let eWidth = startWidth - (startWidth-endWidth)/(turfPoints.length-1) * (i+1)
          midPs.push(this.genMidPoints(eb, e, en, eWidth))
        }
      }
      let tgts = []

      tgts.push(...startPs)
      midPs.map( mp => tgts.push(mp.right))
      tgts.push(...endPs)
      midPs.reverse().map(mp => tgts.push(mp.left))

      return tgts.map(tgt => mu.lonlat2Cartesian(turf.getCoord(tgt)))
    } else {
      return []
    }
  }
}
