import Graph from '../Graph.js'
import Cesium from 'cesium/Source/Cesium.js'
import Point from '../Point/Point.js'
import * as mu from '../mapUtil.js'

export default class Satellite extends Point {

  initShape() {
    this.ent = this.addShape({
      id: 'vehicle_' + Graph.seq++,
      model: {
        uri: '../../../static/model/satellite.gltf',
        scale: new Cesium.CallbackProperty((time, result) => this.scale, false),
        color: new Cesium.CallbackProperty((time, result) => {
          if (this.highLighted) {
            return Cesium.Color.fromBytes(...this.color, this.alpha*256).brighten(0.6, new Cesium.Color())
          } else {
            return Cesium.Color.fromBytes(...this.color, this.alpha*256)
          }
        }, false),
      }
    })

    this.color = [ 128, 0, 255]
    this.alpha = 0.80
    this.propEditor.addColor(this, 'color')
    this.propEditor.add(this, 'alpha', 0, 1)

    this.scale = 20000
    this.propEditor.add(this, 'scale', 0, 130000)

    this.height = 800000
    this.propEditor.add(this, 'height', 0, 30000000)
  }

  calcuteShape (ctlPoint, time) {
    let cart = ctlPoint.position.getValue(time)
    let lonlat = mu.cartesian2lonlat(cart)
    return mu.lonlat2Cartesian(lonlat, this.height)
  }

}
