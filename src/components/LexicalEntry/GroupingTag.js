import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Button } from 'semantic-ui-react';
import { openModal } from 'ducks/groupingTag';

const GroupingTag = (props) => {
  const {
    entry, column, mode, entitiesMode, as: Component = 'div', actions,
  } = props;

  return (
    <Component className="gentium">
      <Button
        basic
        as="button"
        content="Grouping Tag"
        icon="code"
        labelPosition="left"
        onClick={() => actions.openModal(entry, column.id, mode, entitiesMode)}
      />
    </Component>
  );
};

GroupingTag.propTypes = {
  entry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  as: PropTypes.string,
  actions: PropTypes.shape({
    openModal: PropTypes.func.isRequired,
  }).isRequired,
};

GroupingTag.defaultProps = {
  as: 'div',
};

export default compose(connect(
  null,
  dispatch => ({
    actions: bindActionCreators({ openModal }, dispatch),
  })
))(GroupingTag);
