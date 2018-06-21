import Model from './Model'

export default class Station extends Model {

  constructor (id) {
    super(id)
    this.props.type.value = '地面站'
    this.props.uri.value = 'station.gltf'
    this.props.scale.value = 2000
  }

}
