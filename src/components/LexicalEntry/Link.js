import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, branch, renderNothing } from 'recompose';
import { isEqual, isEmpty } from 'lodash';
import { Button } from 'semantic-ui-react';
import { openModal } from 'ducks/modals';
import LinkModal from 'components/LinkModal';

const DirectedLink = (props) => {
  const {
    entry, column, mode, entitiesMode, as: Component = 'div', openModal, disabled,
  } = props;

  const count = entry.entities.filter(e => isEqual(e.field_id, column.id)).length;
  const content = `${column.translation} (${count})`;

  return (
    <Component className="gentium">
      <Button
        disabled={disabled}
        basic
        as="button"
        content={content}
        icon="code"
        labelPosition="left"
        onClick={() => openModal(LinkModal, { perspectiveId: entry.parent_id, lexicalEntry: entry, fieldId: column.id, mode, entitiesMode })}
      />
    </Component>
  );
};

DirectedLink.propTypes = {
  entry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  as: PropTypes.string,
  openModal: PropTypes.func.isRequired
};

DirectedLink.defaultProps = {
  as: 'div',
};

export default compose(
  branch(
    ({ entry, column, mode }) =>
      isEmpty(entry.entities.filter(entity => isEqual(entity.field_id, column.id))) && mode !== 'edit',
    renderNothing
  ),
  connect(null, dispatch => bindActionCreators({ openModal }, dispatch))
)(DirectedLink);
