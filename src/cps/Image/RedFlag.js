import Image from './Image'
import * as Cesium from 'cesium';

export default class RedFlag extends Image {
  constructor (p, viewer, layer) {
    super({
      type: '红旗',
      image: 'redflag1.png',
      ...p
    }, viewer, layer)
  }
}
