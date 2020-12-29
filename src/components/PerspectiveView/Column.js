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
  const subFields =

    fields.filter(
      f => isEqual(f.self_id, field.column_id));

  const sort_flag =

    field &&
    sortByField &&
    id2str(field.id) == id2str(sortByField.field);

  const sort_f = (
    
    () => 
      !sort_flag
        ? onSortModeChange(field.id, 'a') :
      sortByField.order == 'a'
        ? onSortModeChange(field.id, 'd')
        : onSortModeReset())

  return (

    <Table.HeaderCell
      className="entityHeader"
      onClick={() => onSortModeChange && sort_f()}>

      <ul>
        <li className="last">
          {onSortModeChange
            ?
            <label onClick={e => (e.stopPropagation(), sort_f())}>
              {field.translation}
            </label>
            :
            <label>
              {field.translation}
            </label>
          }
          {onSortModeChange && (
            sort_flag
              ? 
              <span>
                {' '}
                {sortByField.order == 'a' ?
                  <Icon fitted size="large" name="angle up" onClick={
                    e => (e.stopPropagation(), onSortModeReset())} /> :
                  <Icon fitted size="large" name="caret up" onClick={
                    e => (e.stopPropagation(), onSortModeChange(field.id, 'a'))} />}
                {' '}
                {sortByField.order == 'd' ?
                  <Icon fitted size="large" name="angle down" onClick={
                    e => (e.stopPropagation(), onSortModeReset())} /> :
                  <Icon fitted size="large" name="caret down" onClick={
                    e => (e.stopPropagation(), onSortModeChange(field.id, 'd'))} />}
              </span>
              :
              <span>
                {' '}
                <Icon fitted size="large" name="caret up" onClick={
                  e => (e.stopPropagation(), onSortModeChange(field.id, 'a'))} />
                {' '}
                <Icon fitted size="large" name="caret down" onClick={
                  e => (e.stopPropagation(), onSortModeChange(field.id, 'd'))} />
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
