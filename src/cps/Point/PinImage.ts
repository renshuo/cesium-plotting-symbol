import Graph from '../Graph'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil.ts'
import Pin from './Pin'

export default class PinImage extends Pin {

  constructor (p, viewer, layer) {
    super({
      type: 'BillBoard',
      image: '/facility.gif',
      color: '#ff0',
      alpha: 0.8,
      width: 30,
      height: 30, 
      ...p
    }, viewer, layer)
    this.propDefs.push(
      { name: 'image', title: '图片', type: 'string', editable: false },
    )
  }

  initShape() {
    let ent = this.entities.add(new Cesium.Entity({billboard: {}}))
    this.fillShape(ent)
    Object.assign(ent.billboard, {
      image: new Cesium.CallbackProperty((time, result) => {
        return this.props.image
      }, true),
      color: new Cesium.CallbackProperty((time, result) => {
        let c = Cesium.Color.fromCssColorString(this.props.color).withAlpha(this.props.alpha)
        return ent.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
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
