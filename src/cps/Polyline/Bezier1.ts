
import BezierN from './BezierN.js';
import { Viewer, Entity } from 'cesium';

export default class Bezier1 extends BezierN {
  maxPointNum = 3

  constructor(p: {}, viewer: Viewer, layer: Entity){
    super({
      type: '2阶bezier曲线',
      ...p
    }, viewer, layer)
  }
}
