import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys } from 'recompose';
import { Table, Icon } from 'semantic-ui-react';
import { isEqual } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';
import 'styles/main.scss';

const Column = ({ field, fields, onSortModeChange }) => {
  const subFields = fields.filter(f => isEqual(f.self_id, field.column_id));
  return (
    <Table.HeaderCell className="entityHeader">
      <ul>
        <li className="last">
          {field.translation}{' '}
          {onSortModeChange && (
            <span>
              <Icon fitted size="large" name="caret up" onClick={() => onSortModeChange(field.id, 'a')} />
              <Icon fitted size="large" name="caret down" onClick={() => onSortModeChange(field.id, 'd')} />
            </span>
          )}
          <ul>
            {subFields.map((subField, index) => {
              const cls = index + 1 === subFields.length ? { className: 'last' } : {};

              return (
                <li key={compositeIdToString(subField.column_id)} {...cls}>
                  {subField.translation}
                </li>
              );
            })}
          </ul>
        </li>
      </ul>
    </Table.HeaderCell>
  );
};

Column.propTypes = {
  field: PropTypes.shape({
    translation: PropTypes.string.isRequired,
  }).isRequired,
  fields: PropTypes.array.isRequired,
  onSortModeChange: PropTypes.func,
};

Column.defaultProps = {
  onSortModeChange: null,
};

export default onlyUpdateForKeys(['field'])(Column);
