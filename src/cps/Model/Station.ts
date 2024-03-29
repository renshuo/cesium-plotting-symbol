import Model from './Model'

export default class Station extends Model {

  constructor (p, viewer, layer) {
    super({
      type: '地面站',
      uri: 'station.glb',
      scale: 500,
      ...p
    }, viewer, layer)
    this.propDefs.push(
      { name: 'uri', title: '图标', type: 'string', editable: false },
      { name: 'scale', title: '缩放', type: 'number', editable: true, min: 1, max: 1000, step: 1 },
    )
  }
}
