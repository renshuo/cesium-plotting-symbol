import * as Cesium from 'cesium';
import Polygon from './Polygon'
import * as mu from '../mapUtil'
import * as turf from '@turf/turf'

export default class SplineArea extends Polygon {

  minPointNum = 3

  constructor (prop, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '平滑面',
      ...prop
    }, viewer, layer)
    this.propDefs.push(
    )
  }

  calcuteShape (points, time) {
    if (points.length < this.minPointNum) {
      return []
    }
    if (points.length < 2) {
      return points.map((pt) => pt.position.getValue(time))
    } else {
      let linestr = points.map((p) => mu.cartesian2lonlat(p.position.getValue(time)))
      linestr.push(linestr[0])
      let line = turf.lineString(linestr)
      let curved = turf.bezierSpline(line)
      let geometry = curved.geometry.coordinates
      return geometry.map((p) => mu.lonlat2Cartesian(p))
    }
  }
}
