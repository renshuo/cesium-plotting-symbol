import Cesium from 'cesium/Source/Cesium.js'
import Graph from '../Graph.js'
import * as mu from '../mapUtil.js'

import store from '../store/index.js'

export default class Polyline extends Graph {
  ent

  constructor (id) {
    super(id)
    this.initShape()
  }

  initProps () {
    super.initProps()
    this.props.width =  {
      value: 1, title: '线宽', type: 'number', min: 1, max: 256
    }
    this.props.color = {
      value: '#00ff00', title: '颜色', type: 'color'
    }
    this.props.alpha = {
      value: 0.8, title: '透明度', type: 'number', step: 0.05, max: 1, min: 0
    }
  }


  initShape() {
    this.ent = this.addShape({
      id: 'arrow1_' + Graph.seq++,
      polyline: {
        width: new Cesium.CallbackProperty((time, result) => this.props.width.value, false),
        fill: true,
        material: new Cesium.ColorMaterialProperty(
          new Cesium.CallbackProperty((time, result) => {
            let c = Cesium.Color.fromCssColorString(this.props.color.value)
            return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
          }, false)),
        height: 0,
        outline: true,
        outlineWidth: 1,
        outlineColor: Cesium.Color.fromCssColorString('#fd7f44')
      }
    })
    store.dispatch('selected', this.props)
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
    store.dispatch('selected', this.props)
    this.ent.polyline.positions = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.graph.ctl._children, time)
    }, false)
  }

  finish () {
    if (this.ent) {
      super.finish()
      store.dispatch('selected', {})
      this.ent.polyline.positions = this.calcuteShape(this.graph.ctl._children, mu.julianDate())
    }
  }
}
