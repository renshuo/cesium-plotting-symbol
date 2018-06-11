import Cesium from 'cesium/Source/Cesium.js'
import * as mu from './mapUtil.js'

export default class EditMode {
  static getInstance () {
    if (!this.instance) {
      this.instance = new EditMode()
    }
    return this.instance
  }

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

  static MODE_VIEW = 'view'
  static MODE_SELECT = 'select'
  static MODE_EDIT = 'edit'
  static MODE_CREATE = 'create'

  static ACT_START = 'start'
  static ACT_CREATE = 'create'
  static ACT_SELECT = 'select'
  static ACT_FINISH = 'finish'

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
        }
        break
    }
  }

  viewMode (viewer = window.viewer) {
    this.mode = EditMode.MODE_VIEW
    console.log(`into ${this.mode} mode`)
    EditMode.destroyHandler()
    viewer.canvas.style.cursor = 'auto'
  }

  createMode (graphObj, viewer = window.viewer) {
    this.mode = EditMode.MODE_CREATE
    console.log(`into ${this.mode} mode`)
    let handler = EditMode.getHandler()
    // viewer.defaultInput.cleanHandler()

    viewer.canvas.style.cursor = 'crosshair'
    handler.setInputAction(move => {
      window.cursorScreenPos = mu.screen2lonlat(move.endPosition)
      window.cursorPos = mu.lonlat2Cartesian(window.cursorScreenPos)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction(event => {
      this.addCtlPoint(event, graphObj)
      if (graphObj.isFinished()) {
        this.finishCreate(graphObj)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    handler.setInputAction(event => {
      graphObj.deleteLastPoint()
    }, Cesium.ScreenSpaceEventType.MIDDLE_CLICK)

    handler.setInputAction(event => {
      this.finishCreate(graphObj)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)

    window.cursor = viewer.entities.add({
      id: 'cursor',
      parent: graphObj.layer.rootEnt,
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

  addCtlPoint (event, graphObj, viewer = window.viewer) {
    let newpos = mu.screen2Cartesian(event.position)
    let ctlPoint = viewer.entities.add({
      id: graphObj.graph.id + '_ctlpoint_' + EditMode.seq++,
      parent: graphObj.graph.ctl,
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
        text: new Cesium.CallbackProperty((time, result) => {
          let p = mu.cartesian2lonlat(ctlPoint.position.getValue(time))
          return 'Lon: ' + p[0].toPrecision(5) + '\u00B0' +
                 '\nLat: ' + p[1].toPrecision(5) + '\u00B0'
        }, true),
        font : '14px monospace',
        horizontalOrigin : Cesium.HorizontalOrigin.LEFT,
        verticalOrigin : Cesium.VerticalOrigin.TOP,
        pixelOffset : new Cesium.Cartesian2(15, 0)
      }
    })
    console.log('added a point: ', ctlPoint)
    graphObj.addHandler(ctlPoint, graphObj.graph.ctl)
  }

  finishCreate (graphObj, viewer = window.viewer) {
    viewer.entities.remove(window.cursor)
    graphObj.finish()
    this.nextMode(EditMode.ACT_FINISH)
  }

  hoveredEnt

  selectMode (viewer = window.viewer) {
    this.mode = EditMode.MODE_SELECT
    console.log(`into ${this.mode} mode`)
    let handler = EditMode.getHandler()
    viewer.canvas.style.cursor = 'auto'
    handler.setInputAction(movement => {
      let objs = viewer.scene.drillPick(movement.endPosition)
      console.debug('Cesium.drillpick: ', objs)
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

    handler.setInputAction(event => {
      if (this.hoveredEnt !== undefined) {
        this.nextMode(EditMode.ACT_SELECT, this.hoveredEnt.id)
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    handler.setInputAction(event => {
      this.nextMode(EditMode.ACT_FINISH)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  editMode (ent, viewer = window.viewer) {
    this.mode = EditMode.MODE_EDIT
    console.log(`into ${this.mode} mode`)
    let handler = EditMode.getHandler()
    viewer.canvas.style.cursor = 'crosshair'
    ent.toEdit()
    handler.setInputAction(move => {
      window.cursorPos = mu.screen2Cartesian(move.endPosition)
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

    handler.setInputAction(event => {
      if (this.pickedctl !== undefined) {
        this.unpick()
      } else {
        let objs = viewer.scene.drillPick(event.position)
        if (Cesium.defined(objs)) {
          let ctl = objs.filter((st) => {
            return st.id.graphType === 'ctl' &&
              st.id.parent.parent === ent.parent.parent
          })
          if (ctl.length > 0) {
            this.pickup(ctl[0].id)
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK)

    handler.setInputAction(event => {
      this.unpick()
      ent.finish()
      this.nextMode(EditMode.ACT_FINISH)
    }, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  pickedctl
  pickup (ent) {
    this.pickedctl = ent
    console.log('pickup: ', this.pickedctl)
    ent.position = new Cesium.CallbackProperty((time, result) => {
      return window.cursorPos.clone()
    }, false)
    ent.label.text.setCallback(ent.label.text._callback, false)
  }

  unpick (ent) {
    if (this.pickedctl !== undefined) {
      console.log('unpick: ', this.pickedctl)
      this.pickedctl.position = Cesium.Cartesian3.clone(window.cursorPos)
      this.pickedctl.label.text.setCallback(this.pickedctl.label.text._callback, true)
      this.pickedctl = undefined
    }
  }
}
