import React, { Component } from 'react'

import { Container, Segment, Grid, Loader, Placeholder } from 'semantic-ui-react'

class Spinner extends Component {
  getPlaceholders() {
    let ph = [];

    for(let i = 0; i < 9; i++) {
      ph.push(
      <Grid.Column key={`ph-${i}`}>
            <Segment raised>
              <Placeholder>
                <Placeholder.Header image>
                  <Placeholder.Line />
                  <Placeholder.Line />
                </Placeholder.Header>
                <Placeholder.Paragraph>
                  <Placeholder.Line length='medium' />
                  <Placeholder.Line length='short' />
                </Placeholder.Paragraph>
              </Placeholder>
            </Segment>
      </Grid.Column>
      );
    }

    return ph;
  }

  render() {
    return (
      <Container>
        <Grid columns={3} centered>
          {this.getPlaceholders()}

          <Loader active>Loading</Loader>

          <Grid.Row>
          </Grid.Row>

          <Grid.Row>
          </Grid.Row>

          <Grid.Row>
          </Grid.Row>

          <Grid.Row>
          </Grid.Row>

          <Grid.Row>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

export default Spinner;
