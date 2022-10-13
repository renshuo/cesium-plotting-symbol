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
  Finish,
  Select,
  UnSelect,
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

  layer: Cesium.DataSource
  scene: Cesium.Scene

  private mouseHandler
  constructor(scene: Cesium.Scene, pe: HTMLElement, layer: Cesium.DataSource) {
    console.log('create editmode: ', pe, layer)
    this.initKeyboard()
    this.layer = layer
    this.scene = scene
    this.mouseHandler = new MouseHandler(scene)
  }

  private initKeyboard() {
    this.initKeyboardView()
    this.initKeyboardCreate()
    this.initKeyboardSelect()
    this.initKeyboardEdit()
    this.initKeyboardCtledit()
  }

  static seq = new Date().getTime()

  public start() {
    this.nextMode(Act.Start, {})
  }

  public finish(): void {
    this.nextMode(Act.Finish, {})
  }

  graphSelectHandler: GraphSelectHandler | undefined
  public setGraphSelectHandler(handler: GraphSelectHandler) {
    this.graphSelectHandler = handler
  }

  graphFinishHandler: GraphFinishHandler | undefined
  public setGraphFinishHandler(handler: GraphFinishHandler) {
    this.graphFinishHandler = handler
  }

  public create(ent: Graph) {
    this.nextMode(Act.Create, {newEntity: ent})
    return ent
  }

  public draw(ent: Graph) {
    this.nextMode(Act.Create, {newEntity: ent})
    this.nextMode(Act.Finish, {})
    return ent
  }

  mode = Mode.View
  nextMode(action: Act, params: {}) {
    console.log(`mode changed from '${Mode[this.mode]}' by action '${Act[action]}'`)
    switch (this.mode) {
      case Mode.View:
        switch (action) {
          case Act.Start:
            this.selectMode()
            break
          case Act.Create:
            this.createMode(params.newEntity)
            break
          default:
            throw new Error(`invalid action: mode=${Mode[this.mode]}, act=${Act[action]}`)
        }
        break

      case Mode.Select:
        switch (action) {
          case Act.Create:
            this.clearSelect()
            this.createMode(params.newEntity)
            break
          case Act.Select:
            this.setSelectEntity(params.entity)
            this.editMode()
            break
          case Act.Finish:
            this.clearSelect()
            this.viewMode()
            break
          default:
            throw new Error(`invalid action: mode=${Mode[this.mode]}, act=${Act[action]}`)
        }
        break

      case Mode.Create:
        switch (action) {
          case Act.Finish:
            this.clearCreate()
            this.selectMode()
            break
          case Act.Create:
            this.clearCreate()
            this.createMode(params.newEntity)
            break
          default:
            throw new Error(`invalid action: mode=${Mode[this.mode]}, act=${Act[action]}`)
        }
        break

      case Mode.Edit:
        switch (action) {
          case Act.UnSelect:
            this.clearEdit()
            this.selectMode()
            break
          case Act.Create:
            this.clearEdit()
            this.createMode(params.newEntity)
            break
          case Act.Pickup:
            this.ctlEditMode()
            break
          default:
            throw new Error(`invalid action: mode=${Mode[this.mode]}, act=${Act[action]}`)
        }
        break

      case Mode.CtlEdit:
        switch (action) {
          case Act.PickDown:
            this.clearCtlEdit(false)
            this.editMode()
            break
          case Act.PickReset:
            this.clearCtlEdit(true)
            this.editMode()
            break
          default:
            throw new Error(`invalid action: mode=${Mode[this.mode]}, act=${Act[action]}`)
        }
        break
      default:
        throw new Error(`invalid mode: mode=${Mode[this.mode]}, act=${Act[action]}`)
    }
  }

  currentEditEnt: Graph | undefined = undefined
  hoveredEnt: Cesium.Entity | undefined
  pickedctl: Cesium.Entity | undefined

  viewMode() {
    this.setMode(Mode.View)
    // if (this.propEditor) this.propEditor.show(false)
    this.mouseHandler.destory()
  }

  createMode(newEntity: Graph) {
    this.setMode(Mode.Create)
    this.currentEditEnt = newEntity
    // add a new ctl point and pick it
    let lastCtl = this.currentEditEnt.addCtlPointCar(new Cesium.Cartesian3())
    this.pickUpCtl(lastCtl)
    this.setMouseMove()
    this.mouseHandler.setLeftClick(event => {
      let newpos = this.pickPos(event.position)
      this.pickDownCtl(lastCtl)
      if (this.currentEditEnt.ishaveMaxCtls()) {
        this.nextMode(Act.Finish)
      } else {
        lastCtl = this.currentEditEnt.addCtlPointCar(newpos)
        this.pickUpCtl(lastCtl)
      }
    })
    this.mouseHandler.setMiddleClick(event => this.currentEditEnt.deleteLastPoint())
    this.mouseHandler.setRightClick(event => {
      this.currentEditEnt.deleteLastPoint()
      this.nextMode(Act.Finish)
    })
  }
  clearCreate() {
    let entity = this.currentEditEnt
    if (entity.isCtlNumValid()) {
      entity.finish()
      if (this.graphFinishHandler) {
        this.graphFinishHandler(entity)
      }
    } else {
      entity.delete()
    }
  }

  private selectMode() {
    this.setMode(Mode.Select)
    //    if (this.propEditor) this.propEditor.show(false)
    this.hoveredEnt = undefined
    this.setMouseHieghtMove()
    this.mouseHandler.setLeftClick(event => {
      if (this.hoveredEnt) {
        let entity = this.hoveredEnt.id.graph
        this.nextMode(Act.Select, { entity })
      }
    })
    this.mouseHandler.setRightClick(event => this.nextMode(Act.Finish))
  }
  private clearSelect() {
    if (this.hoveredEnt) {
      this.hoveredEnt.id.graph.lowLight()
    }
  }
  private setSelectEntity(entity: Graph) {
    entity.lowLight()
    this.currentEditEnt = entity
    entity.selected()
    entity.toEdit()
    this.callSelectHandler(entity)
  }

  editMode() {
    this.setMode(Mode.Edit)
    //    if (this.propEditor) this.propEditor.show(true, this.currentEditEnt)
    this.setMouseMove()
    this.mouseHandler.setLeftClick(event => {
      if (this.drillCtl(event.position)) {
        this.nextMode(Act.Pickup)
      }
    })
    this.mouseHandler.setRightClick(event => {
      this.nextMode(Act.UnSelect)
    })
  }
  clearEdit() {
    this.currentEditEnt.finish()
    if (this.graphFinishHandler) { //TODO use graphModifiedHandler?
      this.graphFinishHandler(this.currentEditEnt)
    }
    this.currentEditEnt = undefined
  }

  ctlEditMode() {
    this.setMode(Mode.CtlEdit)
    this.pickUpCtl(this.pickedctl)
    this.setMouseMove()
    this.mouseHandler.setLeftClick(event => this.nextMode(Act.PickDown))
    this.mouseHandler.setRightClick(event => this.nextMode(Act.PickReset))
    this.mouseHandler.setMiddleClick(event => this.nextMode(Act.PickReset))
  }

  clearCtlEdit(isReset: boolean) {
    if (this.pickedctl) {
      if (!isReset) {
        this.pickDownCtl(this.pickedctl)
      } else {
        this.pickResetCtl(this.pickedctl)
      }
      this.pickedctl = undefined
    }
  }

  private modeCursor = {
    View: Cursor.auto,
    Create: Cursor.crosshair,
    Select: Cursor.pointer,
    Edit: Cursor.crosshair,
    CtlEdit: Cursor.crosshair
  }
  private setMode(mode: Mode) {
    this.mode = mode
    kb.setContext(mode)
    this.setCursor(this.modeCursor[Mode[mode]])
    console.log(`into ${Mode[this.mode]} mode`)
  }

  private callSelectHandler(ent: Graph) {
    if (this.graphSelectHandler) {
      this.graphSelectHandler(ent)
    }
  }

  private initKeyboardCreate() {
    kb.withContext(Mode.Create, () => {
      kb.bind('1', (e) => console.log('create: ', e, this))
    })
  }

  private initKeyboardSelect() {
    kb.withContext(Mode.Select, () => {
      kb.bind('1', (e) => console.log('select: ', e, this))
      kb.bind(['ctrl+shift+d', 'shift+delete'], e => {
        this.deleteAllGraph()
      })
    })
  }

  private initKeyboardView() {
    kb.withContext(Mode.View, () => {
      kb.bind('1', (e) => console.log('view: ', e, this))
    })
  }

  private initKeyboardEdit() {
    kb.withContext(Mode.Edit, () => {
      kb.bind('1', (e) => console.log('edit: ', e, this))
      kb.bind(['delete', 'ctrl+d'], e => {
        this.deleteSelectGraph()
      })
    })
  }

  private initKeyboardCtledit() {
    kb.withContext(Mode.CtlEdit, () => {
      kb.bind('1', (e) => console.log('ctledit: ', e, this))
    })
  }

  private deleteSelectGraph() {
    if (this.currentEditEnt) {
      let graph = this.currentEditEnt
      this.currentEditEnt.delete()
      this.nextMode(Act.Finish)
      return graph
    } else {
      console.log('no graph selected.')
      return undefined
    }
  }


  private drillCtl(position): Cesium.Entity | undefined{
    let objs = this.scene.drillPick(position)
    if (Cesium.defined(objs)) {
      let ctl = objs.filter((st) => { return this.currentEditEnt.ctls.indexOf(st.id) >= 0 })
      if (ctl.length > 0) {
        this.pickedctl = ctl[0].id
        console.log("click on a ctl point: ", this.pickedctl)
        return this.pickedctl
      }else {
        return undefined
      }
    } else {
      return undefined
    }
  }

  private setMouseHieghtMove() {
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
  }

  private setMouseMove() {
    this.mouseHandler.setMove(move => {
      window.cursorPos = this.pickPos(move.endPosition)
    })
  }

  private setCursor(cursor: Cursor) {
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

   //TODO undo ctl move option
  private pickResetCtl(ctl: Cesium.Entity) {
    ctl.label.text = ctl.label.text.getValue(Cesium.JulianDate.now())
    ctl.position = ctl.position.getValue(Cesium.JulianDate.now())
  }

}
