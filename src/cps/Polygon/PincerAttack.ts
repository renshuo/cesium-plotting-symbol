import * as turf from '@turf/turf'
import * as mu from '../mapUtil'
import Polygon from './Polygon'
import _ from 'lodash'
import * as Cesium from "cesium"
import { Bezier } from 'bezier-js';

type Pot = turf.Feature<turf.Point, turf.Properties>

export default class PincerAttack extends Polygon {

  minPointNum = 2
  maxPointNum = 9

  constructor(p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity){
    super({
      type: '钳击',
      arrowWidth: 10,
      ...p}, viewer, layer)
    this.propDefs.push(
      { name: 'arrowWidth', title: '箭头宽度', type: 'number', editable: true, step: 1, min: 1, max: 100 },
    )
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

  // private calcEdge(p0: Pot, p1: Pot, p2: Pot, width: number, ebear: number) {
  //   let midPoint = turf.midpoint(p1, p2)
  //   let dis = turf.distance(p0, p1, {units: 'kilometers'}) / 5
  //   let tp = turf.destination(midPoint, dis, width>0 ? 90+ebear : -90+ ebear, {units: 'kilometers'})

  //   let lonlat = [p1, tp, p2].map(p => {
  //     let c = turf.getCoord(p);
  //     return { x:c[0] , y: c[1] } })
  //   let curvePoints = new Bezier(lonlat).getLUT()
  //   return curvePoints.map( p => [p.x, p.y])
  // }

  private calcEdge2(px: Array<Pot>) {
    let lonlat = px
                   .filter(x => { return x != undefined })
                   .map ( p => {
      let c = turf.getCoord(p);
      return { x: c[0], y: c[1] }
    })
   let curvePoints = new Bezier(lonlat).getLUT()
    return curvePoints.map(p => [p.x, p.y])
  }

  private calcMid(ps: Array<Pot|undefined>) {
    let midPs = ps
      .filter( x => x!=undefined)
      .map(pt => turf.getCoord(pt)).map( p => {return {x: p[0], y: p[1]} })
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
      if (turfPoints.length >= 7) {
        let baseLeft = turfPoints[0]
        let baseRight = turfPoints[1]
        let arrow1p = turfPoints[2]
        let ctlRight = turfPoints[3]
        let arrow2p = turfPoints[4]
        let ctlLeft = turfPoints[5]
        let mid = turfPoints.slice(6, turfPoints.length)
        let ebear1 = turf.bearing(ctlRight, arrow1p)
        let endArrow1 = this.createEndArrow(arrow1p, ebear1, this.props.arrowWidth)
        let rightEdge = this.calcEdge2([baseRight, ctlRight, endArrow1[0]])
        let ebear2 = turf.bearing(ctlLeft, arrow2p)
        let endArrow2 = this.createEndArrow(arrow2p, ebear2, this.props.arrowWidth)
        let leftEdge = this.calcEdge2([baseLeft, ctlLeft, endArrow2[4]]).reverse()
        let midEdge = this.calcMid([endArrow1[4]].concat(mid).concat(endArrow2[0]))
        ps = [
          ...rightEdge, ...endArrow1,
          ...midEdge,
          ...endArrow2, ...leftEdge
        ]
      } else if (turfPoints.length == 6) {
        let baseLeft = turfPoints[0]
        let baseRight = turfPoints[1]
        let arrow1p = turfPoints[2]
        let ctlRight = turfPoints[3]
        let arrow2p = turfPoints[4]
        let ctlLeft = turfPoints[5]
        let ebear1 = turf.bearing(ctlRight, arrow1p)
        let endArrow1 = this.createEndArrow(arrow1p, ebear1, this.props.arrowWidth)
        let rightEdge = this.calcEdge2([baseRight, ctlRight, endArrow1[0]])
        let ebear2 = turf.bearing(ctlLeft, arrow2p)
        let endArrow2 = this.createEndArrow(arrow2p, ebear2, this.props.arrowWidth)
        let leftEdge = this.calcEdge2([baseLeft, ctlLeft, endArrow2[4]]).reverse()
        ps = [
          ...rightEdge, ...endArrow1,
          ...endArrow2, ...leftEdge
        ]
      } else if (turfPoints.length >= 4) {
        let baseLeft = turfPoints[0]
        let baseRight = turfPoints[1]
        let arrow1p = turfPoints[2]
        let ctlRight = turfPoints[3]
        let ebear1 = turf.bearing(ctlRight, arrow1p)
        let endArrow1 = this.createEndArrow(arrow1p, ebear1, 20)
        let rightEdge = this.calcEdge2([baseRight, ctlRight, endArrow1[0]])
        ps = [
          ...rightEdge, ...endArrow1
          ]
      }
      return ps.map(tgt => mu.lonlat2Cartesian(turf.getCoord(tgt)))
    }
  }

  override initTempShape(): void {
    //add bottom line
    this.addTempLine(new Cesium.CallbackProperty((time, result) => {
      let ctlss = this.ctls
      if (ctlss.length >= 2 ) {
        return [ctlss[0], ctlss[1]].map(ent => ent.position?.getValue(time))
      } else {
        return []
      }
    }, false))

    // right arrow
    this.addTempLine(new Cesium.CallbackProperty((time, result) => {
      let ctlss = this.ctls
      if (ctlss.length >= 4) {
        return [ctlss[2], ctlss[3]].map(ent => ent.position?.getValue(time))
      } else {
        return []
      }
    }, false))

    // left arrow
    this.addTempLine(new Cesium.CallbackProperty((time, result) => {
      let ctlss = this.ctls
      if (ctlss.length >= 6) {
        return [ctlss[5], ctlss[4]].map(ent => ent.position?.getValue(time))
      } else {
        return []
      }
    }, false))

    // inner sp line
    this.addTempLine(new Cesium.CallbackProperty((time, result) => {
      let ctlss = this.ctls
      if (ctlss.length >= 7) {
        let mid = ctlss.slice(6, ctlss.length)
        return [ctlss[2]].concat(mid).concat(ctlss[4]).map(ent => ent.position?.getValue(time))
      } else {
        return []
      }
    }, false))
  }
}
