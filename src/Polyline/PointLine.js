import Cesium from 'cesium/Source/Cesium.js'
import Graph from '../Graph.js'
import Polyline from './Polyline.js'
import * as mu from '../mapUtil.js'

export default class PointLine extends Polyline {

  constructor (prop, viewer, layer) {
    super({
      type: '顶点折线',
      width: 1,
      color: '#00FF00',
      alpha: 0.8,
      fill: true,
      pointPixelSize: 12,
      pointColor: '#00FF00',
      pointAlpha: 0.8,
      ...prop
    }, viewer, layer)
  }

  initProps (defs) {
    super.initProps([
      {name: 'color', title: '颜色', type: 'color'},
      {name: 'alpha', title: '透明度', type: 'number', step: 0.05, max: 1, min: 0},
      {name: 'width', title: '线宽', type: 'number', min: 1, max: 256},
      {name: 'pointColor', title: '顶点颜色', type: 'color'},
      {name: 'pointAlpha', title: '顶点透明度', type: 'number', step: 0.05, max: 1, min: 0},
      {name: 'pointPixelSize', title: '顶点大小', type: 'number', min: 1, max: 256},

      ...defs
    ])
  }

  handleNewCtl (ctl) {
    let p = this.entities.add(new Cesium.Entity({ point: {}}))
    this.fillShape(p)
    Object.assign(p.point, {
      pixelSize: new Cesium.CallbackProperty((time, result) => this.ent.propx.pointPixelSize.value, true),
      color: new Cesium.CallbackProperty((time, result) => {
        let c = Cesium.Color.fromCssColorString(this.ent.propx.pointColor.value).withAlpha(this.ent.propx.pointAlpha.value)
        return this.ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
      }, true),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    })
    p.position = new Cesium.CallbackProperty((time, result) => {
      return ctl.position.getValue(Cesium.JulianDate.fromDate(new Date()))
    }, false)
  }
}
