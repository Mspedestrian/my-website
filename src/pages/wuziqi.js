import React, { useState, useEffect } from "react"
import { css } from "@emotion/core"
import { Link, graphql } from "gatsby"
// import { rhythm } from "../utils/typography"
import Layout from "../components/layout"
import Style from '../styles/wuziqi.module.css'

function Container() {
  const [state, setState] = useState(0)
  const myRef = React.createRef()
  let myCanvas, ctx, width, height, ceil = 40, positionX, positionY
  useEffect(() => {
    myCanvas = myRef && myRef.current
    ctx = myCanvas.getContext('2d');
    width = myCanvas.width;
    height = myCanvas.height;
    positionX = myCanvas.getBoundingClientRect().left
    positionY = myCanvas.getBoundingClientRect().top
    ctx.strokeStyle = "#aaa";
    ctx.lineWidth = 0.5
    ctx.beginPath();
    let i = ceil
    while (i < height) {
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      i += ceil
    }
    ctx.stroke();
  }, [myCanvas])


  const canvasClick = (event) => {
    console.log(event, event.clientX, event.pageX, ';;;;')
    console.log()
    getPositionXY(event.clientX, event.clientY)

  }
  const getPositionXY = (x, y) => {
    x = x - positionX
    y = y - positionY

  }
  return (
    <div className="container">
      <div className={Style['circle']}></div>
      <div className={Style['canvas']}>
        <canvas id="canvas" ref={myRef} width="400" height="400" style={{}} onClick={canvasClick}></canvas>
      </div>
    </div>
  )
}
export default Container