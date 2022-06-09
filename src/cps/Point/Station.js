import Model from './Model'

export default class Station extends Model {

  constructor (p, viewer, layer) {
    super({
      type: '地面站',
      uri: 'station.gltf',
      scale: 2000,
      ...p
    }, viewer, layer)
  }
}
