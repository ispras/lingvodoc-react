import React from "react";
import { connect } from "react-redux";
import { Button } from "semantic-ui-react";
import { isEmpty, isEqual } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import GroupingTagModal from "components/GroupingTagModal";
import { openModal } from "ducks/modals";

const GroupingTag = props => {
  const { entry, column, mode, entitiesMode, as: Component = "div", openModal, disabled } = props;

  return (
    <Component className="gentium">
      <Button
        disabled={disabled}
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
  as: "div"
};

export default compose(
  branch(
    ({ entry, column, mode }) =>
      isEmpty(entry.entities.filter(entity => isEqual(entity.field_id, column.id))) && mode !== "edit",
    renderNothing
  ),
  connect(null, dispatch => bindActionCreators({ openModal }, dispatch))
)(GroupingTag);
