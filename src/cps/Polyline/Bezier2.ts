import BezierN from './BezierN.js'
import {Viewer, Entity} from 'cesium';

export default class Bezier2 extends BezierN {
  maxPointNum = 4

  constructor(p: {}, viewer: Viewer, layer: Entity){
    super({
      type: '3阶bezier曲线',
      ...p
    }, viewer, layer)
  }

}
