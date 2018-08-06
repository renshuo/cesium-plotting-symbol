import * as mu from '../mapUtil.js'
import Polygon from './Polygon.js'
import * as turf from '@turf/turf'

export default class Ellipse extends Polygon {

  maxPointNum = 3
  minPointNum = 2 // 2个点的椭圆即退化为圆


  constructor(p, viewer, layer){
    super({type: '椭圆', ...p}, viewer, layer)
  }

  calcuteShape (points, time) {
    if (points.length < this.minPointNum) {
      return []
    } else{ 
      let ctls = points.map((p) => {
        return mu.cartesian2turfPoint(p.position.getValue(time))
      })
      let geometry
    if (points.length === this.minPointNum) { // 2个控制点时，ellipse退化为circle
        let radius = this.getDistance(ctls[0], ctls[1])
        geometry = turf.circle(ctls[0], radius, {units: 'kilometers'})
      } else {
        let xSemi = this.getDistance(ctls[0], ctls[1])
        let ySemi = this.getDistance(ctls[0], ctls[2])
        geometry = turf.ellipse(ctls[0], xSemi, ySemi, {units: 'kilometers'})
      }
      return turf.getCoords(geometry)[0].map((p) => mu.lonlat2Cartesian(p))
    }
  }

  getDistance (p1, p2) {
    let semi = turf.distance(p1, p2, {units: 'kilometers'})
    return semi | 1
  }
}
