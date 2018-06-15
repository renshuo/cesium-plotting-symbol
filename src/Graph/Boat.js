import Graph from '../Graph'
import Cesium from 'cesium/Source/Cesium.js'
import Point from './Point.js'
import * as mu from '../mapUtil.js'

export default class Model extends Point {

  addHandler (ctlPoint, ctl) {
    this.ent = this.addShape({
      id: 'point_' + Graph.seq++,
      path: {
        leadTime: 3600,
        trailTime: 3600,
        width: 1,
        material: new Cesium.Color(0.98, 0.5, 0.265, 0.8),
        distanceDisplayCondition: {
          near: 0,
          far: 10000
        }
      },
      model: {
        uri: '../../../static/model/boat.gltf',
        scale: 2,
        minimumPixelSize: 80,
        maximumScale: 20,
        color: new Cesium.CallbackProperty((time, result) => {
          return this.highLighted ? Cesium.Color.YELLOW : undefined
        }, false)
      }
    })
    this.ent.position = this.calcuteShape(this.graph.ctl._children[0], mu.julianDate())
  }
}