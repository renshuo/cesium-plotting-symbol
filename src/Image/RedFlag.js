import Image from './Image'
import Cesium from 'cesium/Source/Cesium.js'

export default class RedFlag extends Image {
  constructor (p) {
    super({
      type: '红旗',
      image: 'redflag1.png',
      ...p
    })
  }
}
