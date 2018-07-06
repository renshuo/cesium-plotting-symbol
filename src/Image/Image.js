import Graph from '../Graph'
import Rectangle from '../Polygon/Rectangle'
import Cesium from 'cesium/Source/Cesium.js'

export default class Image extends Rectangle {
  
  constructor (p) {
    super({
      type: '图',
      color: '#fff',
      alpha: 1,
      image: 'th1.jpg',
      ...p
    })
    this.initShape()
  }

  initProps (p) {
    super.initProps(p)
    this.props.image = {
      value: p.image, title: 'fill', type: 'string'
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
