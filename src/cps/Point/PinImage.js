import Graph from '../Graph'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil.js'
import Pin from './Pin'

export default class PinImage extends Pin {

  constructor (p, viewer, layer) {
    super({
      type: 'BillBoard',
      image: '/static/facility.gif',
      color: '#ff0',
      alpha: 0.8,
      width: 30,
      height: 30, 
      ...p
    }, viewer, layer)
  }

  initProps (defs) {
    super.initProps([
      {name: 'image', title: '图片', type: 'string'},
      {name: 'color', title: '颜色', type: 'color'},
      {name: 'alpha', title: '透明度', type: 'number', step: 0.05, max: 1, min: 0},
      ...defs
    ])
  }

  initShape() {
    this.ent = this.entities.add(new Cesium.Entity({billboard: {}}))
    this.fillShape(this.ent)
    Object.assign(this.ent.billboard, {
      image: new Cesium.CallbackProperty((time, result) => {
        return this.ent.propx.image.value
      }, true),
      color: new Cesium.CallbackProperty((time, result) => {
        let c = Cesium.Color.fromCssColorString(this.ent.propx.color.value).withAlpha(this.ent.propx.alpha.value)
        return this.ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
      }, true),
      rotation: new Cesium.CallbackProperty((time, result) => {
        return (360-this.ent.propx.rotation.value) * 3.14 / 180
      }, true),
      scale: new Cesium.CallbackProperty((time, result) => {
        return this.ent.propx.scale.value
      }, true),
      width: new Cesium.CallbackProperty((time, result) => {
        return this.ent.propx.width.value
      }, true),
      height: new Cesium.CallbackProperty((time, result) => {
        return this.ent.propx.height.value
      }, true),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      verticalOrigin : Cesium.VerticalOrigin.BOTTOM
    })
    this.ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.graph.ctl._children.concat(window.cursor), time)
    }, false)
  }

}
