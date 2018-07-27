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
      outline: false,
      ...p
    })
  }

  initProps (defs) {
    super.initProps([
      {name: 'image', title: '图形', type: 'string'},
      ...defs
    ])
  }

  initShape() {
    this.ent = this.addShape({
      polygon: {
        fill: new Cesium.CallbackProperty((time, result) => this.props.fill.value, true),
        material: new Cesium.ImageMaterialProperty({
          image: new Cesium.CallbackProperty((time, result) => '../../../static/img/' + this.props.image.value, true),
          color: new Cesium.CallbackProperty((time, result) => {
            let c = Cesium.Color.fromCssColorString(this.props.color.value).withAlpha(this.props.alpha.value)
            return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
          }, true),
          transparent: true
        }),
        outline: new Cesium.CallbackProperty((time, result) => this.props.outline.value, true),
        outlineColor: new Cesium.CallbackProperty((time, result) => {
          return Cesium.Color.fromCssColorString(this.props.outlineColor.value).withAlpha(this.props.alpha.value)
        }, true),
        height: 0,
        outlineWidth: new Cesium.CallbackProperty((time, result) => this.props.outlineWidth.value, true)
      }
    })
  }
}
