import * as Cesium from 'cesium';
import kb from 'keyboardjs';
import Graph from './Graph';
import { GraphManager } from './index';
import * as mu from './mapUtil';

enum Mode {
  View,
  Create,
  Select,
  Edit,
  CtlEdit
}

enum Act {
  Start,
  Create,
  Select,
  Finish,
  Pickup,
  PickDown,
  PickReset,
}

enum Cursor {
  auto,
  crosshair,
  pointer
}

export type GraphSelectHandler = (graph: Graph) => void

export class EditMode {

  viewer: Cesium.Viewer
  editAfterCreate: boolean
  gm: GraphManager

  constructor(viewer: Cesium.Viewer, pe: HTMLElement, gm0: GraphManager, editAfterCreate: boolean) {
    console.log('create editmode: ', this, viewer, pe, gm0)
    this.viewer = viewer
    this.editAfterCreate = editAfterCreate
    this.gm = gm0
    this.initKeyboard()
  }

  /** handler单例 */
  handler: Cesium.ScreenSpaceEventHandler | undefined
  getHandler(): Cesium.ScreenSpaceEventHandler {
    if (!this.handler || this.handler.isDestroyed()) {
      this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas)
    }
    return this.handler
  }


  destroyHandler() {
    this.handler?.destroy()
    this.handler = undefined
  }

  initKeyboard() {
    this.initKeyboardView()
    this.initKeyboardCreate()
    this.initKeyboardSelect()
    this.initKeyboardEdit()
    this.initKeyboardCtledit()
  }

  static seq = new Date().getTime()

  start() {
    this.nextMode(Act.Start)
  }

  create(ent: Graph) {
    this.nextMode(Act.Finish) // finish last edit if it is
    this.setCurrentEditEnt(ent)
    this.nextMode(Act.Create)
    return ent
  }

  draw(ent: Graph) {
    this.nextMode(Act.Finish)
    this.setCurrentEditEnt(ent)
    ent.finish()
    this.nextMode(Act.Finish)
    return ent
  }

  mode = Mode.View
  nextMode(action: Act) {
    console.log(`mode changed from '${Mode[this.mode]}' by action '${Act[action]}'`)
    switch (this.mode) {
      case Mode.View:
        switch (action) {
          case Act.Start:
            this.selectMode()
            break
          case Act.Create:
            /** 原本设计有启动绘图面板，即 Mode.View + Act.Start，然后才可进入create模式
             * 如果没有绘图面板开启功能，则Act.Create 直接进入创建模式 */
            this.createMode()
            break
          case Act.Finish:
            // TODO nothing to do for draw a graph ?
            break
        }
        break
      case Mode.Select: {
        this.finishCurrentSelect()
        switch (action) {
          case Act.Create:
            this.createMode()
            break
          case Act.Select:
            this.editMode(action)
            break
          case Act.Finish:
            this.viewMode()
            break
        }
      }
        break
      case Mode.Create: {
        let isSuccess = this.finishCurrentCreate()
        switch (action) {
          case Act.Finish:
            if (isSuccess) {
              if (this.editAfterCreate) {
                this.editMode(action)
              } else {
                this.selectMode()
              }
            } else {
              this.selectMode()
            }
            break
          case Act.Create:
            this.createMode()
            break
        }
      }
        break
      case Mode.Edit: {
        switch (action) {
          case Act.Finish:
            this.finishCurrentEdit()
            this.selectMode()
            break
          case Act.Create:
            this.finishCurrentEdit()
            this.createMode()
            break
          case Act.Pickup:
            this.ctlEditMode()
            break
        }
      }
        break
      case Mode.CtlEdit: {
        this.finishCurrentCtledit()
        switch (action) {
          case Act.Finish:
            this.editMode(action)
            break
          case Act.PickDown:
            this.editMode(action)
            break
          case Act.PickReset:
            this.editMode(action)
            break
          case Act.Create:
            this.createMode()
            break
        }
      }
    }
  }


  currentEditEnt: Graph| undefined = undefined
  hoveredEnt: Cesium.Entity
  pickedctl: Cesium.Entity

  graphSelectHandler: GraphSelectHandler
  setGraphSelectHandler(handler: GraphSelectHandler) {
    this.graphSelectHandler = handler
  }

  setCurrentEditEnt(ent: Graph| undefined) {
    console.log('select a graph: ', ent)
    this.currentEditEnt = ent
    if (this.graphSelectHandler) {
      this.graphSelectHandler(ent)
    }
  }

  viewMode() {
    this.mode = Mode.View
    kb.setContext(this.mode)
    // if (this.propEditor) this.propEditor.show(false)
    console.log(`into ${Mode[this.mode]} mode`)
    this.destroyHandler()
    this.setCursor(Cursor.auto)
  }

  initKeyboardView() {
    kb.withContext(Mode.View, () => {
      kb.bind('1', (e) => console.log('view: ', e, this))
    })
  }

  lastCtl:Cesium.Entity | undefined
  createMode() {
    this.mode = Mode.Create
    console.log(`into ${Mode[this.mode]} mode`, this.currentEditEnt)

    // add a new ctl point and pick it
    this.lastCtl = this.currentEditEnt.addCtlPoint({ lon: 0, lat: 0 })
    this.lastCtl.pickup()

    kb.setContext(this.mode)
    this.setCursor(Cursor.crosshair)

    this.getHandler().setInputAction(move => {
      window.cursorScreenPos = mu.screen2lonlat(move.endPosition, this.viewer)
      window.cursorPos = mu.lonlat2Cartesian(window.cursorScreenPos)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    this.getHandler().setInputAction(event => {
      let newpos = mu.screen2Cartesian(event.position, 0, this.viewer)
      let p = mu.cartesian2lonlat(newpos, this.viewer)
      this.lastCtl.finish()
      if (this.currentEditEnt.ishaveMaxCtls()) {
        this.nextMode(Act.Finish)
      } else {
        this.lastCtl = this.currentEditEnt.addCtlPoint({ lon: p[0], lat: p[1] })
        this.lastCtl.pickup()
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    this.getHandler().setInputAction(event => {
      this.currentEditEnt.deleteLastPoint()
    }, Cesium.ScreenSpaceEventType.MIDDLE_CLICK)

    this.getHandler().setInputAction(event => {
      this.currentEditEnt.deleteLastPoint()
      this.nextMode(Act.Finish)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

  }

  /**
   * 完成当前绘图，如果图形能够绘制出来，则绘制，否则删除不成形的图形
   * return true: Graph create success
   * return false: Graph create fail(deleted)
   */
  finishCurrentCreate(): boolean {
    console.log('finsih create: ', this.currentEditEnt)
    this.viewer.entities.remove(window.cursor)
    if (this.currentEditEnt) {
      if (this.currentEditEnt.isCtlNumValid()) {
        this.currentEditEnt.finish()
        this.setCurrentEditEnt(this.currentEditEnt)
        this.gm.graphList.push(this.currentEditEnt)
        return true
      } else {
        console.log('delete graph by invalid ctlNums')
        this.currentEditEnt.delete()
        this.setCurrentEditEnt(undefined)
        return false
      }
    }
  }

  initCreateCursor() {
    window.cursor = this.viewer.entities.add({
      id: 'cursor',
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
        font: '14px monospace',
        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
        verticalOrigin: Cesium.VerticalOrigin.TOP,
        pixelOffset: new Cesium.Cartesian2(15, 0)
      }
    })
  }

  initKeyboardCreate() {
    kb.withContext(Mode.Create, () => {
      kb.bind('1', (e) => console.log('create: ', e, this))
    })
  }

  selectMode() {
    this.mode = Mode.Select
    this.hoveredEnt = undefined
//    if (this.propEditor) this.propEditor.show(false)
    console.log(`into ${Mode[this.mode]} mode`)

    kb.setContext(this.mode)
    this.setCursor(Cursor.auto)

    this.getHandler().setInputAction(movement => {
      let objs = this.viewer.scene.drillPick(movement.endPosition)
      if (Cesium.defined(objs)) {
        if (this.hoveredEnt === undefined && objs.length > 0) {
          // moved from empty to ent
          let obj = objs.reduce((a, cur) => {
            return cur.id.level.getValue() > a.id.level.getValue() ? cur : a
          }, objs[0])
          console.debug(`moved to ent:`, obj)
          obj.id.graph.highLight()
          this.setCursor(Cursor.pointer)
          this.hoveredEnt = obj
        } else if (this.hoveredEnt !== undefined && objs.length > 0) {
          let obj = objs.reduce((a, cur) => {
            return cur.id.level.getValue() > a.id.level.getValue() ? cur : a
          }, objs[0])
          if (this.hoveredEnt === obj) {
            // moved on same ent
          } else {
            // moved from ent1 to ent2. ent1 and ent2 maybe overlap
            console.debug(`moved from ent1 to ent2: `, this.hoveredEnt, obj)
            this.hoveredEnt.id.graph.lowLight()
            obj.id.graph.highLight()
            this.setCursor(Cursor.pointer)
            this.hoveredEnt = obj
          }
        } else if (this.hoveredEnt !== undefined && objs.length === 0) {
          console.debug(`moved out of ent: `, this.hoveredEnt)
          this.hoveredEnt.id.graph.lowLight()
          this.setCursor(Cursor.auto)
          this.hoveredEnt = undefined
        } else {
          // nothing for this.hoveredEnt is null and objs is empty
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    this.getHandler().setInputAction(event => {
      if (this.hoveredEnt) {
        this.setCurrentEditEnt(this.hoveredEnt.id.graph)
        this.nextMode(Act.Select)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    this.getHandler().setInputAction(event => {
      this.nextMode(Act.Finish)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  finishCurrentSelect() {
    if (this.hoveredEnt) {
      this.hoveredEnt.id.graph.lowLight()
    }
  }

  initKeyboardSelect() {
    kb.withContext(Mode.Select, () => {
      kb.bind('1', (e) => console.log('select: ', e, this))
      kb.bind(['ctrl+shift+d', 'shift+delete'], e => {
        this.deleteAllGraph()
      })
    })
  }

  editMode(act: Act) {
    this.mode = Mode.Edit
//    if (this.propEditor) this.propEditor.show(true, this.currentEditEnt)
    console.log(`into ${Mode[this.mode]} mode by act ${Act[act]}`, this.currentEditEnt)

    kb.setContext(this.mode)
    this.setCursor(Cursor.crosshair)
    this.currentEditEnt.toEdit()

    this.getHandler().setInputAction(move => {
      window.cursorPos = mu.screen2Cartesian(move.endPosition, 0, this.viewer)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    this.getHandler().setInputAction(event => {
      let objs = this.viewer.scene.drillPick(event.position)
      if (Cesium.defined(objs)) {
        let ctl = objs.filter((st) => { return this.currentEditEnt.ctls.indexOf(st.id) >= 0 })
        if (ctl.length > 0) {
          this.pickedctl = ctl[0].id
          console.log("click on a ctl point: ", this.pickedctl)
          this.nextMode(Act.Pickup)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    this.getHandler().setInputAction(event => {
      this.nextMode(Act.Finish)
      this.setCurrentEditEnt(undefined)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  finishCurrentEdit() {
    if (this.currentEditEnt) {
      this.currentEditEnt.finish()
    }
  }

  initKeyboardEdit() {
    kb.withContext(Mode.Edit, () => {
      kb.bind('1', (e) => console.log('edit: ', e, this))
      kb.bind(['delete', 'ctrl+d'], e => {
        this.deleteSelectGraph()
      })
    })
  }

  deleteSelectGraph() {
    if (this.currentEditEnt) {
      let graph = this.currentEditEnt
      this.currentEditEnt.delete()
      this.setCurrentEditEnt(undefined)
      this.nextMode(Act.Finish)
      return graph
    } else {
      console.log('no graph selected.')
      return undefined
    }
  }

  ctlEditMode() {
    this.mode = Mode.CtlEdit
    console.log(`into ${Mode[this.mode]} mode`, this.pickedctl, this.currentEditEnt)

    kb.setContext(this.mode)
    this.setCursor(Cursor.crosshair)
    this.pickedctl.pickup()

    this.getHandler().setInputAction(move => {
      window.cursorPos = mu.screen2Cartesian(move.endPosition, 0, this.viewer)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    this.getHandler().setInputAction(event => {
      this.pickedctl.finish()
      this.nextMode(Act.PickDown)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    this.getHandler().setInputAction(event => {
      this.pickedctl.finish()
      this.nextMode(Act.PickReset)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  finishCurrentCtledit() {
    if (this.pickedctl) {
      this.pickedctl.finish()
      this.pickedctl = undefined
    }
  }

  initKeyboardCtledit() {
    kb.withContext(Mode.CtlEdit, () => {
      kb.bind('1', (e) => console.log('ctledit: ', e, this))
    })
  }

  setCursor(cursor: Cursor) {
    this.viewer.canvas.style.cursor = Cursor[cursor]
  }
}
export default EditMode
