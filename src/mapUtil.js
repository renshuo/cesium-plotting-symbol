import Cesium from 'cesium/Source/Cesium.js'
import * as turf from '@turf/turf'


/**
 * 转换屏幕坐标（来自于鼠标的各种event）为地理坐标
 * @param {screen position from mouse} screenPos 
 */
export function screen2lonlat (screenPos, viewer) {
  if (!viewer) throw 'null viewer'
  // 通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
  let cartesian = viewer.camera.pickEllipsoid(screenPos)
  if (cartesian) {
    return cartesian2lonlat(cartesian)
  } else {
    // out of earth ball
    return [0, 0]
  }
}



/**
 * 转换地理坐标到cesium cartesian
 * @param {地理坐标} lonlat 
 * @param {高度值} height 
 */
export function lonlat2Cartesian(lonlat, height = 0) {
  return Cesium.Cartesian3.fromDegrees(
    lonlat[0],
    lonlat[1],
    height,
    Cesium.Ellipsoid.WGS84
  )
}

export function lonlathei2Cartesian(lonlathei) {
  return Cesium.Cartesian3.fromDegrees(
    lonlathei.lon,
    lonlathei.lat,
    lonlathei.hei || 0,
    Cesium.Ellipsoid.WGS84
  )
}

export function cartesian2lonlat(cartesian) {
  let ellipsoid = Cesium.Ellipsoid.WGS84
  var cartographic = ellipsoid.cartesianToCartographic(cartesian)
  let longitudeString = Cesium.Math.toDegrees(cartographic.longitude)
  let latitudeString = Cesium.Math.toDegrees(cartographic.latitude)
  return [longitudeString, latitudeString]
}


export function screen2Cartesian (screenPos, height = 0, viewer) {
  let degrees = screen2lonlat(screenPos, viewer)
  return lonlat2Cartesian(degrees, height)
}

/**
 * @param {* java script date} date
 * @Return iso8601 date string like 2012-04-30T12:00:00Z
 */
export function dateToString (date) {
  return Cesium.JulianDate.toIso8601(julianDate(date))
}

/**
 * 将date日期转换为Julian日期对象，如果date为空，则获取当前时间
 * @param {JulianDate} date 
 */
export function julianDate(date) {
  if (!date) {
    date = new Date()
  }
  return Cesium.JulianDate.fromDate(date)
}

export function distance (cart1, cart2) {
  let from = turf.point(cartesian2lonlat(cart1))
  let to = turf.point(cartesian2lonlat(cart2))
  let options = {units: 'kilometers'}
  let distance = turf.distance(from, to, options)
  return distance * 1000
}

export function cartesian2turfPoint(cartesian) {
  let lonlat = this.cartesian2lonlat(cartesian)
  return turf.point(lonlat)
}

export function turfGeometry2Cartesians(g) {
  let geo = g.geometry.coordinates[0]
  return geo.map((p) => lonlat2Cartesian(p))
}

export function deleteEnts (ents, viewer) {
  ents.forEach((ent) => {
    if (ent._children.length > 0) {
      deleteEnts(ent._children, viewer)
    }
    viewer.entities.remove(ent)
  })
}