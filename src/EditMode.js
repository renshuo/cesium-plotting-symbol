import Cesium from 'cesium/Source/Cesium.js'
import * as mu from './mapUtil.js'
import kb from 'keyboardjs'
import gx from './index.js'

export default class EditMode {

  /** EditMode单例 */
  static getInstance () {
    if (!this.instance) {
      window.editMode = this.instance = new EditMode()
      this.initKeyboard()
    }
    return this.instance
  }

  /** handler单例 */
  static getHandler (viewer = window.viewer) {
    if (!this.handler || this.handler.isDestroyed()) {
      this.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas)
    }
    return this.handler
  }
  static destroyHandler (viewer = window.viewer) {
    this.handler.destroy()
    this.handler = undefined
  }

  static initKeyboard () {
    this.getInstance().initKeyboardView()
    this.getInstance().initKeyboardCreate()
    this.getInstance().initKeyboardSelect()
    this.getInstance().initKeyboardEdit()
    this.getInstance().initKeyboardCtledit()
  }

  static MODE_VIEW = 'view'
  static MODE_CREATE = 'create'
  static MODE_SELECT = 'select'
  static MODE_EDIT = 'edit'
  static MODE_CTLEDIT = 'ctlEdit'

  static ACT_START = 'start'
  static ACT_CREATE = 'create'
  static ACT_SELECT = 'select'
  static ACT_FINISH = 'finish'
  static ACT_PICKUP = 'pickup'

  static seq = new Date().getTime()

  mode = EditMode.MODE_VIEW
  nextMode (action, ...args) {
    console.log(`mode changed from '${this.mode}' by action '${action}'`)
    switch (this.mode) {
      case EditMode.MODE_VIEW:
        switch (action) {
          case EditMode.ACT_START:
            this.selectMode()
            break
        }
        break
      case EditMode.MODE_SELECT:
        switch (action) {
          case EditMode.ACT_CREATE:
            this.createMode(...args)
            break
          case EditMode.ACT_SELECT:
            this.editMode(...args)
            break
          case EditMode.ACT_FINISH:
            this.viewMode()
            break
        }
        break
      case EditMode.MODE_CREATE:
        switch (action) {
          case EditMode.ACT_FINISH:
            this.selectMode()
            break
          case EditMode.ACT_CREATE:
            this.createMode(...args)
            break
        }
        break
      case EditMode.MODE_EDIT:
        switch (action) {
          case EditMode.ACT_FINISH:
            this.selectMode()
            break
          case EditMode.ACT_CREATE:
            this.createMode(...args)
            break
          case EditMode.ACT_PICKUP:
            this.ctlEditMode(...args)
            break
        }
        break
      case EditMode.MODE_CTLEDIT:
        switch (action) {
        case EditMode.ACT_FINISH:
          this.editMode(...args)
          break
        case EditMode.ACT_CREATE:
          this.createMode(...args)
          break
        }
    }
  }

  viewMode (viewer = window.viewer) {
    this.mode = EditMode.MODE_VIEW
    kb.setContext(this.mode)
    console.log(`into ${this.mode} mode`)
    EditMode.destroyHandler()
    viewer.canvas.style.cursor = 'auto'
  }

  initKeyboardView () {
    kb.withContext(EditMode.MODE_VIEW, () => {
      kb.bind('1', (e) => console.log('view: ', e, this))
    })
  }

  createGraph
  createMode (graphObj, viewer = window.viewer) {
    this.mode = EditMode.MODE_CREATE
    this.createGraph = graphObj
    console.log(`into ${this.mode} mode`)

    kb.setContext(this.mode)
    viewer.canvas.style.cursor = 'crosshair'
    this.initCreateCursor()

    EditMode.getHandler().setInputAction(move => {
      window.cursorScreenPos = mu.screen2lonlat(move.endPosition)
      window.cursorPos = mu.lonlat2Cartesian(window.cursorScreenPos)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    EditMode.getHandler().setInputAction(event => {
      this.addCtlPoint(event)
      if (this.createGraph.ishaveMaxCtls()) {
        viewer.entities.remove(window.cursor)
        this.createGraph.finish()
        this.nextMode(EditMode.ACT_FINISH)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    EditMode.getHandler().setInputAction(event => {
      this.createGraph.deleteLastPoint()
    }, Cesium.ScreenSpaceEventType.MIDDLE_CLICK)

    EditMode.getHandler().setInputAction(event => {
      viewer.entities.remove(window.cursor)
      if (this.createGraph.isCtlNumValid()) {
        this.createGraph.finish()
      } else {
        this.createGraph.deleteGraph()
      }
      this.nextMode(EditMode.ACT_FINISH)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
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
    kb.withContext(EditMode.MODE_CREATE, () => {
      kb.bind('1', (e) => console.log('create: ', e, this))
    })
  }

  addCtlPoint (event, viewer = window.viewer) {
    let newpos = mu.screen2Cartesian(event.position)
    let p = mu.cartesian2lonlat(newpos)
    let text = 'Lon: ' + p[0].toPrecision(5) + '\u00B0' +
           '\nLat: ' + p[1].toPrecision(5) + '\u00B0'

    let ctlPoint = viewer.entities.add({
      id: this.createGraph.graph.id + '_ctlpoint_' + EditMode.seq++,
      parent: this.createGraph.graph.ctl,
      position: newpos,
      graphType: 'ctl',
      point: {
        pixelSize: 8,
        color: Cesium.Color.fromBytes(255, 255, 255, 70),
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
        outlineWidth: 1,
        outlineColor: Cesium.Color.AQUA
      },
      label: {
        text: text,
        font : '14px monospace',
        horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
        verticalOrigin : Cesium.VerticalOrigin.TOP,
        pixelOffset : new Cesium.Cartesian2(15, 0)
      }
    })
    ctlPoint.finish = () => {
      ctlPoint.label.text = ctlPoint.label.text.getValue(mu.julianDate())
      ctlPoint.position = ctlPoint.position.getValue(mu.julianDate())
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
    console.log('added a point: ', ctlPoint)
    this.createGraph.addHandler(ctlPoint, this.createGraph.graph.ctl)
  }


  hoveredEnt
  selectMode (viewer = window.viewer) {
    this.mode = EditMode.MODE_SELECT
    this.hoveredEnt = undefined
    console.log(`into ${this.mode} mode`)
    
    kb.setContext(this.mode)
    viewer.canvas.style.cursor = 'auto'

    EditMode.getHandler().setInputAction(movement => {
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

    EditMode.getHandler().setInputAction(event => {
      if (this.hoveredEnt !== undefined) {
        let selectedEnt = this.hoveredEnt.id
        this.hoveredEnt = undefined
        this.nextMode(EditMode.ACT_SELECT, selectedEnt)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    EditMode.getHandler().setInputAction(event => {
      if (this.hoveredEnt) {
        this.hoveredEnt.id.downLight()
        this.hoveredEnt = undefined
      }
      this.nextMode(EditMode.ACT_FINISH)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }
  
  initKeyboardSelect () {
    kb.withContext(EditMode.MODE_SELECT, () => {
      kb.bind('1', (e) => console.log('select: ', e, this))
      kb.bind('a', (e) => {
        this.nextMode(EditMode.ACT_CREATE, new gx.Point())
      })
      kb.bind('b', (e) => {
        this.nextMode(EditMode.ACT_CREATE, new gx.Polyline())
      })
      kb.bind('c', (e) => {
        this.nextMode(EditMode.ACT_CREATE, new gx.Polygon())
      })
    })
  }

  currentEditEnt
  editMode (ent, viewer = window.viewer) {
    this.mode = EditMode.MODE_EDIT
    this.currentEditEnt = ent
    console.log(`into ${this.mode} mode: `, this.currentEditEnt)

    kb.setContext(this.mode)
    viewer.canvas.style.cursor = 'crosshair'
    ent.toEdit()

    EditMode.getHandler().setInputAction(move => {
      window.cursorPos = mu.screen2Cartesian(move.endPosition)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  
    EditMode.getHandler().setInputAction(event => {
      let objs = viewer.scene.drillPick(event.position)
      if (Cesium.defined(objs)) {
        let ctl = objs.filter((st) => {
          return st.id.graphType === 'ctl' &&
            st.id.parent.parent === ent.parent.parent
        })
        if (ctl.length > 0) {
          this.nextMode(EditMode.ACT_PICKUP, ctl[0].id)
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  
    EditMode.getHandler().setInputAction(event => {
      if (this.currentEditEnt) {
        this.currentEditEnt.finish()
        this.currentEditEnt = undefined
      }
      this.nextMode(EditMode.ACT_FINISH)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  initKeyboardEdit () {
    kb.withContext(EditMode.MODE_EDIT, () => {
      kb.bind('1', (e) => console.log('edit: ', e, this))
      kb.bind(['delete', 'ctrl+d'], function(e) {
        EditMode.getInstance().deleteGraph()
      })
      kb.bind(['ctrl+shift+d', 'shift+delete'], function(e) {
        new Graph().deleteAllGraph()
      })
    })
  }

  deleteGraph () {
    if (this.currentEditEnt) {
      let graph = this.currentEditEnt.parent.parent.graph
      this.currentEditEnt = undefined
      graph.deleteGraph()
      this.nextMode(EditMode.ACT_FINISH)
    } else {
      console.log('no graph selected.')
    }
  }

  pickedctl
  ctlEditMode (ent, viewer = window.viewer) {
    this.mode = EditMode.MODE_CTLEDIT
    this.pickedctl = ent
    console.log(`into ${this.mode} mode: `, this.pickedctl)
    
    kb.setContext(this.mode)
    viewer.canvas.style.cursor = 'crosshair'
    this.pickedctl.pickup()

    EditMode.getHandler().setInputAction(move => {
      window.cursorPos = mu.screen2Cartesian(move.endPosition)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    EditMode.getHandler().setInputAction(event => {
      this.pickedctl.finish()
      this.nextMode(EditMode.ACT_FINISH, this.currentEditEnt)
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    EditMode.getHandler().setInputAction(event => {
      this.pickedctl.finish()
      this.nextMode(EditMode.ACT_FINISH, this.currentEditEnt)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  initKeyboardCtledit () {
    kb.withContext(EditMode.MODE_CTLEDIT, () => {
      kb.bind('1', (e) => console.log('ctledit: ', e, this))
    })
  }
}
