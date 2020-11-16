import React, { Component } from 'react'

import { Icon, Grid } from 'semantic-ui-react'

import { connect } from 'react-redux'

import { handleClientError } from "../actions/index";

class Shield extends Component {
  state = {
    error: false,
    info: null
  };

  componentDidCatch(error, info) {
    this.setState({
      error: error,
      info: info
    });
  }

  render() {
    if (this.state.error) {

      this.props.handleClientError(this.state.error, this.state.info, this.props.section);

      return (
        <Grid.Row centered>
          <Grid.Column style={{ textAlign: "center" }}>
            <Icon size={"big"} color={"pink"} name={"exclamation triangle"}></Icon>
            <h2>Browser error</h2>
            
          </Grid.Column>
        </Grid.Row>
      );

    }

    return this.props.children;
  }
}

function mapStateToProps(state) {
  return {
    state: state.base.shield
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    handleClientError: (message, stack, section) => dispatch(handleClientError(message, stack, section))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Shield);
