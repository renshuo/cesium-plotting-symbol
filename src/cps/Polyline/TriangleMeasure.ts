import _ from 'lodash'
import * as Cesium from 'cesium';
import PointLine from './PointLine.js';

export default class TriangleMeasure extends PointLine {

  maxPointNum: number = 2

  constructor(p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '三角测量',
      ...p
    }, viewer, layer)
  }

  override initShape(){
    super.initShape()
    let shp: Cesium.Entity = this.shapes[0]
    shp.polyline.clampToGround = false
  }

  override initTempShape() {
    this.createDistanceText()
  }

  private isLowThen(ctl1: Cesium.Entity, ctl2: Cesium.Entity): number {
    let h1 = this.getCartographic(ctl1).height
    let h2 = this.getCartographic(ctl2).height
    return h1 - h2
  }

  private getPx(pss: Array<Cesium.Entity>): Array<Cesium.Cartesian3> {
    let hss = pss
      .map( ent => ent.position.getValue(Cesium.JulianDate.now()))
      .map( c3 => this.Cartesian3ToCartographic(c3))
      .sort( (coa,cob) => coa.height - cob.height)
    let hx = Cesium.Cartographic.fromRadians(hss[0].longitude, hss[0].latitude, hss[1].height)
    return [hss[0], hx, hss[1]].map( co => this.CartographicToCartesian3(co))
  }

  private createDistanceText() {
    this.shapes.push(this.entities.add(new Cesium.Entity({
      polyline: {
        width: 1,
        material: Cesium.Color.BLUE.withAlpha(0.7),
        positions: new Cesium.CallbackProperty((time, result) => {
          return (this.ctls.length > 1) ? this.getPx(this.ctls) : []
        }, false)
      }
    })))

    this.shapes.push(this.entities.add(new Cesium.Entity({
      position: new Cesium.CallbackProperty((time, result) => {
        return (this.ctls.length>1) ? this.getPx(this.ctls)[1] : undefined
      }, false),
      label: {
        text: new Cesium.CallbackProperty((time, result) => {
          if (this.ctls.length>1) {
            let pxs = this.getPx(this.ctls)

            let distance = Cesium.Cartesian3.distance(this.ctls[0].position.getValue(time), this.ctls[1].position.getValue(time))
            let distance2 = Cesium.Cartesian3.distance(pxs[1], pxs[2])

            let heiDif = this.isLowThen(this.ctls[0], this.ctls[1])
            heiDif = Math.abs(heiDif)

            if (distance < 1000) {
              return "两地距离：" + distance.toFixed(3) + " 米"
                + "\n水平距离：" + distance2.toFixed(3) + " 米"
                + "\n高度差：" + heiDif.toFixed(3) + " 米"
            } else if (distance < 10000) {
              return "两地距离：" + distance.toFixed(2) + " 米"
                + "\n水平距离：" + distance2.toFixed(2) + " 米"
                + "\n高度差：" + heiDif.toFixed(2) + " 米"
            } else {
              return "两地距离：" + (distance / 1000).toFixed(1) + " 千米"
                + "\n水平距离：" + (distance2/1000).toFixed(1) + " 千米"
                + "\n高度差：" + heiDif.toFixed(2) + " 米"
            }
          } else {
            return ""
          }
        }, false),
        font: "12px monospace",
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        pixelOffset: new Cesium.Cartesian2(0, 0)
      }
    })))
  }

}
