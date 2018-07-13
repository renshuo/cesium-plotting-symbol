import _ from 'lodash'
import em from './EditMode'
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

class GraphManager {

  start (json) {
    let obj = json instanceof Graph ? json : this.createObj(json)
    return em.create(obj)
  }

  draw (json) {
    let obj = json instanceof Graph ? json : this.createObj(json)
    return em.draw(obj)
  }

  delete () {
    return em.deleteSelectGraph()
  }

  deleteAll () {
     em.clean()
  }

  clean () {
    em.clean()
  }

  save () {
    return em.save()
  }

  load (jsons) {
    return em.load(jsons.map(json => this.createObj(json)))
  }

  createObj (json) {
    console.log('createObj from json: ', json.obj)
    switch (json.obj) {
      case 'RedFlag': return new RedFlag(json)
      case 'Image': return new Image(json)
  
      case 'Point': return new Point(json)
      case 'Boat': return new Boat(json)
      case 'Satellite': return new Satellite(json)
      case 'Station': return new Station(json)
      case 'Vehicle': return new Vehicle(json)
  
      case 'Polygon': return new Polygon(json)
      case 'Arrow1': return new Arrow1(json)
      case 'Circle': return new Circle(json)
      case 'Ellipse': return new Ellipse(json)
      case 'Rectangle': return new Rectangle(json)
  
      case 'Polyline': return new Polyline(json)
      case 'Bezier1': return new Bezier1(json)
      case 'Bezier2': return new Bezier2(json)
      case 'BezierN': return new BezierN(json)
      case 'BezierSpline': return new BezierSpline(json)
      case 'CircleArc': return new CircleArc(json)
      default:
        console.log('invalid type')
        return undefined
    }
  }
}

const gm = new GraphManager()
Object.assign(gm, {
  Graph,
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

  mapUtil,
  PropEditor,
})

export default gm