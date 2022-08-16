import * as turf from '@turf/turf';
import * as Cesium from 'cesium';
import {Pos} from './Graph'

/**
 * 转换屏幕坐标（来自于鼠标的各种event）为地理坐标
 * @param screenPos screen position from mouse
 */
export function screen2lonlat(screenPos: Cesium.Cartesian2, viewer: Cesium.Viewer): Array<number> {
  if (!viewer) throw 'null viewer'
  // 通过指定的椭球或者地图对应的坐标系，将鼠标的二维坐标转换为对应椭球体三维坐标
  let cartesian: Cesium.Cartesian3 | undefined = viewer.camera.pickEllipsoid(screenPos)
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
export function lonlat2Cartesian(lonlat: Array<number>, height: number | undefined): Cesium.Cartesian3 {
  return Cesium.Cartesian3.fromDegrees(
    lonlat[0],
    lonlat[1],
    height,
    Cesium.Ellipsoid.WGS84
  )
}

export function lonlathei2Cartesian(lon: number, lat: number, hei: number): Cesium.Cartesian3 {
  return Cesium.Cartesian3.fromDegrees(
    lon, lat, hei, Cesium.Ellipsoid.WGS84)
}

export function lonlatheiObj2Cartesian(obj: { lon: number, lat: number, hei: number | undefined }): Cesium.Cartesian3 {
  return Cesium.Cartesian3.fromDegrees(
    obj.lon,
    obj.lat,
    obj.hei || 0,
    Cesium.Ellipsoid.WGS84
  )
}

export function cartesian2lonlat(cartesian: Cesium.Cartesian3): Array<number> {
  let ellipsoid = Cesium.Ellipsoid.WGS84
  var cartographic = ellipsoid.cartesianToCartographic(cartesian)
  if (cartographic) {
    let longitudeString = Cesium.Math.toDegrees(cartographic.longitude)
    let latitudeString = Cesium.Math.toDegrees(cartographic.latitude)
    return [longitudeString, latitudeString]
  } else {
    return [0,0]
  }
}

export function pos2Cartesian(p: Pos): Cesium.Cartesian3 {
  return lonlatheiObj2Cartesian(p)
}
export function cartesian2Pos(cartesian: Cesium.Cartesian3): Pos {
  let ellipsoid = Cesium.Ellipsoid.WGS84
  var cartographic = ellipsoid.cartesianToCartographic(cartesian)
  if (cartographic) {
    let longitudeString = Cesium.Math.toDegrees(cartographic.longitude)
    let latitudeString = Cesium.Math.toDegrees(cartographic.latitude)
    let hei = cartographic.height
    return {lon: longitudeString, lat: latitudeString, hei}
  } else {
    return {lon: 0, lat: 0, hei: 0}
  }
}

export function screen2Cartesian(screenPos: Cesium.Cartesian2, height: number | undefined, viewer: Cesium.Viewer): Cesium.Cartesian3 {
  let degrees = screen2lonlat(screenPos, viewer)
  return lonlat2Cartesian(degrees, height)
}

/**
 * @param date script date type
 * @Return iso8601 date string like 2012-04-30T12:00:00Z
 */
export function dateToString(date: Date): String {
  return Cesium.JulianDate.toIso8601(julianDate(date))
}

/**
 * 将date日期转换为Julian日期对象，如果date为空，则获取当前时间
 * @param {JulianDate} date
 */
export function julianDate(date: Date): Cesium.JulianDate {
  if (!date) {
    date = new Date()
  }
  return Cesium.JulianDate.fromDate(date)
}

export function distance(cart1: Cesium.Cartesian3, cart2: Cesium.Cartesian3): number {
  //return Cesium.Cartesian3.distance(cart1, cart2)
  let from = turf.point(cartesian2lonlat(cart1))
  let to = turf.point(cartesian2lonlat(cart2))
  let distance = turf.distance(from, to, { units: 'kilometers' })
  return distance * 1000
}

export function cartesian2turfPoint(cartesian: Cesium.Cartesian3) {
  let lonlat = cartesian2lonlat(cartesian)
  return turf.point(lonlat)
}

export function turfGeometry2Cartesians(g) {
  let geo = g.geometry.coordinates[0]
  return geo.map((p) => lonlat2Cartesian(p, undefined))
}

export function deleteEnts(ents: Array<Cesium.Entity>, viewer: Cesium.Viewer) {
  ents.forEach((ent: Cesium.Entity) => {
    if (ent._children.length > 0) {
      deleteEnts(ent._children, viewer)
    }
    viewer.entities.remove(ent)
  })
}
