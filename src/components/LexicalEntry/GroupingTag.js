import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, branch, renderNothing } from 'recompose';
import { isEmpty, isEqual } from 'lodash';
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
        content={column.translation}
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

export default compose(
  branch(({entry, column, mode}) => isEmpty(entry.contains.filter(entity => isEqual(entity.field_id, column.id))) && mode !== 'edit', renderNothing),
  connect(
  null,
  dispatch => ({
    actions: bindActionCreators({ openModal }, dispatch),
  })
))(GroupingTag);
