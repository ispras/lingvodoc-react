import React from 'react';
import { pure } from 'recompose';
import { Label } from 'semantic-ui-react';

const Labels = ({ data, onClick }) =>
  data.map(label =>
    <Label
      key={label.text}
      as="a"
      style={{
        backgroundColor: label.isActive ? label.color : 'grey',
        color: '#fff',
      }}
      onClick={() => onClick(label.id)}
    >
      {label.text}
    </Label>
  );

export default pure(Labels);
