import React, { Component, createRef } from 'react';
import {
  Container,
  Grid,
  Progress,
  Ref,
  Segment,
  Sidebar,
  Sticky,
} from 'semantic-ui-react';

import { ToastProvider } from 'react-toast-notifications'

import { withRouter } from 'react-router-dom';
import { connect } from "react-redux";

import { routes, homeRoute } from './routes';
import Navigation from './components/Navigation';
import { getData, setWindowSize } from "./actions/index";

import "./App.css"

export class App extends Component {
  // Needed for sticky progress bar
  contextRef = createRef()

  constructor(props) {
    super(props);

    this.updateWindowSize = this.updateWindowSize.bind(this);
  }

  componentDidMount() {
    this.updateWindowSize();
    window.addEventListener("resize", this.updateWindowSize);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowSize);
  }

  updateWindowSize() {
    this.props.setWindowSize(window.innerWidth, window.innerHeight, 'site')
  }

  getProgressBar() {
    let visibility = 'visible';
    if (this.props.state.loadingProgress === 100)
      visibility = 'hidden';

    return (<Progress total={this.props.state.loadingTotal} color='pink' value={this.props.state.loadingProgress} indicating size={'tiny'} style={{ visibility: visibility, margin: 0, padding: 0, marginRight: "10px" }} />);
  }

  getOffsetColumn() {
    if (this.props.state.windowWidth >= 768)
      return (
        <Grid.Column width={2}></Grid.Column>
      );
  }

  render() {
    return (
      <Ref innerRef={this.contextRef}>
        <ToastProvider autoDismissTimeout={4000} placement="bottom-right">
          <Container style={{ marginTop: 0, width: '98%' }}>
            <Sticky context={this.contextRef}>
              {this.getProgressBar()}
            </Sticky>

            {/* Top bar */}
            {/* <Segment basic padded={false} size={"mini"} style={{ marginTop: 0, paddingTop: '5px' }}>
                <Button size={"medium"} icon='th list' color={"pink"} onClick={this.toggleSidebar}></Button>

                <h2 style={{display:"inline", marginLeft: 15, color: "#EC386B"}}>Dynamic Tuning</h2>
                <Image inline size='small' src="/img/logo.png" style={{ marginLeft: '25px' }} />
            </Segment> */}

            {/* Sidebar and content */}
            <Sidebar.Pushable as={Segment} style={{ minHeight: '350px' }}>
              <Navigation windowWidth={this.props.state.windowWidth} routes={routes} homeRoute={homeRoute} />
            </Sidebar.Pushable>

            {/* Footer */}
            <Grid centered>
              <Grid.Row columns={16}>

                {/* Column to match layout of main segment */}
                {this.getOffsetColumn()}

                <Grid.Column style={{marginLeft:35}} width={15}>
                  <Grid>
                    <Grid.Row centered style={{ paddingTop: "5px", paddingBottom: "5px" }}>
                      <small>
                        <span style={{ color: "#EC386B", fontWeight: 'bold' }}>Olympus 2020 </span>

                        <div>
                          {/* <Button basic circular color="black" icon='lightbulb' onClick={() => this.setState({theme: this.state.theme === "dark" ? "light" : "dark"})} /> */}
                        </div>
                      </small>
                    </Grid.Row>
                  </Grid>
                </Grid.Column>
              </Grid.Row>
            </Grid>

          </Container>
        </ToastProvider>
      </Ref>
    )
  }
}

function mapStateToProps(state) {
  return {
    state: state.base.site
  };
}

const mapDispatchToProps = (dispatch) => {
  return {
    getData: (calls, section) => dispatch(getData(calls, section)),
    setWindowSize: (width, height, section) => dispatch(setWindowSize(width, height, section))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));
