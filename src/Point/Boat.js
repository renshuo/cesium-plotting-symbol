import Model from './Model.js'

export default class Boat extends Model {

  constructor (id) {
    super(id)
    this.props.type.value = '船'
    this.props.uri.value = 'boat.gltf'
    this.props.scale.value = 30
  }

}