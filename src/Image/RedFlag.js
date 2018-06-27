import Image from './Image'
import Cesium from 'cesium/Source/Cesium.js'

export default class RedFlag extends Image {
  constructor () {
    super()
    this.initShape()
    this.props.type.value = '红旗'
    this.props.image.value = 'redflag1.png'
  }
}
