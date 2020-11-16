import React, { Component } from 'react'

import { Icon, Divider, Header, Grid } from 'semantic-ui-react'
import { getRoute } from '../routes';

export default class RouteHeader extends Component {
  static defaultProps = {
    iconColor: "pink"
  }

  render() {
    const route = getRoute(this.props.route);

    return (
      <Grid.Row centered>
        <Grid.Column style={{ textAlign: 'center' }}>
          <Icon name={route.icon} color={this.props.iconColor} />
          <Divider horizontal>
            <Header as='h2' color={'pink'}>
              {route.name}
            </Header>
          </Divider>
        </Grid.Column>
      </Grid.Row>
    )
  }
}
