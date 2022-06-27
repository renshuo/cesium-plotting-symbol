import * as turf from '@turf/turf'
import * as mu from '../mapUtil'
import Polygon from './Polygon'
import _ from 'lodash'
import * as Cesium from "cesium"
import { Bezier } from 'bezier-js';

type Pot = turf.Feature<turf.Point, turf.Properties>

export default class PincerAttack extends Polygon {

  minPointNum = 2
  maxPointNum = 5

  constructor(p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity){
    super({
      type: '钳击',
      ...p}, viewer, layer)
  }
  options: {units: turf.helpers.Units | undefined } = { units:  'kilometers' }

   createEndArrow(ep: Pot, bearing: number, width: number) {
    let innerDeg = 160
    let innerDis = width / 2 / Math.cos((innerDeg - 90) / 180 * Math.PI)
    let outerDeg = 150
    let outerDis = width / Math.cos((outerDeg - 90) / 180 * Math.PI)
    return [
      turf.destination(ep, innerDis, bearing + innerDeg, this.options),
      turf.destination(ep, outerDis, bearing + outerDeg, this.options),
      turf.destination(ep, 0, bearing, this.options),
      turf.destination(ep, outerDis, bearing - outerDeg, this.options),
      turf.destination(ep, innerDis, bearing - innerDeg, this.options)
    ]
  }

  private calcEdge(p0: Pot, p1: Pot, p2: Pot, width: number) {
    let midPoint = turf.midpoint(p1, p2)
    let dis = turf.distance(p0, p1, {units: 'kilometers'}) / 10
    let tp = turf.destination(midPoint, dis, width>0 ? 90 : -90, {units: 'kilometers'})

    let lonlat = [p1, tp, p2].map(p => {
      let c = turf.getCoord(p);
      return { x:c[0] , y: c[1] } })
    let curvePoints = new Bezier(lonlat).getLUT()
    return curvePoints.map( p => [p.x, p.y])
  }


  private calcMid(ps: Array<Pot>) {
    let midPs = ps.map(pt => turf.getCoord(pt)).map( p => {return {x: p[0], y: p[1]} })
    let res = new Bezier(midPs).getLUT()
    return res.map(p => [p.x, p.y])
  }

  calcuteShape (points: Array<Cesium.Entity>, time: Cesium.JulianDate) {
    if (points.length < this.minPointNum) {
      return []
    } else if (points.length == 2) {
      return points.map((pt) => pt.position.getValue(time))
    } else {
      let posis = points.map(ent => ent.position.getValue(time))
      let turfPoints = posis.map(cartesian3 => {
        let longLat = mu.cartesian2lonlat(cartesian3)
        return turf.point(longLat)
      })
      let ps = []
      if (turfPoints.length == 3) {
        let ebear = turf.bearing(turfPoints[1], turfPoints[2])
        let endArrow = this.createEndArrow(turfPoints[2], ebear, 20)
        let rightEdge = this.calcEdge(turfPoints[0], turfPoints[1], endArrow[0], 20)
        ps = [
          turfPoints[0], ...rightEdge, ...endArrow,
          turfPoints[0],
        ]
      } else if (turfPoints.length == 4) {
        let ebear1 = turf.bearing(turfPoints[1], turfPoints[2])
        let endArrow1 = this.createEndArrow(turfPoints[2], ebear1, 20)
        let rightEdge = this.calcEdge(turfPoints[0], turfPoints[1], endArrow1[0], 20)
        let ebear2 = turf.bearing(turfPoints[0], turfPoints[3])
        let endArrow2 = this.createEndArrow(turfPoints[3], ebear2, 20)
        let leftEdge = this.calcEdge(turfPoints[1], turfPoints[0],  endArrow2[4], -20).reverse()
        ps = [
          ...rightEdge, ...endArrow1,
          ...endArrow2, ...leftEdge
        ]
      } else if (turfPoints.length == 5) {
        let ebear1 = turf.bearing(turfPoints[1], turfPoints[2])
        let endArrow1 = this.createEndArrow(turfPoints[2], ebear1, 20)
        let rightEdge = this.calcEdge(turfPoints[0], turfPoints[1], endArrow1[0], 20)
        let ebear2 = turf.bearing(turfPoints[0], turfPoints[3])
        let endArrow2 = this.createEndArrow(turfPoints[3], ebear2, 20)
        let leftEdge = this.calcEdge(turfPoints[1], turfPoints[0], endArrow2[4], -20).reverse()

        let midEdge = this.calcMid([endArrow1[4], turfPoints[1], turfPoints[4], turfPoints[0], endArrow2[0]])
        ps = [
          ...rightEdge, ...endArrow1,
          ...midEdge,
          ...endArrow2, ...leftEdge
        ]
      }
      return ps.map(tgt => mu.lonlat2Cartesian(turf.getCoord(tgt)))
    }
  }
}
