import Model from './Model.js'
import * as mu from '../mapUtil.js'

export default class Satellite extends Model {

  constructor (p, viewer, layer) {
    super({
      type: '卫星',
      uri: 'satellite.gltf',
      scale: 30000,
      height: 700000,
      ...p
    }, viewer, layer)
  }

  initProps (defs) {
    super.initProps([
      { name: 'height', title: '高度', type: 'Number', min: 1, max: 30000000, unit: '米'},
      ...defs
    ])
  }

  calcuteShape (points, time) {
    if (points.length < this.minPointNum) {
      return []
    }
    let cart = points[0].position.getValue(time)
    let lonlat = mu.cartesian2lonlat(cart)
    return mu.lonlat2Cartesian(lonlat, this.props.height.value)
 }

}
