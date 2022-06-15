import Polyline from './Polyline.js'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil.ts'
import * as Bezier from 'bezier-js'
import _ from 'lodash'
import BezierN from './BezierN.js'

export default class Bezier2 extends BezierN {
  maxPointNum = 4

  constructor(p, viewer, layer){
    super({
      type: '3阶bezier曲线',
      ...p
    }, viewer, layer)
  }

}
