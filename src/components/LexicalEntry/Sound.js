import React from 'react';
import { List, Button, Dropdown, Icon } from 'semantic-ui-react';

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

const SingleSound = ({ content, contains, mode }) =>
  <Button.Group basic icon size="mini">
    <Button as="a" href={content} content={content.substr(content.lastIndexOf('/') + 1)} icon="download" labelPosition="left" />
    <Button icon="play" />
    {
      contains && contains.length > 0 &&
        <Dropdown button className="icon" >
          <Dropdown.Menu>
            {
              contains.map(ssub =>
                <LexicalEntry
                  key={`${ssub.client_id}/${ssub.object_id}`}
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

const Sound = (props) => {
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
            <List.Item key={`${sub.client_id}/${sub.object_id}`}>
              <SingleSound {...sub} mode={mode} />
              { single(mode) }
            </List.Item>)
        }
        { all(mode) }
      </List>
    </Component>
  );
};

export default Sound;
