import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { isEqual } from 'lodash';
import { Button } from 'semantic-ui-react';
import { openModal } from 'ducks/link';


const DirectedLink = (props) => {
  const {
    entry, column, mode, entitiesMode, as: Component = 'div', actions,
  } = props;

  const count = entry.contains.filter(e => isEqual(e.field_id, column.id)).length;
  const content = `${column.translation} (${count})`;

  return (
    <Component className="gentium">
      <Button
        basic
        as="button"
        content={content}
        icon="code"
        labelPosition="left"
        onClick={() => actions.openModal(entry.parent_id, entry, column.id, mode, entitiesMode)}
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
  actions: PropTypes.shape({
    openModal: PropTypes.func.isRequired,
  }).isRequired,
};

DirectedLink.defaultProps = {
  as: 'div',
};

export default compose(connect(
  null,
  dispatch => ({ actions: bindActionCreators({ openModal }, dispatch) }),
))(DirectedLink);
