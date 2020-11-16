import React, { Component } from 'react'
import TimeAgo from 'react-time-ago'

class LastUpdated extends Component {
  render() {
    return (
      <small className="text-muted">
        Last updated <TimeAgo date={this.props.date}></TimeAgo>
      </small>
    );
  }
}

export default LastUpdated;
