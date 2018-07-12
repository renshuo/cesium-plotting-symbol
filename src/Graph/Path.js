import Cesium from 'cesium/Source/Cesium.js'
import Graph from '../Graph'
import * as mu from '../mapUtil.js'
import Polyline from '../Polyline/Polyline.js'

export default class Path extends Polyline {

  addHandler (ctlPoint, ctl) {
    if (ctl._children.length === 1) {
      this.ent = this.addShape({
        id: 'arrow1_' + Graph.seq++,
        path: {
          width: 1,
          material: new Cesium.Color(0.98, 0.5, 0.265, 0.8),
          distanceDisplayCondition: {
            near: 0,
            far: 10000
          }
        }
      })
      this.ent.polyline.positions = new Cesium.CallbackProperty((time, result) => {
        return this.calcuteShape(this.graph.ctl._children.concat(window.cursor), time)
      }, false)
    }
  }

}