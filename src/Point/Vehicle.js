import Model from './Model.js'

export default class Vehicle extends Model {

  constructor (id) {
    super(id)
    this.props.type.value = '地面站'
    this.props.uri.value = 'GroundVehiclePBR/GroundVehiclePBR.gltf'
    this.props.scale.value = 10000
  }

}
