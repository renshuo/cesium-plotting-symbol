import Model from './Model.js'

export default class Boat extends Model {

  constructor (p, viewer, layer) {
    super({
      type: '船',
      uri: 'boat.gltf',
      scale: 30,
      ...p
    }, viewer, layer)
  }

}