import * as Cesium from 'cesium';
import Polyline from './Polyline';

export default class PointLine extends Polyline {

  constructor(p: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '顶点折线',
      pointPixelSize: 12,
      pointColor: '#00FF00',
      pointAlpha: 0.8,
      ...p
    }, viewer, layer)
    this.propDefs.push(
      { name: 'pointColor', title: '顶点颜色', type: 'color', editable: true },
      { name: 'pointAlpha', title: '顶点透明度', type: 'number', editable: true, step: 0.05, max: 1, min: 0 },
      { name: 'pointPixelSize', title: '顶点大小', type: 'number', editable: true, min: 1, max: 256, step: 1 },
    )
  }


  //TODO 这里应当用shape实现顶点，类似distanceMeasure
  handleNewCtl (ctl: Cesium.Entity) {
    let p = this.entities.add(new Cesium.Entity({ point: {}}))
    this.fillShape(p)
    Object.assign(p.point, {
      pixelSize: new Cesium.CallbackProperty((time, result) => this.props.pointPixelSize, true),
      color: new Cesium.CallbackProperty((time, result) => {
        let c = Cesium.Color.fromCssColorString(this.props.pointColor).withAlpha(this.props.pointAlpha)
        return this.highLighted ? c.brighten(0.6, new Cesium.Color()) : c
      }, true),
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
    })
    p.position = new Cesium.CallbackProperty((time, result) => {
      return ctl.position.getValue(Cesium.JulianDate.fromDate(new Date()))
    }, true)
  }
}
