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
import _ from 'lodash'

export const mu = mapUtil
export const PropEditor = pe
export default class GraphManager {
 
  graphList = []
  lastGraph = undefined

  layer
  em
  constructor (viewer, propEditor, layerId) {
    this.viewer = viewer
    this.layer = this.viewer.entities.getOrCreateEntity( layerId ? layerId : 'biaohui')
    console.log('create layer: ', this.layer)
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
    this.lastGraph = this.createObj(json)
    this.graphList.push(this.lastGraph)
    return this.em.create(this.lastGraph)
  }

  /**
   * draw a graph with ctls.
   * finish to edit mode.
   * @param {graph param with ctls} json 
   */
  draw (json) {
    this.lastGraph = this.createObj(json)
    this.graphList.push(this.lastGraph)
    return this.em.draw(this.lastGraph)
  }
  
  findById(id) {
    return _.find(this.graphList, (graph) => graph.props.id.value === id)
  }

  findByType(type) {
    return _.find(this.graphList, (graph) => graph.props.type.value === type)
  }

  delete (graph) {
    let deleted = undefined
    if (graph) {
      graph.deleteGraph()
      _.remove(this.graphList, graph)
      deleted = graph
    } else {
      deleted = this.em.deleteSelectGraph()
      if (deleted) {
        _.remove(this.graphList, deleted)
      }
    }
    console.log('deleted graph: ', deleted)
  }

  clean () {
    this.graphList.forEach(graph => {
      this.deleteGraph(graph)
    })
  }

  deleteAll () {
    this.clean()
  }

  clean () {
    this.em.clean()
  }

  load (jsons) {
    return jsons.map(json => this.draw(json))
  }

  save () {
    let graphs = this.graphList.map( graph => graph.getProperties())
    return graphs
  }

  createObj (json) {
    console.log('createObj from json: ', json.obj)
    if (this.lastGraph) {
      this.lastGraph.finish() //TODO check is graph exist and operate list
    }
    switch (json.obj) {
      case 'RedFlag': return new RedFlag(json, this.viewer, this.layer)
      case 'Image': return new Image(json, this.viewer, this.layer)
  
      case 'Point': return new Point(json, this.viewer, this.layer)
      case 'Boat': return new Boat(json, this.viewer, this.layer)
      case 'Satellite': return new Satellite(json, this.viewer, this.layer)
      case 'Station': return new Station(json, this.viewer, this.layer)
      case 'Vehicle': return new Vehicle(json, this.viewer, this.layer)
  
      case 'Polygon': return new Polygon(json, this.viewer, this.layer)
      case 'Arrow1': return new Arrow1(json, this.viewer, this.layer)
      case 'Circle': return new Circle(json, this.viewer, this.layer)
      case 'Ellipse': return new Ellipse(json, this.viewer)
      case 'Rectangle': return new Rectangle(json, this.viewer, this.layer)
  
      case 'Polyline': return new Polyline(json, this.viewer, this.layer)
      case 'Bezier1': return new Bezier1(json, this.viewer, this.layer)
      case 'Bezier2': return new Bezier2(json, this.viewer, this.layer)
      case 'BezierN': return new BezierN(json, this.viewer, this.layer)
      case 'BezierSpline': return new BezierSpline(json, this.viewer, this.layer)
      case 'CircleArc': return new CircleArc(json, this.viewer, this.layer)
      default:
        console.log('invalid type')
        return undefined
    }
  }
}
