import React, { Component } from 'react'

import { Link } from "react-router-dom";

import {
  Icon,
  Menu,
  Sidebar,
} from 'semantic-ui-react'


const LinkComponent = (props) => {
  let routePath = window.location.pathname.split("/")[1];

  if (routePath === "") {
    routePath = "trading";
  }

  return (
    <Link to={props.route.link} key={routePath}>
      <Menu.Item as={'div'} style={{ minHeight: "40px", display: 'flex' }} active={props.route.name.toLowerCase() === routePath} >
        <Icon name={props.route.icon} style={{ marginRight: (props.withLabel ? "5px" : "0px") }} /> {props.withLabel ? props.route.name : ""}
      </Menu.Item>
    </Link>
  );
}

export default class SidebarWrap extends Component {
  state = {
    menuExpanded: false,
    activeItem: "Trading"
  }

  createLink(withLabel, route) {
    if (!route.withLink)
      return <></>;

    return (
      <LinkComponent key={route.path} route={route} withLabel={withLabel} />
    );
  }

  createLinks = (withLabel) => {
    let linkList = []
    for (let i = 0; i < this.props.routes.length; i++)
      linkList.push(this.createLink(withLabel, this.props.routes[i]));

    return linkList;
  }

  getMiniSidebar() {
    return (
      <Sidebar
        as={Menu}
        animation={"push"}
        direction={"left"}
        inverted
        vertical
        visible={!this.state.menuExpanded}
        width='very thin'
        onMouseEnter={() => {
            this.setState({menuExpanded: true});
        }}
        onMouseDown={() => {
            this.setState({menuExpanded: true});
        }}
      >
        {this.createLinks(false)}
      </Sidebar>
    );
  }

  getSidebar() {
    return (
      <Sidebar
      as={Menu}
      animation={'push'}
      direction={'left'}
      inverted
      vertical
      onMouseLeave={() => {
        this.setState({menuExpanded: false});
      }}
      onMouseDown={() => {
          this.setState({menuExpanded: false});
      }}
      visible={this.state.menuExpanded}
      width='thin'
    >
      {this.createLinks(true)}
    </Sidebar>
    );
  }

  render() {
    return (
      <>
      {this.getSidebar()}
      {this.getMiniSidebar()}
    </>
    )
  }
}
