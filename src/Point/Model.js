import Graph from '../Graph.js'
import Cesium from 'cesium/Source/Cesium.js'
import Point from '../Point/Point.js'

export default class Model extends Point {

  constructor (p) {
    super({
      type: '3D模型',
      color: '#ffffff',
      scale: 30,
      uri: 'boat.gltf',
      ...p
    })
  }

  initProps (p) {
    super.initProps(p)
    this.props.pixelSize = {}
    this.props.scale = {
      value: p.scale, title: '缩放', type: 'number', min: 10, max: 100
    }
    this.props.uri = {
      value: p.uri, title: '模型', type: 'string'
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
