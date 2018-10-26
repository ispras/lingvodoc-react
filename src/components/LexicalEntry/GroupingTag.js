import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, branch, renderNothing } from 'recompose';
import { isEmpty, isEqual } from 'lodash';
import { Button } from 'semantic-ui-react';
import { openModal } from 'ducks/modals';
import GroupingTagModal from 'components/GroupingTagModal';

const GroupingTag = (props) => {
  const {
    entry, column, mode, entitiesMode, as: Component = 'div', openModal,
  } = props;

  return (
    <Component className="gentium">
      <Button
        basic
        as="button"
        content={column.translation}
        icon="code"
        labelPosition="left"
        onClick={() => openModal(GroupingTagModal, { lexicalEntry: entry, fieldId: column.id, mode, entitiesMode })}
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
  openModal: PropTypes.func.isRequired
};

GroupingTag.defaultProps = {
  as: 'div',
};

export default compose(
  branch(
    ({ entry, column, mode }) =>
      isEmpty(entry.entities.filter(entity => isEqual(entity.field_id, column.id))) && mode !== 'edit',
    renderNothing
  ),
  connect(null, dispatch => bindActionCreators({ openModal }, dispatch))
)(GroupingTag);
