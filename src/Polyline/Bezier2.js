import Polyline from './Polyline.js'
import Cesium from 'cesium/Source/Cesium.js'
import * as mu from '../mapUtil.js'
import Bezier from 'bezier-js'
import _ from 'lodash'
import BezierN from './BezierN.js'

export default class Bezier2 extends BezierN {
  maxPointNum = 4

  constructor(p){
    super({
      type: '3阶bezier曲线',
      ...p
    })
  }

}