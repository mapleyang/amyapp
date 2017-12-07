import React, { Component } from 'react'
import './index.scss'
import AjaxJson from "../../utils/ajaxJson"
import classnames from "classnames";
import { Icon, List, Modal  } from 'antd-mobile';
const Item = List.Item;
const alert = Modal.alert;

class Logout extends Component {
  constructor(props, context) {
    super(props)
    this.state = {
      data: ['', '', ''],
      loginVisble: false
    }
  }

  componentDidMount () {
  }

  headerBackClick () {
    window.history.back()
  }

  logoutClick () {
    alert('', '退出当前账号', [
      { text: '取消', onPress: () => console.log('cancel') },
      { text: '确认', onPress: () => {
        //退出账号处理
      }},
    ])
  }


  render() {
    return (
      <div className="login">
        <div className="header flow-header">
          <div className="header-back" onClick={this.headerBackClick.bind(this)}>
            <Icon type="left" size="lg" />
          </div>
          <div className="header-content">设置</div>
        </div>
        <div className="login-content tab-content">
          <List >
            <Item onClick={this.logoutClick.bind(this)}>退出</Item>
          </List>
        </div>
      </div>
    );
  }
}

export default Logout; 