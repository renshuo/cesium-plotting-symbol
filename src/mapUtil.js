import Cesium from 'cesium/Source/Cesium.js'
import * as turf from '@turf/turf'
/**
 * 转换屏幕坐标（来自于鼠标的各种event）为地理坐标
 * screenPos: positionPorperty
 * return: [经度，纬度]
 */
export function convertPos (screenPos) {
  let scene = window.viewer.scene
  let ellipsoid = scene.globe.ellipsoid
  // 通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
  let cartesian = window.viewer.camera.pickEllipsoid(screenPos, ellipsoid)
  if (cartesian) {
    var cartographic = ellipsoid.cartesianToCartographic(cartesian)
    let longitudeString = Cesium.Math.toDegrees(cartographic.longitude)
    let latitudeString = Cesium.Math.toDegrees(cartographic.latitude)
    // console.log('screenPos:', screenPos, cartesian)
    return [longitudeString, latitudeString]
  } else {
    return [0, 0]
  }
}

export function convertScreenPos2Cartesian (screenPos, height = 0) {
  let degrees = convertPos(screenPos)
  return Cesium.Cartesian3.fromDegrees(
    degrees[0],
    degrees[1],
    height,
    Cesium.Ellipsoid.WGS84
  )
}

/**
 * 将cartesian3（即各种position）转换为经纬度
 * @param {Cartesian3} cartesian
 */
export function convertCartesian (cartesian, viewer = window.viewer) {
  let scene = viewer.scene
  let ellipsoid = scene.globe.ellipsoid
  var cartographic = ellipsoid.cartesianToCartographic(cartesian)
  let longitudeString = Cesium.Math.toDegrees(cartographic.longitude)
  let latitudeString = Cesium.Math.toDegrees(cartographic.latitude)
  return [longitudeString, latitudeString]
}

export function removeEntityTree (root, viewer = window.viewer) {
  root._children.forEach(ent => {
    viewer.entities.remove(ent)
    removeEntityTree(ent, viewer)
  })
}

export function entityTree (root, func, viewer = window.viewer) {
  root._children.forEach(ent => {
    func(ent)
    entityTree(ent, func, viewer)
  })
}

export function showTimeline (isShow, viewer = window.viewer) {
  if (viewer === null || viewer === undefined) {
    return
  }
  viewer.animation.container.hidden = !isShow
  viewer.timeline.container.hidden = !isShow
}

/**
 * @param {* java script date} date
 * @Return iso8601 date string like 2012-04-30T12:00:00Z
 */
export function dateToString (date) {
  return Cesium.JulianDate.toIso8601(Cesium.JulianDate.fromDate(date))
}

/**
 * return the out box of the point with boxsize
 * the point is the box center
 * @param {*} longitude
 * @param {*} latitude
 * @param {*} boxsize
 * [
          -50, 20, 0,
          -50, 40, 0,
          -40, 40, 0,
          -40, 20, 0
        ]
 */
export function point2Box (longitude, latitude, boxsize) {
  let deg = turf.distanceToDegrees(boxsize / 2, 'meters')
  return [
    longitude - deg,
    latitude + deg,
    0,
    longitude + deg,
    latitude + deg,
    0,
    longitude + deg,
    latitude - deg,
    0,
    longitude - deg,
    latitude - deg,
    0
  ]
}

export function czmlPos (id, posList) {
  return {
    id: id,
    position: {
      cartographicDegrees: posList
    }
  }
}

export function czmlPoint (color, size) {
  return {
    color: {
      rgba: color
    },
    pixelSize: size
  }
}

export function ctlPoint (id, long, lat) {
  return {
    id: id,
    position: {
      cartographicDegrees: [long, lat, 10]
    },
    point: {
      color: { rgba: [255, 0, 0, 255] },
      pixelSize: 6
    }
  }
}

export function czmlLabel (text, font = '12pt Lucida Console', textOffset = 30) {
  return {
    font,
    text,
    pixelOffset: {
      cartesian2: [textOffset, 0]
    }
  }
}

export function czmlPath (
  color,
  leadTime,
  trailTime,
  heightReference = Cesium.HeightReference.NONE
) {
  return {
    material: {
      solidColor: {
        color: { rgba: color }
      }
    },
    width: 1,
    leadTime: leadTime,
    trailTime: trailTime,
    resolution: leadTime,
    heightReference
  }
}
