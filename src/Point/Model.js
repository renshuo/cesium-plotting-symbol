import Graph from '../Graph.js'
import Cesium from 'cesium/Source/Cesium.js'
import Point from '../Point/Point.js'

export default class Boat extends Point {

  constructor (id) {
    super(id)
    this.props.type.value = '3D模型'
    this.props.color.value = '#ffffff'
  }

  initProps () {
    super.initProps()
    this.props.pixelSize = {}
    this.props.scale = {
      value: 30, title: '缩放', type: 'number', min: 10, max: 100
    }
    this.props.uri = {
      value: 'boat.gltf', title: '模型', type: 'string'
    }
  }

  initShape() {
    this.ent = this.addShape({
      id: 'model_' + Graph.seq++,
      model: {
        uri: new Cesium.CallbackProperty((time, result) => '../../../static/model/' + this.props.uri.value, true),
        scale: new Cesium.CallbackProperty((time, result) => this.props.scale.value, true),
        color: new Cesium.CallbackProperty((time, result) => {
          let c = Cesium.Color.fromCssColorString(this.props.color.value).withAlpha(this.props.alpha.value)
          return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
        }, false),
      }
    })
  }
}
