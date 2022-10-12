import { Units } from '@turf/turf'
import * as Cesium from 'cesium'


export default class MouseHandler {


  private scene: Cesium.Scene
  handler: Cesium.ScreenSpaceEventHandler
  constructor(scene: Cesium.Scene) {
    this.scene = scene
    this.handler = new Cesium.ScreenSpaceEventHandler(scene.canvas)
  }

  getHandler(): Cesium.ScreenSpaceEventHandler {
    if (!this.handler || this.handler.isDestroyed()) {
      this.handler = new Cesium.ScreenSpaceEventHandler(this.scene.canvas)
    }
    return this.handler
  }

  public destory() {
    this.handler.destroy()
  }

  public setLeftClick( opt: (arg) => void) {
    this.getHandler().setInputAction(opt, Cesium.ScreenSpaceEventType.LEFT_CLICK)
  }

  public setMiddleClick(opt: (arg) => void) {
    this.getHandler().setInputAction(opt, Cesium.ScreenSpaceEventType.MIDDLE_CLICK)
  }

  public setRightClick(opt: (arg) => void) {
    this.getHandler().setInputAction(opt, Cesium.ScreenSpaceEventType.RIGHT_CLICK)
  }

  public setMove(opt: (arg) => void) {
    this.getHandler().setInputAction(opt, Cesium.ScreenSpaceEventType.MOUSE_MOVE)
  }

}
