import Polyline from "./Polyline";
import * as Cesium from 'cesium'

export default class BeeLine extends Polyline {

  maxPointNum = 2

  constructor(prop: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '线段',
      ...prop
    }, viewer, layer)
  }

}
