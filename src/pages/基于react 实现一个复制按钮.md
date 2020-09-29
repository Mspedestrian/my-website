---
title: "基于react 实现一个复制按钮"
date: "2020-09-28"
---

```
import React, { Component, } from 'react'

import { Button, message } from 'antd'

export default class CopyButton extends Component {
  state = {
    value: ''
  }
  myRef = React.createRef();
  onCopy = this.onCopy.bind(this)
  changeValue(event) {
    this.setState({
      value: event.target.value
    })
  }
  onCopy(event) {
    const promise = this.props.getValue(event)
    if (!promise) return
    if (promise.then) {

    } else {
      this.setState({
        value: String(promise)
      })
      setTimeout(() => {
        this.myRef.current.select();
        document.execCommand("Copy");
        !this.props.noMessage && message.success('复制成功')
      })
    }


  }
  render() {
    return (
      <span>
        <textarea id="text-area" ref={this.myRef} value={this.state.value} onChange={this.changeValue} style={{
          position: 'absolute',
          opacity: 0
        }}></textarea>
        <Button
          style={this.props.style}
          type="primary"
          onClick={this.onCopy}
        >
          {this.props.children}
        </Button>
      </span>

    )
  }
}
```
