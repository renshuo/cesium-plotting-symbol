import Model from './Model.js'

export default class Vehicle extends Model {

  constructor (p, viewer) {
    super({
      type: '车',
      uri: 'GroundVehiclePBR/GroundVehiclePBR.gltf',
      scale: 10000,
      ...p
    }, viewer)
  }
}
