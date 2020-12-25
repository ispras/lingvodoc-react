import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys } from 'recompose';
import { Table, Icon } from 'semantic-ui-react';
import { isEqual } from 'lodash';
import { compositeIdToString as id2str } from 'utils/compositeId';
import 'styles/main.scss';

const Column = ({
  field,
  fields,
  sortByField,
  onSortModeChange,
  onSortModeReset}) =>
{
  const subFields = fields.filter(f => isEqual(f.self_id, field.column_id));
  return (
    <Table.HeaderCell className="entityHeader">
      <ul>
        <li className="last">
          {field.translation}{' '}
          {onSortModeChange && (
            sortByField && id2str(field.id) == id2str(sortByField.field)
              ? 
              <span>
                {sortByField.order == 'a' ?
                  <Icon fitted size="large" name="angle up" onClick={() => onSortModeReset()} /> :
                  <Icon fitted size="large" name="caret up" onClick={() => onSortModeChange(field.id, 'a')} />}
                {' '}
                {sortByField.order == 'd' ?
                  <Icon fitted size="large" name="angle down" onClick={() => onSortModeReset()} /> :
                  <Icon fitted size="large" name="caret down" onClick={() => onSortModeChange(field.id, 'd')} />}
              </span>
              :
              <span>
                <Icon fitted size="large" name="caret up" onClick={() => onSortModeChange(field.id, 'a')} />
                {' '}
                <Icon fitted size="large" name="caret down" onClick={() => onSortModeChange(field.id, 'd')} />
              </span>
          )}
          <ul>
            {subFields.map((subField, index) => {
              const cls = index + 1 === subFields.length ? { className: 'last' } : {};

              return (
                <li key={id2str(subField.column_id)} {...cls}>
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
