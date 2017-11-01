import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import { isEmpty, isEqual } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';

import Text from './Text';
import Sound from './Sound';
import Markup from './Markup';
import Link from './Link';
import GroupingTag from './GroupingTag';
import Unknown from './Unknown';
import Empty from './Empty';

function getComponent(dataType) {
  return (
    {
      Text,
      Sound,
      Markup,
      Link,
      'Grouping Tag': GroupingTag,
    }[dataType] || Unknown
  );
}

const Entity = (props) => {
  const { column } = props;

  const Component = getComponent(column.data_type);

  return <Component {...props} />;
};

Entity.propTypes = {
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  entities: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
};


const Entities = (props) => {
  const { entities: allEntities, column, columns, mode } = props;
  const entities = allEntities.filter(entity => isEqual(entity.field_id, column.id));

  if (isEmpty(entities)) {
    return null;
  }

  if (column.data_type === 'Link' || column.data_type === 'Grouping Tag') {   
    const Component = getComponent(column.data_type);
    return <Component {...props} />;
  }

  const Component = getComponent(column.data_type);

  return <ul>
    {entities.map((entity, index) => {
      const cls = index + 1 === entities.length ? { className: 'last' } : {};
      return (
        <Component
          key={compositeIdToString(entity.id)}
          as={'li'}
          column={column}
          columns={columns}
          entity={entity}
          entities={allEntities}
          mode={mode}
          {...cls}
        />
      );
    })}
  </ul>;
};

Entities.propTypes = {
  entities: PropTypes.array.isRequired,
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
};

export default pure(Entities);
