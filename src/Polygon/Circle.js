import * as mu from '../mapUtil.js'
import Polygon from './Polygon.js'
import * as turf from '@turf/turf'

export default class Circle extends Polygon {
  maxPointNum = 2
  minPointNum = 2
  
  constructor(){
    super()
    this.props.type.value = '圆'
  }

  calcuteShape (points, time) {
    if (points.length < this.minPointNum) {
      return []
    }
    let ctls = points.map((p) => {
      return mu.cartesian2turfPoint(p.position.getValue(time))
    })
    let radius = turf.distance(ctls[0], ctls[1], {units: 'kilometers'})
    radius = radius | 1
    let geometry = turf.circle(ctls[0], radius, {units: 'kilometers'})
    return mu.turfGeometry2Cartesians(geometry)
  }
}
