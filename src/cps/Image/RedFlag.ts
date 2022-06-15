import Image from './Image'
import { Viewer, Entity} from 'cesium';


export default class RedFlag extends Image {
  constructor (p, viewer:Viewer, layer: Entity) {
    super({
      type: '红旗',
      image: 'image/redflag1.png',
      ...p
    }, viewer, layer)
  }
}
