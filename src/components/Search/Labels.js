import React from 'react';
import { pure } from 'recompose';
import { Label, Icon } from 'semantic-ui-react';

const Labels = ({ data, onClick }) =>
  data.map(({ text, color, isActive }) =>
    <Label
      key={text}
      as="a"
      style={{
        backgroundColor: isActive ? color : 'grey',
        color: '#fff',
      }}
      onClick={() => onClick(text)}
    >
      {text}
      <Icon name="delete" />
    </Label>
  );

export default pure(Labels);
