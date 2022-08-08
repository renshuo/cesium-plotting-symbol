import * as mu from '../mapUtil.ts'
import Polygon from './Polygon.js'
import * as turf from '@turf/turf'
import { Entity, Viewer, JulianDate, CallbackProperty } from 'cesium'

export default class Circle extends Polygon {
  maxPointNum = 2
  minPointNum = 2
  
  constructor(p, viewer: Viewer, layer: Entity){
    super({type: '圆', ...p}, viewer, layer)
  }

  calcuteShape (points: Array<Entity>, time: JulianDate) {
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

  override initTempShape(): void {
    this.addTempLine(new CallbackProperty((time, result) => {
      return this.ctls.map(ent => ent.position?.getValue(time))
    }, false))
  }

}
