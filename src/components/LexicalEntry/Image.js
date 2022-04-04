import React from "react";
import { Button, Image as Img, Modal } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import { find, isEqual } from "lodash";
import PropTypes from "prop-types";

import Entities from "./index";

const Image = props => {
  const {
    perspectiveId,
    column,
    columns,
    entity,
    entry,
    mode,
    entitiesMode,
    as: Component = "li",
    className = ""
  } = props;
  const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));
  const { content } = entity;

  return (
    <Component className={className}>
      <Button.Group basic icon size="mini">
        <Button as="a" href={content} icon="download" download />
        <Modal basic trigger={<Button>{getTranslation("View")}</Button>}>
          <Modal.Content>
            <Img src={content} />
          </Modal.Content>
        </Modal>
      </Button.Group>

      {subColumn && (
        <Entities
          perspectiveId={perspectiveId}
          column={subColumn}
          columns={columns}
          entry={entry}
          mode={mode}
          entitiesMode={entitiesMode}
          parentEntity={entity}
        />
      )}
    </Component>
  );
};

Image.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  entity: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  as: PropTypes.string,
  className: PropTypes.string
};

Image.defaultProps = {
  as: "li",
  className: ""
};

Image.Edit = ({ onSave }) => <input type="file" onChange={e => onSave(e.target.files[0])} />;

Image.Edit.propTypes = {
  onSave: PropTypes.func,
  onCancel: PropTypes.func
};

Image.Edit.defaultProps = {
  onSave: () => {},
  onCancel: () => {}
};

export default Image;
