import EditMode from './EditMode'

import Image from './Image/Image.js'
import RedFlag from './Image/RedFlag.js'

import Point from './Point/Point.js'
import Boat from './Point/Boat.js'
import Satellite from './Point/Satellite.js'
import Station from './Point/Station.js'
import Vehicle from './Point/Vehicle.js'
import PinText from './Point/PinText.js'
import PinIcon from './Point/PinMakiIcon.js'
import PinImage from './Point/PinImage.js'

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
import _ from 'lodash'

export {
  mapUtil,
  PropEditor
}
export default class GraphManager {
 
  graphList = []

  layer
  em
  constructor (viewer, userCfg) {
    this.config  = {
      propEditor: undefined,
      layerId: 'biaohui',
      editAfterCreate: false,
      ...userCfg
    }
    this.viewer = viewer
    this.layer = this.viewer.entities.getOrCreateEntity(this.config.layerId)
    this.em = new EditMode(viewer, this.config.propEditor, this.config.editAfterCreate)
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
  create (json, afterCreate, afterEdit) {
    let obj = this.createObj(json)
    obj.afterCreate = afterCreate
    obj.afterEdit = afterEdit
    obj.graphList = this.graphList
    return this.em.create(obj)
  }

  /**
   * draw a graph with ctls.
   * finish to edit mode.
   * @param {graph param with ctls} json 
   */
  draw (json) {
    let obj = this.createObj(json)
    this.graphList.push(obj)
    obj.graphList = this.graphList
    return this.em.draw(obj)
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
      graph.delete()
      deleted = graph
      _.remove(this.graphList, deleted)
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
      graph.delete()
    })
    this.graphList.splice(0, this.graphList.length)
  }

  deleteAll () {
    this.clean()
  }

  load (jsons) {
    return jsons.map(json => this.draw(json))
  }

  save () {
    let graphs = this.graphList.map( graph => graph.getProperties())
    return graphs
  }

  createObj (json) {
    let g = this.createObj0(json)
    return g.ent
  }

  createObj0 (json) {
    console.log('createObj from json: ', json)
    switch (json.obj) {
      case 'RedFlag': return new RedFlag(json, this.viewer, this.layer)
      case 'Image': return new Image(json, this.viewer, this.layer)
        
      case 'Point': return new Point(json, this.viewer, this.layer)
      case 'Boat': return new Boat(json, this.viewer, this.layer)
      case 'Satellite': return new Satellite(json, this.viewer, this.layer)
      case 'Station': return new Station(json, this.viewer, this.layer)
      case 'Vehicle': return new Vehicle(json, this.viewer, this.layer)
      case 'PinText': return new PinText(json, this.viewer, this.layer)
      case 'PinIcon': return new PinIcon(json, this.viewer, this.layer)
      case 'PinImage': return new PinImage(json, this.viewer, this.layer)

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
