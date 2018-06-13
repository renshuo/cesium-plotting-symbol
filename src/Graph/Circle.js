import Graph from '../Graph'
import Cesium from 'cesium/Source/Cesium.js'
import Ellipse from './Ellipse.js'
import * as mu from '../mapUtil.js'

export default class Circle extends Ellipse {
  maxPointNum = 2
  ent

  calcuteMajor (center, p1, p2, time) {
    return this.calcuteRadius(center, p1, time)
  }
  calcuteMinor (center, p1, p2, time) {
    return this.calcuteRadius(center, p1, time)
  }
}
