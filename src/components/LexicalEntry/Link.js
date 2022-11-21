import React from "react";
import { connect } from "react-redux";
import { Button } from "semantic-ui-react";
import { isEmpty, isEqual } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import LinkModal from "components/LinkModal";
import { openModal } from "ducks/modals";

const DirectedLink = props => {
  const { entry, column, mode, entitiesMode, as: Component = "div", openModal, disabled } = props;

  const count = entry.entities.filter(e => isEqual(e.field_id, column.id)).length;
  const content = `${T(column.translations)} (${count})`;

  return (
    <Component className="gentium">
      <Button
        className="lingvo-labeled-button"
        disabled={disabled}
        basic
        as="button"
        content={content}
        icon={<i className="lingvo-icon lingvo-icon_code" />}
        labelPosition="left"
        onClick={() =>
          openModal(LinkModal, {
            perspectiveId: entry.parent_id,
            lexicalEntry: entry,
            fieldId: column.id,
            mode,
            entitiesMode
          })
        }
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
  as: "div"
};

export default compose(
  branch(
    ({ entry, column, mode }) =>
      isEmpty(entry.entities.filter(entity => isEqual(entity.field_id, column.id))) && mode !== "edit",
    renderNothing
  ),
  connect(null, dispatch => bindActionCreators({ openModal }, dispatch))
)(DirectedLink);
