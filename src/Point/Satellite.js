import Model from './Model.js'
import * as mu from '../mapUtil.js'

export default class Satellite extends Model {

  constructor (id) {
    super(id)
    this.props.type.value = '卫星'
    this.props.uri.value = 'satellite.gltf'
    this.props.scale.value = 30000
  }

  initProps () {
    super.initProps()
    this.props.height = {
      value: 700000, title: '高度', type: 'number', min: 1, max: 30000000, unit: '米'
    }    
  }

  calcuteShape (ctlPoint, time) {
    let cart = ctlPoint.position.getValue(time)
    let lonlat = mu.cartesian2lonlat(cart)
    return mu.lonlat2Cartesian(lonlat, this.props.height.value)
  }

}
