import React from 'react'

import 'antd/dist/antd.css';
import * as antd from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN';

import gx from '../src/index.js'

let btype = 'ghost'
let bstyle={
  width: '80px',
  height: '32px',
  margin: '1px 5px',
  color: 'white'
}

let barStyle = {
  position: 'absolute',
  float: 'left',
  'zIndex': 1,
}
export default class TopPane extends React.Component {

  funcs1 = [
    [
      {name: '点', func: () => gx.start(new gx.Point()) },
      {name: '多边形', func: () => gx.start(new gx.Polygon()) },
      {name: '直线', func: () => gx.start(new gx.Polyline()) },
      {name: 'bezier1', func: () => gx.start(new gx.Bezier1()) },
      {name: 'bezier2', func: () => gx.start(new gx.Bezier2()) },
      {name: 'bezierN', func: () => gx.start(new gx.BezierN()) },
      {name: '平滑线', func: () => gx.start(new gx.BezierSpline()) },
    ],
    [
      {name: '单箭头', func: () => gx.start(new gx.Arrow1()) },
      {name: '椭圆', func: () => gx.start(new gx.Ellipse()) },
      {name: '圆', func: () => gx.start(new gx.Circle()) },
    ]
  ]

  render () {
    let bar = this.funcs1.map((group) => {
      let g = group.map((func) => {
          return <antd.Button key={func.name} type={btype} style={bstyle} onClick={func.func}>{func.name}</antd.Button>
        })
        g.push(<br/>)
      return g
    })
    return (
      <div style={barStyle}>
        {bar}
      </div>
    )
  }
}