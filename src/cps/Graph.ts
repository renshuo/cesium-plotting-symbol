import * as Cesium from 'cesium';
export type Position = {
  longitude: number;
  latitude: number;
  height: number;
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
  viewer: Cesium.Viewer
  /**
   * set max ctl point number
   * when ctlPoints.length >= maxPointNum call this.finish()
   */
  maxPointNum: number = Infinity
  minPointNum: number = 1
  isHideTempLine: boolean = true

  graph: Cesium.Entity
  ctls: Array<Cesium.Entity> = []
  shapes: Array<Cesium.Entity> = []
  tempShapes: Array<Cesium.Entity> = []

  highLighted: boolean = false

  public propDefs: Array<PropDef | PropDefNum> = [
    { name: 'name', title: '名称', type: 'string', editable: true  },
    { name: 'type', title: '类型', type: 'string', editable: false },
    { name: 'description', title: '描述', type: 'string', editable: true},
    { name: 'level', title: '层', type: 'number', editable: true, min: -10, max: 10, step: 1 },
    { name: 'color', title: '颜色', type: 'color', editable: true },
    { name: 'alpha', title: '透明度', type: 'number', editable: true, step: 0.05, max: 1, min: 0 },
  ]

  props = {
    name: '',
    description: '',
    level: 1,
    type: 'graph',
    color: '#00ff00',
    alpha: 0.8,
    ctls: []
  }


  constructor(props: {}, viewer: Cesium.Viewer, layer: Cesium.DataSource) {
    if (!viewer) {
      throw 'get null viewer.'
    }
    this.viewer = viewer
    this.entities = layer.entities
    Object.assign(this.props, props)

    this.graph = this.entities.add({
      id: layer.name + '_graph_' + Graph.seq++,
    })
    this.initRootEntity(layer)
    // this.initProps(properties)
    this.initShape()
    this.initTempShape()
    this.initCtls(props.ctls)
  }

  initCtls (ctlsPos: Array<Position | Array<number>>) {
    if (ctlsPos) {
      ctlsPos.forEach((pos: Position | Array<number>) => {
        if (pos instanceof Array) {
          if (pos.length === 2) {
            let c3 = Cesium.Cartesian3.fromDegrees(pos[0], pos[1])
            let ctl = this.addCtlPointCar(c3)
            ctl.finish()
          } else if (pos.length === 3) {
            let c3 = Cesium.Cartesian3.fromDegrees(pos[0], pos[1], pos[2])
            let ctl = this.addCtlPointCar(c3)
            ctl.finish()
          } else {
            console.log('invalid pos array length: ', pos)
          }
        } else {
          let c3 = Cesium.Cartesian3.fromDegrees(pos.longitude, pos.latitude, pos.height)
          let ctl = this.addCtlPointCar(c3)
          ctl.finish()
        }
      })
      this.finish()
    }
  }

  initRootEntity (layer: Cesium.DataSource) {
  }



  /**
   * 初始化主图形
   */
  initShape(): void {
    console.log('init shape.', this.ctls)
  }

  /**
   * 根据新增的ctl, 更新图形。每次增加新的ctl时，会调用此方法更新
   */
  increaseShape(ctl: Cesium.Entity): void {
    console.log("update current shape for increase a ctl. ", ctl)
  }

  /**
   * 删除末尾ctl时更新图形。每次删除ctl时，会调用此方法更新
   */
  decreaseShape(ctl: Cesium.Entity): void {
    console.log("update current shape for decrease a ctl: ", ctl)
  }

  /**
   * 根据ctls的坐标信息初始化辅助图形
   */
  initTempShape(): void {
    console.log('init temp shape', this.ctls)
  }

  /*
   * 更新辅助图形，每次增加新的ctl时，会调用此方法更新
   */
  increaseTempShape(ctl: Cesium.Entity): void {
    console.log("update temp shape for increase a ctl: ", ctl)
  }

  /**
   * 删除末尾ctl时更新辅助线。每次删除ctl时，会调用此方法更新
   */
  decreaseTempShape(ctl: Cesium.Entity): void {
    console.log("update temp shape for decrease a ctl: ", ctl)
  }



  /**
   * 返回当前Graph的属性，以及控制点数据
   */
  getProperties() {
    let p = {
      obj: this.constructor.name,
      ctls: this.getCtlPositionsPos()
    }
    Object.assign(p, this.props)
    return p
  }

  /**
   * 返回当前graph的所有控制点坐标，Pos类型： lon, lat, hei
   */
  getCtlPositionsPos (): Array<Position|undefined> {
    return this.getCtlPositions().map( c3 => {
      return this.Cartesian3ToPosition(c3)
    } )
  }
  /**
   * 返回当前graph的所有控制点坐标（cartesian3）
   */
  getCtlPositions (): Array<Cesium.Cartesian3|undefined> {
    return this.ctls.map( ctl => {
      let c3 = ctl.position.getValue(Cesium.JulianDate.now())
      if (c3) {
        return c3
      } else {
        return undefined
      }
    })
  }

  addCtlPointCar(car3: Cesium.Cartesian3): Cesium.Entity {
    console.log("in add ctl Pos")

    let ctlPoint: Cesium.Entity = this.entities.add({
      id: this.graph.id + '_ctlpoint_' + Graph.seq++,
      graph: this,
      point: {
        pixelSize: 8,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        color: Cesium.Color.fromBytes(255, 255, 255, 70),
        outlineWidth: 1,
        outlineColor: Cesium.Color.AQUA
      },
      label: {
        font: '10px sans-serif',
        style: Cesium.LabelStyle.FILL,
        showBackground: true,
        backgroundColor: Cesium.Color.BLACK.withAlpha(0.3),
        backgroundPadding: new Cesium.Cartesian2(3,2),
        horizontalOrigin : Cesium.HorizontalOrigin.CENTER,
        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
        pixelOffset : new Cesium.Cartesian2(0, -10),
        outlineWidth: 0,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        text: ""
      },
      position: car3,
    })

    this.ctls.push(ctlPoint)
    console.log('added a ctl: ', ctlPoint, this.ctls)
    this.increaseShape(ctlPoint)
    this.increaseTempShape(ctlPoint)
    return ctlPoint
  }

  fillShape(ent: Cesium.Entity) {
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
    this.initTempShape()
  }

  /**
   * 图形绘制结束后调用
   */
  finish () {
    console.log("finish current graph: ", this)
    this.ctls.map((ctl) => { ctl.show = false })
    this.tempShapes.map(ent => { this.entities.remove(ent) })
    this.tempShapes = []
  }

  /* ############# delete ############# */

  delete() {
    this.entities.remove(this.graph)
    this.ctls.map( (ctl) => { this.entities.remove(ctl) })
    this.shapes.map((shp) => { this.entities.remove(shp) })
    this.tempShapes.map( (tmp) => {this.entities.remove(tmp)})
  }

  /**
   * delete last point,
   */
  deleteLastPoint () {
    let e = this.ctls.pop()
    if (e !== undefined) {
      this.entities.remove(e)
      console.log('remove last control point: ', e)
      this.decreaseTempShape(e)
      this.decreaseShape(e)
      //TODO 删除最后一个ctl后，需要重新pickup前一个ctl
    } else {
      console.log('no last point')
    }
  }

  /* util */

  public Cartesian3ToPosition(c3: Cesium.Cartesian3|undefined): Position|undefined {
    if (!c3) {
      return undefined
    }
    let co = Cesium.Cartographic.fromCartesian(c3, this.viewer.scene.globe.ellipsoid)
    if (!co) {
      return undefined
    }
    let pos: Position = {
      longitude: Cesium.Math.toDegrees(co.longitude),
      latitude: Cesium.Math.toDegrees(co.latitude),
      height: co.height
    }
    return pos
  }
}
