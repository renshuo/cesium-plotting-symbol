import Polyline from './Polyline.js'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil.ts'
import * as turf from '@turf/turf'
import PointLine from './PointLine.js'

export default class PointSpline extends PointLine {
  
  constructor(prop, viewer, layer){
    super({type: '顶点平滑曲线', ...prop}, viewer, layer)
  }

  calcuteShape (points, time) {
    if (points.length < this.minPointNum) {
      return []
    }
    let linestr = points.map((p) => mu.cartesian2lonlat(p.position.getValue(time)))
    let line = turf.lineString(linestr)
    let curved = turf.bezierSpline(line)
    let geometry = curved.geometry.coordinates
    return geometry.map((p) => mu.lonlat2Cartesian(p))
  }
}
