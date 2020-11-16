import React, { Component } from 'react'
import { Confirm } from 'semantic-ui-react'

export default class Confirmation extends Component {
  static defaultProps = { opened: false }

  handleConfirm = () => {
    this.props.onConfirm();
  }

  handleCancel = () => {
    this.props.onCancel();
  }

  render() {
    return (
        <Confirm
          open={this.props.opened}
          header='Please confirm'
          cancelButton='Not really'
          confirmButton="Yes!"
          dimmer={"inverted"}
          onCancel={this.handleCancel}
          onConfirm={this.handleConfirm}
        />
    )
  }
}
