import React, { Component } from 'react';

class DataTable extends Component {
  componentDidMount() {
    this.updateProps(this.$DataTable, this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.updateProps(this.$DataTable, nextProps);
  }

  updateProps(el, props) {
    el.tableData = props.tableData;
  }

  render() {
    return (
      <px-data-table ref={n => {this.$DataTable = n}} ></px-data-table>
    );
  }
}

export default DataTable;