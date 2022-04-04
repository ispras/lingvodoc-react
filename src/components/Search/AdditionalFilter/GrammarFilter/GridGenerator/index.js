import React, { PureComponent } from "react";
import PropTypes from "prop-types";

class GridGenerator extends PureComponent {
  static propTypes = {
    data: PropTypes.array.isRequired,
    GridComponent: PropTypes.func.isRequired,
    RowComponent: PropTypes.func.isRequired,
    ColumnComponent: PropTypes.func.isRequired
  };

  constructor(props) {
    super();

    this.Grid = props.GridComponent;
    this.Row = props.RowComponent;
    this.Column = props.ColumnComponent;
  }

  getNumberOfColumns() {
    let resultNumberOfColumns = 0;
    const { data } = this.props;

    data.forEach(row => {
      row.columns.forEach(column => {
        const columnNumberOfBlocksToRender = column.blocksToRender.length;
        if (columnNumberOfBlocksToRender > resultNumberOfColumns) {
          resultNumberOfColumns = columnNumberOfBlocksToRender;
        }
      });
    });

    return resultNumberOfColumns;
  }

  renderRow(row) {
    const { Row } = this;
    const { columns, id } = row;
    const columnGroup = this.renderColumnGroup(columns);

    if (columnGroup.length === 0) {
      return null;
    }

    return (
      <Row key={id} stretched>
        {columnGroup}
      </Row>
    );
  }

  renderRowGroup() {
    const { data } = this.props;
    return data.map(row => this.renderRow(row));
  }

  renderColumnGroup(columns) {
    return columns.map(columnItem => this.renderColumn(columnItem));
  }

  renderColumn(column) {
    const { blocksToRender, id } = column;
    const { Column } = this;

    if (!blocksToRender || blocksToRender.length === 0) {
      return null;
    }

    return <Column key={id}>{blocksToRender}</Column>;
  }

  render() {
    const { Grid } = this;
    const numberOfColumns = this.getNumberOfColumns();
    return <Grid columns={numberOfColumns}>{this.renderRowGroup()}</Grid>;
  }
}

export default GridGenerator;
