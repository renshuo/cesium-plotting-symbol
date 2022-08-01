import Model from './Model.js'
import * as mu from '../mapUtil.ts'
import * as Cesium from 'cesium'

export default class Satellite extends Model {

  constructor (prop: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    super({
      type: '卫星',
      uri: 'satellite.gltf',
      scale: 30000,
      height: 700000,
      ...prop
    }, viewer, layer)
    this.propDefs.push(
      { name: 'height', title: '高度', type: 'number', min: 1, max: 30000000, step: 1, unit: '米' }
    )
  }

  calcuteShape(ctls: Array<Cesium.Entity>, time: Cesium.JulianDate) {
    if (ctls.length < this.minPointNum) {
      return []
    }
    let cart = ctls[0].position.getValue(time)
    let lonlat = mu.cartesian2lonlat(cart)
    return mu.lonlat2Cartesian(lonlat, this.props.height)
 }

}
