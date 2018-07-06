import Cesium from 'cesium/Source/Cesium.js'
import Graph from '../Graph.js'
import * as mu from '../mapUtil.js'

export default class Polyline extends Graph {

  minPointNum = 2

  constructor (prop) {
    super({
      type: '折线',
      width: 1,
      color: '#00FF00',
      alpha: 0.8,
      fill: true,
      ...prop
    })
    this.initShape()
  }

  initProps (p) {
    super.initProps(p)
    Object.assign(this.props,
      {
        width: {
          value: p.width, title: '线宽', type: 'number', min: 1, max: 256
        },
        color: {
          value: p.color, title: '颜色', type: 'color'
        },
        alpha: {
          value: p.alpha, title: '透明度', type: 'number', step: 0.05, max: 1, min: 0
        }
      }
    )
  }

  initShape() {
    this.ent = this.addShape({
      id: 'arrow1_' + Graph.seq++,
      polyline: {
        width: new Cesium.CallbackProperty((time, result) => this.props.width.value, true),
        fill: true,
        material: new Cesium.ColorMaterialProperty(
          new Cesium.CallbackProperty((time, result) => {
            let c = Cesium.Color.fromCssColorString(this.props.color.value).withAlpha(this.props.alpha.value)
            return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
          }, false)),
        height: 0,
        outline: true,
        outlineWidth: 1,
        outlineColor: Cesium.Color.fromCssColorString('#fd7f44')
      }
    })
  }

  addHandler (ctlPoint, ctl) {
    if (ctl._children.length === 1) {
      this.ent.polyline.positions = new Cesium.CallbackProperty((time, result) => {
        return this.calcuteShape(this.graph.ctl._children.concat(window.cursor), time)
      }, false)
    }
  }

  calcuteShape (points, time) {
    return points.map(ent => ent.position.getValue(time))
  }

  toEdit () {
    super.toEdit()
    this.ent.polyline.positions = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.graph.ctl._children, time)
    }, false)
  }

  finish () {
    if (this.ent) {
      super.finish()
      this.ent.polyline.positions = this.calcuteShape(this.graph.ctl._children, mu.julianDate())
    }
  }
}
