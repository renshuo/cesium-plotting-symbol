import * as mu from './mapUtil';
import * as Cesium from 'cesium';
import _ from 'lodash';


type Pos = {
  lon: number,
  lat: number,
  hei: number
}

type PropDef = {
  name: string,
  title: string,
  type: string,
  editable: boolean,
}

type PropDefNum = PropDef & {
  min: number,
  max: number,
  step: number
}

type GraphProperties = {
  id: string,
  name: string,
  description: string,
  level: number,
  type: string,
}

export default class Graph {
  static seq = new Date().getTime()
  entities: Cesium.EntityCollection

  /**
   * set max ctl point number
   * when ctlPoints.length >= maxPointNum call this.finish()
   */
  maxPointNum: number = Infinity
  minPointNum: number = 1

  graph: Cesium.Entity
  ctls: Array<Cesium.Entity> = []
  shapes: Array<Cesium.Entity> = []

  highLighted: boolean = false

  public propDefs: Array<PropDef | PropDefNum> = [
    { name: 'id', title: '编号', type: 'string', editable: false },
    { name: 'name', title: '名称', type: 'string', editable: true  },
    { name: 'type', title: '类型', type: 'string', editable: false },
    { name: 'description', title: '描述', type: 'string', editable: true},
    { name: 'level', title: '层', type: 'number', editable: true, min: -10, max: 10, step: 1 },
    { name: 'color', title: '颜色', type: 'color', editable: true },
    { name: 'alpha', title: '透明度', type: 'number', editable: true, step: 0.05, max: 1, min: 0 },
  ]

  props = {
    id:'',
    name: '',
    description: '',
    level: 1,
    type: 'graph',
    color: '#00ff00',
    alpha: 0.8
  }

  constructor(props: {}, viewer: Cesium.Viewer, layer: Cesium.Entity) {
    if (!viewer) {
      throw 'get null viewer.'
    }
    this.entities = viewer.entities
    Object.assign(this.props, props)

    this.graph = this.entities.add({
      id: layer.id + '_graph_' + Graph.seq++,
      parent: layer
    })
    this.initRootEntity(layer)
    // this.initProps(properties)
    this.initShape()
    this.initCtls(props.ctls)
  }

  // initProps (properties: GraphProperties) {

  //   [
  //     ...defs
  //   ].forEach(prop => {
  //     prop.value = this.properties[prop.name]
  //     this.props[prop.name] = prop
  //   })
  // }

  initCtls (ctls) {
    if (ctls) {
      ctls.forEach(pos => {
        let p = {}
        if (pos instanceof Array) {
          if (pos.length === 2) {
            p = {lon: pos[0], lat: pos[1]}
          } else if (pos.length === 3) {
            p = {lon: pos[0], lat: pos[1], hei: pos[2]}
          } else {
            console.log('invalid pos array length: ', pos)
          }
        } else {
          p = pos
        }
        console.log('pos: ', p)
        this.addCtlPoint(p)
      })
    }
  }

  initRootEntity (layer: Cesium.Entity) {
  }

  initShape() {
    throw 'should overide by sub class.'
  }

  /**
   * 返回当前Graph的属性，以及控制点数据
   */
  getProperties() {
    let p = {
      obj: this.constructor.name
    }
    _.forIn(this.props, (v, k) => {
      p[k] = v.value
    })
    p.ctls = this.getCtlPositions().map((c3: Cesium.Cartesian3) => {
      let lonlat = mu.cartesian2lonlat(c3)
      return {lon: lonlat[0], lat: lonlat[1]}
    })
    return p
  }

  /**
   * 返回当前graph的所有控制点坐标（cartesian3）
   */
  getCtlPositions (): Array<Cesium.Cartesian3> {
    let dt = Cesium.JulianDate.fromDate(new Date())
    return this.ctls.map( (ctl: Cesium.Entity) => {
      let p = ctl.position?.getValue(dt)
      return p == undefined ? new Cesium.Cartesian3(0,0,0) : p
    })
  }

  addCtl (cartesian3: Cesium.Cartesian3) {
    let pos = mu.cartesian2lonlat(cartesian3)
    let ctlPoint: Cesium.Entity = this.entities.add({
      id: this.graph.id + '_ctlpoint_' + Graph.seq++,
      graphType: 'ctl',
      position: cartesian3,
      point: {
        pixelSize: 8,
        color: Cesium.Color.fromBytes(255, 255, 255, 70),
        outlineWidth: 1,
        outlineColor: Cesium.Color.AQUA
      },
      label: {
        text: 'Lon: ' + pos[0].toPrecision(5) + '\u00B0' +
        '\nLat: ' + pos[1].toPrecision(5) + '\u00B0',
        font : '12px monospace',
        horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
        verticalOrigin : Cesium.VerticalOrigin.TOP,
        pixelOffset : new Cesium.Cartesian2(15, 0)
      }
    })
    ctlPoint.finish = () => {
      ctlPoint.label.text = ctlPoint.label.text.getValue(Cesium.JulianDate.fromDate(new Date()))
      ctlPoint.position = ctlPoint.position.getValue(Cesium.JulianDate.fromDate(new Date()))
    }
    ctlPoint.pickup = () => {
      ctlPoint.label.text = new Cesium.CallbackProperty((time, result) => {
        let p = mu.cartesian2lonlat(ctlPoint.position.getValue(time))
        return 'Lon: ' + p[0].toPrecision(5) + '\u00B0' +
               '\nLat: ' + p[1].toPrecision(5) + '\u00B0'
      }, false)
      ctlPoint.position = new Cesium.CallbackProperty((time, result) => {
        return window.cursorPos.clone()
      }, false)
    }
    console.log('added a ctl: ', ctlPoint)
    this.handleNewCtl(ctlPoint)
    this.ctls.push(ctlPoint)
    return ctlPoint
  }

  handleNewCtl (ctl) {
  }

  addCtlPoint (pos) {
    let c3 = mu.lonlatheiObj2Cartesian(pos)
    this.addCtl(c3)
  }

  fillShape (ent) {
    if (this.props.id === undefined || this.props.id === '') {
      this.props.id = ent.id
    }
    ent.graph = this
    this.shapes.push(ent)
    ent.level = new Cesium.CallbackProperty((time, result) => {
      return this.props.level
    }, true)
  }

  highLight() {
    this.highLighted = true
  }

  lowLight() {
    this.highLighted = false
  }
  /**
   * 对于maxPointNum为指定值的图形，返回是否已达到最大ctl数量
   * 比如rectange只需要2个点即可结束绘制
   */
  ishaveMaxCtls () {
    return this.ctls.length >= this.maxPointNum
  }

  /**
   * 返回当前ctl数量是否可以绘制图形
   * 无限max点的图形比较min值，比如，polygon至少需要3个点，polyline至少需要2个点... 
   * 对于限定ctl数量的图形，ctlnum >= max 返回true
   */
  isCtlNumValid () {
    let ctlnum = this.ctls.length
    if (this.maxPointNum === Infinity){
      return ctlnum >= this.minPointNum
    } else {
      return ctlnum >= this.maxPointNum
    }
  }

  /**
   * 进入编辑模式
   */
  toEdit () {
    this.highLighted = false
    this.ctls.map( (ctl) => {ctl.show = true})
  }
  /**
   * 图形绘制结束后调用
   */
  finish () {
    this.ctls.map((ctl) => { ctl.show = false })
  }

  /* ############# delete ############# */

  delete() {
    this.entities.remove(this.graph)
    this.ctls.map( (ctl) => { this.entities.remove(ctl) })
    this.shapes.map((shp) => { this.entities.remove(shp) })
  }

  /**
   * delete last point,
   */
  deleteLastPoint () {
    let e = this.ctls.pop()
    if (e !== undefined) {
      this.entities.remove(e)
      console.log('remove last control point: ', e)
    } else {
      console.log('no last point')
    }
  }

  /**
   * delelte a point in list
   * @param {ctlPoint} ctlPoint
   */
  deleteCtlPoint (ctlPoint: Cesium.Entity) {
    let i = this.ctls.indexOf(ctlPoint)
    this.ctls.splice(i, 1)
    this.entities.remove(ctlPoint)
  }
}
