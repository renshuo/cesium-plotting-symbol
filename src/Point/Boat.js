import Graph from '../Graph.js'
import Cesium from 'cesium/Source/Cesium.js'
import Point from '../Point/Point.js'
import * as mu from '../mapUtil.js'

export default class Boat extends Point {

  constructor (id) {
    super(id)
    this.props.type.value = '船'
  }

  initProps () {
    super.initProps()
    this.props.pixelSize = {}
    this.props.scale = {
      value: 30, title: '缩放', type: 'number', min: 10, max: 100
    }
  }
  initShape() {
    this.ent = this.addShape({
      id: 'boat_' + Graph.seq++,
      model: {
        uri: '../../../static/model/boat.gltf',
        scale: new Cesium.CallbackProperty((time, result) => this.props.scale.value, false),
        color: new Cesium.CallbackProperty((time, result) => {
          let c = Cesium.Color.fromCssColorString(this.props.color.value)
          return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
        }, false),
      }
    })
  }

}