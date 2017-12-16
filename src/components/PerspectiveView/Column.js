import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForPropTypes } from 'recompose';
import { Table } from 'semantic-ui-react';
import { isEqual } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';
import 'styles/main.scss';

const Column = ({ field, fields }) => {
  const subFields = fields.filter(f => isEqual(f.self_id, field.column_id));
  return (
    <Table.HeaderCell className="entityHeader">
      <ul>
        <li className="last">
          {field.translation}
          <ul>
            {subFields.map((subField, index) => {
              const cls =
                index + 1 === subFields.length ? { className: 'last' } : {};

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

Column['propTypes'] = {
  field: PropTypes.shape({
    translation: PropTypes.string.isRequired,
  }).isRequired,
  fields: PropTypes.array.isRequired,
};

export default onlyUpdateForPropTypes(Column);
