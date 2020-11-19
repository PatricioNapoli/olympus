import React from 'react'
import { connect } from "react-redux";

import SmartView, { mapDispatchToProps } from "./SmartView";

import DataTable from '../components/DataTable';
import { Icon, Card, Label, Grid } from 'semantic-ui-react'
import { withToastManager } from 'react-toast-notifications';

import Moment from 'react-moment';

const columns = [
  {
    columns: [
      {
        Header: <span><Icon name="clock"/>Time</span>,
        accessor: "time",
        Cell: row => 
          <Label style={{minWidth:50}} as='a' color='teal' image>
            <Moment unix format="DD/MM/YYYY HH:mm:ss">{row.value / 1000}</Moment>
          </Label>
      },
      {
        Header: <span><Icon name="signal"/>Amount</span>,
        accessor: 'amount',
        Cell: row => 
          <Label style={{minWidth:50}} color={"blue"}>
            <Icon name="bitcoin"/>
            {row.value.toFixed(10)}
          </Label>
      },
      {
        Header: <span><Icon name="chart bar"/>Signal</span>,
        accessor: "signal",
        Cell: row => {
          let color = "green";
          if (row.value === "SELL") {
            color = "red";
          }
          return (
            <Label style={{minWidth:50}} color={color}>
            {row.value}
          </Label>
          );
        }
      }
    ]
  }
]

export class History extends SmartView {
  fetch() {
    this.props.getData({
       url: "/api/user/trades",
       respKey: "history",
     }, "history");
  }

  renderContent() {
    if (!this.props.state.data.history) {
      return <></>
    }

    return (
        <Grid>

        <Grid.Row centered>
        <Card style={{padding: 40, minWidth: 800}}>
          <h3>Past Trades</h3>
          <DataTable
                rowIdentifier={"id"}
                windowWidth={this.props.siteState.windowWidth}
                edit={false}
                data={this.props.state ? this.props.state.data.history || [] : []}
                columns={columns} />
          </Card>
        </Grid.Row>
        </Grid>
    )
  }
}

function mapStateToProps(state) {
  return {
    state: state.base.history,
    siteState: state.base.site
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withToastManager(History));
