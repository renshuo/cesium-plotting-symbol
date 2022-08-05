import * as mu from './mapUtil';
import * as Cesium from 'cesium';
import _ from 'lodash';


type Pos = {
  lon: number;
  lat: number;
  hei: number;
}

type PropDef = {
  name: string;
  title: string;
  type: string;
  editable: boolean;
}

type PropDefNum = PropDef & {
  min: number;
  max: number;
  step: number;
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
  isShowTempLine: boolean = false

  graph: Cesium.Entity
  ctls: Array<Cesium.Entity> = []
  shapes: Array<Cesium.Entity> = []
  ctlpos: Array<Pos> = []
  tempShapes: Array<Cesium.Entity> = []

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
    alpha: 0.8,
    ctls: []
  }

  constructor(props: {}, viewer: Cesium.Viewer, layer: Cesium.Entity, isShowTempLine: boolean = false) {
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
    this.isShowTempLine = isShowTempLine
    if (isShowTempLine) {
      this.initTempShape()
    }
    this.initCtls(props.ctls)
  }

  initCtls (ctlsPos: Array<Pos | Array<number>>) {
    if (ctlsPos) {
      ctlsPos.forEach((pos: Pos | Array<number>) => {
        if (pos instanceof Array) {
          if (pos.length === 2) {
            let p: Pos = { lon: pos[0], lat: pos[1], hei: 0 }
            this.ctlpos.push(p)
            this.addCtlPoint(p)
          } else if (pos.length === 3) {
            let p: Pos = {lon: pos[0], lat: pos[1], hei: pos[2]}
            this.ctlpos.push(p)
            this.addCtlPoint(p)
          } else {
            console.log('invalid pos array length: ', pos)
          }
        } else {
          this.ctlpos.push(pos)
          this.addCtlPoint(pos)
        }
      })
    }
  }

  initRootEntity (layer: Cesium.Entity) {
  }

  initShape() {
    throw 'should overide by sub class.'
  }


  addTempLine(positions: Cesium.CallbackProperty): Cesium.Entity {
    let ent = new Cesium.Entity({
      polyline: {
        width: 1,
        material: Cesium.Color.BLUE.withAlpha(0.7),
        positions: positions
      }
    })
    this.tempShapes.push(this.entities.add(ent))
    return ent
  }

  initTempShape(): void {
    this.addTempLine(new Cesium.CallbackProperty((time, result) => {
      return this.ctls.map(ent => ent.position?.getValue(time))
    }, false))
  }

  /**
   * 返回当前Graph的属性，以及控制点数据
   */
  getProperties() {
    let p = {
      obj: this.constructor.name,
      ctls: this.ctlpos
    }
    Object.assign(p, this.props)
    return p
  }

  /**
   * 返回当前graph的所有控制点坐标，Pos类型： lon, lat, hei
   */
  getCtlPositionsPos (): Array<Pos> {
    return this.ctlpos
  }
  /**
   * 返回当前graph的所有控制点坐标（cartesian3）
   */
  getCtlPositions (): Array<Cesium.Cartesian3> {
    return this.ctlpos.map(pos => mu.lonlatheiObj2Cartesian(pos) )
  }

  addCtlPoint (pos: Pos): Cesium.Entity {
    console.log("in add ctl Pos")
    let cartesian3 = mu.lonlatheiObj2Cartesian(pos)
    this.ctlpos.push(pos)
    let ctlPoint: Cesium.Entity = this.entities.add({
      id: this.graph.id + '_ctlpoint_' + Graph.seq++,
      position: cartesian3,
      point: {
        pixelSize: 8,
        color: Cesium.Color.fromBytes(255, 255, 255, 70),
        outlineWidth: 1,
        outlineColor: Cesium.Color.AQUA
      },
      label: {
        text: 'Lon: ' + pos.lon.toPrecision(5) + '\u00B0' +
        '\nLat: ' + pos.lat.toPrecision(5) + '\u00B0',
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
        if (window.cursorPos) {
          return window.cursorPos.clone()
        } else {
          return cartesian3
        }
      }, false)
    }
    ctlPoint.graph = this
    this.ctls.push(ctlPoint)
    console.log('added a ctl: ', ctlPoint, this.ctls)
    return ctlPoint
  }

  fillShape(ent: Cesium.Entity) {
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
    return this.ctlpos.length >= this.maxPointNum
  }

  /**
   * 返回当前ctl数量是否可以绘制图形
   * 无限max点的图形比较min值，比如，polygon至少需要3个点，polyline至少需要2个点... 
   * 对于限定ctl数量的图形，ctlnum >= max 返回true
   */
  isCtlNumValid () {
    let ctlnum = this.ctlpos.length
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
    if (this.isShowTempLine) {
      this.initTempShape()
    }
  }

  /**
   * 图形绘制结束后调用
   */
  finish () {
    this.ctls.map((ctl) => { ctl.show = false })
    this.tempShapes.map(ent => { this.entities.remove(ent) })
    this.tempShapes = []
  }

  /* ############# delete ############# */

  delete() {
    this.entities.remove(this.graph)
    this.ctls.map( (ctl) => { this.entities.remove(ctl) })
    this.ctlpos = []
    this.shapes.map((shp) => { this.entities.remove(shp) })
  }

  /**
   * delete last point,
   */
  deleteLastPoint () {
    let e = this.ctls.pop()
    if (e !== undefined) {
      this.entities.remove(e)
      this.ctlpos.pop()
      console.log('remove last control point: ', e)
    } else {
      console.log('no last point')
    }
  }

  // /**
  //  * delelte a point in list
  //  * @param {ctlPoint} ctlPoint
  //  */
  // deleteCtlPoint (ctlPoint: Cesium.Entity) {
  //   let i = this.ctls.indexOf(ctlPoint)
  //   this.ctls.splice(i, 1)
  //   this.entities.remove(ctlPoint)
  // }
}
