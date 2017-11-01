import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'semantic-ui-react';
import { find, isEqual } from 'lodash';

import Entities from './index';

function single(mode) {
  switch (mode) {
    default:
      return null;
  }
}

function all(mode) {
  switch (mode) {
    default:
      return null;
  }
}

const Markup = (props) => {
  const { column, columns, entity, entities, mode, as: Component = 'li', className = '' } = props;
  const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));
  const content = entity.content;

  return (
    <Component className={className}>
      <Button.Group basic icon size="mini">
        <Button as="a" href={content} icon="download" />
        <Button content={content.substr(content.lastIndexOf('/') + 1)} />
      </Button.Group>
      {subColumn && <Entities column={subColumn} columns={columns} entities={entities} mode={mode} />}
    </Component>
  );
};

Markup.propTypes = {
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  entity: PropTypes.object.isRequired,
  entities: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
};

export default Markup;

// import React from 'react';
// import { List, Button, Dropdown } from 'semantic-ui-react';

// import LexicalEntry from './index';

// function single(mode) {
//   switch (mode) {
//     default:
//       return null;
//   }
// }

// function all(mode) {
//   switch (mode) {
//     default:
//       return null;
//   }
// }

// const Singlemarkup = ({ content, contains, mode }) =>
//   <Button.Group basic icon size="mini">
//     <Button as="a" href={content} content={content.substr(content.lastIndexOf('/') + 1)} icon="download" labelPosition="left" />
//     {
//       contains && contains.length > 0 &&
//         <Dropdown button className="icon" >
//           <Dropdown.Menu>
//             {
//               contains.map(ssub =>
//                 <LexicalEntry
//                   key={`${ssub.id[0]}/${ssub.id[1]}`}
//                   as={Dropdown.Item}
//                   mode={mode}
//                   entry={ssub}
//                 />
//               )
//             }
//           </Dropdown.Menu>
//         </Dropdown>
//     }
//   </Button.Group>;

// const Markup = (props) => {
//   const {
//     entry,
//     mode,
//     as: Component = 'div',
//   } = props;

//   return (
//     <Component>
//       <List>
//         {
//           entry.map(sub =>
//             <List.Item key={`${sub.id[0]}/${sub.id[1]}`}>
//               <Singlemarkup {...sub} mode={mode} />
//               { single(mode) }
//             </List.Item>)
//         }
//         { all(mode) }
//       </List>
//     </Component>
//   );
// };

// export default Markup;
