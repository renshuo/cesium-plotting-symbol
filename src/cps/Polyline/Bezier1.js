import Polyline from './Polyline.js'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil.js'
import * as Bezier from 'bezier-js'
import _ from 'lodash'
import BezierN from './BezierN.js'

export default class Bezier1 extends BezierN {
  maxPointNum = 3

  constructor(p, viewer, layer){
    super({
      type: '2阶bezier曲线',
      ...p
    }, viewer, layer)
  }
}
