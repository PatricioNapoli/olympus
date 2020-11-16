import React, { Component } from 'react'
import {
  Button
} from 'semantic-ui-react'

import LastUpdated from "./LastUpdated";

class Refresher extends Component {
  render() {
    return (
      <div>
        <Button circular icon='refresh' color={"pink"} onClick={this.props.refreshFunction}></Button>
        <br />
        <LastUpdated date={this.props.refreshDate} />
      </div>
    );
  }
}

export default Refresher;
