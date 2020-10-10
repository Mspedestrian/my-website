import React, { useState, useEffect } from "react"
import { css } from "@emotion/core"
import { Link, graphql } from "gatsby"
// import { rhythm } from "../utils/typography"
import Layout from "../components/layout"
import Style from '../styles/wuziqi.module.css'

function Container() {
  const [state, setState] = useState(0)
  const myRef = React.createRef()
  let myCanvas, ctx, width, height, ceil = 30, positionX, positionY, chessWidth = 10, chessType = 0 //0 默认黑棋 1白棋
  let result = {
    black: [],
    white: []
  }
  let table = [[]] // 15*15
  let comTable = [[[]]] // 15*15*4
  let playerTable = [[[]]] // 15*15*4
  for (let i = 0; i < 15; i++) {
    table[i] = []
    comTable[i] = []
    playerTable[i] = []
    for (let j = 0; j < 15; j++) {
      table[i][j] = 0
      comTable[i][j] = []
      playerTable[i][j] = []
      for (let k = 0; k < 4; k++) {
        comTable[i][j][k] = 0
        playerTable[i][j][k] = 0
      }
    }
  }
  const initTableData = () => {
    for (let i = 0; i < 15; i++) {
      comTable[i] = []
      playerTable[i] = []
      for (let j = 0; j < 15; j++) {
        comTable[i][j] = []
        playerTable[i][j] = []
        for (let k = 0; k < 4; k++) {
          comTable[i][j][k] = 0
          playerTable[i][j][k] = 0
        }
      }
    }
  }
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
      ctx.moveTo(ceil, i);
      ctx.lineTo(width - ceil, i);
      ctx.moveTo(i, ceil);
      ctx.lineTo(i, height - ceil);
      i += ceil
    }
    ctx.stroke();
  }, [myCanvas])

  const drawChess = (x, y, isWhite) => {
    //todo 需要判断x，y处是否有棋
    ctx.beginPath();
    // 创建黑棋白棋的fillstyle
    const black = ctx.createRadialGradient(x, y, 0, x, y, chessWidth);
    black.addColorStop(0, "#aaa");
    black.addColorStop(1, "#111");

    const white = ctx.createRadialGradient(x, y, 1, x, y, chessWidth);
    white.addColorStop(0, "#fff");
    white.addColorStop(1, "#bbb");

    ctx.fillStyle = isWhite ? white : black;
    ctx.arc(x, y, chessWidth, 0, 2 * Math.PI);
    ctx.fill();
    if (isWhite) {
      result.white.push({ x, y })
    } else {
      result.black.push({ x, y })
    }

    // 判断游戏是否结束

    setEndResult()
  }

  const setEndResult = () => {
    const { white, black } = result

  }
  const canvasClick = (event) => {
    console.log(event, event.clientX, event.pageX, ';;;;')
    const { x, y } = getPositionXY(event.clientX, event.clientY)
    const xnum = x / ceil, ynum = y / ceil
    // 判断越界
    if (xnum - 1 > 14 || ynum - 1 > 14) return
    drawChess(x, y, chessType)
    // 对方玩家
    table[ynum - 1][xnum - 1] = 2


    setTypeTable()

    setTimeout(() => {
      const pos = getComPos()
      drawChess((pos.j + 1) * ceil, (pos.i + 1) * ceil, !chessType)
      table[pos.i][pos.j] = 1
    }, 1000)

  }
  const getComPos = () => {
    let max = 0;
    let pos = {}
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        for (let k = 0; k < 4; k++) {
          const tablemax = Math.max(comTable[i][j][k], playerTable[i][j][k])
          if (max < tablemax) {
            pos.i = i;
            pos.j = j;
            max = tablemax
          }
        }
      }
    }
    console.log(comTable, playerTable, pos)
    return pos
  }
  const setTypeTable = () => {
    initTableData()
    for (let i = 0; i < 15; i++) {
      for (let j = 0; j < 15; j++) {
        if (table[i][j] === 0) {
          comTable[i][j] = getTypeNum(i, j, 1);
          playerTable[i][j] = getTypeNum(i, j, 2);
        }
      }
    }
  }
  const getTypeNum = (x, y, type) => {
    // 活四 20  11110  01111
    // 冲四 15  11101  10111
    // 活三 10  1110   1101
    let heng = [0], shu = [0], left = [0], right = [0]

    let i = x, j = y;
    let flag = 1
    while (flag !== 8) {

      if (flag === 1) {
        j--;
        if (j === -1 || table[x][j] !== type) {
          flag++;
          j = y;
          continue
        }
        heng.unshift(1)
      }

      if (flag === 2) {
        j++;
        if (j === 15 || table[x][j] !== type) {
          flag++;
          j = y;
          continue
        }

        heng.push(1)
      }

      if (flag === 3) {
        i--;
        if (i === -1 || table[i][y] !== type) {
          flag++;
          i = x;
          continue
        }

        shu.unshift(1)
      }

      if (flag === 4) {
        i++;
        if (i === 15 || table[i][y] !== type) {
          flag++;
          i = x;
          continue
        }

        shu.push(1)
      }

      if (flag === 5) {
        i--;
        j--;
        if (i === -1 || j === -1 || table[i][j] !== type) {
          flag++;
          i = x;
          j = y
          continue
        }

        left.unshift(1)
      }

      if (flag === 6) {
        i++;
        j++
        if (i === 15 || j === 15 || table[i][j] !== type) {
          flag++;
          i = x;
          j = y
          continue
        }

        left.push(1)
      }

      if (flag === 7) {
        i++;
        j--
        if (i === 15 || j === -1 || table[i][j] !== type) {
          flag++;
          i = x;
          j = y
          continue
        }

        right.unshift(1)
      }

      if (flag === 8) {
        i--;
        j++
        if (i === -1 || j === 15 || table[i][j] !== type) {
          flag++;
          i = x;
          j = y
          continue
        }

        right.push(1)
      }

    }
    return [heng.length * 5, shu.length * 5, left.length * 5, right.length * 5]
  }
  const getPositionXY = (x, y) => {
    x = x - positionX
    y = y - positionY
    const xnum = Math.round(x / ceil)
    const ynum = Math.round(y / ceil)
    return {
      x: xnum * ceil,
      y: ynum * ceil
    }
  }
  return (
    <div className="container">
      <div className={Style['circle']}></div>
      <div className={Style['canvas']}>
        <canvas id="canvas" ref={myRef} width="480" height="480" style={{}} onClick={canvasClick}></canvas>
      </div>
    </div>
  )
}
export default Container