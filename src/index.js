import EditMode from './EditMode'

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

import pe from './PropEditor/index.vue'
import * as mapUtil from './mapUtil.js'

export const mu = mapUtil
export const PropEditor = pe
export default class GraphManager {
 
  em
  constructor (viewer, propEditor) {
    this.viewer = viewer
    this.em = new EditMode(viewer, propEditor)
  }

  /**
   * into select mode
   */
  start () {
    this.em.start()
  }

  destroyHandler () {
    this.em.destroyHandler()
  }

  /**
   * begin draw a graph
   * @param {graph param} json 
   */
  create (json) {
    let obj = this.createObj(json)
    return this.em.create(obj)
  }

  /**
   * draw a graph with ctls.
   * finish to edit mode.
   * @param {graph param with ctls} json 
   */
  draw (json) {
    let obj = this.createObj(json)
    return this.em.draw(obj)
  }
  
  findById(id) {
    return this.em.findById(id)
  }

  findByType(type) {
    return this.em.findByType(type)
  }

  delete (graph) {
    return this.em.deleteGraph(graph)
  }

  deleteSelectGraph () {
    return this.em.deleteSelectGraph()
  }

  deleteAll () {
    this.em.clean()
  }

  clean () {
    this.em.clean()
  }

  save () {
    return this.em.save()
  }

  load (jsons) {
    return this.em.load(jsons.map(json => this.createObj(json)))
  }

  createObj (json) {
    console.log('createObj from json: ', json.obj)
    switch (json.obj) {
      case 'RedFlag': return new RedFlag(json, this.viewer)
      case 'Image': return new Image(json, this.viewer)
  
      case 'Point': return new Point(json, this.viewer)
      case 'Boat': return new Boat(json, this.viewer)
      case 'Satellite': return new Satellite(json, this.viewer)
      case 'Station': return new Station(json, this.viewer)
      case 'Vehicle': return new Vehicle(json, this.viewer)
  
      case 'Polygon': return new Polygon(json, this.viewer)
      case 'Arrow1': return new Arrow1(json, this.viewer)
      case 'Circle': return new Circle(json, this.viewer)
      case 'Ellipse': return new Ellipse(json, this.viewer)
      case 'Rectangle': return new Rectangle(json, this.viewer)
  
      case 'Polyline': return new Polyline(json, this.viewer)
      case 'Bezier1': return new Bezier1(json, this.viewer)
      case 'Bezier2': return new Bezier2(json, this.viewer)
      case 'BezierN': return new BezierN(json, this.viewer)
      case 'BezierSpline': return new BezierSpline(json, this.viewer)
      case 'CircleArc': return new CircleArc(json, this.viewer)
      default:
        console.log('invalid type')
        return undefined
    }
  }
}
