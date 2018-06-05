import React from 'react';
import { pure } from 'recompose';
import { Dimmer, Header, Icon } from 'semantic-ui-react';

const dimmerStyle = { minHeight: '600px' };

export default pure(() => (
  <Dimmer.Dimmable dimmed style={dimmerStyle}>
    <Dimmer active inverted>
      <Header as="h2" icon>
        <Icon name="spinner" loading />
      </Header>
    </Dimmer>
  </Dimmer.Dimmable>
));
