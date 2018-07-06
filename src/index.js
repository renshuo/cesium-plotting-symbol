import EditMode from './EditMode'
import Graph from './Graph'

import Image from './Image/Image.js'
import RedFlag from './Image/RedFlag.js'

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

import PropEditor from './PropEditor/index.vue'

import * as mapUtil from './mapUtil.js'

EditMode.getInstance()

function start (obj) {
  EditMode.getInstance().nextMode(EditMode.ACT_CREATE, obj)
  return obj
}

function create (obj) {
  EditMode.getInstance().nextMode(EditMode.ACT_FINISH, obj)
  obj.finish()
  return obj
}

function deleteGraph () {
  EditMode.getInstance().deleteGraph()
}

function deleteAllGraph () {
  EditMode.getInstance().deleteAllGraph()
}

export default {
  Graph,
  EditMode,
  Image,
  RedFlag,
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
  create,
  deleteGraph,
  deleteAllGraph,
  mapUtil,
  PropEditor
}
