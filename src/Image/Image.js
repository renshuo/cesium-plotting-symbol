import Graph from '../Graph'
import Rectangle from '../Polygon/Rectangle'
import Cesium from 'cesium/Source/Cesium.js'

export default class Image extends Rectangle {
  constructor () {
    super()
    this.initShape()
    this.props.type.value = '图'
  }

  initProps () {
    super.initProps()
    this.props.color.value='#ffffff'
    this.props.alpha.value = 1
    this.props.image = {
      value: 'i1.png', title: 'fill', type: 'string'
    }
  }

  initShape() {
    this.ent = this.addShape({
      polygon: {
        fill: new Cesium.CallbackProperty((time, result) => this.props.fill.value, true),
        material: new Cesium.ImageMaterialProperty({
          image: new Cesium.CallbackProperty((time, result) => '../../../static/img/' + this.props.image.value, false),
          color: new Cesium.CallbackProperty((time, result) => {
            let c = Cesium.Color.fromCssColorString(this.props.color.value).withAlpha(this.props.alpha.value)
            return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
          }, false),
          transparent: true
        }),
        height: 0,
        outline: false,
      }
    })
  }
}
