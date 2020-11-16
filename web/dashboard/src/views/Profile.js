import React from 'react'
import { connect } from "react-redux";

import SmartView, { mapDispatchToProps } from "./SmartView";

import DataTable from '../components/DataTable';
import { Button, Icon, Card, Label, Form, Input, Grid } from 'semantic-ui-react'
import { withToastManager } from 'react-toast-notifications';

const columns = [
  {
    columns: [
      {
        Header: <span><Icon name="tag"/>Type</span>,
        accessor: "id",
        Cell: row => 
          <Label style={{minWidth:50}} as='a' color='teal' image>
            <Icon name="database"/>
            Spot Trading
          </Label>
      },
      {
        Header: <span><Icon name="signal"/>Portfolio %</span>,
        accessor: 'portfolio_ratio',
        Cell: row => 
          <Label style={{minWidth:50}} color={"blue"}>
            {row.value * 100}%
          </Label>
      },
      {
        Header: <span><Icon name="minus"/>Bias</span>,
        accessor: "bias",
        Cell: row => 
          <Label style={{minWidth:50}} color={"blue"}>
            {row.value}
          </Label>
      },
      {
        Header: <span><Icon name="plus"/>Active</span>,
        accessor: "active",
        Cell: row => 
          <Label style={{minWidth:50}} color={"blue"}>
            {row.value ? "Yes" : "No"}
          </Label>
      }
    ]
  }
]

export class Profile extends SmartView {
  fetch() {
    this.props.getData({
       url: "/api/user",
       respKey: "user",
       next: {
        url: "/api/bot/all",
        respKey: "bots",
       }
     }, "profile");
  }

  state = {
    email: undefined,
    binanceKey: undefined,
    binanceSecret: undefined
  }

  renderContent() {
    if (!this.props.state.data.user) {
      return <></>
    }

    return (
        <Grid>

        <Grid.Row centered>
        <Card style={{padding: 40, minWidth: 600}}>
          <Form style={{marginBottom: 20}}>
          <Form.Field>
              <label>Email</label>
              <Input icon='mail' onChange={(e, d) => {this.setState({email: d.value})}} value={this.state.email || this.props.state.data.user.email} />
            </Form.Field>

            <Form.Field>
              <label>Binance Key</label>
              <Input icon='key' onChange={(e, d) => {this.setState({binanceKey: d.value})}} value={this.state.binanceKey || this.props.state.data.user.binance_key} />
            </Form.Field>

            <Form.Field>
            <label>Binance Secret</label>
            <Input icon='lock' type="password" onChange={(e, d) => {this.setState({binanceSecret: d.value})}} value={this.state.binanceSecret || this.props.state.data.user.binance_secret} />
            </Form.Field>

            <Button
                color="pink"
                size="large"
                labelPosition="left"
                icon
                onClick={() => {
                  this.props.postData({
                    url: "/api/user/update",
                    data: {id: 1, 
                      email: this.state.email || this.props.state.data.user.email, 
                      binance_key: this.state.binanceKey || this.props.state.data.user.binance_key, 
                      binance_secret: this.state.binanceSecret || this.props.state.data.user.binance_secret}
                  }, "home", () => {
                    super.toastSuccess("Profile updated!")
                  }, () => {
                    console.log("Failed")
                  })
                }}
              ><Icon name="sync"/>Update</Button>
          </Form>

          <h3>Trading Bots</h3>
          <DataTable
                rowIdentifier={"id"}
                windowWidth={this.props.siteState.windowWidth}
                edit={true}
                data={this.props.state ? this.props.state.data.bots || [] : []}
                columns={columns} />
          </Card>
        </Grid.Row>
        </Grid>
    )
  }
}

function mapStateToProps(state) {
  return {
    state: state.base.profile,
    siteState: state.base.site
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withToastManager(Profile));
