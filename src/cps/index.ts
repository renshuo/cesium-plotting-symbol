import EditMode from './EditMode';

// image
import Image from './Image/Image';
import RedFlag from './Image/RedFlag';

//model
import Satellite from './Model/Satellite';
import Station from './Model/Station';

//point
import Point from './Point/Point';

// pin
import PinText from './Pin/PinText';
import PinIcon from './Pin/PinMakiIcon';
import PinImage from './Pin/PinImage';

//polygon
import Polygon from './Polygon/Polygon';
import Arrow1 from './Polygon/Arrow1';
import Circle from './Polygon/Circle';
import Ellipse from './Polygon/Ellipse';
import Rectangle from './Polygon/Rectangle';
import SquareArrow from './Polygon/SquareArrow'

//polyline
import Polyline from './Polyline/Polyline';
import Bezier1 from './Polyline/Bezier1';
import Bezier2 from './Polyline/Bezier2';
import BezierN from './Polyline/BezierN';
import BezierSpline from './Polyline/BezierSpline';
import CircleArc from './Polyline/CircleArc';
import PointLine from './Polyline/PointLine';
import PointSpline from './Polyline/PointSpline';

import PropEditor from './PropEditor/index.vue';
import * as mapUtil from './mapUtil';
import _ from 'lodash';
import * as Cesium from 'cesium';


type GMConfig = {
  propEditor: any,
  layerId: string,
  editAfterCreate: boolean
}

class GraphManager {

  viewer: Cesium.Viewer
  config: GMConfig = {
    propEditor: undefined,
    layerId: 'biaohui',
    editAfterCreate: false
  }

  graphList: Array<Any> = []

  layer: Cesium.Entity

  em: EditMode

  constructor(viewer: Cesium.Viewer, userCfg: GMConfig) {
    this.viewer = viewer;
    Object.assign(this.config, userCfg)
    console.log("create GraphManager: ", viewer, this.config)
    this.layer = this.viewer.entities.getOrCreateEntity(this.config.layerId);
    this.em = new EditMode(viewer, this.config.propEditor, this, this.config.editAfterCreate);
  }

  /**
   * into select mode
   */
  start(): void {
    this.em.start();
  }

  destroyHandler(): void {
    this.em.destroyHandler();
  }

  /**
   * begin draw a graph
   * @param json graph param
   */
  create(json) {
    let obj = this.createObj(json);
    return this.em.create(obj);
  }

  /**
   * draw a graph with ctls.
   * finish to edit mode.
   * @param {graph param with ctls} json 
   */
  draw(json) {
    let obj = this.createObj(json);
    return this.em.draw(obj);
  }

  findById(id: string): Cesium.Entity | undefined {
    return _.find(this.graphList, (graph: Cesium.Entity) => graph.propx.id.value === id);
  }

  findByType(type: string): Cesium.Entity | undefined {
    return _.find(this.graphList, (graph: Cesium.Entity) => graph.propx.type.value === type);
  }

  delete(graph) {
    let deleted = undefined;
    if (graph) {
      graph.delete();
      deleted = graph;
      _.remove(this.graphList, deleted);
    } else {
      deleted = this.em.deleteSelectGraph();
      if (deleted) {
        _.remove(this.graphList, deleted);
      }
    }
    console.log('deleted graph: ', deleted);
  }

  clean() {
    this.graphList.forEach(graph => {
      graph.delete();
    });
    this.graphList.splice(0, this.graphList.length);
  }

  deleteAll() {
    this.clean();
  }

  load(jsons) {
    return jsons.map(json => this.draw(json));
  }

  save() {
    let graphs = this.graphList.map(graph => graph.getProperties());
    return graphs;
  }

  createObj(json) {
    console.log('createObj from json: ', json);
    switch (json.obj) {
      case 'RedFlag': return new RedFlag(json, this.viewer, this.layer);
      case 'Image': return new Image(json, this.viewer, this.layer);

      case 'Point': return new Point(json, this.viewer, this.layer);

      case 'Satellite': return new Satellite(json, this.viewer, this.layer);
      case 'Station': return new Station(json, this.viewer, this.layer);

      case 'PinText': return new PinText(json, this.viewer, this.layer);
      case 'PinIcon': return new PinIcon(json, this.viewer, this.layer);
      case 'PinImage': return new PinImage(json, this.viewer, this.layer);

      case 'Polygon': return new Polygon(json, this.viewer, this.layer);
      case 'Arrow1': return new Arrow1(json, this.viewer, this.layer);
      case 'Circle': return new Circle(json, this.viewer, this.layer);
      case 'Ellipse': return new Ellipse(json, this.viewer, this.layer);
      case 'Rectangle': return new Rectangle(json, this.viewer, this.layer);
      case 'SquareArrow': return new SquareArrow(json, this.viewer, this.layer);

      case 'Polyline': return new Polyline(json, this.viewer, this.layer);
      case 'Bezier1': return new Bezier1(json, this.viewer, this.layer);
      case 'Bezier2': return new Bezier2(json, this.viewer, this.layer);
      case 'BezierN': return new BezierN(json, this.viewer, this.layer);
      case 'BezierSpline': return new BezierSpline(json, this.viewer, this.layer);
      case 'CircleArc': return new CircleArc(json, this.viewer, this.layer);
      case 'PointLine': return new PointLine(json, this.viewer, this.layer);
      case 'PointSpline': return new PointSpline(json, this.viewer, this.layer);

      default:
        console.log('invalid type');
        return undefined;
    }
  }
}


export {
  mapUtil,
  PropEditor,
  GraphManager
}
