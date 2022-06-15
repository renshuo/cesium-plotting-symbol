import Graph from '../Graph'
import * as Cesium from 'cesium';
import * as mu from '../mapUtil.ts'
import Pin from './Pin'

export default class PinText extends Pin {

  pinBuilder = new Cesium.PinBuilder()

  constructor (p, viewer, layer) {
    super({
      type: '文字板',
      text: 'A',
     ...p
    }, viewer, layer)
    this.propDefs.push(
      { name: 'text', title: '文本', type: 'string', editable: true }
    )
  }


  initShape() {
    let ent = this.entities.add(new Cesium.Entity({billboard: {}}))
    this.fillShape(ent)
    Object.assign(ent.billboard, {
      image: new Cesium.CallbackProperty((time, result) => {
        let c = Cesium.Color.fromCssColorString(this.props.color).withAlpha(this.props.alpha)
        return this.pinBuilder.fromText(this.props.text, c, this.props.height).toDataURL()
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
