import React from 'react';
import { pure } from 'recompose';
import { Dimmer, Header, Icon } from 'semantic-ui-react';

export default pure(() => (
  <Dimmer active style={{ minHeight: '600px', background: 'none' }}>
    <Header as="h2" icon>
      <Icon name="spinner" loading className="lingvo-spinner" />
    </Header>
  </Dimmer>
));
