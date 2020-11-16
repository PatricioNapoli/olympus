import React, { Component } from 'react'

import { Switch, Route, Link } from "react-router-dom";

import {
  Grid,
  Icon,
  Menu,
  Sidebar,
  Segment,
} from 'semantic-ui-react'

import Shield from './Shield.js'
import SidebarWrap from './SidebarWrap'

export default class Navigation extends Component {
  static defaultProps = {
    routes: [],
    homeRoute: {}
  }

  createRoute(route) {
    if (route.path !== route.link) {
      return (
        <div key={route.path}>
          <Route path={route.path} component={route.component} />
          <Route exact path={route.link} component={route.component} />
        </div>
      );
    }

    return (
      <Route key={route.path} exact path={route.path} component={route.component} />
    );
  }

  createRoutes = () => {
    let routesList = []
    for (let i = 0; i < this.props.routes.length; i++)
      routesList.push(this.createRoute(this.props.routes[i]));

    routesList.push(this.createRoute(this.props.homeRoute));

    return routesList;
  }

  getWidth() {
    if (this.props.windowWidth >= 768)
      return 15;

    return 16;
  }

  render() {
    return (
      <>
        <SidebarWrap routes={this.props.routes}/>

        <Sidebar.Pusher>

          <Segment basic>
            <Grid>
              <Grid.Row>
                <Grid.Column width={this.getWidth()}>
                  <Switch>
                    <Shield section={""}>
                      {this.createRoutes()}
                    </Shield>
                  </Switch>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Segment>

        </Sidebar.Pusher>
      </>
    )
  }
} 
