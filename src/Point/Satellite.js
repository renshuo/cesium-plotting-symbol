import Graph from '../Graph.js'
import Cesium from 'cesium/Source/Cesium.js'
import Point from '../Point/Point.js'
import * as mu from '../mapUtil.js'

export default class Satellite extends Point {

  initProps () {
    super.initProps()
    this.props.pixelSize = {}
    this.props.scale = {
      value: 30000, title: '缩放', type: 'number', min: 10, max: 300000
    }
    this.props.height = {
      value: 700000, title: '高度', type: 'number', min: 1, max: 30000000, unit: '米'
    }    
  }

  initShape() {
    this.ent = this.addShape({
      id: 'vehicle_' + Graph.seq++,
      model: {
        uri: '../../../static/model/satellite.gltf',
        scale: new Cesium.CallbackProperty((time, result) => this.props.scale.value, false),
        color: new Cesium.CallbackProperty((time, result) => {
          let c = Cesium.Color.fromCssColorString(this.props.color.value)
          return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
        }, false),
      }
    })
  }

  calcuteShape (ctlPoint, time) {
    let cart = ctlPoint.position.getValue(time)
    let lonlat = mu.cartesian2lonlat(cart)
    return mu.lonlat2Cartesian(lonlat, this.props.height.value)
  }

}
