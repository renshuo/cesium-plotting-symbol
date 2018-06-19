import EditMode from './EditMode'

import Point from './Point/Point.js'
import Boat from './Point/Boat.js'
import Satellite from './Point/Satellite.js'
import Station from './Point/Station.js'
import Vehicle from './Point/Vehicle.js'

import Polygon from './Polygon/Polygon.js'
import Arrow1 from './Polygon/Arrow1.js'
import Circle from './Polygon/Circle.js'
import Ellipse from './Polygon/Ellipse.js'
import Rectangle from './Polygon/Rectangle.js'

import Polyline from './Polyline/Polyline'
import Bezier1 from './Polyline/Bezier1.js'
import Bezier2 from './Polyline/Bezier2.js'
import BezierN from './Polyline/BezierN.js'
import BezierSpline from './Polyline/BezierSpline.js'
import CircleArc from './Polyline/CircleArc.js'


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
  CircleArc,
  Rectangle,
  Boat,
  Vehicle,
  Satellite,
  Station,
  start,
  mapUtil
}
