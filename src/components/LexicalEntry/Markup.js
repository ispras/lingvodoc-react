import React from 'react';
import { List, Button, Dropdown } from 'semantic-ui-react';

import LexicalEntry from './index';

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

const Singlemarkup = ({ content, contains, mode }) =>
  <Button.Group basic icon size="mini">
    <Button as="a" href={content} content={content.substr(content.lastIndexOf('/') + 1)} icon="download" labelPosition="left" />
    {
      contains && contains.length > 0 &&
        <Dropdown button className="icon" >
          <Dropdown.Menu>
            {
              contains.map(ssub =>
                <LexicalEntry
                  key={`${ssub.id[0]}/${ssub.id[1]}`}
                  as={Dropdown.Item}
                  mode={mode}
                  entry={ssub}
                />
              )
            }
          </Dropdown.Menu>
        </Dropdown>
    }
  </Button.Group>;

const Markup = (props) => {
  const {
    entry,
    mode,
    as: Component = 'div',
  } = props;

  return (
    <Component>
      <List>
        {
          entry.map(sub =>
            <List.Item key={`${sub.id[0]}/${sub.id[1]}`}>
              <Singlemarkup {...sub} mode={mode} />
              { single(mode) }
            </List.Item>)
        }
        { all(mode) }
      </List>
    </Component>
  );
};

export default Markup;
