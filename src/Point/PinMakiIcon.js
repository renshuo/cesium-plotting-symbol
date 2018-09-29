import Graph from '../Graph'
import Cesium from 'cesium/Source/Cesium.js'
import * as mu from '../mapUtil.js'
import Pin from './Pin'

/**
   maki icon: https://www.mapbox.com/maki-icons/
   /static/Cesium/Assets/Textures/maki/**.png
 */
export default class PinMakiIcon extends Pin {

  pinBuilder = new Cesium.PinBuilder()

  constructor (p, viewer, layer) {
    super({
      type: '文字板',
      icon: 'hospital',
      color: '#fff',
      alpha: 0.8,
      width: 30,
      height: 30, 
      ...p
    }, viewer, layer)
  }

  initProps (defs) {
    super.initProps([
      {name: 'icon', title: '图标名', type: 'string'},
      {name: 'color', title: '颜色', type: 'color'},
      {name: 'alpha', title: '透明度', type: 'number', step: 0.05, max: 1, min: 0},
      ...defs
    ])
  }

  initShape() {
    this.ent = this.entities.add(new Cesium.Entity({billboard: {}}))
    this.fillShape(this.ent)
    let icon = this.ent.propx.icon.value

    Object.assign(this.ent.billboard, {
      image: new Cesium.CallbackProperty((time, result) => {
        let c = Cesium.Color.fromCssColorString(this.ent.propx.color.value).withAlpha(this.ent.propx.alpha.value)
        
        return this.pinBuilder.fromMakiIconId(this.ent.propx.icon.value, c, this.ent.propx.height.value)
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
