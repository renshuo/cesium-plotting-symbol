import EditMode from './EditMode'

import Point from './Graph/Point'
import Polygon from './Graph/Polygon'
import Polyline from './Graph/Polyline'
import Arrow1 from './Graph/Arrow1'
import * as mapUtil from './mapUtil.js'

function start (obj) {
  EditMode.getInstance().nextMode(EditMode.ACT_START)
  EditMode.getInstance().nextMode(EditMode.ACT_CREATE, obj)
  return obj
}
export default {
  EditMode,
  Point,
  Polyline,
  Polygon,
  Arrow1,
  start,
  mapUtil
}
