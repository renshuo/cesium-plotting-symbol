import Polyline from './Polyline.js'
import * as mu from '../mapUtil';
import {Bezier} from 'bezier-js';
import _ from 'lodash'
import {Entity, Viewer, JulianDate} from 'cesium';

export default class BezierN extends Polyline {

  constructor(p: {}, viewer: Viewer, layer: Entity) {
    super({
      type: 'n阶bezier曲线',
      ...p
    }, viewer, layer)
  }

  calcuteShape (points: Array<Entity>, time: JulianDate) {
    if (points.length < this.minPointNum) {
      return []
    }
    if (points.length < 2) {
      return points.map((p) => p.position.getValue(time))
    } else {
      let linestr = points.map((p) => mu.cartesian2lonlat(p.position.getValue(time)))
      let lonlat = linestr.map(p => {return {x: p[0], y: p[1]}})
      let curvePoints = new Bezier(lonlat).getLUT()
      return curvePoints.map((p) => mu.lonlat2Cartesian([p.x, p.y]))
    }
  }
}
