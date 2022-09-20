import Polygon from './Polygon'
import {Viewer, Entity, JulianDate, Cartesian3} from 'cesium';


export default class Rectangle extends Polygon {
  maxPointNum = 2
  minPointNum = 2

  constructor(p: {}, viewer: Viewer, layer: Entity) {
    super({ type: '矩形', ...p }, viewer, layer)
  }

  calcuteShape(points: Array<Entity>, time: JulianDate) {
    if (points.length < this.minPointNum) {
      return []
    }
    let ctls = points.map((p) => {
      return this.Cartesian3ToPosition(p.position.getValue(time))
    })
    let p1 = ctls[0]
    let p2 = ctls[1]
    let p = [
      p1.longitude, p1.latitude,
      p1.longitude, p2.latitude,
      p2.longitude, p2.latitude,
      p2.longitude, p1.latitude,
    ]
    return Cartesian3.fromDegreesArray(p)
  }
}
