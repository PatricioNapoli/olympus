import React, { Component } from 'react';
import ReactTable from "react-table";

import { Button, Dropdown, Icon, Segment } from 'semantic-ui-react';

export default class DataTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      columns: [],
      page: 0,
      pageSize: 5,
      rowsChecked: [],
      selectedCount: 0
    };

    if (this.props.edit) {
      this.state.columns.push(
        {
          width: 50,
          Header: "",
          Cell: row => (
            <Dropdown
              item
              button
              className={"pink circular"}
              pointing={"top"}
              style={{ fontSize: "10px", color: 'yellow', padding:'12px', borderRadius: '15px' }}
              icon='bolt' >
              <Dropdown.Menu>
                <Dropdown.Header style={{fontSize:"11px"}}>Actions</Dropdown.Header>
                <Dropdown.Item onClick={() => this.onActionSelect('edit', row.row[this.props.rowIdentifier])}>Edit</Dropdown.Item>
                <Dropdown.Item onClick={() => this.onActionSelect('delete', row.row[this.props.rowIdentifier])}>Delete</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ),
          getProps: (state, rowInfo, column) => {
            return {
              style: {
                overflow: 'visible'
              },
            };
          },
          sortable: false,
          filterable: false
        }
      );
    }

    this.state.columns.push(...this.props.columns);
  }

  onActionSelect(action, id) {
    switch (action) {
      case "new":
        this.props.onNew();
        break;
      case "edit":
        this.props.onEdit(id);
        break;
      case "delete":
        this.props.onDelete(id);
        break;
      default:
        break;
    }
  }

  getNew() {
    if (!this.props.edit) {
      return <></>;
    }

    return (   
    <Button style={{ marginRight: "10px", marginBottom: "10px" }} circular color={"green"} icon labelPosition='left' onClick={this.props.onNew}>
      <Icon name='plus' />
      New
    </Button>
    );
  }

  render() {

    return (
      <div style={{textAlign: "center"}}>
        <Segment basic style={{ margin: 0, padding: 0 }}>

        {/* {this.getNew()} */}

        </Segment>

        <ReactTable
          data={this.props.data}
          filterable
          loadingText='Loading...'
          noDataText='No data'
          columns={this.state.columns}
          pageSize={this.state.pageSize}
          page={this.state.page}
          onPageChange={page => this.setState({ page: page })}
          onPageSizeChange={(pageSize, page) => {
            this.setState({ pageSize: pageSize, page: page });
          }}
          previousText={<Icon name='arrow left' color={"pink"}/>}
          nextText={<Icon name='arrow right' color={"pink"}/>}
          className="-highlight text-center"
        >
          {(state, makeTable, instance) => {
            return (
              <>
                {makeTable()}
                {<p>{`Showing ${state.sortedData.length} entries of ${this.props.data.length}`}</p>}
              </>
            );
          }}
        </ReactTable>
      </div >
    );
  }
}
