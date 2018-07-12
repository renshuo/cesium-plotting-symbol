import Cesium from 'cesium/Source/Cesium.js'
import * as mu from './mapUtil.js'
import kb from 'keyboardjs'
import gx from './index.js'

export class EditMode {

  graphList = []

  constructor() {
    this.initKeyboard()
    window.editMode = this
  }

  /** handler单例 */
  getHandler (viewer = window.viewer) {
    if (!this.handler || this.handler.isDestroyed()) {
      this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    }
    return this.handler
  }
  destroyHandler () {
    this.handler.destroy()
    this.handler = undefined
  }

  initKeyboard () {
    this.initKeyboardView()
    this.initKeyboardCreate()
    this.initKeyboardSelect()
    this.initKeyboardEdit()
    this.initKeyboardCtledit()
  }

  MODE_VIEW = 'view'
  MODE_CREATE = 'create'
  MODE_SELECT = 'select'
  MODE_EDIT = 'edit'
  MODE_CTLEDIT = 'ctlEdit'

  ACT_START = 'start'
  ACT_CREATE = 'create'
  ACT_SELECT = 'select'
  ACT_FINISH = 'finish'
  ACT_PICKUP = 'pickup'

  static seq = new Date().getTime()

  create(obj) {
    this.nextMode(this.ACT_CREATE, obj)
    this.graphList.push(obj)
    return obj
  }

  draw (obj) {
    this.nextMode(this.ACT_FINISH, obj)
    obj.finish()
    this.graphList.push(obj)
    return obj
  }

  clean () {
    mu.deleteEnts(window.layer.biaohui._children)
    this.graphList = []
  }

  save () {
    let graphs = this.graphList.map( graph => graph.getProperties())
    return graphs
  }

  load (objs) {
    objs.forEach(graph => this.draw(graph))
  }

  mode = this.MODE_VIEW
  nextMode (action, ...args) {
    console.log(`mode changed from '${this.mode}' by action '${action}'`)
    switch (this.mode) {
      case this.MODE_VIEW:
        switch (action) {
          case this.ACT_START:
            this.selectMode()
            break
          case this.ACT_CREATE:
            /** 原本设计有启动绘图面板，即 MODE_VIEW + ACT_START，然后才可进入create模式
             * 如果没有绘图面板开启功能，则ACT_CREATE直接进入创建模式 */
            this.createMode(...args)
            break
        }
        break
      case this.MODE_SELECT: {
        this.finishCurrentSelect()
        switch (action) {
          case this.ACT_CREATE:
            this.createMode(...args)
            break
          case this.ACT_SELECT:
            this.editMode(...args)
            break
          case this.ACT_FINISH:
            this.viewMode()
            break
          }
        }
        break
      case this.MODE_CREATE: {
        this.finishCurrentCreate()
        switch (action) {
          case this.ACT_FINISH:
            this.selectMode()
            break
          case this.ACT_CREATE:
            this.createMode(...args)
            break
          }
        }
        break
      case this.MODE_EDIT: {
        this.finishCurrentEdit()
        switch (action) {
          case this.ACT_FINISH:
            this.selectMode()
            break
          case this.ACT_CREATE:
            this.createMode(...args)
            break
          case this.ACT_PICKUP:
            this.ctlEditMode(...args)
            break
          }
        }
        break
      case this.MODE_CTLEDIT: {
        this.finishCurrentCtledit()
        switch (action) {
        case this.ACT_FINISH:
          this.editMode(...args)
          break
        case this.ACT_CREATE:
          this.createMode(...args)
          break
        }
      }
    }
  }

  showPorpEditor (isShow) {
    let ev = document.createEvent('HTMLEvents')
    ev.initEvent('ppe-show', false, false)
    ev.props = {show: isShow}
    window.dispatchEvent(ev)
  }

  viewMode (viewer = window.viewer) {
    this.mode = this.MODE_VIEW
    kb.setContext(this.mode)
    this.showPorpEditor(false)
    console.log(`into ${this.mode} mode`)
    this.destroyHandler()
    viewer.canvas.style.cursor = 'auto'
  }

  initKeyboardView () {
    kb.withContext(this.MODE_VIEW, () => {
      kb.bind('1', (e) => console.log('view: ', e, this))
    })
  }

  createGraph
  createMode (graphObj, viewer = window.viewer) {
    this.mode = this.MODE_CREATE
    this.createGraph = graphObj
    this.showPorpEditor(true)
    console.log(`into ${this.mode} mode`)

    kb.setContext(this.mode)
    viewer.canvas.style.cursor = 'crosshair'
    this.initCreateCursor()

    this.getHandler().setInputAction(move => {
      window.cursorScreenPos = mu.screen2lonlat(move.endPosition)
      window.cursorPos = mu.lonlat2Cartesian(window.cursorScreenPos)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    this.getHandler().setInputAction(event => {
      let newpos = mu.screen2Cartesian(event.position)
      let p = mu.cartesian2lonlat(newpos)
      this.createGraph.addCtlPoint({lon: p[0], lat: p[1]})
      if (this.createGraph.ishaveMaxCtls()) {
        this.nextMode(this.ACT_FINISH)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    this.getHandler().setInputAction(event => {
      this.createGraph.deleteLastPoint()
    }, Cesium.ScreenSpaceEventType.MIDDLE_CLICK)

    this.getHandler().setInputAction(event => {
      this.nextMode(this.ACT_FINISH)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  /**
   * 完成当前绘图，如果图形能够绘制出来，则绘制，否则删除不成形的图形
   */
  finishCurrentCreate () {
    console.log('finsih create: ', this.createGraph)
    viewer.entities.remove(window.cursor)
    if (this.createGraph) {
      if (this.createGraph.isCtlNumValid()) {
        this.createGraph.finish()
      } else {
        console.log('delete graph by invalid ctlNums')
        this.createGraph.deleteGraph()
      }
    }
  }

  initCreateCursor (viewer = window.viewer) {
    window.cursor = viewer.entities.add({
      id: 'cursor',
      parent: this.createGraph.layer.rootEnt,
      position: new Cesium.CallbackProperty((time, result) => {
        return window.cursorPos === null
          ? null
          : Cesium.Cartesian3.clone(window.cursorPos)
      }, true),
      point: {
        pixelSize: 10,
        color: Cesium.Color.fromBytes(255, 255, 255, 80),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        outlineWidth: 1,
        outlineColor: Cesium.Color.AQUA
      },
      label: {
        text: new Cesium.CallbackProperty((time, result) => {
          return window.cursorScreenPos ?
            'Lon: ' + window.cursorScreenPos[0].toPrecision(5) + '\u00B0' +
            '\nLat: ' + window.cursorScreenPos[1].toPrecision(5) + '\u00B0' :
            ''
        }, true),
        font : '14px monospace',
        horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
        verticalOrigin : Cesium.VerticalOrigin.TOP,
        pixelOffset : new Cesium.Cartesian2(15, 0)
      }
    })
  }

  initKeyboardCreate () {
    kb.withContext(this.MODE_CREATE, () => {
      kb.bind('1', (e) => console.log('create: ', e, this))
    })
  }

  


  hoveredEnt
  selectMode (viewer = window.viewer) {
    this.mode = this.MODE_SELECT
    this.hoveredEnt = undefined
    this.showPorpEditor(false)
    console.log(`into ${this.mode} mode`)
    
    kb.setContext(this.mode)
    viewer.canvas.style.cursor = 'auto'

    this.getHandler().setInputAction(movement => {
      let objs = viewer.scene.drillPick(movement.endPosition)
      if (Cesium.defined(objs)) {
        if (this.hoveredEnt === undefined && objs.length > 0) {
          // moved from empty to ent
          let obj = objs.reduce((a, cur) => {
            return cur.id.seq > a.id.seq ? cur : a
          }, objs[0])
          console.debug(`moved to ent:`, obj)
          obj.id.highLight()
          viewer.canvas.style.cursor = 'pointer'
          this.hoveredEnt = obj
        } else if (this.hoveredEnt !== undefined && objs.length > 0) {
          let obj = objs.reduce((a, cur) => {
            return cur.id.seq > a.id.seq ? cur : a
          }, objs[0])
          if (this.hoveredEnt === obj) {
            // moved on same ent
          } else {
            // moved from ent1 to ent2. ent1 and ent2 maybe overlap
            console.debug(`moved from ent1 to ent2: `, this.hoveredEnt, obj)
            this.hoveredEnt.id.downLight()
            obj.id.highLight()
            viewer.canvas.style.cursor = 'pointer'
            this.hoveredEnt = obj
          }
        } else if (this.hoveredEnt !== undefined && objs.length === 0) {
          console.debug(`moved out of ent: `, this.hoveredEnt)
          this.hoveredEnt.id.downLight()
          viewer.canvas.style.cursor = 'auto'
          this.hoveredEnt = undefined
        } else {
          // nothing for this.hoveredEnt is null and objs is empty
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    this.getHandler().setInputAction(event => {
      if (this.hoveredEnt) {
        let selectedEnt = this.hoveredEnt.id
        this.nextMode(this.ACT_SELECT, selectedEnt)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    this.getHandler().setInputAction(event => {
      this.nextMode(this.ACT_FINISH)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  finishCurrentSelect () {
    if (this.hoveredEnt) {
      this.hoveredEnt.id.downLight()
      this.hoveredEnt = undefined
    }
  }
  
  initKeyboardSelect () {
    kb.withContext(this.MODE_SELECT, () => {
      kb.bind('1', (e) => console.log('select: ', e, this))
      kb.bind(['ctrl+shift+d', 'shift+delete'], e => {
        this.deleteAllGraph()
      })
    })
  }

  currentEditEnt
  editMode (ent, viewer = window.viewer) {
    this.mode = this.MODE_EDIT
    this.currentEditEnt = ent
    this.showPorpEditor(true)
    console.log(`into ${this.mode} mode: `, this.currentEditEnt)

    kb.setContext(this.mode)
    viewer.canvas.style.cursor = 'crosshair'
    this.currentEditEnt.toEdit()

    this.getHandler().setInputAction(move => {
      window.cursorPos = mu.screen2Cartesian(move.endPosition)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  
    this.getHandler().setInputAction(event => {
      let objs = viewer.scene.drillPick(event.position)
      if (Cesium.defined(objs)) {
        let ctl = objs.filter((st) => {
          return st.id.graphType === 'ctl' &&
            st.id.parent.parent === ent.parent.parent
        })
        if (ctl.length > 0) {
          this.nextMode(this.ACT_PICKUP, ctl[0].id, this.currentEditEnt)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  
    this.getHandler().setInputAction(event => {
      this.nextMode(this.ACT_FINISH)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  finishCurrentEdit() {
    if (this.currentEditEnt) {
      this.currentEditEnt.finish()
      this.currentEditEnt = undefined
    }
  }

  initKeyboardEdit () {
    kb.withContext(this.MODE_EDIT, () => {
      kb.bind('1', (e) => console.log('edit: ', e, this))
      kb.bind(['delete', 'ctrl+d'], e => {
        this.deleteSelectGraph()
      })
    })
  }

  deleteSelectGraph () {
    if (this.currentEditEnt) {
      let graph = this.currentEditEnt.parent.parent.graph
      this.currentEditEnt = undefined
      graph.deleteGraph()
      _.remove(this.graphList, graph)
      this.nextMode(this.ACT_FINISH)
      return graph
    } else {
      console.log('no graph selected.')
      return undefined
    }
  }

  pickedctl
  ctlEditMode (picked, edited, viewer = window.viewer) {
    this.mode = this.MODE_CTLEDIT
    this.pickedctl = picked
    this.currentEditEnt = edited
    console.log(`into ${this.mode} mode: `, this.pickedctl, this.currentEditEnt)
    
    kb.setContext(this.mode)
    viewer.canvas.style.cursor = 'crosshair'
    this.currentEditEnt.toEdit()
    this.pickedctl.pickup()

    this.getHandler().setInputAction(move => {
      window.cursorPos = mu.screen2Cartesian(move.endPosition)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    this.getHandler().setInputAction(event => {
      this.pickedctl.finish()
      this.nextMode(this.ACT_FINISH, this.currentEditEnt)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    this.getHandler().setInputAction(event => {
      this.pickedctl.finish()
      this.nextMode(this.ACT_FINISH, this.currentEditEnt)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  finishCurrentCtledit () {
    if (this.pickedctl) {
      this.pickedctl.finish()
      this.pickedctl = undefined
    }
  }

  initKeyboardCtledit () {
    kb.withContext(this.MODE_CTLEDIT, () => {
      kb.bind('1', (e) => console.log('ctledit: ', e, this))
    })
  }
}

export const em = new EditMode()

export default em