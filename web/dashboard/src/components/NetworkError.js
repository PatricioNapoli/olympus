import React, { Component } from 'react'

import { Icon } from 'semantic-ui-react'

class NetworkError extends Component {
  render() {
    return (
      <div>
        <Icon size={"big"} color={"pink"} name={"exclamation triangle"}></Icon>
        <h2>Server error</h2>
      </div>
    );
  }
}

export default NetworkError;
