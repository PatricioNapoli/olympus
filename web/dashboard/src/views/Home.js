import React, {Component} from 'react'

import { connect } from "react-redux";

import SmartView, { mapDispatchToProps } from "./SmartView";

import TradingViewWidget, { Themes } from 'react-tradingview-widget';

import { Input, Label, Grid, Card, Icon, Button, Statistic } from 'semantic-ui-react'

import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import { withToastManager } from 'react-toast-notifications';

class BotInput extends Component {
  constructor(props) {
    super(props);
    props.register(this.getData.bind(this));
  }

  getData() {
    return {investment: this.state.investment, bias: this.state.bias}
  }

  state = {
    investment: 1,
    bias: 0
  }

  investmentChanged(d) {
    let newVal = 1;
    let val = d.value || d;

    if (val === "" || val === undefined) {
      newVal = ""
    }
    else if (val <= 1) {
      newVal = 1;
    } else if (val >= 100) {
      newVal = 100;
    } else {
      newVal = val;
    }

    if (typeof newVal === 'object') {
      newVal = ""
    }
    this.setState({investment: newVal})
  }

  biasChanged(d) {
    let newVal = 0;

    if (d.value === "" || d.value === undefined) {
      newVal = ""
    }
    else if (d.value <= -1) {
      newVal = -1;
    } else if (d.value >= 1) {
      newVal = 1;
    } else {
      newVal = d.value;
    }
    this.setState({bias: newVal})
  }

  render() {
    return (
      <>
          <h3>Investment %</h3>
            <Slider step={5} style={{marginBottom: 30}} marks={{25:<><p>25%</p></>, 50:<><p>50%</p></>, 75:<><p>75%</p></>}} onChange={(d) => {this.investmentChanged(d)}} value={this.state.investment} />
            <Input icon='percent' placeholder='Portfolio percentage...' onChange={(e, d) => {this.investmentChanged(d)}} value={this.state.investment} />
          <h3>Bias (-1, 1)</h3>
            <Input icon='certificate' placeholder='Bias number to apply..' onChange={(e, d) => {this.biasChanged(d)}} value={this.state.bias} />
      </>
    );
  }
}

export class Home extends SmartView {
  fetch() {
    this.props.getData({
       url: "/api/model/day/stats",
       respKey: "dayStats",
       next: {
        url: "/api/model/hour/stats",
        respKey: "hourStats",
        next: {
          url: "/api/model/hour/pred",
          respKey: "nextHourPred",
          next: {
            url: "/api/user/portfolio",
            respKey: "portfolio",
          }
        }
       }
     }, "home");
  }

  state = {
    botDataFn: {}
  }

  register(fn) {
    this.setState({botDataFn: fn});
  }

  createSuccess() {
    super.toastSuccess("Success!")
  }

  getBotOperations() {
    if (this.props.state.data.hourStats === undefined) {
      return <></>
    }
    return (
      <Card style={{minWidth: 600, minHeight: 650, textAlign: "left"}}>
          <Card.Content>
            <Icon
                color="pink"
                size="large"
                name='rocket'
                style={{float:"right"}}
              />

            <Card.Header>Deep Learning Trading Bot</Card.Header>
            <Card.Meta>Spot Trading</Card.Meta>
            <Card.Description style={{borderRadius:10}}>
              <Label style={{marginBottom: 5}} color='yellow'>
                  Binance
              </Label>

              <Label style={{marginBottom: 5}} color='blue'>
                  Hourly
              </Label>

              <Statistic.Group widths={3} size={"mini"}>

              <Statistic color="green">
                <Statistic.Value>
                  <Icon name='angle double up' />{(parseFloat(this.props.state.data.hourStats.monthly_roi) * 100).toFixed(0)}%
                </Statistic.Value>
                <Statistic.Label>Backtesting Month RoI</Statistic.Label>
              </Statistic>

              <Statistic color="blue">
                <Statistic.Value>
                  <Icon name='chess board' />{parseFloat(this.props.state.data.hourStats.rmse).toFixed(0)}
                </Statistic.Value>
                <Statistic.Label>Model RMSE</Statistic.Label>
              </Statistic>

              <Statistic color="yellow">
                <Statistic.Value>
                  <Icon name='cubes' />{this.props.state.data.hourStats.train_samples}
                </Statistic.Value>
                <Statistic.Label>Train Samples</Statistic.Label>
              </Statistic>
          </Statistic.Group>

        <Grid>
          <Grid.Row centered>
            <Statistic color="green" size={"small"}>
                    <Statistic.Value>
                      <Icon name='bitcoin' />{(parseFloat(this.props.state.data.nextHourPred.value)).toFixed(0)}
                    </Statistic.Value>
                    <Statistic.Label>Next Prediction</Statistic.Label>
              </Statistic>
          </Grid.Row>
        </Grid>
            </Card.Description>
            <h3>Portfolio</h3>
        <Label style={{marginBottom: 5}} color='yellow'>
            <Icon name="bitcoin"/> BTC
          <Label.Detail>{this.props.state.data.portfolio.btc.free}</Label.Detail>
        </Label>

        <Label style={{marginBottom: 5}} color='green'>
        <Icon name="dollar sign"/> USDT
          <Label.Detail>{this.props.state.data.portfolio.usdt.free}</Label.Detail>
        </Label>

          <BotInput register={this.register.bind(this)}/>
          </Card.Content>
          <Card.Content extra>

          <Grid>
            <Grid.Row centered>
              <Button
                color="pink"
                size="large"
                labelPosition="left"
                icon
                onClick={() => {
                  let data = this.state.botDataFn();

                  this.props.postData({
                    url: "/api/bot/create",
                    data: {user_id: 1, portfolio_ratio: data.investment / 100, bias: parseFloat(data.bias), active: true}
                  }, "home", this.createSuccess.bind(this), () => {
                    console.log("Failed")
                  })
                }}
                style={{float:"right"}}
              ><Icon name="plus"/>Create Bot</Button>
            </Grid.Row>
          </Grid>

          </Card.Content>
      </Card>
    );
  }

  getTradingView() {
    return (
      <TradingViewWidget
        symbol="BINANCE:BTCUSDT"
        theme={Themes.DARK}
        timezone="America/Argentina/Buenos_Aires"
        studies={["MACD@tv-basicstudies", "RSI@tv-basicstudies"]}
        autosize
      />
    )
  }

  renderContent() {
    return (
      <Grid style={{marginBottom: 40}}>
        <Grid.Row columns={2}>
          <Grid.Column width={10} style={{height: 650}}>
            {this.getTradingView()}
          </Grid.Column>
          <Grid.Column width={4}>
          {this.getBotOperations()}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    )
  }
}

function mapStateToProps(state) {
  return {
    state: state.base.home
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(withToastManager(Home));
