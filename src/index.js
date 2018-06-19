import EditMode from './EditMode'

import Point from './Graph/Point'
import Polygon from './Graph/Polygon'
import Polyline from './Graph/Polyline'
import Arrow1 from './Graph/Arrow1'
import Circle from './Graph/Circle.js'
import Ellipse from './Graph/Ellipse.js'
import BezierSpline from './Graph/BezierSpline.js'
import BezierN from './Graph/BezierN'
import Bezier1 from './Graph/Bezier1.js'
import Bezier2 from './Graph/Bezier2.js'
import Boat from './Graph/Boat.js'
import Vehicle from './Graph/Vehicle.js'
import Station from './Graph/Station.js'
import Satellite from './Graph/Satellite.js'

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
  Circle,
  Ellipse,
  BezierSpline,
  BezierN,
  Bezier1,
  Bezier2,
  Boat,
  Vehicle,
  Satellite,
  Station,
  start,
  mapUtil
}
