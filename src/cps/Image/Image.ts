import Rectangle from '../Polygon/Rectangle';
import { Viewer, Entity, Color, CallbackProperty, PolygonHierarchy, ImageMaterialProperty, JulianDate } from 'cesium';

export default class Image extends Rectangle {

  constructor (p: {}, viewer: Viewer, layer: Entity) {
    super({
      type: '图',
      image: 'image/th1.jpg',
      outline: false,
      ...p
    }, viewer, layer)
    this.propDefs.push(
      { name: 'image', title: '图形', type: 'string', editable: true },
    )
  }

  initShape() {
    let ent = this.entities.add(new Entity({polygon: {}}))
    super.fillShape(ent)
    Object.assign(ent.polygon, {
      fill: new CallbackProperty((time, result) => this.props.fill, true),
      material: new ImageMaterialProperty({
        image: new CallbackProperty((time, result) => '/' + this.props.image, true),
        color: new CallbackProperty((time, result) => {
          let c = Color.fromCssColorString(this.props.color).withAlpha(this.props.alpha)
          return ent.highLighted ? c.brighten(0.6, new Color()) : c
        }, true),
        transparent: true
      }),
      outline: new CallbackProperty((time, result) => this.props.outline, true),
      outlineColor: new CallbackProperty((time, result) => {
        return Color.fromCssColorString(this.props.outlineColor).withAlpha(this.props.alpha)
      }, true),
      height: 0,
      outlineWidth: new CallbackProperty((time, result) => this.props.outlineWidth, true),
      hierarchy: new CallbackProperty((time, result) => {
        let ps = this.calcuteShape(this.ctls, time)
        return new PolygonHierarchy(ps, [])
      }, false)
    })
  }
}
