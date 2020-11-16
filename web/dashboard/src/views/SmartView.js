import React, { Component } from 'react';

import Refresher from "../components/Refresher";
import Spinner from "../components/Spinner";
import NetworkError from "../components/NetworkError";
import RouteHeader from '../components/RouteHeader';
import Confirmation from '../components/Confirmation';

import { capitalizeFirstLetter } from '../components/Utils'

import {
  Breadcrumb,
  Grid,
  Transition,
} from 'semantic-ui-react';

import { Link } from 'react-router-dom';

import { getData, postData, putData } from "../actions/index";

class SmartView extends Component {
  state = {}
  showDuration = 150

  fetch() {
    // To be overridden, do not delete.
  }

  cleanState(state, discardArray) {
    let copyState = {};
    Object.assign(copyState, state);

    for (let i = 0; i < discardArray.length; i++) {
      delete copyState[discardArray[i]];
    }

    delete copyState.visible;
    delete copyState.confirmVisible;

    return copyState;
  }

  getSection(location, locations) {
    let locationLink = "";

    for (let i = 0; i < locations.length; i++) {
      locationLink += `/${locations[i]}`;

      if (location === locations[i])
        break;
    }

    function isLast() {
      return location === locations[locations.length - 1];
    }

    function link() {
      if (!isLast())
        return (<Link key={location + '-a'} to={locationLink}>{capitalizeFirstLetter(location)}</Link>);

      return capitalizeFirstLetter(location);
    }

    function divider() {
      if (!isLast())
        return (<Breadcrumb.Divider key={location + '-div'} icon='right chevron' />);
    }

    return (
      <span key={location + '-d'}>
        <Breadcrumb.Section key={location + '-s'}>
          {link()}
        </Breadcrumb.Section>
        {divider()}
      </span>
    );
  }

  getRefresher() {
    return <Refresher refreshFunction={this.fetch.bind(this)} refreshDate={this.props.state.lastUpdated} />;
  }

  componentDidMount() {
    this.fetch();

    // Transition animation
    setTimeout(() => {
      this.setState(prevState => ({
        visible: !prevState.visible || true
      }));
    }, 100);
  }

  toastSuccess(content) {
    this.props.toastManager.add(content, { appearance: 'success', autoDismiss: "true" })
  }

  toastInfo(content) {
    this.props.toastManager.add(content, { appearance: 'info', autoDismiss: true, pausonhover: "false" })
  }

  toastWarning(content) {
    this.props.toastManager.add(content, { appearance: 'warning', autoDismiss: true, pausonhover: "false" })
  }

  toastError(content) {
    this.props.toastManager.add(content, { appearance: 'error', autoDismiss: true, pausonhover: "false" })
  }

  confirmModal(onConfirm) {
    this.setState({ onModalConfirm: onConfirm }, () => {
      this.setState({ confirmVisible: true });
    });
  }

  render() {
    if (this.props.state.hasErrored) {
      return (
        <Grid>
          <Grid.Row centered>
            <NetworkError hasErrored={this.props.state.hasErrored} trackingID={this.props.state.trackingID} />
          </Grid.Row>

          <Grid.Row centered>
            {this.getRefresher()}
          </Grid.Row>
        </Grid>
      );
    }

    let locations = window.location.pathname.split("/");
    let location = locations[1];

    if (this.props.state.isLoading) {
      return (
        <>
          {this.renderHeader(location)}
          <Spinner loading={true} refreshFunction={this.fetch.bind(this)} refreshDate={this.props.state.lastUpdated} />
        </>
      );
    }

    return (
      <Grid style={{paddingTop: 20}}>

        <Grid.Row style={{ padding: 0 }}>
          <Grid.Column>

            {this.renderHeader(location)}

            <Transition duration={{ hide: 0, show: this.showDuration }} visible={this.state.visible || false}>
              {this.renderContent()}
            </Transition>

          </Grid.Column>
        </Grid.Row>

        <Transition duration={{ hide: 0, show: this.showDuration }} visible={this.state.visible || false}>
          <Grid.Row centered>
            {this.getRefresher()}
          </Grid.Row>
        </Transition>

        <Confirmation
          opened={this.state.confirmVisible || false}
          onCancel={() => this.setState({ confirmVisible: false })}
          onConfirm={() => {
            this.state.onModalConfirm();
            this.setState({ confirmVisible: false });
          }}
        />
      </Grid>
    )
  }

  renderHeader(location) {
    return <RouteHeader route={capitalizeFirstLetter(location) || ""} />;
  }

  renderContent() {
    throw new Error('Unimplemented renderContent() in SmartView!');
  }
}

export const mapDispatchToProps = (dispatch) => {
  return {
    getData: (calls, section) => dispatch(getData(calls, section)),
    postData: (call, section, successCallback, failCallback) => dispatch(postData(call, section, successCallback, failCallback)),
    putData: (call, section, successCallback, failCallback) => dispatch(putData(call, section, successCallback, failCallback))
  };
};

export default SmartView;
