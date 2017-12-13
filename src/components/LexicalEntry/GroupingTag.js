import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, pure, onlyUpdateForKeys } from 'recompose';
import { Button } from 'semantic-ui-react';
import { openModal } from 'ducks/groupingTag';

const GroupingTag = (props) => {
  const {
    entry, column, entitiesMode, as: Component = 'div', actions,
  } = props;
  return (
    <Component className="gentium">
      <Button
        basic
        as="button"
        content="Grouping Tag"
        icon="code"
        labelPosition="left"
        onClick={() => actions.openModal(entry, column.id, entitiesMode)}
      />
    </Component>
  );
};

GroupingTag.propTypes = {
  entry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
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
  state => state.groupingTag,
  dispatch => ({
    actions: bindActionCreators({ openModal }, dispatch),
  })
))(GroupingTag);
