import React from 'react';
import { shouldUpdate } from 'recompose';

const emptyStyle = { background: '#eee' };

const Empty = ({ as: Component = 'div' }) => <Component style={emptyStyle} />;

export default shouldUpdate(() => false)(Empty);
