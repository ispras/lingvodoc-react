import React from 'react';
import { pure } from 'recompose';
import styled from 'styled-components';

const Range = styled.div`
  display: flex;
  padding: 5px 0;

  span {
    padding: 0 5px;
  }
`;

const IntersectionControl = ({ value, max, onChange }) =>
  <Range>
    <span>0</span>
    <input
      type="range"
      min={0}
      max={max}
      step={1}
      value={value}
      onChange={onChange}
    />
    <span>{max}</span>
    <span>Более {value} пересечений</span>
  </Range>;

export default pure(IntersectionControl);
