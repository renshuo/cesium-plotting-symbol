import * as Cesium from 'cesium';
import kb from 'keyboardjs';
import MouseHandler from './Edit/MouseHandler';
import Graph from './Graph';

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
export type GraphFinishHandler = (graph: Graph) => void

export default class EditMode {

  editAfterCreate: boolean

  layer: Cesium.DataSource
  scene: Cesium.Scene

  private mouseHandler
  constructor(scene: Cesium.Scene, pe: HTMLElement, layer: Cesium.DataSource, editAfterCreate: boolean) {
    console.log('create editmode: ', pe, layer)
    this.editAfterCreate = editAfterCreate
    this.initKeyboard()
    this.layer = layer
    this.scene = scene
    this.mouseHandler = new MouseHandler(scene)
  }

  destroyHandler() {
    this.mouseHandler.destory()
  }

  private initKeyboard() {
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

  public finish(): void {
    this.nextMode(Act.Finish)
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
            this.viewStart()
            break
          case Act.Create:
            /** 原本设计有启动绘图面板，即 Mode.View + Act.Start，然后才可进入create模式
             * 如果没有绘图面板开启功能，则Act.Create 直接进入创建模式 */
            this.viewCreate()
            break
          case Act.Finish:
            // TODO nothing to do for draw a graph ?
            break
        }
        break
      case Mode.Select: {
        switch (action) {
          case Act.Create:
            this.selectCreate()
            break
          case Act.Select:
            this.selectSelect()
            break
          case Act.Finish:
            this.selectFinish()
            break
        }
      }
        break
      case Mode.Create: {
        switch (action) {
          case Act.Finish:
            this.createFinish()
            break
          case Act.Create:
            this.createCreate()
            break
        }
      }
        break
      case Mode.Edit: {
        switch (action) {
          case Act.Finish:
            this.editFinish()
            break
          case Act.Create:
            this.editCreate()
            break
          case Act.Pickup:
            this.editPickup()
            break
        }
      }
        break
      case Mode.CtlEdit: {
        switch (action) {
          case Act.Finish:
            this.ctlEditFinish()
            break
          case Act.PickDown:
            this.ctlEditPickDown()
            break
          case Act.PickReset:
            this.ctlEditPickReset()
            break
        }
      }
    }
  }


  currentEditEnt: Graph | undefined = undefined
  hoveredEnt: Cesium.Entity | undefined
  pickedctl: Cesium.Entity | undefined

  graphSelectHandler: GraphSelectHandler | undefined
  setGraphSelectHandler(handler: GraphSelectHandler) {
    this.graphSelectHandler = handler
  }

  graphFinishHandler: GraphFinishHandler | undefined
  public setGraphFinishHandler(handler: GraphFinishHandler) {
    this.graphFinishHandler = handler
  }

  setCurrentEditEnt(ent: Graph | undefined) {
    console.log('select a graph: ', ent)
    this.currentEditEnt = ent
    if (this.graphSelectHandler) {
      this.graphSelectHandler(ent)
    }
  }


  /* view state actions */
  private viewStart() {
    this.selectMode()
  }
  private viewCreate() {
    this.createMode()
  }

  /* select state actions */
  private selectCreate() {
    this.finishCurrentSelect()
    this.createMode()
  }
  private selectSelect() {
    this.finishCurrentSelect()
    this.editMode(Act.Select)
  }
  private selectFinish() {
    this.finishCurrentSelect()
    this.viewMode()
  }

  /* create state actions */
  private createFinish() {
    let isSuccess = this.finishCurrentCreate()
    if (isSuccess) {
      if (this.editAfterCreate) {
        this.editMode(Act.Finish)
      } else {
        this.selectMode()
      }
    } else {
      this.selectMode()
    }
  }
  private createCreate() {
    this.createMode()
  }

  /* edit state actions */
  private editFinish() {
    this.finishCurrentEdit()
    this.selectMode()
  }
  private editCreate() {
    this.finishCurrentEdit()
    this.createMode()
  }
  private editPickup() {
    this.ctlEditMode()
  }

  /* ctl edit state actions */
  private ctlEditFinish() {
    this.finishCurrentCtledit()
    this.editMode(Act.Finish)
  }
  private ctlEditPickDown() {
    this.finishCurrentCtledit()
    this.editMode(Act.PickDown)
  }
  private ctlEditPickReset() {
    this.finishCurrentCtledit()
    this.editMode(Act.PickReset)
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

  lastCtl: Cesium.Entity | undefined
  createMode() {
    this.mode = Mode.Create
    console.log(`into ${Mode[this.mode]} mode`, this.currentEditEnt)

    // add a new ctl point and pick it
    this.lastCtl = this.currentEditEnt.addCtlPointCar(new Cesium.Cartesian3())
    this.pickUpCtl(this.lastCtl)

    kb.setContext(this.mode)
    this.setCursor(Cursor.crosshair)


    this.mouseHandler.setMove(move => {
      window.cursorPos = this.pickPos(move.endPosition)
    })
    this.mouseHandler.setLeftClick(event => {
      let newpos = this.pickPos(event.position)
      this.pickDownCtl(this.lastCtl)
      if (this.currentEditEnt.ishaveMaxCtls()) {
        this.nextMode(Act.Finish)
      } else {
        this.lastCtl = this.currentEditEnt.addCtlPointCar(newpos)
        this.pickUpCtl(this.lastCtl)
      }
    })
    this.mouseHandler.setMiddleClick(event => {
      this.currentEditEnt.deleteLastPoint()
    })
    this.mouseHandler.setRightClick(event => {
      this.currentEditEnt.deleteLastPoint()
      this.nextMode(Act.Finish)
    })

  }

  /**
   * 完成当前绘图，如果图形能够绘制出来，则绘制，否则删除不成形的图形
   * return true: Graph create success
   * return false: Graph create fail(deleted)
   */
  finishCurrentCreate(): boolean {
    console.log('finsih create: ', this.currentEditEnt)
    this.layer.entities.remove(window.cursor)
    if (this.currentEditEnt) {
      if (this.currentEditEnt.isCtlNumValid()) {
        this.currentEditEnt.finish()
        this.setCurrentEditEnt(this.currentEditEnt)
        return true
      } else {
        console.log('delete graph by invalid ctlNums')
        this.currentEditEnt.delete()
        this.setCurrentEditEnt(undefined)
        return false
      }
    } else {
      return false
    }
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

    this.mouseHandler.setMove(movement => {
      let objs = this.scene.drillPick(movement.endPosition)
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
    })
    this.mouseHandler.setLeftClick(event => {
      if (this.hoveredEnt) {
        this.setCurrentEditEnt(this.hoveredEnt.id.graph)
        this.nextMode(Act.Select)
      }
    })
    this.mouseHandler.setRightClick(event => {
      this.nextMode(Act.Finish)
    })
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

    this.mouseHandler.setMove(move => {
      window.cursorPos = this.pickPos(move.endPosition)
    })

    this.mouseHandler.setLeftClick(event => {
      let objs = this.scene.drillPick(event.position)
      if (Cesium.defined(objs)) {
        let ctl = objs.filter((st) => { return this.currentEditEnt.ctls.indexOf(st.id) >= 0 })
        if (ctl.length > 0) {
          this.pickedctl = ctl[0].id
          console.log("click on a ctl point: ", this.pickedctl)
          this.nextMode(Act.Pickup)
        }
      }
    })

    this.mouseHandler.setRightClick(event => {
      this.nextMode(Act.Finish)
      this.setCurrentEditEnt(undefined)
    })
  }

  finishCurrentEdit() {
    if (this.currentEditEnt) {
      this.currentEditEnt.finish()
      if (this.graphFinishHandler) {
        this.graphFinishHandler(this.currentEditEnt)
      }
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
    this.pickUpCtl(this.pickedctl)

    this.mouseHandler.setMove(move => {
      window.cursorPos = this.pickPos(move.endPosition)
    })

    this.mouseHandler.setLeftClick(event => {
      this.pickDownCtl(this.pickedctl)
      this.nextMode(Act.PickDown)
    })

    this.mouseHandler.setRightClick(event => {
      this.pickResetCtl(this.pickedctl)
      this.nextMode(Act.PickReset)
    })
  }

  finishCurrentCtledit() {
    if (this.pickedctl) {
      this.pickDownCtl(this.pickedctl)
      this.pickedctl = undefined
    }
  }

  initKeyboardCtledit() {
    kb.withContext(Mode.CtlEdit, () => {
      kb.bind('1', (e) => console.log('ctledit: ', e, this))
    })
  }

  setCursor(cursor: Cursor) {
    this.scene.canvas.style.cursor = Cursor[cursor]
  }


  /**
   * use globle.pick instead pickEllipsoid
   * see: https://zhuanlan.zhihu.com/p/44767866
   */
  private pickPos(pos: Cesium.Cartesian2): Cesium.Cartesian3 | undefined {
    let ray = this.scene.camera.getPickRay(pos);
    let c1 = this.scene.globe.pick(ray, this.scene);
    return c1
  }


  private pickUpCtl(ctl: Cesium.Entity) {
    ctl.label.text = new Cesium.CallbackProperty((time, result) => {
      if (window.cursorPos) {
        let p = Cesium.Cartographic.fromCartesian(window.cursorPos) 
        if (p) {
          return 'Lon: ' + Cesium.Math.toDegrees(p.longitude).toPrecision(5) + '\u00B0'
            + '\nLat: ' + Cesium.Math.toDegrees(p.latitude).toPrecision(5) + '\u00B0'
            + '\nHei: ' + p.height.toPrecision(5) + 'm'
        }
      }
      return ""
    }, false)
    ctl.position = new Cesium.CallbackProperty((time, result) => {
      return window.cursorPos
    }, false)
  }

  private pickDownCtl(ctl: Cesium.Entity) {
    ctl.label.text = ctl.label.text.getValue(Cesium.JulianDate.now())
    ctl.position = ctl.position.getValue(Cesium.JulianDate.now())
  }

  private pickResetCtl(ctl: Cesium.Entity) {
    ctl.label.text = ctl.label.text.getValue(Cesium.JulianDate.now())
    ctl.position = ctl.position.getValue(Cesium.JulianDate.now())
  }

}
