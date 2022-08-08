import Graph from '../Graph'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil.ts'
import Pin from './Pin'

/**
   maki icon: https://www.mapbox.com/maki-icons/
   /static/Cesium/Assets/Textures/maki/**.png
 */
export default class PinMakiIcon extends Pin {

  pinBuilder = new Cesium.PinBuilder()

  constructor (p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '图标板',
      icon: 'hospital',
      ...p
    }, viewer, layer)
    this.propDefs.push(
      { name: 'icon', title: '图标名', type: 'string', editable: true }
    )
  }

  initShape() {
    let ent = this.entities.add(new Cesium.Entity({billboard: {}}))
    this.fillShape(ent)
    let icon = this.props.icon

    Object.assign(ent.billboard, {
      image: new Cesium.CallbackProperty((time, result) => {
        let c = Cesium.Color.fromCssColorString(this.props.color).withAlpha(this.props.alpha)
        return this.pinBuilder.fromMakiIconId(this.props.icon, c, this.props.height)
      }, true),
      rotation: new Cesium.CallbackProperty((time, result) => {
        return (360-this.props.rotation) * 3.14 / 180
      }, true),
      scale: new Cesium.CallbackProperty((time, result) => {
        return this.props.scale
      }, true),
      width: new Cesium.CallbackProperty((time, result) => {
        return this.props.width
      }, true),
      height: new Cesium.CallbackProperty((time, result) => {
        return this.props.height
      }, true),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
      verticalOrigin : Cesium.VerticalOrigin.BOTTOM
    })
    ent.position = new Cesium.CallbackProperty((time, result) => {
      return this.calcuteShape(this.ctls.concat(window.cursor), time)
    }, false)
  }

}
